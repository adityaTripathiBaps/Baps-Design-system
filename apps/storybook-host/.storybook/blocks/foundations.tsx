/**
 * Foundation blocks — the Foundations pages render the token build, not a copy of it.
 *
 * Every value on these pages comes from one of two places:
 *
 *   1. libs/tokens/build/json/tokens.flat.json — names, references, comments.
 *      The same file Style Dictionary writes tokens.css from, so a token that
 *      changes in libs/tokens changes here on the next build.
 *   2. The live document — `getComputedStyle(documentElement)`. That is what
 *      makes the pages follow the toolbar: the accent picker writes the primary
 *      ramp inline on <html>, dark mode is `.baps-dark`, the brand is
 *      `.baps-ds-sampark`, and the resolved column reads whatever is in force.
 *
 * Previews paint with `var(--token)`, never with the resolved string, so a
 * swatch can not show a stale value even before the resolved column re-reads.
 *
 * Tier comes from WHICH SOURCE FILE declares the token (semantic.tokens.json,
 * component.tokens.json, everything else primitive) — the pipeline's own split,
 * not a naming heuristic.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import flat from '../../../../libs/tokens/build/json/tokens.flat.json';
import semanticSource from '../../../../libs/tokens/src/source/semantic.tokens.json';
import componentSource from '../../../../libs/tokens/src/source/component.tokens.json';

const mono = "var(--font-family-mono, ui-monospace, 'JetBrains Mono', monospace)";

/* ── Token model ───────────────────────────────────────────────────────── */

type Brand = 'mybky' | 'sampark';
type Tier = 'Primitive' | 'Semantic' | 'Component';

export type Token = {
  name: string;
  path: string[];
  value: string;
  original: string;
  comment?: string;
  cssVar: string;
  scssVar: string;
  tier: Tier;
  category: string;
  brand: Brand | 'shared';
  component?: string;
};

/* Leaf paths of a source JSON, so a token's tier is read off the file that
   declares it. */
const leafPaths = (node: unknown, trail: string[] = [], out = new Set<string>()): Set<string> => {
  if (node && typeof node === 'object') {
    const o = node as Record<string, unknown>;
    if ('value' in o) out.add(trail.join('.'));
    else for (const [k, v] of Object.entries(o)) leafPaths(v, [...trail, k], out);
  }
  return out;
};
const SEMANTIC = leafPaths(semanticSource);
const COMPONENT = leafPaths(componentSource);

/* Same kebab rule Style Dictionary's css transform applies — checked against
   tokens.css for all 698 tokens, 0 mismatches. */
const kebab = (path: string[]) => path.join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const isColourValue = (v: string) => /^(#|rgb|hsl|color\()/i.test(v.trim());

const categoryOf = (path: string[], value: string): string => {
  const [root, second] = path;
  const leaf = path[path.length - 1];
  if (root === 'color') return 'Color';
  if (root === 'space') return 'Spacing';
  if (root === 'radius') return 'Border radius';
  if (root === 'shadow') return 'Shadow';
  if (root === 'zIndex') return 'Z-index';
  if (root === 'motion') return second === 'easing' ? 'Motion — easing' : 'Motion — duration';
  if (root === 'font') {
    return (
      {
        family: 'Font family',
        size: 'Font size',
        weight: 'Font weight',
        lineHeight: 'Line height',
        letterSpacing: 'Letter spacing',
      } as Record<string, string>
    )[second] ?? 'Typography';
  }
  // Component tier: classify by what the value IS, so "Border width" or
  // "Shadow" filters find component tokens as well as primitives.
  if (/radius/i.test(leaf)) return 'Border radius';
  if (/borderWidth/i.test(leaf)) return 'Border width';
  if (/shadow/i.test(leaf) || /\d+px\s+[-\d]/.test(value)) return 'Shadow';
  if (isColourValue(value)) return 'Color';
  if (/width|height|size|max/i.test(leaf)) return 'Sizing';
  if (/fontWeight|weight/i.test(leaf)) return 'Font weight';
  if (/font/i.test(leaf)) return 'Font size';
  if (/padding|gap|margin|inset/i.test(leaf)) return 'Spacing';
  return 'Other';
};

export const TOKENS: Token[] = (flat as Array<Omit<Token, 'cssVar' | 'scssVar' | 'tier' | 'category' | 'brand'>>).map((t) => {
  const key = t.path.join('.');
  const tier: Tier = COMPONENT.has(key) ? 'Component' : SEMANTIC.has(key) ? 'Semantic' : 'Primitive';
  const brand = (['mybky', 'sampark'] as const).find((b) => t.path[1] === b) ?? 'shared';
  return {
    ...t,
    original: String(t.original),
    value: String(t.value),
    cssVar: `--${kebab(t.path)}`,
    scssVar: `$${kebab(t.path)}`,
    tier,
    category: categoryOf(t.path, String(t.value)),
    brand,
    component: tier === 'Component' ? t.path[0] : undefined,
  };
});

export const tokensWhere = (fn: (t: Token) => boolean) => TOKENS.filter(fn);

/* ── Theme tracking ───────────────────────────────────────────────────────
   The decorator in preview.ts owns the brand/dark classes and the accent's
   inline properties; this only WATCHES them. A tick counter forces the
   resolved values to re-read after any change. */
const readTheme = () => {
  const html = document.documentElement;
  const body = document.body;
  const has = (c: string) => html.classList.contains(c) || body.classList.contains(c);
  return { brand: (has('baps-ds-sampark') ? 'sampark' : 'mybky') as Brand, dark: has('baps-dark') };
};

export const useTheme = () => {
  const [state, setState] = useState(() => ({ ...readTheme(), tick: 0 }));
  useEffect(() => {
    let tick = 0;
    const update = () => setState({ ...readTheme(), tick: ++tick });
    const mo = new MutationObserver(update);
    const opts = { attributes: true, attributeFilter: ['class', 'style'] };
    mo.observe(document.documentElement, opts);
    mo.observe(document.body, opts);
    return () => mo.disconnect();
  }, []);
  return state;
};

export const resolve = (cssVar: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();

/* Any CSS colour — hex, rgb(), a relative `rgb(from …)`, a var() — to sRGB
   channels, by letting the browser resolve it on a probe element. */
let probe: HTMLSpanElement | undefined;
export const toRgb = (colour: string): [number, number, number, number] | undefined => {
  if (!probe) {
    probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);
  }
  probe.style.color = '';
  probe.style.color = colour;
  const c = getComputedStyle(probe).color;
  const nums = c.match(/[\d.]+/g)?.map(Number);
  if (!nums || nums.length < 3) return undefined;
  const srgb = c.startsWith('color(');
  const [r, g, b] = nums.slice(0, 3).map((n) => (srgb ? n * 255 : n));
  return [r, g, b, nums[3] ?? 1];
};

const toHex = (rgb?: [number, number, number, number]) =>
  rgb
    ? '#' +
      rgb
        .slice(0, 3)
        .map((n) => Math.round(n).toString(16).padStart(2, '0'))
        .join('') +
      (rgb[3] < 1 ? Math.round(rgb[3] * 255).toString(16).padStart(2, '0') : '')
    : '';

const luminance = ([r, g, b]: number[]) => {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

/* Alpha is composited over the background first — a 10% scrim's contrast is
   the contrast of what it actually paints. */
export const contrast = (fg: string, bg: string): number | undefined => {
  const b = toRgb(bg);
  const f = toRgb(fg);
  if (!b || !f) return undefined;
  const mixed = f.slice(0, 3).map((c, i) => c * f[3] + b[i] * (1 - f[3]));
  const [x, y] = [luminance(mixed), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ── Small shared pieces ──────────────────────────────────────────────── */

const cell: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--baps-docs-divider)',
  textAlign: 'left',
  verticalAlign: 'middle',
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th
    scope="col"
    style={{
      ...cell,
      fontSize: '0.72rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: 'var(--baps-docs-muted)',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </th>
);

/* Scrolls inside itself so a wide table never widens the docs canvas — the
   page must not scroll sideways on a phone. tabIndex so a keyboard user can
   scroll it too (axe: scrollable-region-focusable). */
const TableWrap = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div role="region" aria-label={label} tabIndex={0} style={{ overflowX: 'auto', maxWidth: '100%', margin: '0 0 1.5rem' }}>
    <table className="baps-docs-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>{children}</table>
  </div>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontFamily: mono, fontSize: '0.78rem', wordBreak: 'break-all' }}>{children}</code>
);

/* One live region per page for every copy button. A button that changes its
   own text is announced inconsistently; a polite status is not. */
const announce = (msg: string) => {
  let el = document.getElementById('baps-docs-copy-status');
  if (!el) {
    el = document.createElement('div');
    el.id = 'baps-docs-copy-status';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    Object.assign(el.style, { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' });
    document.body.appendChild(el);
  }
  el.textContent = '';
  el.textContent = msg;
};

export const CopyButton = ({ text, label, children }: { text: string; label: string; children?: React.ReactNode }) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return undefined;
    const id = setTimeout(() => setDone(false), 1400);
    return () => clearTimeout(id);
  }, [done]);
  return (
    <button
      type="button"
      className="baps-docs-copy"
      aria-label={label}
      title={label}
      onClick={() => {
        const ok = () => {
          setDone(true);
          announce(`Copied ${text}`);
        };
        // Clipboard can reject (plain http, withheld permission): say so rather
        // than flash a success that did not happen.
        const w = navigator.clipboard?.writeText(text);
        if (w) w.then(ok, () => announce('Copy failed — select the text instead'));
        else announce('Copy is not available in this browser');
      }}
    >
      {done ? 'Copied' : children ?? 'Copy'}
    </button>
  );
};

