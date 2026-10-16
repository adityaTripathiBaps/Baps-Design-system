/**
 * Exactly one glyph per checkbox state, in REACT, measured in a browser.
 *
 * This guard exists because of a specific failure. The Angular checkbox tick
 * had stopped rendering (PrimeNG 21 renamed the icon class), and the fix —
 * "show the glyph whenever one is present" — is correct for Angular, where
 * PrimeNG renders exactly one. React renders BOTH glyphs and expects CSS to
 * pick, so the same stylesheet started showing a tick and a minus stacked.
 *
 * Nothing caught it: 765 Angular tests, 165 React tests, 11 browser guards and
 * the visual suite were all green, because the React package has no Storybook
 * and its tests run in jsdom, which has no cascade. A CSS assertion in jsdom
 * passes against a broken stylesheet and proves nothing.
 *
 * So this renders the real component with react-dom/server, serves it with the
 * real shipped stylesheets — tokens first, then the kit, the order the
 * consumer guide specifies — and counts glyphs that are actually visible.
 *
 * Node only, no new dependencies. It starts and stops its own server, so it
 * does not need the Storybook one.
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

/** readOnly, because a controlled input without onChange warns and tells us nothing. */
const CASES = [
  {
    state: 'unchecked',
    props: { checked: false, readOnly: true },
    glyphs: 0,
    glyph: null,
  },
  {
    state: 'checked',
    props: { checked: true, readOnly: true },
    glyphs: 1,
    glyph: 'p-checkbox-icon-check',
  },
  {
    state: 'indeterminate',
    props: { indeterminate: true, readOnly: true },
    glyphs: 1,
    glyph: 'p-checkbox-icon-minus',
  },
];

const page = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/kit.css"></head><body>
${CASES.map((c) => `<section data-state="${c.state}">${renderToStaticMarkup(React.createElement(kit.BapsCheckbox, c.props))}</section>`).join('\n')}
</body></html>`;

const assets = {
  '/tokens.css': [
    readFileSync(`${REPO}libs/tokens/build/css/tokens.css`, 'utf8'),
    'text/css',
  ],
  '/kit.css': [readFileSync(`${PKG}dist/styles/index.css`, 'utf8'), 'text/css'],
};

const PORT = Number(process.env.REACT_CHECK_PORT ?? 4477);
const server = createServer((req, res) => {
  const hit = assets[(req.url ?? '/').split('?')[0]];
  if (hit) res.writeHead(200, { 'content-type': hit[1] }).end(hit[0]);
  else res.writeHead(200, { 'content-type': 'text/html' }).end(page);
}).listen(PORT);

const browser = await chromium.launch();
let measured;
try {
  const tab = await (
    await browser.newContext({ viewport: { width: 800, height: 600 } })
  ).newPage();
  await tab.goto(`http://localhost:${PORT}/index.html`, {
    waitUntil: 'domcontentloaded',
  });
  await tab.waitForTimeout(800);
  measured = await tab.evaluate(() =>
    [...document.querySelectorAll('section[data-state]')].map((section) => {
      const visible = [...section.querySelectorAll('.p-checkbox-icon')].filter(
        (icon) => {
          const style = getComputedStyle(icon);
          const box = icon.getBoundingClientRect();
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            box.width > 0 &&
            box.height > 0
          );
        },
      );
      return {
        state: section.dataset.state,
        visible: visible.length,
        glyph:
          (visible[0]?.getAttribute('class') ?? '')
            .split(' ')
            .find((c) => c.startsWith('p-checkbox-icon-')) ?? null,
      };
    }),
  );
} finally {
  await browser.close();
  server.close();
}

let failed = 0;
for (const expected of CASES) {
  const got = measured.find((m) => m.state === expected.state);
  const ok =
    got.visible === expected.glyphs &&
    (expected.glyph === null || got.glyph === expected.glyph);
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'ok  ' : 'FAIL'}  ${expected.state.padEnd(14)} visible=${got.visible} (expected ${expected.glyphs})` +
      (expected.glyph
        ? `  glyph=${got.glyph ?? 'none'} (expected ${expected.glyph})`
        : ''),
  );
}

if (failed) {
  console.error(
    `\n${failed} state(s) wrong — React shows the wrong number of glyphs.`,
  );
  process.exit(1);
}
console.log('\nReact checkbox: exactly one glyph per state');
