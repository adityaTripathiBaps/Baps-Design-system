# Publishing & Build Rules

How `@org/ui-kit` and `@org/tokens` reach a consuming app. **Read this before
touching a build script, an Nx target, or anything under `dist/`.**

## The shape

```
libs/ui-kit  ──nx build──▶  dist/libs/ui-kit-stage  ──publish──▶  dist/libs/ui-kit
libs/tokens  ──nx build──▶  dist/libs/tokens-stage  ──publish──▶  dist/libs/tokens
                                                                        ▲
                                    node_modules/@org/ui-kit ───symlink─┘
                                    (in baps-app-shell, baps-app-mybky)
```

Consuming apps set `preserveSymlinks: true` and resolve the libraries out of
`dist/`. Their dev servers compile **continuously**, so anything that empties or
rewrites those directories races them.

## Three separate races, all now fixed — do not undo them

The same error message came back three times with three different causes:

```
Can't find stylesheet to import: layout/fonts
```

It names a file that is sitting right there and is merely absent, or
unreadable, for a moment.

### 1. The builder wipes its own output

`ng-packagr` and `tsc` **delete their output directory before writing**. Fixed
by building into `*-stage` and publishing from there.

### 2. Nx wipes a target's declared outputs

**Nx deletes a target's `outputs` before running it** — and again on a cache
hit, before restoring them. While `build.outputs` still listed
`dist/libs/ui-kit`, Nx emptied it out from under the publish step every time and
the copy-over protected nothing.

Fixed in `project.json`:

```json
"build": {
  "executor": "nx:run-commands",
  "dependsOn": ["compile"],
  "outputs": [],
  "cache": false,
  "options": { "command": "node libs/ui-kit/scripts/fix-dist-package-json.mjs" }
}
```

**LIVE is deliberately outside Nx's output model.** STAGE is the cached
artifact. Do not "helpfully" re-add `outputs` to a publish target.

### 3. A plain recursive copy truncates each file

`cpSync` opens the destination and truncates before streaming. For most files a
torn read is a Sass parse error; for `package.json` it is worse — a truncated
manifest is invalid JSON, the `exports` map cannot be read, and **every**
subpath fails at once.

Fixed by `tools/publish-dist.mjs`: temp-file + `rename` (atomic within a
filesystem) and **byte-compare to skip unchanged files**. A no-op rebuild now
writes zero files, so there is no race window at all:

```
[ui-kit] published dist/libs/ui-kit-stage -> dist/libs/ui-kit (0 written, 227 unchanged)
```

If a rebuild reports a large `written` count for an unchanged library,
something is rewriting files needlessly — investigate before shipping.

## The exports map is a closed allow-list

`ng-packagr` writes `exports` with only `"."` and `"./package.json"`. An
`exports` field is an **allow-list**, so every other subpath becomes
unresolvable no matter that the file is in `dist/`.

This library ships **SCSS as source**, and apps reach it with Sass's `pkg:`
importer:

```scss
@use 'pkg:@org/ui-kit/src/lib/styles/layout/fonts';
```

So the build script re-opens the raw source tree:

```js
pkg.exports = { ...pkg.exports, './src/*': { default: './src/*' } };
```

Scoped to `./src/*`, not `./*` — a blanket rule would re-expose the compiled
output under a second set of paths.

## The workspace protocol must not ship

`ng-packagr` copies `"@org/tokens": "workspace:*"` into the dist manifest
verbatim. That protocol is pnpm-only: `npm pack dist/libs/ui-kit` in any other
context fails with `EUNSUPPORTEDPROTOCOL`. The build script pins it to the
version in the source manifest, so ui-kit and tokens ship as a matched pair.

## What hot-reloads and what does not

| Change | Consuming app |
| --- | --- |
| Library **SCSS** | hot-reloads through the symlink |
| Library **TS / component** | needs `rm -rf .angular/cache` + restart |
| Token JSON | `nx build tokens`, then as above |

Angular serves the **last good bundle** when a build fails. A page that looks
merely stale is usually a failed compile — **read the terminal before debugging
the CSS.**

## Order of operations

```bash
node tools/check-styles-literals.mjs
npx nx build tokens        # only if token sources changed
npx nx build ui-kit        # depends on tokens
```

Never run two library builds concurrently. Both consuming apps have a
`ds:watch` script (`nx watch … -- nx build ui-kit`), so running `npm run dev` in
**both** apps means two `nx build ui-kit` processes writing the same stage
directory on every edit. Run `npm run dev` in at most one app, `npm start` in
the other, or build the library yourself and use `npx ng serve`.

## Never commit

`dist/`, `documentation.json`, `libs/tokens/build/`, `.angular/`, `.nx/`.
