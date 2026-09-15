/**
 * Reusable documentation blocks for the component pages.
 *
 * Scope note: this file deliberately does NOT reimplement what addon-docs
 * already ships. `<Canvas>` already renders a bordered demo frame with a
 * show-code toggle and a copy button; `<ArgTypes>` already renders a props
 * table from the Angular metadata. Rebuilding either would mean maintaining a
 * worse copy, so PropsTable is a re-export and DemoCard/CodeBlock are thin
 * wrappers that add the parts addon-docs has no opinion about — a titled,
 * anchorable section and a filename header.
 *
 * Only three blocks here are genuinely new: ResourceTabs, TokensTable and
 * KeyboardTable.
 *
 * Every colour comes from the `--baps-docs-*` tier defined in
 * ../../src/_docs-shell.scss, so these blocks follow both the light/dark toggle
 * and the brand switcher without knowing either exists.
 */
import React, { useEffect, useState } from 'react';
import { Canvas, Source } from '@storybook/blocks';

/** Source only accepts the languages Prism is loaded for, so mirror its type. */
type SourceLanguage = React.ComponentProps<typeof Source>['language'];

/** Storybook's own props table. Re-exported so pages have one vocabulary. */
export { ArgTypes as PropsTable, Controls } from '@storybook/blocks';

const mono = "var(--font-family-mono, ui-monospace, 'JetBrains Mono', monospace)";

/* ── ResourceTabs ──────────────────────────────────────────────────────────
   PrimeNG splits Features / Theming / API / Passthrough across separate
   ROUTES. A Storybook docs page is a single scrolling document, so real tabs
   would mean hiding content the "On this page" nav still links to, and
   breaking in-page anchors. These are anchors styled as a tab strip: same
   affordance, no hidden content, and deep links keep working.

   A tab renders only if its target heading is actually on the page, so a
   component with no Theming section shows no dead tab. */
export const ResourceTabs = ({
  sections = ['Usage', 'Examples', 'Theming', 'API', 'Accessibility'],
}: {
  sections?: string[];
}) => {
  const [present, setPresent] = useState<string[]>([]);

  useEffect(() => {
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    // The headings are rendered by MDX in the same pass, so wait a frame.
    const id = requestAnimationFrame(() =>
      setPresent(sections.filter((s) => document.getElementById(slug(s)))),
    );
    return () => cancelAnimationFrame(id);
  }, [sections]);

  if (present.length < 2) return null;

  return (
    <nav
      aria-label="Sections on this page"
      style={{
        display: 'flex',
        gap: '0.25rem',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--baps-docs-divider)',
        margin: '0 0 1.5rem',
        paddingBottom: '0.5rem',
      }}
    >
      {present.map((s) => (
        <a
          key={s}
          href={`#${s.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            textDecoration: 'none',
            color: 'var(--baps-docs-text)',
          }}
        >
          {s}
        </a>
      ))}
    </nav>
  );
};

/* ── DemoCard ──────────────────────────────────────────────────────────────
   One example: a heading the TOC can pick up, one sentence of context, and the
   live demo. `of` is passed straight through to Canvas. */
export const DemoCard = ({
  title,
  description,
  of,
  children,
}: {
  title: string;
  description?: string;
  of?: unknown;
  children?: React.ReactNode;
}) => (
  <section style={{ margin: '0 0 2rem' }}>
    <h3 id={title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{title}</h3>
    {description ? (
      <p style={{ color: 'var(--baps-docs-text)', margin: '0 0 0.75rem' }}>{description}</p>
    ) : null}
    {of ? <Canvas of={of as never} /> : children}
  </section>
);

/* ── CodeBlock ─────────────────────────────────────────────────────────────
   Storybook's <Source> with a filename strip above it. The strip is what makes
   a snippet actionable — it says which file the code belongs in. */
export const CodeBlock = ({
  filename,
  code,
  // No default: Source only accepts the languages Prism is registered for, and
  // its union does not include the 'ts' shorthand. Callers pass 'typescript',
  // 'html', and so on.
  language,
}: {
  filename?: string;
  code: string;
  language?: SourceLanguage;
}) => (
  <div style={{ margin: '0 0 1.25rem' }}>
    {filename ? (
      <div
        style={{
          fontFamily: mono,
          fontSize: '0.75rem',
          color: 'var(--baps-docs-muted)',
          background: 'var(--baps-docs-code-ground)',
          border: '1px solid var(--baps-docs-divider)',
          borderBottom: 'none',
          borderRadius: '0.5rem 0.5rem 0 0',
          padding: '0.4rem 0.75rem',
        }}
      >
        {filename}
      </div>
    ) : null}
    <Source code={code} language={language} />
  </div>
);

const cell: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--baps-docs-divider)',
  textAlign: 'left',
  verticalAlign: 'top',
};

const Table = ({ head, children }: { head: string[]; children: React.ReactNode }) => (
  <div style={{ overflowX: 'auto', margin: '0 0 1.5rem' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              style={{
                ...cell,
                fontSize: '0.72rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--baps-docs-muted)',
                whiteSpace: 'nowrap',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Swatch = ({ value }: { value?: string }) =>
  value ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: mono }}>
      <span
        aria-hidden="true"
        style={{
          width: '0.9rem',
          height: '0.9rem',
          borderRadius: '3px',
          background: value,
          boxShadow: 'inset 0 0 0 1px rgba(128,128,128,.45)',
          flex: 'none',
        }}
      />
      {value}
    </span>
  ) : (
    <span style={{ color: 'var(--baps-docs-muted)' }}>&mdash;</span>
  );

/* ── TokensTable ───────────────────────────────────────────────────────────
   The design tokens a component consumes, with both modes side by side. Shown
   together on purpose: a token whose dark column is empty is exactly the
   parity gap this documentation is meant to surface. */
export const TokensTable = ({
  tokens,
}: {
  tokens: { token: string; light?: string; dark?: string; description?: string }[];
}) => (
  <Table head={['Token', 'Light', 'Dark', 'What it controls']}>
    {tokens.map((t) => (
      <tr key={t.token}>
        <td style={{ ...cell, fontFamily: mono, whiteSpace: 'nowrap' }}>{t.token}</td>
        <td style={cell}>
          <Swatch value={t.light} />
        </td>
        <td style={cell}>
          <Swatch value={t.dark} />
        </td>
        <td style={cell}>{t.description ?? ''}</td>
      </tr>
    ))}
  </Table>
);

/* ── KeyboardTable ─────────────────────────────────────────────────────────
   Replaces the hand-written markdown tables, so every page presents keys the
   same way and a key renders as a <kbd> rather than backticked prose. */
export const KeyboardTable = ({ rows }: { rows: { key: string; action: string }[] }) => (
  <Table head={['Key', 'Function']}>
    {rows.map((r) => (
      <tr key={r.key}>
        <td style={{ ...cell, whiteSpace: 'nowrap' }}>
          {r.key.split(/\s*\+\s*/).map((k, i, all) => (
            <React.Fragment key={k}>
              <kbd
                style={{
                  fontFamily: mono,
                  fontSize: '0.78rem',
                  background: 'var(--baps-docs-code-ground)',
                  border: '1px solid var(--baps-docs-control)',
                  borderRadius: '4px',
                  padding: '0.1rem 0.4rem',
                }}
              >
                {k}
              </kbd>
              {i < all.length - 1 ? <span style={{ margin: '0 0.3rem' }}>+</span> : null}
            </React.Fragment>
          ))}
        </td>
        <td style={cell}>{r.action}</td>
      </tr>
    ))}
  </Table>
);
