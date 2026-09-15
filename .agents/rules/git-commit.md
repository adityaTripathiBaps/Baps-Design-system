# Git Commit Rules

**Conventional Commits**, matching the MyBKY workspace so history reads the same
across BAPS repositories.

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

## Types

| Type | When |
| --- | --- |
| `feat` | a new component, variant, token or public input |
| `fix` | a bug in a component, token or build |
| `refactor` | change with no behaviour or appearance difference |
| `docs` | MDX pages, rules, README, comments only |
| `test` | specs, interaction stories, visual baselines |
| `style` | formatting only — never a visual change to a component |
| `chore` | tooling, dependencies, config |
| `build` | `project.json`, `nx.json`, tsconfig, publish scripts |
| `ci` | workflow changes |
| `perf` | measurable performance work |

> `style` means *code* formatting. A change to how a component **looks** is
> `feat` or `fix`, because it changes the product.

## Scope

The library, app or component that changed:

| Changed area | Scope |
| --- | --- |
| `libs/ui-kit/src/lib/components/chip/` | `chip` |
| `libs/ui-kit` broadly | `ui-kit` |
| `libs/tokens` | `tokens` |
| `apps/storybook-host` | `storybook` |
| `.storybook/` config | `storybook` |
| `.agents/`, `CLAUDE.md`, `AGENTS.md` | `agents` |
| Root workspace config | `workspace` |
| Publish / build scripts | `build` |

Prefer the **component** scope over the library when a change is local to one —
`fix(chip):` is more useful in a log than `fix(ui-kit):`.

## Description

- Imperative, present tense: "add", not "added" or "adds".
- Lower case, no trailing period.
- Say what changed, not which file: `fix(chip): stop label clipping descenders`,
  not `fix(chip): update chip.component.ts`.

## Body — where the reasoning goes

Required when the change is not self-evident. This repository's history is a
real reference; keep it that way.

Include, when they apply:

- the **measured** fact behind the change (`measured 1 -> 0 in a real browser`)
- the Figma node id
- what was ruled out, and why
- a conflict between sources and which one you followed

```
fix(tokens): correct mybky disabled ink to Mono/40 #8d9ba5

Was #bd9ba5, carried from events-ui and repeated in both badge style
guides. The Figma disabled badge (22465:95659) binds this text to
Mono/40 (Disable Item) = #8d9ba5, and Sampark's disabled badge
(13197:90751) binds ITS text to its own Mono/40 — so both brands read
the same token and #bd9ba5 was a one-character slip the guides
inherited.
```

## Breaking changes

A renamed or removed component, input, token or CSS class is **breaking** —
consuming apps are separate repositories.

```
feat(chip)!: rename size ramp to xs/s/m/l

BREAKING CHANGE: `size="small"` is now `size="s"`. …
```

**Ask before making one.** The default answer is to add and deprecate, not
rename.

## What not to commit

`dist/`, `documentation.json`, `libs/tokens/build/`, `.angular/`, `.nx/`, and
demo scaffolding left in a consuming app.

Do **not** commit a visual baseline update in the same commit as the change that
caused it — split them, so the baseline diff is reviewable on its own.

## Branches and PRs

- Branch from `master`. Never commit to `master` directly.
- `feature/<ticket>-<slug>`, `fix/<ticket>-<slug>`, `chore/<slug>`.
- A PR body says what changed, what was measured, and what was deliberately
  left out.
- Commit or push **only when asked**.
