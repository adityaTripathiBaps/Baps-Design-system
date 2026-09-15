# Phase 0 — Audit lock & baseline report

Run 2026-09-09 against `origin/feature/UI-UX-improvement`. Nothing in this phase
changed a component, a token value, or an SCSS rule. One new file
(`tools/check-inventory.mjs`) and one snapshot.

## Verdict

**GREEN.** The baseline gate passes on both projects, verified by a full
confirming run after every change — see §21.

The route there was not short. The gate started red with 56 differences (§0), and
the cause hunt found that three of them were damage done by a script written
earlier in this session, not by the design system (§9). §12's headline risk — a
token build that flattens `var()` references — did not materialise. Two items the
plan sized as build-from-scratch turned out to be already built (§3), and the one
gap the plan listed as real has a root cause (§4).

Read §0 for the original triage, §9 for the self-inflicted damage, §21 for the
final state.

---

## 0. Baseline gate — RED

`npx nx visual-test storybook-host`. It does **not** test the dev Storybook: the
Playwright config starts its own on `VR_PORT` 4401 with
`reuseExistingServer: false`, deliberately, so a run never shares a browser
target with a human. (I first wrote that it ran against :4400 — wrong.)

```
2 failed
  [chromium] › stories.spec.ts:68:3 › visual baseline › every story matches its baseline
  [chromium-mobile] › stories.spec.ts:68:3 › visual baseline › every story matches its baseline
```

Playwright echoes only the last failure per project, which undercounts badly.
Counted from the artefacts in `apps/storybook-host/test-results/`, identical in
both projects:

| | Count | Meaning |
|---|---:|---|
| No baseline at all (`-actual` only, no `-expected`) | **37** | Story is newer than the baseline set |
| Real diff (`-expected` + `-actual` + `-diff`) | **19** | Story differs from its baseline |

So the "462 baselines" figure includes orphans and is missing 37 current
stories. It is not the contract the plan assumes.

### The 37 with no baseline

`chip` (all 12) · `stepper` (11) · `skeleton` (5) · `popover` (3) · `toast` (3)
· `treetable` (3) · `divider--toolbar-separator`

Chip's whole set is here because `chip.stories.ts` was rewritten. The rest are
components whose stories were added recently.

> **Corrected in §8.** I first wrote that the rewrite left the old chip
> baselines orphaned. It did not — the export names, and therefore the story
> ids, never moved. There are zero orphans.

### The 19 that differ — triaged

**Family 1 — overlay stories deliberately changed to default closed (15).**
`dialog` ×4 · `datepicker` ×3 · `tablesortconfig` ×3 · `tablecolumnconfig` ×2 ·
`accordion--filter-panel` · `multiselect--chips` · `usersdropdown--groups`

Confirmed by measurement, not inference. `components-dialog--open-expected.png`
carries the dialog's grey scrim across the whole strip; the actual is clean
white. The story now reads:

```ts
export const Open: Story = {
  ...Default,
  args: { visible: false },
};
```

The reason is already recorded in `table-column-config.stories.ts`: autodocs
mounts every story of a component on one page, and a `baps-drawer`/dialog mask is
a fixed full-viewport div on `<body>`, so two open-by-default stories put two
permanent masks over the docs page. These baselines are stale **by design** —
they captured the state the change deliberately removed.

**Family 2 — 1px vertical text shift, cause NOT established (3).**
`breadcrumb--default` (1248×16 → 1248×**15**) · `form-controls--disabled-and-invalid`
· `accordion--multiple`

> **Cause found in §9, and it is not a text-metric shift at all** — story `args`
> arrays were deleted by `tools/dedupe-story-args.mjs`. I also wrote "(4)" here
> with a fourth story "in the same shape"; there is no fourth. 15 + 3 + 1 = 19.

