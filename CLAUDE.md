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

**Read [AGENTS.md](AGENTS.md) first.** It is the entry point, and every rule
lives in [`.agents/rules/`](.agents/rules/README.md).

This file used to hold the rules inline. It no longer does, on purpose: the same
content was invisible to every agent tool that reads `AGENTS.md` instead of
`CLAUDE.md`, and two copies of a rule drift. One source, linked from both.

## Where things went

| Was in this file | Now |
| --- | --- |
| Architecture, commands, non-negotiables | [AGENTS.md](AGENTS.md) |
| Component conventions, the wrap/do-not-wrap decision, NG0201 | [`.agents/rules/angular.md`](.agents/rules/angular.md) · [`primeng-wrapper.md`](.agents/rules/primeng-wrapper.md) |
| Colour, typography, spacing, borders, radii, states, motion, iconography | [`.agents/rules/design-language.md`](.agents/rules/design-language.md) |
| Styling rules, token flow, `pkg:` imports | [`.agents/rules/styling-tokens.md`](.agents/rules/styling-tokens.md) |
| Tone, copy rules, examples | [`.agents/rules/content-voice.md`](.agents/rules/content-voice.md) |
| Storybook config and conventions | [`.agents/rules/storybook.md`](.agents/rules/storybook.md) |
| File/selector/class naming | [`.agents/rules/naming.md`](.agents/rules/naming.md) |

Nothing was dropped. The design-language spec, including the parts still marked
**target** rather than shipped, is preserved in `design-language.md` with the
token gaps called out.

## One Storybook detail that lives here

A new `.stories.ts` / `.mdx` must also be reachable from
`apps/storybook-host/.storybook/tsconfig.json`'s `include`. Those globs are
separate from the stories glob in `main.ts`, and a file missing from them fails
the build with *"is missing from the TypeScript compilation"* rather than being
quietly skipped.
