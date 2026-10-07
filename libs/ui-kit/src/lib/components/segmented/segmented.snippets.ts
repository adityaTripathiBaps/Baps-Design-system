import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('segmented', false, '@org/ui-kit-react/styles')}

import { BapsSegmented } from '@org/ui-kit-react';`;

const examples = (
  name: string,
  jsx: string,
): Pick<SnippetSet, 'react' | 'next'> => ({
  react: `'use client';

${SETUP}

export function ${name}() {
  return ${jsx};
}`,
  next: `'use client';

${SETUP}

export default function ${name}() {
  return ${jsx};
}`,
});

export const segmentedSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-segmented [options]="views" [(ngModel)]="view" ariaLabel="View" />`,
    ...examples(
      'DefaultSegmented',
      "<BapsSegmented ariaLabel=\"View\" options={['List', 'Grid', 'Map']} defaultValue=\"List\" />",
    ),
  },
  TwoUp: {
    primeng: `<baps-segmented [options]="['Active', 'Archived']" ariaLabel="Record status" />`,
    ...examples(
      'TwoUpSegmented',
      '<BapsSegmented ariaLabel="Record status" options={[\'Active\', \'Archived\']} defaultValue="Active" />',
    ),
  },
  Multiple: {
    primeng: `<baps-segmented [options]="filters" [multiple]="true" ariaLabel="Filters" />`,
    ...examples(
      'MultipleSegmented',
      "<BapsSegmented ariaLabel=\"Filters\" options={['Open', 'Assigned', 'Urgent']} multiple defaultValue={['Open']} />",
    ),
  },
  ObjectOptions: {
    primeng: `<baps-segmented [options]="views" optionLabel="label" optionValue="value" ariaLabel="View" />`,
    ...examples(
      'ObjectOptionsSegmented',
      `<BapsSegmented
      ariaLabel="View"
      options={[
        { label: 'List view', value: 'list' },
        { label: 'Grid view', value: 'grid' },
        { label: 'Map view', value: 'map', disabled: true },
      ]}
      defaultValue="list"
    />`,
    ),
  },
  Brands: {
    primeng: `<baps-segmented brand="sampark" [options]="views" ariaLabel="Sampark view" />`,
    ...examples(
      'SegmentedBrands',
      `<>
      <BapsSegmented ariaLabel="MyBKY view" options={['List', 'Grid']} defaultValue="List" />
      <BapsSegmented brand="sampark" ariaLabel="Sampark view" options={['List', 'Grid']} defaultValue="List" />
    </>`,
    ),
  },
  Disabled: {
    primeng: `<baps-segmented [options]="views" [disabled]="true" ariaLabel="View" />`,
    ...examples(
      'DisabledSegmented',
      '<BapsSegmented ariaLabel="View" options={[\'List\', \'Grid\']} defaultValue="List" disabled />',
    ),
  },
};
