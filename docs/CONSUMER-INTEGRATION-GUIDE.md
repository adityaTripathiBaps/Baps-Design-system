# Consumer integration guide

This guide covers installation and runtime setup for applications consuming
the BAPS Design System outside this repository. Check the
[compatibility matrix](VERSIONING-AND-UPGRADE.md#compatibility-matrix) before
starting.

## Current delivery route

`@org/tokens` is a separate publishable package. The current delivery route is
immutable tarballs for integration and early spm-ui testing; a private npm
registry is the intended later route, but no registry or release automation is
configured yet. Its manifest declares `publishConfig.access` as `restricted`
so the scoped package cannot be published publicly by accident.

Source manifests use the pnpm workspace protocol in three places:

- `libs/ui-kit/package.json` peer dependency on `@org/tokens`
- `packages/ui-kit-react/package.json` peer dependency on `@org/tokens`
- `packages/ui-kit-react/package.json` development dependency on `@org/tokens`

An external npm/yarn consumer cannot resolve `workspace:*`. The token and
Angular builds rewrite the built manifests to the exact token version, and
`pnpm pack` rewrites the React manifest. Always build, pack and install the
matching `@org/tokens` tarball with the kit tarball. Never copy a source
manifest into a consumer.

## Install from tarballs

Build and pack in the design-system repository:

```powershell
pnpm nx run tokens:build
pnpm nx run ui-kit:build
pnpm nx run ui-kit-react:build

pnpm --dir dist/libs/tokens pack
pnpm --dir dist/libs/ui-kit pack
pnpm --dir packages/ui-kit-react pack
```

Then install the appropriate kit and the same token version in the consumer.
Angular also installs the peers in the compatibility matrix; React installs
React and React DOM.

```powershell
# Angular
pnpm add path/to/org-tokens-0.0.1.tgz path/to/org-ui-kit-0.1.0.tgz
pnpm add @angular/common@^21.2.0 @angular/core@^21.2.0 `
  @angular/forms@^21.2.0 @angular/platform-browser@^21.2.0 `
  primeng@^21.1.3 @primeuix/themes@^2.0.3 primeicons@^7

# React or Next.js
pnpm add path/to/org-tokens-0.0.1.tgz path/to/org-ui-kit-react-0.1.0.tgz
pnpm add react@^19.2.7 react-dom@^19.2.7 primeicons@^7
```

Tarball filenames are outputs, not repository dependencies. Do not commit
temporary packs or point production CI at a developer's local filesystem.

## Angular setup

Register the PrimeNG preset once in `app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MyBky } from '@org/ui-kit';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: MyBky,
        options: {
          darkModeSelector: '.baps-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, components, primeng, utilities, app-styles',
          },
        },
      },
    }),
  ],
};
```

Standalone components import wrappers directly:

```ts
import { Component } from '@angular/core';
import { BapsButton } from '@org/ui-kit';

@Component({
  selector: 'app-example',
  imports: [BapsButton],
  template: `<baps-button label="Save" />`,
})
export class ExampleComponent {}
```

### Raise the initial bundle budget

A fresh Angular workspace ships a 1 MB `budgets.initial` error threshold, and
the kit plus PrimeNG exceeds it. The consumption proof hit this: `ng build
--configuration production` failed on the budget alone, with nothing wrong in
the application code. Raise it in `angular.json` / `project.json`:

```json
{
  "type": "initial",
  "maximumWarning": "4mb",
  "maximumError": "6mb"
}
```

Measured on that proof — a throwaway Angular 21 app importing **five**
components — the production build emitted a **3.11 MB** main bundle
(480.82 kB transferred) and **385.56 kB** of CSS.

Treat those numbers as a ceiling to plan around, not a target to accept. Five
components should not cost 3.11 MB, so the `@org/ui-kit` barrel is very likely
not tree-shaking and is pulling in more of PrimeNG than the app uses. That is
an open follow-up on our side — whether the barrel needs `sideEffects` work or
per-component entry points. Until it is settled, budget for the figures above
rather than assuming the cost scales with the number of components you import.

## React setup

Import the component package and global CSS in the application entry point:

```tsx
import { BapsButton } from '@org/ui-kit-react';
import '@org/tokens/css';
import '@org/ui-kit-react/styles';
import 'primeicons/primeicons.css';
import './app.css';

export function Example() {
  return <BapsButton label="Save" />;
}
```

Provider-backed components mount their package provider once near the root;
for example, `BapsConfirmProvider` supplies `useConfirm()`.

## Next.js App Router

Load the global CSS from the root layout in token-to-override order:

```tsx
// app/layout.tsx
import '@org/tokens/css';
import '@org/ui-kit-react/styles';
import 'primeicons/primeicons.css';
import './globals.css';
```

Interactive state belongs in a client boundary:

```tsx
'use client';

import { BapsChipsInput } from '@org/ui-kit-react';
import { useState } from 'react';

export function SkillsField() {
  const [skills, setSkills] = useState<string[]>([]);
  return <BapsChipsInput value={skills} onChange={setSkills} />;
}
```

Stateless exports can be rendered from a server component. The repository
type-checks both server and client fixture shapes, but does not pin or execute
a Next.js package version; record and prove one in the compatibility matrix
before claiming a specific Next release is supported.

## CSS, fonts and load order

Preferred global order:

1. `@org/tokens/css`
2. `@org/ui-kit/styles` or `@org/ui-kit-react/styles`
3. `primeicons/primeicons.css` when `pi-*` glyphs are used
4. application CSS in the final `app-styles` layer

The full kit bundle includes the Inter `@font-face`, the shared font custom
properties, all component CSS, both brand scopes and dark aliases. A
per-component import such as `@org/ui-kit/styles/button` or
`@org/ui-kit-react/styles/button` carries no `@font-face` and no
`--font-family`; a consumer choosing that route owns typography and must also
verify any custom-property dependencies used by that component.

The application, not a component partial, applies the root typography:

```css
html {
  font-size: 16px;
  font-family: var(--font-family);
  font-feature-settings: var(--font-feature-settings);
}

button,
input,
textarea,
select {
  font-feature-settings: inherit;
}
```

Both `font-feature-settings` declarations are load-bearing. Without them,
Inter uses different glyph advances and labels measure roughly one pixel
narrower per word while colours, borders, radii and padding still match.

Do not put app overrides ahead of the kit. Keep them last and inside the
configured `app-styles` layer so PrimeNG, kit and application ownership remain
explicit.

## Brand and dark-mode classes

MyBKY is the default. Use `.baps-ds-sampark` for a page/subtree and
`.baps-sampark` for one component instance:

```html
<main class="baps-ds-sampark">...</main>
<baps-button class="baps-sampark" label="Save" />
```

Dark mode must be applied to both `<html>` and `<body>`:

```ts
document.documentElement.classList.toggle('baps-dark', dark);
document.body.classList.toggle('baps-dark', dark);
```

Token references evaluate at `:root`; a class only on `<body>` can compute the
light value before descendants inherit it. Toggling both roots is the measured
safe contract.

## Icons

- PrimeNG `icon`/`styleClass` inputs use PrimeIcons (`pi pi-search`) and need
  `primeicons/primeicons.css`.
- Product icons use the kit's `BapsIcon`/`BAPS_ICONS` set and inherit
  `currentColor`.
- Both sets may coexist. Do not replace an application's unrelated icon system
  globally during kit adoption.

## Deliberate non-wrappers

- **ToggleButton:** spm-ui keeps PrimeNG `p-togglebutton` for its three call
  sites. `baps-segmented` models a group, not a binary toggle, and three uses do
  not justify another public kit API.
- **ScrollPanel:** six measured uses pass no props. Use a semantic container
  with `overflow: auto`; no wrapper is needed.
- **Scroller:** the one measured spm-ui use is a virtualized table viewport.
  `baps-table` already exposes `virtualScroll` and
  `virtualScrollItemSize`, so there is no separate Scroller export.
- **Chart and Editor:** remain application-level because they would add
  chart.js/Quill dependencies and no kit API has been approved.

A consumer may keep a PrimeNG component where the kit deliberately has no
equivalent. Such usage stays application-owned and must not be presented as a
kit export.

## Verification checklist

- [ ] Package versions match the compatibility matrix.
- [ ] The installed manifests contain real versions, not `workspace:*`.
- [ ] Tokens load before kit CSS; app overrides load last.
- [ ] Inter is served and the root/form-control feature settings are applied.
- [ ] MyBKY and Sampark render in light and dark; dark class is on both roots.
- [ ] PrimeIcons and kit icons render without missing glyphs.
- [ ] Angular production build or React/Next production build succeeds.
- [ ] Unit tests, keyboard interactions and axe checks pass.
- [ ] Real consumer routes are compared with their visual baselines.

## Common pitfalls

- A failed Angular library build leaves the previous `dist` bundle available;
  read the build terminal before debugging a stale UI.
- Adding or renaming a story needs a Storybook restart to rebuild the index.
- Portalled overlays render under `<body>`; pass the kit's supported overlay
  class/key rather than expecting a wrapper host class to reach the portal.
- A source `workspace:*` entry is valid only inside pnpm; inspect the packed
  manifest used by the consumer.
- Per-component CSS is intentionally smaller and may not carry shared fonts or
  every variable another partial defines. Prefer the full bundle until the
  narrow import has been measured.
- Do not claim compatibility from TypeScript alone. Run a real production
  consumer build and preserve its output as evidence.
