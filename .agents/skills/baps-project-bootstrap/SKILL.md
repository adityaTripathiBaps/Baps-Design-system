---
name: baps-project-bootstrap
description: Create or repair the agent files for a BAPS project that consumes @org/ui-kit. USE WHEN a new app is created (app-shell, app-mybky, or any new consumer), when a repo has no .agents/ or AGENTS.md, when agent rules have drifted between BAPS repos, or when the user asks to "set up agent files", "standardise the agent config", or "bootstrap a new project". Generates AGENTS.md, CLAUDE.md, .agents/rules/, and the consumer wiring checklist from the design system's canonical templates.
---

# Bootstrap BAPS Agent Files

Every BAPS repository that consumes `@org/ui-kit` gets the same agent
architecture. This skill creates it, or repairs one that has drifted.

The design system is the **source of truth**. A consuming app does not restate
the library's rules — it links to them and adds only what is local to itself.

## When this runs

- A new consumer app is created (the `baps-app-shell` / `baps-app-mybky` shape).
- A repo has no `.agents/` or no `AGENTS.md`.
- Rules have drifted between repos and need re-standardising.

## Step 0 — locate the design system

```bash
# Sibling by convention; BAPS_DS_PATH overrides.
ls ../baps-design-system/.agents/rules
```

If it is not a sibling, ask for the path rather than guessing. Everything below
copies or links from `<ds>/.agents/`.

## Step 1 — the file set

Create exactly this in the consumer repo:

```
AGENTS.md                     ← entry point for every agent tool
CLAUDE.md                     ← thin, points at AGENTS.md
.agents/
  rules/
    README.md                 ← read order + non-negotiables (local copy)
    consuming-ui-kit.md       ← THE important one, see step 3
    app-architecture.md       ← routes, features, state — local to this app
    <symlink or copy of the DS rules that apply>
  skills/
    <the nx skills, if this repo is an Nx workspace>
```

**Which DS rules apply to a consumer:**

| Rule | Consumer needs it? |
| --- | --- |
| `styling-tokens.md` | **yes** — never hardcode, and the `pkg:` import mechanics |
| `brand-theming.md` | **yes** — which brand, page scope vs per-instance |
| `naming.md` | **yes** — so `baps-*` usage stays consistent |
| `formatting.md` | **yes** |
| `git-commit.md` | **yes** |
| `accessibility.md` | **yes** — the a11y contract is shared |
| `angular.md` | partly — the component basics; the wrapper/NG0201 half is library-only |
| `primeng-wrapper.md` | **reference only** — apps must not touch PrimeNG directly |
| `storybook.md` | no — unless the app has its own Storybook |
| `publishing.md` | **reference only** — but read "what hot-reloads" |
| `testing.md` | partly — the measure-don't-reason rule always applies |

Prefer **copying** over symlinking: these repos are separate git repositories
(some are not even git repos), and a symlink to a sibling breaks the moment
someone clones one alone. Copy, and put the provenance at the top of each file:

```md
<!-- Copied from baps-design-system/.agents/rules/styling-tokens.md
     Do not edit here. Change it in the design system and re-run
     the baps-project-bootstrap skill. -->
```

## Step 2 — AGENTS.md is the entry point, CLAUDE.md is a pointer

Two files, because different tools read different names, and **one source**.

`AGENTS.md`:

