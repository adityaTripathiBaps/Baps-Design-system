# Naming Conventions

All file names are **kebab-case**. Never camelCase or PascalCase for a filename.

## Library files

| Artifact | Pattern | Example |
| --- | --- | --- |
| Wrapper component | `<name>.component.ts` | `chip.component.ts` |
| Directive | `<name>.directive.ts` | `input-text.directive.ts` |
| Child component | `<name>.component.ts` | `step.component.ts` |
| Stories | `<name>.stories.ts` | `chip.stories.ts` |
| Docs page | `<name>.mdx` | `chip.mdx` |
| Spec | `<name>.spec.ts` | `chip.component.spec.ts` |
| Style partial (base) | `_<name>.scss` | `_chip.scss` |
| Style partial (Sampark) | `_<name>-sampark.scss` | `_chip-sampark.scss` |
| Theme preset | `<brand>.theme.ts` | `sampark.theme.ts` |
| Token source | `<tier>.tokens.json` | `component.tokens.json` |
| Barrel | `index.ts` | `libs/ui-kit/src/index.ts` |

One folder per component, holding all of the above:

```
libs/ui-kit/src/lib/components/chip/
  chip.component.ts
  chip.stories.ts
  chip.mdx
  chip.component.spec.ts
```

Style partials live separately, under `libs/ui-kit/src/lib/styles/components/<name>/`.

## Selectors and classes

| Type | Convention | Example |
| --- | --- | --- |
| Component selector | `baps-<name>` | `baps-chip`, `baps-tree-select` |
| Directive selector | `[baps<Name>]` | `[bapsInputText]`, `[bapsTabs]` |
| Component class | `Baps<Name>` | `BapsChip`, `BapsTreeSelect` |
| Exported type | `Baps<Name><Thing>` | `BapsChipSeverity`, `BapsChipSize` |

**No `Component` suffix on the class.** `BapsChip`, not `BapsChipComponent` —
that is the convention throughout this library, and consuming apps import these
names.

Multi-word selectors are hyphenated (`baps-tree-select`), and the class drops
the hyphens (`BapsTreeSelect`). Two historical exceptions kept for
compatibility: `baps-inputicon` and `baps-toggleswitch`. Do not add more.

## CSS class names

| Kind | Convention | Example |
| --- | --- | --- |
| Component-owned element | `baps-<component>__<part>` | `.baps-chip__count` |
| Brand scope, per instance | `baps-<brand>` | `.baps-sampark` |
| Brand scope, page-wide | `baps-ds-<brand>` | `.baps-ds-sampark` |
| Mode | `baps-<mode>` | `.baps-dark`, `.baps-light` |
| Shared surface | `baps-<thing>` | `.baps-table-surface` |

**Never rename an existing token or CSS class.** Consuming apps and Figma
mappings reference them by name.

## Token names

Generated from the JSON path, so the path *is* the name:

```
component.tokens.json → tag.sampark.grey.background
                      → --tag-sampark-grey-background
```

Tiers: `color.<brand>.<ramp>.<step>` · `<role>.<brand>.<property>` ·
`<component>.<brand>.<variant>.<property>`.

Where a Figma name and the ramp step disagree, the **token keeps the code name**
and the comment records the Figma one. See `styling-tokens.md` § 3.

## Story names

| Kind | Convention |
| --- | --- |
| Playground / default | `Default` or `Playground` |
| Variant set | `Severities`, `Sizes`, `Variants`, `States` |
| Brand-pinned | `Sampark<Thing>` / `MyBky<Thing>` |
| Interaction | `Interaction — <what>` |
| Deliberate matrix | `Matrix` |

The `Interaction — ` prefix is **load-bearing**: the visual-regression suite
filters on it. See `storybook.md`.

## Storybook titles and ids

```ts
title: 'Components/Atoms/Chip',
id: 'components-chip',   // pinned — never derived, never removed
```

The id is what URLs and the 462 visual baselines key off. Renaming a category
changes the sidebar label only, because the id is pinned.

## Interfaces and types

- Descriptive nouns, **no `I` prefix**.
- Union types for closed sets, exported so apps can use them:
  `export type BapsChipSize = 'xs' | 's' | 'm' | 'l'`.
- Data shapes a consumer passes in: suffix with the shape —
  `BapsTableSortRow`, `InternalNavItem`.

## Inputs and outputs

- Inputs are the property they set: `label`, `severity`, `count`, `disabled`.
- Outputs are **what happened**, not a handler slot: `nodeExpand`,
  `filesSelected`, `sortEvent`. Never `onNodeExpand`.
- A two-way binding's partner is `<input>Change`: `visible` + `visibleChange`.
- Story-side action reporters are the mirror image — `onX`, so they cannot
  collide with the emitter. See `storybook.md` § Actions.
