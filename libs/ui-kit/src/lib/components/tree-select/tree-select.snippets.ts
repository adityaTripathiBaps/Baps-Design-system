import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('select', false, '@org/ui-kit-react/styles')}

import { BapsTreeSelect } from '@org/ui-kit-react';

const regions = [
  {
    key: 'in',
    label: 'India',
    children: [{ key: 'in-amd', label: 'Ahmedabad' }, { key: 'in-bom', label: 'Mumbai' }],
  },
  {
    key: 'uk',
    label: 'United Kingdom',
    children: [{ key: 'uk-lon', label: 'London' }],
  },
];`;

const component = (props: string) => `${SETUP}

export function Example() {
  return <BapsTreeSelect ariaLabel="Locations" options={regions} ${props} />;
}`;

const next = (source: string) =>
  `'use client';\n\n${source.replace('export function Example()', 'export default function Example()')}`;

export const treeSelectSnippets: Record<string, SnippetSet> = {
  Default: {
    react: component('placeholder="Select a location"'),
    next: next(component('placeholder="Select a location"')),
    primeng: `<baps-tree-select ariaLabel="Locations" appendTo="body" [options]="regions" placeholder="Select a location" />`,
  },
  Checkbox: {
    react: component('selectionMode="checkbox" display="chip"'),
    next: next(component('selectionMode="checkbox" display="chip"')),
    primeng: `<baps-tree-select ariaLabel="Locations" appendTo="body" selectionMode="checkbox" display="chip" [options]="regions" />`,
  },
  Filter: {
    react: component(
      'filter filterPlaceholder="Search locations" filterMode="lenient"',
    ),
    next: next(
      component(
        'filter filterPlaceholder="Search locations" filterMode="lenient"',
      ),
    ),
    primeng: `<baps-tree-select ariaLabel="Locations" appendTo="body" [filter]="true" filterPlaceholder="Search locations" filterMode="lenient" [options]="regions" />`,
  },
  Sizes: {
    react: `${SETUP}

export function Example() {
  return <>
    <BapsTreeSelect ariaLabel="Small location" options={regions} size="small" />
    <BapsTreeSelect ariaLabel="Default location" options={regions} />
    <BapsTreeSelect ariaLabel="Large location" options={regions} size="large" />
  </>;
}`,
    next: next(`${SETUP}

export function Example() {
  return <>
    <BapsTreeSelect ariaLabel="Small location" options={regions} size="small" />
    <BapsTreeSelect ariaLabel="Default location" options={regions} />
    <BapsTreeSelect ariaLabel="Large location" options={regions} size="large" />
  </>;
}`),
  },
  Brands: {
    react: `${SETUP}

export function Example() {
  return <>
    <BapsTreeSelect ariaLabel="MyBKY location" options={regions} brand="mybky" />
    <BapsTreeSelect ariaLabel="Sampark location" options={regions} brand="sampark" />
  </>;
}`,
    next: next(`${SETUP}

export function Example() {
  return <>
    <BapsTreeSelect ariaLabel="MyBKY location" options={regions} brand="mybky" />
    <BapsTreeSelect ariaLabel="Sampark location" options={regions} brand="sampark" />
  </>;
}`),
  },
  Disabled: {
    react: component('disabled defaultValue="in-amd"'),
    next: next(component('disabled defaultValue="in-amd"')),
    primeng: `<baps-tree-select ariaLabel="Locations" [disabled]="true" [options]="regions" [(ngModel)]="selected" />`,
  },
};
