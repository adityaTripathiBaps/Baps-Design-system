// Acceptance check for the Storybook addon surface: open one story per
// category and record which panel tabs and toolbar tools are present. Reading
// the real manager DOM rather than trusting main.ts, because an addon whose
// version mismatches core registers silently and shows up nowhere.
import { chromium } from '@playwright/test';

const STORIES = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });

for (const id of STORIES) {
  await page.goto(`http://localhost:4400/?path=/story/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const info = await page.evaluate(() => {
    const text = (e) => (e.getAttribute('title') || e.textContent || '').trim();
    return {
      tabs: [...document.querySelectorAll('[role="tablist"] button')].map(text),
      tools: [...document.querySelectorAll('[data-test-id="sb-preview-toolbar"] button')].map(text),
      sidebar: !!document.querySelector('#storybook-explorer-tree'),
    };
  });
  console.log(id.padEnd(42), '|', info.tabs.join(' · '));
  console.log(''.padEnd(42), '| sidebar:', info.sidebar, '| tools:', info.tools.length);
}
await browser.close();
