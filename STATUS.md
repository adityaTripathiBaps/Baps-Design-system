# BAPS Design System — React conversion status

Only real, reusable, typed components exported by `@org/ui-kit-react` count as
implemented. Documentation snippets do not count.

**Tracked total: 55 components — DONE: 48 — PARTIAL: 2 — NOT STARTED: 5 — BLOCKED: 0.**

## Batch 2

**26 components — DONE: 24 — PARTIAL: 2.**

- DONE: Icon, Button, Avatar, AvatarGroup, Badge, OverlayBadge, Indicator, Tag,
  Alert, Card, Divider, Spinner, Skeleton, FloatLabel, IconField, InputIcon,
  Message, InputText, Textarea, Checkbox, Radio, Toggle Switch, Input Group,
  Segmented.
- PARTIAL: Link — live default Storybook story still has a serious
  `color-contrast` finding.
- PARTIAL: Progress Bar — the live Angular/PrimeNG story still has
  `aria-allowed-attr`, `aria-valid-attr-value`, and `aria-progressbar-name`
  findings.

## Batch 3

**14 components — DONE: 14.**

- DONE: Navbar, Internal Navbar, Toolbar, Breadcrumb, Tabs, Accordion, Stepper,
  Menu Item, Popover, Tooltip, Dialog, Drawer, Toast, Split Button.

## Batch 4

**15 components — DONE: 10 — NOT STARTED: 5.**

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
|    11 | Table               | NOT STARTED |
|   11a | SortIcon            | NOT STARTED |
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
