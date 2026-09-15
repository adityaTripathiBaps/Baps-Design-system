# Phase 2 — Theme Builder page: plan

**Read-only. Nothing changed.** Approval requested before any edit.

Scope for this step: **live preview + Reset + free-form colour input.**
Save / Export / Import are deliberately a later step — they are storage, not
theming, and the storage answer below changes what they even need to do.

## A correction to the earlier plan

`docs/phase-2-theme-manager-plan.md` said the Builder page would be "a theme-
config module in the Storybook host; a Builder page (MDX + story)". The host part
is wrong. `main.ts:7` globs stories from:

```
'../../../libs/ui-kit/src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'
'../../../libs/migration-data/src/**/*.mdx'
```

Nothing under `apps/storybook-host` is scanned. **A Builder page has to live
inside the library** — `libs/ui-kit/src/lib/docs/` alongside the other Guidelines
pages. That makes it a new file in the library, so it needs your sign-off even
though it is content rather than API.

## Where the config is stored — Storybook globals, and nothing else

No `localStorage`. The config already has a home: the **globals** the existing
controls drive (`designSystem`, `accent`, `surface`, `ripple`, `direction`).

Why that is the right store and not a fallback:

- **It already is the config.** `applyThemeToDesignSystem` and `withAccent` both
  read globals. A builder that wrote somewhere else would be a second source of
  truth for the same thing.
- **The URL is the persistence.** Storybook serialises globals into
  `?globals=designSystem:sampark;accent:rose`. Reload keeps the theme, and a link
  carries it to someone else.
- **Export/Import become almost nothing.** "Export" is the URL, or the globals
  object as JSON. "Import" is navigating to that URL, or writing the globals back.
  Building a storage layer first would be building something the later step then
  has to work around.
- **It survives the manager/preview split.** Globals cross that boundary already;
  `localStorage` in the preview iframe would not be visible to the manager
  popover, and the two UIs would disagree.

`localStorage` stays unused. It is per-browser, invisible to a shared link, and
there is nothing here it does better.

### One change to what a global can hold

`accent` is currently a key into `PRIMARY_RAMPS` (`'brand'`, `'rose'`, …). For a
free-form colour it also has to accept a hex.

Proposal: keep **one** global and branch on its shape.

```ts
const rampFor = (accent: string) =>
  accent.startsWith('#') ? palette(accent) : PRIMARY_RAMPS[accent];
```

One value to export, one value in the URL, and the swatches keep working
unchanged. The alternative — a second `accentHex` global that overrides the
first — means two values that can disagree, and an export that has to explain
which one wins.

`'brand'` keeps its meaning exactly: **the guard stays**, so the default still
writes nothing and every baseline is untouched.

## The page

`libs/ui-kit/src/lib/docs/theme-builder.stories.ts`, titled
**Guidelines/Theme builder**, next to Accessibility and Known gaps.

A story rather than an MDX page, because it has to write globals, not just read
them. Layout, top to bottom:

1. **Controls** — brand (the four already in the switcher), a native
   `<input type="color">` paired with a hex text field, the surface swatches, and
   **Reset**. Reset returns every global to `initialGlobals`, which is the one
   action that is hard to do from the toolbar today.
2. **Live preview** — a panel of the things a theme actually shows: filled and
   outlined buttons, a form field, a tag, a checkbox, a surface card, and a
   disabled state. Deliberately a fixed set, not a story list, so the page cannot
   drift as components are added.
3. **What is and is not themed** — a short note repeating the B-limit, because
   this is precisely the page where someone picks a colour and wonders why the
   button gradient did not move. Links to Known gaps rather than restating the
   17-token list.

### How it writes globals

The preview iframe cannot set globals directly, but the channel is already used
in this codebase — `preview.ts:117` calls `addons.getChannel().on(...)`. The
same channel emits:

```ts
addons.getChannel().emit(UPDATE_GLOBALS, { globals: { accent: '#c96868' } });
```

Manager and preview stay in sync because both read the same globals; the existing
popover will show the new value too.

## Baseline impact

**Two new baselines** (desktop + mobile) for the new story — nothing existing
moves, because the default config still writes nothing.

But I would rather it had **none**, and that needs a decision:

- A native `<input type="color">` renders as a platform widget. Its appearance is
  not guaranteed stable across a Playwright upgrade or a machine change, and a
  swatch button is the kind of thing that shifts by a pixel for reasons that have
  nothing to do with the design system.
- The page's whole purpose is interactive. A screenshot of it at default globals
  pins the least interesting state it has.

So the page is a baseline that can fail for reasons no one cares about — the
`icon--library` lesson, before it happens rather than after.

**Proposal: exclude it**, the way interaction stories already are. That is a
small filter change in `stories.spec.ts`, which currently drops docs entries and
`Interaction —` stories. One more clause, named, with the reason.

If you would rather keep the baseline, say so — the page is deterministic at
default globals and it will pass; the risk is future flake, not correctness.

## Scope

| | |
|---|---|
| Tokens, token values | untouched |
| Components, SCSS | untouched |
| Library **API** | unchanged — no new export |
| Library **files** | **one new story file** under `libs/ui-kit/src/lib/docs/` — needs your OK |
| Host files | `preview.ts` (accept a hex accent), possibly `stories.spec.ts` (exclude the page) |
| `manager.tsx` | unchanged this step; the popover keeps working |

## Verification

1. `npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json`
2. `npx nx test ui-kit` — 448/450, the two known `BapsDrawer` failures
3. `node tools/check-inventory.mjs` — the guard scans `components/*/`, so a docs
   story does not affect its 45/290 count; confirm it still reports intact
4. `npx nx visual-test storybook-host` — 536 unchanged if the page is excluded,
   538 if it is baselined
5. In the browser, on a **fresh** instance: type a hex, confirm both sinks move
   together (`--p-primary-color` == `--color-<brand>-…`), then press Reset and
   confirm the globals and both sinks return to default

## What this step does not do

Save, Export, Import, per-theme isolation, and the BAPS/App-Sell palettes. The
first three get much smaller once the config is just globals; the last is waiting
on colours.
