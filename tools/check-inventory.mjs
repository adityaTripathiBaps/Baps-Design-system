// Inventory guard — fails if a component, a story, or a pinned story id disappears.
//
// The 462 visual baselines are keyed by story id, and every meta pins `id:` so a
// title change cannot move a URL. That makes the (component, id, story-export)
// triple the thing worth locking: rename a title and nothing breaks, but drop a
// story export and a baseline silently goes unreferenced instead of failing.
//
// Static parse on purpose. check-panels.mjs already drives a browser for what
// only the running Storybook knows; this needs neither Storybook nor a build, so
// it can gate a commit hook.
//
//   node tools/check-inventory.mjs --write   snapshot current state
//   node tools/check-inventory.mjs           compare against the snapshot (exit 1 on loss)
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const SNAPSHOT = 'tools/inventory.snapshot.json';
const BASE = 'libs/ui-kit/src/lib/components';
const WRITE = process.argv.includes('--write');

const collect = () => {
  const out = {};
  for (const dir of readdirSync(BASE).sort()) {
    const file = `${BASE}/${dir}/${dir}.stories.ts`;
    if (!existsSync(file)) continue;
    const src = readFileSync(file, 'utf8');

    // Only the meta's own title/id, which sit at two-space indent inside `const meta`.
    const title = src.match(/^ {2}title: '([^']+)'/m)?.[1] ?? null;
    const id = src.match(/^ {2}id: '([^']+)'/m)?.[1] ?? null;

    // `export const Foo: Story` / `export const Foo = ` — skip `export default`
    // and the non-story consts some files export (USERS, COLUMNS, TEMPLATE).
    // `\w*Story` because button.stories.ts types its three spy stories as
    // `SpyStory`; a bare `Story` match silently dropped them from the snapshot.
    const stories = [...src.matchAll(/^export const (\w+)\s*:\s*\w*Story/gm)].map((m) => m[1]).sort();

    out[dir] = { title, id, stories };
  }
  return out;
};

const now = collect();

if (WRITE) {
  writeFileSync(SNAPSHOT, JSON.stringify(now, null, 2) + '\n');
  const stories = Object.values(now).reduce((n, c) => n + c.stories.length, 0);
  console.log(`snapshot written: ${Object.keys(now).length} components, ${stories} stories`);
  process.exit(0);
}

if (!existsSync(SNAPSHOT)) {
  console.error(`no snapshot at ${SNAPSHOT} — run with --write first`);
  process.exit(1);
}

const was = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
const losses = [];

for (const [name, before] of Object.entries(was)) {
  const after = now[name];
  if (!after) {
    losses.push(`component REMOVED: ${name}`);
    continue;
  }
  // A title may change freely; an id may not — it is what the baselines and any
  // existing bookmark resolve through.
  if (before.id && after.id !== before.id) {
    losses.push(`story id changed: ${name}  ${before.id} -> ${after.id ?? '(none)'}`);
  }
  for (const s of before.stories) {
    if (!after.stories.includes(s)) losses.push(`story REMOVED: ${name}/${s}`);
  }
}

const added = Object.keys(now).filter((n) => !was[n]);
const newStories = Object.entries(now)
  .filter(([n]) => was[n])
  .flatMap(([n, c]) => c.stories.filter((s) => !was[n].stories.includes(s)).map((s) => `${n}/${s}`));

for (const a of added) console.log(`+ new component: ${a}`);
for (const s of newStories) console.log(`+ new story: ${s}`);

if (losses.length) {
  console.error(`\n${losses.length} inventory loss(es):`);
  for (const l of losses) console.error(`  ${l}`);
  console.error('\nAdditive work only. If a removal is intentional, re-run with --write.');
  process.exit(1);
}

const total = Object.values(now).reduce((n, c) => n + c.stories.length, 0);
console.log(`\ninventory OK — ${Object.keys(now).length} components, ${total} stories, all ids intact`);
