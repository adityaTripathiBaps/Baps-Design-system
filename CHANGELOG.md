# Changelog

All notable changes to the BAPS Design System are recorded here by hand. See
[`docs/VERSIONING-AND-UPGRADE.md`](docs/VERSIONING-AND-UPGRADE.md) for release
classification and deprecation policy.

## Unreleased

### Added

- **`@org/ui-kit` — minor, additive:** `baps-select` forwards a consumer's
  `pTemplate` slots (`item`, `group`, `selectedItem`, `filter`, `header`,
  `footer`, `empty`, `emptyfilter`, `dropdownicon`, `clearicon`) to PrimeNG;
  they were silently ignored. New inputs `loading`, `dataKey`,
  `toggleOnClick` (a click cycles to the next option), `lazy`,
  `virtualScroll`, `virtualScrollItemSize`, `scrollHeight` and outputs
  `cleared` (with the value it held), `lazyLoad`. All default off or to PrimeNG's default, so
  existing usages render unchanged (spm AT-042, AT-043).
- **`@org/ui-kit` — minor, additive:** `baps-multi-select` forwards
  `pTemplate` slots the same way (`item`, `group`, `selecteditems`,
  `filter`, `header`, `footer`, `empty`, `emptyfilter`, `dropdownicon`,
  `chipicon`, `clearicon`). New inputs `loading`, `dataKey`,
  `virtualScroll`, `virtualScrollItemSize`, `lockedValues` (stay selected;
  a removed chip is re-added) and `keepOneSelected` (never empty), and output
  `cleared`. Defaults leave existing usages unchanged (spm AT-042, AT-044).
- **`@org/ui-kit` — minor, additive:** `baps-multi-select` `chipOverflow`
  (with `display="chip"`: keep `maxSelectedLabels` chips plus a "+N" chip whose
  tooltip lists the rest; chips carry their label as a tooltip and a locked chip
  has no remove icon) and a `virtualScrollOptions` pass-through. `baps-select`
  gains `resetFilterOnHide` and `autofocusFilter` (PrimeNG defaults). Both take
  an `invalid` input; left unset, a Sampark field now shows the error border
  when its form control is invalid and dirty or touched (the inner PrimeNG
  control never saw the host control). MyBKY unchanged unless `invalid` is set
  (spm AT-045).
- **`@org/ui-kit` — minor, additive (Sampark):** `baps-input-number` inside a
  Sampark `baps-input-group` fills the group: chromeless input, spinner buttons
  joined to the group border, no double border. A Sampark group also takes
  `class="w-auto"` (inline, content width) and draws the error ring when its
  control is `ng-invalid.ng-dirty` or `.p-invalid`. All three are scoped to
  Sampark (`baps-input-group.baps-sampark` or a `.baps-ds-sampark` page);
  MyBKY is unchanged and its input-group + input-number pairing stays
  unintegrated (ask-at-demo).
- **`@org/ui-kit` — minor, additive:** `baps-iconfield` and `baps-inputicon`
  take `brand`; `brand="sampark"` stamps `baps-sampark` on the host so the
  Sampark icon skin applies without a page scope. A projected icon (for
  example `svg-icon`) inside a Sampark `baps-inputicon` is centred. Default
  `'mybky'`, so existing usages are unchanged.
- **`@org/ui-kit` — minor, additive:** `baps-paginator` takes
  `rowsPerPagePosition` (`'start'` default, `'end'`). `'end'` puts the
  rows-per-page select after the arrows, SPM's order (report → arrows →
  rows-per-page). Default unchanged (PAG-1).
- **`@org/ui-kit` — minor, additive:** `baps-overlaybadge` takes `brand`.
  `brand="sampark"` (or a `.baps-ds-sampark` page) gives the badge the
  Sampark count-pill sizes and the notification red for `danger`; PrimeNG
  forwards no design tokens to the inner badge, so they arrive as its CSS
  variables. MyBKY unchanged.
- **`@org/tokens` — minor, additive:** `--message-sampark-text-font-size`
  (12.72px), `--message-sampark-text-font-weight` (500, `font.weight.medium`),
  `--message-sampark-text-line-height` (1.2) and `--message-sampark-icon-size`
  (13px), the SPM dev inline-message metrics.
- **`@org/ui-kit` — minor, additive:** `baps-drawer` takes `width`, any CSS
  length, forwarded to the PrimeNG panel as an inline width (GAP-05). Unset
  keeps the brand skin's default width, so existing drawers are unchanged.
  The narrow-viewport Sampark rule (100vw) still wins below 768px.
- **`@org/ui-kit` — minor, additive:** `[bapsInputText]` and `[bapsTextarea]`
  take `brand`. `brand="sampark"` puts `baps-sampark` on the field itself, which
  the Sampark input skin now also matches, so a Sampark app with no page scope
  no longer draws the MyBKY 99px pill (measured 4px vs 99px).
- **`@org/ui-kit` — minor, additive:** `baps-message` takes `brand`.
  `brand="sampark"` was silently ignored before; the input did not exist.
