# Versioning and upgrade policy

This document is the single source of truth for BAPS Design System release
classification and compatibility. Update it whenever a dependency or peer
dependency changes.

## Compatibility matrix

The current packages are pre-1.0. Their supported consumer line is the current
Angular, PrimeNG and React majors shown below; older consumers follow the
upgrade-first path rather than receiving compatibility shims.

| Kit line                  | Angular   | PrimeNG   | `@primeuix/themes` | React     | Next.js                                                                             | TypeScript                                                     | Node.js                                                       | `@org/tokens`                      |
| ------------------------- | --------- | --------- | ------------------ | --------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------- |
| `@org/ui-kit` 0.1.x       | `^21.2.0` | `^21.1.3` | `^2.0.3`           | n/a       | n/a                                                                                 | Angular 21 accepts `>=5.9 <6.1`; workspace verified with 6.0.3 | `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0`; verified with 22.22.2 | exactly `0.0.1` in built artefacts |
| `@org/ui-kit-react` 0.1.x | n/a       | n/a       | n/a                | `^19.2.7` | App Router client/server fixture is type-checked; no Next package version is pinned | workspace verified with 6.0.3; not a package peer              | no package engine declared; verified with 22.22.2             | exactly `0.0.1` when packed        |

The Angular package's source manifest uses `workspace:*` for `@org/tokens`, but
the build rewrites it to the exact token package version. The React package is
rewritten by `pnpm pack`. Consumers install the matching tokens artefact; they
must not rely on the workspace protocol. See the
[consumer integration guide](CONSUMER-INTEGRATION-GUIDE.md).

Anything outside this matrix is unsupported until it is added here and proven
with a real consumer build. In particular, PrimeNG 17 applications are not
compatible with the PrimeNG 21 wrapper package.

## Release classification

The public surface includes TypeScript APIs, exported CSS classes, design
tokens and rendered appearance.

| Change                                                                                              | Semver level                                           | Release-note label                     |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------- |
| Additive component, input, output, service, type, class or token with a backward-compatible default | minor                                                  | `feature`                              |
| Intentional change to a component's default appearance                                              | minor                                                  | `visual change`                        |
| Bug fix that restores the documented design or behaviour                                            | patch                                                  | `fix`; add `visual` when pixels change |
| Documentation or internal tooling with no shipped behaviour change                                  | patch                                                  | `docs` or `tooling`                    |
| Remove or rename a public TypeScript API, CSS class or token                                        | major                                                  | `breaking`; migration note required    |
| Change an existing default so old consumers behave differently                                      | major unless it is a documented spec-alignment bug fix | `breaking` or `fix` with evidence      |

CSS class and token renames are breaking because raw markup and CSS custom
properties are supported consumption surfaces. A visual-only change is never
silent: it is called out even when the semver level is patch.

The kit stays on 0.x until spm-ui integrates successfully. That integration is
the release-readiness gate for 1.0.0. While the kit is on 0.x, release notes
must still use the major/minor/patch meanings above; the leading zero is not
permission to make undocumented breaks.

## Deprecation and changelog

- Deprecate a public API first and include its replacement and migration note.
- Remove it only in the next major release.
- Breaking changes require explicit approval before implementation.
- Maintain [`CHANGELOG.md`](../CHANGELOG.md) by hand. No changelog dependency
  or release automation is assumed.
- Every entry states the affected package, semver classification and whether
  the change is visual.
- Release notes link to the relevant migration section for every breaking
  change.

The historical toolbar token correction (`1e800d2`) and pagination standalone
CSS correction (`4c053bc`) are recorded in the changelog as patch-level visual
fixes after their full diffs were reviewed.

## Upgrade and rollback procedure

For every major upgrade:

1. Read the compatibility matrix, changelog and breaking-change migration
   notes before changing a lockfile.
2. Capture current light/dark screenshots for both brands and a build log.
3. Upgrade `@org/tokens` and the kit package as a matched pair.
4. Upgrade the framework peers to the matrix row before importing kit code.
5. Apply migration notes one public API, class and token at a time.
6. Build the real application, run its tests, and compare both-brand visual
   baselines. A type-check alone is not compatibility proof.
7. Keep the previous lockfile and package artefacts until sign-off.

If verification fails, restore the previous lockfile and matched kit/token
artefacts, rebuild, and reopen the migration as an isolated change. Do not mix
a framework rollback with unrelated application work.

Each major release adds a section here listing its breaking changes, exact
before/after examples, automated checks, and rollback caveats. A release with
no breaking changes says so explicitly.

## Legacy consumer path: PrimeNG before 18

Legacy applications upgrade first; the kit does not carry a parallel wrapper
implementation for old PrimeNG DOM or APIs.

The staged route is:

1. Inventory the consumer's Angular, PrimeNG, vendored PrimeNG patches,
   wrappers and theme overrides.
2. Capture baseline screenshots before each stage, covering both brands and
   all colour schemes the consumer ships.
3. Upgrade Angular and PrimeNG to the compatibility matrix without adopting
   the kit in the same change. Resolve PrimeNG 17-to-21 migrations and remove
   or reapply vendored patches deliberately.
4. Install matching `@org/tokens` and kit artefacts and verify a minimal route.
5. Keep the application's existing wrapper selectors and public APIs. Swap
   their internals to the kit incrementally so feature code does not change at
   the same time as the design-system implementation.
6. Migrate one component family or route at a time, building and comparing
   screenshots at every boundary.
7. Obtain designer sign-off for colours and contrast; automated pixel checks
   do not make colour decisions.

Coexistence is temporary and one-directional: an app may keep its wrappers and
unmigrated PrimeNG components while moving to kit internals, but it must run one
compatible PrimeNG major. Do not load PrimeNG 17 and 21 together, and do not
copy kit source into the consumer.

### spm-ui legacy checklist

- [ ] Record all vendored PrimeNG source and CSS differences before upgrading.
- [ ] Complete and verify the PrimeNG 17-to-21 migration independently.
- [ ] Review the consumer-specific rules in `spm-ui/CLAUDE.md`; decide which
      remain application policy and which are superseded by kit guidance.
- [ ] Capture visual baselines before every migration stage.
- [ ] Keep spm-ui wrapper APIs stable and swap their internals first.
- [ ] Build and test the real consumer after each component-family migration.
- [ ] Review MyBKY and Sampark light/dark output with design.
- [ ] Obtain explicit designer sign-off on colour and contrast changes.
