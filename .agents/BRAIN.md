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

**InputNumber uses kit-owned native spinner buttons for accessibility.**
PrimeNG v21 renders its built-in spinner buttons with `tabindex="-1"` and
`aria-hidden="true"`, so `BapsInputNumber` disables that button rendering and
provides two keyboard-reachable native buttons instead. Their visible glyphs
are the decorative 12px kit `plus` / `minus` icons; `aria-label="Increase
value"` and `aria-label="Decrease value"` provide the accessible names.
Measured in the `Brands` story on 2026-10-14, the button group exactly follows
the adjacent kit input: MyBKY is 36px high with the 99px input radius, Sampark
is 32px high with the 4px input radius. In both brands it is 32px wide, splits
into equal half-height buttons with zero padding and no gap, and keeps the 12px
icon. The custom buttons are therefore an accessibility substitution, not a
different non-colour treatment.

**Menu overlay carries brand on panelClass.**
The popup panel portals to `<body>`, so a host class binding never reaches it.
`BapsMenu` provides a `panelClass` getter forwarding `baps-ds-sampark` and
`baps-menu-sampark` directly onto PrimeNG's `.p-menu` container, matching the
pattern established by `popover` and `toast`.

**ConfirmDialog wraps BapsDialog with imperative service.**
`BapsConfirmDialog` is built on `baps-dialog` so it inherits the modal shell,
backdrop mask, focus trapping, focus restoration, and brand theming. It listens
to `BapsConfirmationService` through an internal callback channel, so the kit
does not expose an observable surface or need its own RxJS peer declaration. In
React, `BapsConfirmProvider` pairs with the `useConfirm()` hook to provide
promise-based confirmation resolution.

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

**A React component that cannot be rendered in a test exports its logic.**
`BapsDrawer` always `createPortal`s into `document.body` — `appendTo: null`
falls back to it — so `renderToStaticMarkup` throws "document is not defined"
and Drawer, Dialog and Popover have no React tests at all. Rather than shim a
DOM or weaken the component, those components export the logic worth pinning
from their own module and the tests import it from the component file —
`getColumnConfigBuckets`, `getAvailableSortFields`, `getApplicableSortRows`,
`flattenTreeTableRows`. The module barrels are explicit for this reason, so a
test helper never becomes a supported API. Pagination set the
precedent with `getPaginationPages`. A jsdom test environment would fix the
whole class and is a new dependency, so it needs approval.

**React mirrors PrimeNG's class names, deliberately.** The canonical
stylesheets target them — table.css alone keys off 19 `.p-datatable-*`
selectors — so a React component that renamed them would render unstyled.
Measure the stylesheet before writing the markup.

**The React package forks nothing.** `copy-shared-styles.mjs` copies the
canonical `@org/ui-kit` CSS; there is no React-local design stylesheet, and
`verify-build.mjs` fails if Angular, PrimeNG or rxjs appears in the output.

**Table collapsible groups are an Angular projected-template contract.**
`BapsTable` keeps `collapsedGroupKeys` as controlled state and supplies
`collapsed` plus a stable `toggleGroup` callback to projected `groupheader`
templates. The consumer owns the native toggle button and its
`aria-expanded`; the wrapper suppresses only matching `body` templates so the
group header remains available to reopen. React has no approved grouping or
PrimeNG virtual-scroller contract, so GAP-01 does not create look-alike React
props with different semantics.

**Projected table headers use native drag markers, not PrimeNG's directive.**
`pReorderableColumn` injects its parent `Table`, so it throws NG0201 when the
header template is owned by a `BapsTable` consumer. With
`reorderableColumns=true`, put native `draggable="true"` only on movable
projected `<th>` elements. `BapsTable` handles the browser drag events and
emits the existing typed `colReorder` indices; the consumer remains responsible
for reordering its own column array. This preserves per-column opt-out without
adding another public input or weakening the element-injector rule.

---

## Things that mislead — *2026-10-08*

