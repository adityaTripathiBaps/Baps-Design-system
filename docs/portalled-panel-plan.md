# Portalled-panel theme reach — DROPPED, the bug does not exist

**Outcome: no change shipped.** The plan below was written on a premise I had not
measured. When I measured it, the premise was wrong: the page-wide scope already
reaches portalled panels, and every skin was written for both cases from the
start. Shape A was implemented, verified redundant, and reverted. Shapes B and C
were never started.

This file is kept as the record of what was checked, so the same plan is not
written again.

---

## The premise, and why it was wrong

The plan said: a panel appended to `<body>` escapes the page-wide
`.baps-ds-sampark` scope, so the resolvers — which key off the per-instance
`brand` input — are the only hook, and the page-wide case is broken.

Three measurements killed it.

**1. The scope sits on `<html>`, and everything is a descendant of `<html>`.**

```
htmlScope: true    bodyScope: true
```

`preview-head.html` stamps `<html>` before first paint and the
`withDesignSystem` decorator toggles `<body>`. A panel appended to `<body>` is
still inside both. There is nothing to escape.

**2. Every skin already carries both selector forms, deliberately.**
`_drawer-sampark.scss:18` documents it in the file:

```
- .p-drawer.baps-drawer-sampark  — per instance, via brand="sampark"
- .baps-ds-sampark .p-drawer      — page-wide body class
```

and every rule is `:is(.p-drawer.baps-drawer-sampark, .baps-ds-sampark .p-drawer)`.
`_select-sampark.scss:565` says the same thing in prose: *"The descendant form is
still needed for the page-wide case, where the class sits on an ancestor
instead — hence both."*

**3. Drawer is not "wearing the wrong skin".** `baps-drawer-mybky` is an unused
modifier; the Sampark rules still match through the descendant alternative. The
plan called this the one real bug. It is not a bug.

## What misled me

The resolvers read `this.brand` and nothing else, which makes the per-instance
input look like the only hook. And `datepicker.component.ts` asserts the premise
in its own doc comment:

> The panel is portaled to `<body>` … so it escapes both the
> `baps-datepicker.baps-sampark` host class and any `.baps-ds-sampark` ancestor.

The first half is true and load-bearing — the host class genuinely cannot reach
the panel. The second half is false wherever the scope sits on `<html>` or
`<body>`, which is everywhere it is actually set. I quoted that comment into the
plan instead of testing it.

**The comment is worth correcting** so the next reader is not misled the same
way. Not done here: it is a doc-comment edit inside a component file, and this
work was supposed to touch no component.

## Shape A, and how it was verified redundant

Implemented on Select, MultiSelect, TreeSelect and DatePicker, with an internal
`lib/internal/page-scope.ts` helper reading `inject(DOCUMENT)`.

It worked mechanically. With `brand=mybky` forced and the page scope on:

```
hostClass:  (none)                                  ← instance branch false
panelClass: baps-ds-sampark p-component p-select-overlay
```

so the class came only from the page-scope branch. But the rules it enables were
already matching via the descendant form, so the class was additive and changed
nothing.

Reverted in full: four resolvers back to their original text, the helper and its
`internal/` directory deleted, no reference to `pageScopeIsSampark` anywhere.
Verified after the revert — `tsc` clean, barrel still 63 exports, unit tests back
to their exact pre-change state (the same two pre-existing `BapsDrawer` failures,
448 passing of 450), and the 536 baselines untouched.

## The follow-up finding, also measured, also not a bug

Worry: `_select-sampark.scss` scopes on
`:is(.baps-ds-sampark, baps-select.baps-sampark, …, baps-datepicker.baps-sampark)`
and its first block declares **CSS custom properties** that inherit down. In the
per-instance case those properties land on the *host*, and a body-portalled panel
is not a descendant of the host — so does the panel get them?

Measured on `datepicker--overlay` (per-instance `brand="sampark"`, page scope
**off**):

```
htmlScope:     false
hostClass:     baps-sampark baps-ds-sampark …
panelClass:    baps-ds-sampark p-component p-datepicker-panel
overlayBg:     #ffffff
overlayBorder: #bcb9b9
borderColor:   rgb(188, 185, 185)   → #bcb9b9, Sampark Mono/40
radius:        4px                  → Sampark, not the MyBKY pill
```

No bug. Because the resolver stamps `baps-ds-sampark` on the panel, the panel
matches the **first** alternative of the `:is()` and becomes a scope root itself,
so the custom properties are declared on it and inherit into its children. The
`&.`-versus-descendant question never arises. `#bcb9b9` is exactly the value the
SCSS comment describes.

## What this cost, and what it bought

Cost: one implemented-then-reverted change, four measurements, one report.

Bought: the assumption is now disproved in writing, no redundant code was
shipped, and no wrong premise was pinned into eight components. The theming
mechanism is also now documented from measurement rather than inference —
per-instance works by making the panel a scope root, page-wide works by ancestry,
and both paths were already covered.

---

# Original plan, for the record

The plan as approved. Every claim in the "affected components" table is
accurate as a description of the code; only the conclusion — that the page-wide
case was broken — was wrong.

## Affected components — 8

| # | Component | File : line | Current member | Shape |
|---|---|---|---|---|
| 1 | Select | `select/select.component.ts:123` | `resolvedPanelStyleClass` | A |
| 2 | MultiSelect | `multi-select/multi-select.component.ts:178` | `resolvedPanelStyleClass` | A |
| 3 | TreeSelect | `tree-select/tree-select.component.ts:195` | `resolvedPanelStyleClass` | A |
| 4 | DatePicker | `datepicker/datepicker.component.ts:255` | `resolvedPanelStyleClass` | A |
| 5 | Dialog | `dialog/dialog.component.ts:504` | `resolvedPanelStyleClass` | B |
| 6 | Popover | `popover/popover.component.ts:153` | `panelClass` | B |
| 7 | Drawer | `drawer/drawer.component.ts:255` | `panelClass` | C |
| 8 | Tooltip | `tooltip/tooltip.directive.ts:103` | `computedStyleClass` | B |

Shape A: four byte-identical resolvers. Shape B: the same condition inside a
different expression per component. Shape C: Drawer, which always emits a brand
class rather than conditionally adding one.

Also noted at the time, and still true: Dialog already has
`private readonly document = inject(DOCUMENT)` at `:352`, so the plan's "each of
the 8 gains one field" was 7, not 8. And the plan's verification list omitted
`nx test ui-kit`, which matters — seven spec files assert these resolvers'
exact output strings.