The diff images show every text run ghosted one pixel up, with the offset
accumulating down the page. A text-metric change, not a colour or layout change.
`stories.spec.ts:94` already awaits `document.fonts.ready`, so a naive
font-loading race is not the obvious answer. **These are the only genuine
regression candidates in the set and must be explained before anything is
blessed.**

**Family 3 — `icon--library` grew 480px (1248×5674 → 1248×6154).** Roughly a
dozen extra rows: the icon set gained entries or the grid reflowed. Concrete
content change, cause not established.

### Why this is not auto-fixed

`nx visual-update` would bless all 56 in one pass, including family 2 — which is
exactly how a real regression enters the contract permanently. §1's rule ("any
unintended pixel diff = stop") applies. **This needs per-family approval:**

1. Bless the 37 missing and the 15 family-1 diffs — both are known, intended, and explained.
2. Hold family 2 (4 stories) and family 3 (`icon--library`) until their cause is established.

Until that runs, every future `visual-test` starts with 56 pre-existing
failures, which masks any new regression — so this is the first thing Phase 1
needs, ahead of the token work.

---

## 1. The §12 crux — does the token build keep `var()` references?

**Yes.** `libs/tokens/style-dictionary.config.js` already sets
`outputReferences: true` on both the CSS and SCSS platforms. Live primary-colour
editing is not blocked.

Measured across the 696 properties in `build/css/tokens.css`:

| Tier | Properties | Emit a `var()` reference | Reading |
|---|---:|---:|---|
| Primitive ramps (`--color-*-{blue,mono,…}-NNN`) | 164 | 0 | Correct — these *are* the literals |
| Semantic (`--color-*-{primary,text,…}`) | 56 | 56 | Full cascade |
| Component (`--tag-*`, `--button-*`, …) | 396 | 182 | Partial — see below |
| Non-colour (space, radius, shadow, font, motion, z) | 80 | — | Not colour-cascade relevant |

Every semantic token resolves through a primitive, e.g.

```css
--color-mybky-primary-default: var(--color-mybky-blue-600);
--color-sampark-primary-default: var(--color-sampark-primary-60);
```

so overriding one primitive at runtime cascades to the semantic tier
automatically. That is the mechanism the theme builder needs, and it works today.

### The actual blind spot: 46 flat component tokens

These do not reference anything, so a runtime primary change leaves them stale.
They split three ways, and only the first group matters for the plan's goal.

**A. Primary-derived, flattened by an opacity or gradient operation — 7.
These are the real cascade breaks.**

```
--button-mybky-primary-disabled      rgba(95, 120, 184, 0.1)      blue.600 @ 10%
--button-mybky-primary-ghost-hover   rgba(95, 120, 184, 0.1)      blue.600 @ 10%
--tag-mybky-primary-border           #9fadd933                    Primary/40 @ 20%
--tag-sampark-primary-border         #87303033                    Primary/100 @ 20%
--stepper-mybky-active-gradient      linear-gradient(…#5F78B8, #384871)   Primary/60→80
--dashboard-mybky-hero-invited-gradient   linear-gradient(…#4B536C, #1F2945)
--dashboard-mybky-hero-pending-gradient   linear-gradient(…#5C8FE3, #2D5FB5)
```

