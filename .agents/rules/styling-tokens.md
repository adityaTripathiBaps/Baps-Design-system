# Styling & Token Rules

## 1. Never hardcode a design value

No colour, spacing, radius, shadow, font size, font weight or duration is
written as a literal in a component or an app. Every one comes from
`@org/tokens`.

```scss
/* CORRECT */
background: var(--tag-sampark-grey-background, #1514140a);
padding: var(--space-2);

/* WRONG */
background: #1514140a;
padding: 8px;
```

The fallback in `var(…, …)` is allowed and encouraged: it documents the value
and keeps the rule working if a token is missing. It is **not** a licence to
skip adding the token.

## 2. The token tiers

```
libs/tokens/src/source/*.tokens.json     ← authored here, and ONLY here
  ↓  style-dictionary
libs/tokens/build/css/tokens.css         ← generated, never edit
libs/tokens/src/generated/tokens.ts      ← generated, never edit
  ↓  published
dist/libs/tokens/build/css/tokens.css    ← what apps @use
```

- `color.tokens.json` — raw ramps (`color.sampark.primary.60`)
- `semantic.tokens.json` — roles (`color.sampark.text.secondary`)
- `component.tokens.json` — per-component (`tag.sampark.grey.background`)

**Always consume the most specific tier that exists.** A chip reads
`--tag-sampark-grey-background`, not `--color-sampark-mono-100`, so a change to
the tag's fill does not require touching every consumer.

Rebuild after editing a source file:

```bash
npx nx build tokens
```

## 3. Token comments carry the evidence

When a token's value comes from Figma, record the node and any naming mismatch.
Real examples from this file, each of which prevented a wrong "fix":

```json
"alpha2": {
  "value": "rgba(21, 20, 20, 0.02)",
  "comment": "Figma \"Mono/10% Black\" — the NAME says 10% but the value is #15141405, i.e. 2%. Read the value, not the name."
}
```

```json
"text": {
  "value": "{color.mybky.mono.450}",
  "comment": "Mono/40 'Disable Item' #8d9ba5. Was #bd9ba5 … the Figma disabled badge (22465:95659) binds this to Mono/40 = #8d9ba5, and Sampark's disabled badge binds ITS text to its own Mono/40 — so both brands read the same token and #bd9ba5 was a one-character slip (b for 8) that the guides inherited."
}
```

**The Figma variable name and the code ramp step do not always align.** Sampark
"Info/20" `#e6f0fe` is code `info-10`. Verify by pulling the node, not by
matching the number in the name.

## 4. SCSS, never CSS; partials live in the library

```
libs/ui-kit/src/lib/styles/
  components/<component>/_<component>.scss          ← base (MyBKY is the default)
  components/<component>/_<component>-sampark.scss  ← Sampark override
  layout/                                           ← fonts, rem baseline, page shells
```

The library ships SCSS as **source** — it is not compiled into the bundle.
Consuming apps reach it with Sass's `pkg:` importer:

```scss
@use 'pkg:@org/ui-kit/src/lib/styles/components/chip/chip';
```

Two consequences that have both cost real time:

- A component's styles only exist in an app that `@use`s the partial. A chip
  with no skin in one app and a perfect skin in another is a **missing `@use`**,
  not a broken component. Check `src/styles.scss` first.
- The published `exports` map must allow `./src/*` or the `pkg:` path is
  unresolvable even though the file is sitting in `dist/`. See
  `publishing.md`.

## 5. Root every rule at its host

`ViewEncapsulation.None` makes component styles global. See `angular.md` §
ViewEncapsulation — every selector starts at `baps-<component>` or a brand
scope, never at a bare `.p-*` class.

## 6. rem, not px — with the documented exception

Sizes come from Figma in px and are written in `rem` against a 16px root, so a
consumer's font-size preference scales the UI.

The exception is a **1px hairline**: borders and dividers stay in `px`, because
`0.0625rem` rounds to 0 at some zoom levels and the line disappears.

## 7. `!important` needs a reason in a comment

It is sometimes unavoidable — PrimeNG's own rules carry high specificity, and
the pre-existing calendar skin uses `!important` throughout. When you add one,
say what it is beating:

```scss
/* PrimeNG's .p-select-label rule is (0,3,1) with !important, so a plain
   colour here never lands. Bypassed with a custom property instead. */
--location-button-icon-color: var(--color-sampark-primary-80, #b44141);
```

Better still, restructure so it is not needed: a **custom property** read by the
high-specificity rule beats fighting it, because the variable resolves wherever
the rule is.

## 8. Specificity facts worth knowing

- **A per-instance brand class beats a page-wide scope.** `baps-chip.baps-sampark`
  wins over `.baps-ds-sampark baps-chip`. That is correct by design, and wrong
  for a generic story — a story that pins `brand="sampark"` cannot follow the
  toolbar. See `brand-theming.md`.
- **`line-height: 1` plus `overflow: hidden` clips descenders.** Vertical
  clipping is invisible to a `scrollWidth` check, so it will pass a
  "is it clipped" test and still look broken. Figma's line-height for chip text
  is 1.3; the count disc stays at 1 because 1.3 overflowed 92 of 124 chips.
- **Backticks in a `styles:` comment terminate the template literal.** The build
  then reports errors inside the CSS that point nowhere near the comment. Guard:
  `node tools/check-styles-literals.mjs`. See `formatting.md`.
