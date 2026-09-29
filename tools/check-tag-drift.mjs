/**
 * Tag's Custom tab is AUTHORED, so it can drift. This is its guard.
 *
 * Same contract as tools/check-button-drift.mjs, and the same reason: the
 * partial (styles/components/tag/_tag.scss) and the live component are two
 * parallel stylesheets. The component is styled by PrimeNG's runtime theme via
 * `components.tag` in baps.theme.ts; the partial is authored from the `--tag-*`
 * tokens. Nothing links them, so a theme edit can move one and not the other,
 * and nothing about that failure is visible — the page still renders, the
 * snippet still copies, and the code it hands a reader quietly stops matching.
 *
 * The markup is READ FROM tag.snippets.ts, so what is verified is what the tab
 * shows.
 *
 * Deliberately a sibling of the button guard rather than a generalisation of
 * it. Two is not enough to justify the indirection; at the third authored
 * partial these two should collapse into one parameterised checker.
 *
 *   npx nx run storybook-host:storybook --port=4400   # in another terminal
 *   node tools/check-tag-drift.mjs
 *   node tools/check-tag-drift.mjs --verbose
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';
const VERBOSE = process.argv.includes('--verbose');

const SNIPPETS = 'libs/ui-kit/src/lib/components/tag/tag.snippets.ts';
const PARTIAL = 'libs/ui-kit/src/lib/styles/components/tag/_tag.scss';
const COMMON = 'libs/ui-kit/src/lib/styles/layout/_common.scss';
const TOKENS = 'libs/tokens/build/css/tokens.css';
const FONT = 'libs/ui-kit/src/lib/styles/layout/fonts/Inter-VariableFont_opsz,wght.ttf';
const PRIMEICONS = 'node_modules/primeicons/primeicons.css';

const STORIES = {
  Severities: 'components-tag--severities',
  Sizes: 'components-tag--sizes',
  WithIcon: 'components-tag--with-icon',
};

const PROPS = [
  'background-color',
  'color',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-radius',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'font-weight',
  'column-gap',
  'display',
  'align-items',
  'white-space',
];
const BOX = ['width', 'height'];

const readCustomBlocks = () => {
  const src = readFileSync(SNIPPETS, 'utf8');
  const out = {};
  for (const name of Object.keys(STORIES)) {
    const start = src.indexOf('\n  ' + name + ': {');
    if (start === -1) throw new Error(SNIPPETS + ': no entry for ' + name);
    const key = src.indexOf('custom: ', start);
    if (key === -1) throw new Error(SNIPPETS + ': ' + name + ' has no custom block');
    const from = src.indexOf('\n', key) === -1 ? key : key + 'custom: '.length + 1;
    const end = src.indexOf('\n    react:', from);
    if (end === -1) throw new Error(SNIPPETS + ': ' + name + ' custom block unterminated');
    // Trim the trailing backtick-comma the template literal ends with.
    out[name] = src.slice(from, end).replace(/[`,\s]+$/, '');
  }
  return out;
};

const extract = (page, selector) =>
  page.evaluate(
    (args) =>
      [...document.querySelectorAll(args.selector)].map((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const css = {};
        for (const k of args.props) css[k] = cs.getPropertyValue(k);
        const box = {};
        for (const k of args.box) box[k] = Math.round(r[k] * 100) / 100;
        return { text: (el.textContent || '').trim() || '(icon)', css, box };
      }),
    { selector, props: PROPS, box: BOX },
  );

const buildRawPage = (blocks) => {
  const dir = mkdtempSync(join(tmpdir(), 'baps-tag-drift-'));
  const pairs = [
    [PARTIAL, 'tag.css'],
    [COMMON, 'common.css'],
  ];
  for (const pair of pairs) {
    execFileSync('npx', ['sass', '--no-source-map', pair[0], join(dir, pair[1])], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });
  }
  copyFileSync(TOKENS, join(dir, 'tokens.css'));
  copyFileSync(PRIMEICONS, join(dir, 'primeicons.css'));
  for (const f of ['primeicons.ttf', 'primeicons.woff2', 'primeicons.woff']) {
    try {
      copyFileSync(join('node_modules/primeicons', f), join(dir, f));
    } catch {
      /* primeicons ships a different subset per release */
    }
  }
  const fontUrl = pathToFileURL(resolve(FONT)).href;

  const sections = Object.keys(blocks)
    .map((name) => '<section data-story="' + name + '">\n' + blocks[name] + '\n</section>')
    .join('\n');

  const style = [
    '<style>',
    "  @font-face { font-family:'Inter Variable'; font-style:normal; font-weight:100 900;",
    "    font-display:swap; src:url('" + fontUrl + "') format('truetype'); }",
    '  html { font-size:16px; font-family:var(--font-family); ',
    '    font-feature-settings:var(--font-feature-settings); line-height:normal; }',
    '  button, input, textarea, select { font-feature-settings: inherit; }',
    '  body { margin:16px; }',
    '  section { margin-bottom:24px; }',
    '</style>',
  ].join('\n');

  const page = [
    '<!doctype html>',
    '<meta charset="utf-8">',
    '<link rel="stylesheet" href="./tokens.css">',
    '<link rel="stylesheet" href="./common.css">',
    '<link rel="stylesheet" href="./tag.css">',
    '<link rel="stylesheet" href="./primeicons.css">',
    style,
    sections,
  ].join('\n');

  const file = join(dir, 'raw.html');
  writeFileSync(file, page);
  return pathToFileURL(file).href;
};

