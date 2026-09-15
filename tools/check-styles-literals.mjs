#!/usr/bin/env node
/**
 * Fail on a backtick inside a component's `styles:` or `template:` literal.
 *
 * This is not a style preference. A backtick in a CSS or template comment
 * terminates the template literal, and TypeScript then parses the rest of the
 * stylesheet as code — the errors it reports point at the CSS, never at the
 * comment that broke it:
 *
 *     ERROR TS2304: Cannot find name 'avatar'.
 *     ERROR TS1005: ',' expected.
 *
 * It has cost real time more than once, always the same way: writing a comment
 * that quotes a class or property in Markdown style. The fix is always to drop
 * the backticks; this check just makes the failure obvious immediately.
 *
 *   node tools/check-styles-literals.mjs [glob-root]
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] ?? 'libs/ui-kit/src';

/**
 * Every .ts under root — stories and specs INCLUDED.
 *
 * They were excluded at first, on the assumption that only components carry
 * these literals. They do not: a story's `template:` is exactly the same kind
 * of literal and breaks exactly the same way, and specs declare inline test
 * components with templates of their own. The exclusion meant the one check
 * that catches this could not see the files most often hand-edited.
 */
const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.ts$/.test(e.name)) files.push(p);
  }
};
walk(root);

const problems = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  // Find each `styles:` / `template:` literal and scan its body for backticks
  // that are not its own delimiters.
  for (const key of ['styles', 'template']) {
    const open = new RegExp(`\\b${key}:\\s*\``, 'g');
    let m;
    while ((m = open.exec(src)) !== null) {
      const bodyStart = m.index + m[0].length;
      const end = src.indexOf('`', bodyStart);
      if (end === -1) continue;
      const body = src.slice(bodyStart, end);
      // A comment inside the literal that contains a backtick would have
      // ended the literal at that backtick, so the body we just sliced stops
      // early. Detect it by checking whether the slice ends mid-comment.
      //
      // BOTH comment syntaxes, not just CSS. The check originally counted only
      // /* */ and so was blind to a backtick inside an HTML comment in a
      // `template:` literal — which is the same bug and, in a template, the
      // more likely one. It missed exactly that and let a broken story reach
      // Storybook, where it surfaced as an opaque babel "Unexpected token,
      // expected ','" from the indexer rather than as this check failing.
      const cssOpen = (body.match(/\/\*/g) || []).length;
      const cssClose = (body.match(/\*\//g) || []).length;
      const htmlOpen = (body.match(/<!--/g) || []).length;
      const htmlClose = (body.match(/-->/g) || []).length;
      if (cssOpen > cssClose || htmlOpen > htmlClose) {
        const line = src.slice(0, end).split('\n').length;
        problems.push(
          `${file}:${line}  backtick inside a ${key} literal ends it mid-comment`,
        );
      }
    }
  }
}

if (problems.length) {
  console.error('Backtick(s) inside a styles/template literal:\n');
  problems.forEach((p) => console.error('  ' + p));
  console.error('\nDrop the backticks from the comment — they terminate the literal.');
  process.exit(1);
}

console.log(`ok — ${files.length} files, no backticks inside styles/template literals`);
