# React Design System — Batch 2

Only reusable, typed components exported by `@org/ui-kit-react` can be marked
DONE. Documentation snippets do not count.

**Total: 26 reusable components — DONE: 24 — PARTIAL: 2 — BLOCKED: 0.**

| Order | Component     | Status  |
| ----: | ------------- | ------- |
|     1 | Icon          | DONE    |
|     2 | Button        | DONE    |
|     3 | Link          | PARTIAL |
|     4 | Avatar        | DONE    |
|     5 | AvatarGroup   | DONE    |
|     6 | Badge         | DONE    |
|     7 | OverlayBadge  | DONE    |
|     8 | Indicator     | DONE    |
|     9 | Tag           | DONE    |
|    10 | Alert         | DONE    |
|    11 | Card          | DONE    |
|    12 | Divider       | DONE    |
|    13 | Progress Bar  | PARTIAL |
|    14 | Spinner       | DONE    |
|    15 | Skeleton      | DONE    |
|    16 | FloatLabel    | DONE    |
|    17 | IconField     | DONE    |
|    18 | InputIcon     | DONE    |
|    19 | Message       | DONE    |
|    20 | InputText     | DONE    |
|    21 | Textarea      | DONE    |
|    22 | Checkbox      | DONE    |
|    23 | Radio         | DONE    |
|    24 | Toggle Switch | DONE    |
|    25 | Input Group   | DONE    |
|    26 | Segmented     | DONE    |

Batch 3, Batch 4, React shell migration and Table.tsx migration are outside
this reconciliation and must not start yet.

## Remaining live accessibility findings

- **Link:** the live default Storybook story has one serious `color-contrast`
  violation. React shares the same canonical link CSS, so this needs a token or
  approved visual-baseline decision before the component can be called DONE.
- **Progress Bar:** the React implementation's role/name/value behavior passes
  its runtime tests, but the live Angular/PrimeNG story still reports
  `aria-allowed-attr`, `aria-valid-attr-value`, and `aria-progressbar-name`.
  That leaves the Angular regression-safety gate incomplete.

## Verified checkpoint

- 43/43 React runtime and interaction tests pass.
- Strict React consumer and Next.js client/server fixture compiles pass.
- All 26 components are exercised across the Next.js client/server fixtures;
  Message and Textarea are present in both fixtures.
- React and Angular typechecks, React ESLint, shared-style parity and
  Angular-free runtime checks pass.
- MyBKY, Sampark, light and dark selectors are present in canonical shared CSS.
- Storybook static build and snippet/style guards pass.
- A real Chromium run verified 50 unique React/Next Storybook example sets
  (89 visible pairs across the MyBKY and Sampark docs states), and all 13 Batch
  2 interaction stories pass.
