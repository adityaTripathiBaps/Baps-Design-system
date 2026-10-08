# BRAIN — durable project knowledge

Canonical. Read with [`RULES.md`](RULES.md) at the start of every task.

Only things that stay true across tasks belong here. No logs, no command output,
no task chatter. Replace stale entries rather than appending to them.

Per-component status is **not** here — it lives in [`STATUS.md`](../STATUS.md)
and [`packages/ui-kit-react/STATUS.md`](../packages/ui-kit-react/STATUS.md).

---

## Shape — *2026-10-08*

```
libs/tokens/            Style Dictionary. Source JSON -> generated CSS + TS
libs/ui-kit/            Angular component library (standalone PrimeNG wrappers)
libs/migration-data/    Audit docs, v17 -> v21 component mapping
packages/ui-kit-react/  React port. No Angular, no PrimeNG, at runtime
apps/storybook-host/    Storybook 8.6 — this library's only UI surface
tools/                  Guards and generators (see Verify)
```

A **wrapper library, not an application**. Consuming apps resolve `@org/ui-kit`
and `@org/tokens` out of `dist/` through a `node_modules` symlink, so a change
is only real to a consumer once it reaches `dist/`.

---

## Architecture decisions — *2026-10-08*

**Component CSS lives in a partial, never in an inline `styles:` block.**
Angular compiles an inline block into the JS bundle, so `@org/ui-kit/styles`
never ships it and no non-Angular consumer can reach it. Every component uses
`styles/components/<name>/_<name>.scss` plus `styleUrls` and
`ViewEncapsulation.None`. `scripts/build-styles.mjs` discovers the directory by
name — there is no index to register in.

**The PrimeNG preset is the Angular render.** `_button.scss` and friends only
add a delta on top of the rules PrimeNG generates at runtime; they never set a
background on `.p-button`. So when a SCSS value and `theme/*.theme.ts` disagree,
the preset is what the user actually sees. Settled this way in commit
`4b1bd05`-era work on Sampark secondary.

**Routes A / B / C.** A: a standalone `baps-*` partial written from tokens, with
a drift guard — raw markup works outside Angular. B: markup and style intent
only. C: Angular-only, because the design lives in PrimeNG's own DOM. Route is
decided by whether a partial can be written from tokens, **not** by reading the
current PrimeNG-shaped CSS.

**`ramp.ts` has no dependencies on purpose.** Its palette algorithm was
recovered by measurement and asserted identical to `@primeuix/themes`'
`palette()` across eleven colours at zero channel error, so the dependency was
removed rather than added.

**A per-component stylesheet is self-contained.** `@org/ui-kit/styles/x`
carries x plus everything x composes, so importing it alone renders x
correctly. users-dropdown.css is 120 kB because the component draws an avatar,
an icon, an input and menu items; datepicker.css is 164 kB because it builds on
select. The cost is duplication when a consumer imports several of these; the
bundle entry is unaffected, because Sass loads each module once per
compilation. Chosen deliberately on 2026-10-08 over trimming the `@use` lines,
which would have broken every consumer importing one file today. Documented in
`docs/snippet-setup.ts`.

*Next major:* revisit as peer imports — the per-component file would carry only
its own rules and name its dependencies, which is cleaner but is a breaking
change for those consumers.

**The React package forks nothing.** `copy-shared-styles.mjs` copies the
canonical `@org/ui-kit` CSS; there is no React-local design stylesheet, and
`verify-build.mjs` fails if Angular, PrimeNG or rxjs appears in the output.

---

## Things that mislead — *2026-10-08*

**`className` does not reach a custom element in React.** Measured: `class` came
back `null` while an inline `style` landed fine. Set it with a ref callback —
and if the class depends on state, put that state in the dependency list, or the
class is written once on mount and never updates. Nothing errors either way.

**A gradient is `background-image`, so `background-color` cannot override it.**
MyBKY's primary button is a gradient. A brand scope that sets only
`background-color` leaves the MyBKY gradient painted on top at matching
specificity. Clear the image explicitly.

**`build-styles.mjs` writes to `dist/libs/ui-kit-stage`.** The publish step
copies stage → `dist/libs/ui-kit`. Running the style build alone updates nothing
a consumer reads.

**A bare page has no `box-sizing: border-box`.** Storybook supplies it and no
ui-kit partial does, so raw markup drifts by exactly one border width per
element until the reset is added. See `rules/app-shell-host-page.md`.

**Counting bare hex by line over-reports by roughly eight to one.** A first
pass found 237 "violations"; 176 were inside comments documenting Figma values,
36 were `var(--token, #fallback)` fallbacks that Prettier had split across
lines so a line-based regex could not see the `var(`, and 2 were nested
gradients. The real figure is ~30 declarations. Strip comments and collapse
newlines before matching.