**Never run a Storybook build while the guard suite is running.** Both read and
write `dist/`, so the guard run becomes invalid — not merely slower. It does
not announce itself as a collision either: a guard mid-sweep sees files being
replaced underneath it and reports a component failure. Measured:
`check-brand-scope` died on `components-internalnavbar--docs` with
`TimeoutError: page.waitForSelector: Timeout 60000ms exceeded`, which reads
exactly like a broken page. Finish one, then start the other; a suite that
overlapped a build has to be re-run from the start.

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

**`git blame` on `.storybook/main.ts` or `toast.stories.ts` can land on merge
`d1e161c`.** That merge of `chore/storybook-noise` is not clean: on top of both
parents it reformats those two files with Prettier — line wraps and trailing
commas, no logic change, verified by diffing the merge against `f999d3a`. The
real changes are `25f17cd` (toast) and `f999d3a` (baseline list). The merge
message does not mention the reformat.

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

The eleven browser guards no longer need a Storybook you started yourself:

```bash
node tools/with-storybook.mjs          # all eleven, against one server
node tools/with-storybook.mjs a11y-audit
pnpm nx run storybook-host:guards      # the same, for CI
```

It reuses a server already on `:4400` and leaves that one alone; it only
tears down one it started itself. All eleven pass as of 2026-10-09.

**Five of them were silently dead before that runner existed**, and this is
the thing to remember: not one was failing honestly. `check-tag-drift` and
`check-pagination-drift` crashed parsing snippets files that had been
refactored underneath them; `check-toggle-switch-drift` crashed on a Route B
component that has never had a Custom tab; `check-standalone` waited 120s for
a story renamed long ago. The rest exited 1 on a connection error, which reads
exactly like a finding.

**Two more reported findings and exited 0**, so the runner printed "ok" over
them: `check-standalone` (3 of 7 standalone) and `a11y-audit` (two CRITICAL
rules). Both now gate — check-standalone against a written
`STANDALONE_NOT_REQUIRED` list, a11y-audit against a `KNOWN` baseline whose
counts are ceilings meant to ratchet down. **Check what a guard actually
printed; an exit code from this suite was not evidence.**

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
| 3 | React tests are one file, and 17 components are not in it | Measured 2026-10-08: accordion, breadcrumb, dialog, drawer, internal-navbar, menu-item, navbar, popover, split-button, stepper, table-column-config, table-sort-config, tabs, toast, toolbar, tooltip and form-field have no assertion naming them. Drawer, Dialog and Popover cannot be tested without jsdom; the other 14 can. |
| 3a | 26 components have no Custom tab and no written reason | 12 have one, 9 record a Route B reason in the snippet file, 26 do not. 19 of those 26 are PrimeNG wrappers where a delta-only stylesheet is a good reason — it is simply not written down. The 7 standalone ones are accordion, file-upload, form-field, spinner, stepper, tabs and users-dropdown. |
| 3b | Three Custom tabs were deleted without being noticed | `0c26fe5` rewrote six snippet files carried in from another session and dropped the `custom` blocks from breadcrumb (1), file-upload (2) and tabs (1). check-snippets does not fail on a REMOVED Custom tab, only on an unproven one, so nothing caught it. |
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

