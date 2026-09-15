# Testing Rules

Four layers, each answering a different question. Know which one a failure
belongs to before changing anything.

| Layer | Tool | Question it answers |
| --- | --- | --- |
| Unit | **Jest** (`*.spec.ts`) | does the wrapper's logic hold? |
| Interaction | **Storybook `play`** + `@storybook/test` | does the component *behave*? |
| Visual | **Playwright** snapshots | did the pixels move? |
| Accessibility | **axe** via `addon-a11y` | is it usable without a mouse or with a screen reader? |

```bash
npx nx test ui-kit                       # unit
npx nx visual-test storybook-host        # visual baseline
npx nx visual-update storybook-host      # re-baseline (deliberate visual change only)
node tools/check-interactions.mjs <id>…  # interaction verdicts
node tools/a11y-audit.mjs                # axe, one story per component
```

## The house rule: measure, do not reason

Reading the CSS and concluding what will render is how most of this
repository's wrong fixes started. Read the **rendered DOM and computed values**.

This caught, among others: a layer conflict where PrimeNG beat the DS regardless
of specificity, the flex `order` bug, a remove icon stretched to 28×16, a
chevron drawn at 33% width, and a vertical text clip that a `scrollWidth` check
reported as fine.

It also caught wrong claims made *in review* — several times the measurement
contradicted the confident explanation, including some of mine.

```js
// In Storybook or an app, via the browser tools:
getComputedStyle(el).backgroundColor;   // not "the SCSS says #873030"
el.getBoundingClientRect();             // not "it should be 26px"
[...el.children].map((c) => getComputedStyle(c).order);
```

## Unit tests

Co-located `*.spec.ts`, Jest (`jest.config.cts`). Test the wrapper's own logic,
not PrimeNG's:

- input → rendered attribute/class mapping
- computed getters (`resolvedPanelStyleClass`, `resolvedAriaLabel`, `dt`)
- output re-emission
- the `TemplateRef` collection pattern (see `template-forwarding.spec.ts`)

Do **not** unit-test appearance. That is the visual suite's job.

## Interaction tests

Full conventions in `storybook.md`. The rules that matter most:

- Assert **behaviour a screenshot cannot see**.
- Query by **role and accessible name** — that is what proves the semantics.
- Portalled panels are not in `canvasElement`; query the document.
- Assert the **real** blocking mechanism for "disabled" — it differs per
  component, and asserting the wrong one fails a correct component.
- Do not use `fireEvent` to force a path `pointer-events` blocks. You will
  "find" bugs no user can reach.

Verify with the tool, not by eye:

```bash
node tools/check-interactions.mjs $(…ids…)   # prints PASS / FAIL per story
node tools/read-interaction-error.mjs <id>   # the failure text, when it fails
```

## Visual tests

`apps/storybook-host/visual/stories.spec.ts` reads `index.json`, so it covers
every story automatically — including new ones. 462 baselines.

- **Interaction stories are excluded** (filtered on the `Interaction — ` name
  prefix and the `-interaction` id suffix). They drive components mid-flight, so
  a screenshot catches whichever frame the run landed on.
- A **deliberate** visual change is re-baselined with `nx visual-update`. Review
  that diff — it is the only place a design change is visible as a change.
- **Never change component CSS to make a snapshot pass.** The existing
  appearance is the baseline.

## Anti-patterns

| Do not | Do instead |
| --- | --- |
| Assert a class name to prove behaviour | assert the ARIA state |
| `querySelector('.p-chip')` in a play function | `getByRole` with a name |
| Screenshot an animating overlay | assert its ARIA state / presence |
| Change CSS so a test goes green | fix the test, or record the finding |
| Trust the a11y badge count | read violations / passes / incomplete |
| Trust a story "because it renders" | run the interaction checker |
| Re-baseline to clear a red suite | find out what moved first |
