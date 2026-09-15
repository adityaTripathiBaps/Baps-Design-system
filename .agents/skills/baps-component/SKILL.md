---
name: baps-component
description: Add a component to the BAPS Design System — wrapper, style partials, tokens, stories, MDX docs and the eight Storybook pillars. USE WHEN the user asks to add, create or scaffold a design-system component, wrap a PrimeNG component, or port a Figma component into the library. Trigger words — new component, add component, wrap p-*, scaffold, port from Figma. Covers the NG0201 element-injector trap and the wrap/do-not-wrap decision.
---

# Add a BAPS Design System Component

## Step 1 — decide whether to wrap at all

A wrapper that adds nothing is a file to maintain and an API to keep
compatible. Work down this list and stop at the first that suffices:

| Reach for | When |
| --- | --- |
| **A preset token** | the preset alone gets it right — nothing else needed |
| **A style partial** | it needs BAPS geometry but no new inputs (`p-tabs` + `_tabs-sampark.scss`) |
| **A directive** | it needs behaviour on PrimeNG's own element (`bapsInputText`, `bapsAccordion`) |
| **A wrapper component** | it needs real inputs, defaults, or a different content shape |

A directive also **sidesteps the element-injector trap entirely**, which is
reason enough to prefer one where it fits.

## Step 2 — check the Figma source

Pull the node rather than deriving values. Do not guess a colour, a size or a
glyph.

```
MyBKY   yY5bmcEifXbcCwhauoiy6Y   node prefixes 22465 / 25317
Sampark xc0L2xnREMgjyb5XcKyLIz   node prefixes 13197 / 17512
```

Record the node id — it goes in the token comment, the story `design`
parameter and the MDX page. If Figma and a written style guide disagree,
**document the conflict and say which you followed**; do not silently pick.

Where a glyph is involved, fetch the exported SVG. A chevron was once rebuilt
from the icon set's 24-unit viewBox and drew at **half** width with a
0.83px stroke; the real asset was a 10×10 box with a 67% glyph.

## Step 3 — the files

```
libs/ui-kit/src/lib/components/<name>/
  <name>.component.ts          # or <name>.directive.ts
  <name>.stories.ts
  <name>.mdx
  <name>.component.spec.ts
libs/ui-kit/src/lib/styles/components/<name>/
  _<name>.scss                 # base — MyBKY is the unscoped default
  _<name>-sampark.scss         # Sampark override, only if needed
```

Then export it: `libs/ui-kit/src/index.ts`.

Naming is in `.agents/rules/naming.md` — `baps-<name>` selector,
`Baps<Name>` class with **no `Component` suffix**.

## Step 4 — the component

Read `.agents/rules/angular.md` fully first. The parts that cause rework:

- `encapsulation: ViewEncapsulation.None`, and **every selector rooted at the
  host** — `baps-chip .p-chip`, never bare `.p-chip`.
- **The NG0201 element-injector trap.** If the component has children that
  PrimeNG must see as its own, `<ng-content>` will throw and
  `ngTemplateOutlet` from a shared `ng-template` renders nothing. The child
  renders nothing and exposes a `TemplateRef`; the parent writes the PrimeNG
  tree literally, in **both** branches of any `@if`. See `baps-accordion` and
  `baps-stepper`.
- Host bindings for brand/size/state, with `null` (not `false`) to omit an
  attribute.
- Expose `ariaLabel` / `ariaLabelledBy` and forward them if PrimeNG accepts
  them. A missing accessible name is the most common real axe violation here.
- Portalled panels need `resolvedPanelStyleClass` — see `baps-select`.

## Step 5 — tokens before SCSS

Any value that could be a token **is** a token. Add it to
`libs/tokens/src/source/component.tokens.json` under both brands, with the
Figma node in the comment, then:

```bash
npx nx build tokens
```

Consume the most specific tier that exists. See
`.agents/rules/styling-tokens.md`.

## Step 6 — stories, MDX and the eight pillars

Full rules in `.agents/rules/storybook.md`. The minimum:

```ts
const meta: Meta<BapsThing> = {
  title: 'Components/<Category>/<Thing>',
  id: 'components-thing',                    // PINNED — never remove
  component: BapsThing,
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/<key>/?node-id=<n>' },
  },
  argTypes: { /* curated controls for unions and booleans only */ },
};
```

- **Show code must be paste-ready.** Literal attributes, no loop variables, no
  `brand` in a generic story.
- One `Interaction — <what>` story per real behaviour, asserting by role and
  accessible name.
- Actions via `action('output')` in render props, named `onX`, placed **after**
  the `...args` spread.
- MDX page: Usage · When to use · When not to use · Examples · Accessibility.
  Never leave an empty section.

## Step 7 — verify, do not eyeball

```bash
node tools/check-styles-literals.mjs
npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json
npx nx build ui-kit
# restart Storybook — a NEW story needs a re-index, HMR will not do it
node tools/check-interactions.mjs components-thing--interaction-…
node tools/a11y-audit.mjs components-thing--default
```

Then in the browser, **measure** rather than screenshot: computed background,
border-radius, height, and the same again with the toolbar flipped to the other
brand. Both brands and both modes must be right.

## Checklist

- [ ] Wrap/partial/directive decision made and justified
- [ ] Figma node pulled; conflicts documented
- [ ] Tokens added under both brands, with node ids in comments; tokens rebuilt
- [ ] `ViewEncapsulation.None`, every selector rooted at the host
- [ ] No NG0201 — children use the `TemplateRef` pattern if PrimeNG parents them
- [ ] `ariaLabel` exposed and forwarded where applicable
- [ ] Exported from `libs/ui-kit/src/index.ts`
- [ ] Story with pinned `id` and a `design` parameter
- [ ] Show code is literal and paste-ready
- [ ] Interaction story per real behaviour, verified by the checker
- [ ] MDX page with no empty sections
- [ ] Both brands and both modes measured
- [ ] `nx visual-update storybook-host` run for the new baselines
