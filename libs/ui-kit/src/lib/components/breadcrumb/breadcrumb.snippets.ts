import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = setupFor('breadcrumb', true);

export const breadcrumbSnippets: Record<string, SnippetSet> = {
  Default: {
    custom: `<baps-breadcrumb class="baps-sampark">
  <nav class="p-breadcrumb p-component">
    <ol class="p-breadcrumb-list">
      <li class="p-breadcrumb-item">
        <span class="p-breadcrumb-item-link">
          <span class="p-breadcrumb-item-label">Electronics</span>
        </span>
      </li>
      <li class="p-breadcrumb-separator">
        <span class="pi pi-chevron-right" aria-hidden="true"></span>
      </li>
      <li class="p-breadcrumb-item">
        <span class="p-breadcrumb-item-link">
          <span class="p-breadcrumb-item-label">Computers</span>
        </span>
      </li>
      <li class="p-breadcrumb-separator">
        <span class="pi pi-chevron-right" aria-hidden="true"></span>
      </li>
      <li class="p-breadcrumb-item">
        <span class="p-breadcrumb-item-link">
          <span class="p-breadcrumb-item-label">Accessories</span>
        </span>
      </li>
      <li class="p-breadcrumb-separator">
        <span class="pi pi-chevron-right" aria-hidden="true"></span>
      </li>
      <li class="p-breadcrumb-item">
        <span class="p-breadcrumb-item-link">
          <span class="p-breadcrumb-item-label">Keyboards</span>
        </span>
      </li>
    </ol>
  </nav>
</baps-breadcrumb>`,
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
