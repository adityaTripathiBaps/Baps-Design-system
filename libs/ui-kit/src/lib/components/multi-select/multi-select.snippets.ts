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

import { BapsMultiSelect } from '@org/ui-kit-react';

const cities = [
  { label: 'Ahmedabad', value: 'AMD' },
  { label: 'London', value: 'LDN' },
  { label: 'Nairobi', value: 'NBO' },
  { label: 'Toronto', value: 'TOR' },
];`;

const component = (props: string) => `${SETUP}

export function Example() {
  return <BapsMultiSelect ariaLabel="Select cities" options={cities} ${props} />;
}`;

const next = (source: string) =>
  `'use client';\n\n${source.replace('export function Example()', 'export default function Example()')}`;

export const multiSelectSnippets: Record<string, SnippetSet> = {
  Default: {
    react: component('placeholder="Select cities"'),
    next: next(component('placeholder="Select cities"')),
    primeng: `<baps-multi-select ariaLabel="Select cities" appendTo="body" [options]="cities" optionLabel="name" placeholder="Select cities" />`,
  },
  Chips: {
    react: component('display="chip" defaultValue={["AMD", "NBO"]}'),
    next: next(component('display="chip" defaultValue={["AMD", "NBO"]}')),
    primeng: `<baps-multi-select ariaLabel="Select cities" appendTo="body" display="chip" [options]="cities" optionLabel="name" [(ngModel)]="selected" />`,
  },
  FilterAndSelectAll: {
    react: component('filter filterPlaceholder="Search cities" showToggleAll'),
    next: next(
      component('filter filterPlaceholder="Search cities" showToggleAll'),
    ),
    primeng: `<baps-multi-select ariaLabel="Select cities" appendTo="body" [filter]="true" filterPlaceholder="Search cities" [showToggleAll]="true" [options]="cities" optionLabel="name" />`,
  },
  Grouped: {
    react: `${SETUP}

const groupedCities = [
  { label: 'India', options: [{ label: 'Ahmedabad', value: 'AMD' }, { label: 'Mumbai', value: 'BOM' }] },
  { label: 'UK', options: [{ label: 'London', value: 'LDN' }, { label: 'Leicester', value: 'LEI' }] },
];

export function Example() {
  return <BapsMultiSelect ariaLabel="Select cities" options={groupedCities} />;
}`,
    next: next(`${SETUP}

const groupedCities = [
  { label: 'India', options: [{ label: 'Ahmedabad', value: 'AMD' }, { label: 'Mumbai', value: 'BOM' }] },
  { label: 'UK', options: [{ label: 'London', value: 'LDN' }, { label: 'Leicester', value: 'LEI' }] },
];

export function Example() {
  return <BapsMultiSelect ariaLabel="Select cities" options={groupedCities} />;
}`),
    primeng: `<baps-multi-select ariaLabel="Select cities" appendTo="body" [group]="true" optionGroupLabel="region" optionGroupChildren="cities" optionLabel="name" [options]="groups" />`,
  },
  Sizes: {
    react: `${SETUP}

export function Example() {
  return <>
    <BapsMultiSelect ariaLabel="Small cities" options={cities} size="small" />
    <BapsMultiSelect ariaLabel="Default cities" options={cities} />
    <BapsMultiSelect ariaLabel="Large cities" options={cities} size="large" />
  </>;
}`,
    next: next(`${SETUP}

export function Example() {
  return <>
    <BapsMultiSelect ariaLabel="Small cities" options={cities} size="small" />
    <BapsMultiSelect ariaLabel="Default cities" options={cities} />
    <BapsMultiSelect ariaLabel="Large cities" options={cities} size="large" />
  </>;
}`),
  },
  Brands: {
    react: `${SETUP}

export function Example() {
  return <>
    <BapsMultiSelect ariaLabel="MyBKY cities" options={cities} brand="mybky" />
    <BapsMultiSelect ariaLabel="Sampark cities" options={cities} brand="sampark" />
  </>;
}`,
    next: next(`${SETUP}

export function Example() {
  return <>
    <BapsMultiSelect ariaLabel="MyBKY cities" options={cities} brand="mybky" />
    <BapsMultiSelect ariaLabel="Sampark cities" options={cities} brand="sampark" />
  </>;
}`),
  },
  Disabled: {
    react: component('disabled defaultValue={["AMD"]}'),
    next: next(component('disabled defaultValue={["AMD"]}')),
    primeng: `<baps-multi-select ariaLabel="Select cities" [disabled]="true" [options]="cities" optionLabel="name" [(ngModel)]="selected" />`,
  },
  ItemTemplate: {
    primeng: `<baps-multi-select brand="sampark" ariaLabel="Select cities" appendTo="body" optionLabel="name" optionValue="code" [options]="cities" [(ngModel)]="selected">
  <ng-template pTemplate="item" let-option>
    <span><strong>{{ option.code }}</strong> · {{ option.name }}</span>
  </ng-template>
</baps-multi-select>`,
  },
  LockedValues: {
    primeng: `<baps-multi-select brand="sampark" ariaLabel="Locked cities" appendTo="body" display="chip" optionLabel="name" optionValue="code" [options]="cities" [lockedValues]="['AMD']" [(ngModel)]="selected" />
<baps-multi-select brand="sampark" ariaLabel="At least one city" appendTo="body" optionLabel="name" optionValue="code" [options]="cities" [keepOneSelected]="true" [(ngModel)]="selected" />`,
  },
  ChipOverflow: {
    primeng: `<baps-multi-select brand="sampark" ariaLabel="Cities" appendTo="body" display="chip" [chipOverflow]="true" [maxSelectedLabels]="2" optionLabel="name" optionValue="code" [options]="cities" [lockedValues]="['AMD']" [(ngModel)]="selected" />`,
  },
};
