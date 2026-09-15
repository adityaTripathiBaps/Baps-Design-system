// @nx/js:tsc copies libs/tokens/package.json into the dist package.json
// verbatim — it only rewrites simple top-level main/types fields when they sit
// directly under sourceRoot, and does not understand nested "exports" maps at
// all. Our package.json intentionally points `main`/`types`/`exports` at the
// *.ts source (so the workspace's own tsconfig path-mapped consumers — Nx,
// Angular, Jest — resolve straight to source, matching how every other
// in-repo consumer of @org/ui-kit / @org/tokens already works, per this
// workspace's CLAUDE.md).
//
// A published tarball has no *.ts files inside it though — only what `tsc`
// emitted (*.js + *.d.ts) plus the built tokens.css. Without this patch,
// `npm install @org/tokens` in an external project would resolve `main` to a
// path that doesn't exist in the package. This script runs after `compile`
// (see project.json's `build` target) and rewrites the DIST copy only — the
// source package.json (and the internal dev experience) is untouched.
//
// ── Why stage -> live, mirroring libs/ui-kit ────────────────────────────────
// Both apps pull the token CSS straight out of dist with Sass's pkg: importer:
//
//     @use 'pkg:@org/tokens/build/css/tokens.css';
//
// Nx DELETES a target's declared outputs before running it (and again on a
// cache hit, before restoring them). While `compile` wrote directly to
// dist/libs/tokens, every `nx build tokens` therefore emptied the directory the
// running dev servers were reading, and anything compiling in that window died
// on a path that is perfectly fine a second later. tsc now writes to STAGE —
// which Nx may wipe and cache freely, since nothing outside this repo reads it
// — and publishing to LIVE never deletes first and never writes a file in
// place. See tools/publish-dist.mjs for how, and for the third race: a torn
// package.json is invalid JSON, which takes the `exports` map down and makes
// EVERY subpath fail at once with `Can't find stylesheet to import`.
import { readFileSync, writeFileSync } from 'node:fs';
import { publishDist } from '../../../tools/publish-dist.mjs';

const STAGE = 'dist/libs/tokens-stage';
const LIVE = 'dist/libs/tokens';

const pkgPath = `${STAGE}/package.json`;
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const toCompiled = (tsPath, ext) => tsPath.replace(/\.ts$/, ext);

pkg.main = toCompiled(pkg.main, '.js');
pkg.types = toCompiled(pkg.types, '.d.ts');

for (const [key, value] of Object.entries(pkg.exports ?? {})) {
  if (typeof value !== 'object' || value === null) continue; // "./css", "./package.json" — already dist-relative, leave as-is
  if (value.types) value.types = toCompiled(value.types, '.d.ts');
  if (value.import) value.import = toCompiled(value.import, '.js');
  if (value.default && value.default.endsWith('.ts')) value.default = toCompiled(value.default, '.js');
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('[tokens] patched dist package.json to point at compiled output');

// ── Publish: stage -> live ──────────────────────────────────────────────────
// Atomic per-file, skipping unchanged files, then pruning. See
// tools/publish-dist.mjs for the three separate wipe/tear races this survives.
console.log('[tokens] ' + publishDist(STAGE, LIVE));
