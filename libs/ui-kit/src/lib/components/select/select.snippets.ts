import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('select', false, '@org/ui-kit-react/styles')}

import { BapsSelect } from '@org/ui-kit-react';

const cities = [
  { label: 'New York', value: 'NY' },
  { label: 'Rome', value: 'RM' },
  { label: 'London', value: 'LDN' },
];`;

const EXAMPLE = `${SETUP}

export function Default() {
  return (
    <BapsSelect
      ariaLabel="City"
      options={cities}
      placeholder="Select a city"
      filter
      showClear
    />
  );
}`;

export const selectSnippets: Record<string, SnippetSet> = {
  Default: {
    react: EXAMPLE,
    next: `'use client';

${EXAMPLE.replace('export function Default()', 'export default function Default()')}`,
    primeng: `<baps-select
  ariaLabel="City"
  appendTo="body"
  [options]="cities"
  optionLabel="name"
  optionValue="code"
  placeholder="Select a city"
  [filter]="true"
  [showClear]="true"
/>`,
  },
};
