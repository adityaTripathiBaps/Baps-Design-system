# Phase 2, step 0 — plan: make the PrimeNG preset reference the DS variables

**Read-only. Nothing changed.** Approval requested before any edit.

This is the finding parked at the end of Phase 1: `tokens.ts` resolves
references, `tokens.css` keeps them, and the PrimeNG preset is built from
`tokens.ts`. It has to be settled before a live theme switcher, so it is step 0
rather than a later item.

## The problem, measured rather than asserted

Read off the running preview (`components-button--playground`):

```
--p-primary-50:  var(--p-bkyms-blue-50);      ← PrimeNG links its own tiers by reference
--p-primary-500  computes to  #7f93c8          ← via var(--p-bkyms-blue-500)
--color-mybky-blue-500        = #7f93c8        ← the DS copy of the same colour
```

So PrimeNG is not the problem — it already emits `var()` between its semantic
and primitive tiers. The problem is one level lower: `--p-bkyms-blue-500` holds a
**literal**, copied out of `tokens.ts` at build time, and `--color-mybky-blue-500`
holds the same literal independently.

Two parallel copies of one colour. Writing a new value into the DS variable at
runtime updates every design-system rule and reaches none of PrimeNG.

**What is not broken.** Switching brand, accent or surface from the toolbar
already works, because `preview.ts` rebuilds the preset and calls `usePreset()`.
This plan is not needed for that. It is needed the moment the builder edits a
**token** and expects PrimeNG to follow — which is exactly what a colour picker
on `--color-mybky-blue-600` would be.

## The fix, in one substitution

PrimeNG already chains semantic → primitive by reference. Point the **primitive
tier** at the DS variables and the whole chain becomes live:

```
today   --p-primary-500 → var(--p-bkyms-blue-500) → #7f93c8
after   --p-primary-500 → var(--p-bkyms-blue-500) → var(--color-mybky-blue-500) → #7f93c8
```

In `baps.theme.ts` that means the `primitive:` block changes from

```ts
primitive: { bkymsBlue: { 500: tokens.ColorMybkyBlue500, … } }
```

to the same names taken from a variable map

```ts
primitive: { bkymsBlue: { 500: vars.ColorMybkyBlue500, … } }   // 'var(--color-mybky-blue-500)'
```

Only the primitive tier. The semantic and component tiers keep referring to
PrimeNG's own primitives, so they need no edit and their behaviour is unchanged.

## Where the variable map comes from

A new generated file, emitted by the existing Style Dictionary build:

```
libs/tokens/src/generated/tokens.vars.ts     (generated, ~698 lines)
```

exporting the **same names** as `tokens.ts`, valued as CSS references:

```ts
export const ColorMybkyBlue500 = 'var(--color-mybky-blue-500)';
```

It needs a small custom format in `style-dictionary.config.js`, alongside the
`json/flat-with-attributes` format already registered there — so the pattern is
established, not invented.

**Generated, not hand-written, and not computed at runtime.** Style Dictionary
already knows both names for every token, so it can emit the pairing with no
conversion rule of my own. That matters: my first attempt at a camel→kebab
converter got the digit boundary wrong (`ColorMybkyBlue50` → `color-mybky-blue50`
instead of `…-blue-50`) and reported 157 false mismatches. Using the tool's own
`path` gives **698 of 698 matched, 0 missed** — verified.

## Why `tokens.ts` itself must stay resolved

Tempting to just add `outputReferences` to the js platform. That would break two
things:

- **The colour gallery** prints each token's value as its caption. It would show
  `var(--color-…)` instead of a colour, and the swatch itself is painted from
  that value.
- **The manager's swatch pickers** (`PRIMARY_COLORS`, `SURFACE_COLORS` in
  `accent.theme.ts`) use token values as real colours in the Storybook manager,
  which is a **separate document** from the preview — the DS custom properties
  are not defined there, so a `var()` would resolve to nothing.

So the two files serve two purposes and both are legitimate: `tokens.ts` for
"what colour is this", the new map for "how do I refer to this". Additive, and
nothing that reads `tokens.ts` today changes.

## Safety facts, all measured

| Check | Result |
|---|---|
| Colour arithmetic on `tokens.*` anywhere? | **None.** `baps.theme.ts` only assigns; its `rgba(…)` values are hardcoded white overlays, not derived. `palette()` in `accent.theme.ts` runs on the PrimeNG configurator's own hex literals, never on tokens. |
| Does PrimeNG accept `var()` as a token value? | **Yes** — it already emits `--p-primary-50: var(--p-bkyms-blue-50)` itself. |
| Name parity `tokens.ts` ↔ `tokens.css` | **698 / 698, 0 missing.** |
| Is `tokens.css` loaded wherever the preset runs? | Yes — `preview.ts:71` imports it; `installation.mdx` tells apps to. **This becomes a hard dependency** — see risks. |

## Scope

| | |
|---|---|
| Token **values** | unchanged — this is naming and indirection only |
| Token source files | untouched |
| Components, SCSS | untouched |
| `tokens.ts` | untouched |
| Public API | one **new** generated export path in `@org/tokens`; nothing removed or renamed |
| Files edited | `style-dictionary.config.js` (add a format + file), `baps.theme.ts` primitive tier, `sampark.theme.ts` primitive tier |
| Files added | `libs/tokens/src/generated/tokens.vars.ts` (generated) |

`baps.theme.ts` has 200 `tokens.` references and `sampark.theme.ts` has 250, but
only those inside `primitive:` blocks change — `baps.theme.ts:29`,
`sampark.theme.ts:447`. The rest stay.

