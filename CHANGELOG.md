# Changelog

All notable changes to the BAPS Design System are recorded here by hand. See
[`docs/VERSIONING-AND-UPGRADE.md`](docs/VERSIONING-AND-UPGRADE.md) for release
classification and deprecation policy.

## Unreleased

### Fixed

- **`@org/ui-kit-react` — patch, visual:** the React checkbox showed both the
  tick and the minus after `0ad83ec`. That fix replaced a hide/reveal pair with
  "show the glyph whenever one is present", which is correct in Angular because
  PrimeNG renders exactly one — React renders both and expects CSS to pick, and
  both packages ship the same stylesheet. The rule now hides the glyph that
  does not match the state, using the suffix classes Angular never emits, so it
  is inert there. Measured on React markup: unchecked 0 glyphs, checked 1
  (check), indeterminate 1 (minus); Angular unchanged in both brands and
  themes. `tools/check-react-checkbox.mjs` now holds this, in a real browser —
  the React package has no Storybook and its tests run in jsdom, which has no
  cascade, which is why nothing caught it.
- **`@org/ui-kit` — patch, visual:** the checkbox tick icon was not rendered
  (`0ad83ec`). The glyph is hidden by default and revealed when the box is
  checked, but the reveal matched `.p-checkbox-icon-check` and
  `.p-checkbox-indeterminate .p-checkbox-icon-minus` — names PrimeNG 21 does
  not emit, as its element is `class="p-checkbox-icon p-icon"`. So the tick
  stayed `display: none` at 0×0 in every state and a checked box looked
  identical to an unchecked one, while the underlying state was correct the
  whole time. The rule now keys on the icon's presence, which in v21 is
  exactly the checked-or-indeterminate condition because an unchecked box
  renders no icon element. Verified at 14×14 and 18×18 in MyBKY and Sampark,
  light and dark.
- **`@org/ui-kit` — patch, visual:** corrected the Angular toolbar's inherited
  text/border colour to use `--toolbar-sampark-title-color` instead of
  PrimeNG's fallback ink (`1e800d2`). This aligns the wrapper with its existing
  token and raw-markup partial; it does not introduce a new visual design.
- **`@org/ui-kit` — patch, visual:** added `box-sizing: border-box` to
  `.baps-paginator__gap` so its standalone `pagination.css` height is 30px
  instead of 34px (`4c053bc`). Storybook and applications with a global
  border-box reset already rendered 30px, so the visible correction affects
  raw-CSS consumers without that reset.
