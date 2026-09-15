# Design Language

The visual spec. `styling-tokens.md` says *how* to consume a value;
this file says *what the value should be*.

Where the spec and the shipped tokens differ, the difference is called out —
**reach for what ships**, and do not invent the target names in component CSS.

## Fonts

| Role | Font | State |
| --- | --- | --- |
| UI (primary) | **Inter Variable** | ships — bundled TTF, `@font-face` in `_fonts.scss` |
| PrimeNG fallback | Roboto | ships — `@fontsource/roboto`, Storybook preview |
| Display / editorial | Instrument Serif | **target, not installed** |
| Mono | JetBrains Mono | **target, not installed** |

**17 OpenType features** are enabled globally via `--font-feature-settings` in
`_common.scss`. Always preserve them.

Rem baseline: tokens are authored at `1rem = 16px`; PrimeNG components are
scaled to 14px via `@layer app-styles { html { font-size: 14px; } }`.

**No Tailwind. No CSS-in-JS.** Styles flow through SCSS partials and PrimeNG's
preset system.

## Typography

- **Inter** for all UI. Weights: 400 body, 500 labels/badges, 600
  headings/buttons, 700 prominent titles.
- **Instrument Serif** (target) for editorial moments — H1 on landing screens,
  pull-quotes in Satsang, section titles in formal emails. Weights 400, 500.
- **JetBrains Mono** (target) for receipt numbers, PAN, reference IDs.
- Tracking: display `-0.02em`, body `0`, small caps `0.08em`.
- Line height: **1.5** body · **1.3** UI · **1.65** long-form Satsang reading.
- `.eyebrow` is the **only** place for ALL CAPS — table column headers and
  categorical tags.

## Colour

### What ships

- Primary palette per brand: MyBKY `--color-mybky-blue-*` (`#5f78b8` at 600),
  Sampark `--color-sampark-primary-*` (`#873030` at 100).
- Mono scale per brand — cool neutrals in MyBKY, warm in Sampark.
- Semantic: error, warning, success, info — **muted, never saturated**.

### Target state (design spec, not yet in tokens)

Four **product-scoped accents**, never two in one component:

| Accent | Hex | Product |
| --- | --- | --- |
| Slate teal | `#1F4A5C` | Admin, utility, default primary |
| Clay | `#9A4D37` | Donations |
| Indigo | `#3A4470` | Satsang |
| Sage | `#486852` | Events, seva |

Background pure white `#FFFFFF`; sunken regions `--ink-50`. Text cool near-black
`#0E1114` — not pure black, not warm.

### Rules

- Semantic colours stay muted: success = forest green, warning = ochre,
  danger = brick. Never saturated.
- **No gradients in chrome.** Chrome is always flat white. (MyBKY's *buttons*
  do use a gradient — that is a component decision recorded in the preset, not
  chrome.)
- Imagery: desaturated, natural light. Never high-saturation stock photography.

## Spacing & layout

- **4px base grid.** Most gaps 8, 12, 16, 24px.
- `--space-8` (32px) between unrelated blocks; `--space-4` (16px) within one.
- Max reading width **680px**. Admin tables full-width with 24px outer gutters.
- Sidebars: 264px web admin · 320px tablet · drawer on mobile.
- Mobile: top status ~44px, bottom tab bar 76px including safe area.
- Web admin: sidebar fixed-left 264px, top bar fixed 56px.

## Borders & shadows

- **Hairlines do 80% of the work.** Structural separation uses a hairline, never
  a shadow.
- Shadows are long and soft, and **only** on floating elements — dropdowns,
  modals, toasts, FAB. Never on a card at rest.
- A card at rest: white background, hairline border, large radius, `--space-5`
  to `--space-6` padding, **no shadow**.
- **Use `baps-card`** rather than a hand-rolled `<div class="panel">`. It
  encodes the rule above plus `[divided]`, `[raised]`, `[interactive]` and three
  padding steps, off `--card-{brand}-*` tokens. `p-card` is deliberately **not**
  wrapped — it hard-codes a resting shadow with no way off it.
- A 1px hairline stays in `px`. `0.0625rem` rounds to 0 at some zoom levels and
  the line vanishes.

> **Token gap:** `--border-1`, `--radius-lg`, `--radius-md` are **target** names
> and do not exist in `tokens.css`. What ships is brand-scoped:
> `--color-{brand}-border-default`, `--radius-{brand}-md`,
> `--card-{brand}-radius`. Use those; do not invent the generic names.

## Corner radii

| Radius | Applies to |
| --- | --- |
| 10px (`--radius-md` target) | inputs, chips, cards, buttons |
| 14px (`--radius-lg` target) | large cards, modals |
| 20px (`--radius-xl` target) | photos, event hero |
| Pill | filter chips only |

Brand reality: MyBKY chips are a **99px pill**, Sampark chips a **4px rounded
rect**. That split is deliberate — see `brand-theming.md`.

## Interaction states

- **Hover** (desktop only): background darkens one step. Accent buttons
  `--accent-600 → --accent-700`. **Never scale, never shadow-jump.**
- **Press/active**: darkens two steps plus `translateY(1px)`, 120ms ease-out.
- **Focus**: 2px ring at 30% opacity, offset 2px. **Always visible on keyboard
  focus** — see `accessibility.md`.
- **Disabled**: 40% opacity, no pointer events, no hover. The *mechanism* varies
  by component — see `storybook.md` before asserting on it.
- **Loading**: skeletons pulse at `--ink-100` over 1.6s; spinners only on
  buttons during an in-flight request.

## Transparency

- **No frosted glass. No glassmorphism.**
- Modal backdrop: ink-900 at 40%, **no blur**.
- Mobile tab bar may use `backdrop-filter: blur(20px)` over a 92% white scrim.
  Desktop chrome does not blur.

## Motion

- Easing `cubic-bezier(0.16, 1, 0.3, 1)` — calm, decelerating. **Never bounce,
  never overshoot.**
- Durations: **120ms** micro/hover · **220ms** UI transitions · **420ms** view
  changes.
- Fade + 4px rise on entry. Fade only on exit.
- **No** auto-playing animation, **no** parallax, **no** "delightful"
  micro-animations. The interface is quiet.

## Iconography

- **Primary set: Lucide** (MIT), stroke-based, rendered at
  `stroke-width="1.75"` — lighter than the default 2px.
- Sizes by context: **16px** dense tables · **20px** nav · **24px** tab bars ·
  **32px** empty states.
- Colour inherits `currentColor`. In nav: `--fg-3` default, `--accent-600`
  active.
- **Never** rotate, flip or re-colour an icon for decoration.
- **No emoji** anywhere in product UI. **No raster icons** — SVG only.
- BAPS-specific glyphs Lucide does not cover (aarti diya, murti, pothi, sabha)
  are gaps, to be drawn custom in 24×24 stroke-1.75 style.
- The icon registry is generated. Hand-add only to
  `libs/ui-kit/src/lib/components/icon/icon-set-extra.ts` — never edit
  `icon-set.ts`.