```md
<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->
… nx block, if this is an Nx workspace …
<!-- nx configuration end-->

# <App Name>

<one paragraph: what this app is, which brand, which port>

## Rules

Read the rule that matches what you are about to touch. These are copies of the
BAPS Design System rules — change them there, not here.

- [`.agents/rules/consuming-ui-kit.md`](.agents/rules/consuming-ui-kit.md) — **read first**
- [`.agents/rules/app-architecture.md`](.agents/rules/app-architecture.md)
- [`.agents/rules/styling-tokens.md`](.agents/rules/styling-tokens.md)
- …

## Non-negotiables

1. Never import from `primeng/*`. Import the `baps-*` wrapper.
2. Never hardcode a colour, spacing, radius, shadow or font value.
3. Never restyle a design-system component locally — fix it in the library.
4. Read the terminal before debugging the CSS: a failed compile serves the last
   good bundle, so the page looks stale rather than broken.
```

`CLAUDE.md`:

```md
# <App Name>

See [AGENTS.md](AGENTS.md). Every rule lives in `.agents/rules/`.
```

Do not duplicate content between them. Two copies drift; one drifted copy is
worse than none, because an agent will believe it.

## Step 3 — `consuming-ui-kit.md` is the file that earns its keep

This is the app-side rule that does not exist in the library, and every failure
in a consuming app so far has been one of these five things. Generate it from
`<ds>/.agents/templates/consuming-ui-kit.md` and fill in the brand.

It must cover:

1. **`cssLayer` in `app.config.ts`** — without it PrimeNG's unlayered CSS beats
   every design-system rule regardless of specificity.
2. **The brand scope** — `.baps-ds-sampark` on `<body>` in `index.html`, plus
   which components additionally need a `brand` input because they read PrimeNG
   `dt` tokens.
3. **Style partials** — the library ships SCSS as source; a component with no
   skin is a missing `@use` in `src/styles.scss`, not a broken component.
4. **What hot-reloads** — SCSS yes, TS/component no (`rm -rf .angular/cache`).
5. **Pasting from Storybook** — the import, brackets on non-string inputs, and
   anything the snippet references on the component.

## Step 4 — verify, do not assume

```bash
# The five things that actually break, checked in order:
grep -n "cssLayer" src/app/app.config.ts            # 1
grep -n "baps-ds-" src/index.html                   # 2
grep -c "@use 'pkg:@org/ui-kit" src/styles.scss     # 3
ls -la node_modules/@org/                           # symlink present?
npx ng serve                                        # 0 errors, 0 warnings
```

Then open a page and **measure** one component's computed style to confirm the
brand actually landed — do not trust the screenshot:

```js
getComputedStyle(document.querySelector('.p-chip')).borderRadius;
// Sampark → "4px"   MyBKY → "99px"
```

## Step 5 — record what is local

Anything genuinely specific to this app — its routes, its API, its auth — goes
in `app-architecture.md`, generated from
`<ds>/.agents/templates/app-architecture.md`. **Not** into a copied library
rule: if you find yourself editing a copied rule, the change belongs in the
design system.

## Rules to add WHEN the app gains the concern

Do not create empty stubs — an empty rule file reads as "we have no rule". These
four already exist and are agreed across BAPS. Copy them from
`events-ui/.agents/rules/` the day the app grows that concern, rather than
writing new ones:

| Copy | When the app gains |
| --- | --- |
| `api.md` | any HTTP call — base-URL injection tokens, error handling, interceptors |
| `auth-security.md` | login — BAPS SSO (OIDC) only, token handling, never a login form |
| `logging.md` | a logger — always `LoggerService`, never `console.*` in committed code |
| `solid-ui.md` | more than a handful of screens — smart/dumb split, DI boundaries |

Neither consumer app has a backend, auth or a logger yet, which is why none of
them ships these today. That is a deliberate omission, not an oversight — record
it in `app-architecture.md` so the next person knows.

## Checklist

- [ ] `AGENTS.md` — entry point, links every rule, lists non-negotiables
- [ ] `CLAUDE.md` — pointer only, no duplicated content
- [ ] `.agents/rules/README.md` — read order
- [ ] `.agents/rules/consuming-ui-kit.md` — filled in with this app's brand
- [ ] `.agents/rules/app-architecture.md` — local architecture
- [ ] Copied DS rules carry the "do not edit here" provenance header
- [ ] `cssLayer`, brand scope, and style partials verified by command
- [ ] One component's computed style measured to confirm the brand
- [ ] `npx ng serve` clean
