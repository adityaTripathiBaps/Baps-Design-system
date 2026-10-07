import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '../../..');
const sharedDirectory = resolve(
  workspaceRoot,
  'libs/ui-kit/src/lib/components/icon',
);
const generatedDirectory = resolve(
  workspaceRoot,
  'packages/ui-kit-react/src/lib/generated',
);

mkdirSync(generatedDirectory, { recursive: true });

const files = ['icon-set.ts', 'icon-set-extra.ts'];
for (const name of files) {
  const sourcePath = resolve(sharedDirectory, name);
  const outputPath = resolve(generatedDirectory, name);
  let source = readFileSync(sourcePath, 'utf8');

  // The Angular compiler accepts an extensionless relative import. The React
  // package emits standards-based Node ESM, so its generated copy names the
  // emitted .js file explicitly.
  if (name === 'icon-set.ts') {
    source = source.replace(
      'from "./icon-set-extra"',
      'from "./icon-set-extra.js"',
    );
  }

  const banner =
    '// GENERATED from libs/ui-kit/src/lib/components/icon; do not edit.\n';
  writeFileSync(outputPath, banner + source);
}

console.log(
  `[ui-kit-react] generated ${files.length} icon registry files from the shared source`,
);
