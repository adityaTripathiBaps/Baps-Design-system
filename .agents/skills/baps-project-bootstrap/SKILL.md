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
    baps-app-page/SKILL.md    ← how to build a screen in THIS app, see step 6
    <the nx skills, if this repo is an Nx workspace>
src/<app>/theme/app-shell.theme.ts   ← brand + accent at runtime, see step 7
```

`.agents/skills/` is NOT optional, and the earlier wording that made it
conditional on Nx was wrong. The Nx skills are conditional; a consumer skill is
not. Without one, the next agent to open the repo reads eleven rule files and
still has to work out which components it may use — which is the only question
that actually blocks a screen.

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

## Step 3b — the consumer may not be Angular

`consuming-ui-kit.md` in `.agents/templates/` is written for an Angular app,
and four of its five sections do not exist outside one. Do not copy it into a
React or Next consumer and leave the Angular parts in — write the five that
actually apply:

| Angular section | React / Next replacement |
| --- | --- |
| `cssLayer` in `app.config.ts` | **Import order.** `@org/tokens/css` then `@org/ui-kit/styles`, once, at the entry. Reversed, every `var(--…)` falls back silently. |
| Style partials via `pkg:` | **Use the bundle, not the per-component paths.** They are not self-sufficient: some stylesheets read custom properties another declares, and a miss falls back silently — measured, `_file-upload.scss` reads `--input-border-default`, declared in the input stylesheet. |
| What hot-reloads / `.angular/cache` | Vite and Next both reload CSS; the design system has to be REBUILT (`nx build ui-kit`) because the dependency is a `file:` path into `dist/`. Wire that into `predev`. |
| Pasting from Storybook | **Take the React tab, not PrimeNG-Angular.** Drop the `brand` input — it feeds PrimeNG `dt` tokens and does nothing outside Angular. Inputs become classes. |
| The brand scope | Unchanged: `baps-ds-sampark`, `baps-sampark`, `baps-dark`. This is the one section that carries verbatim. |
| Font & FS Allow (Vite) | **Allow outside assets.** Vite blocks assets from outside the project root by default. Set `server: { fs: { allow: ['..'] } }` in `vite.config.ts`, or the `@org/ui-kit` font file `.ttf` will fail to load. Also, ensure `font-family: var(--font-family)` is set on `body`, and `table, th, td` inherit `font-feature-settings` in your global CSS. |

And add the section the Angular template has no reason to carry: **which
components may be used at all.** Most may not. Point at the generated
**Guidelines › Component status** page rather than listing them, because a list
copied into an app drifts and that page cannot.

## Step 4 — verify, do not assume

The host page owes the design system four things before any of this renders
correctly, and none of them fails loudly:
[`.agents/rules/app-shell-host-page.md`](../../rules/app-shell-host-page.md).
Copy that rule into the consumer and work its checklist — `box-sizing`, the
rem baseline and font features, the brand scope, and the favicon.

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

## Step 6 — the consumer skill

Rules say what is forbidden. A skill says what to DO, and for a consuming app
there is exactly one question worth answering: **which components may I use,
and what do I do about the one I need that is missing?**

`.agents/skills/baps-app-page/SKILL.md` answers it:

1. Check the generated status report first — `node tools/check-snippets.mjs --report`
   in the design system. Never a list copied into the app; that drifts.
2. Available: take the React tab, drop `brand`, map inputs to classes, keep
   the semantics.
3. Missing, in this order: build the screen from what IS available → if it is
   layout chrome, plain HTML plus tokens with **no hex fallbacks** → if it is
   genuinely the component, fix it in the design system → if it has no tokens,
   **stop**.

That last rung is the one that matters. A component with no tokens is a design
decision nobody has made yet, and inventing the colours in an app is how a
design system dies quietly — quietly, because it still looks right.

## Step 7 — the theme file

Full contract: [`.agents/rules/app-shell-theme.md`](../../rules/app-shell-theme.md).
Copy that rule into the consumer like any other. The summary below is what the
bootstrap itself has to get right.

Every app shell gets `src/<app>/theme/app-shell.theme.ts`. The Angular one is
`baps-app-shell/src/app/theme/app-sell.theme.ts`; it does two things, and only
one of them carries:

1. writes the brand's primary ramp onto `document.documentElement` as CSS
   custom properties — **pure DOM, carries everywhere**, and
2. hands a matching preset to PrimeNG through `usePreset()` — **Angular only.**

A React or Next consumer has no PrimeNG components for a preset to re-skin, so
importing `@primeuix/themes` there adds a dependency to drive machinery with
no output. Write step 1 alone.

Build the ramp with `buildRamp` from `@org/ui-kit/ramp` — no dependencies, and
`ramp.spec.ts` asserts it matches `palette()` exactly on eleven colours. A
consumer outside Angular therefore needs no PrimeNG package at all.

**Important**: The theme file must support resolving standard CSS color names and 
swatch names (e.g., 'emerald', 'blue') just like the Angular reference. It must 
include a `NAMED_COLORS` dictionary and a `resolveColorHex` function that handles 
hex codes, `NAMED_COLORS`, and canvas-based browser runtime color resolution.

Copy the step mapping from `DS_RAMPS` in `libs/ui-kit/src/lib/theme/accent.theme.ts`
verbatim — `--color-sampark-primary-{0,10,20,40,60,80,100}` from ramp steps
`{50,100,200,400,600,700,800}` — so the two cannot disagree. Keep the list of
written properties so the next call can undo it exactly; calling with no ramp
must remove the inline properties rather than write the defaults back, or the
stylesheet's own values never apply again.

Brand and dark mode belong in the same file, because they are the same
mechanism: `baps-ds-sampark` and `baps-dark` as classes, and nothing else.

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
- [ ] `.agents/skills/baps-app-page/SKILL.md` — the which-components decision procedure
- [ ] `theme/app-shell.theme.ts` — brand, dark mode, and the accent ramp
- [ ] Non-Angular consumer: step 3b's five sections written, not the Angular ones copied
- [ ] Build clean (`ng serve` / `vite build` / `next build`), 0 errors
