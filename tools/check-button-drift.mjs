/**
 * Button's Custom tab is AUTHORED, so it can drift. This is the guard.
 *
 * Card and Alert never needed one: their Custom tab renders Storybook's own
 * source for the story, so it is correct by construction — change the story and
 * the snippet changes with it.
 *
 * Button cannot do that. `<baps-button>` renders `<p-button>` inside it, so its
 * live Angular source is not copyable outside Angular, and the Custom tab
 * carries hand-written markup instead (button.snippets.ts) styled by a
 * hand-authored partial (styles/components/button/_button.scss). Neither is
 * linked to the component — deliberately, since linking them would restyle
 * `baps-button` itself. Two parallel stylesheets can diverge, and the cheapest
 * way for that to happen is a theme-token edit that moves the Angular button
 * while the partial stays put. Nothing about that failure is visible: the docs
 * page still renders, the snippet still copies, and the code it hands a reader
 * quietly stops matching the component.
 *
 * So this renders BOTH and diffs them property by property:
 *
 *   Angular side  a real Storybook story, `baps-button .p-button`
 *   Raw side      the `custom` markup read out of button.snippets.ts, on a bare
 *                 file:// page with tokens.css + the compiled partial and no
 *                 Angular, no Storybook, no PrimeNG
 *
 * The raw markup is READ FROM THE SNIPPETS FILE rather than restated here. That
 * is the point: what this verifies is exactly what the tab shows. Restating it
 * would let the two copies drift, which is the bug class being guarded against.
 *
 *   npx nx run storybook-host:storybook --port=4400   # in another terminal
 *   node tools/check-button-drift.mjs
 *   node tools/check-button-drift.mjs --verbose        # print every property
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';
const VERBOSE = process.argv.includes('--verbose');

const SNIPPETS = 'libs/ui-kit/src/lib/components/button/button.snippets.ts';
const PARTIAL = 'libs/ui-kit/src/lib/styles/components/button/_button.scss';
/* layout/common defines --font-family and --font-feature-settings. The second
   is load-bearing and was found by this checker: without Inter's feature set
   (case, cpsp, salt, ss01/03/04, cv01-11) every label measures about 1px
   narrower per word, so the whole button comes out narrow while every colour,
   border and padding matches. It is one of the three loads button.snippets.ts
   tells a consumer to make. */
const COMMON = 'libs/ui-kit/src/lib/styles/layout/_common.scss';
const TOKENS = 'libs/tokens/build/css/tokens.css';
const FONT = 'libs/ui-kit/src/lib/styles/layout/fonts/Inter-VariableFont_opsz,wght.ttf';
// The icon font, for exactly the reason button.snippets.ts's SETUP block tells
// a consumer to load it: without it a "pi" glyph has no width, and every
// icon-only and loading button measures narrower than the component does.
const PRIMEICONS = 'node_modules/primeicons/primeicons.css';

