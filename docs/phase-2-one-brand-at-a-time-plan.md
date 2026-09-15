# One brand at a time — audit and plan

**Read-only. Nothing changed.** Approval requested before any edit.

Requirement: selecting a brand in the toolbar should leave only that brand's
components and examples visible. The two brands should never appear together.

---

# Part 1 — Audit (measured)

## The convention already exists, and nothing reads it

16 of 51 story files already carry meta-level tags:

```ts
// Design-system availability — drives the sidebar filter in .storybook/manager.ts.
tags: ['ds:mybky', 'ds:sampark'],
```

**There is no such filter.** `manager.tsx` contains no `setFilter` and nothing
anywhere reads a `ds:` tag. The comment describes a mechanism that was never
built, so the tags are inert and the comment is currently false.

Coverage today:

| | files |
|---|---:|
| `['ds:mybky', 'ds:sampark']` | 11 |
| `['ds:sampark']` | 5 |
| `['ds:mybky']` only | 0 |
| **untagged** | **35** |

Untagged includes both Foundations pages, all four Patterns, and 29 components.

## How "both brands showing" actually happens — three different ways

### 1. Nine stories render both brands in one canvas

Each pins `brand=` per instance, twice, side by side:

| Story | |
|---|---|
| `accordion--brands` | `chip--brands` |
| `input-group--brands` | `multi-select--brands` |
| `segmented--brands` | `tree-select--brands` |
| `link--disabled` | `spinner--sizes` |
| `split-button--with-count` | |

They exist *to* compare. `chip--brands` says so: *"Both brands side by side, so
the pill-vs-rect split is visible without flipping the toolbar."*

(Two earlier candidates were false positives from my first scanner, which sliced
each story to the next `export const` and swallowed the following story's doc
comment. Re-scanned with proper boundaries.)

### 2. Forty-nine stories are pinned to one brand and ignore the toolbar

`SamparkVariants`, `MyBky`, `NumberedSampark`, `RangeMyBKY` and so on. A pinned
`brand="sampark"` is the documented per-instance override, so these render
Sampark no matter what the toolbar says — and they stay listed in the sidebar
under MyBKY.

### 3. Foundations → Colour hardcodes the brand by token prefix

Four stories, enumerating token names directly: `SamparkBrand`,
`SamparkNeutrals`, `SamparkStatus` (Sampark) and `MyBky`. Not driven by the
global at all.

**Foundations → Typography is fine.** Measured: zero brand references. It is
brand-agnostic and needs no work — worth saying, because the request assumed it
had per-brand stories.

### Docs pages

19 MDX pages embed a brand-specific story. **Three embed both brands:**
`form-field.mdx`, `navbar.mdx`, `colour.mdx`. All nine dual-brand stories are
also embedded in their own component's page.

---

# Part 2 — Plan

## The shape: filter what is listed, do not change what renders

The cheapest correct move is to hide the other brand's entries rather than
re-render anything. `experimental_setFilter` is available in the installed
`@storybook/core@8.6.18` — checked in `node_modules`, not assumed — and it is
exactly the mechanism those 16 comments already promise.

So: **finish the convention that was started, and build the filter it describes.**

### Tag semantics

- **Meta tag** = which brands this component exists in. `['ds:mybky','ds:sampark']`
  for most; `['ds:sampark']` for Sampark-only components.
- **Story tag** = which brand a specific story shows. `button--sampark-variants`
  gets `tags: ['ds:sampark']`, which overrides its meta for that one entry.
- **Untagged = visible in both.** A safe default: completing 35 files is
  mechanical but not free, and nothing should vanish because a tag was missed.

### The filter

In `manager.tsx`, one filter keyed on the `designSystem` global:

```
entry has no ds: tag        -> show
entry has ds:<active>       -> show
entry has only the other    -> hide
```

Scaffold brands (`baps`, `appsell`) fall back to MyBKY, matching what the
preview already does.

### The 49 pinned stories need no edit

