/**
 * Toggle switch's Custom tab is AUTHORED, so it can drift. This is the guard.
 *
 * It needed a standalone partial written before it could exist at all. The
 * file that was already there — styles/components/toggle-switch/_switch.scss —
 * is the Angular-side skin: every selector reads
 * `baps-toggleswitch … .p-toggleswitch`, so it styles the DOM PrimeNG renders
 * and can never reach markup written by hand. _toggle-switch-standalone.scss
 * is the other half, and this renders both and compares them.
 *
 *   npx nx run storybook-host:storybook --port=4400   # in another terminal
 *   node tools/check-toggle-switch-drift.mjs
 *   node tools/check-toggle-switch-drift.mjs --verbose
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

const SNIPPETS =
  'libs/ui-kit/src/lib/components/toggle-switch/toggle-switch.snippets.ts';
const STYLES = 'libs/ui-kit/src/lib/styles';
const PARTIAL = `${STYLES}/components/toggle-switch/_toggle-switch-standalone.scss`;
const COMMON = `${STYLES}/layout/_common.scss`;
const TOKENS = 'libs/tokens/build/css/tokens.css';
const FONT = `${STYLES}/layout/fonts/Inter-VariableFont_opsz,wght.ttf`;

const STORIES = {
  States: 'components-toggleswitch--states',
  SamparkStates: 'components-toggleswitch--sampark-states',
};

/**
 * A switch is two boxes: the track, and the thumb riding in it. Both are
 * compared, because getting the track right and the thumb's travel wrong is
 * exactly the kind of error that looks fine in one state and broken in the
 * other.
 */
const PROPS = ['width', 'height', 'background-color', 'border-radius'];

/* The Angular side draws the track on .p-toggleswitch-slider and the thumb on
   the element PrimeNG marks as the handle; the raw side uses the two BEM
   parts. Named here rather than inline so the asymmetry is visible. */
const NG = { track: '.p-toggleswitch-slider', thumb: '.p-toggleswitch-handle' };
const RAW = {
  track: '.baps-toggle-switch__track',
  thumb: '.baps-toggle-switch__thumb',
};

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

/* The snippets file builds its markup with a template helper, so the string
   read out of it still carries the interpolations. Evaluating the file is not
   an option here (it is TypeScript, and this is a plain .mjs with no build
   step), so the helper is applied the same way the file does. */
const expand = (html) =>
  html.replace(/\$\{sw\([^)]*\)\}/g, (m) => {
    const label = /'([^']*)'/.exec(m)?.[1] ?? '';
    const on = /on:\s*true/.test(m);
    const disabled = /disabled:\s*true/.test(m);
    const sampark = /sampark:\s*true/.test(m);
    const cls = ['baps-toggle-switch', sampark ? 'baps-sampark' : null]
      .filter(Boolean)
      .join(' ');
    const attrs = [
      'type="checkbox"',
      'role="switch"',
      'class="baps-toggle-switch__input"',
    ]
      .concat(on ? ['checked'] : [])
      .concat(disabled ? ['disabled'] : [])
      .join(' ');
    return `<label><span>${label}</span><span class="${cls}"><input ${attrs} /><span class="baps-toggle-switch__track" aria-hidden="true"><span class="baps-toggle-switch__thumb"></span></span></span></label>`;
  });

const extract = (page, root, parts) =>
  page.evaluate(
    ({ root, parts, props }) =>
      [...document.querySelectorAll(root)].map((el) => {
        const read = (sel) => {
          const n = el.querySelector(sel) ?? (el.matches(sel) ? el : null);
          if (!n) return null;
          const cs = getComputedStyle(n);
          const r = n.getBoundingClientRect();
          return {
            ...Object.fromEntries(
              props.map((k) => [k, cs.getPropertyValue(k)]),
            ),
            w: Math.round(r.width * 100) / 100,
            h: Math.round(r.height * 100) / 100,
            x: Math.round(r.left * 100) / 100,
          };
        };
        return { track: read(parts.track), thumb: read(parts.thumb) };
      }),
    { root, parts, props: PROPS },
  );

const buildRawPage = (blocks) => {
  const dir = mkdtempSync(join(tmpdir(), 'baps-switch-drift-'));
  for (const [src, dest] of [
    [PARTIAL, 'switch.css'],
    [COMMON, 'common.css'],
  ]) {
    execFileSync('npx', ['sass', '--no-source-map', src, join(dir, dest)], {
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });
  }
  copyFileSync(TOKENS, join(dir, 'tokens.css'));
  const fontUrl = pathToFileURL(resolve(FONT)).href;

  const sections = Object.entries(blocks)
    .map(
      ([name, html]) =>
        `<section data-story="${name}">\n${expand(html)}\n</section>`,
    )
    .join('\n');

  const page = `<!doctype html>
<meta charset="utf-8">
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./common.css">
<link rel="stylesheet" href="./switch.css">
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
  }
  body { margin: 16px; }
  section { margin-bottom: 24px; }
</style>
${sections}
`;
  const file = join(dir, 'raw.html');
  writeFileSync(file, page);
  return pathToFileURL(file).href;
};

// ── run ─────────────────────────────────────────────────────────────────────
const blocks = readCustomBlocks();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const angular = {};
for (const [name, id] of Object.entries(STORIES)) {
  await page.goto(`${BASE}/iframe.html?viewMode=story&id=${id}`, {
    waitUntil: 'commit',
    timeout: 120000,
  });
  await page.waitForSelector('baps-toggleswitch', { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  angular[name] = await extract(page, 'baps-toggleswitch', NG);
}

await page.goto(buildRawPage(blocks), { waitUntil: 'load', timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const raw = {};
for (const name of Object.keys(STORIES)) {
  raw[name] = await extract(
    page,
    `section[data-story="${name}"] .baps-toggle-switch`,
    RAW,
  );
}
await browser.close();

// ── diff ────────────────────────────────────────────────────────────────────
let checked = 0;
const failures = [];

for (const name of Object.keys(STORIES)) {
  const a = angular[name];
  const b = raw[name];
  if (a.length !== b.length) {
    failures.push(
      `${name}: Angular renders ${a.length} switches, the Custom tab markup ${b.length}`,
    );
    continue;
  }
  a.forEach((ang, i) => {
    for (const part of ['track', 'thumb']) {
      if (!ang[part] || !b[i][part]) {
        failures.push(
          `${name}[${i}] ${part}: missing on ${!ang[part] ? 'the Angular' : 'the raw'} side`,
        );
        continue;
      }
      for (const k of [...PROPS, 'w', 'h']) {
        checked++;
        const av = ang[part][k];
        const bv = b[i][part][k];
        const near = typeof av === 'number' && Math.abs(av - bv) <= 0.5;
        if (av !== bv && !near) {
          failures.push(
            `${name}[${i}] ${part} ${k}\n      angular: ${av}\n      custom : ${bv}`,
          );
        }
      }
      if (VERBOSE)
        console.log(`${name}[${i}] ${part}`, JSON.stringify(ang[part]));
    }
  });
}

const n = Object.values(angular).reduce((t, v) => t + v.length, 0);
console.log(
  `\nchecked ${checked} properties across ${n} switches in ${Object.keys(STORIES).length} stories`,
);

if (failures.length) {
  console.error(
    `\n${failures.length} drift(s) between the Angular component and the Custom tab:\n`,
  );
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    `\nFix ${PARTIAL} (or the markup in ${SNIPPETS}) so both render the same.`,
  );
  process.exit(1);
}

console.log(
  'toggle switch drift OK — the Custom tab renders identically to the component',
);
