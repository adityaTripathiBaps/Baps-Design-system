# Changelog

All notable changes to the BAPS Design System are recorded here by hand. See
[`docs/VERSIONING-AND-UPGRADE.md`](docs/VERSIONING-AND-UPGRADE.md) for release
classification and deprecation policy.

## Unreleased

### Added

- **`@org/ui-kit` — minor, additive:** `baps-toggleswitch` emits
  `(valueChange)` with the new state when the user toggles it (GAP-04).
  Values written by the form do not emit, so a handler that patches the form
  cannot loop. The React toggle already reports user changes via `onChange`.
- **`@org/ui-kit` — minor, additive:** `baps-table` now exposes PrimeNG 21's
  virtual-scroll delay/options and column-reorder contract, plus opt-in scroll
  retention and controlled collapsible subheader groups. All defaults preserve
  existing table behaviour; an unset `virtualScrollDelay` keeps PrimeNG's own
  250 ms lazy-load debounce. The React table intentionally remains unchanged:
  it has no PrimeNG scroller or approved row-grouping/reordering contract.

### Fixed

- **`@org/ui-kit` — patch, visual:** `baps-chips-input`'s typing slot had no
  minimum width. Its `flex-basis` and `min-width` read a `--space-16` token
  that does not exist, so the browser dropped both declarations (measured:
  both computed `auto`). Both are now 4rem, the value the rule was written
  for, built from `--space-8`; a real 64px space token is a design decision.
  Its border is now `1px` instead of `0.0625rem`, which can round to 0 at
  some zoom levels.
- **`@org/ui-kit` — patch, visual:** `baps-input-number`'s spinner borders
  are `1px` instead of `0.0625rem`, which can round to 0 at some zoom levels.
  Identical at 100% zoom.
- **`@org/ui-kit` and `@org/ui-kit-react` — patch, visual:** a page-level
  `.baps-ds-sampark` no longer restyles raw PrimeNG `p-table`s. The Sampark
  table skin's scope was `.baps-ds-sampark` itself, so its header rule
  (`nowrap`, `ellipsis`, `0 12px` padding, 40px) reached every table on the
  page and clipped a raw table's "Primary? ⓘ" header in spm-ui. Styling rules
  now match `.baps-ds-sampark baps-table`, the form base `_table.scss` already
  uses. The `--table-*` custom properties stay on the page scope, since they
  style nothing on their own and the raw-markup docs example reads them.
  `baps-table` in both brands is unchanged.
- **`@org/ui-kit` and `@org/ui-kit-react` — patch, visual:** dividers drew the
  wrong borders, two different ways. In the shipped stylesheet the type rules
  set a bare `border-style`, which styles all four sides of the line's
  `::before`; the three sides without a width fell back to `medium` (3px), so
  every React divider, and every Angular app importing `@org/ui-kit/styles`,
  drew a small box instead of a 1px rule. Each type now styles only the line's
  own side per orientation. Separately, the Angular divider's inline Sampark
  rules used a `border-top` / `border-left` shorthand, whose `solid` overrode
  the type, so Sampark dashed and dotted dividers rendered solid; they now set
  width and colour only. Measured on `main`: 0/12 brand × layout × type cases
  correct in the shipped CSS, Sampark dashed/dotted solid in Angular; after:
  12/12, and MyBKY Angular unchanged. `tools/check-react-divider.mjs` holds
  the shipped-CSS case in a real browser, and the Divider story
  *Interaction — one styled side per layout* holds the Angular one.
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