const CopyTrio = ({ t, resolved }: { t: Token; resolved: string }) => (
  <span style={{ display: 'inline-flex', gap: '0.25rem', flexWrap: 'wrap' }}>
    <CopyButton text={`var(${t.cssVar})`} label={`Copy CSS variable ${t.cssVar}`}>
      CSS
    </CopyButton>
    <CopyButton text={t.scssVar} label={`Copy SCSS variable ${t.scssVar}`}>
      SCSS
    </CopyButton>
    <CopyButton text={resolved || t.value} label={`Copy value of ${t.cssVar}`}>
      Value
    </CopyButton>
  </span>
);

const checker =
  'linear-gradient(45deg,var(--baps-docs-divider) 25%,transparent 25%,transparent 75%,var(--baps-docs-divider) 75%),linear-gradient(45deg,var(--baps-docs-divider) 25%,transparent 25%,transparent 75%,var(--baps-docs-divider) 75%)';

/* The visual for one token, painted from the variable itself. */
export const Preview = ({ t }: { t: Token }) => {
  const v = `var(${t.cssVar})`;
  const box: React.CSSProperties = { width: '2.5rem', height: '1.75rem', flex: 'none' };
  switch (t.category) {
    case 'Color':
      return (
        <span aria-hidden="true" style={{ ...box, display: 'inline-block', borderRadius: 4, backgroundImage: checker, backgroundSize: '8px 8px', backgroundPosition: '0 0,4px 4px', boxShadow: 'inset 0 0 0 1px rgba(128,128,128,.35)', overflow: 'hidden' }}>
          <span style={{ display: 'block', width: '100%', height: '100%', background: v }} />
        </span>
      );
    case 'Spacing':
      return <span aria-hidden="true" style={{ display: 'inline-block', height: '0.75rem', width: v, background: 'var(--baps-docs-accent)', borderRadius: 2 }} />;
    case 'Border radius':
      return <span aria-hidden="true" style={{ ...box, display: 'inline-block', borderRadius: v, border: '2px solid var(--baps-docs-accent)' }} />;
    case 'Border width':
      return <span aria-hidden="true" style={{ ...box, display: 'inline-block', borderRadius: 4, border: `${v} solid var(--baps-docs-text)` }} />;
    case 'Shadow':
      return <span aria-hidden="true" style={{ ...box, display: 'inline-block', borderRadius: 6, background: 'var(--baps-docs-raised)', boxShadow: v }} />;
    case 'Font size':
      return <span aria-hidden="true" style={{ fontSize: v, lineHeight: 1 }}>Aa</span>;
    case 'Font weight':
      return <span aria-hidden="true" style={{ fontWeight: v }}>Aa</span>;
    case 'Font family':
      return <span aria-hidden="true" style={{ fontFamily: v }}>Aa</span>;
    case 'Line height':
      return <span aria-hidden="true" style={{ display: 'inline-block', lineHeight: v, fontSize: '0.65rem', maxWidth: '3rem', borderBlock: '1px dashed var(--baps-docs-divider)' }}>Aa Bb</span>;
    case 'Letter spacing':
      return <span aria-hidden="true" style={{ letterSpacing: v, textTransform: 'uppercase', fontSize: '0.7rem' }}>Caps</span>;
    default:
      return <span aria-hidden="true" style={{ color: 'var(--baps-docs-muted)' }}>—</span>;
  }
};

const selectStyle: React.CSSProperties = {
  font: 'inherit',
  fontSize: '0.85rem',
  padding: '0.4rem 0.5rem',
  border: '1px solid var(--baps-docs-control)',
  borderRadius: 6,
  background: 'var(--baps-docs-ground)',
  color: 'var(--baps-docs-text)',
  minWidth: 0,
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--baps-docs-muted)', flex: '1 1 10rem', minWidth: 0 }}>
    {label}
    {children}
  </label>
);

const BrandNote = ({ brand }: { brand: Brand }) => (
  <p style={{ fontSize: '0.8rem', color: 'var(--baps-docs-muted)', margin: '0 0 0.75rem' }}>
    Showing <strong>{brand === 'sampark' ? 'Sampark' : 'MyBKY'}</strong> values — follows the toolbar's Design system
    switch. BAPS default and App Sell have no palette yet and show the MyBKY base.
  </p>
);

/* ── TokenExplorer ────────────────────────────────────────────────────────
   Search, filter, copy. `categories` / `tiers` pin a page to a slice (the
   Spacing page shows Spacing only) and hide the filter that would be moot. */