const blocks = readCustomBlocks();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const angular = {};
for (const name of Object.keys(STORIES)) {
  await page.goto(BASE + '/iframe.html?viewMode=story&id=' + STORIES[name], {
    waitUntil: 'commit',
    timeout: 120000,
  });
  await page.waitForSelector('baps-tag .p-tag', { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  angular[name] = await extract(page, 'baps-tag .p-tag');
}

const rawUrl = buildRawPage(blocks);
await page.goto(rawUrl, { waitUntil: 'load', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const raw = {};
for (const name of Object.keys(STORIES)) {
  raw[name] = await extract(page, 'section[data-story="' + name + '"] .baps-tag');
}
await browser.close();

let checked = 0;
const failures = [];

for (const name of Object.keys(STORIES)) {
  const a = angular[name];
  const b = raw[name];
  if (a.length !== b.length) {
    failures.push(name + ': Angular renders ' + a.length + ' tags, the Custom tab markup ' + b.length);
    continue;
  }
  for (let i = 0; i < a.length; i++) {
    const ang = a[i];
    const rw = b[i];
    const label = name + '[' + i + '] "' + ang.text.slice(0, 20) + '"';
    for (const k of PROPS) {
      checked++;
      // A tag is a flex item on one side and not the other, and CSS blockifies
      // a flex item's inline-flex to flex. Same rendered result, different
      // computed string — normalised rather than dropped, so a genuine change
      // to `block` would still fail.
      const norm = (v) => (k === 'display' && v === 'flex' ? 'inline-flex' : v);
      if (norm(ang.css[k]) !== norm(rw.css[k])) {
        failures.push(label + '  ' + k + '\n      angular: ' + ang.css[k] + '\n      custom : ' + rw.css[k]);
      }
    }
    for (const k of BOX) {
      checked++;
      if (Math.abs(ang.box[k] - rw.box[k]) > 0.5) {
        failures.push(label + '  ' + k + '\n      angular: ' + ang.box[k] + 'px\n      custom : ' + rw.box[k] + 'px');
      }
    }
    if (VERBOSE) {
      console.log('\n' + label);
      for (const k of PROPS) console.log('  ' + k.padEnd(20) + ang.css[k]);
    }
  }
}

let tags = 0;
for (const name of Object.keys(angular)) tags += angular[name].length;
console.log(
  '\nchecked ' + checked + ' properties across ' + tags + ' tags in ' + Object.keys(STORIES).length + ' stories',
);

if (failures.length) {
  console.error('\n' + failures.length + ' drift(s) between the Angular component and the Custom tab:\n');
  for (const f of failures) console.error('  ' + f);
  console.error(
    '\nThe Custom tab now hands readers code that does not match the component.\n' +
      'Fix ' + PARTIAL + ' (or the markup in ' + SNIPPETS + ') so both render the same.',
  );
  process.exit(1);
}

console.log('tag drift OK — the Custom tab renders identically to the component');
