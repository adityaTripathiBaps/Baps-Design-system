// Drive each interaction story in a real browser and read the Interactions
// panel's verdict, rather than trusting that a play function "looks right".
import { chromium } from '@playwright/test';

// One env var for every guard, so tools/with-storybook.mjs can point the
// whole set at the server it started. Falls back to the port the storybook
// target uses, which is what a developer running it by hand gets.
const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';

const ids = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
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
      verdict = 'FAIL: ' + (text.split('\n').find((l) => /Error|expect|Unable|received/i.test(l)) ?? '').slice(0, 140);
      break;
    }
    if (/Write a play function/.test(text)) { verdict = 'NO PLAY DETECTED'; }
    await page.waitForTimeout(600);
  }
  results.push([id, verdict]);
  console.log(id.padEnd(52), verdict);
}

await browser.close();
const bad = results.filter(([, v]) => v !== 'PASS');
console.log(`\n${results.length - bad.length}/${results.length} pass`);
if (bad.length) process.exitCode = 1;
