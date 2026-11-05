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
  ItemTemplate: {
    primeng: `<baps-select brand="sampark" ariaLabel="Role" appendTo="body" [options]="roles" optionLabel="name" optionValue="code" [(ngModel)]="role">
  <ng-template pTemplate="item" let-option>
    <span><strong>{{ option.code }}</strong> · {{ option.name }}</span>
  </ng-template>
</baps-select>`,
  },
  ToggleOnClick: {
    primeng: `<baps-select brand="sampark" ariaLabel="Role" [options]="roles" optionLabel="name" optionValue="code" [toggleOnClick]="true" [(ngModel)]="role" />`,
  },
  Loading: {
    primeng: `<baps-select brand="sampark" ariaLabel="Role" placeholder="Loading roles" [options]="roles" optionLabel="name" [loading]="true" />`,
  },
};
