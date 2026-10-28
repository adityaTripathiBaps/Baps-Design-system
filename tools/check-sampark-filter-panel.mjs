/**
 * Guard the Sampark Filters drawer against SPM dev's legacy panel geometry.
 */
import { chromium } from '@playwright/test';

const BASE =
  process.env.STORYBOOK_URL ?? process.env.SB_URL ?? 'http://localhost:4400';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.setDefaultNavigationTimeout(120_000);

const failures = [];
const expect = (name, actual, expected) => {
  console.log(`${name}: ${actual}`);
  if (actual !== expected) {
    failures.push(`${name}: expected ${expected}, got ${actual}`);
  }
};

const metrics = async (selector) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        padding: style.padding,
        gap: style.gap,
        display: style.display,
        background: style.backgroundColor,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
      };
    });

await page.goto(
  `${BASE}/iframe.html?id=components-drawer--filter-panel&viewMode=story&globals=designSystem:sampark`,
  { waitUntil: 'domcontentloaded' },
);
await page.getByRole('button', { name: 'Open filters' }).click();
await page.locator('.p-drawer').waitFor({ state: 'visible', timeout: 60_000 });

const panel = await metrics('.p-drawer');
const header = await metrics('.p-drawer-header');
const title = await metrics('.p-drawer-title');
const content = await metrics('.p-drawer-content');
const actions = await metrics('.baps-drawer__actions > [drawer-actions]');
const actionButton = await metrics('.baps-drawer__actions button');
const clearButton = await metrics('.baps-accordion-clear');
const clearIcon = await metrics('.baps-accordion-clear__sampark');

expect('drawer width', panel.width, '500px');
expect('drawer padding', panel.padding, '0px');
expect('drawer gap', panel.gap, '0px');
expect('header padding', header.padding, '24px 32px 8px');
expect('title size', title.fontSize, '20px');
expect('title weight', title.fontWeight, '600');
expect('content padding', content.padding, '12px 32px 32px');
expect('header action gap', actions.gap, '8px');
expect('header action height', actionButton.height, '32px');
expect('section clear size', clearButton.width, '28px');
expect('section clear icon', clearIcon.width, '18px');

await page.goto(
  `${BASE}/iframe.html?id=components-accordion--filter-panel&viewMode=story&globals=designSystem:sampark`,
  { waitUntil: 'domcontentloaded' },
);
await page.locator('.p-accordionheader').first().waitFor({ timeout: 60_000 });

const accordionHeader = await metrics('.p-accordionheader');
const count = await metrics('.baps-accordion-count');
const label = await metrics('.baps-accordion-label');
const chevron = await metrics('.p-accordionheader .p-icon');
const row = await metrics('.baps-accordion-row');
const checkbox = await metrics('.p-checkbox-box');
const checkboxLabel = await metrics('.p-checkbox-label');
const countLabelGap = await page
  .locator('.baps-accordion-label')
  .first()
  .evaluate(
    (element) =>
      `${element.getBoundingClientRect().left - element.previousElementSibling.getBoundingClientRect().right}px`,
  );

expect('accordion header height', accordionHeader.height, '32px');
expect(
  'accordion header background',
  accordionHeader.background,
  'rgb(248, 247, 247)',
);
expect('count width', count.width, '32px');
expect('count height', count.height, '32px');
expect('count-label gap', countLabelGap, '12px');
expect('accordion label size', label.fontSize, '14px');
expect('accordion label weight', label.fontWeight, '500');
expect('chevron box', chevron.width, '28px');
expect('field layout', row.display, 'grid');
expect('field column gap', row.gap, '12px');
expect('checkbox size', checkbox.width, '16px');
expect('checkbox label size', checkboxLabel.fontSize, '14px');
expect('checkbox label weight', checkboxLabel.fontWeight, '400');

await browser.close();

if (failures.length) {
  console.error(`Sampark filter panel drift:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Sampark filter panel matches SPM drawer and field geometry');
