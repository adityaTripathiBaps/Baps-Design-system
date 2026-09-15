# Phase 2 — theme manager plan (Route 1)

**Read-only. Nothing changed.** Approval requested before any edit.

Route 1 as decided: the colour picker rebuilds the preset through
`usePreset()`. No raw CSS-variable editing on PrimeNG's side, no selective
var-ification. Step 0's attempt and why it was rejected are in
`docs/phase-2-step-0-plan.md`.

## What already exists

Worth stating first, because it is most of the feature and the plan should not
rebuild it.

| Piece | State |
|---|---|
| Brand switch (MyBKY / Sampark) | Shipped — `designSystem` global, `DS_PRESETS`, `.baps-ds-sampark` toggle |
| Primary picker | Shipped as **20 fixed swatches** — `PRIMARY_COLORS`, `withAccent` |
| Surface picker | Shipped as **6 neutrals** — `SURFACE_COLORS`, `withSurface` |
| Light / dark | Shipped — `storybook-dark-mode` onto `.baps-dark` |
| Live re-theme of PrimeNG | Shipped — `preview.ts:174` calls `usePreset()` on every change |
| Settings UI | Shipped as a **manager popover**, not a page |
| Ramp generation from one colour | Shipped — `palette(hex)` from `@primeuix/themes` |

## The actual gap

**A picker change re-themes PrimeNG and leaves the design system's own rules
behind.**

`withDesignSystem` toggles the brand class and calls `usePreset()`. It never
writes `--color-*`. So on an accent change, everything painted from PrimeNG's
`--p-*` moves and everything painted from the design system's own tokens does
not — and the design system paints a great deal directly: 23 tokens reference a
MyBKY blue step, 21 reference a Sampark primary step.

Read from the code, and partially observed: requesting `?globals=accent:rose`
still leaves `--color-mybky-blue-600` and `--color-mybky-primary-default` at
`#5f78b8`. The preview did not mount on the dev server at the time, so PrimeNG's
side could not be compared in the same breath. **Confirming this properly is
step 1 of implementation, before any code is written** — if it turns out the two
sides already agree, most of this plan is unnecessary.

## The mechanism: one ramp, two sinks

A picker yields one base colour. From it:

```
        palette(baseHex)         ← already used, already imported
               │
       ┌───────┴────────┐
       ▼                ▼
  withAccent(preset)   write --color-<brand>-<ramp>-<step> onto the preview root
       │                │
   usePreset()      DS rules re-resolve by cascade (Phase 1 made this work)
```

Both sinks are driven from one `applyTheme(config)` call, so they cannot drift.
This is the whole coordination — no new mechanism, one added write alongside the
existing `usePreset()`.

The design system's **derived** tokens follow for free. Phase 1 made
`--color-mybky-blue-alpha10` a relative colour reading off `blue-600`, so it
re-tints with the ramp instead of needing its own write. That is the payoff from
that work landing here.

## The wrinkle: the two brands use different step scales

Measured:

```
mybky   blue      50 100 200 300 400 500 600 700 800 900 950   (+alpha10 alpha20)
sampark primary   0 10 20 40 60 80 100                          (+alpha10 alpha20 default hover tint)
```

`palette()` returns the 50–950 shape. Writing a generated ramp onto MyBKY is
direct; onto Sampark it needs a step map (0←50, 10←100, 20←200, 40←400, 60←600,
80←800, 100←950 is the obvious reading, and it should be checked against the
Figma ramp rather than assumed). Sampark also carries `default`/`hover`/`tint`
aliases that are references, so they follow whatever they point at.

**This is the part I would build MyBKY-first and confirm before doing Sampark**,
which matches your instruction to start where the brands are ready.

Per-step reach on MyBKY, so the mapping effort is spent where it matters:

| step | 50 | 200 | 400 | 600 | 700 | 800 | others |
|---|---:|---:|---:|---:|---:|---:|---:|
| DS tokens referencing it | 4 | 2 | 2 | **7** | 1 | **7** | 0 |

## Scope

| | |
|---|---|
| Token source files, token values | untouched |
| Components, SCSS | untouched |
| Public API | unchanged — the manager and preview are app code, not library exports |
| Files edited | `.storybook/preview.ts` (apply the ramp alongside `usePreset`), `.storybook/manager.tsx` (picker + controls) |
| Files added | a theme-config module in the Storybook host; a Builder page (MDX + story) |
| Library changes | **none proposed.** If one turns out to be needed, I stop and ask first. |

## What to build, in order

1. **Confirm the gap** (above). Read both sides under one accent change. If they
   already agree, stop and re-plan.
2. **`applyTheme(config)`** in the Storybook host: `palette(base)` → write the
   MyBKY ramp onto the preview root → `usePreset(withAccent(...))`. Wire the
   existing `accent` global through it, so the swatches that already exist start
   moving both sides. No new UI yet — this is the mechanism proven on shipped
   controls.
