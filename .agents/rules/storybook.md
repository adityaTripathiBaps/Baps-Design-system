# Storybook Rules

Storybook 8.6 (`@storybook/angular`), served on **:4400**. It is this library's
only UI surface — its documentation, its manual test bench and half its
automated tests.

```bash
npx nx run storybook-host:storybook
```

## The eight pillars

Every applicable component provides:

**Docs · Canvas · Controls · Interactions · Visual tests · Accessibility · Design · Actions**

All eight come from real addons. **Never hand-build a panel or tab** — if it
looks like a Storybook feature, it must be one.

Registered in `.storybook/main.ts`: `addon-essentials` (Controls, Actions,
Viewport, Backgrounds, Measure, Outline), `addon-docs` (kept separate for its
`remark-gfm` option — see below), `addon-interactions`, `addon-designs`,
`@chromatic-com/storybook`, `storybook-dark-mode`, `addon-a11y`.

> `addon-essentials` is registered with `{ docs: false }`. It bundles docs, and
> registering docs twice makes the second registration win — silently dropping
> the `remark-gfm` option and turning every markdown table in the library into
> literal `| --- |` pipe text.

## Story file conventions

Two files per component. Do not add a third.

```
libs/ui-kit/src/lib/components/<name>/
  <name>.stories.ts   ← meta, examples, interaction stories
  <name>.mdx          ← the structured documentation page
```

Every meta **pins its `id`**:

```ts
const meta: Meta<BapsChip> = {
  title: 'Components/Atoms/Chip',
  // Pinned so the categorised title above does not move the docs URL.
  id: 'components-chip',
  …
};
```

That pin is what lets the sidebar be reorganised without breaking bookmarks or
the 462 visual baselines keyed off story ids. **Never remove it.**

## Information architecture

```
Getting Started · Foundations · Components · Patterns · Guidelines · Docs
```

`Components/` groups, by Atomic Design tier: `Atoms · Molecules · Organisms`.
Order is set by `storySort` in `preview.ts`; anything unlisted falls back to
alphabetical, so a new component appears in its tier without editing the list.

- **Atoms** — indivisible primitives (Button, Icon, Tag, Checkbox, Divider…).
- **Molecules** — several atoms with one job (Select, Card, Pagination, Alert…).
- **Organisms** — page sections, not reusable units (Table, Dialog, Navbar,
  Toolbar, Stepper, the Table *Config drawers…). Put a component here only when
  calling it a molecule would make "molecule" mean nothing.

## One component = one page

The sidebar shows **only the docs page** for each component. `manager.tsx`'s
filter hides every `type: 'story'` entry whose id starts with `components-`,
and Storybook then hoists a component whose sole remaining child is its docs
entry into a leaf — so `Atoms › Button` opens the Button page directly.

That is a SIDEBAR filter only. `index.json` still lists every story, so
interaction, visual, controls, panels and a11y tooling are unaffected and every
story is still reachable by URL. Consequences when adding a component:

- A new example story is invisible until the `.mdx` renders it. Add a `Canvas`
  or `DemoCard` for it, or it is documentation nobody can reach.
- `*Interaction` stories need no entry — they exist for
  `tools/check-interactions.mjs`, and being hidden is the point.

## Controls

Compodoc is wired (`compodoc: true` in `project.json` plus `setCompodocJson` in
`preview.ts`), so **every input's type and doc comment is inferred**. Table
shows 50 controls with no `argTypes` at all.

Add explicit `argTypes` only to give a union-typed or boolean input a control a
reader can drive:

```ts
argTypes: {
  severity: { control: 'select', options: [undefined, 'primary', 'info', 'error'] },
  size: { control: 'inline-radio', options: [undefined, 'xs', 's', 'm', 'l'] },
  disabled: { control: 'boolean' },
},
```

`undefined` first on an optional enum, so the control can express "unset".

## Show code must be paste-ready

**Every snippet a reader can copy must compile in an app.** This is a hard rule,
not a preference — it cost one reader six consecutive build failures.

```html
<!-- CORRECT — literal attributes -->
<baps-chip severity="info" label="info" [count]="8" />

<!-- WRONG — `s` is the story's loop variable, not a property of the app -->
<baps-chip [severity]="s" [count]="8" />
```

Loop-based stories emit their loop variables into Show code. Pasted into an app,
Angular reads `[severity]="s"` as "the property `s` on this component", fails
with `TS2339`/`NG8002` — and **the dev server keeps serving the last good
bundle, so the page does not error, it just stops changing.**

Rules that follow from this:

- Write examples longhand with literal attributes.
- Pass **no `brand`** in a generic story: the toolbar's Design-system toggle
  drives it through the page scope, which is also how a real app works.
- Keep `args` minimal. Every extra arg is echoed as a bound property, so
  `removable: false` shows up as noise in the snippet.
- A deliberate matrix story may keep its loops — say so in its doc comment, and
  point readers at the focused stories for copyable markup.

## Interactions

`play` functions using `@storybook/test`. Assert **behaviour a screenshot cannot
see**: that a click reached a handler, that focus landed, that a disabled
control is genuinely inert.

