// ng-packagr copies libs/ui-kit/package.json's dependency ranges into the
// dist manifest verbatim, including `"@org/tokens": "workspace:*"`. That
// `workspace:` protocol is a pnpm-only thing: it resolves inside this repo,
// but the moment the tarball is installed anywhere else npm/yarn fail hard
// with `EUNSUPPORTEDPROTOCOL — Unsupported URL Type "workspace:"`.
//
// `pnpm publish` rewrites these to real ranges on the way out, but
// `npm pack dist/libs/ui-kit` (and any CI that publishes the dist folder
// directly) does not — so the protocol has to be resolved here, at build
// time, or the package is simply not installable.
//
// Each workspace dep is pinned to the version in its own source package.json,
// so ui-kit and tokens always ship as a matched pair. Runs after `compile`;
// see project.json's `build` target. Mirrors the same fix in
// libs/tokens/scripts/fix-dist-package-json.mjs.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { publishDist } from '../../../tools/publish-dist.mjs';

// ng-packagr builds into STAGE, and this script publishes it to LIVE.
//
// Why the two-step: ng-packagr DELETES its output directory before writing.
// Consuming apps resolve @org/ui-kit through a node_modules symlink into that
// directory and their dev servers compile continuously, so anything compiling
// during the wipe fails on whatever it happened to ask for — three times in one
// session it was `Can't find stylesheet to import: layout/fonts`, which names a
// file that is perfectly fine and merely absent for a second.
//
// Publishing never deletes first and never writes a file in place — see
// tools/publish-dist.mjs, which does the atomic copy for both libraries and
// documents the three separate races that produced that same error message.
//
// The other half of this fix lives in project.json: the `build` target declares
// NO outputs and sets `cache: false`. Nx DELETES a target's declared outputs
// before running it (and again on a cache hit, before restoring them), so while
// `outputs` still listed dist/libs/ui-kit, Nx wiped LIVE out from under this
// script every build and the publish below protected nothing. LIVE is
// deliberately outside Nx's output model now; STAGE is the cached artifact, and
// this script is cheap enough to re-run every time.
const STAGE = 'dist/libs/ui-kit-stage';
const LIVE = 'dist/libs/ui-kit';
const DIST = `${STAGE}/package.json`;
const WORKSPACE_DEPS = { '@org/tokens': 'libs/tokens/package.json' };

const pkg = JSON.parse(readFileSync(DIST, 'utf8'));
const patched = [];

for (const field of [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
]) {
  const block = pkg[field];
  if (!block) continue;

  for (const [dep, range] of Object.entries(block)) {
    if (typeof range !== 'string' || !range.startsWith('workspace:')) continue;

    const manifest = WORKSPACE_DEPS[dep];
    if (!manifest || !existsSync(manifest)) {
      throw new Error(
        `[ui-kit] ${field}.${dep} uses "${range}" but there is no known source manifest for it. ` +
          `Add it to WORKSPACE_DEPS in libs/ui-kit/scripts/fix-dist-package-json.mjs — ` +
          `shipping the workspace: protocol makes the tarball uninstallable outside pnpm.`,
      );
    }

    const { version } = JSON.parse(readFileSync(manifest, 'utf8'));
    // `workspace:*` means "whatever is in the repo right now", so pin exactly;
    // a caret here would let a consumer drift off the tokens this build used.
    block[dep] = version;
    patched.push(`${field}.${dep}: ${range} -> ${version}`);
  }
}

// ── Re-open the package for its own raw sources ────────────────────────────
//
// ng-packagr writes a CLOSED `exports` map: only "." and "./package.json".
// An exports field is an allow-list, so every other subpath becomes
// unresolvable no matter that the file is sitting right there in dist.
//
// That matters because the SCSS in this library is not compiled into the
// bundle — it ships as source, and consuming apps pull it in with Sass's
// `pkg:` importer:
//
//     @use 'pkg:@org/ui-kit/src/lib/styles/layout/fonts';
//
// Without this entry that line fails with `Can't find stylesheet to import`
// (measured, in both apps at once, immediately after a rebuild) — the file
// exists at dist/libs/ui-kit/src/lib/styles/layout/_fonts.scss and the
// exports map is what refuses it.
//
// Scoped to `./src/*` rather than `./*`: the apps only ever reach for the raw
// source tree, and a blanket `./*` would also re-expose the compiled output
// under a second set of paths.
// ── Compiled CSS, for consumers that do not run Sass ───────────────────────
//
// The `./src/*` entry above serves an Angular app, which pulls the SCSS through
// Sass's pkg: importer. A React or Next.js app imports CSS instead, and without
// these two entries it gets the Angular components and no styling at all —
// which is exactly why the library reads as "Angular only" from outside.
//
// Written by libs/ui-kit/scripts/build-styles.mjs into the same stage
// directory. Both keep their var(--…) references, so @org/tokens/css remains
// the single source for the values.
//
//     import '@org/tokens/css';
//     import '@org/ui-kit/styles';          // everything
//     import '@org/ui-kit/styles/button';   // or one component
// ── The glyph registry, for consumers that are not Angular ─────────────────
//
// The CSS above styles a <baps-icon>; it cannot supply what goes inside one.
// The component builds that from BAPS_ICONS, a generated map of 24x24
// currentColor path bodies, and injects it as
//
//     <svg viewBox="0 0 24 24" fill="none" xmlns="..." focusable="false">${body}</svg>
//
// That map is plain data. Measured on the built output: 0 occurrences of
// "@angular" in esm2022/lib/components/icon/icon-set.js, so importing it costs
// a React app nothing but its own 2.3 MB of path data. Without this entry the
// only way to reach it is through "." — the package root, which does pull
// Angular in — so a React consumer's realistic option was to hand-draw every
// glyph. The subpath is the difference between documenting an icon button and
// documenting a box where an icon would go.
//
//     import { BAPS_ICONS } from '@org/ui-kit/icons';
//
// One caveat, measured rather than assumed. ng-packagr writes esm2022 with
// EXTENSIONLESS relative imports ('./icon-set-extra'), which Node's own ESM
// loader rejects — `node -e "import('.../icon-set.js')"` fails with
// ERR_MODULE_NOT_FOUND on a file that is sitting right next to it. Every
// bundler resolves it: esbuild bundles this entry to 2,293,769 bytes
// containing 545 glyphs and 0 occurrences of "@angular". So the subpath serves
// React, Next and Vite, which is who it is for, and not a bare Node script.
//
// Deliberately NOT re-exported from './styles/*': these are two different
// kinds of artifact and collapsing them would make the CSS entry resolve a .js.
pkg.exports = {
  ...pkg.exports,
  './src/*': { default: './src/*' },
  './styles': { default: './styles/index.css' },
  './styles/*': { default: './styles/*.css' },
  './icons': {
    types: './lib/components/icon/icon-set.d.ts',
    default: './esm2022/lib/components/icon/icon-set.js',
  },
};

writeFileSync(DIST, JSON.stringify(pkg, null, 2) + '\n');
console.log(
  patched.length
    ? `[ui-kit] resolved workspace protocol — ${patched.join(', ')}`
    : '[ui-kit] no workspace: ranges to resolve',
);
console.log(
  '[ui-kit] exported ./src/* (raw SCSS via pkg:), ./styles (compiled CSS) and ./icons (glyph data)',
);

// ── Publish: stage -> live ──────────────────────────────────────────────────
// Atomic per-file, skipping unchanged files, then pruning. See
// tools/publish-dist.mjs for the three separate wipe/tear races this survives.
console.log('[ui-kit] ' + publishDist(STAGE, LIVE));
