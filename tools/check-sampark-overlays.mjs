/**
 * Guard Sampark-only overlay details recovered from spm-ui origin/develop.
 *
 * The select family used three differently sized chevrons, while SPM renders
 * one 12px Mono/100 pi-chevron-down. DatePicker keeps its calendar glyph, as
 * in SPM dev, and is asserted untouched. This
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
];

const EXPECTED_ICON = {
  content: '"\uE902"',
  color: 'rgb(21, 20, 20)',
  fontSize: '12px',
  fontFamily: 'primeicons',
};

const EXPECTED_ROW_RADIUS = '0px';

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

const readRadius = async (selector) =>
  page
    .locator(selector)
    .first()
    .evaluate((row) => getComputedStyle(row).borderRadius);

const checkRadius = async (name, selector) => {
  const actual = await readRadius(selector);
  console.log(`${name}: border-radius ${actual}`);
  if (actual !== EXPECTED_ROW_RADIUS) {
    failures.push(
      `${name} border-radius: expected ${EXPECTED_ROW_RADIUS}, got ${actual}`,
    );
  }
};

const addState = async (selector, stateClass) => {
  await page
    .locator(selector)
    .first()
    .evaluate((row, className) => row.classList.add(className), stateClass);
};

const openStory = async (storyId) => {
  await page.goto(
    `${BASE}/iframe.html?id=${storyId}&viewMode=story&globals=designSystem:sampark`,
    { waitUntil: 'domcontentloaded' },
  );
};

for (const [name, storyId, selector] of CASES) {
  await page.goto(
    `${BASE}/iframe.html?id=${storyId}&viewMode=story&globals=designSystem:sampark`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForSelector(selector, { timeout: 60_000 });
  check(name, await readTrigger(selector));
}

await openStory('components-datepicker--overlay');
await page.waitForSelector('.p-datepicker-dropdown', { timeout: 60_000 });
const datepicker = await readTrigger('.p-datepicker-dropdown');
console.log(`datepicker: ${JSON.stringify(datepicker)}`);
if (datepicker.childVisibility !== 'visible' || datepicker.content !== 'none') {
  failures.push(
    `datepicker trigger: expected its own calendar glyph, got ${JSON.stringify(datepicker)}`,
  );
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

await openStory('components-select--default');
await page.locator('.p-select').click();
await page.locator('.p-select-option').first().waitFor();
await page.locator('.p-select-option').first().hover();
await checkRadius('select hover', '.p-select-option');
await addState('.p-select-option', 'p-focus');
await checkRadius('select focus', '.p-select-option');
await addState('.p-select-option', 'p-select-option-selected');
await checkRadius('select selected', '.p-select-option');

await openStory('components-multiselect--default');
await page.locator('.p-multiselect').click();
await page.locator('.p-multiselect-option').first().waitFor();
await page.locator('.p-multiselect-option').first().hover();
await checkRadius('multiselect hover', '.p-multiselect-option');
await addState('.p-multiselect-option', 'p-focus');
await checkRadius('multiselect focus', '.p-multiselect-option');
await addState('.p-multiselect-option', 'p-multiselect-option-selected');
await checkRadius('multiselect selected', '.p-multiselect-option');

await openStory('components-treeselect--default');
await page.locator('.p-treeselect').click();
await page.locator('.p-tree-node-content').first().waitFor();
await page.locator('.p-tree-node-content').first().hover();
await checkRadius('treeselect hover', '.p-tree-node-content');
await addState('.p-tree-node-content', 'p-focus');
await checkRadius('treeselect focus', '.p-tree-node-content');
await addState('.p-tree-node-content', 'p-tree-node-selected');
await checkRadius('treeselect selected', '.p-tree-node-content');

await page
  .locator(
    '.p-tree-node[data-id="in"] > .p-tree-node-content > .p-tree-node-toggle-button',
  )
  .click();
await page
  .locator(
    '.p-tree-node[data-id="in-amd"] > .p-tree-node-content > .p-tree-node-toggle-button',
  )
  .click();
await page
  .locator(
    '.p-tree-node[data-id="in-amd-1"] > .p-tree-node-content > .p-tree-node-toggle-button',
  )
  .waitFor({ state: 'attached' });
await page.waitForTimeout(200);
const treePanel = await page
  .locator('.p-treeselect-overlay')
  .evaluate((panel) => {
    const panelStyle = getComputedStyle(panel);
    const rootRow = panel.querySelector(
      '.p-tree-node[data-id="in"] > .p-tree-node-content',
    );
    const hoverRow = panel.querySelector(
      '.p-tree-node[data-id="in-amd"] > .p-tree-node-content',
    );
    const guide = panel.querySelector(
      '.p-tree-node[data-id="in"] > .p-tree-node-children',
    );
    const toggle = panel.querySelector(
      '.p-tree-node[data-id="in-amd"] > .p-tree-node-content > .p-tree-node-toggle-button',
    );
    const toggleIcon = toggle?.querySelector('.p-tree-node-toggle-icon');
    const leafToggle = panel.querySelector(
      '.p-tree-node[data-id="in-amd-1"] > .p-tree-node-content > .p-tree-node-toggle-button',
    );
    const leafIcon = leafToggle?.querySelector('.p-tree-node-toggle-icon');
    const rootStyle = rootRow ? getComputedStyle(rootRow) : null;
    const rootBar = rootRow ? getComputedStyle(rootRow, '::before') : null;
    const guideStyle = guide ? getComputedStyle(guide) : null;
    const toggleStyle = toggle ? getComputedStyle(toggle) : null;
    const iconStyle = toggleIcon ? getComputedStyle(toggleIcon) : null;
    const leafMarker = leafToggle
      ? getComputedStyle(leafToggle, '::before')
      : null;
    return {
      panelRadius: panelStyle.borderRadius,
      panelBorderWidth: panelStyle.borderTopWidth,
      panelBorderColor: panelStyle.borderTopColor,
      rowHeight: rootStyle?.height,
      selectedBackground: rootStyle?.backgroundColor,
      selectedBarOpacity: rootBar?.opacity,
      guideWidth: guideStyle?.borderInlineStartWidth,
      guideStyle: guideStyle?.borderInlineStartStyle,
      guideColor: guideStyle?.borderInlineStartColor,
      guideMargin: guideStyle?.marginInlineStart,
      toggleWidth: toggleStyle?.width,
      toggleHeight: toggleStyle?.height,
      toggleIcon: toggleIcon?.getAttribute('data-p-icon'),
      toggleIconWidth: iconStyle?.width,
      toggleIconHeight: iconStyle?.height,
      leafMarker: leafMarker?.content,
      leafIconDisplay: leafIcon
        ? getComputedStyle(leafIcon).display
        : undefined,
      hoverRowSelector: hoverRow ? 'found' : 'missing',
    };
  });
await page
  .locator('.p-tree-node[data-id="in-amd"] > .p-tree-node-content')
  .hover();
await page.waitForTimeout(200);
const treeHover = await page
  .locator('.p-tree-node[data-id="in-amd"] > .p-tree-node-content')
  .evaluate((row) => ({
    background: getComputedStyle(row).backgroundColor,
    barOpacity: getComputedStyle(row, '::before').opacity,
  }));
console.log(
  `treeselect panel: ${JSON.stringify({ ...treePanel, ...treeHover })}`,
);
const treeExpected = {
  panelRadius: '4px',
  panelBorderWidth: '1px',
  panelBorderColor: 'rgb(225, 224, 224)',
  selectedBackground: 'rgb(248, 236, 236)',
  selectedBarOpacity: '0',
  guideWidth: '2px',
  guideStyle: 'solid',
  guideColor: 'rgb(225, 224, 224)',
  guideMargin: '20px',
  toggleWidth: '16px',
  toggleHeight: '16px',
  toggleIconWidth: '12px',
  toggleIconHeight: '12px',
  leafMarker: '"–"',
  leafIconDisplay: 'none',
  hoverRowSelector: 'found',
  background: 'rgb(246, 245, 245)',
  barOpacity: '1',
};
for (const [property, expected] of Object.entries(treeExpected)) {
  const actual = { ...treePanel, ...treeHover }[property];
  if (actual !== expected) {
    failures.push(
      `treeselect panel ${property}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}
const treeRowHeight = Number.parseFloat(treePanel.rowHeight ?? '0');
if (treeRowHeight < 34 || treeRowHeight > 36) {
  failures.push(
    `treeselect panel rowHeight: expected 34–36px, got ${treePanel.rowHeight}`,
  );
}
if (!['chevron-right', 'chevron-down'].includes(treePanel.toggleIcon ?? '')) {
  failures.push(
    `treeselect panel toggleIcon: expected a chevron, got ${JSON.stringify(treePanel.toggleIcon)}`,
  );
}

await openStory('components-menu--sampark');
await page.getByRole('button', { name: 'Sampark Menu' }).click();
await page.locator('.p-menu-item').first().waitFor();
await page.locator('.p-menu-item').first().hover();
await checkRadius('menu hover row', '.p-menu-item');
await checkRadius('menu hover content', '.p-menu-item-content');
await addState('.p-menu-item', 'p-focus');
await checkRadius('menu focus row', '.p-menu-item');
await checkRadius('menu focus content', '.p-menu-item-content');

await openStory('components-listbox--listbox-playground');
await page.locator('.p-listbox-option').first().waitFor();
await page.locator('.p-listbox-option').first().hover();
await checkRadius('listbox hover', '.p-listbox-option');
await addState('.p-listbox-option', 'p-focus');
await checkRadius('listbox focus', '.p-listbox-option');
await addState('.p-listbox-option', 'p-listbox-option-selected');
await checkRadius('listbox selected', '.p-listbox-option');

await openStory('components-pagination--default');
await page.locator('.baps-paginator__rpp.p-select').click();
const paginatorOption = '.baps-paginator__rpp-panel .p-select-option';
await page.locator(paginatorOption).first().waitFor();
await page.locator(paginatorOption).first().hover();
await checkRadius('paginator rows-per-page hover', paginatorOption);
await addState(paginatorOption, 'p-focus');
await checkRadius('paginator rows-per-page focus', paginatorOption);
await addState(paginatorOption, 'p-select-option-selected');
await checkRadius('paginator rows-per-page selected', paginatorOption);

await browser.close();

if (failures.length) {
  console.error(`\nSampark overlay guard failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  '\nSampark overlays match SPM: 12px Mono/100 chevrons, square list states, and tree panel geometry',
);