```ts
export const ClickInteraction: Story = {
  name: 'Interaction — click',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    await expect(button).toBeEnabled();
  },
};
```

Conventions:

- Name them `Interaction — <what>`. The visual suite filters on that prefix.
- Query **by role and accessible name**, never by CSS class — querying by role
  is what proves the wrapper exposes the right semantics.
- A **portalled** panel is not inside `canvasElement`. Use
  `within(canvasElement.ownerDocument.body)`.
- Portalled overlays animate; give their `waitFor` an explicit
  `{ timeout: 8000 }` rather than relying on the 1s default.
- Do **not** add a play function to a static component. An empty assertion is
  noise in the panel.

### Assert the real blocking mechanism

"Disabled" is not one thing:

- `baps-button` — native `disabled` attribute. Computed `pointer-events: auto`,
  opacity 0.38. Asserting `pointer-events: none` **fails on a correct
  component**.
- `baps-checkbox` — `pointer-events: none` on both the input and its label,
  because the real control is a hidden input.

And do not force a path a user cannot take. `fireEvent` dispatches straight at
the element, bypassing `pointer-events`; it "found a bug" in PrimeNG's checkbox
`handleChange` (which guards `readonly` but not `disabled`) that no user can
reach. Assert what blocks the click instead.

### readonly is about the model, not the input

A readonly switch still contains a native checkbox, and a click toggles that
input's own `checked` the way any checkbox does. PrimeNG guards the **model** —
`aria-checked` and `data-p-checked` stay put. Assert those. Asserting
`.checked` fails on a component that is behaving correctly.

## Actions — three traps, in the order they were hit

The Actions panel is the hardest pillar to get right in Angular. All three of
these were tried in this repository.

1. **`actions: { argTypesRegex }` — do not use it.** Storybook *assigns* args
   onto the component instance, so a matched `@Output`'s spy **replaces the real
   `EventEmitter`**. Five interaction stories silently stopped working: drawer
   and popover would not open, pagination would not change page. Nothing in the
   rendered output hinted at the cause. Narrowing the pattern does not save it —
   the names that break (`visibleChange`, `page`, `show`, `close`) are exactly
   the useful ones.

2. **`fn()` in args, bound in the template — safe, but invisible.** An `fn()`
   spy bound in an Angular template is just a function the template calls; the
   Actions addon never sees it. The click lands and the panel stays empty.

3. **`action('name')` in render props — this is the one.**

```ts
import { action } from '@storybook/addon-actions';

render: (args) => ({
  props: { ...args, onClosed: action('closed') },
  template: `<baps-alert (closed)="onClosed($event)" />`,
}),
```

Name the prop **`onX`, never `X`**: a render that spreads `...args` assigns every
prop onto the instance, so a prop called `closed` would overwrite the real
`closed` emitter — the same clobbering as trap 1, reintroduced by hand. Put the
reporter **after** the spread, or `...args` overwrites it.

Skip a `*Change` output that is the write-back half of a `[(x)]` binding: adding
a second `(xChange)` binding alongside `[(x)]` is an Angular duplicate-binding
error.

## Design

```ts
parameters: {
  design: { type: 'figma', url: 'https://www.figma.com/design/<key>/?node-id=22465-95582' },
},
```

File keys: MyBKY `yY5bmcEifXbcCwhauoiy6Y`, Sampark Portal
`xc0L2xnREMgjyb5XcKyLIz`. Node-id prefixes seen so far: `22465`/`25317` are
MyBKY, `13197`/`17512` are Sampark. **Do not guess a file key from an unmatched
prefix** — a Design tab pointing at the wrong document is worse than none.

## Visual tests

Two suites, two questions:

- **Playwright** (`nx visual-test storybook-host`) pins our own pixels. 462
  baselines, no account needed, this is what CI uses. It reads `index.json`, so
  a new story needs a baseline: `nx visual-update storybook-host`.
- **Chromatic** reviews changes across browsers. The panel is registered;
  running a comparison needs a project token.

Interaction stories are **excluded** from the visual baseline. Their whole point
is driving a component mid-flight — a dialog opening, a tooltip fading in — so a
screenshot captures whichever frame the run landed on and is flaky by
construction.

## Accessibility

See `accessibility.md`. `addon-a11y` runs axe on every story; the badge count
mixes violations with *incomplete* results, so read the three numbers rather
than gating on the badge.

## The restart rule

**Adding or renaming a story requires a Storybook restart.** HMR does not
rebuild the MDX↔CSF index link, and the symptom is misleading:

- `Interactions0` / "Write a play function" on a story that has one
- `Unable to index …mdx: Could not find or load CSF file` — which takes down
  `index.json` entirely, so *every* story appears broken

Editing a story's body hot-reloads fine. Adding one does not.

## Verification tools

Do not trust that a story works because it looks right.

```bash
node tools/check-interactions.mjs <story-id>…   # reads the Interactions verdict
node tools/check-panels.mjs <story-id>…         # which panels/tools are present
node tools/a11y-audit.mjs                       # axe over one story per component
node tools/read-interaction-error.mjs <story-id> # the failure text
```
