# React Design System status

Only real, reusable, typed components exported by `@org/ui-kit-react` count as
DONE. Documentation snippets do not count.

**Tracked total: 57 components — DONE: 56 — PARTIAL: 1 — NOT STARTED: 0 — BLOCKED: 0.**

## DONE

- Batch 2 (24): Icon, Button, Avatar, AvatarGroup, Badge, OverlayBadge,
  Indicator, Tag, Alert, Card, Divider, Spinner, Skeleton, FloatLabel,
  IconField, InputIcon, Message, InputText, Textarea, Checkbox, Radio, Toggle
  Switch, Input Group, Segmented.
- Batch 3 (14): Navbar, Internal Navbar, Toolbar, Breadcrumb, Tabs, Accordion,
  Stepper, Menu Item, Popover, Tooltip, Dialog, Drawer, Toast, Split Button.
- Batch 4 (10): Select, Multi Select, Listbox, Tree Select, Datepicker, Slider,
  Chip, Users Dropdown, File Upload, Pagination.
- Batch 5 (6): Progress Bar — see below for why it moved out of PARTIAL — plus
  Table, SortIcon, Table Column Config, Table Sort Config and Tree Table.
- Gap-fill (feat/kit-gap-fill) (2): InputNumber, Menu.

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

Nothing. Every tracked component is DONE or PARTIAL.

## Verified 2026-10-08

Measured from source, not from this file. All 13 gates pass on `main`,
including `build-storybook`, which failed on earlier days for machine memory
and succeeded here ("Preview built (1.62 min)").

- All 47 Angular component families have a React directory, an `.mdx` and a
  snippets file. None is missing a React or Next tab.
- Snippet coverage **47/47 components, 253/253 examples** — confirmed by
  `check-snippets --report`. This line used to read 247/254 and claim "the
  seven are Interaction stories", which was wrong twice: the guard already
  excludes Interaction stories from the count, and the seven were ordinary
  examples nobody had written (tabs ×3, accordion, icon, avatar ×2). Six were
  written; avatar's `_DocsAnchor` is not an example at all and the guard now
  skips leading-underscore exports.
- Custom tabs are NOT universal and were never meant to be: 12 components have
  one, 9 record a Route B reason, and 26 have neither. See BRAIN items 3a/3b.
- Three Custom tabs were lost in `0c26fe5` — breadcrumb, file-upload and tabs
  — and no guard caught it. That commit carried in six snippet files edited by
  another session and the Batch 4 audit checked them for junk and for Angular
  API compatibility, not for content.
- ~~17 React components have no test naming them.~~ Closed. Every component
  now has its own `tests/<name>.test.mjs`; the single `components.test.mjs`
  was split into 52 per-component files so a failure names the component.

## Pending, not forgotten

- **SortIcon is documented via Table, not on its own page.** It lives in the
  table component folder and has no .stories.ts or .mdx of its own, so
  check-snippets does not count it as a component and there is no snippet slot
  to fill. Deliberate: its three states only make sense in a column header.
- ~~Stories and framework snippets for the Batch 5 components~~ — done.
  Snippet coverage is now **47/47 components and 253/253 examples**. SortIcon
  is covered through Table, as noted above.
- ~~**Drawer, Dialog and Popover have no React tests, and neither do the two
  panels built on Drawer.**~~ Closed. `jsdom` was approved and added as a dev
  dependency, and `tests/dom.mjs` installs its globals once before React's
  renderer loads. All nine portal components — dialog, drawer, popover,
  tooltip, toast, split-button, table-column-config, table-sort-config and the
  panels — now have rendered-markup tests, not just pure-function ones.

## Current verification

- **155/155 React tests pass**, across 53 per-component files.
- React build and typecheck pass.
- React lint now has a target: `nx run ui-kit-react:lint` is 0 errors and 7
  warnings — 6 `no-explicit-any` and 1 `no-non-null-assertion`, in drawer,
  internal-navbar, popover and tooltip, all pre-existing. The 3207 warnings
  the per-component test split briefly introduced (one shared import block
  copied into all 47 files) are gone.
- Strict React consumer and Next.js client/server fixtures pass.
- Shared MyBKY/Sampark and light/dark CSS is copied from canonical
  `@org/ui-kit`; no React-local design stylesheet exists.
- Angular build/typecheck and **752/752 tests across 52 suites** pass; every
  Angular component family now carries a spec.
- Storybook host typecheck and static production build pass (8 GB Node heap;
  no memory failure).
- Snippet/style/build parity guards and `git diff --check` pass.