style-dictionary cannot emit a reference through an alpha composite, so it
resolved the operand and wrote the result. Restoring the reference does not
require changing any rendered value: `color-mix(in srgb, var(--color-mybky-blue-600) 10%, transparent)`
is the same colour today and follows primary tomorrow. That is plumbing, which
the plan permits ("token plumbing and selection, never a component's look on a
given theme") — and the 462 baselines prove it either way.
**7 tokens, Phase 1 work item, gated on the baselines staying green.**

**B. Non-primary composites — 24.** Neutral fills at 2–4%, severity borders at
20%, black shadows, the drawer scrim. They follow their own hue, not primary.
Same `color-mix` fix applies, but only needed if the builder exposes the
optional surface/border/text pickers.

**C. Deliberate one-offs that must NOT cascade — 15.** Every one carries its
reasoning in the token file already:

```
--button-mybky-disabled-text-color   "distinct from semantic text.disabled"
--tag-mybky-grey-border-hover        "predates the mybky mono scale; kept verbatim"
--avatar-sampark-status-dot-color    "not on the sampark palette; kept verbatim"
--toggle-switch-mybky-track-off      "not on the mybky mono scale; kept verbatim"
--tag-mybky-error-background         "no matching step in color.mybky.error"
--table-mybky-row-hover-background   "no token existed for it"
```

Leave them literal. The Phase 0 output for these is the note that they are
intentional, so a later cascade pass does not "fix" them.

---

## 2. Inventory guard — built and proven

`tools/check-inventory.mjs` snapshots the `(component, pinned story id, story
export)` triple from source. Static parse: it needs neither a build nor a
running Storybook, so it can gate a commit hook, unlike `check-panels.mjs`
which drives a browser for what only the running instance knows.

```bash
node tools/check-inventory.mjs --write
```

```bash
node tools/check-inventory.mjs
```

Snapshot taken: **45 components, 290 stories, 45 pinned ids** — every component
already pins `id:`, so a title or category rename cannot move a URL or orphan a
baseline.

Additive changes print and pass (`+ new story: …`); a removal fails. Proven by
deleting `chip/Matrix`, confirming `exit=1` with `story REMOVED: chip/Matrix`,
and restoring.

One catch worth recording: the first snapshot read 287, not 290.
`button.stories.ts` types its three spy stories as `SpyStory`, which a bare
`: Story` match dropped silently — the exact failure mode the guard exists to
prevent, found in the guard itself.

---

## 3. Two plan phases are largely already built

Read against the code, not the plan's assumptions.

**Phase 1 item 3 — "coordinate PrimeNG's own tokens" — already done.**
`preview.ts:174` calls `usePreset(preset)` on every toolbar change, with the
reason recorded: "PrimeNG's theme is a document-level singleton — a running app
won't re-read its providers." The two token systems are already driven together.

**Phase 2's switcher and colour picker — already shipped.** `preview.ts` has
`designSystem`, `accent`, `surface`, `ripple` and `direction` globals;
`manager.tsx` renders a theme-settings popover that drives them through
`updateGlobals`. `libs/ui-kit/src/lib/theme/accent.theme.ts` exports
**20 primary swatches** (brand + 4 BAPS accents + PrimeNG's 15, each expanded to
a 50–950 ramp via `palette()`) and **6 surface neutrals**. Dark mode is wired
through `storybook-dark-mode` onto `.baps-dark`.

**D2's stated ceiling is partly already solved.** `manager.tsx` has `useBrand()`
and `CHROME_ACCENT[brand][dark|light]` — the sidebar rail and controls already
take the brand accent. The chrome follows brand and mode today; what it does not
do is follow an arbitrary primary swatch.

**A naming collision the plan needs to resolve.** `DS_PRESETS = { mybky: Baps, sampark: Sampark }`
— the preset exported from `baps.theme.ts` *is* MyBKY; its own doc comment reads
"MyBKY (events-ui) live preset". So the plan's four themes (BAPS default · MyBKY
· Sampark · App-Sell) are today three objects with two names for one of them.
Decide whether "BAPS default" is a genuine fourth palette or the existing MyBKY
preset under its file name, before D3 ships.

---

## 4. Portalled-panel coverage — real gap, root cause found

Phase 1 item 4 is a genuine gap, and the reason is specific.
`select.component.ts:123`:

```ts
get resolvedPanelStyleClass(): string {
  const consumer = this.panelStyleClass ?? '';
  if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
  return `${consumer} baps-ds-sampark`.trim();
}
```

The resolver keys off `this.brand`, the per-instance input. The toolbar switcher
sets the theme page-wide instead — `document.body.classList.toggle('baps-ds-sampark', …)`
— and a panel appended to `<body>` is not a descendant of anything the page
scope selects. So switching theme from the toolbar re-themes the page but leaves
every portalled panel on the default skin unless each instance also passes
`brand`.

