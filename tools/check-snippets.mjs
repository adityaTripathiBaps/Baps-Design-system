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
import ts from 'typescript';

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
const fail = (component, rule, detail) =>
  findings.push({ component, rule, detail });

const read = (p) => readFileSync(p, 'utf8');
const list = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
        .map((entry) => entry.name)
    : [];

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
  const isWrapper =
    /from 'primeng\//.test(componentSrc) || /<p-[a-z]/.test(componentSrc);
  const storiesSrc = existsSync(storiesFile) ? read(storiesFile) : '';
  const storyExports = new Set();
  if (storiesSrc) {
    const sf = ts.createSourceFile(
      storiesFile,
      storiesSrc,
      ts.ScriptTarget.Latest,
      true,
    );
    ts.forEachChild(sf, (node) => {
      if (
        ts.isVariableStatement(node) &&
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        for (const decl of node.declarationList.declarations) {
          if (decl.name) storyExports.add(decl.name.getText(sf));
        }
      }
    });
  }
  const exampleCount = [...storyExports].filter((s) => {
    let nameMatch = s;
    if (storiesSrc) {
      const sf = ts.createSourceFile(
        storiesFile,
        storiesSrc,
        ts.ScriptTarget.Latest,
        true,
      );
      ts.forEachChild(sf, (node) => {
        if (ts.isVariableStatement(node)) {
          for (const decl of node.declarationList.declarations) {
            if (
              decl.name &&
              decl.name.getText(sf) === s &&
              decl.initializer &&
              ts.isObjectLiteralExpression(decl.initializer)
            ) {
              for (const p of decl.initializer.properties) {
                if (
                  p.name &&
                  p.name.getText(sf) === 'name' &&
                  ts.isPropertyAssignment(p)
                ) {
                  nameMatch = p.initializer.getText(sf).replace(/['"]/g, '');
                }
              }
            }
          }
        }
      });
    }
    return !/^Interaction( |—)/.test(nameMatch) && !/Interaction$/.test(s);
  }).length;

  if (!existsSync(snippetFile)) {
    report.push({
      component: dir,
      wrapper: isWrapper,
      examples: exampleCount,
      covered: 0,
      keys: new Set(),
    });
    continue;
  }

  const src = read(snippetFile);

  // ── 1. keys ───────────────────────────────────────────────────────────────
  const keysUsed = new Set();
  const examplesList = [];
  let customCountAST = 0;
  let sfSnippet = ts.createSourceFile(
    snippetFile,
    src,
    ts.ScriptTarget.Latest,
    true,
  );
  ts.forEachChild(sfSnippet, (node) => {
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of node.declarationList.declarations) {
        if (
          decl.initializer &&
          ts.isObjectLiteralExpression(decl.initializer)
        ) {
          for (const exProp of decl.initializer.properties) {
            if (ts.isPropertyAssignment(exProp) && exProp.name) {
              const exName = exProp.name.getText(sfSnippet);
              examplesList.push(exName);
              if (ts.isObjectLiteralExpression(exProp.initializer)) {
                let hasCustom = false;
                for (const fwProp of exProp.initializer.properties) {
                  if (ts.isPropertyAssignment(fwProp) && fwProp.name) {
                    const fwKey = fwProp.name.getText(sfSnippet);
                    if (fwKey !== 'interactive') keysUsed.add(fwKey);
                    if (fwKey === 'custom') hasCustom = true;
                  } else if (
                    ts.isSpreadAssignment(fwProp) &&
                    ts.isCallExpression(fwProp.expression) &&
                    ts.isIdentifier(fwProp.expression.expression) &&
                    /^(?:examples|frameworkExamples)$/.test(
                      fwProp.expression.expression.text,
                    )
                  ) {
                    // The typed helper used by React-ready snippet files
                    // returns exactly Pick<SnippetSet, 'react' | 'next'>.
                    // Count those authored tabs instead of reporting a false
                    // gap merely because the object uses a spread.
                    keysUsed.add('react');
                    keysUsed.add('next');
                  }
                }
                if (hasCustom) customCountAST++;
              }
            }
          }
        }
      }
    }
  });
  for (const key of keysUsed) {
    if (!ALLOWED_KEYS.includes(key)) {
      fail(
        dir,
        'key',
        `"${key}" is not a framework key — allowed: ${ALLOWED_KEYS.join(', ')}`,
      );
    }
  }

  // ── 2. every example maps to a story export ───────────────────────────────
  const examples = examplesList;
  const customCount = customCountAST;
  for (const ex of examples) {
    if (!storyExports.has(ex)) {
      fail(
        dir,
        'story',
        `example "${ex}" has no matching export in ${dir}.stories.ts`,
      );
    }
  }

  // ── 3. raw colours ────────────────────────────────────────────────────────
  // Only inside the snippet strings, not the file's prose: a header that
  // records a MEASURED value ("border #e4ecf1") is evidence, not styling.
  // Only the template literals that ARE snippets: the ones assigned to a
  // framework key. Matching every backtick pair also swept up the inline code
  // spans in the file's own doc comment, which is how a header sentence
  // explaining that card nests `baps-avatar` was reported as card using an
  // undefined class.
  const snippetStrings = [
    ...src.matchAll(
      /\b(?:react|next|primeng|custom|htmlcss):\s*`([\s\S]*?)`,?\s*$/gm,
    ),
  ]
    .map((m) => m[1])
    .join('\n');

  // Comments inside a snippet are prose for the reader, not markup. A snippet
  // that says "there is no baps-spinner-large class" is being accurate, and the
  // first version of this guard flagged it for naming the class it warns about.
  const snippetCode = snippetStrings
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  for (const m of snippetCode.matchAll(
    /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g,
  )) {
    fail(dir, 'colour', `${m[0]} is written into a snippet — use a token`);
  }

  // ── 4/5. utility-class frameworks ─────────────────────────────────────────
  for (const m of snippetStrings.matchAll(/class(?:Name)?="([^"]*)"/g)) {
    for (const cls of m[1].split(/\s+/).filter(Boolean)) {
      if (
        /^(?:bg|text|px|py|m|mx|my|w|h|flex|grid|gap|rounded|shadow|border)-[a-z0-9[\]./-]+$/.test(
          cls,
        ) ||
        /^p-(?:\d|\[)/.test(cls)
      ) {
        fail(
          dir,
          'utility',
          `"${cls}" looks like a Tailwind utility — use the design system's classes`,
        );
      }
    }
  }

  // ── 6. BAPS classes must exist ────────────────────────────────────────────
  for (const m of snippetCode.matchAll(/\b(baps-[a-z0-9_-]+)/g)) {
    const cls = m[1];
    // element names (<baps-card>, <baps-avatar>) are not classes
    if (new RegExp(`<${cls}[\\s/>]`).test(snippetCode)) continue;
    // a CSS custom property is not a class either.  matches between the
    // second dash and the b of --baps-icon-size, so without this the size
    // custom property every raw <baps-icon> has to set reads as six uses of
    // an undefined class — which is what it reported the first time an icon
    // snippet was written.
    if (snippetCode[m.index - 1] === '-') continue;
    // a name completed at runtime — `baps-alert--${severity}` — cannot be
    // checked against a stylesheet, and its stem is not a class on its own
    // the `\` is there because the snippet is itself inside a template literal,
    // so its interpolations are written escaped
    if (/^\\?\$\{/.test(snippetCode.slice(m.index + cls.length))) continue;
    if (!definedClasses.has(cls)) {
      fail(
        dir,
        'class',
        `"${cls}" appears in a snippet but no stylesheet defines it`,
      );
    }
  }

  // ── 7. an authored Custom tab on a wrapper needs a drift guard ────────────
  //
  // Two things count as that guard, because there are two ways to earn the
  // claim. A check-<name>-drift.mjs diffs the raw markup against the live
  // component property by property. A case in check-standalone.mjs goes
  // further: it replays the markup on a bare page with only the kit's CSS,
  // which proves the component needs no Angular at all. Standalone is the
  // stronger claim, so it satisfies this rule too.
  //
  // The distinction matters for a component like navbar, which imports
  // primeng/ripple — a behaviour directive with no skin. `isWrapper` is a
  // text match and cannot tell that from a real PrimeNG skin; the standalone
  // run can, and did.
  if (keysUsed.has('custom') && isWrapper) {
    const drift = `${TOOLS}/check-${dir}-drift.mjs`;
    const standaloneFile = `${TOOLS}/check-standalone.mjs`;
    const standalone = existsSync(standaloneFile) ? read(standaloneFile) : '';
    const proven = new RegExp(`name: '${dir}'`).test(standalone);
    if (!existsSync(drift) && !proven) {
      fail(
        dir,
        'drift',
        `authored Custom markup on a PrimeNG wrapper with no ${drift} and no case in check-standalone.mjs`,
      );
    }
  }

  // ── 8. markup-only sets must say so ───────────────────────────────────────
  //
  // The shared note says behaviour "needs a React implementation (not provided
  // yet)". That is true of a component whose opening, focus trapping and
  // keyboard handling come from Angular and PrimeNG, and false of one whose
  // React block actually implements them — so the test is not "does this
  // markup look interactive" but "is the behaviour missing".
  //
  // The first version asked the looser question and was wrong three times:
  // alert Dismissible, card Interactive and toggle-switch all implement their
  // behaviour in the React block, and all three were made to display a note
  // telling the reader it was not provided. Toggle switch is the starkest —
  // its control is a native <input type="checkbox">, so Space, Tab and the
  // focus ring come from the platform and would work with no JavaScript at
  // all.
  //
  // So: behaviour is MISSING when the markup carries the ARIA of an
  // interactive widget and nothing in the block implements it. State or a
  // handler means it is implemented.
  const BEHAVIOUR_MARKUP =
    /aria-expanded|aria-selected|role="dialog"|role="menu"|role="listbox"|role="tab"/;
  const IMPLEMENTED = /useState|useReducer|on[A-Z][a-zA-Z]+={/;
  if (
    (keysUsed.has('react') || keysUsed.has('next')) &&
    BEHAVIOUR_MARKUP.test(snippetStrings) &&
    !IMPLEMENTED.test(snippetStrings)
  ) {
    if (!/interactive:\s*true/.test(src)) {
      fail(
        dir,
        'interactive',
        'React/Next markup carries an interactive widget\'s ARIA but implements none of its behaviour, and the set does not set `interactive: true`, so the shared "markup and styles only" note cannot render',
      );
    }
  }

  report.push({
    component: dir,
    wrapper: isWrapper,
    examples: exampleCount,
    covered: examples.length,
    keys: keysUsed,
    // Whether ANY set on the page declares itself markup-only, and whether a
    // drift guard backs the Custom tab. Both feed the Component status page,
    // which is generated rather than written, so neither can drift from here.
    customCount,
    interactive: /interactive:\s*true/.test(src),
    drift: existsSync(`${TOOLS}/check-${dir}-drift.mjs`),
  });
}

// ── output ──────────────────────────────────────────────────────────────────
//
// --json exists so the Component status page can be GENERATED from this run
// rather than hand-maintained beside it. A table typed out by a person drifts
// from the repository the first time a snippet is added and nobody edits the
// page; one written by tools/gen-component-status.mjs cannot.
if (process.argv.includes('--json')) {
  console.log(
    JSON.stringify(
      report
        .filter(
          (r) => r.component !== '_template' && !r.component.includes('.'),
        )
        .sort(
          (a, b) =>
            b.covered - a.covered || a.component.localeCompare(b.component),
        )
        .map((r) => ({
          component: r.component,
          wrapper: r.wrapper,
          examples: r.examples,
          covered: r.covered,
          keys: [...r.keys],
          customCount: r.customCount ?? 0,
          interactive: !!r.interactive,
          drift: !!r.drift,
        })),
      null,
      2,
    ),
  );
  process.exit(findings.length ? 1 : 0);
}

if (process.argv.includes('--report')) {
  const mark = (row, key) =>
    row.keys.has(key) ? (row.wrapper && key === 'custom' ? '◐' : '✅') : '—';
  console.log(
    'component            kind       examples  covered  react  next  primeng  custom',
  );
  console.log('-'.repeat(84));
  for (const r of report.sort(
    (a, b) => b.covered - a.covered || a.component.localeCompare(b.component),
  )) {
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
  console.error(
    `\n${findings.length} snippet blocking finding${findings.length === 1 ? '' : 's'} (CI failed):\n`,
  );
  for (const f of findings)
    console.error(
      `  ${f.component.padEnd(14)} ${f.rule.padEnd(12)} ${f.detail}`,
    );
  process.exitCode = 1;
} else {
  console.log(
    `snippets OK (no blocking findings) — ${report.filter((r) => r.covered > 0).length} snippet files checked`,
  );
}