/** Story export name -> story id. Only the stories that carry a `custom` block. */
const STORIES = {
  AllVariants: 'components-button--all-variants',
  AllSizes: 'components-button--all-sizes',
  States: 'components-button--states',
  SamparkVariants: 'components-button--sampark-variants',
  SamparkSizes: 'components-button--sampark-sizes',
  SamparkIconOnly: 'components-button--sampark-icon-only',
  SamparkStates: 'components-button--sampark-states',
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
    if (key === -1) throw new Error(`${SNIPPETS}: ${name} has no \`custom\` block`);
    const from = key + 'custom: `'.length;
    const end = src.indexOf('`,', from);
    if (end === -1) throw new Error(`${SNIPPETS}: ${name}'s custom block is unterminated`);
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
          css: Object.fromEntries(props.map((k) => [k, cs.getPropertyValue(k)])),
          box: Object.fromEntries(box.map((k) => [k, Math.round(r[k] * 100) / 100])),
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
  const dir = mkdtempSync(join(tmpdir(), 'baps-button-drift-'));
  for (const [src, dest] of [
    [PARTIAL, 'button.css'],
    [COMMON, 'common.css'],
  ]) {
    execFileSync('npx', ['sass', '--no-source-map', src, join(dir, dest)], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });
  }
  copyFileSync(TOKENS, join(dir, 'tokens.css'));
  copyFileSync(PRIMEICONS, join(dir, 'primeicons.css'));
  for (const f of ['primeicons.ttf', 'primeicons.woff2', 'primeicons.woff', 'primeicons.eot', 'primeicons.svg']) {
    try {
      copyFileSync(join('node_modules/primeicons', f), join(dir, f));
    } catch {
      /* primeicons ships a subset of these per release; the css lists them all */
    }
  }
  const fontUrl = pathToFileURL(resolve(FONT)).href;

  const sections = Object.entries(blocks)
    .map(([name, html]) => `<section data-story="${name}">\n${html}\n</section>`)
    .join('\n');

  const page = `<!doctype html>
<meta charset="utf-8">
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./common.css">
<link rel="stylesheet" href="./button.css">
<link rel="stylesheet" href="./primeicons.css">
<style>
  /* The app's own base rule — no ui-kit partial applies one. Copied from
     apps/storybook-host/src/styles.scss, the same three loads button.snippets.ts
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
for (const [name, id] of Object.entries(STORIES)) {
  await page.goto(`${BASE}/iframe.html?viewMode=story&id=${id}`, {
    waitUntil: 'commit',
    timeout: 120000,
  });
  await page.waitForSelector('baps-button .p-button', { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  angular[name] = await extract(page, 'baps-button .p-button');
}

const rawUrl = buildRawPage(blocks);
await page.goto(rawUrl, { waitUntil: 'load', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const raw = {};
for (const name of Object.keys(STORIES)) {
  raw[name] = await extract(page, `section[data-story="${name}"] .baps-button`);
}
await browser.close();

// ── Diff ───────────────────────────────────────────────────────────────────
let checked = 0;
const failures = [];

for (const name of Object.keys(STORIES)) {
  const a = angular[name];
  const b = raw[name];
  if (a.length !== b.length) {
    failures.push(`${name}: Angular renders ${a.length} buttons, the Custom tab markup ${b.length}`);
    continue;
  }
  a.forEach((ang, i) => {
    const rw = b[i];
    const label = `${name}[${i}] "${ang.text.slice(0, 24)}"`;
    for (const k of PROPS) {
      checked++;
      // `display` is the one property where the two sides legitimately read
      // differently for a reason that is not a design difference. CSS
      // blockifies a flex item's `inline-flex` to `flex`, and the raw <button>
      // IS the flex item of the story's wrapper row, while Angular's .p-button
      // sits two elements deeper (<baps-button><p-button><button>) so the
      // wrapper never touches it. Same rendered result, different computed
      // string. Normalised rather than dropped, so a genuine change — to
      // `block`, say — still fails.
      const norm = (v) => (k === 'display' && v === 'flex' ? 'inline-flex' : v);
      if (norm(ang.css[k]) !== norm(rw.css[k])) {
        failures.push(`${label}  ${k}\n      angular: ${ang.css[k]}\n      custom : ${rw.css[k]}`);
      }
    }
    for (const k of BOX) {
      // The loading spinner is the one piece of content the two sides cannot
      // render the same way, and it is not a design difference. PrimeNG draws
      // its own <svg> icon component (measured 21.08px wide); raw markup has no
      // such component and uses the PrimeIcons glyph the SETUP block already
      // tells a consumer to load, which is narrower. So the loading button's
      // WIDTH differs by the icon delta while its height, fill, border, ink and
      // dim are all still compared. Height is deliberately NOT skipped — a
      // loading button that changed height would still fail here.
      if (k === 'width' && /loading/i.test(ang.text)) continue;
      checked++;
      // Sub-pixel: text metrics land a hair apart between a <span> label and a
      // bare text node. A tenth of a pixel is not a design change.
      if (Math.abs(ang.box[k] - rw.box[k]) > 0.5) {
        failures.push(`${label}  ${k}\n      angular: ${ang.box[k]}px\n      custom : ${rw.box[k]}px`);
      }
    }
    if (VERBOSE) {
      console.log(`\n${label}`);
      for (const k of PROPS) console.log(`  ${k.padEnd(20)} ${ang.css[k]}`);
      for (const k of BOX) console.log(`  ${k.padEnd(20)} ${ang.box[k]}px`);
    }
  });
}

const buttons = Object.values(angular).reduce((n, v) => n + v.length, 0);
console.log(
  `\nchecked ${checked} properties across ${buttons} buttons in ${Object.keys(STORIES).length} stories`,
);

if (failures.length) {
  console.error(`\n${failures.length} drift(s) between the Angular component and the Custom tab:\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\nThe Custom tab now hands readers code that does not match the component.\n` +
      `Fix ${PARTIAL} (or the markup in ${SNIPPETS}) so both render the same.`,
  );
  process.exit(1);
}

console.log('button drift OK — the Custom tab renders identically to the component');
