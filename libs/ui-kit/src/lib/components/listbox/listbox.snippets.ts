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

const SETUP = `${setupFor('listbox', false, '@org/ui-kit-react/styles')}

import { BapsListbox } from '@org/ui-kit-react';

const cities = [
  { label: 'New York', value: 'NY' },
  { label: 'Rome', value: 'RM' },
  { label: 'London', value: 'LDN' },
  { label: 'Istanbul', value: 'IST' },
  { label: 'Paris', value: 'PRS' },
];`;

const component = (props: string) => `${SETUP}

export function Example() {
  return <BapsListbox ariaLabel="Cities" options={cities} ${props} />;
}`;

const next = (source: string) =>
  `'use client';\n\n${source.replace('export function Example()', 'export default function Example()')}`;

export const listboxSnippets: Record<string, SnippetSet> = {
  ListboxPlayground: {
    react: component('defaultValue="NY"'),
    next: next(component('defaultValue="NY"')),
    primeng: `<baps-listbox ariaLabel="Cities" [options]="cities" optionLabel="name" optionValue="code" [(ngModel)]="selected" />`,
  },
  MultiSelectWithCheckboxes: {
    react: component('multiple checkbox defaultValue={["NY", "LDN"]}'),
    next: next(component('multiple checkbox defaultValue={["NY", "LDN"]}')),
    primeng: `<baps-listbox ariaLabel="Cities" [multiple]="true" [checkbox]="true" [options]="cities" optionLabel="name" optionValue="code" [(ngModel)]="selected" />`,
  },
  WithFiltering: {
    react: component('filter filterPlaceholder="Search cities"'),
    next: next(component('filter filterPlaceholder="Search cities"')),
    primeng: `<baps-listbox ariaLabel="Cities" [filter]="true" filterPlaceholder="Search cities" [options]="cities" optionLabel="name" />`,
  },
  Grouped: {
    react: `${SETUP}

const groupedCities = [
  { label: 'Germany', options: [{ label: 'Berlin', value: 'BER' }, { label: 'Frankfurt', value: 'FRA' }] },
  { label: 'USA', options: [{ label: 'Chicago', value: 'CHI' }, { label: 'Los Angeles', value: 'LAX' }] },
];

export function Example() {
  return <BapsListbox ariaLabel="Cities" options={groupedCities} />;
}`,
    next: next(`${SETUP}

const groupedCities = [
  { label: 'Germany', options: [{ label: 'Berlin', value: 'BER' }, { label: 'Frankfurt', value: 'FRA' }] },
  { label: 'USA', options: [{ label: 'Chicago', value: 'CHI' }, { label: 'Los Angeles', value: 'LAX' }] },
];

export function Example() {
  return <BapsListbox ariaLabel="Cities" options={groupedCities} />;
}`),
    primeng: `<baps-listbox ariaLabel="Cities" [group]="true" optionGroupLabel="label" optionGroupChildren="items" [options]="groups" />`,
  },
  RichTemplatePanelList: {
    react: `${SETUP}

const members = [
  { label: 'Ghanshyam Pandey', value: 'gp', title: 'Ghanshyam Pandey', subtitle: 'Nation Leader', avatarLabel: 'GP' },
  { label: 'Nilesh Patel', value: 'np', title: 'Nilesh Patel', subtitle: 'Regional Admin', avatarLabel: 'NP' },
];

export function Example() {
  return <BapsListbox ariaLabel="Members" options={members} />;
}`,
    next: next(`${SETUP}

const members = [
  { label: 'Ghanshyam Pandey', value: 'gp', title: 'Ghanshyam Pandey', subtitle: 'Nation Leader', avatarLabel: 'GP' },
  { label: 'Nilesh Patel', value: 'np', title: 'Nilesh Patel', subtitle: 'Regional Admin', avatarLabel: 'NP' },
];

export function Example() {
  return <BapsListbox ariaLabel="Members" options={members} />;
}`),
  },
  CustomTemplatesUsingPTemplate: {
    react: `${SETUP}

export function Example() {
  return (
    <BapsListbox
      ariaLabel="Cities"
      options={cities}
      renderOption={(option) => <strong>{option.label}</strong>}
    />
  );
}`,
    next: next(`${SETUP}

export function Example() {
  return (
    <BapsListbox
      ariaLabel="Cities"
      options={cities}
      renderOption={(option) => <strong>{option.label}</strong>}
    />
  );
}`),
    primeng: `<baps-listbox ariaLabel="Cities" [options]="cities">
  <ng-template pTemplate="item" let-city><strong>{{ city.name }}</strong></ng-template>
</baps-listbox>`,
  },
  DisabledAndInvalid: {
    react: `${SETUP}

export function Example() {
  return <>
    <BapsListbox ariaLabel="Invalid cities" options={cities} invalid />
    <BapsListbox ariaLabel="Disabled cities" options={cities} disabled />
  </>;
}`,
    next: next(`${SETUP}

export function Example() {
  return <>
    <BapsListbox ariaLabel="Invalid cities" options={cities} invalid />
    <BapsListbox ariaLabel="Disabled cities" options={cities} disabled />
  </>;
}`),
    primeng: `<baps-listbox ariaLabel="Invalid cities" styleClass="p-invalid" [options]="cities" />
<baps-listbox ariaLabel="Disabled cities" [disabled]="true" [options]="cities" />`,
  },
};