## Risks, and how each is checked

1. **A DS variable missing at runtime → the colour silently disappears.** Today a
   literal always renders; a `var()` with no definition renders nothing. Parity
   is 698/698 today, but this makes `tokens.css` a *hard* requirement for anyone
   using the preset. Checked by the baseline run, and worth a line in
   `installation.mdx` — an app that registers the preset without importing
   `tokens.css` currently gets a slightly-off theme and would then get an unstyled
   one. **This is the risk I would want your eyes on.**
2. **Dark mode.** The preset's `colorScheme.dark` blocks reference primitives the
   same way, so they inherit the fix. Both brands × both modes are in the
   baselines.
3. **`withAccent` / `withSurface`.** They replace `semantic.primary` with a
   `palette()` ramp of hex, independent of the primitive tier — unaffected. Worth
   confirming in the browser after the change, since it is the mechanism the
   builder is built on.
4. **`@org/tokens` barrel.** `baps.theme.ts` deep-imports
   `@org/tokens/generated/tokens` because the barrel silently emits an empty
   module under ngtools/webpack (its own comment records this). The new file will
   be deep-imported the same way, deliberately.

## Verification

1. `npx nx build tokens` — then read `tokens.vars.ts` and confirm 698 exports.
2. `npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json`
3. `npx nx test ui-kit` — expect the two known pre-existing `BapsDrawer`
   failures and nothing else (448/450).
4. `node tools/check-inventory.mjs` — 45 / 290 / ids intact.
5. `npx nx visual-test storybook-host` — **expect 0 of 536 moved.** Values
   resolve identically; only the indirection changes. Any diff means an
   assumption above is wrong, and I stop and show you.
6. Prove it actually works, which no baseline covers: in the browser, write a new
   value into `--color-mybky-blue-500` at runtime and confirm
   `--p-primary-500` follows. Today it does not; after this it should.
7. Confirm the toolbar accent/surface switching still works (risk 3).

## Suggested order

1. The generated map + `nx build tokens`, nothing consuming it yet — inert, and
   proves the format before anything depends on it.
2. `baps.theme.ts` primitive tier → baseline run → step 6 proof.
3. `sampark.theme.ts` primitive tier → baseline run.

Stopping after each, as with Phase 1.

---

# OUTCOME — step 2 failed, reverted. Step 0 is not achievable this way.

## Result

| Step | Outcome |
|---|---|
| 1 — generated `tokens.vars.ts` | **Done, kept.** 698 exports, 0 css-missing, 0 name-mismatch. Inert — nothing consumes it. |
| 2 — `baps.theme.ts` primitive tier | **Reverted.** Broke primary: 8 of 536 baselines on desktop, 6 on mobile. |
| 3 — `sampark.theme.ts` | **Not started.** Same approach, same failure. |

Baseline after revert: **536, 2 passed, 0 diffs.**

## What broke

`badge--severities` is the clearest: the primary badge lost its fill entirely
and its label fell back to black instead of the contrast colour. The other six
severities were untouched — they come from Material's own palettes, and only
`primary` maps to the converted `bkyms*` primitives. `slider` ×3 and
`tabs--page-wide-scope-only` moved for the same reason. Dimensions were
identical throughout, so it was colour, not layout.

## Why

Material's base preset does colour arithmetic on primary:

```
color-mix(in srgb, {primary.color}, transparent 88%)
color-mix(in srgb, {primary.400}, transparent 84%)
```

## The plan's mistake, stated plainly

The plan listed this as a checked safety fact:

> Does PrimeNG accept `var()` as a token value? **Yes** — it already emits
> `--p-primary-50: var(--p-bkyms-blue-50)` itself.

The observation is true; the inference is not. PrimeNG passing a reference
*between its own tiers* does not mean it can consume one *wherever a token is
used*. Two different claims, and the first was treated as evidence for the
second.

It was also absent from the risk list. The three risks recorded — a missing
variable, dark mode, `withAccent`/`withSurface` — were all real and all fine.
The one that fired was not among them, and the "no colour arithmetic on
`tokens.*`" check that felt reassuring was scoped to **our** code; it never
asked what **Material** does with the values afterwards.

## Step 1 is kept

`tokens.vars.ts` and the `@org/tokens/generated/tokens.vars` export subpath stay.
Correct, verified, inert, and needed by either route below.

Worth recording from building it: `@org/tokens` is a pnpm workspace package
whose `exports` map points at source, and `exports` is a **closed allow-list** —
a new generated file is invisible until its subpath is added. Same failure mode
this workspace already hit with Sass's `pkg:` importer.

## Where step 0 goes now

Two routes, neither started, both needing a decision:

1. **Keep the current mechanism.** `preview.ts` already calls `usePreset()` on
   every toolbar change, and a colour picker can rebuild the preset from a new
   value rather than writing a CSS variable. This already works. It means the
   builder drives two systems rather than one, which is what the plan set out to
   avoid — but it is shipped, proven, and free.
2. **Convert selectively** — only tokens Material never does arithmetic on.
   Requires auditing every derived value in the Material preset first, and
   leaves a system where some tokens cascade and some do not, which is harder to
   explain to a consumer than either extreme.

Route 1 is the honest recommendation. The original framing — that the two token
planes are a defect to be unified — turned out to be a preference, not a bug:
`usePreset()` already keeps them in step, and the thing it cannot do (live-edit
a raw CSS variable and have PrimeNG follow) is a capability nothing has asked
for outside this plan.
