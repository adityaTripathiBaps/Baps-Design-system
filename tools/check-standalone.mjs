/**
 * Does a non-wrapper's live markup actually work outside Angular?
 *
 * Source inspection says these four import nothing from PrimeNG and render no
 * <p-*>. That is necessary and not sufficient: a component can still be
 * unusable outside Angular if its CSS never reaches a page Angular did not
 * render — which is exactly what happens when the rules live in an inline
 * `styles:` block instead of a partial. menu-item and users-dropdown are in
 * that position and are not tested here; they have no partial and nothing in
 * the packaged CSS.
 *
 * The test, for each component:
 *
 *   1. render its story in Storybook and take the rendered DOM,
 *   2. strip Angular's own attributes from it (_ngcontent, ng-reflect, _nghost),
 *   3. put that markup on a bare file:// page carrying only tokens.css, the
 *      layout partials and the component's own partial — no Angular, no
 *      Storybook, no PrimeNG,
 *   4. compare computed styles element by element.
 *
 * Taking the markup from the render rather than hand-authoring it is the point.
 * The claim being tested is that the live source is copyable; hand-authoring a
 * clean version would test a different, weaker claim.
 *
 *   npx nx run storybook-host:storybook --port=4400   # in another terminal
 *   node tools/check-standalone.mjs
 *   node tools/check-standalone.mjs --verbose
 */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdtempSync, copyFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE = process.env.STORYBOOK_URL ?? 'http://localhost:4400';
const VERBOSE = process.argv.includes('--verbose');

const STYLES = 'libs/ui-kit/src/lib/styles';
const TOKENS = 'libs/tokens/build/css/tokens.css';
const FONT = `${STYLES}/layout/fonts/Inter-VariableFont_opsz,wght.ttf`;
const PRIMEICONS = 'node_modules/primeicons/primeicons.css';

/** component -> the story that exercises the most of it, and its root selector. */
const CASES = [
  { name: 'icon', story: 'components-icon--sizes', selector: 'baps-icon' },
  {
    name: 'indicator',
    story: 'components-indicator--status-dot',
    selector: 'baps-indicator',
  },
  {
    name: 'file-upload',
    story: 'components-fileupload--states',
    selector: 'baps-file-upload',
  },
  {
    name: 'internal-navbar',
    story: 'components-internalnavbar--default',
    selector: 'baps-internal-navbar',
  },
  // navbar imports primeng/ripple, which makes check-snippets call it a
  // wrapper — but ripple is a behaviour directive with no skin, and the
  // emitted navbar.css carries 0 `.p-` selectors. The classifier cannot see
  // that difference, so this case is what settles it by measurement.
  {
    name: 'navbar',
    story: 'components-organisms-navbar--my-bky',
    selector: 'baps-navbar',
  },
];

/**
 * The properties that constitute the design. Not "every computed property":
 * two renders of the same markup differ in things no design owns, and failing
 * on those makes the tool noise. Matches the drift guards' list plus the few
 * a layout component needs.
 */
const PROPS = [
  'display',
  'width',
  'height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-left',
  'column-gap',
  'row-gap',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-radius',
  'align-items',
  'justify-content',
  'flex-direction',
];

/** Angular's own bookkeeping, which the raw copy must not carry. */
const stripAngular = (html) =>
  html
    .replace(/\s_ngcontent-[a-z0-9-]+=""/g, '')
    .replace(/\s_nghost-[a-z0-9-]+=""/g, '')
    .replace(/\sng-reflect-[a-z0-9-]+="[^"]*"/g, '')
    .replace(/\sng-version="[^"]*"/g, '')
    .replace(/<!--(bindings|container|ng-container)[^>]*-->/g, '');

const buildPage = (blocks, widths) => {
  const dir = mkdtempSync(join(tmpdir(), 'baps-standalone-'));
  const sheets = [
    [`${STYLES}/layout/_common.scss`, 'common.css'],
    ...CASES.map((c) => [
      `${STYLES}/components/${c.name}/_${c.name}.scss`,
      `${c.name}.css`,
    ]),
  ].filter(([src]) => existsSync(src));

  for (const [src, dest] of sheets) {
    execFileSync('npx', ['sass', '--no-source-map', src, join(dir, dest)], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });
  }
  copyFileSync(TOKENS, join(dir, 'tokens.css'));
  copyFileSync(PRIMEICONS, join(dir, 'primeicons.css'));
  for (const g of [
    'primeicons.ttf',
    'primeicons.woff2',
    'primeicons.woff',
    'primeicons.eot',
    'primeicons.svg',
  ]) {
    try {
      copyFileSync(join('node_modules/primeicons', g), join(dir, g));
    } catch {
      /* primeicons ships a subset per release */
    }
  }
  const fontUrl = pathToFileURL(resolve(FONT)).href;
  const links = sheets
    .map(([, dest]) => `<link rel="stylesheet" href="./${dest}">`)
    .join('\n');

  const page = `<!doctype html>
<meta charset="utf-8">
<link rel="stylesheet" href="./tokens.css">
${links}
<link rel="stylesheet" href="./primeicons.css">
<style>
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
  button, input, textarea, select { font-feature-settings: inherit; }
  /* The third rule a consumer owns, and the one nothing documented until this
     file measured it. Every partial in the design system is written against
     border-box — Storybook's own reset supplies it, and no ui-kit partial
     does. Without it a bordered component is exactly its border wider than
     the component: internal-navbar reported four "differences" that were all
     one pixel, on the one element with a border-right, and every box inside
     it inherited the shift. Invisible on screen, and the kind of thing a
     consumer would never think to check. */
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 16px; }
  section { margin-bottom: 24px; }
</style>
${Object.entries(blocks)
  .map(
    ([
      name,
      html,
    ]) => `<section data-c="${name}" style="width:${widths[name].w}px; height:${widths[name].h}px">