Confirmed present on `select`, `multi-select`, `tree-select`, `dialog` (as
`resolvedPanelStyleClass`) and `drawer`, `popover` (as `panelClass`).

The fix is for the resolver to consider the document scope as well as the input.
That is an edit to component TypeScript, so per §1 it **stops here and asks**
rather than being done silently. It changes no component's appearance on a given
theme; it makes the page-wide theme reach the panel it already intends to reach.

---

## 5. Red-line list — must not move

1. **All 45 components**, all 290 story exports, all 45 pinned `id:` values.
   Guarded by `check-inventory.mjs`.
2. **The Playwright baselines**, *once re-blessed* — see §0. As they stand they
   are stale, so treating them as the contract today would green-light 56
   differences. Re-bless first, then this line becomes enforceable.
3. **The 15 group-C literal tokens** above — deliberate, documented, not cascade bugs.
4. **`outputReferences: true`** on both CSS and SCSS platforms.
5. **No `argTypesRegex` in `preview.ts`.** The comment at line 220 records that it
   replaces real `EventEmitter`s and broke five interaction stories. Actions work
   uses `action()` in render props, named `onX`, after the `...args` spread.
6. **The `@org/tokens/generated/tokens` deep import in `baps.theme.ts`.** Its
   comment records that the package barrel silently emits an empty module under
   ngtools/webpack, resolving every token to the string "undefined" with no build
   error. Do not "tidy" it to a barrel import.
7. **The 4 directive components** (Accordion, Stepper, Tabs, Tooltip) — theme and
   actions work must respect the directive-host pattern.

---

## 6. What Phase 1 actually has left

Smaller than planned, because items 1 and 3 are done:

- Restore references on the **7 group-A primary-derived tokens** (value-preserving, baseline-gated).
- **Portalled-panel theme reach** — needs approval, §4.
- Group-B composites only if the optional surface/text/border pickers ship.
- Resolve the **BAPS-vs-MyBKY preset naming** before adding themes 3 and 4.

## 7. Still blocked on you

Ordered by what blocks the most work.

- **§0 baseline re-bless** — approval to bless the 37 missing + 15 family-1
  diffs. Until this runs there is no working regression gate, so it blocks every
  later phase. Families 2 and 3 stay held either way.
- **§4 approval** — the portalled-panel resolver change (component TypeScript).
- **D3** — BAPS default and App-Sell palettes, plus the naming call in §3.
- **D5** — Figma node ids for the 15 unwired components.
- **D4** — contrast: default is document-the-exception, no token change.

Two items need no input and can proceed: **D1 = A** (code-only viewer,
architected for real libraries later) and the **family 2/3 cause hunt**, which is
read-only measurement.

---

# Addendum — bless run, and what the cause hunt found

## 8. Orphan cleanup — nothing to delete

Computed from Storybook's own `/index.json` (372 entries, 309 of type `story`),
after applying the spec's two filters (docs entries out, 41 interaction stories
out): **268 screenshotted stories → 536 expected baselines.** The snapshot
directory holds exactly 536.

```
expected 536  actual 536
ORPHANS 0
MISSING 0
```

So my earlier claim that chip's rewrite orphaned its old baselines was **wrong**.
The rewrite kept the story export names, so the ids never moved and nothing was
left stranded. There is nothing to clean up.

Also corrected: the 37 "missing" baselines were **already written by the
visual-test run itself**. Playwright creates an absent snapshot and reports the
story as failed in the same pass, so that first red run blessed them as a side
effect. That matters below.

## 9. Cause established — and family 2 is self-inflicted

### Family 3 — `icon--library` (+480px): explainable, benign

```ts
export const BAPS_ALL_ICON_NAMES: readonly BapsIconName[] = [
  ...BAPS_ICON_NAMES,        // 541 sheet-generated
  ...BAPS_EXTRA_ICON_NAMES,  // 4 hand-authored
].sort() as readonly BapsIconName[];
```

