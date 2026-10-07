import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('checkbox', false, '@org/ui-kit-react/styles')}

import { BapsCheckbox } from '@org/ui-kit-react';`;

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

export const checkboxSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-checkbox label="I accept the terms" [(ngModel)]="accepted" />`,
    ...examples(
      'DefaultCheckbox',
      '<BapsCheckbox id="terms" label="I accept the terms" />',
    ),
  },
  Sizes: {
    primeng: `<baps-checkbox label="Small" checkboxSize="small" />
<baps-checkbox label="Large" checkboxSize="large" />`,
    ...examples(
      'CheckboxSizes',
      `<>
      <BapsCheckbox id="small" label="Small" checkboxSize="small" />
      <BapsCheckbox id="large" label="Large" checkboxSize="large" />
    </>`,
    ),
  },
  States: {
    primeng: `<baps-checkbox label="Selected" [binary]="true" [ngModel]="true" />`,
    ...examples(
      'CheckboxStates',
      `<>
      <BapsCheckbox id="available" label="Available" />
      <BapsCheckbox id="selected" label="Selected" defaultChecked />
      <BapsCheckbox id="mixed" label="Partially selected" indeterminate />
      <BapsCheckbox id="readonly" label="Read only" readOnly defaultChecked />
      <BapsCheckbox id="disabled" label="Disabled" disabled />
    </>`,
    ),
  },
  Sampark: {
    primeng: `<baps-checkbox brand="sampark" label="Sampark" [(ngModel)]="selected" />`,
    ...examples(
      'SamparkCheckbox',
      '<BapsCheckbox id="sampark" brand="sampark" label="Sampark" defaultChecked />',
    ),
  },
};
