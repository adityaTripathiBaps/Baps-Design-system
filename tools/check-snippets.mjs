// Guard for the framework snippets that feed the docs code viewer.
//
// A snippet is documentation a reader copies into a real app, so the ways it
// can be wrong are the ways documentation is worst: a class that does not
// exist, a colour typed in by hand instead of a token, a key pointing at a
// story that was renamed, a Custom tab for a component whose CSS cannot leave
// Angular. None of those fail a build or a test — they just hand someone
// markup that does nothing.
//
//   node tools/check-snippets.mjs            exit 1 on any finding
//   node tools/check-snippets.mjs --report   the coverage table
//
// Node only, no dependencies.
import { readdirSync, readFileSync, existsSync } from 'node:fs';

const COMPONENTS = 'libs/ui-kit/src/lib/components';
const STYLES = 'libs/ui-kit/src/lib/styles';
const TOOLS = 'tools';

/** The only framework keys the docs blocks know how to render. */
const ALLOWED_KEYS = ['react', 'next', 'primeng', 'custom'];

/** Partials every component's markup may lean on, not just its own. */
const SHARED_PARTIALS = [
  `${STYLES}/layout/_common.scss`,
  `${STYLES}/layout/_fonts.scss`,
  `${STYLES}/layout/_dashboard.scss`,
  `${STYLES}/layout/_step-page.scss`,
  `${STYLES}/layout/_touch-targets.scss`,
];

const findings = [];
const report = [];
const fail = (component, rule, detail) => findings.push({ component, rule, detail });

const read = (p) => readFileSync(p, 'utf8');
const list = (dir) => (existsSync(dir) ? readdirSync(dir) : []);

/** Every class name a stylesheet defines, from the whole styles tree at once. */
const definedClasses = (() => {
  const out = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.scss')) {
        const text = read(p);
        for (const m of text.matchAll(/\.(baps-[a-z0-9_-]+)/g)) out.add(m[1]);
        // `&--modifier` inside a parent block: reconstruct the full name.
        let parent = null;
        for (const line of text.split('\n')) {
          const open = line.match(/^\.(baps-[a-z0-9_-]+)\s*\{/);
          if (open) parent = open[1];
          const amp = line.match(/^\s*&(--?[a-z0-9_-]+)/);
          if (amp && parent) out.add(parent + amp[1]);
        }
      }
    }
  };
  walk(STYLES);
  // Components whose CSS still lives in an inline `styles:` block.
  for (const dir of list(COMPONENTS)) {
    const f = `${COMPONENTS}/${dir}/${dir}.component.ts`;
    if (!existsSync(f)) continue;
    for (const m of read(f).matchAll(/\.(baps-[a-z0-9_-]+)/g)) out.add(m[1]);
  }
  return out;
})();

