#!/usr/bin/env node
/**
 * Foundations audit — writes the snapshot the Foundations/Audit/Overview page renders.
 *
 * Static parse, like check-inventory.mjs: no browser, no build. It reads the
 * token build output and the library's SCSS/TS and answers, per foundation,
 * "is this consumed through tokens, and where not?".
 *
 *   node tools/audit-foundations.mjs           rewrite the snapshot
 *   node tools/audit-foundations.mjs --check   exit 1 if any check is an Error
 *
 * Statuses: passed · warning · error · deprecated. A warning is debt that
 * renders correctly today (a literal that happens to match its token); an error
 * is something that renders wrong or not at all (a var() nothing defines, body
 * text under 4.5:1).
 *
 * ponytail: the literal scans are regexes over comment-stripped SCSS, not a CSS
 * parser. Good enough to rank files by debt; if a count is ever disputed, move
 * to postcss (already in node_modules via the Angular builder).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const LIB = 'libs/ui-kit/src/lib';
const OUT = 'libs/ui-kit/src/lib/foundations/audit/audit.snapshot.json';
const MAX_DETAILS = 25;

const walk = (dir, test) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p, test) : test(p) ? [p] : [];
  });

const rel = (p) => relative(ROOT, p).replaceAll('\\', '/');
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, '$1');

/* Removes every var(...) with its fallback, parens balanced — a fallback such as
   rgba(0, 0, 0, 0.1) is a planned-for-absence default, not a literal. What is
   left is the part of a declaration that is NOT a token reference. */
const stripVars = (s) => {
  let out = '';
  for (let i = 0; i < s.length; ) {
    if (s.startsWith('var(', i)) {
      let depth = 0;
      let j = i + 3;
      for (; j < s.length; j++) {
        if (s[j] === '(') depth++;
        else if (s[j] === ')' && --depth === 0) break;
      }
      out += 'VAR';
      i = j + 1;
    } else out += s[i++];
  }
  return s === out ? s : out;
};

const scss = walk(LIB, (p) => p.endsWith('.scss'));
const componentTs = walk(`${LIB}/components`, (p) => /\.component\.ts$/.test(p));

const flat = JSON.parse(readFileSync('libs/tokens/build/json/tokens.flat.json', 'utf8'));
const tokenCss = readFileSync('libs/tokens/build/css/tokens.css', 'utf8');
const cssVar = (path) => '--' + path.join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/* ── declaration scanner ────────────────────────────────────────────────── */
const scan = (files, propRe, valueRe, skip = () => false) => {
  const hits = [];
  for (const f of files) {
    const lines = stripComments(readFileSync(f, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      const m = line.match(new RegExp(`(?:^|[;{\\s])(${propRe.source})\\s*:\\s*([^;{}]+)`));
      if (!m) return;
      const value = stripVars(m[2]);
      if (valueRe.test(value) && !skip(value)) hits.push({ file: rel(f), line: i + 1, text: line.trim().slice(0, 140) });
    });
  }
  return hits;
};

const byFile = (hits) => {
  const c = {};
  for (const h of hits) c[h.file] = (c[h.file] ?? 0) + 1;
  return Object.entries(c)
    .sort((a, b) => b[1] - a[1])
    .map(([file, count]) => ({ file, count }));
};

const literalCheck = (id, title, area, hits, advice) => ({
  id,
  title,
  area,
  status: hits.length ? 'warning' : 'passed',
  count: hits.length,
  summary: hits.length
    ? `${hits.length} declaration${hits.length === 1 ? '' : 's'} across ${byFile(hits).length} file(s) use a literal instead of a token. ${advice}`
    : 'Every declaration resolves through a token.',
  files: byFile(hits).slice(0, MAX_DETAILS),
  details: hits.slice(0, MAX_DETAILS),
});

