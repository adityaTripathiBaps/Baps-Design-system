/**
 * Dark-mode contrast guard for both presets.
 *
 * Resolves the PrimeNG theme the way the browser would — Material + MyBKY /
 * Sampark, every component token, `var()` chains and `color-mix()` included —
 * and measures WCAG 2.2 ratios on the pairs that carry meaning: control
 * boundaries, field text, selection, table separation, message severities.
 *
 * No browser and no Storybook: the presets are TypeScript, so they are
 * transpiled to ESM in a temp dir and imported. Runs in about a second, which
 * is why it can sit in CI in front of the Playwright baselines rather than
 * behind them.
 *
 *   node tools/check-dark-contrast.mjs            # table + exit code
 *   node tools/check-dark-contrast.mjs --light    # also show the light column
 *
 * Exit code 1 on any failing check that is not in ACCEPTED below. ACCEPTED is
 * not a mute button: every entry names the reason and what would close it.
 */
import ts from 'typescript';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DARK = '.baps-dark';
const REPO = resolve(import.meta.dirname, '..');
const STYLED = resolve(REPO, 'node_modules/.pnpm/@primeuix+styled@0.7.4/node_modules/@primeuix/styled/dist/index.mjs');

/**
 * Checks that are known to fail and are NOT bugs to fix here.
 *
 * Keyed by check id. Anything else that fails is a regression.
 */
const ACCEPTED = {
  // `disabledOpacity` is 0.38 from Material and is NOT scheme-scoped, so the
  // same token drives light (1.70:1) and dark (1.99:1). Raising it is a light
  // change and moves every visual baseline — see dark.scheme.ts.
  'F1 disabled field text': 'disabledOpacity is scheme-agnostic; light pass owns it',
  // The brand's own "border/divider" step, documented at ~1.7:1 as decorative.
  // WCAG 1.4.11 covers control boundaries, which use {surface.500} instead.
  'D2 content border': 'decorative divider by design (tokens: dark/border/divider)',
  'D2b datatable cell border': 'decorative divider by design',
  // No tint reaches 3:1 on a near-black ground without becoming a solid wash.
  // The 3:1 state cue is the 3px accent bar in
  // styles/components/selection/_selection-dark.scss; the tint is the soft half
  // of that pair, raised from Material's 16% to 40%.
  'F6 highlight block': 'state cue is the accent bar in _selection-dark.scss, not the tint',
  // MyBKY's dark avatar fill is blue-900 by design; an avatar is decorative,
  // not an interactive boundary. Its own label contrast is what matters.
  'D11 avatar': 'decorative chip fill, not a control boundary',
  // Sampark deliberately puts table rows on the RAISED surface in dark; the
  // header then matches the body. See the note in sampark.theme.ts.
  'D3 table header vs body': 'Sampark inverts the dark row ladder by design',
};

