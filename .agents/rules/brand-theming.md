# Brand & Theming Rules

Two brands, and they are not skins of one design — the token file calls the
shape split "a different philosophy".

| | MyBKY (`events-ui`) | Sampark (`spm-ui`) |
| --- | --- | --- |
| Preset | `Baps` | `Sampark` |
| Chip / tag shape | 99px pill | 4px rounded rect |
| Chip type | 12px / 500 | 13px / 400 |
| Primary | `#5f78b8` blue | `#873030` maroon |
| Default? | **yes — unscoped** | needs a scope |

**MyBKY is the unscoped default.** Base partials carry MyBKY values; Sampark is
always an override. That is why `_chip.scss` holds MyBKY and
`_chip-sampark.scss` re-points the ramp, never the other way round.

## The three mechanisms, and which to use

### 1. Page-wide scope — `.baps-ds-sampark` on `<body>`

The normal case. A single-brand app sets it once and every component follows.

```html
<!-- index.html -->
<body class="baps-ds-sampark">
```

Selectors then read:

```scss
:is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip) { … }
```

### 2. Per-instance `brand` input

For one Sampark control on an otherwise-MyBKY page. Stamps a host class:

```ts
host: { '[class.baps-sampark]': "brand === 'sampark'" }
```

**A per-instance class beats the page-wide scope** — correct by design, and a
trap for stories. A story that pins `brand="sampark"` can no longer follow the
Storybook toolbar's Design-system toggle, so a generic story should pass **no
brand at all**. Only a deliberate side-by-side comparison pins both.

### 3. PrimeNG `dt` tokens

Some components take their colours from PrimeNG tokens rather than the SCSS
skin. Those need the `brand` input even when the page scope is already right,
because `dt` is chosen in TypeScript:

```ts
get dt(): object { return DATEPICKER_TOKENS[this.brand]; }
```

Measured: a `baps-datepicker` under a Sampark page scope drew the SCSS skin
correctly and still used MyBKY `dt` tokens, because `brand` defaulted to
`'mybky'`. The fix was `brand="sampark"` on the instance, not a CSS change.

**So: check whether a component reads `dt` before assuming the page scope is
enough.** `baps-chip` does not (page scope suffices, and its 4px radius proves
it). `baps-datepicker` does.

## Portalled panels

Anything appended to `<body>` escapes both the host class and the page scope.
Components that portal must stamp the scope onto the panel itself — see
`angular.md` § Portalled panels, and `resolvedPanelStyleClass` in
`baps-select` / `baps-datepicker`.

## Dark mode

`.baps-dark` on `<body>` is PrimeNG's `darkModeSelector` and the switch for the
docs shell. It is a **class**, never a media query, so a consumer can force
either mode.

Dark rules live beside their light siblings in the same partial:

```scss
.baps-dark baps-chip {
  --baps-chip-bg: var(--color-mybky-dark-surface-hover, #2b2f32);
}
```

Brand × mode is a 2×2 matrix and all four combinations must work. In Storybook
the brand comes from a global and the mode from `storybook-dark-mode`, which
reads its themes from a **parameter** — and parameters are static per story, so
they cannot see a global. That is why `manager.tsx` has to own the brand half;
the note there explains the ordering, which is subtler than it looks.

## Adding a brand-specific value

1. Add the token to `component.tokens.json` under both brands, with the Figma
   node in the comment.
2. `npx nx build tokens`.
3. Base partial reads the MyBKY token; `-sampark` partial re-points it.
4. Verify **both** brands in Storybook by flipping the toolbar, and verify the
   computed value rather than the screenshot.

## Conflicts between sources

When Figma and a written style guide disagree, **do not silently pick one**.
Record the conflict where the value lives and say which you followed. Real
examples, all still documented in place:

- Sampark primary badge fill: `#F8ECEC` in one guide vs `rgba(135,48,48,.1)` in
  the token table — took the token table.
- Badge S-size font: Figma 14px vs guide 12px — took Figma.
- `#bd9ba5` disabled ink in both guides vs `#8d9ba5` in Figma — took Figma,
  because both brands' disabled nodes bind the same `Mono/40 (Disable Item)`
  token and `b`/`8` is a one-character slip the guides inherited.
