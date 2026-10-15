/**
 * Every component docs page that owns stories must embed a live preview.
 *
 * FrameworkTabs renders framework snippets only. A docs page made entirely of
 * those blocks looks complete in source while showing no rendered component.
 * This static guard keeps that authoring regression out of Storybook.
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

const checked = [];
const missing = [];

for (const entry of readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;

  const directory = join(COMPONENTS_DIR, entry.name);
  const files = readdirSync(directory);
  if (!files.some((file) => STORY_FILE.test(file))) continue;

  for (const file of files.filter((name) => name.endsWith('.mdx'))) {
    const path = join(directory, file);
    checked.push(`${entry.name}/${file}`);
    if (!LIVE_PREVIEW.test(withoutFencedCode(readFileSync(path, 'utf8')))) {
      missing.push(`${entry.name}/${file}`);
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
  process.exit(1);
}

console.log(
  `component docs previews OK — ${checked.length}/${checked.length} pages contain a live preview`,
);