const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\((?!from)/i;
const NON_ZERO_LENGTH = /(?:^|[\s(,])-?(?:\d*\.)?\d+(?:px|rem|em)\b/;

const checks = [];

/* 1. Token usage — informational: how much of the styling is token-driven. */
{
  let refs = 0;
  const used = new Set();
  for (const f of [...scss, ...componentTs]) {
    for (const m of readFileSync(f, 'utf8').matchAll(/var\((--[\w-]+)/g)) {
      refs++;
      used.add(m[1]);
    }
  }
  const defined = flat.map((t) => cssVar(t.path));
  const consumed = defined.filter((v) => used.has(v));
  checks.push({
    id: 'token-usage',
    title: 'Token usage',
    area: 'Tokens',
    status: 'passed',
    count: consumed.length,
    summary: `${refs} var() references in ${scss.length} SCSS partials and ${componentTs.length} components. ${consumed.length} of ${defined.length} design tokens are referenced directly; the rest reach components through the PrimeNG presets or as the reference of another token.`,
    files: [],
    details: [],
  });
}

/* 2–6. Literals where a token exists. */
checks.push(
  literalCheck(
    'hardcoded-colors',
    'Hard-coded colours',
    'Colour',
    scan(scss, /color|background(?:-color)?|border(?:-[a-z]+)?-color|border|outline(?:-color)?|fill|stroke|--[\w-]+/, COLOR_LITERAL),
    'Replace with the semantic token, or the primitive if no semantic exists yet.',
  ),
  literalCheck(
    'typography',
    'Typography consistency',
    'Typography',
    scan(scss, /font-size|font-weight|line-height|letter-spacing/, /(?:^|\s)(?:\d*\.)?\d+(?:px|rem|em)?\b/, (v) => /^\s*(?:0|1|normal|inherit|VAR)\s*(?:!important)?\s*$/.test(v)),
    'Use --font-size-*, --font-weight-*, --font-line-height-*.',
  ),
  literalCheck(
    'spacing',
    'Spacing consistency',
    'Spacing',
    scan(scss, /padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|gap|row-gap|column-gap/, NON_ZERO_LENGTH, (v) => /^\s*-?1px\s*$/.test(v)),
    'Use the --space-* scale (4px base).',
  ),
  literalCheck(
    'radius',
    'Border radius consistency',
    'Borders & Radius',
    scan(scss, /border(?:-[a-z]+)*-radius/, NON_ZERO_LENGTH),
    'Use --radius-{brand}-* or the component radius token.',
  ),
  literalCheck(
    'shadows',
    'Shadow usage',
    'Shadows',
    scan(scss, /box-shadow/, /\d/, (v) => /^\s*(?:none|VAR(?:\s*,\s*VAR)*)\s*(?:!important)?\s*$/.test(v)),
    'Use --shadow-{brand}-*. Focus rings built from a token colour count here too.',
  ),
);

/* 7. Icons — PrimeIcons classes next to the BAPS icon set. */
{
  const hits = [];
  for (const f of componentTs) {
    stripComments(readFileSync(f, 'utf8'))
      .split('\n')
      .forEach((line, i) => {
        if (/['"`\s]pi pi-[\w-]+/.test(line)) hits.push({ file: rel(f), line: i + 1, text: line.trim().slice(0, 140) });
      });
  }
  checks.push({
    id: 'icons',
    title: 'Icon usage',
    area: 'Icons',
    status: hits.length ? 'warning' : 'passed',
    count: hits.length,
    summary: hits.length
      ? `${hits.length} PrimeIcons class reference(s) in components. Product icons should be <baps-icon>; PrimeIcons stays only where PrimeNG draws its own chrome.`
      : 'Components draw icons through <baps-icon> only.',
    files: byFile(hits),
    details: hits.slice(0, MAX_DETAILS),
  });
}

/* 8. Accessibility — text roles against the card surface, per brand and mode. */
{
  const hex = (name) => flat.find((t) => t.path.join('.') === name)?.value;
  const lum = (h) => {
    const n = h.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
    const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const rows = [];
  for (const brand of ['mybky', 'sampark']) {
    for (const mode of ['', 'dark.']) {
      const bg = hex(`color.${brand}.${mode}surface.card`);
      for (const role of ['primary', 'secondary', 'muted', 'disabled']) {
        const fg = hex(`color.${brand}.${mode}text.${role}`);
        if (![fg, bg].every((v) => /^#[0-9a-f]{6}$/i.test(v ?? ''))) continue;
        const r = ratio(fg, bg);
        // Disabled text is exempt from 1.4.3; muted is body-adjacent and held to it.
        const status = role === 'disabled' ? 'passed' : r >= 4.5 ? 'passed' : role === 'muted' ? 'warning' : 'error';
        rows.push({ file: `${brand} ${mode ? 'dark' : 'light'}`, line: 0, text: `text.${role} ${fg} on surface.card ${bg} — ${r.toFixed(2)}:1`, status });
      }
    }
  }
  const worst = rows.some((r) => r.status === 'error') ? 'error' : rows.some((r) => r.status === 'warning') ? 'warning' : 'passed';
  checks.push({
    id: 'contrast',
    title: 'Accessibility — text contrast',
    area: 'Colour',
    status: worst,
    count: rows.filter((r) => r.status !== 'passed').length,
    summary: `Semantic text roles measured against the card surface, both brands, light and dark. WCAG 1.4.3 needs 4.5:1; disabled text is exempt. Components themselves are covered by tools/a11y-audit.mjs.`,
    files: [],
    details: rows,
  });
}

/* 9. Theme compatibility — every light semantic role has a dark counterpart. */
{
  const has = new Set(flat.map((t) => t.path.join('.')));
  const missing = [];
  for (const t of flat) {
    const [c, brand, role, ...rest] = t.path;
    if (c !== 'color' || !['text', 'surface'].includes(role)) continue;
    const dark = ['color', brand, 'dark', role, ...rest].join('.');
    if (!has.has(dark)) missing.push({ file: brand, line: 0, text: `${t.path.join('.')} has no ${dark}` });
  }
  checks.push({
    id: 'theme',
    title: 'Theme compatibility',
    area: 'Tokens',
    status: missing.length ? 'warning' : 'passed',
    count: missing.length,
    summary: missing.length
      ? `${missing.length} light text/surface role(s) have no dark-mode counterpart. A component using one keeps its light value under .baps-dark.`
      : 'Every light text and surface role has a dark counterpart in both brands.',
    files: [],
    details: missing.slice(0, MAX_DETAILS),
  });
}

/* 10. Deprecated and not-yet-shipped tokens. */
{
  const dep = flat.filter((t) => /deprecat/i.test(t.comment ?? ''));
  const target = flat.filter((t) => /^target\b/i.test(t.comment ?? ''));
  checks.push({
    id: 'deprecated',
    title: 'Deprecated tokens',
    area: 'Tokens',
    status: dep.length ? 'deprecated' : 'passed',
    count: dep.length,
    summary: dep.length ? `${dep.length} token(s) marked deprecated in their source comment.` : 'No token is marked deprecated.',
    files: [],
    details: dep.map((t) => ({ file: cssVar(t.path), line: 0, text: t.comment })),
  });
  checks.push({
    id: 'target',
    title: 'Target tokens (spec, not yet adopted)',
    area: 'Tokens',
    status: target.length ? 'warning' : 'passed',
    count: target.length,
    summary: `${target.length} token(s) carry a "target" comment: they encode the design-language spec and exist so new work can adopt them, but existing components still use the legacy values.`,
    files: [],
    details: target.map((t) => ({ file: cssVar(t.path), line: 0, text: (t.comment ?? '').slice(0, 140) })),
  });
}

/* 11. Missing token references — a var() that nothing defines. */
{
  const defined = new Set([...tokenCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const sources = [...scss, ...componentTs, ...walk(LIB, (p) => /\.ts$/.test(p) && !/\.(stories|spec)\.ts$/.test(p))];
  for (const f of new Set(sources)) for (const m of readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
  // Also anything set from TypeScript: host bindings ('[style.--x]') and setProperty('--x').
  for (const f of new Set(sources)) for (const m of readFileSync(f, 'utf8').matchAll(/['"`.](--[\w-]+)/g)) defined.add(m[1]);
  const hits = [];
  for (const f of [...scss, ...componentTs]) {
    stripComments(readFileSync(f, 'utf8'))
      .split('\n')
      .forEach((line, i) => {
        for (const m of line.matchAll(/var\((--[\w-]+)\s*(,)?/g)) {
          const name = m[1];
          // --p-* is PrimeNG's generated theme; a fallback means the author planned for absence.
          if (name.startsWith('--p-') || m[2] || defined.has(name)) continue;
          hits.push({ file: rel(f), line: i + 1, text: `${name} — ${line.trim().slice(0, 110)}` });
        }
      });
  }
  checks.push({
    id: 'missing-refs',
    title: 'Missing token references',
    area: 'Tokens',
    status: hits.length ? 'error' : 'passed',
    count: hits.length,
    summary: hits.length
      ? `${hits.length} var() reference(s) with no fallback point at a custom property nothing in tokens.css or the library defines. The declaration is dropped at runtime.`
      : 'Every var() without a fallback resolves to a defined custom property.',
    files: byFile(hits),
    details: hits.slice(0, MAX_DETAILS),
  });
}

const snapshot = {
  generatedAt: new Date().toISOString().slice(0, 10),
  generatedBy: 'node tools/audit-foundations.mjs',
  scanned: { scss: scss.length, components: componentTs.length, tokens: flat.length },
  checks,
};

writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
for (const c of checks) console.log(c.status.padEnd(10), String(c.count).padStart(4), ' ', c.title);
if (process.argv.includes('--check') && checks.some((c) => c.status === 'error')) process.exit(1);
