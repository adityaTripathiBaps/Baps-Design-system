# BAPS Design System — Agent Rules

Every file in this folder is a **rule set an agent must follow** when working in
this repository. They are the single source of truth: `CLAUDE.md` and
`AGENTS.md` point here rather than restating them, so Claude, Cursor, Codex,
Gemini and OpenCode all read the same rules instead of four drifting copies.

## Read order

Start with the rule that matches what you are about to touch. Read
`primeng-wrapper.md` and `styling-tokens.md` before writing any component — they
carry the two constraints that cause the most rework.

| Rule | Read it before |
| --- | --- |
| [`angular.md`](angular.md) | writing or changing any component, directive or service |
| [`primeng-wrapper.md`](primeng-wrapper.md) | adding a component, or deciding whether to wrap one |
| [`styling-tokens.md`](styling-tokens.md) | writing any SCSS, or reaching for a colour |
| [`design-language.md`](design-language.md) | choosing a value — colour, type, spacing, radius, motion, icon |
| [`brand-theming.md`](brand-theming.md) | anything that must look different in MyBKY vs Sampark |
| [`storybook.md`](storybook.md) | adding or editing a story, docs page or control |
| [`accessibility.md`](accessibility.md) | any interactive component, and before closing one out |
| [`content-voice.md`](content-voice.md) | writing any user-facing string, label or docs page |
| [`naming.md`](naming.md) | creating any file |
| [`formatting.md`](formatting.md) | before committing |
| [`testing.md`](testing.md) | adding tests, or when a suite fails |
| [`publishing.md`](publishing.md) | touching `dist/`, the build scripts, or Nx targets |
| [`git-commit.md`](git-commit.md) | writing a commit or PR |

`styling-tokens.md` and `design-language.md` are a pair: the first says **how**
to consume a value, the second says **what the value should be**.

## What this repository is

A **wrapper library**, not an application. `@org/ui-kit` wraps PrimeNG and
`@org/tokens` holds the design tokens; two consuming apps
(`baps-app-shell` / Sampark, `baps-app-mybky` / MyBKY) resolve them out of
`dist/` through a `node_modules` symlink.

That shape drives most of the rules. The library ships **SCSS as source**, so a
consuming app's Sass has to reach it through the `pkg:` importer, and the
published `exports` map has to allow the path. Storybook is the library's only
UI surface, which is why the Storybook rules are as long as the component ones.

## Non-negotiables

These hold regardless of what a task seems to need. If a task appears to require
breaking one, stop and ask.

1. **Never hardcode a colour, spacing, radius, shadow or font value.** Tokens
   are the source of truth — see `styling-tokens.md`.
2. **Never delete, rename or merge a component**, and never change a public API
   without asking. Consuming apps are separate repositories; a rename is a
   silent break.
3. **Never break a story.** Stories are the library's test surface and its
   documentation at once.
4. **Never change component CSS to make a test or snapshot pass.** The existing
   appearance is the baseline. Fix the test.
5. **Ask before adding a dependency.** Dev-only tooling belongs in the
   workspace devDependencies so the published package stays unaffected.
6. **Measure, do not assume.** Read the rendered DOM and computed styles rather
   than reasoning from the CSS. See `testing.md` for the tools that do this.

## Adding a rule

Keep one topic per file, lead with the rule, and show CORRECT/WRONG code rather
than prose where a snippet is clearer. Record **why** a rule exists when the
reason is a real failure — a rule with its scar attached survives; a bare
prohibition gets argued away.