for (const dir of list(COMPONENTS).sort()) {
  const snippetFile = `${COMPONENTS}/${dir}/${dir}.snippets.ts`;
  const storiesFile = `${COMPONENTS}/${dir}/${dir}.stories.ts`;
  const componentFile = `${COMPONENTS}/${dir}/${dir}.component.ts`;

  const componentSrc = existsSync(componentFile) ? read(componentFile) : '';
  const isWrapper = /from 'primeng\//.test(componentSrc) || /<p-[a-z]/.test(componentSrc);
  const storiesSrc = existsSync(storiesFile) ? read(storiesFile) : '';
  const storyExports = new Set(
    [...storiesSrc.matchAll(/^export const (\w+)/gm)].map((m) => m[1]),
  );
  const exampleCount = [...storyExports].filter((s) => {
    const nameMatch = storiesSrc.match(
      new RegExp(`export const ${s}[^=]*=\\s*\\{[\\s\\S]{0,400}?name:\\s*'([^']+)'`),
    );
    return !/^Interaction( |—)/.test(nameMatch?.[1] ?? s) && !/Interaction$/.test(s);
  }).length;

  if (!existsSync(snippetFile)) {
    report.push({ component: dir, wrapper: isWrapper, examples: exampleCount, covered: 0, keys: new Set() });
    continue;
  }

  const src = read(snippetFile);

  // ── 1. keys ───────────────────────────────────────────────────────────────
  const keysUsed = new Set([...src.matchAll(/^\s{4}(\w+):\s*[`'"]/gm)].map((m) => m[1]));
  for (const key of keysUsed) {
    if (!ALLOWED_KEYS.includes(key)) {
      fail(dir, 'key', `"${key}" is not a framework key — allowed: ${ALLOWED_KEYS.join(', ')}`);
    }
  }

  // ── 2. every example maps to a story export ───────────────────────────────
  const examples = [...src.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]);
  for (const ex of examples) {
    if (!storyExports.has(ex)) {
      fail(dir, 'story', `example "${ex}" has no matching export in ${dir}.stories.ts`);
    }
  }

  // ── 3. raw colours ────────────────────────────────────────────────────────
  // Only inside the snippet strings, not the file's prose: a header that
  // records a MEASURED value ("border #e4ecf1") is evidence, not styling.
  const snippetStrings = [...src.matchAll(/`([^`]*)`/g)].map((m) => m[1]).join('\n');
  for (const m of snippetStrings.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g)) {
    fail(dir, 'colour', `${m[0]} is written into a snippet — use a token`);
  }

  // ── 4/5. utility-class frameworks ─────────────────────────────────────────
  for (const m of snippetStrings.matchAll(/class(?:Name)?="([^"]*)"/g)) {
    for (const cls of m[1].split(/\s+/).filter(Boolean)) {
      if (/^(bg|text|p|px|py|m|mx|my|w|h|flex|grid|gap|rounded|shadow|border)-[a-z0-9[\]./-]+$/.test(cls)) {
        fail(dir, 'utility', `"${cls}" looks like a Tailwind utility — use the design system's classes`);
      }
    }
  }

  // ── 6. BAPS classes must exist ────────────────────────────────────────────
  for (const m of snippetStrings.matchAll(/\b(baps-[a-z0-9_-]+)/g)) {
    const cls = m[1];
    // element names (<baps-card>) are not classes
    if (new RegExp(`<${cls}[\\s/>]`).test(snippetStrings)) continue;
    if (!definedClasses.has(cls)) {
      fail(dir, 'class', `"${cls}" appears in a snippet but no stylesheet defines it`);
    }
  }

  // ── 7. an authored Custom tab on a wrapper needs a drift guard ────────────
  if (keysUsed.has('custom') && isWrapper) {
    const guard = `${TOOLS}/check-${dir}-drift.mjs`;
    if (!existsSync(guard)) {
      fail(dir, 'drift', `authored Custom markup on a PrimeNG wrapper with no ${guard}`);
    }
  }

  // ── 8. interactive sets must say so ───────────────────────────────────────
  const INTERACTIVE = /\b(onClick|onChange|useState|aria-expanded|role="dialog"|role="menu")/;
  if ((keysUsed.has('react') || keysUsed.has('next')) && INTERACTIVE.test(snippetStrings)) {
    if (!/interactive:\s*true/.test(src)) {
      fail(
        dir,
        'interactive',
        'React/Next markup carries behaviour but the set does not set `interactive: true`, ' +
          'so the shared "markup and styles only" note cannot render',
      );
    }
  }

  report.push({
    component: dir,
    wrapper: isWrapper,
    examples: exampleCount,
    covered: examples.length,
    keys: keysUsed,
  });
}

// ── output ──────────────────────────────────────────────────────────────────
if (process.argv.includes('--report')) {
  const mark = (row, key) => (row.keys.has(key) ? (row.wrapper && key === 'custom' ? '◐' : '✅') : '—');
  console.log('component            kind       examples  covered  react  next  primeng  custom');
  console.log('-'.repeat(84));
  for (const r of report.sort((a, b) => b.covered - a.covered || a.component.localeCompare(b.component))) {
    console.log(
      r.component.padEnd(20),
      (r.wrapper ? 'wrapper' : 'standalone').padEnd(10),
      String(r.examples).padStart(8),
      String(r.covered).padStart(8),
      mark(r, 'react').padStart(6),
      mark(r, 'next').padStart(5),
      mark(r, 'primeng').padStart(8),
      mark(r, 'custom').padStart(7),
    );
  }
  const withSnippets = report.filter((r) => r.covered > 0);
  console.log('-'.repeat(84));
  console.log(
    `${withSnippets.length} of ${report.length} components have snippets; ` +
      `${withSnippets.reduce((n, r) => n + r.covered, 0)} of ` +
      `${report.reduce((n, r) => n + r.examples, 0)} examples covered`,
  );
}

if (findings.length) {
  console.error(`\n${findings.length} snippet finding${findings.length === 1 ? '' : 's'}:\n`);
  for (const f of findings) console.error(`  ${f.component.padEnd(14)} ${f.rule.padEnd(12)} ${f.detail}`);
  process.exitCode = 1;
} else {
  console.log(`snippets OK — ${report.filter((r) => r.covered > 0).length} snippet files checked`);
}
