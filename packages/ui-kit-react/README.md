# @org/ui-kit-react

Typed React components for the BAPS Design System. This package renders native
React markup and never imports Angular or PrimeNG runtime code.

The visuals are not reimplemented here. The build copies the canonical,
token-driven CSS produced by `@org/ui-kit` and generates the React icon
registry from the same framework-free source used by Angular. Applications
load the shared token values and this package's copy of the canonical CSS once:

```tsx
import '@org/tokens/css';
import '@org/ui-kit-react/styles';
```

```tsx
import { BapsButton, BapsIcon } from '@org/ui-kit-react';

export function SaveAction() {
  return <BapsButton label="Save" icon="check" />;
}
```

These two components are server-renderable. Add `'use client'` only in a
Next.js module that supplies event handlers or other client behaviour.

Batch 2 currently exports 26 reusable components. The verified checkpoint is
24 DONE / 2 PARTIAL: Link remains partial for its live contrast finding, and
Progress Bar remains partial for the Angular/PrimeNG accessibility regression
gate. See [STATUS.md](./STATUS.md) for the component-by-component result;
documentation snippets do not count as implementations.

Run verification through Nx:

```text
pnpm exec nx run ui-kit-react:test
pnpm exec nx run ui-kit-react:verify-consumers
```