3. **Free-form colour input** next to the swatches. The swatches stay; they are
   a useful shortlist.
4. **Sampark step map**, checked against the Figma ramp.
5. **Builder page** — a real Storybook page with the controls, a live preview
   panel, and Reset. Save / Export / Import after, since they are storage rather
   than theming.
6. **BAPS-default and App-Sell scaffolds** — present in the switcher, visibly
   marked "awaiting palette", selecting one leaves the preview on its base and
   says so rather than rendering something wrong. Nothing blocks on their
   colours.

## Baseline impact — expected 0 at every step

Baselines are captured at `initialGlobals` (`designSystem: 'mybky'`,
`accent: 'brand'`, `surface: 'default'`) with no `globals` param, so the builder
never runs during a run: `applyTheme` at the default config must be a no-op that
writes the values already in `tokens.css`.

That is the one thing to be careful about — an `applyTheme` that always writes,
even at defaults, could round or reformat a colour (`#5f78b8` → `rgb(95 120 184)`)
and move every baseline. **Guard: at the default config, write nothing.** Checked
by the run, and any diff stops the step.

## Verification per step

1. `npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json`
2. `npx nx test ui-kit` — the two known `BapsDrawer` failures, nothing new (448/450)
3. `node tools/check-inventory.mjs` — 45 / 290 / ids intact
4. `npx nx visual-test storybook-host` — 536 green, 0 diffs
5. The thing no baseline covers: change the picker in the browser and read
   **both** sides — a PrimeNG-painted element and a DS-token-painted element —
   confirming they move together. This is the actual acceptance test.

## One caution, from this session

The dev Storybook on 4400 has been unreliable — repeatedly serving 404s for its
bundles and rendering `#storybook-root` empty. Every measurement above that
depends on a live page should be taken against a freshly started instance, and a
`rootH: 0` reading treated as "no data", never as "the value is absent". Two
wrong conclusions this session came from trusting a page that had not mounted.

---

# Step 2 outcome — DS sink works; a third sink found

## Done and verified

`applyThemeToDesignSystem(ds, accent)` in `preview.ts`, plus one library export
(`PRIMARY_RAMPS`, pure data). Baseline **2 passed, 0 diffs, 536** — the default
guard holds, so a visual run is untouched.

Runtime proof at `?globals=accent:rose`, measured:

```
--p-primary-color            #cf3650   PrimeNG    (already worked)
--color-mybky-blue-600       #cf3650   DS         ← now follows
--color-mybky-blue-50        #fef5f7   DS         ← all 11 steps written
--color-mybky-primary-default #cf3650  DS semantic tier cascaded
--tag-mybky-primary-border   rgb(from #f6637d r g b / 0.2)   re-tinted itself
```

The last line is Phase 1 paying off: the alpha token is a relative colour
reading off the ramp, so it needed no write of its own. The tag's rendered
border came out `color(srgb 0.964706 0.388235 0.490196 / 0.2)` — `#f6637d` at
20%, rose.

## What is still blue, and why

The primary tag's **background and text** do not move. Not a regression —
measured identical before step 2 — but it means the picture is not "two sinks".

The tag's own rule says so:

```scss
/* Border + hover ring per severity — bg/text come from the preset. */
baps-tag .p-tag-contrast {
  border-color: var(--tag-mybky-primary-border, #9fadd933);
}
```

Only the border reads a design-system token. Background and text come from the
**preset's `components.tag` block**, which is built from `tokens.*` — resolved
literals, baked at build time. `withAccent` replaces `semantic.primary` and does
not touch `components.*`, so those values never move.

Confirmed at the variable level: `--tag-mybky-primary-background` correctly
resolves to `#fef5f7` (rose) while the element still paints `#eef0f8` (blue),
because the element is not reading that token at all.

## So there are three sinks, not two

| # | Sink | Updated by | State |
|---|---|---|---|
| 1 | PrimeNG `semantic.primary` | `withAccent` + `usePreset` | worked before |
| 2 | Design-system `--color-*` | `applyThemeToDesignSystem` | **done in step 2** |
| 3 | PrimeNG `components.*`, baked from `tokens.*` | nothing | **open** |

Sink 3 is the same wall step 0 hit from the other side: making those values
`var()` is what broke primary, because Material does `color-mix` on it.

Routes for sink 3, none started:

- **Rebuild the component blocks at runtime.** `withAccent` (or a sibling) also
  remaps the `components.*` entries that derive from the brand ramp, keeping
  everything hex so no `color-mix` breaks. Correct and complete, but a library
  change and a real piece of work — the preset would need to know which
  component values are primary-derived.
- **Accept the limit.** The picker re-themes PrimeNG's semantics and the whole
  design-system layer; per-component preset overrides keep their designed
  colour. Defensible if those overrides are meant to be brand-fixed rather than
  accent-following — which is a design question, not a technical one.

The second is only acceptable if someone confirms the intent. Worth asking
before building the first.
