/**
 * Every documented example must show the component, not only its code.
 *
 * FrameworkTabs renders framework snippets only. A page built from those
 * blocks alone looks complete in source while rendering nothing — the defect
 * the Phase 4 audit found on fifteen pages.
 *
 * Two assertions, because the first one alone is not the contract:
 *
 *  1. A docs page whose component owns stories carries a live preview block.
 *  2. EVERY `<FrameworkTabs of={X.Story}>` has a `<Canvas of={X.Story}>`.
 *
 * Checking only (1) passes a page that previews its first example and leaves
 * the rest as code — which is what chips-input, confirm-dialog, menu and
 * stepper were doing (22 examples) after the first fifteen pages were fixed.
 * They satisfied (1) and still showed code with no component beside it.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPONENTS_DIR = fileURLToPath(
  new URL('../libs/ui-kit/src/lib/components/', import.meta.url),
);
const LIVE_PREVIEW = /^\s*<(Canvas|DemoCard|Story|Stories|Primary)\b/m;
const STORY_FILE = /\.stories\.[cm]?[jt]sx?$/;

function withoutFencedCode(source) {
  const kept = [];
  let fence;

  for (const line of source.split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = undefined;
      continue;
    }
    if (!fence) kept.push(line);
  }

  return kept.join('\n');
}

/** `of={Namespace.Story}` on a given block, returning the story names. */
const storiesOn = (source, block) =>
  [
    ...source.matchAll(
      new RegExp(`<${block}[\\s\\S]*?of=\\{\\w+\\.(\\w+)\\}`, 'g'),
    ),
  ].map((match) => match[1]);

const checked = [];
const missing = [];
const unpreviewed = [];
let examples = 0;

for (const entry of readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const directory = join(COMPONENTS_DIR, entry.name);
  const files = readdirSync(directory);
  if (!files.some((file) => STORY_FILE.test(file))) continue;

  for (const file of files.filter((name) => name.endsWith('.mdx'))) {
    const path = join(directory, file);
    const name = `${entry.name}/${file}`;
    const source = withoutFencedCode(readFileSync(path, 'utf8'));
    checked.push(name);

    if (!LIVE_PREVIEW.test(source)) missing.push(name);

    const previewed = new Set(storiesOn(source, 'Canvas'));
    const tabbed = storiesOn(source, 'FrameworkTabs');
    examples += tabbed.length;
    for (const story of tabbed) {
      if (!previewed.has(story)) unpreviewed.push(`${name} → ${story}`);
    }
  }
}

if (!checked.length) {
  console.error(
    'no component docs with stories found — refusing an empty pass',
  );
  process.exit(1);
}

if (missing.length) {
  console.error(
    `component docs missing a live preview (${missing.length}/${checked.length}):`,
  );
  for (const file of missing) console.error(`  ${file}`);
}

if (unpreviewed.length) {
  console.error(
    `documented examples showing code with no preview (${unpreviewed.length}/${examples}):`,
  );
  for (const example of unpreviewed) console.error(`  ${example}`);
  console.error(
    '\nadd `<Canvas of={Namespace.Story} sourceState="none" />` above the\n' +
      'FrameworkTabs block — sourceState because the tabs already carry the code.',
  );
}

if (missing.length || unpreviewed.length) process.exit(1);

console.log(
  `component docs previews OK — ${checked.length} pages, ` +
    `${examples}/${examples} documented examples carry a live preview`,
);
