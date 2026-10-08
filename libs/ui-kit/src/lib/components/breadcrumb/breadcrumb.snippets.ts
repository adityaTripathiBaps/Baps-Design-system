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
