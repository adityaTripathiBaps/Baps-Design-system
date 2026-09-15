# Angular Rules — BAPS Design System

Angular 21, standalone everywhere. These rules are for a **library**, so the
audience is another team's application, not a page.

## Component basics

- **Standalone only** — no `NgModule` anywhere in `libs/`.
- Declare `imports` on the component itself, listing the PrimeNG pieces it
  wraps.
- **`inject()` at the top of the class body** — never constructor parameter
  injection.
- Prefer signals for internal state. A public `@Input()` stays a plain input
  unless the component genuinely needs a signal input.

## ViewEncapsulation.None is the house default for wrappers

```ts
@Component({
  selector: 'baps-chip',
  imports: [Chip],
  template: `…`,
  encapsulation: ViewEncapsulation.None,
  styles: `…`,
})
```

Why: the wrapper styles PrimeNG's own DOM (`.p-chip`, `.p-chip-label`), which is
rendered by PrimeNG and therefore carries no emulated-encapsulation attribute. A
scoped rule compiles to `.p-chip[_ngcontent-abc]`, which never matches.

The cost is that these rules are global, so **every selector must be rooted at
the host element**:

```scss
/* CORRECT — cannot leak */
baps-chip .p-chip { … }

/* WRONG — restyles every chip on the page, including a multiselect's */
.p-chip { … }
```

## The element-injector trap — NG0201

**This is the single most expensive mistake in this repository.** Read it before
writing any wrapper that has child components.

PrimeNG children resolve their parent through the **element injector**, which
follows the *declaration* tree, not the render tree. A wrapper that projects
children with `<ng-content>` puts them in a different view from the parent, and
the child throws:

```
NG0201: No provider for Accordion found in NodeInjector
```

`ng-template` + `ngTemplateOutlet` does **not** fix it: a template's content
belongs to its declaration site too. Measured — the panels rendered zero times.

**The pattern that works:** the child component renders nothing and hands its
content over as a `TemplateRef`, so the parent creates every PrimeNG element
inside one view.

```ts
// baps-step — renders NOTHING
@Component({
  selector: 'baps-step',
  template: `<ng-template #content><ng-content /></ng-template>`,
})
export class BapsStep {
  @ViewChild('content', { static: true }) contentTemplate!: TemplateRef<unknown>;
  @Input() value!: string;
}
```

```html
<!-- baps-stepper — writes the PrimeNG tree itself, LITERALLY -->
<p-stepper [value]="value">
  <p-step-list>
    @for (s of steps; track s.value) {
      <p-step [value]="s.value">{{ s.label }}</p-step>
    }
  </p-step-list>
  <p-step-panels>
    @for (s of steps; track s.value) {
      <p-step-panel [value]="s.value">
        <ng-container [ngTemplateOutlet]="s.contentTemplate" />
      </p-step-panel>
    }
  </p-step-panels>
</p-stepper>
```

If the wrapper needs two layout branches (`@if`/`@else`), **write the panels
block literally in both branches**. Factoring it into one `ng-template` and
outletting it from each branch renders nothing, for the same reason.

See `baps-accordion` and `baps-stepper` for working examples.

## Inputs

- Optional inputs are optional in the type too: `@Input() label?: string`.
- A **deliberately unset** input must say so in its doc comment, or the next
  person will "fix" it by giving it a default. `baps-chip.size` is the example:
  leaving it unset preserves geometry that predates the size ramp.
- Boolean inputs are consumed with `[input]="true"` in templates. A plain
  attribute is always a string — `inline="true"` fails with
  `TS2322: Type 'string' is not assignable to type 'boolean'`.
- Expose `ariaLabel` / `ariaLabelledBy` and forward them whenever the wrapped
  PrimeNG component accepts them. A control with no way to give it a name is an
  accessibility bug that only shows up in a consuming app.

## Outputs

- Name outputs for **what happened**, not for a handler slot: `nodeExpand`,
  `sortEvent`, `filesSelected`.
- A two-way binding needs the `xChange` partner: `visible` + `visibleChange`
  makes `[(visible)]` work.
- Re-emit PrimeNG's event rather than inventing a new shape, unless the wrapper
  is genuinely adding information.

## Host bindings over wrapper divs

Put brand/size/state on the host element, not an extra `<div>`:

```ts
host: {
  '[class.baps-sampark]': "brand === 'sampark'",
  '[attr.data-severity]': "severity === 'grey' ? null : severity",
  '[attr.data-size]': 'size ?? null',
}
```

`null` rather than `false`/`''` — an attribute set to an empty string still
matches `[data-size]` in CSS, so a "no size" chip would pick up sized rules.

## Portalled panels escape the host

Anything PrimeNG appends to `<body>` — dialog, drawer, popover, tooltip, select
and tree-select panels — leaves the host's class behind. The brand cannot ride
on a host class for those.

```ts
get resolvedPanelStyleClass(): string {
  const consumer = this.panelStyleClass ?? '';
  if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
  return `${consumer} baps-ds-sampark`.trim();
}
```

The same fact bites tests: a `within(canvasElement)` query cannot see a
portalled panel. Query the document instead — see `storybook.md`.

## Change detection

- `OnPush` for anything with non-trivial rendering.
- **`computed()`, never a method, for anything PrimeNG reads as an input.**
  PrimeNG's `multiSortMeta` setter re-sorts and marks the view dirty, so a
  method returning a fresh array on every pass feeds itself:
  `NG0103`, infinite change detection, three errors per load. The reference has
  to stay stable until the source actually changes.

## Anti-patterns

| Do not | Do instead |
| --- | --- |
| `::ng-deep` | root the selector at the host, with `ViewEncapsulation.None` |
| Constructor injection | `inject()` |
| A wrapper `<div>` for state classes | host bindings |
| `<ng-content>` into a PrimeNG parent | the `TemplateRef` pattern above |
| A method bound to a PrimeNG input | `computed()` |
| Importing a PrimeNG component in an app | import the `baps-*` wrapper |
