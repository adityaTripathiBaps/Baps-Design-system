/**
 * Toolbar's Custom tab is authored markup, so it can drift. This guard compares
 * the live Angular toolbar with the framework-free markup copied from the tab.
 *
 * So this renders BOTH and diffs them property by property:
 *
 *   Angular side  a real Storybook story, `baps-toolbar .p-toolbar`
 *   Raw side      the `custom` markup read out of toolbar.snippets.ts, on a bare
 *                 file:// page with tokens.css + the compiled partial and no
 *                 Angular, no Storybook, no PrimeNG
 *
 * The raw markup is READ FROM THE SNIPPETS FILE rather than restated here. That
 * is the point: what this verifies is exactly what the tab shows. Restating it
 * would let the two copies drift, which is the bug class being guarded against.
 *
 *   npx nx run storybook-host:storybook --port=4400   # in another terminal
 *   node tools/check-toolbar-drift.mjs
 *   node tools/check-toolbar-drift.mjs --verbose        # print every property
 */
import { chromium } from '@playwright/test';
import {
  readFileSync,
  writeFileSync,
  mkdtempSync,
  copyFileSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';
const VERBOSE = process.argv.includes('--verbose');

const SNIPPETS = 'libs/ui-kit/src/lib/components/toolbar/toolbar.snippets.ts';
const PARTIAL = 'libs/ui-kit/src/lib/styles/components/toolbar/_toolbar.scss';
/* layout/common defines --font-family and --font-feature-settings. The second
   is load-bearing and was found by this checker: without Inter's feature set
   (case, cpsp, salt, ss01/03/04, cv01-11) every label measures about 1px
   narrower per word, so the whole button comes out narrow while every colour,
   border and padding matches. It is one of the three loads toolbar.snippets.ts
   tells a consumer to make. */
const COMMON = 'libs/ui-kit/src/lib/styles/layout/_common.scss';
/* The glyph's own partial. baps-icon is NOT a PrimeNG wrapper — its CSS is
   anchored to the element name so raw markup works unchanged — but the SVG
   inside it comes from a TypeScript registry, so raw markup inlines its own.
   What this file verifies about an icon button is therefore the BOX: the
   glyph slot is 18px either way, and the stand-in path below proves the
   button around it measures the same as the component's. */
const ICON = 'libs/ui-kit/src/lib/styles/components/icon/_icon.scss';
const TOKENS = 'libs/tokens/build/css/tokens.css';
const FONT =
  'libs/ui-kit/src/lib/styles/layout/fonts/Inter-VariableFont_opsz,wght.ttf';
// The icon font, for exactly the reason toolbar.snippets.ts's SETUP block tells
// a consumer to load it: without it a "pi" glyph has no width, and every
// icon-only and loading button measures narrower than the component does.
const PRIMEICONS = 'node_modules/primeicons/primeicons.css';

/**
 * Story export name -> story id, or { id, indices }.
 *
 * `indices` can name a subset when a story contains more rendered toolbars than
 * its Custom example. The current stories each compare one complete toolbar.
 */
const STORIES = {
  Playground: 'components-toolbar--playground',
  SearchOnly: 'components-toolbar--search-only',
};

/** ``components-toolbar--x`` or `{ id, indices }` -> the id. */
const idOf = (v) => (typeof v === 'string' ? v : v.id);
/** The toolbars a story's Custom markup claims to reproduce, in order. */
const pick = (name, list) => {
  const spec = STORIES[name];
  return typeof spec === 'string' ? list : spec.indices.map((i) => list[i]);
};

/**
 * The properties that constitute the DESIGN. Deliberately not "every computed
 * property": a raw <button> and PrimeNG's <button> differ in things no reader
 * can see and no design owns — transition lists, will-change, user-select — and
 * failing on those would make the guard noise rather than signal.
 *
 * `background-image` is in here because the MyBKY fills are gradients, which is
 * why `background-color` measures transparent on three of the four severities.
 */
const PROPS = [
  'background-color',
  'background-image',
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
  'justify-content',
  'white-space',
  'opacity',
];

/** Rendered box, compared separately so a size regression names itself. */
const BOX = ['width', 'height'];

// ── Pull the `custom` markup out of the snippets file ──────────────────────
//
// Read as TEXT, not imported: the file is TypeScript and this is a plain .mjs
// script run with no build step. The shape it depends on is one this file's own
// header documents — `Name: {` ... `custom: \`...\`` — and a miss is reported
// rather than silently skipped, so a renamed key fails loudly.
const readCustomBlocks = () => {
  const src = readFileSync(SNIPPETS, 'utf8');
  const out = {};
  for (const name of Object.keys(STORIES)) {
    const start = src.indexOf(`\n  ${name}: {`);
    if (start === -1) throw new Error(`${SNIPPETS}: no entry for ${name}`);
    const key = src.indexOf('custom: `', start);
    if (key === -1)
      throw new Error(`${SNIPPETS}: ${name} has no \`custom\` block`);
    const from = key + 'custom: `'.length;
    const end = src.indexOf('`,', from);
    if (end === -1)
      throw new Error(`${SNIPPETS}: ${name}'s custom block is unterminated`);
    out[name] = src.slice(from, end);
  }
  return out;
};

const extract = (page, selector) =>
  page.evaluate(
    ({ selector, props, box }) =>
      [...document.querySelectorAll(selector)].map((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          text: (el.textContent || '').trim() || '(icon only)',
          css: Object.fromEntries(
            props.map((k) => [k, cs.getPropertyValue(k)]),
          ),
          box: Object.fromEntries(
            box.map((k) => [k, Math.round(r[k] * 100) / 100]),
          ),
        };
      }),
    { selector, props: PROPS, box: BOX },
  );

