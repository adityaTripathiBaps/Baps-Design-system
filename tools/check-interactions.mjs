// Drive each interaction story in a real browser and read the Interactions
// panel's verdict, rather than trusting that a play function "looks right".
import { chromium } from '@playwright/test';

const ids = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
const results = [];

for (const id of ids) {
  await page.goto(`http://localhost:4400/?path=/story/${id}`, { waitUntil: 'domcontentloaded' });
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
