// Drive each interaction story in a real browser and read the Interactions
// panel's verdict, rather than trusting that a play function "looks right".
import { chromium } from '@playwright/test';

// One env var for every guard, so tools/with-storybook.mjs can point the
// whole set at the server it started. Falls back to the port the storybook
// target uses, which is what a developer running it by hand gets.
const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';

const ids = process.argv.slice(2);
const browser = await chromium.launch();
const results = [];

/**
 * Wait for the story to actually be on screen before reading any verdict.
 *
 * Without this the guard navigated, clicked the Interactions tab and started
 * polling while Storybook was still showing its `sb-loader` placeholder — so
 * it could read the PREVIOUS story's verdict and report a failure that
 * belonged to a different story. That is what made
 * `form-controls--label-and-typing` and `menu--open-close` "fail" in a full
 * run and pass in isolation.
 *
 * This is a wait on a real signal, not a sleep and not a retry: the story
 * root must actually have content. A story that genuinely never renders
 * still times out and still fails, which is the point.
 *
 * NOT `.sb-loader`. Measured: that element is present in the preview iframe
 * even once a story has fully rendered — it is part of the preview
 * scaffolding, not a transient spinner. Waiting for it to disappear fails
 * every story forever, which is exactly what a first attempt here did.
 */
async function waitForRender(frame) {
  await frame.waitForFunction(
    () => {
      const root =
        document.querySelector('#storybook-root') ??
        document.querySelector('#root');
      return !!root && root.childElementCount > 0;
    },
    undefined,
    { timeout: 30000 },
  );
}

for (const id of ids) {
  // A fresh page per story. This is the whole fix for the "flaky"
  // interactions, and the cheap-looking alternatives are all worse:
  //
  //   reusing one page      the manager is a single-page app, so changing
  //                         `?path=` swaps the story WITHOUT tearing the
  //                         Interactions panel down — the poll below can
  //                         read the previous story's verdict. Measured:
  //                         chips-input reported FAIL in a full run while
  //                         its panel, read directly, showed PASS.
  //   reload() after goto   loads the story, runs its play function, then
  //                         loads and runs it again; the second run races
  //                         its own half-torn-down state.
  //   about:blank then goto cold-starts the manager and the preview is not
  //                         ready when the play function types into it.
  //
  // Both of those last two turned PASSING stories into failures, which is
  // the opposite of what a guard should do. One page, one load, one play
  // run, then the page is closed.
  // A fresh CONTEXT, not just a page. Pages in one context share storage,
  // permissions and — the one that matters here — the browser's notion of
  // which page is focused. With shared context a story could fail purely
  // because another story ran before it in the same batch: chips-input
  // passed alone and failed in a pair, repeatedly and in both orders.
  const context = await browser.newContext({ viewport: { width: 1500, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/?path=/story/${id}`, { waitUntil: 'domcontentloaded' });

  // The preview is an iframe; its render state is the thing that matters.
  const preview = await page
    .waitForSelector('#storybook-preview-iframe', { timeout: 30000 })
    .then((h) => h.contentFrame())
    .catch(() => null);
  if (preview) {
    try {
      await waitForRender(preview);
    } catch {
      await context.close();
      results.push([id, 'FAIL: story never rendered']);
      console.log(id.padEnd(52), 'FAIL: story never rendered');
      continue;
    }
  }

  try {
    await page.getByRole('tab', { name: /Interactions/ }).click({ timeout: 20000 });
  } catch {
    // The tab label carries a count, so fall back to a looser match.
    await page.locator('[role="tablist"] button', { hasText: 'Interactions' }).first().click();
  }
  let verdict = 'NO VERDICT';
  // 60 x 600ms = 36s. The portaled-overlay stories chain two waitFor windows of
  // 5-8s each, so a shorter poll reports "NO PLAY DETECTED" on a story that is
  // still legitimately running — a tool limitation that reads as a failure.
  for (let i = 0; i < 60; i++) {
    const text = await page.locator('#storybook-panel-root').innerText().catch(() => '');
    if (/\bPASS\b/.test(text)) { verdict = 'PASS'; break; }
    if (/\bFAIL\b/.test(text)) {
      // Skip the panel's own chrome. "Scroll to error" and "Scroll to end"
      // are BUTTON LABELS that match /Error/i, so the old pick reported
      // `FAIL: Scroll to error` for every failure and told you nothing.
      const chrome = /^(Scroll to (error|end)|Interactions?\d*|Controls\d*|Actions|Accessibility|On this page|Visual tests|Design)$/i;
      const line = text
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l && !chrome.test(l) && /Error|expect|Unable|received|toBe|toHave/i.test(l));
      verdict = 'FAIL: ' + (line ?? 'see Interactions panel').slice(0, 140);
      break;
    }
    if (/Write a play function/.test(text)) { verdict = 'NO PLAY DETECTED'; }
    await page.waitForTimeout(600);
  }
  await context.close();
  results.push([id, verdict]);
  console.log(id.padEnd(52), verdict);
}

await browser.close();
const bad = results.filter(([, v]) => v !== 'PASS');
console.log(`\n${results.length - bad.length}/${results.length} pass`);
if (bad.length) process.exitCode = 1;
