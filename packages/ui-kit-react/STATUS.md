# React Design System status

Only real, reusable, typed components exported by `@org/ui-kit-react` count as
DONE. Documentation snippets do not count.

**Tracked total: 55 components — DONE: 51 — PARTIAL: 1 — NOT STARTED: 3 — BLOCKED: 0.**

## DONE

- Batch 2 (24): Icon, Button, Avatar, AvatarGroup, Badge, OverlayBadge,
  Indicator, Tag, Alert, Card, Divider, Spinner, Skeleton, FloatLabel,
  IconField, InputIcon, Message, InputText, Textarea, Checkbox, Radio, Toggle
  Switch, Input Group, Segmented.
- Batch 3 (14): Navbar, Internal Navbar, Toolbar, Breadcrumb, Tabs, Accordion,
  Stepper, Menu Item, Popover, Tooltip, Dialog, Drawer, Toast, Split Button.
- Batch 4 (10): Select, Multi Select, Listbox, Tree Select, Datepicker, Slider,
  Chip, Users Dropdown, File Upload, Pagination.
- Batch 5 (3): Progress Bar — see below for why it moved out of PARTIAL — plus
  Table and SortIcon.

## PARTIAL

- Link: serious `color-contrast` on the live story. Measured against #ffffff:
  MyBKY `blue-600` #5f78b8 is 4.32:1 and Sampark `primary-60` #c96868 is
  3.71:1, both under the 4.5:1 AA needs for normal text. A compliant token
  exists in each ramp but is already the HOVER colour, so adopting it collapses
  rest and hover — and the Sampark ramp has no step left for active. Blocked on
  a designer; see BRAIN "Open design decisions".

## Progress Bar — React is DONE, Angular is not

The three axe findings were raised against the **Angular/PrimeNG** story, and
only one of them is a defect React shares. The React component is its own
markup, and it already does the right thing:

- `role="progressbar"` sits on the host; the visual inside is `aria-hidden`.
- Indeterminate mode omits `aria-valuenow` / `-min` / `-max` entirely, which is
  precisely what PrimeNG gets wrong.
- `aria-label` reaches the element carrying the role.

All three are asserted in `tests/components.test.mjs`. There is no React
Storybook story — the site is Angular-only — so axe cannot be pointed at it;
the verdict rests on the markup and those tests, not on an audit run.

The Angular side stays open and is tracked in root `STATUS.md` and in
`.agents/BRAIN.md` under *Open design decisions*: PrimeNG binds
`aria-valuenow` on its own host whatever the mode, and neither wrapper lever
could override it.

## NOT STARTED

- Table Column Config, Table Sort Config, Tree Table. All three are BLOCKED on
  the same precondition, not on React work: each Angular component keeps its CSS
  in an inline `styles:` block, so nothing ships in `@org/ui-kit/styles` for a
  React port to consume. Extracting those to partials is the enabling step.

## Pending, not forgotten

- **React Storybook stories and framework snippets for Table and SortIcon.**
  The components, their types and their tests are done; the docs surface is
  not. Tracked here so snippet coverage does not quietly stall.

## Current verification

- 53/53 React tests pass.
- React build and typecheck pass.
- React lint: there is no `lint` target on this project, so
  `nx run ui-kit-react:lint` fails with "Cannot find configuration for task"
  and `nx run-many --target=lint` skips the package silently. Run directly,
  `npx eslint "packages/ui-kit-react/src/**/*.{ts,tsx}"` is clean: 0 errors,
  7 warnings, all `no-explicit-any` in tooltip.tsx and all pre-existing.
  The target is worth adding; until it exists this line is a manual check.
- Strict React consumer and Next.js client/server fixtures pass.
- Shared MyBKY/Sampark and light/dark CSS is copied from canonical
  `@org/ui-kit`; no React-local design stylesheet exists.
- Angular build/typecheck and 486/486 tests pass.
- Storybook host typecheck and static production build pass (8 GB Node heap;
  no memory failure).
- Snippet/style/build parity guards and `git diff --check` pass.