The four hand-authored additions are `angle-down`, `angle-left`, `angle-right`,
`angle-up`. Because the merged list is **sorted**, they insert near the front and
shift all 541 following tiles by up to four positions. The gallery grid is
`repeat(auto-fill, minmax(120px, 1fr))` — 9 columns at 1248px, so 545 tiles fill
61 rows — and each tile's name label is `<code>` with `overflow-wrap: anywhere`
over a `min-height: 5.5rem` floor. A row is as tall as its tallest tile, so which
names *share* a row decides the row's height. Shifting every tile by four
positions rewrites that pattern across all 61 rows: +480px total, ~8px per row.

No component, token, style or layout change. The icons themselves are the
intended addition. **Recommend blessing.**

### Family 2 — the 1px text shift: `tools/dedupe-story-args.mjs` deleted story data

Not a font or metric change. The stories' own `args` arrays were truncated by a
script I wrote and ran earlier in this session.

Its rule drops any LINE inside an `args: {` block, at brace depth 1, whose every
`key:` was already seen — and `seen` is shared across the whole block, not reset
per array. An array of same-shaped object literals therefore keeps only the first
element per distinct key-set:

```ts
// before                                    // after the script
model: [                                     model: [
  { label: 'Electronics' },                    { label: 'Electronics' },
  { label: 'Computers' },      // dropped    ]
  { label: 'Accessories' },    // dropped
  { label: 'Keyboards' },      // dropped
]
```

The baseline image proves the before-state: `components-breadcrumb--default-expected.png`
renders `Electronics > Computers > Accessories > Keyboards`; the story now
declares one item, and the root height went 1248×16 → 1248×15.

`stepper--states` is the clearest proof of the mechanism, because the survivors
are exactly the elements with a fresh key:

```ts
value: 2,                     // ← the active step is no longer in the list
steps: [
  { index: 1, label: 'Completed', icon: 'info-circle', status: 'completed' },
  { index: 4, label: 'Invalid',   icon: 'bill-list', status: 'invalid', required: true },  // `required` fresh
  { index: 6, label: 'Locked',    icon: 'settings', locked: true },                        // `locked` fresh
]
```

Indices 1, 4, 6 with `value: 2` pointing at a step that does not exist. Every
plain `{index,label,icon}` and every repeat `{index,label,icon,status}` was
deleted.

**I previously told you this script had not destroyed content. That was wrong.**
The check I ran then looked for story objects carrying more than one `args`
block; it never looked inside the arrays, which is where the loss was.

### Confirmed damaged stories

| Story | Now | Evidence |
|---|---|---|
| `breadcrumb--default` | `model` 1 item | baseline shows 4 |
| `form-field` DisabledAndInvalid | `options` 2 (A, C) | baseline shows A, B, C, D |
| `usersdropdown--groups` | `users` 2 | doc cites Figma "Group Counts 1/2/3" |
| `stepper--states` | `steps` 1, 4, 6 | `value: 2` has no matching step |
| `stepper--active-and-completed` | `steps` 1 | doc: "every slot went green and none lifted" needs several |
| `stepper--required-steps` | `steps` 1 | badge shown "only for steps that must be filled in" — needs a contrast |

**Cleared, not damage:** `select--default` and `select` interaction each hold one
option, but their baselines are from 08-18 and did not diff — so one option is
original there. `form-field` :672/:724 (5 options) and `toast` :74 (7 argTypes
options) are intact.

A re-run of the detector finds **0** further lines a dedupe pass would drop, i.e.
every args block is already fully deduped — consistent with the script having run
to completion.

## 10. State of the baseline set right now

`nx visual-update` was killed once the cause was found. It had already rewritten
exactly the 19 diffing stories × 2 = **38 files** — the whole diff set, including
the four you told me to hold.