// ---------------------------------------------------------------- transpile
const OUT = mkdtempSync(join(tmpdir(), 'dark-contrast-'));
const SOURCES = {
  'tokens.mjs': 'libs/tokens/src/generated/tokens.ts',
  'dark.scheme.mjs': 'libs/ui-kit/src/lib/theme/dark.scheme.ts',
  'baps.theme.mjs': 'libs/ui-kit/src/lib/theme/baps.theme.ts',
  'sampark.theme.mjs': 'libs/ui-kit/src/lib/theme/sampark.theme.ts',
};
for (const [out, src] of Object.entries(SOURCES)) {
  const js = ts
    .transpileModule(readFileSync(resolve(REPO, src), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, isolatedModules: true },
    })
    .outputText // the workspace's path aliases and bare specifiers mean nothing
    // to a temp dir, so every import is rewritten to an absolute file URL.
    .replace(/from ['"]@primeuix\/themes['"]/g, `from '${pathToFileURL(resolve(REPO, 'node_modules/@primeuix/themes/dist/index.mjs'))}'`)
    .replace(/from ['"]@primeuix\/themes\/(\w+)['"]/g, (_m, p) => `from '${pathToFileURL(resolve(REPO, `node_modules/@primeuix/themes/dist/${p}/index.mjs`))}'`)
    .replace(/from ['"]@org\/tokens\/generated\/tokens['"]/g, `from './tokens.mjs'`)
    .replace(/from ['"]\.\/(baps|sampark)\.theme['"]/g, `from './$1.theme.mjs'`)
    .replace(/from ['"]\.\/dark\.scheme['"]/g, `from './dark.scheme.mjs'`);
  writeFileSync(join(OUT, out), js);
}
const { Theme } = await import(pathToFileURL(STYLED));
const { MyBky } = await import(pathToFileURL(join(OUT, 'baps.theme.mjs')));
const { Sampark } = await import(pathToFileURL(join(OUT, 'sampark.theme.mjs')));

// ------------------------------------------------------------------ resolve
/** Every emitted custom property, split by the scheme that declares it. */
function collect(preset) {
  Theme.setTheme({ preset, options: { prefix: 'p', darkModeSelector: DARK, cssLayer: false } });
  const chunks = [];
  for (const part of Object.values(Theme.getCommon())) if (part?.css) chunks.push(part.css);
  for (const name of Object.keys(Theme.getPreset().components ?? {})) {
    const c = Theme.getComponent(name);
    if (c?.css) chunks.push(c.css);
  }
  const light = new Map();
  const dark = new Map();
  for (const block of chunks.join('\n').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const target = block[1].includes(DARK) ? dark : light;
    for (const decl of block[2].split(';')) {
      const i = decl.indexOf(':');
      if (i < 0) continue;
      const key = decl.slice(0, i).trim();
      if (key.startsWith('--')) target.set(key, decl.slice(i + 1).trim());
    }
  }
  return { light, dark };
}

const resolveVar = (name, maps, depth = 0) => {
  if (depth > 12) return undefined;
  const v = maps.dark.has(name) ? maps.dark.get(name) : maps.light.get(name);
  return v?.replace(/var\(([^),]+)(?:,[^)]*)?\)/g, (_m, ref) => resolveVar(ref.trim(), maps, depth + 1) ?? '');
};

// -------------------------------------------------------------- colour math
function parseColor(c) {
  if (!c) return null;
  const s = c.trim();
  let m = /^#([0-9a-fA-F]{3,8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = [...h].map((x) => x + x).join('');
    if (h.length === 6) h += 'ff';
    if (h.length !== 8) return null;
    const n = [0, 2, 4, 6].map((i) => parseInt(h.slice(i, i + 2), 16));
    return [n[0], n[1], n[2], n[3] / 255];
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return p.length >= 3 && !p.some(Number.isNaN) ? [p[0], p[1], p[2], p[3] ?? 1] : null;
  }
  m = /^color-mix\(\s*in\s+srgb\s*,(.+)\)$/i.exec(s);
  if (m) {
    const parts = m[1].split(',').map((x) => x.trim());
    if (parts.length !== 2) return null;
    const side = (x) => {
      const pm = /\s(\d+(?:\.\d+)?)%$/.exec(x);
      const raw = pm ? x.slice(0, pm.index).trim() : x;
      return { col: raw === 'transparent' ? [0, 0, 0, 0] : parseColor(raw), pct: pm ? Number(pm[1]) : null };
    };
    const a = side(parts[0]);
    const b = side(parts[1]);
    if (!a.col || !b.col) return null;
    const pa = a.pct ?? (b.pct == null ? 50 : 100 - b.pct);
    const pb = b.pct ?? 100 - pa;
    const wa = pa / (pa + pb);
    const wb = pb / (pa + pb);
    const alpha = a.col[3] * wa + b.col[3] * wb;
    if (!alpha) return [0, 0, 0, 0];
    const ch = (i) => (a.col[i] * a.col[3] * wa + b.col[i] * b.col[3] * wb) / alpha;
    return [ch(0), ch(1), ch(2), alpha];
  }
  return null;
}

const over = (fg, bg) =>
  fg[3] >= 1 ? fg : [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const luminance = (c) => {
  const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function measure(fgVar, bgVar, maps, opacity = 1) {
  const bgRaw = parseColor(resolveVar(bgVar, maps));
  const fgRaw = parseColor(resolveVar(fgVar, maps));
  if (!bgRaw || !fgRaw) return null;
  // A translucent token lands on the page surface of its OWN scheme, never on
  // black — otherwise a light-mode tint is measured on a ground it never sits on.
  const page = parseColor(resolveVar('--p-content-background', maps)) ?? [255, 255, 255, 1];
  const bg = over(bgRaw, over(page, [255, 255, 255, 1]));
  const fg = opacity < 1 ? [fgRaw[0], fgRaw[1], fgRaw[2], fgRaw[3] * opacity] : fgRaw;
  return { r: ratio(over(fg, bg), bg), fg: resolveVar(fgVar, maps), bg: resolveVar(bgVar, maps) };
}

// ------------------------------------------------------------------- checks
const PAGE = '--p-content-background';
const checks = (maps) => [
  ['F1 disabled field text', '--p-form-field-disabled-color', '--p-form-field-disabled-background', 4.5, Number(resolveVar('--p-disabled-opacity', maps)) || 1],
  ['F2 field border', '--p-form-field-border-color', '--p-form-field-background', 3],
  ['F2b field text', '--p-form-field-color', '--p-form-field-background', 4.5],
  ['F3 placeholder', '--p-form-field-placeholder-color', '--p-form-field-background', 4.5],
  ['F5 field icon', '--p-form-field-icon-color', '--p-form-field-background', 4.5],
  ['F6 highlight block', '--p-highlight-background', PAGE, 3],
  ['F6b highlight text', '--p-highlight-color', '--p-highlight-background', 4.5],
  ['D2 content border', '--p-content-border-color', PAGE, 3],
  ['D2b datatable cell border', '--p-datatable-body-cell-border-color', PAGE, 3],
  ['D3 table header vs body', '--p-datatable-header-cell-background', '--p-datatable-row-background', 1.1],
  ['D4 row hover vs body', '--p-datatable-row-hover-background', '--p-datatable-row-background', 1.1],
  ['muted text', '--p-text-muted-color', PAGE, 4.5],
  ['body text', '--p-text-color', PAGE, 4.5],
  ['overlay vs page', '--p-overlay-popover-background', PAGE, 1.1],
  ['D5 message info', '--p-message-info-color', '--p-message-info-background', 4.5],
  ['D6 message error', '--p-message-error-color', '--p-message-error-background', 4.5],
  ['D7 message secondary', '--p-message-secondary-color', '--p-message-secondary-background', 4.5],
  ['message success', '--p-message-success-color', '--p-message-success-background', 4.5],
  ['message warn', '--p-message-warn-color', '--p-message-warn-background', 4.5],
  ['D9 tooltip text', '--p-tooltip-color', '--p-tooltip-background', 4.5],
  ['D10 breadcrumb sep', '--p-breadcrumb-separator-color', PAGE, 4.5],
  ['D11 avatar', '--p-avatar-background', PAGE, 3],
  ['button primary label', '--p-button-primary-color', '--p-button-primary-background', 4.5],
  ['button secondary label', '--p-button-secondary-color', '--p-button-secondary-background', 4.5],
];

const showLight = process.argv.includes('--light');
let failed = 0;

for (const [label, preset] of [['MyBKY', MyBky], ['Sampark', Sampark]]) {
  const { light, dark } = collect(preset);
  const darkMaps = { light, dark };
  const lightMaps = { light, dark: new Map() };
  console.log(`\n=== ${label} (dark) ===`);
  for (const [id, fg, bg, need, opacity = 1] of checks(darkMaps)) {
    const d = measure(fg, bg, darkMaps, opacity);
    if (!d) {
      console.log(`${id.padEnd(28)}   n/a          (token not resolvable — check the name)`);
      continue;
    }
    const bad = d.r < need;
    const accepted = ACCEPTED[id];
    if (bad && !accepted) failed++;
    const state = bad ? (accepted ? 'known' : 'FAIL ') : '     ';
    const lightCol = showLight ? String(measure(fg, bg, lightMaps, opacity)?.r.toFixed(2) ?? '-').padStart(8) : '';
    console.log(`${id.padEnd(28)}${d.r.toFixed(2).padStart(7)}${lightCol}  need ${String(need).padStart(4)}  ${state} ${bad && accepted ? '— ' + accepted : ''}`);
  }
}

console.log(
  failed
    ? `\n${failed} contrast check(s) regressed. Fix the token, or add it to ACCEPTED with a reason.`
    : '\nAll dark contrast checks pass (or are accepted with a stated reason).'
);
process.exit(failed ? 1 : 0);
