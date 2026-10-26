# Changelog

All notable changes to the BAPS Design System are recorded here by hand. See
[`docs/VERSIONING-AND-UPGRADE.md`](docs/VERSIONING-AND-UPGRADE.md) for release
classification and deprecation policy.

## Unreleased

### Added

- **`@org/ui-kit` — minor, additive:** `[bapsInputText]` and `[bapsTextarea]`
  take `brand`. `brand="sampark"` puts `baps-sampark` on the field itself, which
  the Sampark input skin now also matches, so a Sampark app with no page scope
  no longer draws the MyBKY 99px pill (measured 4px vs 99px).
- **`@org/ui-kit` — minor, additive:** `baps-message` takes `brand`.
  `brand="sampark"` was silently ignored before; the input did not exist.
- **`@org/ui-kit` — minor, additive:** `baps-dialog` takes `ariaDescribedBy`,
  the id of the element that describes the dialog. PrimeNG's Dialog has no
  input for it, so it is set on the panel root through PrimeNG pass-through,
  the same element that carries `role`.
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

- **`@org/ui-kit` — patch, visual (Sampark):** tree-select and cascade-select
  placeholders render in the placeholder colour. The Sampark placeholder rule
  listed select and multiselect only, while the label rule above it gave all
  four the filled-text colour (measured tree-select placeholder #151414).
- **`@org/ui-kit` — patch, visual (Sampark):** select-family overlay rows draw
  one bar. Base `_select.scss` also painted `inset 3px var(--p-primary-600)` on
  hover/selected rows, read from the preset, so under a non-kit preset a second
  3px bar sat under Sampark's 4px `::before` (spm-ui: #bf5555).
- **`@org/ui-kit` — patch:** the select state guards are wrapped in `:where()`
  so they add no specificity. Unwrapped they put the base state rules at
  (0,5–6,0) `!important`, out-ranking the Sampark skin's state rules and
  every raw p-select on the page. Which state applies is unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** a page-level `.baps-ds-sampark`
  no longer restyles raw PrimeNG `p-drawer`s. The page-scope arm now matches
  only kit drawer panels, which always name their brand
  (`baps-drawer-mybky` / `baps-drawer-sampark`). Measured on a raw drawer
  under the scope: white, 16px radius, 32/24 padding, 20px title before.
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-iconfield`'s icon sits
  centred. PrimeNG centres it with a negative `margin-top` and the kit with
  `translateY(-50%)`; together they lifted it 8px (measured on the shipped
  CSS with PrimeNG's runtime rule). The margin is reset for Sampark; MyBKY has
  the same double centring and is left for a separate decision.
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-message` is SPM's compact
  inline row: inline-flex, 22px box (`--tag-sampark-height-s`), `0 0.25rem`
  padding, `0.125rem` gap, a 1px border in the badge colours instead of the
  MyBKY outline. Measured on the shipped CSS: 45px with 12/16 padding before.
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
- **`@org/ui-kit` and `@org/ui-kit-react` — patch, visual:** `baps-menu`'s
  panel skin no longer restyles raw PrimeNG `p-menu`s elsewhere on the page.
  Rules were rooted at bare `.p-menu`; they now match `.baps-menu-panel`,
  which both menus add to their panel. `baps-menu` itself is unchanged: the
  radius now reads the real `--radius-mybky-md` (0.5rem, the same value the
  dead `--radius-mybky-default` fell back to), and the paddings, font size and
  weight now read space and font tokens of identical value.
- **`@org/ui-kit` — patch, a11y:** `baps-confirm-dialog` renders as
  `role="alertdialog"` with `aria-describedby` pointing at its message, so
  screen readers announce the confirmation and its question at once.
  Dead `.p-confirmdialog-icon` / `.p-confirmdialog-message` rules removed;
  the component never rendered those classes.
- **`@org/ui-kit` — patch:** `baps-confirm-dialog` now renders when
  `BapsConfirmationService` emits in a zoneless host. The service calls the
  dialog outside any template event, so its state changed and nothing
  scheduled a render: `visible` read true while the shell stayed closed.
  Zone-based apps were unaffected, because the triggering click ran change
  detection anyway.
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