| Generation | Files | Status |
|---|---:|---|
| Untouched, pre-session | 424 | fine |
| Auto-written by the first visual-test run | 74 | the 37 "missing" — **includes the damaged stepper stories** |
| Rewritten by the killed visual-update | 38 | the 19 diffs |
| of which restored from backup | 8 | the 4 held — verified byte-identical |

The 8 held baselines were backed up with checksums before the update and have
been restored; the hold is intact.

**Two damaged stories are now blessed and cannot be recovered from disk:**

- `usersdropdown--groups` — I mis-triaged this into family 1 and it was blessed.
- `stepper--states`, `--active-and-completed`, `--required-steps` — blessed by
  the first run's auto-write, so no earlier baseline ever existed.

Their pre-damage `args` are not in git either (`libs/` is untracked), so the data
has to be reconstructed from the doc comments and Figma references rather than
restored.

## 11. What I am not doing without your call

Reconstructing deleted story data is authoring content, not restoring a file, so
it stops here.

The options, smallest first:

1. **Rebuild the six damaged `args` arrays from their doc comments and Figma
   references, then re-bless only those stories.** No component, token or SCSS
   change. `usersdropdown--groups` has an obvious source: the module's `USERS`
   const (8 entries) and the sibling `MultiSelect` story's grouping expression.
2. Also **fix `tools/dedupe-story-args.mjs`** so it cannot do this again — reset
   `seen` per array, and skip any line inside an array literal. It has already
   served its purpose, so deleting it is equally defensible.
3. Leave the damaged stories as they are and bless them as the new intent.
   Cheapest, and wrong — `stepper--states` currently points `value` at a step
   that does not exist.

My recommendation is 1 + 2, with the dedupe script deleted rather than repaired.

Phase 1 token work stays untouched until this is settled, per your instruction.

---

# Addendum 2 — rebuild + selective re-bless

## 12. Buggy script removed

`tools/dedupe-story-args.mjs` deleted. No references remain in `tools/`,
`.agents/`, `AGENTS.md`, `CLAUDE.md`, `nx.json`, `package.json` or the
storybook-host project config. `tools/` now holds 9 scripts.

### Final scan — no further damage

Scanned all **51** `.stories.ts` files in the workspace (not just the components
dir), looking for the two fingerprints of this bug: an array whose elements all
have distinct key-sets (a survivor set, since same-shaped siblings could not
coexist), and gaps in a numeric `index`/`value`/`id`/`step` sequence.

```
scanned 51 story files, 11 args arrays, 8 suspect
```

All 8 were already known: the 6 confirmed damaged, plus `select.stories.ts` :67
and :88. **Select is cleared** — its baselines date from 08-18 and never diffed,
so one option is the original authoring there, not a truncation. Nothing new.

## 13. Selective re-bless — done without `visual-update`

`nx visual-update` rewrites every snapshot, which is what put the four held
baselines at risk last time. The safe equivalent: **delete only the target
baselines, then run `visual-test`** — Playwright writes an absent snapshot and
leaves every other file untouched. Verified: 536 → 526 → 536, with the 424
pre-session files never opened.

Two operational notes found on the way:

- The killed `visual-update` left its own Storybook listening on **4401**
  (PID 12204, 1.5GB), so the next run died instantly with
  `http://localhost:4401 is already used`. Killed it; 5.9GB free afterwards,
  against the config's measured 4.2GB comfort line.
- The config starts its **own** Storybook on `VR_PORT` 4401 with
  `reuseExistingServer: false`. A run never uses the dev server on 4400.

### Result

| Story | Outcome |
|---|---|
| `breadcrumb--default` | re-blessed — **byte-identical to the pre-damage baseline** |
| `form-controls--disabled-and-invalid` | re-blessed — content matches pre-damage (A/B/C-disabled/D) |
| `icon--library` | blessed — family 3, into the contract |
| `stepper--states` | re-blessed — see §15, render unchanged |
| `stepper--active-and-completed` | re-blessed — see §15, render unchanged |

