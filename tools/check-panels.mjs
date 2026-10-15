// Acceptance check for the Storybook addon surface: open one story per
// category and record which panel tabs and toolbar tools are present. Reading
// the real manager DOM rather than trusting main.ts, because an addon whose
// version mismatches core registers silently and shows up nowhere.
import { chromium } from '@playwright/test';

// One env var for every guard, so tools/with-storybook.mjs can point the
// whole set at the server it started. Falls back to the port the storybook
// target uses, which is what a developer running it by hand gets.
const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';

const STORIES = process.argv.slice(2);

/**
 * Refuse to report success on an empty run.
 *
 * This tool takes story ids on argv, and `tools/with-storybook.mjs` passed
 * none — so it looped zero times, printed nothing at all, set no exit code,
 * and the runner's summary printed `ok`. It had been doing that for as long
 * as it has been in the suite, alongside the same defect in
 * check-interactions.
 *
 * Note what this tool does and does not do: it REPORTS which panel tabs and
 * toolbar tools each story exposes. It asserts nothing about them, so it
 * cannot fail on a missing addon — it can only show you one is gone. That
 * is worth knowing before treating a green run here as coverage.
 */
if (!STORIES.length) {
  console.error(
    'check-panels: no story ids given, so nothing was checked.\n' +
      'Pass one story id per category, e.g.\n' +
      '  node tools/check-panels.mjs components-button--playground …\n' +
      'tools/with-storybook.mjs supplies them automatically.',
  );
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });

for (const id of STORIES) {
  await page.goto(`${BASE}/?path=/story/${id}`, { waitUntil: 'domcontentloaded' });
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
