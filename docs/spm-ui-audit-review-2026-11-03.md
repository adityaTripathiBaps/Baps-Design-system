# SPM UI Audit Review — 2026-11-03

## Scope

This review checks the two supplied `update_baps_library` audit reports against:

- the BAPS Design System on `feat/sampark-spm-parity` at `ec71c89`;
- the existing migration and visual audit records under
  `D:\baps-projects\audits`;
- `spm-ui` `origin/develop`, read only through `git show`.

The local `spm-ui` `update_baps_library` worktree was not inspected or changed.
Therefore, file counts and branch-only implementation claims from the supplied
reports are useful inventory, but are not independently certified here.

## Corrections To The Supplied Verdict

| Supplied claim                                                                              | Review                        | Corrected conclusion                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SpmTheme` should eventually become `MyBky`                                                 | Incorrect                     | SPM is a Sampark app. The public kit preset is `Sampark`; `MyBky` is the separate MyBKY preset. Any preset migration must be `SpmTheme` to `Sampark`, after the recorded A/B differences are accepted.                                         |
| Artifact `sampark-parity-a59e8de` represents the current kit                                | Stale                         | The report accurately names the app's stated artifact, but the kit has newer commits. At review time the kit is at `ec71c89`, including the tokenized Sampark disabled toggle opacity.                                                         |
| Root Sampark class and `SpmTheme` configuration are verified                                | Branch-only claim             | `origin/develop` still has a bare `<html>` and does not contain the reported integration. The supplied report may describe local branch work, but this session's read-only rule does not permit inspecting that worktree.                      |
| The vendored PrimeNG folder is fully inert because TypeScript paths point to `node_modules` | Not fully proven              | TypeScript path mappings establish module resolution only. Sass imports, relative imports, Angular build assets, and scripts must also be scanned before declaring the vendored tree inert.                                                    |
| The CSS `@scope` boundary prevents all legacy leakage                                       | Directionally good, too broad | A boundary protects only the selectors and component hosts included in its current stop list. Portalled overlays and components absent from that list still need runtime checks.                                                               |
| Three app overrides should all move into the kit                                            | Incorrect ownership model     | A topbar chrome-free select is contextual app styling unless an approved opt-in variant is added. A projected icon's stroke is icon-specific. A disabled button override needs current measured evidence before changing every Sampark button. |
| No rogue or duplicate implementation exists                                                 | Unproven                      | The migration inventory is encouraging, but this conclusion requires source, rendered DOM, authenticated behavior, and visual checks. The existing audits already record raw PrimeNG, obsolete selectors, and app-owned compatibility CSS.     |

## Confirmed Design-System Work

- The public Sampark preset is exported as `Sampark` from
  `libs/ui-kit/src/lib/theme/sampark.theme.ts`.
- `baps-drawer` already exposes `width`, so GAP-05 does not require an app CSS
  patch.
- `baps-select` already exposes `styleClass` and `panelStyleClass`. A borderless
  topbar appearance remains an API/design decision, not a global default.
- Sampark disabled toggle opacity is now token-owned at `0.6` in `ec71c89`.
  No MyBKY selector or rendered behavior changed.
- Input-group rules still exist in both `styleUrls` and the inline `styles`
  block. Remove the duplicate only after both-brand screenshot comparison;
  changing it blindly risks appearance drift.
- `bapsTooltip` now forwards PrimeNG's `tooltipDisabled` and `appendTo`
  (`275fd17`). Defaults unchanged. The docs now state PrimeNG's real
  `tooltipEvent` default (`'hover'`; focus needs `tooltipEvent="both"`).
- Tracked token outputs (`tokens.css`, `_tokens.scss`, `tokens.flat.json`)
  were stale after `ec71c89`; regenerated in `be891f6`. Only the two
  `disabledOpacity` tokens were added.
- The base table partial still references a MyBKY-tier header token. It renders
  correctly under the Sampark override today, but remains a token-hygiene item.

## Ownership Split

### Design System

1. Remove the input-group duplicate styles after visual comparison.
2. ~~Tooltip `tooltipDisabled` and `appendTo` passthroughs~~ — done in
   `275fd17`.
3. Replace the base table's MyBKY-tier token reference with a neutral contract.
4. Resolve logged app-leak selectors and APIs only through approved generic
   contracts; do not encode SPM component names in shared styles.
5. Produce a fresh artifact pair only after the remaining parity items pass the
   repository guards.

### SPM UI

1. Re-audit the current branch's raw `p-checkbox`, `p-table`, `p-drawer`,
   `p-message`, and `p-toggleswitch` inventory before planning migration waves.
2. Fix PrimeNG 21 template API mismatches recorded in the latest full audit,
   including static checkbox labels and obsolete panel-class bindings.
3. Keep contextual topbar styling app-owned unless the design system approves
   a reusable variant.
4. Remove dead v17 selectors and `!important` rules incrementally, only after
   their owning screen has migrated and passed a visual comparison.
5. Verify the Sampark preset in signed-in screens before replacing `SpmTheme`;
   the existing A/B audit records meaningful raw-component differences.

## Verification Limits

- No login, credentials, backend calls, or authenticated screen checks were
  performed.
- No `spm-ui` file was edited, installed, staged, or committed.
- `spm-ui origin/develop` was read only through `git show`.
- Storybook interaction startup was attempted twice for the preceding toggle
  item and exhausted the worker heap both times. Static typecheck, lint, unit
  tests, style-literal guard, and the UI-kit build passed.

The supplied reports are best treated as a migration inventory, not a final
certification. Their broad positive direction is reasonable, but the corrected
preset target, artifact age, overlay boundary limits, and ownership split above
must be carried into the next SPM migration pass.

## Follow-up — 2026-11-03 (later session)

| Item                                               | Commit    | Verification                                                                                                                                                                                        |
| -------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token build outputs synced                         | `be891f6` | `tokens:generate` + `tsc -b libs/tokens`; diff limited to the two opacity tokens                                                                                                                    |
| Tooltip `tooltipDisabled` / `appendTo` passthrough | `275fd17` | `ui-kit:test` 56 suites / 796 tests pass (2 new); story typecheck pass; strict AOT check of the story bindings pass; tooltip lint 0 errors; style-literal, snippet and component-status guards pass |

Not verified in a browser: the Storybook dev server ran out of memory twice
(`Fatal process out of memory: Zone`), so the `DisabledInteraction` play test
has not executed. The equivalent unit spec covers the same behaviour.
`ui-kit:build` was not re-run this session.

Still open (not started): input-group duplicate styles, neutral table token,
app-leak selector cleanup, fresh tarball pair, and all SPM UI items.
