<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# BAPS Design System

A shared component library, token pipeline and Storybook site for BAPS's digital
products (member database, event management, donation management, daily Satsang
activities).

This is a **wrapper library, not an application**: `@org/ui-kit` wraps PrimeNG,
`@org/tokens` holds the design tokens, and two consuming apps resolve them out
of `dist/` through a `node_modules` symlink. Most of the rules follow from that
shape.

```
libs/tokens/          Design tokens (Style Dictionary). Source JSON -> generated CSS + TS
libs/ui-kit/          Angular component library (standalone wrappers around PrimeNG)
libs/migration-data/  Audit docs & v17 -> v21 component mapping
apps/storybook-host/  Storybook 8.6 — this library's only UI surface
tools/                Verification scripts. Use them; do not eyeball.
```

Angular 21 · PrimeNG 21 · pnpm · Storybook 8.6 · Nx.

Consuming apps: `baps-app-shell` (Sampark, :4200) and `baps-app-mybky` (MyBKY,
:4300). Storybook runs on :4400.

## Rules — read the one that matches what you are about to touch

Every rule lives in [`.agents/rules/`](.agents/rules/README.md). Those files are
the single source of truth; this file and `CLAUDE.md` point there rather than
restating them, so Claude, Cursor, Codex, Gemini and OpenCode all read the same
content instead of five drifting copies.

| Rule | Read it before |
| --- | --- |
| [angular.md](.agents/rules/angular.md) | writing any component, directive or service |
| [primeng-wrapper.md](.agents/rules/primeng-wrapper.md) | adding a component, or deciding whether to wrap one |
| [styling-tokens.md](.agents/rules/styling-tokens.md) | writing SCSS, or reaching for a colour |
| [brand-theming.md](.agents/rules/brand-theming.md) | anything that differs between MyBKY and Sampark |
| [storybook.md](.agents/rules/storybook.md) | any story, docs page or control |
| [accessibility.md](.agents/rules/accessibility.md) | any interactive component |
| [naming.md](.agents/rules/naming.md) | creating any file |
| [formatting.md](.agents/rules/formatting.md) | before committing |
| [testing.md](.agents/rules/testing.md) | adding tests, or when a suite fails |
| [publishing.md](.agents/rules/publishing.md) | `dist/`, build scripts, Nx targets |
| [git-commit.md](.agents/rules/git-commit.md) | writing a commit or PR |

Read `primeng-wrapper.md` and `styling-tokens.md` before writing any component —
they carry the two constraints that cause the most rework.

## Skills

| Skill | Use it for |
| --- | --- |
| `baps-component` | adding a component — wrapper, tokens, partials, stories, docs |
| `baps-storybook-pillars` | controls, interactions, actions, design refs, a11y for one component |
| `baps-project-bootstrap` | creating or repairing the agent files for a consuming app |
| `nx-*` | workspace navigation, generators, task running |

## Non-negotiables

1. **Never hardcode** a colour, spacing, radius, shadow or font value. Tokens are
   the source of truth.
2. **Never delete, rename or merge a component**, and never change a public API
   without asking. Consuming apps are separate repositories, so a rename is a
   silent break.
3. **Never break a story.** Stories are this library's documentation and half its
   tests.
4. **Never change component CSS to make a test or snapshot pass.** The existing
   appearance is the baseline; fix the test.
5. **Ask before adding a dependency.** Dev-only tooling goes in workspace
   devDependencies so the published package is unaffected.
6. **Measure, do not assume.** Read the rendered DOM and computed values rather
   than reasoning from the CSS. `tools/` has the scripts.

## Commands

```bash
npx nx run storybook-host:storybook                  # Storybook on :4400
npx nx build tokens && npx nx build ui-kit           # tokens first — ui-kit depends on it
node tools/check-styles-literals.mjs                 # backtick guard — run before every build
npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json   # type-checks STORIES (lib config excludes them)
node tools/check-interactions.mjs <story-id>         # interaction verdicts
node tools/check-panels.mjs <story-id>               # which Storybook panels are present
node tools/a11y-audit.mjs                            # axe, one story per component
npx nx visual-test storybook-host                    # visual baseline
```

## Two things that mislead if you do not know them

- **Adding or renaming a story needs a Storybook restart.** HMR does not rebuild
  the MDX/CSF index link. The symptoms are an empty Interactions panel on a
  story that has a `play`, or `Could not find or load CSF file` — which takes
  down `index.json`, so *every* story appears broken.
- **A failed Angular build serves the last good bundle**, so a consuming app
  looks stale rather than broken. Read the terminal before debugging the CSS.