export const TokenExplorer = ({
  categories,
  tiers,
  label = 'Design tokens',
  limit = 80,
}: {
  categories?: string[];
  tiers?: Tier[];
  label?: string;
  limit?: number;
}) => {
  const { brand, tick } = useTheme();
  const [q, setQ] = useState('');
  const [tier, setTier] = useState<string>('All');
  const [cat, setCat] = useState<string>('All');
  const [scope, setScope] = useState<string>('active');
  const [shown, setShown] = useState(limit);

  const pool = useMemo(
    () => TOKENS.filter((t) => (!categories || categories.includes(t.category)) && (!tiers || tiers.includes(t.tier))),
    [categories, tiers],
  );
  const cats = useMemo(() => [...new Set(pool.map((t) => t.category))].sort(), [pool]);
  const tierOpts = useMemo(() => [...new Set(pool.map((t) => t.tier))], [pool]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return pool.filter(
      (t) =>
        (tier === 'All' || t.tier === tier) &&
        (cat === 'All' || t.category === cat) &&
        (scope === 'all' || t.brand === 'shared' || t.brand === (scope === 'active' ? brand : scope)) &&
        (!needle ||
          t.cssVar.includes(needle) ||
          t.path.join('.').toLowerCase().includes(needle) ||
          t.value.toLowerCase().includes(needle) ||
          (t.comment ?? '').toLowerCase().includes(needle)),
    );
  }, [pool, q, tier, cat, scope, brand]);

  // Read after render so the values are the ones the current theme resolved.
  const resolved = useMemo(() => new Map(rows.slice(0, shown).map((t) => [t.cssVar, resolve(t.cssVar)])), [rows, shown, tick, brand]);

  const id = useRef(`te-${Math.random().toString(36).slice(2, 8)}`).current;

  return (
    <div className="baps-docs-foundation">
      <div role="search" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '0 0 0.75rem' }}>
        <Field label="Search">
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(limit); }} placeholder="Name, value or description" style={selectStyle} aria-controls={id} />
        </Field>
        {tierOpts.length > 1 ? (
          <Field label="Tier">
            <select value={tier} onChange={(e) => setTier(e.target.value)} style={selectStyle}>
              <option>All</option>
              {tierOpts.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        ) : null}
        {cats.length > 1 ? (
          <Field label="Category">
            <select value={cat} onChange={(e) => setCat(e.target.value)} style={selectStyle}>
              <option>All</option>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        ) : null}
        {pool.some((t) => t.brand !== 'shared') ? (
          <Field label="Brand">
            <select value={scope} onChange={(e) => setScope(e.target.value)} style={selectStyle}>
              <option value="active">Active brand ({brand === 'sampark' ? 'Sampark' : 'MyBKY'}) + shared</option>
              <option value="mybky">MyBKY + shared</option>
              <option value="sampark">Sampark + shared</option>
              <option value="all">All brands</option>
            </select>
          </Field>
        ) : null}
      </div>
      <p aria-live="polite" style={{ fontSize: '0.8rem', color: 'var(--baps-docs-muted)', margin: '0 0 0.5rem' }}>
        {rows.length} of {pool.length} tokens
      </p>
      <div id={id}>
        <TableWrap label={label}>
          <thead>
            <tr>
              <Th>Preview</Th>
              <Th>Token</Th>
              <Th>Resolved value</Th>
              <Th>Tier · category</Th>
              <Th>Description</Th>
              <Th>Copy</Th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, shown).map((t) => {
              const r = resolved.get(t.cssVar) ?? '';
              return (
                <tr key={t.cssVar}>
                  <td style={cell}><Preview t={t} /></td>
                  <td style={{ ...cell, minWidth: '14rem' }}>
                    <Code>{t.cssVar}</Code>
                    {t.original.startsWith('{') ? (
                      <div style={{ fontSize: '0.72rem', color: 'var(--baps-docs-muted)' }}>
                        → <Code>{t.original.replace(/[{}]/g, '')}</Code>
                      </div>
                    ) : null}
                  </td>
                  <td style={{ ...cell, minWidth: '8rem' }}><Code>{r || t.value}</Code></td>
                  <td style={{ ...cell, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                    {t.tier}
                    <div style={{ color: 'var(--baps-docs-muted)' }}>{t.category}{t.component ? ` · ${t.component}` : ''}</div>
                  </td>
                  <td style={{ ...cell, minWidth: '12rem', fontSize: '0.8rem' }}>{t.comment ?? ''}</td>
                  <td style={cell}><CopyTrio t={t} resolved={r} /></td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </div>
      {rows.length > shown ? (
        <button type="button" className="baps-docs-copy" onClick={() => setShown((n) => n + limit * 2)}>
          Show more ({rows.length - shown} hidden)
        </button>
      ) : null}
    </div>
  );
};

/* ── TierSummary ─────────────────────────────────────────────────────────── */
export const TierSummary = () => {
  const count = (fn: (t: Token) => boolean) => TOKENS.filter(fn).length;
  const rows: Array<[Tier, string, string]> = [
    ['Primitive', 'libs/tokens/src/source/{color,spacing,typography,shadow,motion}.tokens.json', 'Raw values — ramps, the 4px scale, type sizes. Carry no meaning.'],
    ['Semantic', 'libs/tokens/src/source/semantic.tokens.json', 'Roles: text, surface, border, primary, state, dark. Reference primitives.'],
    ['Component', 'libs/tokens/src/source/component.tokens.json', 'One component, one brand: button, card, tag, avatar… Reference either tier.'],
  ];
  return (
    <TableWrap label="Token tiers">
      <thead>
        <tr><Th>Tier</Th><Th>Tokens</Th><Th>Source</Th><Th>Role</Th></tr>
      </thead>
      <tbody>
        {rows.map(([tier, src, role]) => (
          <tr key={tier}>
            <td style={{ ...cell, fontWeight: 600 }}>{tier}</td>
            <td style={cell}>{count((t) => t.tier === tier)}</td>
            <td style={cell}><Code>{src}</Code></td>
            <td style={cell}>{role}</td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
};

/* ── Colour ─────────────────────────────────────────────────────────────── */

const RAMP_ORDER = ['blue', 'primary', 'secondary', 'tertiary', 'mono', 'error', 'info', 'success', 'warning'];
const RAMP_LABEL: Record<string, string> = {
  blue: 'Brand / Primary',
  primary: 'Brand / Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  mono: 'Neutral',
  error: 'Danger / Error',
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
};

const stepSort = (a: Token, b: Token) => {
  const x = Number(a.path[3]);
  const y = Number(b.path[3]);
  if (Number.isNaN(x) && Number.isNaN(y)) return a.path[3].localeCompare(b.path[3]);
  if (Number.isNaN(x)) return 1;
  if (Number.isNaN(y)) return -1;
  return x - y;
};

/* Pass/fail carries its meaning in the glyph and the word, not the hue — no
   green in either brand's success ramp clears 4.5:1 as text on white. */
const Badge = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
  <span className="baps-docs-status" data-status={ok ? 'passed' : 'error'}>
    <span aria-hidden="true">{ok ? '✓' : '✗'}</span> {children}
    <span className="baps-docs-sr">{ok ? ' passes' : ' fails'}</span>
  </span>
);

const SwatchCard = ({ t, bgVar }: { t: Token; bgVar: string }) => {
  const { tick } = useTheme();
  const r = useMemo(() => resolve(t.cssVar), [t, tick]);
  const hex = useMemo(() => toHex(toRgb(`var(${t.cssVar})`)), [t, tick]);
  const onWhite = useMemo(() => contrast(`var(${t.cssVar})`, `var(${bgVar})`), [t, bgVar, tick]);
  return (
    <div style={{ border: '1px solid var(--baps-docs-divider)', borderRadius: 8, overflow: 'hidden', minWidth: 0, background: 'var(--baps-docs-ground)' }}>
      <div style={{ height: 52, backgroundImage: checker, backgroundSize: '12px 12px', backgroundPosition: '0 0,6px 6px' }}>
        <div style={{ height: '100%', background: `var(${t.cssVar})` }} />
      </div>
      <div style={{ padding: '0.5rem 0.6rem', fontSize: '0.72rem', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <strong style={{ fontFamily: mono }}>{t.path.slice(3).join('.') || t.path.join('.')}</strong>
        <Code>{t.cssVar}</Code>
        <span style={{ color: 'var(--baps-docs-muted)', fontFamily: mono }}>{hex || r}</span>
        {onWhite ? (
          <span style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: mono }}>{onWhite.toFixed(2)}:1</span>
            <Badge ok={onWhite >= 4.5}>AA</Badge>
            <Badge ok={onWhite >= 7}>AAA</Badge>
          </span>
        ) : null}
        <span style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          <CopyButton text={`var(${t.cssVar})`} label={`Copy CSS variable ${t.cssVar}`}>CSS</CopyButton>
          <CopyButton text={hex || r} label={`Copy value of ${t.cssVar}`}>Hex</CopyButton>
        </span>
      </div>
    </div>
  );
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))',
  gap: '0.75rem',
  margin: '0 0 1.5rem',
};

/** Every primitive ramp of the active brand, plus the shared accent ramps. */
/* Headings are real h3/h4 so the page outline is right; the TOC skips them
   (preview.ts ignoreSelector) or it would list every ramp. */
export const ColorRamps = ({ accent = false }: { accent?: boolean }) => {
  const H = accent ? 'h4' : 'h3';
  const { brand, dark } = useTheme();
  const surface = `--color-${brand}-${dark ? 'dark-' : ''}surface-card`;
  if (accent) {
    const ramps = [...new Set(tokensWhere((t) => t.path[1] === 'accent').map((t) => t.path[2]))];
    return (
      <>
        {ramps.map((r) => (
          <section key={r}>
            <H style={{ margin: '0 0 0.5rem', textTransform: 'capitalize' }}>{r}</H>
            <div style={grid}>
              {tokensWhere((t) => t.path[1] === 'accent' && t.path[2] === r)
                .sort(stepSort)
                .map((t) => <SwatchCard key={t.cssVar} t={t} bgVar={surface} />)}
            </div>
          </section>
        ))}
      </>
    );
  }
  const prim = tokensWhere((t) => t.tier === 'Primitive' && t.category === 'Color' && t.brand === brand);
  const ramps = [...new Set(prim.map((t) => t.path[2]))].sort((a, b) => {
    const x = RAMP_ORDER.indexOf(a);
    const y = RAMP_ORDER.indexOf(b);
    return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
  });
  return (
    <div className="baps-docs-foundation">
      <BrandNote brand={brand} />
      <p style={{ fontSize: '0.8rem', color: 'var(--baps-docs-muted)', margin: '0 0 1rem' }}>
        Contrast is measured against <Code>{surface}</Code>. AA = 4.5:1 for body text, AAA = 7:1. A ramp step that fails is
        not wrong — it belongs to fills, borders and large text.
      </p>
      {ramps.map((r) => (
        <section key={r}>
          <H style={{ margin: '0 0 0.5rem' }}>
            {RAMP_LABEL[r] ?? r} <Code>{`color.${brand}.${r}`}</Code>
          </H>
          <div style={grid}>
            {prim.filter((t) => t.path[2] === r).sort(stepSort).map((t) => <SwatchCard key={t.cssVar} t={t} bgVar={surface} />)}
          </div>
        </section>
      ))}
    </div>
  );
};

const ROLE_LABEL: Record<string, [string, string]> = {
  surface: ['Background & surface', 'ground = page background, card = raised surface.'],
  text: ['Text', 'Contrast is against the card surface — the ground text most often sits on.'],
  border: ['Border', 'Non-text UI needs 3:1 (WCAG 1.4.11) where the border is the only cue.'],
  primary: ['Action / interactive', 'default → hover → active, one step darker each. tint is the selected-row wash.'],
  state: ['Status', 'The one colour per status components reference; the full ramp is under Primitives.'],
};

/** The semantic roles for the active brand and mode. */
export const SemanticColors = () => {
  const { brand, dark } = useTheme();
  const surface = `--color-${brand}-${dark ? 'dark-' : ''}surface-card`;
  const roles = tokensWhere(
    (t) => t.tier === 'Semantic' && t.brand === brand && (dark ? t.path[2] === 'dark' : t.path[2] !== 'dark'),
  );
  const roleOf = (t: Token) => (dark ? t.path[3] : t.path[2]);
  return (
    <div className="baps-docs-foundation">
      <BrandNote brand={brand} />
      <p style={{ fontSize: '0.8rem', color: 'var(--baps-docs-muted)', margin: '0 0 1rem' }}>
        {dark ? 'Dark' : 'Light'} mode — toggle the toolbar's theme to see the other set.
        {dark && !roles.some((t) => roleOf(t) === 'state') ? ' Status roles have no dark variant; components reuse the light value.' : ''}
      </p>
      {Object.keys(ROLE_LABEL)
        .filter((role) => roles.some((t) => roleOf(t) === role))
        .map((role) => (
          <section key={role}>
            <h3 style={{ margin: '0 0 0.25rem' }}>{ROLE_LABEL[role][0]}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--baps-docs-muted)', margin: '0 0 0.5rem' }}>{ROLE_LABEL[role][1]}</p>
            <div style={grid}>
              {roles.filter((t) => roleOf(t) === role).map((t) => <SwatchCard key={t.cssVar} t={t} bgVar={surface} />)}
            </div>
          </section>
        ))}
    </div>
  );
};

/** Default / hover / active / focus / disabled, drawn from the brand's tokens. */
export const InteractionStates = () => {
  const { brand } = useTheme();
  const p = (s: string) => `var(--color-${brand}-primary-${s})`;
  const hasActive = TOKENS.some((t) => t.cssVar === `--color-${brand}-primary-active`);
  const states: Array<[string, React.CSSProperties, string]> = [
    ['Default', { background: p('default') }, `--color-${brand}-primary-default`],
    ['Hover', { background: p('hover') }, `--color-${brand}-primary-hover`],
    [
      'Active / pressed',
      { background: hasActive ? p('active') : p('hover'), transform: 'translateY(1px)' },
      hasActive ? `--color-${brand}-primary-active` : `--color-${brand}-primary-hover + translateY(1px)`,
    ],
    ['Focus', { background: p('default'), outline: `2px solid ${p('default')}`, outlineOffset: 2 }, '2px ring, 2px offset (see Accessibility)'],
    ['Disabled', { background: p('default'), opacity: 0.4 }, 'opacity 0.4, no pointer events'],
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0 0 1.5rem' }}>
      {states.map(([name, style, token]) => (
        <figure key={name} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: '1 1 8rem', minWidth: 0 }}>
          <span aria-hidden="true" style={{ display: 'block', height: 40, borderRadius: 6, color: '#fff', ...style }} />
          <figcaption style={{ fontSize: '0.75rem' }}>
            <strong>{name}</strong>
            <div><Code>{token}</Code></div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

/* ── Spacing ───────────────────────────────────────────────────────────── */

const remPx = (v: string) => (v.endsWith('rem') ? `${parseFloat(v) * 16}px` : v);

const SPACE_USE: Record<string, string> = {
  '0.125rem': 'Hairline offsets, icon nudges',
  '0.25rem': 'Icon ↔ label, tight inline groups',
  '0.5rem': 'Default inline gap, chip padding, dense table cells',
  '0.75rem': 'Form control padding, list item gap',
  '1rem': 'Within one block — card sections, field stack',
  '1.25rem': 'Card padding (compact)',
  '1.5rem': 'Card padding, page gutters on admin tables',
  '2rem': 'Between unrelated blocks',
  '2.5rem': 'Page section rhythm',
};

export const SpacingScale = () => {
  const rows = tokensWhere((t) => t.path[0] === 'space').sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  return (
    <TableWrap label="Spacing scale">
      <thead>
        <tr><Th>Token</Th><Th>Value</Th><Th>Visual</Th><Th>Recommended use</Th><Th>Copy</Th></tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.cssVar}>
            <td style={{ ...cell, whiteSpace: 'nowrap' }}><Code>{t.cssVar}</Code></td>
            <td style={{ ...cell, whiteSpace: 'nowrap' }}><Code>{t.value}</Code> <span style={{ color: 'var(--baps-docs-muted)' }}>{remPx(t.value)}</span></td>
            <td style={{ ...cell, width: '40%' }}><Preview t={t} /></td>
            <td style={{ ...cell, fontSize: '0.8rem' }}>{SPACE_USE[t.value] ?? (/\.\d*[1-9]/.test(String(parseFloat(t.value) * 4)) ? 'Off-grid step — matching a Figma measurement, not for new layout' : '')}</td>
            <td style={cell}><CopyTrio t={t} resolved={t.value} /></td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
};

const demoBox: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--baps-docs-accent) 18%, transparent)',
  border: '1px dashed var(--baps-docs-accent)',
  borderRadius: 4,
  fontSize: '0.72rem',
  fontFamily: mono,
  color: 'var(--baps-docs-text)',
};

/** Padding / gap / stack / inline / section, each labelled with the token it uses. */
export const SpacingExamples = () => {
  const ex: Array<[string, string, React.ReactNode]> = [
    ['Padding', '--space-4', <div style={{ ...demoBox, padding: 'var(--space-4)' }}><div style={{ background: 'var(--baps-docs-raised)', padding: '0.25rem' }}>content</div></div>],
    ['Gap (inline)', '--space-2', <div style={{ display: 'flex', gap: 'var(--space-2)' }}>{[1, 2, 3].map((i) => <span key={i} style={{ ...demoBox, padding: '0.25rem 0.5rem' }}>chip</span>)}</div>],
    ['Stack', '--space-3', <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>{['Label', 'Field', 'Hint'].map((i) => <span key={i} style={{ ...demoBox, padding: '0.25rem 0.5rem' }}>{i}</span>)}</div>],
    ['Margin (between blocks)', '--space-8', <div>{['Block A', 'Block B'].map((i, n) => <div key={i} style={{ ...demoBox, padding: '0.5rem', marginTop: n ? 'var(--space-8)' : 0 }}>{i}</div>)}</div>],
    ['Section', '--space-10', <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>{['Section 1', 'Section 2'].map((i) => <div key={i} style={{ ...demoBox, padding: '0.75rem' }}>{i}</div>)}</div>],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: '1rem', margin: '0 0 1.5rem' }}>
      {ex.map(([name, token, node]) => (
        <figure key={name} style={{ margin: 0, padding: '0.75rem', border: '1px solid var(--baps-docs-divider)', borderRadius: 8, minWidth: 0 }}>
          {node}
          <figcaption style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            <strong>{name}</strong> — <Code>{token}</Code>
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

/* ── Borders & radius ──────────────────────────────────────────────────── */

export const RadiusScale = () => {
  const { brand } = useTheme();
  const rows = tokensWhere((t) => t.path[0] === 'radius' && t.brand === brand);
  return (
    <>
      <BrandNote brand={brand} />
      <div style={grid}>
        {rows.map((t) => (
          <figure key={t.cssVar} style={{ margin: 0, minWidth: 0 }}>
            <div style={{ height: 72, border: '2px solid var(--baps-docs-accent)', background: 'color-mix(in srgb, var(--baps-docs-accent) 10%, transparent)', borderRadius: `var(${t.cssVar})` }} />
            <figcaption style={{ fontSize: '0.72rem', marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <strong>{t.path[2]}</strong>
              <Code>{t.cssVar}</Code>
              <span style={{ color: 'var(--baps-docs-muted)' }}>{t.value}{t.comment ? ` — ${t.comment}` : ''}</span>
              <span><CopyButton text={`var(${t.cssVar})`} label={`Copy CSS variable ${t.cssVar}`}>CSS</CopyButton></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
};

/* The radius each surface actually uses, read from component.tokens.json. */
const SURFACES: Array<[string, string, React.CSSProperties]> = [
  ['Button', 'button-{b}-radius', { width: 112, height: 36 }],
  ['Input', 'form-field-{b}-border-radius', { width: 160, height: 36 }],
  ['Card', 'card-{b}-radius', { width: 160, height: 96 }],
  ['Dialog / drawer', 'drawer-{b}-radius', { width: 160, height: 110 }],
  ['Badge', 'badge-{b}-radius', { width: 44, height: 22 }],
  ['Tag', 'tag-{b}-radius', { width: 72, height: 24 }],
  ['Avatar', 'avatar-{b}-radius', { width: 40, height: 40 }],
];

export const RadiusSurfaces = () => {
  const { brand } = useTheme();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-end', margin: '0 0 1.5rem' }}>
      {SURFACES.map(([name, pattern, size]) => {
        const v = `--${pattern.replace('{b}', brand)}`;
        const t = TOKENS.find((x) => x.cssVar === v);
        if (!t) return null;
        return (
          <figure key={name} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: '100%' }}>
            <span aria-hidden="true" style={{ ...size, maxWidth: '100%', display: 'block', borderRadius: `var(${v})`, border: `1px solid var(--color-${brand}-border-default)`, background: 'var(--baps-docs-raised)' }} />
            <figcaption style={{ fontSize: '0.72rem' }}>
              <strong>{name}</strong>
              <div><Code>{v}</Code></div>
              <div style={{ color: 'var(--baps-docs-muted)' }}>{t.original.startsWith('{') ? t.original.replace(/[{}]/g, '') : t.value}</div>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
};

/* ── Shadows ───────────────────────────────────────────────────────────── */

export const ShadowScale = () => {
  // useTheme re-renders on a theme change, which re-reads resolve() below.
  const { brand } = useTheme();
  const rows = tokensWhere((t) => t.path[0] === 'shadow' && t.brand === brand);
  return (
    <>
      <BrandNote brand={brand} />
      <div style={{ ...grid, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: '1.5rem' }}>
        {rows.map((t) => (
          <figure key={t.cssVar} style={{ margin: 0, minWidth: 0 }}>
            <div style={{ height: 80, borderRadius: 8, background: 'var(--baps-docs-raised)', boxShadow: `var(${t.cssVar})`, border: /inset|0 0 0/.test(t.value) ? '1px solid var(--baps-docs-divider)' : 'none' }} />
            <figcaption style={{ fontSize: '0.72rem', marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <strong>{t.path.slice(2).join('.')}</strong>
              <Code>{t.cssVar}</Code>
              <span style={{ color: 'var(--baps-docs-muted)', fontFamily: mono, wordBreak: 'break-word' }}>{resolve(t.cssVar) || t.value}</span>
              {t.comment ? <span>{t.comment}</span> : null}
              <span><CopyTrio t={t} resolved={resolve(t.cssVar)} /></span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
};

/* ── Motion ────────────────────────────────────────────────────────────── */

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export const MotionPlayground = () => {
  const durations = tokensWhere((t) => t.path[0] === 'motion' && t.path[1] === 'duration');
  const easings = tokensWhere((t) => t.path[0] === 'motion' && t.path[1] === 'easing');
  const [dur, setDur] = useState('--motion-duration-ui-transition');
  const [ease, setEase] = useState('--motion-easing-calm');
  const [on, setOn] = useState(true);
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(reducedMotion()), []);

  const transition = (props: string) =>
    reduce ? 'none' : props.split(',').map((p) => `${p.trim()} var(${dur}) var(${ease})`).join(', ');

  const demos: Array<[string, React.CSSProperties]> = [
    ['Fade', { opacity: on ? 1 : 0, transition: transition('opacity') }],
    ['Fade + 4px rise (entry)', { opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(4px)', transition: transition('opacity, transform') }],
    ['Slide (drawer)', { transform: on ? 'none' : 'translateX(-110%)', transition: transition('transform') }],
    ['Scale (overlay)', { opacity: on ? 1 : 0, transform: on ? 'none' : 'scale(0.96)', transition: transition('opacity, transform') }],
  ];

  return (
    <div className="baps-docs-foundation" style={{ margin: '0 0 1.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', margin: '0 0 1rem' }}>
        <Field label="Duration">
          <select value={dur} onChange={(e) => setDur(e.target.value)} style={selectStyle}>
            {durations.map((t) => <option key={t.cssVar} value={t.cssVar}>{t.cssVar} ({t.value})</option>)}
          </select>
        </Field>
        <Field label="Easing">
          <select value={ease} onChange={(e) => setEase(e.target.value)} style={selectStyle}>
            {easings.map((t) => <option key={t.cssVar} value={t.cssVar}>{t.cssVar}</option>)}
          </select>
        </Field>
        <button type="button" className="baps-docs-copy" aria-pressed={!on} onClick={() => setOn((v) => !v)}>
          {on ? 'Play exit' : 'Play entry'}
        </button>
      </div>
      {reduce ? (
        <p role="note" style={{ fontSize: '0.8rem', margin: '0 0 0.75rem' }}>
          Your system asks for reduced motion, so these previews switch state without animating — exactly what the
          components do.
        </p>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
        {demos.map(([name, style]) => (
          <figure key={name} style={{ margin: 0, padding: '0.75rem', border: '1px solid var(--baps-docs-divider)', borderRadius: 8, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ height: 56, display: 'flex', alignItems: 'center' }}>
              <div style={{ ...style, width: '100%', height: 40, borderRadius: 6, background: 'var(--baps-docs-accent)' }} />
            </div>
            <figcaption style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>{name}</figcaption>
          </figure>
        ))}
        <figure style={{ margin: 0, padding: '0.75rem', border: '1px solid var(--baps-docs-divider)', borderRadius: 8, minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateRows: on ? '1fr' : '0fr', transition: transition('grid-template-rows') }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ height: 56, borderRadius: 6, background: 'var(--baps-docs-accent)' }} />
            </div>
          </div>
          <figcaption style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Expand / collapse</figcaption>
        </figure>
      </div>
      <p style={{ fontSize: '0.78rem', marginTop: '0.75rem' }}>
        <Code>{`transition: opacity var(${dur}) var(${ease});`}</Code>{' '}
        <CopyButton text={`transition: opacity var(${dur}) var(${ease});`} label="Copy transition declaration" />
      </p>
    </div>
  );
};

/* ── Typography ────────────────────────────────────────────────────────── */

export const TypeTester = () => {
  const { brand } = useTheme();
  const pick = (cat: string) => tokensWhere((t) => t.category === cat && t.tier === 'Primitive');
  const sizes = pick('Font size').sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  const weights = pick('Font weight');
  const leads = pick('Line height');
  const tracks = pick('Letter spacing');
  const [text, setText] = useState('Jay Swaminarayan — the quick brown fox jumps over the lazy dog. 0123456789');
  const [size, setSize] = useState('--font-size-sm');
  const [weight, setWeight] = useState('--font-weight-regular');
  const [lead, setLead] = useState('--font-line-height-snug');
  const [track, setTrack] = useState('--font-letter-spacing-none');
  const [caps, setCaps] = useState(false);
  const family = `--font-family-${brand}`;
  const css = [
    `font-family: var(${family});`,
    `font-size: var(${size});`,
    `font-weight: var(${weight});`,
    `line-height: var(${lead});`,
    `letter-spacing: var(${track});`,
    caps ? 'text-transform: uppercase;' : '',
  ]
    .filter(Boolean)
    .join('\n');
  const sel = (label: string, value: string, set: (v: string) => void, opts: Token[]) => (
    <Field label={label}>
      <select value={value} onChange={(e) => set(e.target.value)} style={selectStyle}>
        {opts.map((t) => <option key={t.cssVar} value={t.cssVar}>{t.path.slice(2).join('.')} — {t.value}</option>)}
      </select>
    </Field>
  );
  return (
    <div className="baps-docs-foundation" style={{ margin: '0 0 1.5rem' }}>
      <BrandNote brand={brand} />
      <Field label="Sample text">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} style={{ ...selectStyle, resize: 'vertical' }} />
      </Field>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '0.75rem 0' }}>
        {sel('Size', size, setSize, sizes)}
        {sel('Weight', weight, setWeight, weights)}
        {sel('Line height', lead, setLead, leads)}
        {sel('Letter spacing', track, setTrack, tracks)}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', alignSelf: 'flex-end' }}>
          <input type="checkbox" checked={caps} onChange={(e) => setCaps(e.target.checked)} /> Caps
        </label>
      </div>
      <div
        style={{
          padding: '1rem',
          border: '1px solid var(--baps-docs-divider)',
          borderRadius: 8,
          overflowWrap: 'anywhere',
          fontFamily: `var(${family})`,
          fontSize: `var(${size})`,
          fontWeight: `var(${weight})` as never,
          lineHeight: `var(${lead})`,
          letterSpacing: `var(${track})`,
          textTransform: caps ? 'uppercase' : 'none',
          color: 'var(--baps-docs-heading)',
        }}
      >
        {text || ' '}
      </div>
      <pre style={{ fontFamily: mono, fontSize: '0.78rem', background: 'var(--baps-docs-code-ground)', padding: '0.75rem', borderRadius: 8, overflowX: 'auto', margin: '0.75rem 0 0.25rem' }}>{css}</pre>
      <CopyButton text={css} label="Copy typography CSS" />
    </div>
  );
};

/* ── Grid & layout ─────────────────────────────────────────────────────── */

/* The breakpoints the library's own @media rules use — measured, not
   proposed. 767px is the one shared mobile/desktop split (navbar, toolbar,
   drawer, internal navbar); the rest are stepper-only. */
export const BREAKPOINTS: Array<{ name: string; query: string; min: number; max?: number; used: string }> = [
  { name: 'XS', query: '(max-width: 360px)', min: 0, max: 360, used: 'stepper' },
  { name: 'SM', query: '(max-width: 480px)', min: 361, max: 480, used: 'stepper (425px and 480px steps)' },
  { name: 'MD — mobile / tablet', query: '(max-width: 767px)', min: 481, max: 767, used: 'navbar, toolbar, internal navbar, Sampark drawer' },
  { name: 'LG — laptop', query: '(max-width: 1024px)', min: 768, max: 1024, used: 'stepper' },
  { name: 'XL — desktop', query: '(min-width: 1025px)', min: 1025, used: 'default — every rule above is max-width, desktop-first' },
];

export const LayoutPreview = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [mode, setMode] = useState<'grid' | 'sidebar' | 'two' | 'contained'>('sidebar');
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const bp = BREAKPOINTS.find((b) => w >= b.min && (b.max === undefined || w <= b.max)) ?? BREAKPOINTS[BREAKPOINTS.length - 1];
  const mobile = w <= 767;
  const cols = mobile ? 4 : 12;
  const presets: Array<[string, number]> = [['Mobile 375', 375], ['Tablet 768', 768], ['Laptop 1024', 1024], ['Full', 0]];

  const panel: React.CSSProperties = { ...demoBox, padding: '0.5rem', minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const body = {
    grid: (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: mobile ? 'var(--space-4)' : 'var(--space-6)' }}>
        {Array.from({ length: cols }, (_, i) => <div key={i} style={{ ...panel, minHeight: 120 }}>{i + 1}</div>)}
      </div>
    ),
    sidebar: (
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '264px 1fr', gridTemplateRows: '56px 1fr', gap: 0, minHeight: 200 }}>
        <div style={{ ...panel, gridColumn: '1 / -1' }}>Top bar · 56px</div>
        {mobile ? null : <div style={panel}>Sidebar · 264px</div>}
        <div style={{ ...panel, padding: 'var(--space-6)' }}>{mobile ? 'Content — sidebar becomes a drawer' : 'Content · 24px gutters'}</div>
      </div>
    ),
    two: (
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 'var(--space-6)' }}>
        <div style={{ ...panel, minHeight: 120 }}>Column</div>
        <div style={{ ...panel, minHeight: 120 }}>Column</div>
      </div>
    ),
    contained: (
      <div style={{ ...panel, maxWidth: 680, margin: '0 auto', minHeight: 160 }}>Reading width · max 680px</div>
    ),
  }[mode];

  return (
    <div className="baps-docs-foundation" style={{ margin: '0 0 1.5rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '0 0 0.75rem', alignItems: 'center' }}>
        <Field label="Layout">
          <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} style={selectStyle}>
            <option value="sidebar">Sidebar + content</option>
            <option value="grid">Column grid</option>
            <option value="two">Two-column</option>
            <option value="contained">Contained (reading width)</option>
          </select>
        </Field>
        <span style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', alignSelf: 'flex-end' }}>
          {presets.map(([label, px]) => (
            <button key={label} type="button" className="baps-docs-copy" onClick={() => { if (ref.current) ref.current.style.width = px ? `${px}px` : '100%'; }}>
              {label}
            </button>
          ))}
        </span>
      </div>
      <p aria-live="polite" style={{ fontSize: '0.8rem', margin: '0 0 0.5rem' }}>
        <strong>{w}px</strong> — {bp.name} · {mode === 'grid' ? `${cols} columns` : mobile ? 'stacked' : 'side by side'}. Drag the corner to resize.
      </p>
      <div
        ref={ref}
        style={{ resize: 'horizontal', overflow: 'auto', width: '100%', maxWidth: '100%', minWidth: 280, padding: '0.75rem', border: '1px solid var(--baps-docs-divider)', borderRadius: 8, boxSizing: 'border-box' }}
      >
        {body}
      </div>
    </div>
  );
};

export const BreakpointTable = () => (
  <TableWrap label="Breakpoints">
    <thead>
      <tr><Th>Name</Th><Th>Media query</Th><Th>Range</Th><Th>Used by</Th></tr>
    </thead>
    <tbody>
      {BREAKPOINTS.map((b) => (
        <tr key={b.name}>
          <td style={{ ...cell, fontWeight: 600, whiteSpace: 'nowrap' }}>{b.name}</td>
          <td style={{ ...cell, whiteSpace: 'nowrap' }}><Code>{b.query}</Code></td>
          <td style={{ ...cell, whiteSpace: 'nowrap' }}>{b.min}–{b.max ?? '∞'}px</td>
          <td style={{ ...cell, fontSize: '0.8rem' }}>{b.used}</td>
        </tr>
      ))}
    </tbody>
  </TableWrap>
);

/* ── Audit ─────────────────────────────────────────────────────────────── */

type Check = {
  id: string;
  title: string;
  area: string;
  status: 'passed' | 'warning' | 'error' | 'deprecated';
  count: number;
  summary: string;
  files: Array<{ file: string; count: number }>;
  details: Array<{ file: string; line: number; text: string; status?: string }>;
};

const STATUS_LABEL = { passed: 'Passed', warning: 'Warning', error: 'Error', deprecated: 'Deprecated' } as const;
const STATUS_ICON = { passed: '✓', warning: '!', error: '✗', deprecated: '⌀' } as const;

export const AuditReport = ({ snapshot }: { snapshot: { generatedAt: string; generatedBy: string; scanned: { scss: number; components: number; tokens: number }; checks: Check[] } }) => {
  const [filter, setFilter] = useState<string>('all');
  const tally = snapshot.checks.reduce<Record<string, number>>((a, c) => ({ ...a, [c.status]: (a[c.status] ?? 0) + 1 }), {});
  const shown = snapshot.checks.filter((c) => filter === 'all' || c.status === filter);
  return (
    <div className="baps-docs-foundation">
      <p style={{ fontSize: '0.8rem', color: 'var(--baps-docs-muted)' }}>
        Snapshot of <strong>{snapshot.generatedAt}</strong> — {snapshot.scanned.scss} SCSS partials, {snapshot.scanned.components} components,{' '}
        {snapshot.scanned.tokens} tokens. Regenerate with <Code>{snapshot.generatedBy}</Code>.
      </p>
      <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0 0 1rem' }}>
        {(['all', 'passed', 'warning', 'error', 'deprecated'] as const).map((s) => (
          <button key={s} type="button" className="baps-docs-copy" aria-pressed={filter === s} data-status={s} onClick={() => setFilter(s)}>
            {s === 'all' ? `All (${snapshot.checks.length})` : `${STATUS_LABEL[s]} (${tally[s] ?? 0})`}
          </button>
        ))}
      </div>
      {shown.map((c) => (
        <details key={c.id} className="baps-docs-audit" data-status={c.status} style={{ border: '1px solid var(--baps-docs-divider)', borderRadius: 8, padding: '0.6rem 0.8rem', margin: '0 0 0.6rem' }}>
          <summary style={{ cursor: 'pointer', display: 'flex', gap: '0.6rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span className="baps-docs-status" data-status={c.status}>
              <span aria-hidden="true">{STATUS_ICON[c.status]}</span> {STATUS_LABEL[c.status]}
            </span>
            <strong>{c.title}</strong>
            <span style={{ color: 'var(--baps-docs-muted)', fontSize: '0.8rem' }}>{c.area} · {c.count}</span>
          </summary>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>{c.summary}</p>
          {c.files.length ? (
            <TableWrap label={`${c.title} — files`}>
              <thead><tr><Th>File</Th><Th>Count</Th></tr></thead>
              <tbody>
                {c.files.map((f) => (
                  <tr key={f.file}><td style={cell}><Code>{f.file}</Code></td><td style={cell}>{f.count}</td></tr>
                ))}
              </tbody>
            </TableWrap>
          ) : null}
          {c.details.length ? (
            <TableWrap label={`${c.title} — findings`}>
              <thead><tr><Th>Where</Th><Th>Finding</Th></tr></thead>
              <tbody>
                {c.details.map((d, i) => (
                  <tr key={i}>
                    <td style={{ ...cell, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      {d.status ? <span className="baps-docs-status" data-status={d.status}>{STATUS_LABEL[d.status as keyof typeof STATUS_LABEL]}</span> : null}{' '}
                      <Code>{d.line ? `${d.file.split('/').pop()}:${d.line}` : d.file}</Code>
                    </td>
                    <td style={{ ...cell, fontSize: '0.78rem' }}><Code>{d.text}</Code></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          ) : null}
        </details>
      ))}
    </div>
  );
};

/* ── Text styles ───────────────────────────────────────────────────────────
   The named roles, each as the token set it is built from. Heading sizes are
   the ones the Typography showcase and design-language.md document; weights
   follow "400 body, 500 labels, 600 headings". */
const TEXT_STYLES: Array<{ name: string; size: string; weight: string; lead: string; track?: string; caps?: boolean; link?: boolean; code?: boolean; use: string }> = [
  { name: 'H1', size: '3xl', weight: 'semibold', lead: 'snug', use: 'Prominent page title' },
  { name: 'H2', size: '2xl', weight: 'semibold', lead: 'snug', use: 'Section title' },
  { name: 'H3', size: 'xl', weight: 'semibold', lead: 'snug', use: 'Page, dialog and drawer title' },
  { name: 'H4', size: 'lg', weight: 'semibold', lead: 'snug', use: 'Sub-section' },
  { name: 'H5', size: 'md', weight: 'semibold', lead: 'snug', use: 'Card title' },
  { name: 'H6', size: 'sm', weight: 'semibold', lead: 'snug', use: 'Group label' },
  { name: 'Body', size: 'sm', weight: 'regular', lead: 'normal', use: 'Default text, inputs, tables — both brands' },
  { name: 'Body large', size: 'md', weight: 'regular', lead: 'relaxed', use: 'Long-form reading' },
  { name: 'Label', size: 'sm', weight: 'medium', lead: 'snug', use: 'Form labels, buttons, badges' },
  { name: 'Caption', size: 'xs', weight: 'regular', lead: 'snug', use: 'Hint text, metadata' },
  { name: 'Caps', size: 'xs', weight: 'semibold', lead: 'snug', track: 'caps', caps: true, use: 'Column headers, eyebrows — short labels only' },
  { name: 'Link', size: 'sm', weight: 'medium', lead: 'normal', link: true, use: 'Inline navigation — see baps-link' },
  { name: 'Code', size: 'xs', weight: 'regular', lead: 'normal', code: true, use: 'IDs, receipt numbers — mono font is a target, not installed' },
];

export const TypeStyles = () => {
  const { brand } = useTheme();
  return (
    <TableWrap label="Text styles">
      <thead>
        <tr><Th>Style</Th><Th>Specimen</Th><Th>Tokens</Th><Th>Use</Th></tr>
      </thead>
      <tbody>
        {TEXT_STYLES.map((s) => {
          const vars = [
            `--font-size-${s.size}`,
            `--font-weight-${s.weight}`,
            `--font-line-height-${s.lead}`,
            ...(s.track ? [`--font-letter-spacing-${s.track}`] : []),
          ];
          const css = [
            s.code ? 'font-family: ui-monospace, monospace;' : `font-family: var(--font-family-${brand});`,
            `font-size: var(${vars[0]});`,
            `font-weight: var(${vars[1]});`,
            `line-height: var(${vars[2]});`,
            ...(s.track ? [`letter-spacing: var(${vars[3]});`, 'text-transform: uppercase;'] : []),
          ].join('\n');
          return (
            <tr key={s.name}>
              <td style={{ ...cell, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.name}</td>
              <td style={{ ...cell, minWidth: '12rem' }}>
                <span
                  style={{
                    fontFamily: s.code ? mono : `var(--font-family-${brand})`,
                    fontSize: `var(${vars[0]})`,
                    fontWeight: `var(${vars[1]})` as never,
                    lineHeight: `var(${vars[2]})`,
                    letterSpacing: s.track ? `var(${vars[3]})` : undefined,
                    textTransform: s.caps ? 'uppercase' : undefined,
                    color: s.link ? 'var(--baps-docs-link)' : 'var(--baps-docs-heading)',
                    textDecoration: s.link ? 'underline' : undefined,
                  }}
                >
                  {s.code ? 'REF-2026-0042' : 'Sabha attendance'}
                </span>
              </td>
              <td style={{ ...cell, fontSize: '0.75rem' }}>
                {vars.map((v) => <div key={v}><Code>{v}</Code></div>)}
              </td>
              <td style={{ ...cell, fontSize: '0.8rem' }}>
                {s.use}
                <div style={{ marginTop: '0.25rem' }}><CopyButton text={css} label={`Copy ${s.name} CSS`}>Copy CSS</CopyButton></div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableWrap>
  );
};
