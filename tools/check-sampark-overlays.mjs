/**
 * Guard Sampark-only overlay details recovered from spm-ui origin/develop.
 *
 * The select family used three differently sized chevrons plus DatePicker's
 * calendar glyph, while SPM renders one 12px Mono/100 pi-chevron-down. This
 * drives the real Storybook components and also injects raw p-select and
 * p-multiselect trigger markup to cover the application wrappers that provide
 * their own dropdownicon templates.
 */
import { chromium } from '@playwright/test';

const BASE =
  process.env.STORYBOOK_URL ?? process.env.SB_URL ?? 'http://localhost:4400';

const CASES = [
  ['select', 'components-select--default', '.p-select-dropdown'],
  [
    'multiselect',
    'components-multiselect--brands',
    'baps-multi-select.baps-sampark .p-multiselect-dropdown',
  ],
  [
    'treeselect',
    'components-treeselect--brands',
    'baps-tree-select.baps-sampark .p-treeselect-dropdown',
  ],
  ['datepicker', 'components-datepicker--overlay', '.p-datepicker-dropdown'],
];

const EXPECTED_ICON = {
  content: '"\uE902"',
  color: 'rgb(21, 20, 20)',
  fontSize: '12px',
  fontFamily: 'primeicons',
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultNavigationTimeout(120_000);

const failures = [];

const readTrigger = async (selector) =>
  page
    .locator(selector)
    .first()
    .evaluate((trigger) => {
      const pseudo = getComputedStyle(trigger, '::before');
      const child = trigger.firstElementChild;
      return {
        content: pseudo.content,
        color: pseudo.color,
        fontSize: pseudo.fontSize,
        fontFamily: pseudo.fontFamily.replaceAll('"', '').replaceAll("'", ''),
        childVisibility: child ? getComputedStyle(child).visibility : 'missing',
      };
    });

const check = (name, actual) => {
  console.log(`${name}: ${JSON.stringify(actual)}`);
  for (const [property, expected] of Object.entries(EXPECTED_ICON)) {
    if (actual[property] !== expected) {
      failures.push(
        `${name} ${property}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual[property])}`,
      );
    }
  }
  if (actual.childVisibility !== 'hidden') {
    failures.push(
      `${name} childVisibility: expected "hidden", got ${JSON.stringify(actual.childVisibility)}`,
    );
  }
};

for (const [name, storyId, selector] of CASES) {
  await page.goto(
    `${BASE}/iframe.html?id=${storyId}&viewMode=story&globals=designSystem:sampark`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForSelector(selector, { timeout: 60_000 });
  check(name, await readTrigger(selector));
}

await page.goto(
  `${BASE}/iframe.html?id=components-select--default&viewMode=story&globals=designSystem:sampark`,
  { waitUntil: 'domcontentloaded' },
);
await page.waitForSelector('.p-select-dropdown', { timeout: 60_000 });
await page.evaluate(() => {
  const fixture = document.createElement('div');
  fixture.className = 'baps-ds-sampark';
  fixture.dataset.samparkOverlayFixture = '';
  fixture.innerHTML = `
    <div class="p-select">
      <div class="p-select-dropdown"><span><i class="pi pi-chevron-down"></i></span></div>
    </div>
    <div class="p-multiselect">
      <div class="p-multiselect-dropdown"><span><svg aria-hidden="true"></svg></span></div>
    </div>
  `;
  document.body.append(fixture);
});

check(
  'raw select template',
  await readTrigger('[data-sampark-overlay-fixture] .p-select-dropdown'),
);
check(
  'raw multiselect template',
  await readTrigger('[data-sampark-overlay-fixture] .p-multiselect-dropdown'),
);

await browser.close();

if (failures.length) {
  console.error(`\nSampark overlay guard failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  '\nSampark overlay trigger icons match SPM: 12px Mono/100 chevrons',
);