- **An indeterminate progress bar still advertises a position.** PrimeNG puts
  `role="progressbar"` on the `<p-progressbar>` host and binds
  `attr.aria-valuenow` unconditionally, so axe reports `aria-allowed-attr`
  and `aria-valid-attr-value` on every indeterminate bar. Measured, neither
  lever in our wrapper works:

  | attempt | result |
  | --- | --- |
  | `[attr.aria-valuenow]="null"` on `<p-progressbar>` | PrimeNG's host binding wins; still `40` |
  | `[value]="undefined"` when indeterminate | renders `NaN` — worse |

  Fixing it needs either a PrimeNG change or imperative DOM surgery in
  `ngAfterViewChecked`, which is the kind of workaround that rots. A spec
  pins the current behaviour so the day PrimeNG fixes it, the test fails and
  says to delete itself.

  PrimeNG 21.2 also writes the non-existent `aria-level` attribute as a
  percentage on every determinate progress bar. Measured in the Table grouped
  story on 2026-10-20, axe reports both `aria-allowed-attr` and
  `aria-valid-attr-value` for each rendered bar even though its valid
  `role="progressbar"`, `aria-valuenow`, min, max and label are present. This is
  an upstream host binding, not a Table/collapse defect; do not raise the axe
  ceiling or hide it with a Table-specific workaround.

  `aria-progressbar-name` IS fixed: the wrapper gained an `ariaLabel` input
  (PrimeNG binds no name, and a template binding for an attribute PrimeNG
  does NOT bind does land). Adding the input was not enough on its own — the
  playground story binds `[ariaLabel]` and had no arg, so it rendered nameless
  until the arg was supplied too.
- **Link rest colour fails WCAG AA for normal text, in both brands.** Measured
  against #ffffff (AA normal needs 4.5:1):

  | brand | rest today | ratio | next ramp step | ratio |
  | --- | --- | --- | --- | --- |
  | MyBKY | `blue-600` #5f78b8 | **4.32** | `blue-700` #4c6095 | 6.15 |
  | Sampark | `primary-60` #c96868 | **3.71** | `primary-80` #b44141 | 5.57 |

  A compliant token exists in both ramps, but it is already the HOVER colour,
  so adopting it collapses rest and hover into one. Fixing it properly means
  shifting all three link states down a step — and the Sampark ramp ends at
  `primary-100`, leaving the active state nowhere to go.

  That is a change to the link state ramp across every product, not a token
  swap. Needs a designer. There is no dedicated `--link-*` token.
- `--avatar-sampark-info-*` does not exist; the other five variants have a tier.
  `.baps-avatar-html--info` stays on MyBKY colours.
- No `--button-sampark-danger-*` or `--button-sampark-warning-*` at all.
- Sampark toggle-switch `xs` has no standalone rule; only `--s` and `--l` exist.
- `--navbar-menu-button-bg` `#fbc02d`, `-hover-bg` `#d3a126`, `-text` `#212121`
  are bare literals with no token behind them.
- **Ask at demo.** `_menu.scss` (2026-10-24): no MyBKY dropdown shadow (Sampark has
  `--shadow-sampark-dropdown`; no `--shadow-mybky-*` matches the two-layer
  `rgba(24, 27, 29, …)` value), no token for the 200px panel `min-width`, and
  no letter-spacing token for the submenu header's `0.04em`. All three stay
  literal with a comment.
- **Ask at demo.** `_chips-input.scss` (2026-10-24): the intended 64px
  (4rem) input slot was written as a
  non-existent `--space-16` (the scale stops at `--space-10`), so the browser
  dropped it. Now `calc(var(--space-8) * 2)`; a real `--space-16` is the
  designer's call. Its `150ms` transitions have no token either: the nearest,
  `--motion-duration-fast`, is 120ms.
- **Ask at demo.** `_accordion.scss` (2026-10-28): SPM dev's Filters drawer
  resolves `--table-header-bg` to `#f6f7f8`, but Sampark has no token for that
  cool-grey surface; its documented Mono/10 header token is `#f8f7f7`.
  FILTER-PANEL keeps Mono/10 rather than inventing a new Sampark value.

## Approved token exceptions — *2026-10-08*

- `var(--token, #fallback)` fallbacks. Defensive, not hardcoding.
- `0`, `100%`, `50%` and other technical values.
- 1px borders and hairlines.
- SVG `viewBox` and path data.
- **`.baps-tag--primary`'s `background-color` and `color` in
  `components/tag/_tag.scss`.** The only two bare hex left anywhere, and
  deliberate: they are baked to match the preset's own literals so the live
  component and the preset cannot disagree, with `check-tag-drift.mjs` as the
  thing that notices if they do. They become token references again when
  bucket B migrates tag off the preset literals. The reasoning is written
  above the rule itself.