${html}
</section>`,
  )
  .join('\n')}
`;
  const file = join(dir, 'raw.html');
  writeFileSync(file, page);
  return pathToFileURL(file).href;
};

/** Every element under the root, in document order, with its design properties. */
const extract = (page, selector) =>
  page.evaluate(
    ({ selector, props }) => {
      const root = document.querySelector(selector);
      if (!root) return null;
      return [root, ...root.querySelectorAll('*')].map((el) => {
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className : '',
          css: Object.fromEntries(
            props.map((k) => [k, cs.getPropertyValue(k)]),
          ),
        };
      });
    },
    { selector, props: PROPS },
  );

// ── run ─────────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const angular = {};
const markup = {};
const width = {};
for (const c of CASES) {
  await page.goto(`${BASE}/iframe.html?viewMode=story&id=${c.story}`, {
    waitUntil: 'commit',
    timeout: 120000,
  });
  await page.waitForSelector(c.selector, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  angular[c.name] = await extract(page, c.selector);
  // The width the component is given, not the width of the body it happens to
  // sit in. Without this a block-level component fills 1368px on the bare page
  // and 518px in the story's container, and every width and height below it
  // reads as a difference when nothing about the component differs.
  width[c.name] = await page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  }, c.selector);
  markup[c.name] = stripAngular(
    await page.evaluate((s) => document.querySelector(s).outerHTML, c.selector),
  );
}

await page.goto(buildPage(markup, width), {
  waitUntil: 'load',
  timeout: 60000,
});
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const raw = {};
for (const c of CASES) {
  raw[c.name] = await extract(
    page,
    `section[data-c="${c.name}"] ${c.selector}`,
  );
}
await browser.close();

// ── compare ─────────────────────────────────────────────────────────────────
const verdicts = [];
for (const c of CASES) {
  const a = angular[c.name];
  const b = raw[c.name];
  if (!a || !b) {
    verdicts.push({
      name: c.name,
      standalone: false,
      reason: 'the markup did not render on the bare page',
    });
    continue;
  }
  if (a.length !== b.length) {
    verdicts.push({
      name: c.name,
      standalone: false,
      reason: `${a.length} elements in Angular, ${b.length} on the bare page`,
    });
    continue;
  }
  const diffs = [];
  a.forEach((ang, i) => {
    for (const k of PROPS) {
      // CSS blockifies a flex item's inline-flex to flex. Whether an element
      // IS a flex item depends on what wraps it, which is the story's business
      // and not the component's, so the two sides legitimately read differently
      // for a reason that is not a design difference. Normalised rather than
      // dropped: a genuine change to `block` still fails. Same call as
      // tools/check-button-drift.mjs.
      const norm = (v) => (k === 'display' && v === 'flex' ? 'inline-flex' : v);
      if (norm(ang.css[k]) !== norm(b[i].css[k])) {
        diffs.push(
          `${ang.tag}${ang.cls ? '.' + ang.cls.split(/\s+/)[0] : ''}[${i}] ${k}: ${ang.css[k]} vs ${b[i].css[k]}`,
        );
      }
    }
  });
  verdicts.push({
    name: c.name,
    standalone: diffs.length === 0,
    elements: a.length,
    diffs,
  });
}

console.log('\ncomponent          elements  verdict');
console.log('-'.repeat(64));
for (const v of verdicts) {
  const mark = v.standalone
    ? 'STANDALONE — every property matches'
    : `NOT standalone — ${v.reason ?? v.diffs.length + ' differences'}`;
  console.log(
    v.name.padEnd(18),
    String(v.elements ?? '-').padStart(8),
    ' ',
    mark,
  );
  if (!v.standalone && v.diffs) {
    for (const d of VERBOSE ? v.diffs : v.diffs.slice(0, 6))
      console.log('      ' + d);
    if (!VERBOSE && v.diffs.length > 6)
      console.log(`      …and ${v.diffs.length - 6} more (--verbose)`);
  }
}

const proven = verdicts.filter((v) => v.standalone).map((v) => v.name);
console.log(
  `\n${proven.length} of ${CASES.length} proven standalone: ${proven.join(', ') || '(none)'}`,
);
