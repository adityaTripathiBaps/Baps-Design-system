---
name: baps-storybook-pillars
description: Bring a component's Storybook up to the eight BAPS pillars — Docs, Canvas, Controls, Interactions, Visual tests, Accessibility, Design, Actions. USE WHEN adding controls or argTypes, writing a play function, wiring the Actions panel, adding a Figma design reference, fixing an empty Storybook panel, or when the user asks to "add interactions", "wire actions", "add controls" or "complete the Storybook setup" for a component. Carries the three Actions traps and the restart-to-reindex rule.
---

# The Eight Storybook Pillars

**Docs · Canvas · Controls · Interactions · Visual tests · Accessibility · Design · Actions**

All eight come from real addons. **Never hand-build a panel or tab.** Full rules
in `.agents/rules/storybook.md`; this skill is the working procedure.

## Audit first

```bash
node tools/check-panels.mjs components-<thing>--default
```

Reads the real manager DOM. An addon whose version mismatches core registers
silently and shows up nowhere, so do not conclude from `main.ts` alone.

Expected:

```
Controls18 · Actions · Interactions · Design (1) · Visual tests · Accessibility · On this page · Addons
```

`Design` with no `(1)` means the component has no `design` parameter.
`Controls` with no count means the story has no args.

## Controls

Compodoc already infers **every input's type and doc comment**. Add `argTypes`
only to give a union or boolean input a control a reader can drive:

```ts
argTypes: {
  severity: { control: 'select', options: [undefined, 'primary', 'info', 'error'] },
  size: { control: 'inline-radio', options: [undefined, 'xs', 's', 'm', 'l'] },
  disabled: { control: 'boolean' },
},
```

`undefined` first on an optional enum. Do not restate a type compodoc knows.

Keep `args` minimal — every extra arg is echoed into Show code as a bound
property, so an unset default is noise in the snippet a reader copies.

## Interactions

```ts
export const KeyboardInteraction: Story = {
  name: 'Interaction — keyboard',          // prefix is load-bearing
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByRole('switch');
    el.focus();
    await expect(el).toHaveFocus();
    await userEvent.keyboard('{ }');
    await expect(el).not.toBeChecked();
  },
};
```

Rules that cost time to learn:

- **Query by role and accessible name.** Roles are not what you expect: day
  cells are `role="presentation"` not `gridcell`; a drawer panel is
  `role="complementary"` not `dialog`; paginator buttons are named `"Page 2"`
  not `"2"`; stepper headers are `role="tab"` with **no** accessible name.
  **Measure the DOM before writing the selector.**
- **Portalled panels are not in `canvasElement`** — use
  `within(canvasElement.ownerDocument.body)`.
- Portalled overlays animate: `waitFor(…, { timeout: 8000 })`.
- **A story with no `render` inherits the meta's** — and some metas have none, so
  the story mounts nothing and `play` never runs. Check before assuming.
- Assert the **real** blocking mechanism for disabled: native attribute on
  `baps-button`, `pointer-events: none` on `baps-checkbox`.
- `readonly` is about the **model** — assert `aria-checked`, not `.checked`.
- Do not use `fireEvent` to force past `pointer-events`. You will "find" bugs no
  user can reach.

## Actions — three traps, in the order they were hit

1. **`actions: { argTypesRegex }` — never.** Storybook *assigns* args onto the
   instance, so a matched `@Output`'s spy replaces the real `EventEmitter`. Five
   interaction stories silently stopped working; nothing in the output hinted
   why. Narrowing the pattern does not help — the names that break are the
   useful ones.
2. **`fn()` in args, bound in a template — invisible.** The Actions addon never
   sees it. The click lands, the panel stays empty.
3. **`action('name')` in render props — correct.**

```ts
import { action } from '@storybook/addon-actions';

render: (args) => ({
  props: { ...args, onClosed: action('closed') },   // AFTER the spread
  template: `<baps-alert (closed)="onClosed($event)" />`,
}),
```

Name it **`onX`, never `X`** — `...args` assigns every prop onto the instance, so
a prop called `closed` overwrites the emitter. Skip a `*Change` output that
partners a `[(x)]` binding: a second `(xChange)` is a duplicate-binding error.

If the meta's args type rejects the extra key, widen the generic — do not cast:

```ts
type Args = BapsAlert & Record<'onClosed', (event?: unknown) => void>;
const meta: Meta<Args> = { … };
```

## Design

```ts
parameters: {
  design: { type: 'figma', url: 'https://www.figma.com/design/<key>/?node-id=22465-95582' },
},
```

Node ids are often already in the component's own comments or SCSS header —
harvest rather than ask. **Do not guess a file key from an unrecognised
prefix**; a Design tab pointing at the wrong document is worse than none.

## Accessibility

```bash
node tools/a11y-audit.mjs components-<thing>--default
```

Classify before fixing: story-side (fix now), component-level (record and ask),
token-level (never silently change). See `.agents/rules/accessibility.md`.

## Visual tests

Playwright covers every non-interaction story automatically. A new story needs a
baseline:

```bash
npx nx visual-update storybook-host
```

Review that diff — it is the only place a design change shows up as a change.

## The restart rule

**Adding or renaming a story requires a Storybook restart.** HMR does not
rebuild the MDX↔CSF index link. Symptoms that mean "restart", not "broken":

- `Interactions0` on a story that has a `play`
- `Unable to index …mdx: Could not find or load CSF file` — which takes down
  `index.json`, so *every* story looks broken

Editing a story body hot-reloads fine.

## Automating across many stories — read this before scripting

A script that rewrites story templates in bulk **will** break some of them, and
neither `tsc` nor the index build catches it. A binder that inserted an output
binding at the first `>` after a tag split three self-closing tags in half
(`Opening tag not terminated`), and added a duplicate binding to a fourth.

If you script an edit across story files, verify every touched story **renders**:

```js
// per story: html length > 200 and no JIT / render error in the console
await page.goto(`http://localhost:4400/iframe.html?viewMode=story&id=${id}`);
```

## Verify

```bash
npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json
# restart Storybook
node tools/check-panels.mjs components-<thing>--default
node tools/check-interactions.mjs components-<thing>--…-interaction
```

A story that "renders fine" is not verified. Run the checker.
