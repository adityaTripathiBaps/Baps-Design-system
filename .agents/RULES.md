# RULES — the operating protocol

Canonical. Read this and [`BRAIN.md`](BRAIN.md) **before** anything else, on
every task, including follow-ups inside a task already in progress.

This file governs **how to work**. It does not restate what to build — the
domain rules in [`rules/`](rules/README.md) own that, and duplicating them here
would create exactly the drift `CLAUDE.md` was emptied to prevent.

**Precedence when guidance conflicts:**
user's explicit instruction → this file → `BRAIN.md` → `rules/*` → skills →
general defaults.

---

## TASK START — in order, every time

1. Read this file.
2. Read [`BRAIN.md`](BRAIN.md).
3. Read the rule(s) in [`rules/`](rules/README.md) matching what you are about
   to touch. `primeng-wrapper.md` and `styling-tokens.md` before any component.
4. Inspect the actual repository, code and config. Never work from memory of
   how it "probably" looks.
5. Choose the smallest correct approach.
6. Only then edit code.

## TASK COMPLETION — in order, every time

1. Confirm only the intended files changed (`git status`).
2. Run the relevant verification — see **Verify** in `BRAIN.md`.
3. Confirm no regression in public API, Storybook, accessibility or tokens.
4. Update `BRAIN.md` only if durable project knowledge changed.
5. Return a short, accurate report. State failures plainly, with the output.

---

## Scope

- **Smallest safe change.** No overengineering, no speculative abstraction.
- **Reuse first.** Search for an existing component, helper, util, style, token
  or pattern before writing a new one. Most things already exist here.
- **Do not touch unrelated files.** No drive-by reformatting; Prettier only on
  files the task actually changes.
- **Do not move, rename, delete or restructure** without a real requirement.
- **Preserve** existing APIs, behaviour, styling, architecture and consumer
  compatibility unless the task is explicitly to change them.
- **No new dependencies, wrappers, abstractions or architecture** without
  approval. `ramp.ts` exists because a dependency was removed, not added.

## Honesty

- **Never guess.** Measure. Several "obvious" conclusions in this repo's history
  were wrong until something was actually rendered and read back.
- **Never suppress.** No `@ts-ignore`, no `eslint-disable`, no `any`, no skipped
  or loosened test, no `NOSONAR` to make a gate pass. A gate that cannot pass
  honestly is a finding — report it.
- **Report blockers** — risks, missing requirements, open decisions — instead of
  picking for the user and moving on.
- **Filtering output hides failures.** Grepping a command's output has masked a
  non-zero exit here more than once. Check the exit code.

## Output

- Minimal, concise, accurate. No preamble, no restated plan, no progress
  narration, no summary of what you are about to do.
- Report what happened, what it measured, and what is next. Nothing else.
- Long tables and logs belong in a file, not in chat.

## Permissions — ask first

Never without explicit permission in the current conversation:

- commit, merge, push, or create/delete a branch, tag or worktree
- install, add, remove or upgrade a dependency
- any change to a public export (package entry point or barrel) — treat these
  as public API; a breaking change needs approval and a changelog entry
- deleting or overwriting files the user did not ask you to touch

Approved multi-step work (a batch, a phase) continues without stopping.
Pause only for a real blocker or a new decision.

## Design values

- Colour, spacing, typography, radius, shadow and z-index come from tokens.
- Raw values are allowed only for: `0`, `100%` and similar technical values;
  1px borders and hairlines; SVG `viewBox` and path data; computed values; and
  `var(--token, #fallback)` fallbacks, which are defensive and not hardcoding.
- **No token? Flag it. Never invent one.** Which value a missing token should
  carry is a design decision. Record it in `BRAIN.md` → *Open design decisions*
  and finish the rest of the task.
- Approved exceptions live in `BRAIN.md` → *Approved token exceptions*.

## Every component carries its own proof

A new or changed component is not done until it has, in the same change:

- its Storybook story and docs page, reachable from
  `apps/storybook-host/.storybook/tsconfig.json`'s `include`
- its types
- its tests
- semantic HTML, keyboard support, visible focus, ARIA only where a native
  element cannot carry the meaning, and WCAG AA contrast in both brands and
  both colour schemes
