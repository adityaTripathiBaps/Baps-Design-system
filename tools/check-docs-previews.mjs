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

/**
 * Story exports a docs page is expected to show.
 *
 * Interaction stories are not documentation — they are behaviour tests, read
 * in the Interactions panel, and embedding one would run its play function on
 * the docs page. The visual suite excludes them for the same reason.
 * Leading-underscore exports are anchors, not examples.
 */
const documentableStories = (source) =>
  [...source.matchAll(/export const (\w+)\s*[:=]/g)]
    .map((match) => match[1])
    .filter((name) => !name.startsWith('_') && !/Interaction$/.test(name));

const checked = [];
const missing = [];
const unpreviewed = [];
const undocumented = [];
let examples = 0;
let stories = 0;

for (const entry of readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const directory = join(COMPONENTS_DIR, entry.name);
  const files = readdirSync(directory);
  const storyFiles = files.filter((file) => STORY_FILE.test(file));
  if (!storyFiles.length) continue;

  const docs = files.filter((name) => name.endsWith('.mdx'));
  if (!docs.length) {
    missing.push(`${entry.name} (component has stories but no .mdx at all)`);
    continue;
  }

  // Every live-preview block across the component's pages, so a story split
  // onto a second .mdx still counts as previewed.
  const previewed = new Set();
  for (const file of docs) {
    const source = withoutFencedCode(
      readFileSync(join(directory, file), 'utf8'),
    );
    const name = `${entry.name}/${file}`;
    checked.push(name);

    if (!LIVE_PREVIEW.test(source)) missing.push(name);

    for (const block of ['Canvas', 'DemoCard', 'Story', 'Primary']) {
      for (const story of storiesOn(source, block)) previewed.add(story);
    }

    const tabbed = storiesOn(source, 'FrameworkTabs');
    examples += tabbed.length;
    for (const story of tabbed) {
      if (!storiesOn(source, 'Canvas').includes(story)) {
        unpreviewed.push(`${name} → ${story}`);
      }
    }
  }

  // The widest assertion: a story a reader can reach must be shown, however
  // its page chose to document it. FrameworkTabs pairing above does not cover
  // a story documented with neither block.
  for (const file of storyFiles) {
    for (const story of documentableStories(
      readFileSync(join(directory, file), 'utf8'),
    )) {
      stories += 1;
      if (!previewed.has(story)) {
        undocumented.push(`${entry.name} → ${story}`);
      }
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

if (undocumented.length) {
  console.error(
    `stories with no preview on their component's docs (${undocumented.length}/${stories}):`,
  );
  for (const story of undocumented) console.error(`  ${story}`);
  console.error(
    '\neither add a preview block for it, or — if it is a behaviour test\n' +
      'rather than an example — give it the Interaction suffix, which is how\n' +
      'this guard and the visual suite both recognise one.',
  );
}

if (missing.length || unpreviewed.length || undocumented.length) {
  process.exit(1);
}

console.log(
  `component docs previews OK — ${checked.length} pages, ` +
    `${examples}/${examples} documented examples carry a live preview, ` +
    `${stories}/${stories} documentable stories previewed`,
);