**Measured 2026-10-09, over the whole styles tree and every component's inline
`styles:` block, with comments, `--token:` definitions and nested
`var(--token, #fallback)` fallbacks excluded: 2 bare hex, both the tag
exception above.** Earlier counts of "22 in `_input.scss`" and similar were
counting fallbacks, which this list has always permitted — there was never
anything there to fix. Worth re-measuring the same way before trusting any
future count.

---

## Status — *2026-10-08*

Branches: every ref is contained in `main`; four stale branches remain
(`chore/atomic-design-reorg`, `feat/framework-tabs`, `fix/audit-2026-10`,
`agents/avatar-playground-html-css-issue`). One stash holds visual-regression
screenshots, not source.

Counts, if they are useful as a tripwire rather than a source of truth:
47 component families (the barrel exports 47; `_template` is a scaffold and is
the only directory not exported). All 47 carry framework snippets, **253/253
examples** — the previous line claimed 247/254 and that "the seven uncovered
are Interaction stories, excluded by design", which was wrong twice over: the
guard already excludes Interaction stories from the count, and the seven were
ordinary examples nobody had written (tabs ×3, accordion, icon, avatar ×2).
Six were written; the seventh, avatar's `_DocsAnchor`, is not an example at
all and the guard now skips leading-underscore exports the way it already
skipped leading-underscore directories.

41 per-component stylesheets emit. **Angular 733/733 across 50 suites** and
every component now has a spec (was 505/505 over 32 suites, with 18 families
carrying none). **React 138/138 across 52 per-component files** (was 53/53 in
one file).

Component-level truth stays in the STATUS files.

## ChipsInput PrimeNG replacement — *2026-10-14*

PrimeNG 21.1.3 has no `primeng/chips` package export. PrimeNG removed Chips in
v18 and its migration guidance names AutoComplete with `multiple` enabled and
`typeahead` disabled as the replacement. The installed v21 AutoComplete owns
the required Enter, empty-input Backspace, separator and CVA behavior, while a
wrapper-owned sibling list renders every committed string through `baps-chip`.
The AutoComplete's duplicate internal chip nodes are presentation-hidden; its
input and value model remain the behavior source of truth.

PrimeNG does not label its multiple-value container, and its `listbox` / nested
`option` / `combobox` roles fail axe's nested-interactive rule. Wrapping this
control in a native `label` would also nest every chip remove action.
Use a visible label with an `id` and put the standard `aria-labelledby`
attribute on `baps-chips-input`. The wrapper forwards it to the combobox and
turns PrimeNG's containing list into a named non-interactive `group` after view
initialisation; this is internal a11y wiring, not an extra component input.
Chips are tracked by value so PrimeNG's hide-on-remove animation state cannot
be reused for the next visible chip.

The public Angular API remains the approved `placeholder`, `disabled`, `size`,
`brand`, `separator` and `string[]` CVA surface. React maps that same form value
contract to `value`/`onChange`; no blur-add, duplicate-policy, maximum-count,
ARIA-label or style escape-hatch API was approved or added.

**Recheck this on every PrimeNG upgrade.** The wrapper writes no key handling
of its own — searching `chips-input.component.ts` for `Backspace` finds
nothing, and that is correct rather than a gap. Empty-input Backspace,
Enter-to-commit and separator splitting all come from AutoComplete's own
value model, which still runs because its internal chip nodes are only
*presentation-hidden* (`.p-autocomplete-chip-item { display: none }`) rather
than removed from the DOM. A PrimeNG release that stops rendering those
nodes, or that changes where the key handling lives, silently removes
behaviour this wrapper never implemented.

Two tests guard it and are the thing that will fail first — keep them:
`chips-input.component.spec.ts` *"removes the final value with Backspace when
the input is empty"* and `tests/chips-input.test.mjs` *"removes the last value
with Backspace on empty input"*.

## Versioning and consumption decisions — *2026-10-15*

