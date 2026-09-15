// Publish a staged library build into the directory consuming apps actually
// read, without ever letting a consumer see a missing or half-written file.
//
// ── Why this exists ────────────────────────────────────────────────────────
// baps-app-shell and baps-app-mybky resolve @org/ui-kit and @org/tokens
// through a node_modules symlink straight into dist/, and their dev servers
// recompile continuously. Anything that empties or rewrites those directories
// races the running servers. Three separate mechanisms bit us, in order:
//
//  1. ng-packagr / tsc DELETE their output directory before writing. Fixed by
//     building into a *-stage directory and publishing from there.
//  2. Nx DELETES a target's declared outputs before running it (and again on a
//     cache hit, before restoring them) — so while `build` still declared
//     dist/libs/<lib> as an output, Nx wiped it out from under the publish
//     step every time. Fixed by declaring no outputs on those targets.
//  3. A plain recursive copy TRUNCATES each destination file before streaming
//     the new bytes in. For most files a torn read is a Sass parse error, but
//     for package.json it is worse: a truncated manifest is invalid JSON, the
//     `exports` map cannot be read, and EVERY subpath the apps ask for fails
//     at once with `Can't find stylesheet to import` — naming a file that is
//     sitting right there and perfectly fine a second later.
//
// This module is the fix for (3), and the reason the whole publish is here
// rather than inlined in each library's script.
//
// ── How ────────────────────────────────────────────────────────────────────
// Every write is temp-file + rename. rename(2) is atomic within a filesystem,
// so a reader opening the path gets either the whole old file or the whole new
// one — never a torn one. Unchanged files are skipped entirely by comparing
// bytes, which is what makes this cheap: a typical rebuild changes a handful
// of files out of hundreds, and the ones nobody touched are never even opened
// for writing, so they cannot race at all.
//
// Stale paths are pruned last. A file that lingers one build too long is
// harmless; a missing one breaks the build.
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

/**
 * Copy `stage` over `live` atomically, then prune paths `stage` no longer has.
 * Returns a one-line summary for the calling script to log.
 */
export function publishDist(stage, live) {
  let written = 0;
  let skipped = 0;

  for (const from of walk(stage)) {
    const to = join(live, relative(stage, from));
    const bytes = readFileSync(from);

    if (existsSync(to) && readFileSync(to).equals(bytes)) {
      skipped++;
      continue;
    }

    mkdirSync(dirname(to), { recursive: true });
    // Same directory as the destination, so the rename stays on one filesystem
    // — across devices it would silently degrade to copy-then-delete, which is
    // exactly the torn write this avoids. The pid keeps concurrent builds from
    // colliding on the temp name.
    const tmp = `${to}.tmp-${process.pid}`;
    writeFileSync(tmp, bytes);
    renameSync(tmp, to);
    written++;
  }

  let pruned = 0;
  if (existsSync(live)) {
    for (const file of walk(live)) {
      if (file.includes('.tmp-')) continue; // another build's in-flight write
      if (!existsSync(join(stage, relative(live, file)))) {
        rmSync(file);
        pruned++;
      }
    }
  }

  return `published ${stage} -> ${live} (${written} written, ${skipped} unchanged${pruned ? `, ${pruned} pruned` : ''})`;
}