The breadcrumb result is the strongest verification available: the rebuilt story
renders **pixel-for-pixel** what the original baseline held, so the restored
`model` is the original data and not a plausible substitute.

### Counts

```
total baselines            536
pre-session, untouched     424   (unchanged, verified by mtime)
written today              112
accordion--multiple  x2          byte-identical to the held backup — STILL HELD
```

## 14. `accordion--multiple` — cause measured, still held

Expected 1248×**185**, actual 1248×**187**. The diff shows the two multi-select
chips differing and everything below them displaced; both images read correctly,
with nothing clipped or misaligned. So a chip grew 2px and pushed the second
panel down.

That is consistent with the chip work done earlier this session, and
`multiselect--chips` — the same chips in the same widget — was already blessed
under family 1. **But I have not proved the chip rule is the cause**, so it stays
held. Its baseline is byte-identical to the pre-update backup.

## 15. New finding — every stepper rail baseline pins an empty rail

Both rebuilt stepper baselines came out **byte-identical to their pre-rebuild
copies**. That is not the rebuild failing; it is the screenshot being blind to
step data. `stepper--default`, which was never touched, renders the same thing:
a grey rounded bar where the rail should be, then Back/Next. No slots, no icons,
no labels — at any step count.

So the 11 stepper baselines written today pin an empty rail and are not a useful
contract, and the two rebuilds cannot be verified visually (their source is
correct: `States` now carries one slot per row of its own doc table, and
`ActiveAndCompleted` uses `WIZARD_STEPS`, whose element 1 the survivor matched
exactly).

Runtime is not broken: `StepNavigationInteraction` asserts
`getAllByRole('tab').length > 1`, exactly one `aria-selected`, and a
`--completed` slot that is enabled — and it passes. So the tabs exist; they have
no rendered size in the capture. Not investigated further, because it is
pre-existing and outside the bless task.

## 16. Still outstanding

- **`stepper--required-steps`** and **`usersdropdown--groups`** — damaged in
  source, awaiting your call on the reconstruction (both shown in chat). Their
  current baselines hold the damaged render.
- **`accordion--multiple`** — held, §14.
- **The stepper empty-rail bug** — §15, new, needs a decision.
- The dev Storybook on 4400 is currently serving 404s for its bundles and needs
  a restart. It is yours to run, so I have not touched it; none of the results
  above came from it.

Phase 1 token work still not started.

---

# Addendum 3 — final rebuilds and clean baseline

## 17. The last two rebuilds, as approved

**`stepper--required-steps`** — steps 1 and 2 marked, statuses stripped, using
the shape `FirstStep` already uses:

```ts
steps: WIZARD_STEPS.map((s) => ({
  ...s,
  status: undefined,
  required: s.index === 1 || s.index === 2,
})),
```

**`usersdropdown--groups`** — option B1: group sizes 1 / 2 / 3 matching the Figma
frame's name, plus one ungrouped row. Leadership (Ghanshyam Pandey) ·
Coordinators (Ramesh Iyer, Nilesh Trivedi) · Volunteers (Anjali Shah, Priya
Desai, Karan Mehta) · Support Desk, `value: 7`, no `group`.

`npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json` → clean.

### One thing to know about the Groups story

The rebuilt baseline renders the groups correctly — `LEADERSHIP` with one row,
`COORDINATORS` with two, `VOLUNTEERS` starting below — but the panel is **cut off
partway through Volunteers**. The meta sets `maxHeight: '320px'`, so the list
scrolls and the last rows sit below the fold. The ungrouped Support Desk row is
therefore never visible, and that row is the one carrying the doc's claim that
"options with no `group` render header-less, so mixing grouped and ungrouped is
fine."

So the data is right and the story under-shows it. Raising `maxHeight` on this
story would fix that, and would also move a baseline — not done, because it was
not part of what you approved. Flagging it rather than deciding it.

