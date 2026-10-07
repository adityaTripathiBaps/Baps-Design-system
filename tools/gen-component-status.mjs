/**
 * Writes Guidelines › Component status from the repository, not from memory.
 *
 * A status table typed out by a person drifts the first time a snippet is
 * added and nobody edits the page, and a stale status page is worse than none:
 * it is a confident claim that a reader has no reason to doubt. So the table
 * is generated from `node tools/check-snippets.mjs --json`, which reads the
 * actual *.snippets.ts files, and the page says so at the top.
 *
 *   node tools/gen-component-status.mjs          write the page
 *   node tools/gen-component-status.mjs --check  fail if it is out of date
 *
 * The --check mode is the part that matters in CI: it regenerates into memory
 * and compares, so a snippet added without rerunning this is a failure rather
 * than a silently wrong page.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = 'libs/ui-kit/src/lib/docs/component-status.mdx';
const CHECK = process.argv.includes('--check');

const rows = JSON.parse(
  execFileSync('node', ['tools/check-snippets.mjs', '--json'], {
    encoding: 'utf8',
  }),
);

const WORKING = '✅';
const PARTIAL = '◐';
const NONE = '—';

/**
 * React and Next carry the same markup, so they carry the same status. A page
 * that declares any set `interactive: true` is markup-and-styles-only: the
 * component's behaviour comes from Angular and PrimeNG, and CSS does not
 * carry it across.
 */
const frameworkStatus = (r) => {
  if (!r.keys.includes('react')) return NONE;
  return r.interactive ? PARTIAL : WORKING;
};

/**
 * Custom is the honest one. A wrapper's authored markup counts only when a
 * drift guard proves it against the live component; without one it is a second
 * implementation of the same design with nothing holding the two together.
 */
const customStatus = (r) => {
  if (!r.customCount) return NONE;
  if (r.wrapper && !r.drift) return NONE;
  // Counted against the examples on the page, not against the sets that have
  // any snippet at all. Tag has 13 sets and 10 Custom blocks — three of its
  // shapes have no standalone rule — so this column reads ◐ for it, not ✅.
  return r.customCount === r.examples ? WORKING : PARTIAL;
};

const covered = rows.filter((r) => r.covered > 0);
const totalExamples = rows.reduce((n, r) => n + r.examples, 0);
const totalCovered = rows.reduce((n, r) => n + r.covered, 0);

const table = [
  '| Component | Examples | Interactive | React | Next.js | PrimeNG-Angular | Custom |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map((r) => {
    const fw = frameworkStatus(r);
    return `| ${r.component} | ${r.covered} / ${r.examples} | ${r.interactive ? 'yes' : 'no'} | ${fw} | ${fw} | ${r.keys.includes('primeng') ? WORKING : NONE} | ${customStatus(r)} |`;
  }),
].join('\n');

const page = `import { Meta } from '@storybook/blocks';

<Meta title="Guidelines/Component status" />

{/* GENERATED FILE — do not edit by hand.
    Run: node tools/gen-component-status.mjs
    CI:  node tools/gen-component-status.mjs --check */}

# Component status

Which components can be used outside Angular, and how far.

This table is generated from \`node tools/check-snippets.mjs --json\`, which
reads the \`*.snippets.ts\` files themselves. It is not maintained by hand and
cannot drift from the repository: \`node tools/gen-component-status.mjs --check\`
fails if it is out of date.

This is **documentation-snippet coverage**, not React component completion.
A React/Next snippet never counts as a reusable React component; the typed
\`@org/ui-kit-react\` Batch 2 implementation status is tracked separately in
\`packages/ui-kit-react/STATUS.md\`.

**${covered.length} of ${rows.length} components** have snippets;
**${totalCovered} of ${totalExamples} examples** are covered.

${table}

## What the columns mean

**React** and **Next.js** carry the same markup, so they carry the same
status. ${WORKING} means the snippet uses real BAPS classes over semantic HTML
and renders correctly once \`@org/tokens/css\` and \`@org/ui-kit/styles\` are
imported.

**PrimeNG-Angular** is paste-ready \`<baps-*>\` markup for an Angular app. This
is the only column that gives you a working component rather than a picture of
one.

**Custom** is standalone HTML — no framework at all. For a component that does
not wrap PrimeNG it is the component's own template, so it is correct by
construction. For a wrapper it is hand-authored and only counts when a drift
guard renders both and compares them property by property; without that guard
the column reads ${NONE} however good the markup looks.

## What ${PARTIAL} means

**Markup and styles only.** The classes are real and the thing looks right.
What is missing is behaviour: opening and closing, focus management, focus
trapping, positioning, keyboard navigation, sorting, paging. An Angular
component receives all of that from Angular and PrimeNG, and CSS carries none
of it into React. Those examples show a visible note saying so, and the Copy
prompt sends the same sentence.

A ${PARTIAL} in the Custom column means something narrower: some of that
component's examples have verified standalone markup and some do not, usually
because one shape has no rule in the standalone partial.

## What ${NONE} means

No support yet, and the reason is almost always the same. A PrimeNG wrapper's
design is not in a stylesheet: the tokens go through \`definePreset\` and
**PrimeNG builds the CSS in the browser at runtime**, so there is no file to
ship. Making one means authoring a \`baps-*\` partial from tokens and proving it
with a drift guard. Where the tokens for that do not exist, the work is a
design task before it is an implementation one.

## Standalone CSS packaging

Shipping today, and measured:

| Import | What it carries |
| --- | --- |
| \`@org/tokens/css\` | Every design token as a CSS custom property |
| \`@org/ui-kit/styles\` | All component stylesheets, the Inter \`@font-face\`, \`--font-family\`, the Sampark scopes, the dark scope |
| \`@org/ui-kit/styles/<name>\` | One component — **no** \`@font-face\` and **no** \`--font-family\` |
| \`@org/ui-kit/icons\` | The glyph registry as plain data; needs a bundler |

Setup for each route is on the **Installation** page.

## App Sell

App Sell appears in the brand toolbar and has no palette, no tokens and no
preset, so choosing it currently renders MyBKY. Creating that palette is a
design task and no colour is invented for it here. The architecture is ready
for it: a brand is a token set plus a scope class, and no component markup
changes to add a third.
`;

if (CHECK) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== page) {
    console.error(
      `${OUT} is out of date.\nRun: node tools/gen-component-status.mjs`,
    );
    process.exit(1);
  }
  console.log('component status page is up to date');
} else {
  writeFileSync(OUT, page);
  console.log(
    `wrote ${OUT} — ${covered.length}/${rows.length} components, ${totalCovered}/${totalExamples} examples`,
  );
}
