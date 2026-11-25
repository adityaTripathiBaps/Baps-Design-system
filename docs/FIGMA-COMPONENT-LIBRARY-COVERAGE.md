# Figma "🟢 Component Library" coverage

This file maps every page and component set of the Sampark Figma file
[`PKHWEQTVUKl6FAeQSIkXMW`](https://www.figma.com/design/PKHWEQTVUKl6FAeQSIkXMW/)
to `@org/ui-kit`. It was last verified on 2026-11-25, by reading every
component set and variant axis through the Figma API, and by measuring the
new pieces in Storybook against Figma (geometry, not colour).

**Status:** every set below maps to a kit component, class or story. The four
known differences at the end were left on purpose.

| Figma page | Component set (node) | Kit | Story |
| --- | --- | --- | --- |
| Icon | BAPS Pixel Icons (151:219), 540 glyphs | `baps-icon`, `BAPS_ICONS` | Icon › Library |
| Icon | Chevron (5098:23753): down, up, left, right, double ×4, switch, dash | `baps-icon` names `down` … `dash` | Icon › Library |
| Icon | Sorter (5054:4286) | `baps-sort-icon` (table) | Table › Sortable Sticky Paginated |
| Icon | Priority (5959:99251): High, Medium, Low, None × Default/Hover | `baps-priority` (`level`, `interactive`) | Priority › Levels |
| Icon | Figma names stored differently (`mail`, `like`, `list`, `search`, `users`) | `BAPS_ICON_ALIASES` resolve in `baps-icon` | — |
| Button | Button (151:361): Primary, Secondary, Primary Ghost, Secondary Ghost × Default/Hover/Disable × S/M/L/XL | `baps-button` | Button › Sampark Variants / Sizes / States |
| Button | Split Button (548:366) | `baps-split-button` | Split Button › Matrix |
| Button | Action Icon, Action Icon Dark (178:9273, 9411:35289) | `baps-button` icon-only; `.baps-table-action`; navbar actions | Button › Sampark Icon Only, Navbar › Sampark |
| Button | Base Icon Badge Group (8076:149587) | `baps-indicator` on a button | Indicator › Icon Badge |
| Link | Link (178:8538): Primary, Secondary, Info, Success, Warning, Error × Default/Hover/Disable × S/L/XL | `baps-link` `variant`, `size`, `disabled` | Link › Variants / Sizes / Disabled |
| Badge | Badge, Badge Filled (178:7997, 9821:113502): 7 colours × states × S/M/L, chevron, trailing action | `baps-tag` | Tag › Full Matrix |
| Badge | Notification Counts, Status Dot, Icon Badge (324:15459, 7408:164250, 472:17411) | `baps-indicator` | Indicator › Notification Counts / Status Dot / Icon Badge |
| Tab | Tab (5054:3518): S/M/L × active × states | `bapsTabs` on `p-tabs` | Tabs › Sizes |
| Tabs Group | Web / Mobile Tabs Group (1180:4295, 8801:22825) | `bapsTabs` | Tabs › Default |
| Avatar | Avatar (483:17570): XS–2XL × Initial/Icon/Image × status | `baps-avatar` | Avatar › Sampark Variants / Sizes / Indicators |
| Avatar | Avatar Group (5346:6575) | `baps-avatargroup` | Avatar › Sampark Group Sizes |
| Input Text Field | Web / Mobile Input Text (561:3485, 7681:149082): all states incl. ghost | `bapsInputText` + Sampark input skin | Form Controls › Sampark States / Sizes |
| Input Text Field | Base Input Action (6333:66494): icon, avatar, chevron, switch, action icon, leading/trailing button | `.baps-input-shell` | Form Controls › Sampark Input Shell |
| Input Text Field | Base Input Text (561:3587): text, leading/trailing badge, badges | `.baps-input-shell` with `baps-tag`; several badges = MultiSelect chips | Form Controls › Sampark Input Shell; Multi Select › Chip Overflow |
| Horizontal Input Text Field | Horizontal Input (6304:53807) | `.field--horizontal` | Form Controls › Sampark Horizontal |
| Input Text Area | Web / Mobile Text Area (585:4268, 7689:175553) | `bapsTextarea` | Form Controls › Sampark Textarea |
| Input Text Area | Richtext Bar (585:5287): Default, Compact | `baps-editor` (`toolbar`) | Editor › Sampark States |
| Input Text Area | Web / Mobile File Upload (6269:1736, 7749:5408) | `baps-file-upload` | File Upload › States |
| Input OTP | Input OTP (754:4740, 7772:165802): 4/6 digits × states | `baps-input-otp` | Input OTP › Sampark States |
| Dropdown (Web) | Base Menu Item (702:8768): default/icon/checkbox/radio × states × danger; slots | `baps-menu-item` (+ `shortcut`, `[menu-item-leading]`, `[menu-item-trailing]`) | Menu Item › All Variants / Slots |
| Dropdown (Web) | Base Shortcut (702:9079) | `baps-menu-item` `shortcut` | Menu Item › Slots |
| Dropdown (Web) | Dropdown Menu (1149:32409) | `baps-menu` | Menu › Sampark |
| Dropdown (Web) | Users Dropdown, Base User Item (5350:8137, 730:24649) | `baps-users-dropdown` | Users Dropdown › Groups / Multi / Radio |
| Dropdown (Web) | Dropdown Hierarchy, Levels (1092:237408, 959:116757) | `baps-tree-select` | Tree Select › Checkbox |
| Bottom Sheet (Mob) | Bottom Sheet Menu / Hierarchy / Users (7776:96792 …) | `baps-drawer` `position="bottom"` `styleClass="baps-drawer-sheet"` | Drawer › Sampark Bottom Sheet |
| Breadcrumb | Breadcrumb, Base Path (702:7474) | `baps-breadcrumb` | Breadcrumb › Default |
| Checkbox & Radio | Checkbox (627:6998): S/L × states × indeterminate | `baps-checkbox`, `baps-radio` | Checkbox › Sampark, Radio › Sampark |
| Toggle Switch | Switch (653:7207): S/L × states | `baps-toggleswitch` | Toggle Switch › Sampark Sizes |
| Tooltip | Tooltips (653:7324): 12 beak types | `bapsTooltip` `tooltipPosition` + `tooltipAlign` | Tooltip › Arrow Alignments |
| Divider | Divider (702:19940): H/V × text | `baps-divider` | Divider › Default |
| Alert & Notifications | Alert & Notification (754:9746): Default, Avatar, Success, Error | `baps-alert`, `baps-toast` | Alert › Sampark |
| Progress Bar | Progress bar (754:10530): Compact, Detailed × 0–100 % | `baps-progressbar` `labelLayout` | Progress Bar › Label Layouts |
| Slider | Slider (1180:36603): one/two handles | `baps-slider` `range` | Slider › Range |
| Pagination | Pagination, Page No. (3023:17318): Default, Compact | `baps-paginator` | Pagination › Default / Compact |
| Table | Table Header (5098:20182): sorting none/single/multi | `baps-table`, `baps-table-sort-config` | Table › Sortable Sticky Paginated |
| Table | Secondary Table Cell (5599:1692): 12 cell types × compact | `baps-table-cell-num/-center/-input/-end` | Table › Cell Types / Cell Types Compact |
| Table | Lead Table Cell, Base Table Levels (5968:104700, 5308:12050) | `baps-table-cell-lead`, level tree | Table › Tree Levels |
| Table | Badge / Link / Action groups (5540:…) | `baps-tag`, `baps-link`, `.baps-table-action` | Table › Cell Types |
| Table | Expand All (10010:107640) | `baps-icon` `double-down` / `double-up` | — |
| Nav Bar | Web / Mobile Nav Bar, Main / Sub Nav Bar (3023:11376 …) | `baps-navbar` | Navbar › Sampark / Sampark Mobile |
| Nav Bar | Internal Menu Item, Levels 1–6 (9695:26762) | `baps-internal-navbar` | Internal Navbar › Sampark Rail / Nested |
| Calendar | Dates, Calendar (10069:3032): single, range, condition dropdown | `baps-datepicker`; Patterns › Date filter | Date Picker › Range; Patterns › Date filter |

## Known differences, left on purpose

| Difference | Why | Where recorded |
| --- | --- | --- |
| The default Sampark progress bar is 8px; Figma draws 4px | Changing the default would visibly change every progress bar spm-ui shows. Only `labelLayout` bars use 4px. | BRAIN › Open design decisions |
| The date-filter calendar keeps the datepicker's width and 1px border | The datepicker was tuned to SPM dev by another workstream | `patterns/date-filter.mdx` |
| A table text cell with two lines grows past 56px | Pre-existing table text-cell rhythm, tuned to SPM dev | — |
| The drawer close button is 32px; Figma has 36px | The existing close button was tuned to SPM dev | — |

Colour was out of scope for this audit (user ruling): this file's Primary is
orange (`#cc5229`), while the kit's Sampark Primary stays the agreed maroon ramp.
