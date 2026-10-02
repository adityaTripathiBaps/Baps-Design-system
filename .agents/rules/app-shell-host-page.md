# What the host page owns

The design system ships component CSS. It does **not** ship the handful of
document-level things a page needs before that CSS renders correctly, and it
should not — those belong to the app, and a library that writes them fights
every app it is dropped into.

They are easy to miss precisely because nothing fails when they are absent.
Each of the four below was found by measuring, not by a build error.

---

## 1. `box-sizing: border-box`

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**Every partial in this design system is written against border-box.** No
ui-kit partial declares it; Storybook's own reset supplies it, which is why the
library looks correct in its own docs and subtly wrong anywhere else.

What goes wrong without it: a bordered component renders exactly its border
wider than it should, and every box inside inherits the shift.
`check-standalone.mjs` reported four differences on `internal-navbar` — all of
them one pixel, all traceable to the single element with a `border-right`.
Adding the reset made all four disappear and the component matched the live
render on every property.

One pixel is invisible on screen. It is not invisible in a layout that lines
two columns up.

## 2. The rem baseline and the font

```css
html {
  font-size: 16px;
  font-family: var(--font-family);
  font-feature-settings: var(--font-feature-settings);
}
button,
input,
textarea,
select {
  font-feature-settings: inherit;
}
```

Both `font-feature-settings` lines are load-bearing and neither looks it.
Inter's OpenType set changes glyph advance widths: without them every label
measures about 1px narrower per word, so a button comes out narrow while every
colour, border, radius and padding still matches exactly. A `<button>` does not
inherit the features from `html` on its own, which is why the second rule names
form elements.

Found by `check-button-drift.mjs`. There is no way to reason your way to it.

## 3. The brand scope

| Scope                | Class                    |
| -------------------- | ------------------------ |
| MyBKY                | none — it is the default |
| Sampark, whole page  | `baps-ds-sampark`        |
| Sampark, one element | `baps-sampark`           |
| Dark                 | `baps-dark`              |

On `<body>`, or the framework's equivalent. Nothing is imported per brand.

## 4. The favicon

The app owns it, and the three frameworks wire it differently:

|                 | Where                | Wiring                                    |
| --------------- | -------------------- | ----------------------------------------- |
| Angular         | `public/favicon.ico` | `<link rel="icon">` in `src/index.html`   |
| React + Vite    | `public/favicon.svg` | `<link rel="icon">` in `index.html`       |
| Next App Router | `src/app/icon.svg`   | none — the router serves it by convention |

A missing favicon is the one item here that is visible immediately: the browser
falls back to its own globe, and a demo with a generic tab icon beside two
branded ones reads as unfinished.

**A favicon is the one place a literal brand hex is correct.** It is an image
document with no access to the page's custom properties, so `var(--…)` cannot
work there. Write the hex, and write the token name in a comment beside it so
the two can be kept in step:

```svg
<!-- #c96868 is --color-sampark-primary-60. A favicon cannot read CSS custom
     properties, so this is a literal copy; if the token moves, move it too. -->
<rect width="32" height="32" rx="4" fill="#c96868"/>
```

---

## Checklist

- [ ] `box-sizing: border-box` reset present
- [ ] `html` sets `font-size`, `font-family` and `font-feature-settings`
- [ ] Form elements inherit `font-feature-settings`
- [ ] Brand scope class on the body element, or none for MyBKY
- [ ] Favicon present and wired the way the framework expects
- [ ] One component's computed style measured to confirm it all landed
