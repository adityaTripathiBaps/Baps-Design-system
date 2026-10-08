# BAPS Design System — React conversion status

Only real, reusable, typed components exported by `@org/ui-kit-react` count as
implemented. Documentation snippets do not count.

**Tracked total: 55 components — DONE: 51 — PARTIAL: 1 — NOT STARTED: 3 — BLOCKED: 0.**

## Batch 2

**26 components — DONE: 25 — PARTIAL: 1.**

- DONE: Icon, Button, Avatar, AvatarGroup, Badge, OverlayBadge, Indicator, Tag,
  Alert, Card, Divider, Spinner, Skeleton, FloatLabel, IconField, InputIcon,
  Message, InputText, Textarea, Checkbox, Radio, Toggle Switch, Input Group,
  Segmented.
- PARTIAL: Link — serious `color-contrast`. MyBKY #5f78b8 is 4.32:1 and
  Sampark #c96868 is 3.71:1 against white, both under AA's 4.5:1 for normal
  text. The compliant step in each ramp is already the hover colour, so fixing
  it means moving the whole link state ramp — and Sampark runs out of steps.
  Blocked on a designer.
- DONE (React) / open (Angular): Progress Bar. The REACT component is clean on
  all three findings and asserted in tests — its own markup omits
  `aria-value*` when indeterminate, which is the PrimeNG defect, and
  `aria-label` reaches the element carrying the role.
  The ANGULAR wrapper keeps two: `aria-allowed-attr` and
  `aria-valid-attr-value`, because PrimeNG binds `aria-valuenow` on its own
  host whatever the mode and neither wrapper lever overrides it.
  `aria-progressbar-name` is fixed on both, verified by a clean axe run.

## Batch 3

**14 components — DONE: 14.**

- DONE: Navbar, Internal Navbar, Toolbar, Breadcrumb, Tabs, Accordion, Stepper,
  Menu Item, Popover, Tooltip, Dialog, Drawer, Toast, Split Button.

## Batch 4

**15 components — DONE: 12 — NOT STARTED: 3.**

| Order | Component           | Status      |
| ----: | ------------------- | ----------- |
|     1 | Select              | DONE        |
|     2 | Multi Select        | DONE        |
|     3 | Listbox             | DONE        |
|     4 | Tree Select         | DONE        |
|     5 | Datepicker          | DONE        |
|     6 | Slider              | DONE        |
|     7 | Chip                | DONE        |
|     8 | Users Dropdown      | DONE        |
|     9 | File Upload         | DONE        |
|    10 | Pagination          | DONE        |
|    11 | Table               | DONE        |
|   11a | SortIcon            | DONE        |
|    12 | Table Column Config | NOT STARTED |
|    13 | Table Sort Config   | NOT STARTED |
|    14 | Tree Table          | NOT STARTED |

### Current verified checkpoint

- Select, Multi Select, Listbox, Tree Select, Datepicker, Slider, Chip, Users
  Dropdown, File Upload and Pagination are real typed exports with
  controlled/uncontrolled state where applicable, keyboard behavior, accessible
  semantics, shared BAPS CSS/tokens, portal overlays where applicable, both
  brands, and dark-mode scope.
- Pagination was listed NOT STARTED in both STATUS files while
  packages/ui-kit-react/src/lib/pagination/pagination.tsx already existed: 327
  lines, exporting BapsPagination, BapsPaginationProps, BapsPageEvent,
  getPaginationPages and formatPaginationReport, re-exported from src/index.ts
  and covered by a test asserting page truncation and accessible controls. The
  code was right and the status was stale; corrected here.
- React typecheck and ESLint pass; ESLint reports seven pre-existing Batch 3
  warnings and no errors.
- 52/52 React tests pass.
- Strict React consumer and Next.js client/server fixtures pass.
- Angular build/typecheck and 486/486 Angular tests pass.
- Storybook host typecheck and static production build pass (8 GB Node heap;
  no memory failure).
- Snippet guard, style-literal guard, React build/style parity guard, and
  `git diff --check` pass.

## Explicitly out of scope

- `react-app-shell-sampark` migration has not started.
- App-local `Table.tsx` helpers have not been replaced.
- No Batch 3/4 Angular public API has been removed or renamed.
- This branch must not be pushed until the final Batch 4 review is approved.
