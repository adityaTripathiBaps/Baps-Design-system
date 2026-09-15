// Print the Interactions panel text for a story, so a failure names itself
// instead of showing up as a red tab. Companion to check-interactions.mjs.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
for (const id of process.argv.slice(2)) {
  await page.goto(`http://localhost:4400/?path=/story/${id}`, { waitUntil: 'domcontentloaded' });
  await page.locator('[role="tablist"] button', { hasText: 'Interactions' }).first().click();
  await page.waitForTimeout(6000);
  console.log('=====', id, '=====');
  console.log((await page.locator('#storybook-panel-root').innerText()).slice(0, 1500));
}
await browser.close();
