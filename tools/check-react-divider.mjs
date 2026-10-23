/**
 * One styled side per divider, in REACT, measured in a browser.
 *
 * The divider's line is a `::before` with a width on ONE side. The shared
 * stylesheet used to set the type with a bare `border-style`, which styles all
 * four sides — and the three without a width fall back to `medium` (3px), so a
 * dashed or dotted divider drew extra borders. Storybook could not show it:
 * the Angular divider styles itself inline and never loads this partial, so
 * only consumers of the SHIPPED stylesheet (React, and Angular apps importing
 * `@org/ui-kit/styles`) saw it. jsdom has no cascade, so a unit test would
 * pass against the broken rule.
 *
 * Same method as check-react-checkbox: render the real component with
 * react-dom/server, serve it with the real shipped stylesheets, read the
 * computed `::before` borders. Node only, no new dependencies. It starts and
 * stops its own server, so it does not need the Storybook one.
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = fileURLToPath(new URL('../', import.meta.url));
const PKG = `${REPO}packages/ui-kit-react/`;
const requireFromPkg = createRequire(`${PKG}package.json`);
const requireFromRepo = createRequire(`${REPO}package.json`);

const React = requireFromPkg('react');
const { renderToStaticMarkup } = requireFromPkg('react-dom/server');
const { chromium } = requireFromRepo('@playwright/test');

let kit;
try {
  kit = await import(pathToFileURL(`${PKG}dist/index.js`).href);
} catch {
  console.error(
    'cannot import packages/ui-kit-react/dist — run `nx run ui-kit-react:build` first.\n' +
      'This guard measures the SHIPPED output, so a stale or missing build is a\n' +
      'failure rather than something to work around.',
  );
  process.exit(1);
}

const CASES = [];
for (const brand of ['mybky', 'sampark'])
  for (const layout of ['horizontal', 'vertical'])
    for (const type of ['solid', 'dashed', 'dotted'])
      CASES.push({ id: `${brand} ${layout} ${type}`, brand, layout, type });

const page = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/kit.css"></head><body>
${CASES.map((c) => `<section data-id="${c.id}" style="display:flex;align-items:center;height:3rem;width:30rem;font:12px sans-serif"><code style="flex:none;width:12rem">${c.id}</code><div style="flex:1;display:flex;justify-content:center;height:100%">${renderToStaticMarkup(React.createElement(kit.BapsDivider, { brand: c.brand, layout: c.layout, type: c.type, style: c.layout === 'horizontal' ? { width: '100%' } : undefined }))}</div></section>`).join('\n')}
</body></html>`;

const assets = {
  '/tokens.css': [
    readFileSync(`${REPO}libs/tokens/build/css/tokens.css`, 'utf8'),
    'text/css',
  ],
  '/kit.css': [readFileSync(`${PKG}dist/styles/index.css`, 'utf8'), 'text/css'],
};

const PORT = Number(process.env.REACT_CHECK_PORT ?? 4478);
const server = createServer((req, res) => {
  const hit = assets[(req.url ?? '/').split('?')[0]];
  if (hit) res.writeHead(200, { 'content-type': hit[1] }).end(hit[0]);
  else res.writeHead(200, { 'content-type': 'text/html' }).end(page);
}).listen(PORT);

const browser = await chromium.launch();
let measured;
try {
  const tab = await (
    await browser.newContext({ viewport: { width: 800, height: 900 } })
  ).newPage();
  await tab.goto(`http://localhost:${PORT}/index.html`, {
    waitUntil: 'domcontentloaded',
  });
  await tab.waitForTimeout(800);
  // Evidence for a review: `--screenshot <file>` saves the measured page.
  const shot = process.argv.indexOf('--screenshot');
  if (shot > -1) await tab.screenshot({ path: process.argv[shot + 1], fullPage: true });
  measured = await tab.evaluate(() =>
    [...document.querySelectorAll('section[data-id]')].map((section) => {
      const css = getComputedStyle(section.querySelector('.p-divider'), '::before');
      const sides = {};
      const widths = {};
      for (const side of ['top', 'right', 'bottom', 'left']) {
        sides[side] = css.getPropertyValue(`border-${side}-style`);
        widths[side] = parseFloat(css.getPropertyValue(`border-${side}-width`));
      }
      // The line is only drawn if the pseudo-element spans something.
      const span = Math.max(parseFloat(css.width) || 0, parseFloat(css.height) || 0);
      return { id: section.dataset.id, sides, widths, span };
    }),
  );
} finally {
  await browser.close();
  server.close();
}

let failed = 0;
for (const expected of CASES) {
  const { sides, widths, span } = measured.find((m) => m.id === expected.id);
  // Physical sides: block-start is top and inline-start is left in LTR.
  const lineSide = expected.layout === 'vertical' ? 'left' : 'top';
  const extra = Object.keys(sides).filter(
    (side) => side !== lineSide && sides[side] !== 'none',
  );
  const drawn = widths[lineSide] > 0 && span > 8;
  const ok = sides[lineSide] === expected.type && extra.length === 0 && drawn;
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'ok  ' : 'FAIL'}  ${expected.id.padEnd(26)} ${lineSide}=${sides[lineSide]} ${widths[lineSide]}px over ${Math.round(span)}px (expected ${expected.type})` +
      (extra.length ? `  extra: ${extra.map((s) => `${s}=${sides[s]}`).join(' ')}` : ''),
  );
}

if (failed) {
  console.error(`\n${failed} divider(s) wrong — the shipped CSS styles the wrong sides.`);
  process.exit(1);
}
console.log('\nReact divider: one styled side per layout, in both brands');
