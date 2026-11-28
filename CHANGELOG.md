# Changelog

All notable changes to the BAPS Design System are recorded here by hand. See
[`docs/VERSIONING-AND-UPGRADE.md`](docs/VERSIONING-AND-UPGRADE.md) for release
classification and deprecation policy.

## Unreleased

### Added

- **Fieldset — `bapsFieldset` directive on PrimeNG's `p-fieldset` ([primeng.dev/fieldset](https://primeng.dev/fieldset)).** No wrapper (no BAPS inputs; `#header` / content / icon templates work as documented). The Material base drew the border `#cbd5e1`, text `#0f172a`, toggle icon `#475569` and a `#f1f5f9` legend hover in both brands; a partial `fieldset/_fieldset.scss` re-points PrimeNG's variables to the brand tokens. Measured in Storybook: border MyBKY `#e4ecf1` / Sampark `#e1e0e0`, text `#181b1d` / `#151414`, legend hover `#eff1f3` / `#f3f2f2`; toggling folds the content to 0 and reports `collapsed: true`. Stories for PrimeNG's Basic, Toggleable and Template demos; docs and spec.
- **Tree — `bapsTree` directive on PrimeNG's `p-tree` ([primeng.dev/tree](https://primeng.dev/tree)).** No wrapper: node templates are chosen by each node's `type`. The Material base drew node text in slate `#0f172a`, toggles and icons in slate `#475569` and a slate hover in both brands; a partial `tree/_tree.scss` re-points PrimeNG's variables to the brand text, secondary text and hover tokens, keyed on the `bapsTree` attribute so TreeSelect's overlay tree keeps its own skin (checked: its variables are unchanged). Measured in Storybook: text MyBKY `#181b1d` / Sampark `#151414`, toggles and icons `#2b2f32` / `#595656`, selected node in the brand primary tint; expand, single and checkbox selection (parents included), filter "edi" keeps the Edison branch. Stories for PrimeNG's Basic, Controlled, Selection, Filter, Template and Drag Drop demos; docs and spec.
- **Timeline — `bapsTimeline` directive on PrimeNG's `p-timeline` ([primeng.dev/timeline](https://primeng.dev/timeline)).** No wrapper (no BAPS inputs; `content` / `marker` / `opposite` templates work as documented). The marker already took the brand primary; the connector stayed Material slate `#cbd5e1` in both brands, so a small partial `timeline/_timeline.scss` re-points PrimeNG's connector variable to the brand border. Measured in Storybook: markers MyBKY `#5f78b8` / Sampark `#c96868`, connector `#e4ecf1` / `#e1e0e0`; left, right and alternate alignment and horizontal layout render; kit cards sit in the template. Stories for PrimeNG's Alignment, Opposite, Template and Horizontal demos; docs and spec.
- **PickList — `bapsPickList` directive on PrimeNG's `p-picklist` ([primeng.dev/picklist](https://primeng.dev/picklist)).** No wrapper (some twenty templates by reference name, two-way `source` / `target`); the directive adds the brand host class, and both lists take the shared Listbox skin extended in the OrderList change. Measured in Storybook, both brands: lists match `baps-listbox` (MyBKY 16px radius `#eaeff3`, Sampark 4px `#e1e0e0`; rows 10px 16px, 14px), `sourceHeader` / `targetHeader` inset 10px 16px with a rule under, controls are kit buttons; move one and move all update the bound target; filter "sha" leaves 2. Stories for PrimeNG's Basic and Filter demos; docs and spec.
- **OrgChart — `bapsOrgChart` directive on PrimeNG's `p-organizationchart` ([primeng.dev/organizationchart](https://primeng.dev/organizationchart)).** No wrapper: node templates are chosen by each node's `type`, any name, which a wrapper cannot forward. The Material base drew nodes, connectors and toggles in slate (`#cbd5e1` borders, `#0f172a` text) in both brands; a new partial `org-chart/_org-chart.scss` re-points PrimeNG's own colour variables to the brand border, text and hover tokens (geometry unchanged), loaded globally in Storybook like the other directive skins. Measured in Storybook: MyBKY border `#e4ecf1`, text `#181b1d`; Sampark border `#e1e0e0`, text `#151414`; selected node in the brand primary tint; a branch folds; multiple selection reports `Northeast, Edison`. Stories for PrimeNG's Basic, Template, Selection and Colored demos; docs and spec.
- **OrderList — `bapsOrderList` directive on PrimeNG's `p-orderlist` ([primeng.dev/orderlist](https://primeng.dev/orderlist)).** No wrapper (OrderList takes its templates by reference name and pTemplate, and reorders `value` in place); the directive adds the brand host class. Its list fell through to the Material base, so the shared Listbox skin (`_listbox.scss`) now also covers `.p-orderlist` and `.p-picklist` lists, with `display: block` kept to `baps-listbox`, and a `#header` template's text gets the option inset and a rule under it. Storybook loads the listbox partial globally, as it does for the other directive skins. Measured in Storybook, both brands: before, MyBKY drew a 99px radius on a 226px list with 16px slate rows; after, it matches `baps-listbox` exactly (MyBKY 16px radius `#eaeff3` border, Sampark 4px; rows 10px 16px, 14px, selected bar); move-up reorders the value; filter narrows to 1. PrimeNG v21 does not render the `header` input, so the docs use `#header`. Stories for PrimeNG's Basic, Drag Drop and Filter demos plus controls right; docs and spec.
- **DataView — `bapsDataView` directive on PrimeNG's `p-dataview` ([primeng.dev/dataview](https://primeng.dev/dataview)).** No wrapper component: DataView finds `#list`, `#grid`, `#header`, `#footer` and `#emptymessage` by template reference, which a wrapper would have to re-declare one by one; the directive adds the brand host class, as `bapsTabs` does. Its own `[paginator]` is PrimeNG's `p-paginator` (40px circles, slate border), so the docs page the value and put `baps-paginator` under it, as with `baps-table`. Measured in Storybook, both brands: list and grid layouts switch, sort by families orders the items, kit paginator MyBKY 30px pill / Sampark 32px radius 4 moves through 3 pages, empty message shows. Stories for PrimeNG's Basic, Pagination, Sort, Layout and Loading demos plus empty; docs and spec.
- **SpeedDial — `baps-speed-dial` wraps PrimeNG SpeedDial ([primeng.dev/speeddial](https://primeng.dev/speeddial)).** MenuItem actions in linear, circle, semi-circle and quarter-circle layouts, with every PrimeNG input (direction, radius, transitionDelay, mask, rotateAnimation, icons, button/mask class and style, tooltipOptions, a11y) at PrimeNG's own defaults, two-way `visible`, outputs `clicked` / `shown` / `hidden`, and the `button` / `item` / `icon` templates. No skin change: the buttons are pButtons and take the kit button skin. Measured in Storybook, both brands: main button MyBKY 36px gradient / Sampark 32px `#c96868` circle, secondary circle actions with the brand border, icon turns 45° open; tooltip, mask (0.32), circle radius 80, outside click and Escape close it. Stories for all 7 PrimeNG demo sections; docs and spec.
- **KeyFilter — `bapsKeyFilter` directive over PrimeNG KeyFilter ([primeng.dev/keyfilter](https://primeng.dev/keyfilter)).** A host directive, no wrapper: `bapsKeyFilter` takes a preset (`pint`, `int`, `pnum`, `num`, `money`, `hex`, `email`, `alpha`, `alphanum`) or a RegExp, `validateOnly` turns blocking into a form error, and PrimeNG's validator and `ngModelChange` come along. Measured in Storybook, both brands: typing `-12a3.4` into int gives `-1234`, `0fZ9g` into hex gives `0f9`, `a b c` with a no-space RegExp gives `abc`; validate-only keeps `12a` and marks the control invalid; the field keeps the kit input skin (MyBKY 36px pill, Sampark 32px radius 4). Stories for PrimeNG's Presets and Regex demos plus validate-only; docs and spec.
- **ToggleButton — `baps-toggle-button` wraps PrimeNG ToggleButton ([primeng.dev/togglebutton](https://primeng.dev/togglebutton)).** A boolean form control with PrimeNG's inputs (labels and icons per state, `iconPos`, size, fluid, `allowEmpty`, invalid, a11y), `changed`, and the `content` / `icon` templates; labels default to PrimeNG's own. The Material base drew a 46px, 16px/500 toggle beside the kit's buttons, so geometry follows the kit button through PrimeNG's variables: measured MyBKY 36px pill (32/36/42), Sampark 32px radius 4 (28/32/36), 14px/400. Sampark swaps Material's slate fills for its tokens: hover `#f3f2f2` (mono-20, the secondary button hover), pressed `#e1e0e0` (mono-borders), icon in text colour. Stories for all 6 PrimeNG demo sections; docs and spec.
- **Rating — `baps-rating` wraps PrimeNG Rating ([primeng.dev/rating](https://primeng.dev/rating)).** A form control with `stars`, `readonly`, `disabled`, `autofocus` and the on/off icon class and style inputs, outputs `rated`, `focused`, `blurred`, and the `onicon` / `officon` templates. No skin change: filled stars take the brand primary from the theme. Measured in Storybook: 18px stars, filled and hover MyBKY `#5f78b8` / Sampark `#c96868`, empty `#475569`, disabled opacity 0.38; clicking star 3 sets 3, clicking it again clears to `null`; a pick reaches the form and marks it touched. Stories for all 6 PrimeNG demo sections; docs and spec.
- **Knob — `baps-knob` wraps PrimeNG Knob ([primeng.dev/knob](https://primeng.dev/knob)).** A form control with every PrimeNG input (`min`, `max`, `step`, `size`, `strokeWidth`, `showValue`, `valueTemplate`, the three colours, `readonly`, `disabled`, a11y) and `changed`. Defaults are PrimeNG's own (`primeng-knob.mjs`), so unset inputs never wipe the theme colours or size. No skin change: the value arc takes the brand primary from the theme. Measured in Storybook: 100px dial, value arc MyBKY `#5f78b8` / Sampark `#c96868`, range `#cbd5e1`, disabled opacity 0.38; two ArrowUp presses 50 → 52, a click sets 85 on the form. Stories for all 11 PrimeNG demo sections; docs and spec.
- **Password — `baps-password` wraps PrimeNG Password ([primeng.dev/password](https://primeng.dev/password); InputPassword in the v21 list).** A form control with PrimeNG's inputs (strength meter, labels and rules, `toggleMask`, `showClear`, size, variant, fluid, a11y, input style/class), outputs (`focused`, `blurred`, `cleared`) and the six templates; a Sampark field follows its form control's error state. Two fixes found while measuring: the field now takes its container's width (PrimeNG's inline-flex wrapper shrank it to 229px in a 288px column), and the eye/clear icon gets the kit's trailing-icon room (2.5rem, 5rem with both; `_input.scss`) because the kit's `!important` padding beat PrimeNG's and text ran under the icon (text ended at 290px, icon started at 272px; now 264px). The wrapper defaults `mediumRegex`/`strongRegex` to PrimeNG's own, so the meter grades correctly (`abc` Weak, `abcAbc123` Strong). Measured in Storybook: MyBKY 36px pill, Sampark 32px radius 4, sizes 32/36/44 and 28/32/40. Stories for all 13 PrimeNG demo sections; docs and spec.
- **InputMask — `baps-input-mask` wraps PrimeNG InputMask ([primeng.dev/inputmask](https://primeng.dev/inputmask)).** A form control with every PrimeNG input (`mask`, `slotChar`, `autoClear`, `unmask`, `keepBuffer`, `characterPattern`, `showClear`, size, variant, fluid, a11y) and its outputs (`completed`, `focused`, `blurred`, `inputChange`, `keydown`, `cleared`) plus the `clearicon` template; a Sampark field follows its form control's error state. No skin change: the inner field is a `pInputText`. Measured in Storybook: MyBKY 36px pill, Sampark 32px radius 4, sizes 32/36/44 and 28/32/40, error border on invalid, ifta label 52px; typing `123456789` gives `123-45-6789` on the form and fires `completed`. Stories for all 11 PrimeNG demo sections; docs and spec.
- **ColorPicker — `baps-color-picker` wraps PrimeNG ColorPicker ([primeng.dev/colorpicker](https://primeng.dev/colorpicker); InputColor in the v21 list).** A form control on the kit wrapper pattern: `inline`, `format` (hex / rgb / hsb), `defaultColor`, `disabled`, `inputId`, `tabindex`, `autofocus`, `appendTo`, `styleClass`; outputs `changed`, `shown`, `hidden`; closing the popup marks the control touched. No skin change: the swatch comes from the theme (32px, MyBKY pill, Sampark 4px) and the panel is PrimeNG's dark picker in both brands. Measured in Storybook, both brands: a click in the colour square sets `#2b58cc` on the model and the form. Stories for PrimeNG's Basic, Inline, Format, Disabled and Forms demos; docs and spec.
- **IftaLabel — `baps-iftalabel` wraps PrimeNG IftaLabel ([primeng.dev/iftalabel](https://primeng.dev/iftalabel)).** The label sits inside the field, above the value. PrimeNG's ifta rules live in `@layer primeng` and lost to the kit's `!important` input skin (fixed 36/32px height, 6px block padding), so the label landed on the value; the wrapper re-applies them with PrimeNG's own `--p-iftalabel-input-padding-top/bottom` (1.5rem / 0.5rem) for inputs, selects, multiselects, tree/cascade selects, autocompletes, date pickers and number inputs. Measured in Storybook, both brands: field 52px, label 8px from the top and in line with the field text (MyBKY 14px, Sampark 8px), error colour on invalid, primary colour on focus. Stories for PrimeNG's Basic and Invalid demos plus a select; docs and spec.
- **`@org/ui-kit` — minor, new component:** `baps-cascade-select`, PrimeNG
  CascadeSelect for both brands: form control, Sampark error state from the
  form control, brand scope on the body-level panel, PrimeNG's inputs and
  outputs, 8 forwarded templates, full width like `baps-select`. Stories and
  docs for the PrimeNG demo sections.
- **`@org/ui-kit/styles` — patch:** CascadeSelect's deeper levels now show.
  The shared overlay `overflow: hidden` clipped them inside the root panel;
  each level is now its own panel with the overlay skin. Sampark rows take the
  Select rhythm (37px) and the Mono/40 frame.
- **`@org/ui-kit` — minor, new component:** `baps-autocomplete`, PrimeNG
  AutoComplete for both brands (skin from the shared select partials). Form
  control, Sampark error state that follows the form control, brand scope on
  the body-level panel, all PrimeNG inputs (dropdown, forceSelection, group,
  virtualScroll, focus behaviour, sizes, variant, fluid, messages …), outputs
  without the `on` prefix, and 11 forwarded templates. Stories and docs for
  every PrimeNG demo section; `multiple` is left to `baps-chips-input`.
- **`@org/ui-kit` — minor, additive:** `baps-dialog` covers PrimeNG's Dialog
  demo. Opt-ins (default off, kit design unchanged): `draggable` (header shows
  a move cursor), `resizable`, `maximizable`. New pass-through inputs:
  `position`, `breakpoints`, `keepInViewport`, `focusOnShow`, `focusTrap`,
  `contentStyle`, `contentStyleClass`, `maskStyleClass`, `minX`, `minY`,
  `closeIcon`, `closeTabindex`, `maximizeIcon`, `minimizeIcon`. New outputs:
  `dragEnd`, `resizeInit`, `resizeEnd`, `maximize`. Stories and docs:
  Draggable, Maximizable and responsive, Position, Without modal, Headless
  and full screen.
- **`@org/ui-kit` — minor, additive:** `baps-listbox` covers PrimeNG's Listbox
  demo. New pass-through inputs: `checkmark`, `highlightOnSelect`, `striped`
  (even rows in the brand's light surface, not PrimeNG's slate),
  `scrollHeight`, `virtualScroll`, `virtualScrollItemSize`,
  `virtualScrollOptions`, `lazy`, `dragdrop`, `dropListData`, `showToggleAll`,
  `selectAll`, `emptyMessage`, `emptyFilterMessage`, `filterMatchMode`,
  `filterBy`, `filterLocale`, `filterValue`, `dataKey`, `autoOptionFocus`,
  `selectOnFocus`, `focusOnHover`, `searchLocale`, `tabindex`, `listStyle`,
  `listStyleClass`, `invalid`, `fluid`, `ariaFilterLabel` and the four
  screen-reader messages. New outputs: `changed`, `clicked`, `dblClicked`,
  `filtered`, `selectAllChange`, `lazyLoad`, `dropped`. Blur now marks the
  form control touched. Stories and docs: Checkmark, Multiple and meta key,
  Virtual scroll, Drag and drop, Focus behavior, Empty messages, Invalid and
  fluid.
- **`@org/ui-kit` — minor, additive:** `baps-input-number` covers PrimeNG's
  InputNumber demo. `buttonLayout` (`stacked` default | `horizontal` |
  `vertical`) with `step` (fractional steps round to the step's precision):
  `horizontal` is PrimeNG's "Horizontal with Step" (minus, field, plus). New
  pass-through inputs: `minFractionDigits`, `locale`, `currency`,
  `currencyDisplay`, `prefix`, `suffix`, `inputStyle`, `readonly`,
  `invalid`, `fluid`, `variant`, `showClear` (clearing reports null),
  `allowEmpty`, `format`, `inputId`, `ariaLabel`, `ariaLabelledBy`,
  `tabindex`, `autofocus`. Stories and docs for every demo section: Buttons,
  Vertical, Numerals, Locale, Currency, Prefix and suffix, Clear icon, Sizes,
  Fluid, Filled, Invalid, Readonly.
- **`@org/ui-kit` — minor, additive:** `baps-link` `variant` gains `info`,
  `success`, `warning` and `error` (Figma 178:8538): the status colour at rest,
  underlined on hover. Primary and Secondary are unchanged.
- **`@org/ui-kit` — minor, additive:** `baps-priority` (`BapsPriority`,
  `BapsPriorityLevel`), the High / Medium / Low / None mark (Figma 5959:99251).
  Set `interactive` to show the hover state, a filled square.
- **`@org/ui-kit` — minor, additive:** `baps-icon` adds Figma's Chevron set
  (5098:23753): `down`, `up`, `left`, `right`, `double-*`, `switch` and `dash`.
  It also accepts the Figma names `mail`, `mail-opened`, `mail-unread`,
  `mailbox`, `like`, `list`, `search` and `users` as aliases
  (`BAPS_ICON_ALIASES`) of the sheet's stored names.
- **`@org/ui-kit` — minor, additive:** `baps-menu-item` `shortcut` input (Figma
  Base Shortcut 702:9079), plus `[menu-item-leading]` and
  `[menu-item-trailing]` projection slots for a status dot, badge, switch,
  count, chevron or action icon.
- **`@org/ui-kit/styles` — minor, additive:** `.baps-input-shell` (Figma
  6333:66494 / 561:3587): one bordered field holding an input plus an icon,
  avatar, chevron, action icon, switch segment, attached button or badge.
  Story: Form Controls › Sampark Input Shell.
- **Docs:** a landing page at `landing/index.html` that opens first; a bare
  Storybook visit redirects there and "Get started" leads into the docs (also
  when the file is opened from disk). Editorial "studio" layout: a scroll
  story builds the system on one canvas in seven stages (tokens, components,
  patterns, a live screen, the chosen brand, dark mode, the Sampark Portal
  before/after), then setup per stack (Angular, React, Next.js, HTML), a
  custom-theme picker whose live screen redraws through `withAccent`, the
  six apps and milestones. No component on it is drawn by hand: the
  components and patterns stages run the kit's Theme Preview and CRUD form
  stories live, and a component gallery lists every `Components/*` story
  from Storybook's index (all use cases, filtered to the chosen brand).
  Each canvas stage first shows a captured still of its live screen
  (`tools/capture-landing-stills.mjs`, 18 JPEGs, ~1.2 MB in all) and fades
  the live story in over it; live screens boot one after another instead of
  three at once, so the screen on the canvas is never a loading placeholder.
  A booted live screen switches story, brand and accent in place through
  Storybook's preview API instead of reloading, so a theme-swatch or gallery
  click redraws in under a second rather than booting Angular again; the
  theme box and gallery start booting a screen ahead of the viewport.
  Kit tokens throughout; its three fonts are a page-only exception recorded in
  `.agents/BRAIN.md`. Docs only; no package change.
- **Docs:** `docs/FIGMA-COMPONENT-LIBRARY-COVERAGE.md` maps every set in the
  Figma file to the kit.
- **`@org/ui-kit` — minor, additive:** `baps-editor` (`BapsEditor`), a
  rich-text field wrapping PrimeNG Editor (Figma 585:4268, Richtext Bar
  585:5287). One bordered field holds the text, an optional "n / max" count and
  the formatting bar. The bar comes in two forms, `toolbar="default" | "compact"`,
  and its attach button emits `attach`. The editor is a ControlValueAccessor
  whose value is HTML, and its states come from the input skin. Angular only.
- **Dependency — minor:** `quill` `2.0.3` added to the workspace and declared
  as an **optional** peer of `@org/ui-kit` (`^2.0.3`), needed only by
  `baps-editor`. Compatibility matrix updated.
- **`@org/ui-kit` — minor, additive:** `baps-button` `iconSize` input
  (`BapsIconSize | number`). Overrides the glyph ramp; unset keeps it. For
  SPM dev's list toolbar Filter/Sort, 32px buttons with a 20px glyph (T-02).
  Story: Button › Sampark Toolbar Icon Size.
- **`@org/ui-kit` — minor, additive:** `bapsTooltip` `tooltipAlign`
  (`'start' | 'center' | 'end'`, default `'center'`). With `tooltipPosition`
  it covers Figma's 12 beak types (653:7324). With `start` or `end` the arrow
  sits 12px from that edge and still points at the host's centre. The shift
  is CSS only (`baps-tooltip-align-*`), so it works at any tooltip width.
- **`@org/ui-kit/styles` — minor, additive (Sampark):** bottom sheet: a
  `baps-drawer` with `position="bottom"` and `styleClass="baps-drawer-sheet"`
  (Figma 7776:96792). It has 32px top corners, a 48×4 handle, a 20px header
  inset, and footer actions that share the width. Story: Drawer › Sampark
  Bottom Sheet.
- **`@org/ui-kit/styles` — minor, additive (Sampark):** table cell-type classes
  for the `<td>` (Figma 5599:1692): `baps-table-cell-num` (amount, right-aligned),
  `-center` (checkbox, toggle, priority, avatar), `-input` (8px 4px field cell)
  and `-end` (row actions), with compact-density variants. Stories: Table ›
  Cell Types and Cell Types Compact.
- **`@org/ui-kit` — minor, additive (Sampark default):** `baps-select`
  `autoOptionFocus` input, as on `baps-multi-select`. Unset, it is on for
  Sampark and off for MyBKY: SPM dev opens an empty Select with its first row
  tinted (parity T-32). MyBKY is unchanged.
- **`@org/ui-kit/styles` — patch (Sampark):** Select lists get 4px above and
  below like MultiSelect (T-19/T-27/T-32); a checked MultiSelect row stays
  400 (T-20); the "No results" message is Mono/60 with 16px padding (T-21); a
  MultiSelect with no options hides its "Select All" row (T-25). As SPM dev.
- **`@org/ui-kit` — patch (Sampark):** a disabled `baps-checkbox` label keeps
  full opacity (PrimeNG's `.p-disabled` dimmed it to 0.38); only the box dims,
  as SPM dev (parity T-08).
- **`@org/ui-kit` — minor, additive:** `baps-input-otp` (`BapsInputOtp`), a
  one-time-code field wrapping PrimeNG `p-inputotp`. It supports 4 or 6 digits,
  and a 6-digit code is split 3-3 with a "-" as in Figma "🟢 Component Library"
  754:4740. Each box is a `pInputText`, so the brand input skin draws every
  state. Implemented as a ControlValueAccessor. Angular only; no React port yet.
- **`@org/ui-kit` — minor, additive:** `baps-progressbar` `labelLayout`
  (`'compact' | 'detailed'`) and `label`. These are the two Figma types (754:10530):
  a 4px bar with its label outside, either to the right in a 40px column or
  under the bar and right-aligned. The label defaults to the rounded value.
  When `labelLayout` is unset the bar is unchanged. Angular only for now.
- **`@org/ui-kit/styles` — minor, additive:** `.field--horizontal` layout
  (Figma 6304:53807): the label sits in a 150px column beside a single
  underlined `.field__control` row. The row can hold an optional `.field__icon`,
  `.field__actions` with a `.field__divider`, and an `.input-char-count`. It
  ships in the input stylesheet. Existing `.field` markup is unchanged. Story:
  Form Controls › Sampark Horizontal.
- **Docs:** pattern Patterns › Date filter (Figma 10069:3032). A condition
  select and read-only date fields above an inline calendar; *in between*
  switches to a two-month range. It is a composition only, with no new API.
- **`@org/ui-kit` — minor, additive:** `provideBapsBrand(brand)`, `BAPS_BRAND`,
  `injectBapsBrand()` and the `BapsBrand` type. One provider sets the default
  `brand` for every kit component and directive (54), so a Sampark app no longer
  needs `brand="sampark"` on each tag. An explicit `brand` input still wins; with
  no provider the default stays `'mybky'`, so existing apps are unchanged. Note:
  `brand` defaults now come from `inject()`, so a kit component constructed with
  `new` outside an injection context throws (affects tests only).
- **`@org/tokens` — minor, additive:** `--shadow-sampark-checkbox-hover` (0 0 0 2px #f2f1f0),
  SPM dev's hovered panel checkbox (user-approved 2026-11-18).
- **`@org/ui-kit` — minor, additive (Sampark):** `baps-internal-navbar` collapsed
  Sampark rail opens a parent's `children` in a flyout beside the tile (click;
  outside click / Escape close), as the live SPM Portal's slim-plus menu: 240px
  panel, 40px rows, current page bold on Secondary/60 (spm AT-103). Story
  SamparkRailFlyout.
- **`@org/ui-kit` — minor, additive (Sampark):** `baps-internal-navbar` `compact`: the
  live SPM Portal rail (80px, 72px tiles 4px from the edges, full column height)
  instead of Figma's 104px frame. Default unchanged (spm AT-103). Story
  SamparkRailCompact.
- **`@org/ui-kit` — minor, additive:** `baps-navbar` `fixed` (position fixed, top 0,
  full width, z-index 999, as spm-ui's `.layout-topbar`) and `menuButton="mobile"`
  (chevron below 768px only). Defaults unchanged (spm AT-103). Story
  SamparkFixedShell.
- **`@org/ui-kit` — minor, additive:** `autofocus` input (default false) on `baps-select`,
  `baps-multi-select`, `baps-tree-select` and `baps-datepicker`; the paginator's
  rows-per-page select passes false. PrimeNG 21 left a DOM `autofocus` attribute
  whenever its input was undefined.
- **`@org/ui-kit` — minor, additive:** `actionsAlign="center-auto"` on `baps-dialog` and
  `baps-confirm-dialog`: centred actions at intrinsic widths, 16px apart (SPM dev
  confirm dialogs, spm AT-098). Default unchanged.
- **`@org/ui-kit` — minor, additive (Sampark):** `baps-table` `styleClass="baps-table-form"`
  pads cells whose direct child is a select-family field 8px 4px, as SPM dev's
  Template Project Owner table (AT-082). Story SamparkFormDensity.
- **`@org/tokens` — minor, additive:** `--overlay-list-sampark-disabled-opacity` (0.6),
  SPM dev's locked MultiSelect option (user-approved 2026-11-18).
- **`@org/ui-kit` — minor, additive:** `baps-multi-select` `autoOptionFocus`. Unset, it is
  on for Sampark (SPM dev opens with the first enabled row focused) and off for
  MyBKY (unchanged).
- **`@org/tokens` — minor, additive:** `--overlay-list-sampark-selected-hover-background`
  (#f8e5e5) and `--input-group-sampark-addon-font-size` (13px), both measured on
  SPM dev and approved by the user (2026-11-18).
- **`@org/ui-kit` — minor, additive:** `showHeader` on `baps-dialog` and
  `baps-confirm-dialog` (PrimeNG `showHeader`), default true. False drops the title
  bar for a dialog whose body draws its own heading (spm AT-098).
- **`@org/ui-kit` — minor, additive:** `baps-datepicker` `shown` output (PrimeNG
  `onShow`), a read-only `datePicker` handle on the inner PrimeNG DatePicker, and
  `keepInvalid` (PrimeNG default off). Defaults unchanged (spm AT-081).
- **`@org/ui-kit` — minor, additive:** `baps-datepicker` `defaultDate`, passed to
  PrimeNG (the month an empty picker opens on); default undefined (spm AT-068).
- **`@org/ui-kit` — minor, additive:** `baps-datepicker` forwards PrimeNG
  `pTemplate` slots (`inputicon` with `clickCallBack`, `date`, `disabledDate`,
  `decade`, `header`, `footer`, `triggericon`, `clearicon`) like `baps-select`;
  defaults unchanged (spm AT-063).
- **`@org/ui-kit` — minor, additive:** `baps-confirm-dialog` `source="primeng"`
  (opt-in; default `baps` unchanged) listens to PrimeNG's `ConfirmationService`, and
  `header` / `message` / `footer` `pTemplate` slots are forwarded (footer context
  also carries `accept` and `reject`) (spm AT-026).
- **`@org/ui-kit` — minor, additive:** `baps-button` `type` (`button` default,
  `submit`, `reset`) so a kit button can submit its form (spm AT-060).
- **`@org/ui-kit` — minor, additive:** `baps-datepicker` `timeOnly`, `showTime`,
  `hourFormat` and `hideOnDateTimeSelect` (PrimeNG defaults) (spm AT-059).
- **`@org/ui-kit` — minor, additive:** `baps-button` `styleClass`, passed to
  the inner `.p-button` (spm-ui's 28px image buttons size `.p-button` through it)
  (spm AT-014).
- **`@org/ui-kit` — minor, additive:** `baps-tree-select` `bare`: the trigger
  shows only the consumer's `pTemplate="value"` (no border, fill, padding or
  dropdown icon), for a self-drawn trigger such as spm-ui's globe pill. Default
  off (spm AT-047).
- **`@org/ui-kit` — minor, additive:** `baps-input-number` `clampOn`
  (`input` default, unchanged; `blur` keeps a typed out-of-range value until the
  field loses focus, as raw PrimeNG does, so a form validator can report it)
  (spm AT-051).
- **`@org/ui-kit` — minor, additive:** `baps-tree-select` `panelHide` output
  (PrimeNG's `onHide`), so a consumer can reset its expand state when the panel
  closes (spm AT-047).
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

- **Dialog / Listbox — the production build compiles again.** `ng-packagr`'s strict templates rejected two optional inputs bound straight through: Dialog `position` (now defaults to `center`, PrimeNG's own, instead of passing `undefined` over it) and Listbox `filterValue`. Found when packing for spm; `nx run ui-kit:compile:production` passes.
- **Drawer (Sampark) — an open list inside it no longer drops the drawer under the app chrome.** 99bac99 set the drawer to `z-index: auto` while a select / multiselect / treeselect inside it was open, so it would grey with the page as on SPM dev. That took the body-level drawer out of the stacking order: spm's top bar and the table's sticky header and action cells painted over the open Templates Filters drawer, and in Storybook a click on the drawer header landed on its mask. The drawer now sits one under the scrim (`--overlay-backdrop-z-index` - 1; 2999 in spm, under its 3000 scrim) and its own `::after` stands in for the 0.32 mask it used to sit under, so it still greys like dev. Measured in Storybook FilterPanel with the spm scrim layer: drawer 2999, header click lands on the drawer, list 3001 and clickable, `::after` rgba(0,0,0,0.32). Dialogs keep the 99bac99 behaviour (they render inside their mask).
- **Stepper (Sampark) — the current and hovered step grow, with MyBKY's motion.** Sampark kept one slot size and 150ms transitions, so the lift read as a jump and the current step was no bigger than the rest. The current step is now 2.8rem (32px x MyBKY's 1.4 ratio, 45px measured) and a hovered step scales 1.4 to the same size; Sampark drops its motion overrides and takes MyBKY's 0.8s. Measured in Storybook, hover on the last step: 32 to 37 to 43 to 45px at 0/200/400/900ms, lifting 0 to 41.6px over the same time, matching MyBKY's curve (40 to 56px). MyBKY unchanged.
- **Stepper (Sampark) — the active and hovered step no longer vanish.** The rail lifts the current and the hovered step 41.6px, as MyBKY does, but Sampark gave them a transparent fill with the white inverse glyph, so on the page they disappeared and only the badge dot was left (measured in Storybook, Default and States). Sampark active, in-progress and hovered steps now take Sampark's existing active-step look from the raw `p-stepper` rule: white circle, 1px `#c96868` ring and glyph. Lift and label reveal stay shared with MyBKY; MyBKY unchanged (hover still scales 1.4 to 56px). Raw numbered stepper unchanged in both brands.
- **Docs pages — the dialog and drawer backdrop no longer vanishes after opening.** A MutationObserver in the Storybook preview set every body-level mask to an inline `background: transparent` on Docs pages; PrimeNG's fade-in keyframes beat it while they ran, so the backdrop appeared and then disappeared (measured on the Dialog docs page: 0.32 at 300ms, transparent at 400ms). The observer is gone: Dialog and Drawer docs now keep `rgba(0,0,0,0.32)` while open, both brands, with the panel above it (a click at the panel lands on the panel), and the mask clears on close (0 masks after two open/close cycles). Storybook only; the kit and the apps were not affected.
- **Drawer — every position now gets its brand skin.** Measured in Storybook (Playground, Positions left/right/top/bottom, docs page), both brands: the panel carried `baps-drawer-undefined`, so neither skin matched and every drawer was PrimeNG's bare 320px panel with the title pushed right and the close button mid-header. Cause: `[brand]="brand"` bound to nothing passed `undefined`, which replaced the injected default; `brand` now keeps the default for `undefined`. Two leaks that showed once the skin applied: on a Sampark page the MyBKY `!important` margins and 32px corners still won (panel 12px off the edge), now scoped with `:not(.baps-ds-sampark *)`; and a MyBKY drawer kept its empty footer (24px padding + 24px gap), which left a top/bottom drawer's content 0px tall, now hidden on `:empty` as in Sampark. After: Sampark 500px flush panel, 16px inner corners, title 20px left, close 32px radius 4 right, content 12/32/32px, in all four positions; MyBKY floats 12px with 32px corners, title left, close right, top/bottom content 40px.
- **`@org/tokens` + `@org/ui-kit/styles` — patch, visual (Sampark):** drawer
  and dialog mask is `rgba(0,0,0,0.32)`, SPM dev's computed value (was
  Mono/100 at 45%). A drawer or dialog holding an open select / multiselect /
  tree-select is no longer lifted above the page scrim: it greys with the page
  and only the open list stays lit, as SPM dev (Templates Sort > "then by").
  This reverses the 2026-11-19 "keep the drawer clear" rule (user call
  2026-11-27).
- **`@org/ui-kit/styles` — patch, visual (Sampark):** every input group is
  drawn per part, as SPM dev: label addons (Min | 1, Max | 100) too, not only
  control groups. The field carries a full 1px border and the addons the three
  sides away from it; hover and focus light the field alone. Before, label
  groups kept one ring round the whole group, which lit as a unit. A bare
  `pInputText` field no longer loses its border on hover. MyBKY unchanged.
- **`@org/ui-kit/styles` — patch, visual (Sampark):** input groups with a
  control addon (`[input-group-control]`: number | unit select, time | AM/PM)
  behave like SPM dev. Hovering or focusing the input lights only that input
  (border #94928f, 3px #f2f1f0 focus ring), not the whole group; the select or
  button segment never changes. Hovering the unit select no longer draws a
  dark box round it (the Sampark select hover rule beat the segment's
  `border: 0`). Label-addon groups (Min | 1) keep the group ring.
- **Docs:** an open dropdown, tree-select or date panel inside a Docs canvas
  is no longer greyed out by the page scrim. Storybook's zoom wrapper always
  carries `transform: scale(1)`, which trapped inline panels under the
  `body::before` backdrop (TreeSelect docs, 3 examples, both brands); while a
  panel is open its story is lifted above the scrim. Sweep of all 63
  component/pattern Docs pages: 0 dimmed panels.
- **Docs (Drawer):** the Docs page no longer freezes. The bottom-sheet story
  started open (`open: true`, against the file's own rule) and the page's text
  controls locked the main thread; the story now starts closed and the Docs
  Controls leave out the three text controls (root cause of the freeze not
  found; noted in drawer.mdx).
- **Docs (patterns):** the CRUD form, data-management and date-filter
  patterns open their `baps-select` panels on `<body>` (`appendTo="body"`, as
  spm-ui does). Rendered inline, a panel inside the docs canvas sat in that
  canvas's stacking context, under the Sampark page scrim, so the open list was
  dimmed with the page.
- **`@org/ui-kit/styles` — patch, visual (both brands):** `baps-tree-table`
  sizes columns to their content (`table-layout: auto`, as `baps-table`) and a
  table wider than its box scrolls inside it. PrimeNG's tree-table default is
  `fixed`, so one width-pinned column took everything and the rest got 63px:
  headers ran into each other ("ProviderCurrency"), "Updated by" climbed over
  "Status", names broke in two, a tag spilled out. Header titles no longer
  wrap. The docs no longer pin Location to 26rem. Scrollable mode unchanged.
- **`@org/ui-kit/styles` — patch, visual:** MyBKY text inputs and selects
  now take their hover/focus stroke and focus ring from the preset's primary
  ramp (`--p-primary-400` / `--p-primary-600`), so a `withAccent()` primary
  reaches them; they stayed blue under any accent. Default values are
  unchanged (#9fadd9, rgba(95,120,184,.35)). Also: a required field that is
  still pristine and untouched (`ng-invalid` but no error shown) now gets its
  hover and focus states; before, it got neither.
- **Docs:** Components overview drops the avatar `_DocsAnchor` helper and
  stories whose name pins the other brand. Rows are now separate cards,
  three to a row with an even gap, on a wider page (the old track overflowed
  the 900px docs column into the table of contents). Each card's name sits
  under its preview at all times, Copy prompt appears on hover over the end
  of that row, stills sit on white with the story's own inset, and cards
  without a still (Sampark, dark) show a "Hover to preview" plate instead of
  a bare grey box.
- **`@org/ui-kit/styles` — patch, visual:** the HTML/CSS avatar
  (`.baps-avatar-html`) without a status modifier now looks and hovers like
  `<baps-avatar>`'s default primary: MyBKY 1px #9fadd9 border, hover #5f78b8
  plus the lift shadow (it had no border, so its hover showed nothing).
  Sampark's hover colour no longer falls back to MyBKY blue, and a photo avatar
  renders without border or fill in both brands, as `baps-avatar` does.
- **`@org/ui-kit/styles` — patch, visual (both brands):** hover states as
  PrimeNG has them, on three parts that had none. Accordion header, input-number
  spinner buttons and the file-upload button (under a zone hover; the button is
  inert) now take one neutral step darker: MyBKY #e4ecf1 (`mono-300`), Sampark
  #f3f2f2 (`mono-20`), the secondary button's hover surface. Existing tokens
  only; dark mode keeps the resting fill (no darker dark-ramp token yet).
- **`@org/ui-kit/styles` — patch:** `baps-tree-table`'s expand/collapse button
  shows its hover background (MyBKY #eef0f8, Sampark #f8f7f7, the row-hover
  tokens). The button reset (no border, transparent background) moved from an
  inline style in the story into the stylesheet: the inline `background:none`
  beat the hover rule, so the toggler never reacted, and the React tree-table,
  which has no inline style, drew the browser's grey button.
- **`@org/ui-kit` — patch:** the 12 form-control wrappers (checkbox, radio,
  select, multi-select, datepicker, tree-select, slider, toggle-switch,
  segmented, listbox, chips-input, input-number) repaint a value written from
  code. In a zone app with an OnPush host, `setValue`/`patchValue` from an
  async callback left the inner PrimeNG control on the old value (spm-ui has
  54 OnPush components). `writeValue`/`setDisabledState` now mark the wrapper
  for check. `cva-repaint.spec.ts` runs with zone change detection: 12/12 fail
  without the fix, 12/12 pass with it.
- **`@org/ui-kit/styles` — patch, visual (MyBKY):** `baps-iconfield`'s icon
  sits centred in apps that load the shipped stylesheet. PrimeNG's negative
  `margin-top` and the kit's `translateY(-50%)` both centred it, lifting it
  8px (measured with the packed `index.css`: -8px, now 0). Storybook does not
  load `_form-field.scss`, so it always looked centred there. Sampark already
  reset this.
- **`@org/ui-kit` — patch:** `baps-toggleswitch` marks its form control
  `touched` when the user toggles it. The registered callback was never
  called, so validation gated on `touched` never showed. A value written by the
  form still leaves it untouched.
- **`@org/ui-kit` — patch:** `baps-datepicker`'s button-bar Clear now clears
  the form value. PrimeNG emits `onClearClick` for it, not `onClear` (the
  input's x icon), and the wrapper only listened to `onClear`, so the form kept
  the old date. Spec covers it.
- **`@org/ui-kit/styles` — patch (Sampark):** a collapsed accordion panel no
  longer scrolls its container. PrimeNG 21 keeps the collapsed body in the DOM
  (0px grid row, visibility hidden) with nothing clipping it, so in SPM's
  Filters drawer two sections gave .cf-content 176px of content in 72px and a
  scrollbar. Collapsed panels now clip; open panels keep visible overflow.
  Story: Accordion › Sampark Collapsed In Scroller (play test).
- **`@org/ui-kit/styles` — patch (Sampark):** datepicker today marker is a
  solid primary fill with white text, as SPM dev (T-28). The old rule keyed
  `.p-datepicker-day.p-datepicker-today`, but PrimeNG 21 puts the today class
  on the <td>, so it never matched and today showed PrimeNG slate #e2e8f0.
  Story: DatePicker › Sampark Today. MyBKY rules untouched.
- **`@org/ui-kit` — minor, additive (Sampark):** a table `emptymessage` row
  with `class="baps-table-empty"` (or `p-datatable-empty-message`) fills the
  scroll viewport under the header and centres its content, as SPM dev's
  Projects list, Sampark dashboard and Project detail. Needs a container with
  a height; tables without the class, or without a height, are unchanged.
  Story: Table / Sampark Empty Fills Body.
- **`@org/ui-kit` — patch (Sampark):** MultiSelect panel footer has 8px padding
  and a 1px top rule, and the list 4px block padding, as SPM dev (parity T-12).
- **`@org/ui-kit` — patch:** `baps-table-column-config` styles are scoped to
  its `.ct-cfg` root (header actions and divider excepted). Unscoped, they hit
  any app markup reusing the `ct-cfg-*` class names: spm's own column panel
  took the pin-button padding and its rows grew 41 to 49 (parity T-13).
- **`@org/ui-kit` — patch (Sampark):** two-month DatePicker lays the months
  edge to edge as SPM dev (232px groups, 32px cells, title buttons 4px
  padding; panel 514 to 472, dev 475; parity T-28), and the toast detail text
  uses the toast text token instead of PrimeNG's slate #334155.
- **`@org/ui-kit` — patch (Sampark):** horizontal divider block margin is 2px
  (`--space-0-5`), as SPM dev's global divider rule; was the MyBKY 16px.
- **`@org/ui-kit` — patch (Sampark):** select / multiselect / treeselect
  panels open 10px below the field (`--space-2-5`), as SPM dev; was 6px (parity T-17).
- **`@org/ui-kit` — patch (Sampark):** drawer close button is Mono/100 in a
  4px-radius box, and the accordion count cell has the header's left corners
  and 8px side padding, as SPM dev (parity T-09, T-10).
- **`@org/ui-kit` — patch (Sampark):** accordion chevrons are PrimeNG's pair
  again (down closed, up open), as SPM dev renders them; the 2026-11-19
  rotation (right / down) was wrong. `baps-table-form` rows keep their form
  density: the 56px body-row floor no longer applies to them (parity T-07, T-14).
- **`@org/ui-kit` — patch (Sampark):** a horizontal `baps-divider` spans its
  flex column again; the header-separator rule (display flex, align-self
  center) now applies to `layout="vertical"` only. Host writes `data-layout`.
- **`@org/ui-kit` — patch (Sampark):** a field inside `baps-input-group` no
  longer paints its own hover/focus border; the group's ring is the only one
  (spm showed a box inside the box on focus).
- **`@org/ui-kit` — patch (Sampark):** select / multiselect clear (×) icon is
  Sampark text-primary, not MyBKY Mono/900 (`--input-clear-btn-color`), as SPM dev.
- **`@org/ui-kit` — patch:** `baps-input-number` shows a written form value
  as is (raw PrimeNG behaviour); it clamped to min on write, so a saved 0 in a
  min-1 field displayed 1 while the form held 0. A Sampark `w-auto`
  `baps-input-group` sizes to its content instead of stretching in a flex
  column (align-self, as primeflex `.w-auto` forces width auto).
- **`@org/ui-kit` — minor:** `baps-input-group` gains an `input-group-control`
  slot for a control addon (a unit `baps-select`, or a button such as an AM/PM
  toggle) after the field: one ring, inner hairline, addon tint, 13px/500 label
  (AT-080, SPM dev Template form). A datepicker as the field is chromeless; a
  Sampark time-only one is 104px (dev). `baps-datepicker` marks its host
  `baps-datepicker-time-only`. Story SamparkControlAddons.
- **`@org/ui-kit` — minor (Sampark):** `baps-checkbox` gains
  `labelTone: 'default' | 'muted'`; muted is SPM dev's Template-form label
  (Mono/80, 500). A disabled Sampark label now keeps the primary ink, as dev's
  filter panels (was Mono/80, which was the form tone mistaken for disabled).
- **`@org/ui-kit` — patch:** `baps-paginator` clips vertical overflow; its
  `overflow-x: auto` had turned a 30px rows-per-page label into a 15px
  vertical scrollbar that pushed the controls 19px off the right edge.
  Sampark spacing as SPM dev: 10px report→prev and next→rows, rows flush right.
- **`@org/ui-kit` — patch (Sampark):** a disabled icon-only secondary ghost
  `baps-button` is its Mono/100 glyph at 0.6 (SPM dev row actions,
  pixel-measured glyph weight 5719 vs dev 5770), not Mono/40 at full opacity; labelled and primary ghost buttons are unchanged.
- **`@org/ui-kit` — patch (Sampark):** an icon-only `size="small"` Sampark
  `baps-button` draws an 18px glyph (was 16), as SPM dev's 28px row actions;
  labelled small buttons and MyBKY keep 16. Story SamparkRowActions.
- **`@org/ui-kit` — patch (Sampark):** a Select, MultiSelect or TreeSelect
  opened inside a drawer or dialog no longer greys the drawer out: the drawer
  (and a dialog's mask) is raised to 3001 above the 3000 page scrim and its
  local dim is off; the list panel stays on top. Replaces the rule that sent
  the drawer under the scrim to copy SPM dev (user decision 2026-11-19).
- **`@org/ui-kit` — patch (Sampark):** `baps-table` body rows are 56px by
  height, not only by padding (SPM dev `td { height: 56px }`); a two-line cell
  rowed at 54.8. Compact (`size="small"`) is untouched.
- **`@org/ui-kit` — patch (Sampark):** accordion matches the SPM dev filter
  drawer: closed sections show chevron-right and open ones chevron-down, a 0
  count sits on Mono/alpha4 (`.baps-accordion-count--zero`), and an open body
  has no bottom padding, so the 8px accordion gap is the only space before the
  next header (was 16).
- **`@org/tokens` — patch (Sampark):** `toolbar.sampark.searchWidth` is 25rem
  (400px), the width SPM dev renders the Templates/Projects toolbar search at
  (was 16rem). `baps-toolbar` gains a SamparkListPage story mirroring that bar.
- **`@org/ui-kit` — patch (Sampark):** the DatePicker popup is SPM dev's compact
  calendar: 4px panel/header padding, 28px day cells, 28px round nav buttons,
  20px weekday row, 500 title (spm AT-085). Nav buttons and the title row also
  drop their 32px min-height, so the nav is 28x28 and the header 36.
- **`@org/ui-kit` — patch (Sampark):** `baps-checkbox` resting border is Mono/60, and a
  disabled box keeps its enabled look (white; checked: primary outline and tick)
  dimmed to 0.6, as on SPM dev, instead of the grey fill (spm AT-095).
- **`@org/ui-kit` — patch (Sampark):** PrimeNG's own checkboxes and radios (panel
  Select All / options) draw no Material hover or focus halo, as on SPM dev.
- **`@org/ui-kit` — patch (Sampark):** a Select in `baps-navbar`'s end slot renders as
  plain text on the bar (no box, fill or chevron in any state), as SPM dev's
  position switcher (spm AT-103).
- **`@org/ui-kit` — patch (Sampark):** a focused table header cell draws the
  Sampark focus ring (1px primary, inset 2px) instead of the browser default.
- **`@org/ui-kit` — patch (Sampark):** a danger button (`severity="danger"` or
  `p-button-danger`) is the primary maroon, as on SPM dev, not Material red.
- **`@org/ui-kit` — patch (Sampark):** a MultiSelect panel's search field has no
  search icon and 6px/8px padding, as on SPM dev (same as the Select filter).
- **`@org/ui-kit` — patch (Sampark):** the default vertical `baps-divider` has no
  margin or padding and a 20px rule, so a row's gap spaces it, as SPM dev's
  header separator (was a 24px box with MyBKY margins, 24px gaps). Compact
  unchanged (spm AT-084).
- **`@org/ui-kit` — patch (Sampark):** a MultiSelect chip's remove icon is the SPM
  dev 14px box with a 10px cross in #979493 (was 14x16 in MyBKY slate).
- **`@org/ui-kit` — patch (Sampark):** a locked (disabled) MultiSelect option is
  dimmed to 0.6, as on SPM dev.
- **`@org/ui-kit` — patch (Sampark):** the `Sampark` preset draws a keyboard focus
  ring (1px solid primary, 2px offset, as on SPM dev). It inherited Material's
  `focusRing` of width 0 / style none, so focused buttons showed no outline.
  A secondary/text button rings in the primary too (Material used slate).
- **`@org/ui-kit` — patch (both brands):** `baps-drawer` removes PrimeNG's body
  mask when it is destroyed. PrimeNG 21 only did that while still visible, so a
  drawer unmounted on close (`@if (open)`) left its mask on the page, dimming it
  and blocking clicks (spm Filters).
- **`@org/ui-kit` — patch (Sampark):** a selected Select row tints #f8e5e5 on
  hover, and a `baps-input-group` addon label is 13px, as on SPM dev (spm AT-096,
  AT-093).
- **`@org/ui-kit` — patch (both brands):** `baps-button` no longer carries a DOM
  `autofocus` attribute. PrimeNG 21 set `autofocus="true"` on every button
  (`false || undefined` reached its AutoFocus directive), so the browser focused
  the first button of each new page and flashed its focus ring (spm Templates
  filter button). `autofocus` input unchanged.
- **`@org/ui-kit` — patch (Sampark):** a drawer whose MultiSelect panel is on
  <body> stays under the scrim, as on SPM dev. PrimeNG 21 marks the MultiSelect
  `.p-overlay-open`, so an app rule raising `.p-drawer:has(.p-overlay-open)` lifted
  the drawer above the scrim and clicks inside it reached its controls (spm AT-076).
- **`@org/ui-kit` — patch (both brands):** `baps-drawer` closes on the first mask
  click. PrimeNG's mask listener can run with no change detection after it, so
  under an OnPush consumer the mask faded while the panel stayed open until a
  second click; the wrapper now pushes the new `visible` into `p-drawer` at once
  (spm AT-076).
- **`@org/ui-kit` — patch (Sampark):** with a Select, MultiSelect or DatePicker
  popup appended to body, the scrim catches the outside click (z-index 3000,
  pointer-events auto) and the panel sits above it, so one click outside closes
  only the panel, as SPM dev already did for TreeSelect (spm AT-076 / AT-090).
- **`@org/ui-kit` — patch (Sampark):** the Select / TreeSelect clear icon box is
  18px, the SPM dev glyph size (was 14px, which squeezed a forwarded icon) (spm
  AT-096).
- **`@org/ui-kit` — patch (Sampark):** an input inside a bare PrimeNG
  `p-inputgroup` (not `baps-input-group`) keeps its own 1px Mono/borders frame and
  white fill at rest; it was chromeless with no group frame, as on SPM dev (spm
  AT-093).
- **`@org/ui-kit` — patch (Sampark):** a MultiSelect panel row shows the 4px
  accent bar on pointer hover, checked rows included, and a keyboard-focused row
  without hover is Mono/10 with no bar; a selected Select row keeps #151414 text
  and shows the bar on hover, as on SPM dev.
- **`@org/ui-kit` — patch (Sampark):** in a table cell the Select / TreeSelect clear
  icon is hidden at rest and shown on hover, focus or open, as on SPM dev (spm
  AT-096).
- **`@org/ui-kit` — patch (Sampark):** a filterable Select panel header is the SPM
  dev 49px Mono/20 strip with a 1px Mono/borders line, 8px padding and a search
  field with 6px/8px padding and no icon (spm AT-096).
- **`@org/ui-kit` — patch (Sampark):** in a table body cell a Select, MultiSelect or
  TreeSelect hides its chevron at rest and shows it on hover, focus or open; a
  disabled one never shows it, as on SPM dev (spm AT-097).
- **`@org/ui-kit` — patch (Sampark):** a disabled Select / MultiSelect with a value
  shows it in the primary text colour (#151414) and a disabled checkbox label
  reads text-secondary (#595656), as on SPM dev read-only screens; empty
  disabled fields keep the placeholder colour; MyBKY unchanged (spm AT-102).
- **`@org/ui-kit` — patch (Sampark):** a selected MultiSelect option keeps the
  primary text colour (#151414), as on SPM dev; the checkbox is the only
  selected cue (spm AT-094).
- **`@org/ui-kit` — patch (Sampark):** a checked checkbox in a MultiSelect or
  TreeSelect panel is outlined like SPM dev (white box, 1px primary border,
  primary tick) instead of the preset's filled box (spm AT-094).
- **`@org/ui-kit` — patch (Sampark):** the paginator report reads in the primary
  text colour (#151414) with 4px inline padding, as on SPM dev; MyBKY unchanged
  (spm AT-078).
- **`@org/ui-kit` — patch (Sampark):** checkboxes in MultiSelect and TreeSelect
  panels (Select All and options) draw the SPM dev box themselves: 16px, 1px
  Mono/60 border, 4px radius, white fill. Before, a consumer's legacy CSS drew
  them; without it they fell back to the 20px preset box (spm AT-094).
- **`@org/ui-kit` — patch (Sampark):** a chip multiselect centres its chips and
  "+N" chip vertically in the 32px field; the base top-alignment stays for MyBKY,
  where chips wrap and the field grows (spm AT-083).
- **`@org/ui-kit` — patch (Sampark):** an accordion panel no longer grows wider
  than its accordion: the collapsible wrapper, its p-motion, the content and the
  body (and the body's direct children) take `min-width: 0`, so a wide child such
  as a chip multiselect after Select All stays inside a drawer instead of making it
  scroll sideways (spm AT-074).
- **`@org/ui-kit` — patch:** `baps-confirm-dialog` renders forwarded `header` /
  `message` / `footer` templates only while a confirmation is active, as PrimeNG
  does. With none active, a template reading `message.imageSrc` threw on every
  change detection, and that stalled every PrimeNG overlay on the page (selects
  opened with an invisible panel) (spm AT-069, root cause of AT-064).
- **`@org/ui-kit` — patch:** `baps-select`, `baps-multi-select` and
  `baps-tree-select` mark their form control touched on blur, as PrimeNG does;
  before, a required select opened and left empty stayed untouched (spm AT-065).

- **`@org/ui-kit` — patch (Sampark):** an open `appendTo="body"` tree-select's scrim
  catches outside clicks at z-index 3000 like SPM dev (the panel's overlay is lifted
  to 3001), so an outside click only closes it. Inline panels and MyBKY keep the
  base pass-through scrim (spm AT-012).
- **`@org/ui-kit` — patch, visual (Sampark):** `baps-button` matches SPM dev:
  default-size label 14px and padding 8px 10px (`--space-2` / `--space-2-5`)
  whatever the host preset, and a disabled outlined button keeps a white fill.
  Before, the label and padding followed the host preset (16px, 0 12px in
  spm-ui). MyBKY unchanged (spm AT-050).
- **`@org/ui-kit` — patch:** `bapsTooltip` with `[appendTo]` bound to
  `undefined` attaches to `<body>` again. PrimeNG copied the undefined over its
  default and threw "Cannot append ... to undefined", so the tooltip never
  showed (the Storybook hover story regressed with 275fd17) (spm AT-053).
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
