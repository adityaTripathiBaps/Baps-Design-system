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
