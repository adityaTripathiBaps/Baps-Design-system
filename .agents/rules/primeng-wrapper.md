# PrimeNG Wrapper Rules

PrimeNG 21 with two presets built on `@primeuix/themes`: `Baps` (MyBKY) and
`Sampark`. This library exists to wrap PrimeNG so consuming apps never touch it
directly.

## 1. Wrap, do not rebuild

If PrimeNG has the component, wrap it. Do not hand-roll a control that PrimeNG
ships — you would be re-implementing keyboard navigation, ARIA and overlay
positioning, and getting them wrong.

Consuming apps import `baps-*` and **never** `primeng/*`. That indirection is
the whole point: it lets the library re-skin, re-token or migrate PrimeNG
versions without touching any app.

## 2. When NOT to wrap

A wrapper that adds nothing is worse than no wrapper — it is a file to maintain
and an API to keep compatible. Skip it when:

- The component needs **no BAPS-specific inputs, defaults or geometry** — the
  preset alone gets it right.
- The wrapper would only re-export. Ship a **style partial** instead and let the
  app use `p-*` directly under the page scope. `p-tabs` works this way: the
  `bapsTabs` directive plus `_tabs-sampark.scss`, no wrapper component.
- The wrapper would trip the element-injector trap for no gain. A **directive**
  on PrimeNG's own element sidesteps it entirely — `bapsInputText`,
  `bapsAccordion`, `bapsTabs`.

Prefer, in this order: **preset token → style partial → directive → wrapper
component**. Reach for the last one only when the component needs real behaviour
or a different content shape.

## 3. Token hierarchy — always in this order

```
@org/tokens (source of truth)
  ↓  consumed by
definePreset in libs/ui-kit/src/lib/theme/*.theme.ts
  ↓  falls back to
dt="…" per-instance token override
  ↓  falls back to
SCSS partial rooted at the host (ViewEncapsulation.None)
  ↓  last resort, needs a comment saying why
pt="…" Pass Through on PrimeNG's DOM
```

Never skip a level. A colour that could have come from a preset token and was
written into SCSS instead is invisible to the token audit and will not follow a
palette change.

## 4. definePreset, not CSS overrides

Anything the preset can express belongs in the preset — `libs/ui-kit/src/lib/theme/baps.theme.ts` and `sampark.theme.ts`.

```ts
export const Baps = definePreset(Aura, {
  semantic: { primary: { … } },
  components: { button: { root: { … } } },
});
```

Reach for SCSS only for what tokens cannot say. Two real examples, both
documented in place:

- PrimeNG hardcodes `.p-button { font-size: 1rem }` in its base stylesheet.
  `.p-button-sm` / `.p-button-lg` consume preset tokens, but the **unsized
  default does not** — so the 14px default from Figma cannot come from
  `baps.theme.ts` and is injected as one CSS rule in `preview.ts`.
- No token paints a datepicker's day **cell**; `date.rangeSelectedBackground`
  only reaches the inner `<span>`, so a token-only range renders as separated
  squares rather than a continuous band.

## 5. cssLayer is mandatory in every consuming app

```ts
providePrimeNG({
  theme: {
    preset,
    options: {
      darkModeSelector: '.baps-dark',
      cssLayer: {
        name: 'primeng',
        order: 'theme, base, components, primeng, utilities, app-styles',
      },
    },
  },
});
```

**Without `cssLayer`, PrimeNG's CSS is unlayered and beats every design-system
rule regardless of specificity.** Layered CSS always loses to unlayered CSS —
that is the cascade, not a specificity contest.

Measured symptom: an open accordion panel's header rendered white because
PrimeNG's `.p-accordionpanel-active > .p-accordionheader` (0,4,0) beat the DS
rule (0,1,1) in a repo where the app had no `cssLayer`. Storybook always had
it, which is why it looked right there and wrong in the app.

## 6. `dt` for per-instance tokens

Use `dt` when one instance needs different tokens from the rest — for example a
Sampark control on an otherwise-MyBKY page.

```ts
get dt(): object {
  return DATEPICKER_TOKENS[this.brand];
}
```

Keep the `dt` map **small**. If the SCSS skin already sets the same property
with `!important`, the token is dead on arrival — put a note in the map saying
which properties are deliberately absent and why.

## 7. `pt` is the last resort

Pass Through reaches into PrimeNG's internal DOM. It breaks on PrimeNG upgrades.
Every `pt` usage needs a comment naming what it does and why nothing above it
worked.

## 8. Know PrimeNG's DOM before styling it

Three failures from this repository, all from assuming the markup:

- **PrimeNG renders its `ng-content` slot BEFORE `.p-chip-label`.** A count and
  chevron projected into `p-chip` therefore land to the *left* of the text.
  Fixed with flex `order` on all four children — explicitly on all of them,
  because an item with no `order` defaults to `0` and jumps ahead of anything
  positive.
- **`.p-chip-remove-icon` IS the svg**, not a wrapper. Sizing "the plate" as the
  svg stretched the glyph to 28×16; the plate had to move to `::after`.
- **A drawer panel is `role="complementary"`, not `role="dialog"`,** and carries
  no `aria-modal`. Day cells in a datepicker are `role="presentation"`, not
  `gridcell`. Paginator buttons are named `"Page 2"`, not `"2"`.

Inspect the rendered DOM first. `testing.md` lists the tools.

## 9. Dark mode

`darkModeSelector: '.baps-dark'` on `<body>`. Never write a `prefers-color-scheme`
media query in a component — the class is the switch, so a consumer can force
either mode.

## 10. Accessibility comes from PrimeNG; check what it does not give you

PrimeNG supplies roles, `aria-expanded`/`aria-selected`, focus traps and
keyboard navigation. It does **not** always supply an accessible name.

Every wrapper over a control that takes one must expose `ariaLabel` /
`ariaLabelledBy` and forward it. Missing names were the most common real axe
violation in this library — see `accessibility.md`.

## 11. Version notes

- v21 renamed `InputSwitch` → `ToggleSwitch` (`p-inputSwitch` → `p-toggleswitch`).
  spm-ui on v17 still uses the old name; the mapping tables in
  `libs/migration-data` record these.
- v21's `Popover` has **no close-button input** — click-outside and Escape are
  the only dismissals, so an explicit close affordance has to be part of the
  content.