`docs/VERSIONING-AND-UPGRADE.md` is the single compatibility matrix and release
policy. The kit remains on 0.x until spm-ui integrates successfully. An
intentional default visual change is minor; a spec-alignment visual fix is
patch; removing or renaming a public API, CSS class or token is major.
Deprecate first, remove in the next major, and maintain `CHANGELOG.md` manually.
Supported consumers use the current Angular 21 / PrimeNG 21 line; older apps
take the upgrade-first route rather than a compatibility shim.

The legacy path keeps an application's wrapper APIs stable, upgrades its
framework/PrimeNG first, then swaps wrapper internals to the kit one component
family at a time with baseline screenshots and designer colour/contrast
sign-off.

`@org/tokens` stays a separate package. The current external delivery route is
matched tokens + kit tarballs; a private registry is a future team decision,
not current infrastructure. Source manifests retain `workspace:*` for local
development, while the build/pack path rewrites it to the exact token version.
Consumer setup and proof requirements live in
`docs/CONSUMER-INTEGRATION-GUIDE.md`.

## Open question — something focuses the form-field input late — *2026-10-15*

`components-form-controls--label-and-typing-interaction` fails at
`expect(<input#pg>).toHaveFocus()` and is documented as a known
pre-existing failure. It fails on `main` as well; no branch has touched
`form-field`.

**The unexplained part, measured:** roughly 9 seconds after the story
loads, **with no interaction at all**, `document.activeElement` is already
`INPUT#pg`. At play-function time it is not. Something focuses that input
later, and until it is identified the story cannot be fixed honestly.

Candidates, none confirmed:

- an `autofocus` somewhere in the Playground template or a directive,
- a Storybook manager or docs effect restoring focus to the preview,
- another story's play function reaching across (the guard now isolates
  each story in its own browser context, which did **not** change this),
- Angular restoring focus after a late change-detection pass.

Already ruled out by direct measurement, so do not re-test these:

| Hypothesis | Result |
| --- | --- |
| duplicate `id="pg"` | no — one input, one label, in both the iframe and manager views |
| broken label association | no — `for`/`id` match; `findByLabelText` resolves through it |
| `userEvent` synthetic click cannot focus via a label | no — dispatching the exact pointer/mouse sequence focuses `INPUT#pg` |
| input disabled or readonly | no — both false |
| tab order | the original `userEvent.tab()` assertion was impossible — the first five tabbables are buttons and anchors — and was replaced in `9221553` |

**It also poisons the story that runs after it.** Measured:
`chips-input--keyboard-interaction` passes when it runs BEFORE
form-controls and fails when it runs AFTER, in both orders, repeatedly. So
a single genuine failure here shows up as two, and the second one looks
like flakiness. When reading an interactions run, check what ran
immediately before a surprising failure.

## The Storybook build OOM is not closed — *2026-10-15*

*Closed 2026-10-08* above lists "Storybook build OOM (minimizer
parallelism)" as fixed. **It recurs.** Measured 2026-10-15 with 4.2 GB free
of 19.8 GB:

```
DataCloneError: Data cannot be cloned, out of memory.
Emitted 'error' event on Worker instance
```

It is a worker-thread failure, so `NODE_OPTIONS=--max-old-space-size=8192`
does not reach it — that flag still matters for the Angular Jest run, but
it will not save this build.

It is also **not a code error**, and reads like one: the log ends mid-way
through parsing component files with no TypeScript diagnostic. The same
build succeeded on an immediate retry with no source change.

Before any Storybook build:

1. Kill leftover guard processes — Playwright Chrome
   (`CommandLine -match 'ms-playwright|--headless'`) and any node still
   running `check-*`, `with-storybook` or `http-server`. **Never kill the
   developer's own Chrome**; match on the command line, not the image name.
2. Keep `NODE_OPTIONS=--max-old-space-size=8192` set.
3. If it fails this way anyway, retry once before looking for a cause.

A browser check against a stale `dist/storybook/storybook-host` is worse
than no check, so confirm the build actually exited 0 before serving it.
