<!-- TEMPLATE — copied into a consumer repo by the baps-project-bootstrap skill.
     Replace <APP>, <BRAND>, <SCOPE_CLASS>, <PRESET>, <PORT>. -->

# Consuming @org/ui-kit — <APP>

This app renders the **<BRAND>** brand. It consumes `@org/ui-kit` and
`@org/tokens` from the design system's `dist/`, through a `node_modules`
symlink, with `preserveSymlinks: true`.

**Never import from `primeng/*`.** Import the `baps-*` wrapper. That indirection
is the whole point of the library — it lets the design system re-skin or migrate
PrimeNG without touching this app.

---

## 1. `cssLayer` is mandatory

`src/app/app.config.ts`:

```ts
providePrimeNG({
  theme: {
    preset: <PRESET>,
    options: {
      darkModeSelector: '.baps-dark',
      cssLayer: {
        name: 'primeng',
        order: 'theme, base, components, primeng, utilities, app-styles',
      },
    },
  },
});
```

**Without it, PrimeNG's CSS is unlayered and beats every design-system rule
regardless of specificity.** Layered CSS always loses to unlayered CSS — that is
the cascade, not a specificity contest.

Measured symptom: an open accordion panel's header rendered white, because
PrimeNG's `.p-accordionpanel-active > .p-accordionheader` (0,4,0) beat the DS
rule (0,1,1). Storybook always had `cssLayer`, which is why the same component
looked right there and wrong here.

## 2. The brand scope

`src/index.html`:

```html
<body class="<SCOPE_CLASS>">
```

That page-wide class is enough for **most** components — a chip's 4px radius
under Sampark proves it, with no `brand` input anywhere.

**But some components read PrimeNG `dt` tokens, chosen in TypeScript**, and
those need the input even under a correct page scope:

```html
<baps-datepicker [inline]="true" brand="<BRAND>" [(ngModel)]="date" />
```

Measured: a `baps-datepicker` under the Sampark page scope drew the SCSS skin
correctly and still used MyBKY `dt` tokens, because `brand` defaults to
`'mybky'`.

**Check whether a component has a `dt` getter before assuming the scope is
enough.** Portalled panels (dialog, drawer, popover, tooltip, select,
tree-select) escape the scope entirely and rely on the wrapper stamping it onto
the panel.

## 3. Style partials — the library ships SCSS as source

A component's skin only exists in an app that `@use`s its partial:

```scss
// src/styles.scss
@use 'pkg:@org/tokens/build/css/tokens.css';
@use 'pkg:@org/ui-kit/src/lib/styles/layout/fonts';
@use 'pkg:@org/ui-kit/src/lib/styles/layout/common';

// One @use per component in use. Base first, then the brand override —
// a -sampark partial re-points what the base partial declares.
@use 'pkg:@org/ui-kit/src/lib/styles/components/checkbox/checkbox';
@use 'pkg:@org/ui-kit/src/lib/styles/components/select/select';
@use 'pkg:@org/ui-kit/src/lib/styles/components/select/select-sampark';
```

**A component with no skin here, and a perfect skin in the other app, is a
missing `@use` — not a broken component.** Check `styles.scss` before anything
else. Real cases: a chip with no skin because only `select-sampark` was loaded
(which sets just radius and height); a checkbox with a 2px border because no
checkbox partial was loaded at all.

Some partials `@use` others, and Sass emits a file once — so `input` does not
need its own line when `input-sampark` already pulls it in. `select` has no such
back-reference and does.

## 4. Never restyle a design-system component here

If a `baps-*` component looks wrong, the fix is in the library. A local override
means this app and the other one now disagree, and the next library update will
fight it.

The one thing that belongs here is **layout** — where a component sits, how much
space around it. Not its colour, radius, height or type.

## 5. What hot-reloads

| Change in the design system | Here |
| --- | --- |
| SCSS partial | hot-reloads through the symlink |
| Component **TS** | `rm -rf .angular/cache` and restart |
| Token JSON | rebuild tokens in the DS, then as above |

**Angular serves the last good bundle when a build fails.** A page that looks
merely stale is usually a failed compile — read the terminal before debugging
the CSS.

## 6. Pasting a snippet from Storybook

Show code gives the **markup only**. Three things it cannot carry, in the order
they bite:

1. **The import.** The tag is inert without its class in `imports`, and Angular
   says `NG8001: 'baps-split-button' is not a known element`. The class name is
   the selector in PascalCase with the dashes dropped — `baps-split-button` is
   `BapsSplitButton`.
2. **Brackets on non-string inputs.** A plain attribute is *always* a string, so
   `inline="true"` sets a boolean input to `"true"` and Angular rejects it with
   `TS2322`. Booleans and numbers need `[inline]="true"`, `[count]="8"`; text
   inputs are fine bare.
3. **Anything the snippet references on the component.** `[(ngModel)]="date"`
   needs a `date` property and `FormsModule`; `(click)="save()"` needs a
   `save()` method. `TS2339: Property 'date' does not exist`.

All three fail at build time, and the dev server keeps serving the last good
bundle — so the page does not show an error, it stops changing.

## 7. Do not run two design-system watchers

Both consumer apps have `ds:watch` (`nx watch … -- nx build ui-kit`). Running
`npm run dev` in **both** means two `nx build ui-kit` processes writing the same
stage directory on every edit.

Run `npm run dev` in at most one app, `npm start` in the other, or build the
library yourself and use `npx ng serve`.

## Verification

```bash
grep -n "cssLayer" src/app/app.config.ts
grep -n "baps-ds-" src/index.html
grep -c "@use 'pkg:@org/ui-kit" src/styles.scss
ls -la node_modules/@org/
npx ng serve        # expect 0 errors and 0 warnings
```

Then **measure**, do not eyeball:

```js
getComputedStyle(document.querySelector('.p-chip')).borderRadius;
// Sampark → "4px"   MyBKY → "99px"
```