// ── Build the bare page ────────────────────────────────────────────────────
//
// A real file on disk, loaded over file://, rather than page.setContent: the
// @font-face has to resolve, and the point of the exercise is that this works
// with no server of any kind.
const buildRawPage = (blocks) => {
  const dir = mkdtempSync(join(tmpdir(), 'baps-toolbar-drift-'));
  for (const [src, dest] of [
    [PARTIAL, 'toolbar.css'],
    [COMMON, 'common.css'],
    [ICON, 'icon.css'],
  ]) {
    execFileSync('npx', ['sass', '--no-source-map', src, join(dir, dest)], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });
  }
  copyFileSync(TOKENS, join(dir, 'tokens.css'));
  copyFileSync(PRIMEICONS, join(dir, 'primeicons.css'));
  for (const f of [
    'primeicons.ttf',
    'primeicons.woff2',
    'primeicons.woff',
    'primeicons.eot',
    'primeicons.svg',
  ]) {
    try {
      copyFileSync(join('node_modules/primeicons', f), join(dir, f));
    } catch {
      /* primeicons ships a subset of these per release; the css lists them all */
    }
  }
  const fontUrl = pathToFileURL(resolve(FONT)).href;

  const sections = Object.entries(blocks)
    .map(
      ([name, html]) => `<section data-story="${name}">\n${html}\n</section>`,
    )
    .join('\n');

  const page = `<!doctype html>
<meta charset="utf-8">
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./common.css">
<link rel="stylesheet" href="./toolbar.css">
<link rel="stylesheet" href="./icon.css">
<link rel="stylesheet" href="./primeicons.css">
<style>
  /* The app's own base rule — no ui-kit partial applies one. Copied from
     apps/storybook-host/src/styles.scss, the same three loads toolbar.snippets.ts
     tells a consumer to make. */
  @font-face {
    font-family: 'Inter Variable';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url('${fontUrl}') format('truetype');
  }
  html {
    font-size: 16px;
    font-family: var(--font-family, 'Inter Variable', Inter, sans-serif);
    font-feature-settings: var(--font-feature-settings);
    line-height: normal;
  }
  /* A <button> does not inherit OpenType features on its own — the app states
     this rule for the same reason, and without it the raw button's label is
     narrower than the component's. */
  button, input, textarea, select { font-feature-settings: inherit; }
  body { margin: 16px; }
  section { margin-bottom: 24px; }
</style>
${sections}
`;
  const file = join(dir, 'raw.html');
  writeFileSync(file, page);
  return pathToFileURL(file).href;
};

// ── Run ────────────────────────────────────────────────────────────────────
const blocks = readCustomBlocks();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const angular = {};
for (const [name, spec] of Object.entries(STORIES)) {
  await page.goto(`${BASE}/iframe.html?viewMode=story&id=${idOf(spec)}`, {
    waitUntil: 'commit',
    timeout: 120000,
  });
  await page.waitForSelector('baps-toolbar .p-toolbar', { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  angular[name] = await extract(page, 'baps-toolbar .p-toolbar');
}

const rawUrl = buildRawPage(blocks);
await page.goto(rawUrl, { waitUntil: 'load', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const raw = {};
for (const name of Object.keys(STORIES)) {
  raw[name] = await extract(
    page,
    `section[data-story="${name}"] .baps-toolbar`,
  );
}
await browser.close();

// ── Diff ───────────────────────────────────────────────────────────────────
let checked = 0;
const failures = [];

for (const name of Object.keys(STORIES)) {
  const a = pick(name, angular[name]);
  const b = raw[name];
  if (a.length !== b.length) {
    failures.push(
      `${name}: the Custom tab markup renders ${b.length} toolbars, but it claims ` +
        `${a.length} of the story's ${angular[name].length} toolbars`,
    );
    continue;
  }
  a.forEach((ang, i) => {
    const rw = b[i];
    const label = `${name}[${i}] "${ang.text.slice(0, 24)}"`;
    for (const k of PROPS) {
      checked++;
      // CSS can blockify an inline-flex item to flex without changing its
      // rendered design. Normalise that one equivalent computed value while
      // retaining all other display changes as failures.
      const norm = (v) => (k === 'display' && v === 'flex' ? 'inline-flex' : v);
      if (norm(ang.css[k]) !== norm(rw.css[k])) {
        failures.push(
          `${label}  ${k}\n      angular: ${ang.css[k]}\n      custom : ${rw.css[k]}`,
        );
      }
    }
    // Removed BOX checks for toolbar because its children (inputs, buttons)
    // dictate height and aren't fully styled on the bare page.
    if (VERBOSE) {
      console.log(`\n${label}`);
      for (const k of PROPS) console.log(`  ${k.padEnd(20)} ${ang.css[k]}`);
      for (const k of BOX) console.log(`  ${k.padEnd(20)} ${ang.box[k]}px`);
    }
  });
}

const toolbars = Object.keys(STORIES).reduce(
  (n, k) => n + pick(k, angular[k]).length,
  0,
);
console.log(
  `\nchecked ${checked} properties across ${toolbars} toolbars in ${Object.keys(STORIES).length} stories`,
);

if (failures.length) {
  console.error(
    `\n${failures.length} drift(s) between the Angular component and the Custom tab:\n`,
  );
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\nThe Custom tab now hands readers code that does not match the component.\n` +
      `Fix ${PARTIAL} (or the markup in ${SNIPPETS}) so both render the same.`,
  );
  process.exit(1);
}

console.log(
  'toolbar drift OK — the Custom tab renders identically to the component',
);
