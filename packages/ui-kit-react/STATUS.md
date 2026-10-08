# React Design System status

Only real, reusable, typed components exported by `@org/ui-kit-react` count as
DONE. Documentation snippets do not count.

**Tracked total: 55 components — DONE: 48 — PARTIAL: 2 — NOT STARTED: 5 — BLOCKED: 0.**

## DONE

- Batch 2 (24): Icon, Button, Avatar, AvatarGroup, Badge, OverlayBadge,
  Indicator, Tag, Alert, Card, Divider, Spinner, Skeleton, FloatLabel,
  IconField, InputIcon, Message, InputText, Textarea, Checkbox, Radio, Toggle
  Switch, Input Group, Segmented.
- Batch 3 (14): Navbar, Internal Navbar, Toolbar, Breadcrumb, Tabs, Accordion,
  Stepper, Menu Item, Popover, Tooltip, Dialog, Drawer, Toast, Split Button.
- Batch 4 (10): Select, Multi Select, Listbox, Tree Select, Datepicker, Slider,
  Chip, Users Dropdown, File Upload, Pagination.

## PARTIAL

- Link: live default Storybook story has a serious `color-contrast` finding.
- Progress Bar: live Angular/PrimeNG story has `aria-allowed-attr`,
  `aria-valid-attr-value`, and `aria-progressbar-name` findings.

## NOT STARTED

- Table, SortIcon, Table Column Config, Table Sort Config, Tree Table.

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
