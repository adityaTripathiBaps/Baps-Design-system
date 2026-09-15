# Phase 1 — items 1 & 2

Run 2026-09-09, on top of the green Phase 0 baseline. Zero component, SCSS or
public-API changes. One deprecated alias added, two token names added.

## Item 1 — the group-A tokens now cascade

### Corrected scope: 5, not 7

The Phase 0 audit listed 7 "primary-derived" tokens. Two of them only *look*
blue and match no primitive on any ramp:

```
--dashboard-mybky-hero-invited-gradient   #4B536C → #1F2945
--dashboard-mybky-hero-pending-gradient   #5C8FE3 → #2D5FB5
```

Grepped all four stops against every ramp: no match. Converting them would
change the rendered colour, which is the one thing this work must not do. **Left
untouched.**

### Approach: relative colour, not `color-mix`, and no literal anywhere

The requirement was pure references — no `rgba()`, no hex, no `color-mix`. A
build-time transform cannot satisfy it: whatever it computes lands in the output
as a literal, which is exactly the thing that fails to cascade. So the derivation
has to live in CSS, and relative colour is the form that carries no colour value
of its own:

```css
--color-mybky-blue-alpha10:      rgb(from var(--color-mybky-blue-600) r g b / 0.1);
--color-mybky-blue-alpha20:      rgb(from var(--color-mybky-blue-400) r g b / 0.2);
--color-sampark-primary-alpha20: rgb(from var(--color-sampark-primary-100) r g b / 0.2);
```

`mybky.blue.alpha10` and `alpha20` are new — MyBKY had no alpha primitives at
all, all 23 belonged to Sampark. `sampark.primary.alpha20` already existed as
`rgba(135, 48, 48, 0.2)` and now derives.

`alpha20` reads off **blue.400, not blue.600**: a primary tag's ring is a lighter
step than its fill. Deriving from the wrong step gives a colour that is correct
today and wrong after any change — the failure this work exists to prevent,
reintroduced one tier up.

### The five, as emitted

```css
--stepper-mybky-active-gradient:    linear-gradient(135deg, var(--color-mybky-blue-600), var(--color-mybky-blue-800));
--button-mybky-primary-disabled:    var(--color-mybky-blue-alpha10);
--button-mybky-primary-ghost-hover: var(--color-mybky-blue-alpha10);
--tag-mybky-primary-border:         var(--color-mybky-blue-alpha20);
--tag-sampark-primary-border:       var(--color-sampark-primary-alpha20);
```

The gradient uses interpolated references, the pattern the file already used at
`component.tokens.json:56`. Component tier: **182 → 187 of 396** emitting a
reference; flat-hex component tokens **46 → 41**.

### Verified value-preserving

A full 268-story run produced **zero diffs on any component story**. That is the
proof, and it is stronger than reading the CSS: had `rgb(from …)` been
unsupported or the arithmetic wrong, `tag--*`, `button--*` and `stepper--*` would
all have moved. They did not.

It also settles the browser-support question — relative colour resolves correctly
in the Playwright chromium.

### One expected diff, in the token gallery

`foundations-colour--my-bky` grew 1248×586 → 1248×**603**. `colour.stories.ts`
builds its ramps by enumerating the generated token object and keeping names
matching `Alpha\w*` with values starting `#` or `rgb` — so the two new tokens
appear as swatches and push the Mono section down one row. A consequence of
adding token names, not a colour change.

### Finding: `tokens.ts` resolves references, `tokens.css` does not

The colour story's new swatch labels read `rgb(from #5f78b8 r g b / 0.1)`, not
`var(…)`. The `js/es6` platform takes no `outputReferences`, so the generated
TypeScript holds resolved values while the CSS holds the `var()` chain.

That is pre-existing and true of every token, but it matters for the theme work
ahead: `baps.theme.ts` builds the PrimeNG preset **from `tokens.ts`**, so the
PrimeNG side is made of resolved literals. A runtime change to a CSS custom
property does not reach it — which is why `preview.ts` has to call `usePreset()`
rather than relying on the cascade. Worth confirming before the theme builder
assumes one mechanism covers both systems.

## Item 2 — the preset is named MyBky

`baps.theme.ts` exported `const Baps`, and its own doc comment has always said
"MyBKY (events-ui) live preset". `DS_PRESETS` mapped `mybky: Baps`, which is the
confusion in one line, and it made the design-system list look like four presets
when there are three.

```ts
export const MyBky = definePreset(Material, { … });

/** @deprecated Use `MyBky`. … */
export const Baps = MyBky;
```

Same object, so `Baps === MyBky` and any identity check still holds. The alias
stays because both consuming apps import it by that name and neither is in this
repository.

Swept with it: `preview.ts`, and ~20 stale references across component doc
comments, `avatar/badge/button/tag/toggle-switch/form-field` MDX,
`single-brand-project.mdx`, and — the ones that actually matter —
`installation.mdx` and `getting-started.mdx`, whose snippets consumers copy
(`import { MyBky }`, `preset: MyBky`). Only two mentions of `Baps` remain, both
deliberate: the deprecation comment and the `preview.ts` note explaining it.

`npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json` → clean.

The file is still named `baps.theme.ts`. Renaming it changes nothing for
consumers — the barrel re-exports — but it would churn several doc comments that
name the file. Available if wanted; not done.

## Docs

- **Foundations → Colour** — the three derived alpha steps, why relative colour,
  and the "pick the base the design actually uses" trap.
- **Guidelines → Known gaps** — two entries: 20 of 23 alpha primitives are still
  literals (`sampark.primary.alpha10` most importantly, since
  `tag.sampark.primary.background` consumes it — switch the Sampark primary and a
  primary tag's border follows while its fill does not), and the empty
  `foundations/color/` leftover directory.

## Also in this run

`usersdropdown--groups` clip fix. Measured first: all three users-dropdown
baselines are 1248×460, `maxHeight` caps `.ud__list`, and `.ud__panel` is
`position: absolute` so it does not grow `#storybook-root` — which is what gets
screenshotted. Both caps had to move, and the wrapper lived in the meta's shared
render, so the template was hoisted to `harness(minHeight)`: meta keeps
`'460px'` with identical markup, `Groups` takes `'700px'` plus
`maxHeight: '560px'`.

The new baseline shows group sizes **1 / 2 / 3** and the ungrouped Support Desk
row with no header — the row carrying the "mixing grouped and ungrouped is fine"
claim, previously below the fold.

## Operational note

The first attempt at this run **timed out** at 900s on
`components-checkbox--sampark`, waiting for `networkidle`. Nothing was wrong with
the change: the token, `preview.ts` and MDX edits had invalidated Storybook's
webpack cache, so the 4401 instance was still compiling lazily per story. A
straight re-run with 9.5GB free finished normally. Worth knowing that the first
run after a token or preview change is the slow one.

## State

```
total baselines                536
diffs after this run             1   foundations-colour--my-bky (awaiting bless)
component-story diffs            0
inventory                      45 components, 290 stories, all ids intact
```

## Colour-gallery baseline blessed

`foundations-colour--my-bky` re-blessed by the delete-then-run method, so nothing
else could be touched. The run produced exactly one failure:

```
Error: A snapshot doesn't exist at …\foundations-colour--my-bky-chromium-win32.png, writing actual.
```

No other story emitted an artifact — no `-diff.png` anywhere — so **zero other
baselines moved**. 536 total.