- **`@org/ui-kit` — minor, additive:** `baps-tag` accepts `severity="primary"`,
  the name spm-ui uses for Figma's "Primary" chip. It renders the existing
  `contrast` chip (MyBKY navy, Sampark rose); PrimeNG has no `p-tag-primary`.
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

- **`@org/ui-kit` — patch, visual (Sampark):** chip MultiSelects stay on one
  line in the 32px field, as on SPM dev: chips shrink with an ellipsis and the
  `chipOverflow` "+N" chip never shrinks (a block label let them spill out of
  the field). A consumer `dropdownicon` svg keeps its own size instead of the
  chevron size, with no baseline gap (spm's 26x32 "switch" trigger). MyBKY
  unchanged (spm AT-045).
- **`@org/ui-kit` — patch, visual (Sampark):** MultiSelect chips match SPM dev:
  22px, Mono/20 fill, Mono/100 text, Mono/borders hairline (was MyBKY's tag
  grey), 500 weight, 8px sides; the label stays 12px (dev 13px, ask at demo).
  Option rows are 33px under any preset: the option checkbox host is pinned
  to its 16px box (spm-ui's preset made it 20px, rows 36px). MyBKY unchanged
  (spm AT-045).
- **`@org/ui-kit` — patch, visual (Sampark):** the MultiSelect panel header
  matches SPM dev: 91px, a Mono/20 search strip with a hairline over a white
  42px "Select All" row (14px/400 label, 12px padding and gap, on the options'
  12px rail; greyed when disabled). A selected MultiSelect row has no fill;
  only hover and focus paint one. MyBKY unchanged (spm AT-044).
- **`@org/ui-kit` — patch, visual (Sampark):** a raw PrimeNG `p-datepicker`
  with `iconDisplay="input"` keeps 40px (`--space-10`) on the right of its
  input, as in SPM dev; the Sampark `.p-inputtext` padding shorthand reset it
  to 8px, so typed dates ran under the calendar icon (spm AT-034). Kit
  `baps-datepicker` hosts are excluded. MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** input placeholders read
  `--color-sampark-text-muted` (#9f9c9c), SPM dev's colour; they used
  `--color-sampark-text-placeholder` (#979493) (spm AT-035). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-menu` items are 36px
  rows with 14px text, 12px inline padding and line-height 1, measured on SPM
  dev; the preset left 32px rows in spm-ui (spm AT-040). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-menu` item icons are
  12px, as in SPM dev; PrimeNG's 16px `.pi` stretched the rows to 38px
  (spm AT-040). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-input-group` addons are
  weight 500 with 12px (`--space-3`) sides, and the suffix takes the prefix's
  `--color-sampark-mono-alpha4` tint, as SPM dev's Min/Max; they were 400,
  10px and a lighter alpha2 suffix. A group whose input is disabled fills
  with the disabled-input surface (`--color-sampark-secondary-0`) and keeps
  its border on hover. Dev's 13px addon label has no type-scale step, so the
  size stays 14px (ask-at-demo). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** the selected `baps-tree-select`
  node is weight 400, as in SPM dev; the base selected-option rule made it 500
  (spm AT-041). Its background stays Figma Primary/10 (ask-at-demo). MyBKY
  unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** a left-icon field has 8px on
  its right, as in SPM dev; it kept MyBKY's 14px (spm AT-036). MyBKY
  unchanged.
- **`@org/ui-kit` — patch, visual (raw PrimeNG only):** the datepicker input
  structure (input group, leading input icon, clear icon and their padding) now
  applies only inside `baps-datepicker`. Unscoped, it reached every raw
  PrimeNG `p-datepicker` in a consuming app and, because PrimeNG 21 renders
  `.p-datepicker-input-icon-container` rather than the kit's input group,
  pushed the calendar icon outside the field (spm-ui AT-034). `:where()` keeps
  the old specificity, so kit datepickers render unchanged in both brands.
- **`@org/ui-kit` — patch, visual (Sampark):** a Sampark `baps-menu` panel
  keeps its 200px minimum width when the app also ships legacy
  `.p-menu { min-width: fit-content }` (spm-ui: 98px before). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** a disabled Sampark
  `baps-toggleswitch` renders at 0.6 opacity, as in SPM dev (was full
  opacity). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (both brands, raw PrimeNG only):** the
  select trigger's `width: 100% !important` (`.p-select`, `.p-multiselect`,
  `.p-cascadeselect`, `.p-treeselect`) now applies only inside a kit host
  (`baps-select`, `baps-multi-select`, `baps-tree-select`, `baps-paginator`).
  Unscoped, it stretched every raw PrimeNG select in a consuming app (spm-ui's
  raw paginator rows-per-page rendered 1360px wide); the Sampark block's
  restatement under `.baps-ds-sampark` is removed for the same reason. Kit
  components render unchanged in both brands (F2).
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-input-group` addons no
  longer shrink below their text. In a narrow group (spm-ui's 166px duration
  Min/Max) the "Day/s" suffix collapsed to 38px and its text overflowed the
  10px padding; the field now gives up the width instead. MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** an open `baps-accordion-panel`
  with a divider leaves 8px between the divider and its first field
  (`--space-2`), as in SPM dev (header, 8px, divider, 8px, field); the field
  sat 1px under the divider. MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** the `baps-accordion-panel`
  clear icon is Sampark Mono/100 (#151414), as in SPM dev; it fell back to
  MyBKY Mono/500 (#6f777d) on Sampark pages, the one MyBKY colour spm-ui's
  brand-scan found on its kit Filters drawer. MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** the Sampark trigger glyph
  replaces only chevrons (PrimeNG's default or a `pi-chevron-down` template).
  Any other consumer `dropdownicon` is shown as supplied, as SPM dev does
  (its up/down "switch" icon on Project Type / Sampark Type was being
  painted over with a chevron). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** TreeSelect leaf rows show the
  "–" marker again. PrimeNG hides a leaf's toggle button with
  `visibility: hidden`, which the marker (its `::before`) inherited, so it
  was never painted (spm-ui location tree). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-paginator` nav arrows are
  28px (`--form-field-sampark-height-sm`) with a 12px glyph
  (`--font-size-xs`), as in SPM dev (28px, ~12.8px); they were 32px with a
  16px glyph. Page links keep 32px. SPM dev's 13px report text has no token
  (ask-at-demo). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** a `baps-drawer` or
  `baps-dialog` left on its default brand inside a `.baps-ds-sampark` page no
  longer blurs the page behind it: the MyBKY frosted scrim (25px blur) leaked
  into Sampark pages, visible in every Sampark Storybook drawer. MyBKY
  unchanged.
- **`@org/ui-kit` — patch (Sampark table):** `.dt-frozen-right` still pins to
  the right edge by default, but its `right: 0` is no longer `!important`, so
  a table that pins several trailing columns can bind each one's offset with
  `[style.right]` (they all collapsed onto the edge before).
- **`@org/ui-kit` — patch, visual (Sampark):** dropdown chevrons follow SPM
  dev: 10px (`--font-size-2xs`) on Select and TreeSelect, 12px on
  MultiSelect; all were 12px. MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** TreeSelect rows hover in
  Mono/10 (#f8f7f7) without the bar, as in SPM dev (was #f6f5f5 with the
  4px bar). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** Select, MultiSelect and
  TreeSelect panels are framed in Mono/40 (#bcb9b9) as in SPM dev; they
  used the lighter Mono/borders (#e1e0e0). Internal dividers are unchanged.
  MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** the selected option in
  Select and MultiSelect panels is the plain Sampark row surface (#f6f5f5)
  with no bar, as in SPM dev; the bar stays the hover/keyboard-focus cue.
  The rule is four classes deep so app CSS on the overlay at (0,3,0)
  `!important` (spm-ui painted the selected row #f8f7f7) no longer wins.
  MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** select-family option rows are
  content-sized as in SPM dev: Select 10px/16px padding (37px rows),
  MultiSelect and TreeSelect 8px/12px (33px), line-height normal. The base
  `min-height: 48px; line-height: 1.3` reached Sampark rows (measured 48px in
  spm-ui). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** input leading icons
  (`baps-inputicon`, iconfield search icons) use Sampark primary text
  (#151414). They inherited the `:root` MyBKY Mono/900 (#181b1d), the only
  MyBKY colour spm-ui's brand-scan found on its Template screens. SPM dev's
  #1a0701 has no token (ask-at-demo). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-message` text is
  12.72px/500 with a 13px icon, as in SPM dev (was 14px/400). The Sampark
  message rules moved to `_message-sampark.scss`, which `baps-message` now
  loads itself, so Storybook and per-component imports get them too; before,
  they existed only in the full bundle. MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** the Filters drawer matches SPM
  dev: header inset 24/32/8px, content inset 12/32/32px with no panel
  padding or gap, footer inset to the content, 32px header actions, and
  `baps-accordion` sections with a 12px count-to-title gap, an 18px clear
  icon in a 28px button and two-column 12px field rows. The `#f6f7f8` header
  surface SPM uses has no Sampark token, so the header stays Mono/10
  (ask-at-demo). MyBKY unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** list-overlay rows (select,
  multiselect, tree-select, paginator rows-per-page) are square on hover,
  focus and selected, as in SPM dev; they rounded to 4px before
  (`--select-option-radius`). Menu and listbox were already square. MyBKY
  unchanged.
- **`@org/ui-kit` — patch, visual (Sampark):** select, multiselect and
  tree-select triggers draw one 12px Mono/100 PrimeIcons chevron, as SPM dev
  does, including raw `p-select`/`p-multiselect` under `.baps-ds-sampark`
  (they mixed 14px and 16px SVG chevrons before). The glyph is a `::before`
  in the `primeicons` font, so **a Sampark app must load
  `primeicons/primeicons.css`**; without it the trigger is blank. DatePicker
  keeps its calendar glyph. MyBKY unchanged.
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
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-paginator`'s rows-per-page
  select is 28px (`--form-field-sampark-height-sm`). Its height rule was a
  descendant selector, but in v21 both classes sit on the same element, so it
  never matched.
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