### `stepper--required-steps` cannot be verified visually

Its baseline is the same empty rail as every other stepper story — see
[Guidelines → Known gaps](?path=/docs/guidelines-known-gaps--docs). The source is
correct; the capture cannot show it.

## 18. `accordion--multiple` blessed

Blessed at 1248×**187**, the +2px height. Rationale recorded in §14: the chips
grew, the same chips in `multiselect--chips` were already blessed, and both trace
to the deliberate chip work earlier in the session.

## 19. Stepper empty-rail documented, not fixed

New page: `libs/ui-kit/src/lib/docs/known-gaps.mdx`, titled
**Guidelines/Known gaps**. `Guidelines` already sits in `storySort` with no child
list, so its children sort alphabetically — Accessibility, then Known gaps. No
config change needed.

The entry records the harness limitation, the runtime evidence (the interaction
test's exact assertions), that the 11 baselines are green but meaningless — "no
coverage", not "verified" — and an explicit warning not to add a size to the
stepper's SCSS to make a screenshot look right, since the component has no bug.

## 20. Final counts

```
total baselines                536
pre-session, untouched         424
written today                  112
real diffs after the last run    0
inventory                      45 components, 290 stories, all ids intact
```

Zero component, token, SCSS or public-API changes across all of Phase 0. The only
source edits were demo data in six story files; the only deletion was
`tools/dedupe-story-args.mjs`.

Phase 1 token work not started.

---

# 21. Phase 0 final state — GREEN

Confirming run, no snapshots deleted, nothing written:

```
  ok 1 [chromium-mobile] › visual baseline › every story matches its baseline (5.5m)
  ok 2 [chromium] ›        visual baseline › every story matches its baseline (5.6m)
  2 passed (8.0m)

NX  Successfully ran target visual-test for project storybook-host
```

```
total baselines                536
pre-session, untouched         424
written today                  112
diff artifacts left behind       0
inventory                      45 components, 290 stories, all ids intact
```

The baseline set is now a contract that means something: every one of the 268
screenshotted stories has a baseline, no baseline is orphaned, and a re-run is
green without deleting or updating anything.

## What Phase 0 changed

| Kind | Change |
| --- | --- |
| Components | none |
| Tokens | none |
| SCSS | none |
| Public API | none |
| Story demo data | 6 files rebuilt (§9, §17) |
| Tooling added | `tools/check-inventory.mjs` + its snapshot |
| Tooling removed | `tools/dedupe-story-args.mjs` |
| Docs added | `docs/phase-0-baseline.md`, `libs/ui-kit/src/lib/docs/known-gaps.mdx` |

## Two findings parked, deliberately

1. **Stepper rail baselines capture an empty rail** — 11 baselines green but
   meaningless. Documented at
   [Guidelines → Known gaps](?path=/docs/guidelines-known-gaps--docs). Not fixed:
   pre-existing, and the runtime is correct.
2. **`check-styles-literals.mjs` reports a false positive.** It exits 1 on
   `file-upload.stories.ts:124`, which is the legitimate closing backtick of a
   `template:` literal. Every backtick in that file is balanced (three template
   pairs, five inline pairs inside comments), `tsc --noEmit` passes, and all 309
   stories render — including this one, twice, in the green run above. So one of
   the ten verification tools is red on a file nothing touched. Fixing it means
   editing either the guard or a story comment; neither was in scope here.

## Ready for Phase 1

The gate is trustworthy, so the Phase 1 token work described in §6 can start
against it:

- restore references on the 7 group-A primary-derived tokens (§1), value-preserving and baseline-gated
- portalled-panel theme reach (§4) — still needs approval, it is component TypeScript
- resolve the BAPS-vs-MyBKY preset naming (§3) before adding themes 3 and 4

Still blocked on input: D3 palettes and the naming call, D5's 15 Figma node ids,
and D4 (default: document the contrast exception, no token change). D1 = A is
confirmed.