This is the part that makes the approach cheap. Once `button--sampark-variants`
only appears under Sampark, its pinned `brand="sampark"` is no longer an
inconsistency — it is correct. Filtering alone makes the pinning coherent.

### The nine dual-brand stories — the one real conflict

Filtering cannot fix these; the story itself renders both. Three options:

1. **Tag them `ds:sampark` + `ds:mybky` and hide them under a single-brand
   view** — i.e. give them a third tag such as `ds:comparison` and show them only
   when no brand filter is meaningful. Honest, but it removes a comparison view
   that exists on purpose.
2. **Make them render only the active brand's half.** Preserves the story but
   changes what it renders — and that *does* move baselines.
3. **Leave them visible.** Violates the requirement in nine places.

**Recommendation: 1.** They are comparison tools; a single-brand view is exactly
where a comparison does not belong. But this is the one place the requirement
deletes something deliberate, so it should be your call, not mine.

### Foundations → Colour

Story-level tags: the three Sampark stories get `ds:sampark`, `MyBky` gets
`ds:mybky`. No change to what they render.

### Docs pages

`<Canvas of={…}>` renders regardless of a sidebar filter, so the three both-brand
MDX pages still show both inside the page. Options: leave them (the page is
documentation *about* the system, arguably allowed to show both), or split each
into brand sections. **I would leave them and ask** — this is the second place
the requirement's reach is a judgement call.

## Baseline impact — zero, and here is why

The visual suite reads Storybook's own `index.json` and navigates straight to
`/iframe.html?id=…`. **It never touches the sidebar.** A manager-side filter is a
view concern in the manager app; `index.json` still lists every entry, and every
story still renders exactly as it does today.

Tags are metadata; adding one changes no rendered pixel.

So, with the recommended plan:

| Change | baselines moved |
|---|---:|
| Complete `ds:` tags on 35 files | 0 |
| Sidebar filter in `manager.tsx` | 0 |
| Story-level tags on Colour + the 49 | 0 |
| Hiding the 9 comparison stories (option 1) | 0 — they stay in `index.json` |
| *Option 2 instead (re-render half)* | *9 stories × 2 = 18* |

**Expected: 0 of 536.** If any baseline moves, an assumption here is wrong and I
stop and show you.

## Guardrails

- No story or component deleted. Hiding is a sidebar-view concern; every entry
  stays in `index.json`, keeps its id, and keeps its baseline.
- No component, SCSS or token change.
- `check-inventory.mjs` must still report **45 components, 290 stories, all ids
  intact** — tags do not touch exports.
- No library API change. Tags live in story files; the filter lives in the host.

## Scope

| | |
|---|---|
| Library files edited | 35 story files (add a meta tag), plus story-level tags on the brand-pinned entries — **content, not API** |
| Host files edited | `manager.tsx` (the filter) |
| Components / SCSS / tokens | untouched |
| Public API | unchanged |

The 35-file tagging is the bulk of it and is mechanical. I would do it in one
pass and show you the diff summary before the filter goes in, so the filter is
never the thing that makes something disappear unreviewed.

## Verification

1. `node tools/check-inventory.mjs` — 45 / 290 / ids intact
2. `npx tsc --noEmit -p libs/ui-kit/tsconfig.spec.json`
3. `npx nx visual-test storybook-host` — **536, 0 diffs**
4. In the browser: switch to Sampark and confirm MyBKY-only entries disappear
   from the sidebar and Sampark ones remain; switch back and confirm the reverse;
   confirm a hidden story is still reachable by direct URL (it must be — the
   baseline suite depends on that)

## Two questions before I start

1. **The nine comparison stories** — hide them under a single-brand view
   (recommended), or keep them visible as the one deliberate exception?
2. **The three both-brand docs pages** (`form-field`, `navbar`, `colour`) — leave
   them showing both, or split them into brand sections? Splitting is real MDX
   work and touches documentation content rather than behaviour.
