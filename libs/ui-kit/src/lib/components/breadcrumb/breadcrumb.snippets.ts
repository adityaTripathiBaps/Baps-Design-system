/*
 * Route B: no Custom tab.
 *
 * This component's stylesheet is a DELTA over the rules PrimeNG generates at
 * runtime from the preset — it restyles PrimeNG's own class names rather than
 * defining the whole look. Raw markup would pick up the delta and none of the
 * base, so it would render wrong while looking plausible. That is worse than
 * having no Custom tab, so there is none.
 *
 * The React component emits the same class names, so a consuming app that
 * loads the kit's CSS gets both layers.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = setupFor('breadcrumb', true);

export const breadcrumbSnippets: Record<string, SnippetSet> = {
  Default: {
    react: `${SETUP}

import { BapsBreadcrumb } from '@org/ui-kit-react';

export function Default() {
  return (
    <BapsBreadcrumb
      brand="sampark"
      model={[
        { label: 'Electronics' },
        { label: 'Computers' },
        { label: 'Accessories' },
        { label: 'Keyboards' },
      ]}
    />
  );
}`,
    next: `'use client';

${SETUP}

import { BapsBreadcrumb } from '@org/ui-kit-react';

export default function Default() {
  return (
    <BapsBreadcrumb
      brand="sampark"
      model={[
        { label: 'Electronics' },
        { label: 'Computers' },
        { label: 'Accessories' },
        { label: 'Keyboards' },
      ]}
    />
  );
}`,
    primeng: `<baps-breadcrumb
  brand="sampark"
  [model]="[
    { label: 'Electronics' },
    { label: 'Computers' },
    { label: 'Accessories' },
    { label: 'Keyboards' }
  ]"
></baps-breadcrumb>`,
  },
};