**A flat-config `files` glob needs a `**` prefix.** Nx runs eslint from the
workspace root, so `files: ['fixtures/**/*.tsx']` in a package config matches
nothing. `ui-kit-react` carried a correct `enforce-module-boundaries` override
for its consumer fixtures that had never once applied — invisible because the
project had no lint target to run it.

**A snippet is a backtick-delimited string.** A nested template literal inside
one ends it early and interpolates at build time. Use concatenation.
`tools/check-styles-literals.mjs` guards this.

---

## Verify — *2026-10-08*

Run what the change touches. Check the **exit code**, not filtered output.

```bash
node tools/check-snippets.mjs              # snippet guard
node tools/check-styles-literals.mjs       # no backticks inside style literals
node tools/gen-component-status.mjs --check

pnpm nx run ui-kit:build
pnpm nx run ui-kit:lint
pnpm nx run ui-kit:test                    # worker limits are in jest.config.cts

pnpm nx run ui-kit-react:build             # includes typecheck
pnpm nx run ui-kit-react:test
pnpm nx run ui-kit-react:verify-consumers  # strict React + Next fixtures + purity

pnpm nx run storybook-host:typecheck
pnpm nx run storybook-host:build-storybook # minimizer parallel=1 in main.ts
```

Drift guards need Storybook running on `:4400`:
`check-standalone.mjs`, `check-*-drift.mjs`, `a11y-audit.mjs`.

**Memory.** Both suites used to die on a machine with little free RAM, and
NODE_OPTIONS does not reach worker threads, so raising the parent heap never
helped. Fixed at the source instead: `workerIdleMemoryLimit` + `maxWorkers` in
`libs/ui-kit/jest.config.cts`, and `parallel = 1` on the Storybook minimizer.
Neither hides a failure — a real test or compile error still fails.

---

## Known open issues — *2026-10-08*

Verified, not fixed. Each needs a decision, not just a patch.

| # | Issue | Note |
|---|---|---|
| 1 | ~30 bare-hex declarations in component SCSS | `_input.scss` 22, `_navbar.scss` 3 (see *Open design decisions*), `_tag.scss` 2, `_input-sampark.scss` 2, `_overlay-list.scss` 1. Against `rules/styling-tokens.md` §1. |
| 2 | 17 components still have no Angular spec | `button` and `table` now covered. |
| 3 | React tests are one 1194-line file | 53 tests, no per-component split. |
| 4 | `a11y-audit.mjs` needs a running Storybook | Cannot run in CI as written; same for `check-standalone` and the drift guards. |

Closed 2026-10-08: react/react-dom mismatch (pinned to 19.2.7),
`ui-kit-react` lint target (added), Angular Jest OOM (worker limits),
Storybook build OOM (minimizer parallelism), `check-inventory` failure
(leading-underscore stories are not examples), per-component CSS duplication
(documented as self-contained rather than changed).

**Token cleanup is a separate task**, agreed 2026-10-08. P1 `_input.scss` (22),
then P2 `_input-sampark.scss` / `_overlay-list.scss` / `_tag.scss` (5). Verify
each phase with a build and a visual diff — these change rendered colour. P3,
the three `_navbar.scss` literals, is blocked on a designer choosing the
tokens; see *Open design decisions*.

## Open design decisions — *2026-10-08*

Blocked on design, not on implementation. Never invent these.

- `--avatar-sampark-info-*` does not exist; the other five variants have a tier.
  `.baps-avatar-html--info` stays on MyBKY colours.
- No `--button-sampark-danger-*` or `--button-sampark-warning-*` at all.
- Sampark toggle-switch `xs` has no standalone rule; only `--s` and `--l` exist.
- `--navbar-menu-button-bg` `#fbc02d`, `-hover-bg` `#d3a126`, `-text` `#212121`
  are bare literals with no token behind them.

## Approved token exceptions — *2026-10-08*

- `var(--token, #fallback)` fallbacks. Defensive, not hardcoding.
- `0`, `100%`, `50%` and other technical values.
- 1px borders and hairlines.
- SVG `viewBox` and path data.

---

## Status — *2026-10-08*

Branches: every ref is contained in `main`; four stale branches remain
(`chore/atomic-design-reorg`, `feat/framework-tabs`, `fix/audit-2026-10`,
`agents/avatar-playground-html-css-issue`). One stash holds visual-regression
screenshots, not source.

Counts, if they are useful as a tripwire rather than a source of truth:
47 component families (the barrel exports 47; `_template` is a scaffold and is
the only directory not exported). 38 carry framework snippets, 207/254
examples; 41 per-component stylesheets emit; Angular 505/505 across 32 suites;
React 53/53.

Component-level truth stays in the STATUS files.
