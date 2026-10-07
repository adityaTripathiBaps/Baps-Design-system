import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('radio', false, '@org/ui-kit-react/styles')}

import { BapsRadio } from '@org/ui-kit-react';`;

const examples = (
  name: string,
  jsx: string,
  client = false,
): Pick<SnippetSet, 'react' | 'next'> => ({
  react: `${client ? "'use client';\n\n" : ''}${SETUP}

export function ${name}() {
  return ${jsx};
}`,
  next: `${client ? "'use client';\n\n" : ''}${SETUP}

export default function ${name}() {
  return ${jsx};
}`,
});

export const radioSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-radio name="plan" radioValue="monthly" label="Monthly" [(ngModel)]="plan" />`,
    ...examples(
      'DefaultRadioGroup',
      `<fieldset>
      <legend>Plan</legend>
      <BapsRadio id="monthly" name="plan" value="monthly" label="Monthly" defaultChecked />
      <BapsRadio id="yearly" name="plan" value="yearly" label="Yearly" />
    </fieldset>`,
      true,
    ),
  },
  Sizes: {
    primeng: `<baps-radio name="size" radioValue="small" label="Small" radioSize="small" />`,
    ...examples(
      'RadioSizes',
      `<>
      <BapsRadio id="small" name="size" value="small" label="Small" radioSize="small" defaultChecked />
      <BapsRadio id="large" name="size" value="large" label="Large" radioSize="large" />
    </>`,
      true,
    ),
  },
  States: {
    primeng: `<baps-radio name="state" radioValue="selected" label="Selected" [disabled]="true" />`,
    ...examples(
      'RadioStates',
      `<>
      <BapsRadio id="available" name="state" value="available" label="Available" />
      <BapsRadio id="selected" name="state" value="selected" label="Selected" defaultChecked />
      <BapsRadio id="disabled" name="disabled-state" value="disabled" label="Disabled" disabled />
    </>`,
      true,
    ),
  },
  Sampark: {
    primeng: `<baps-radio brand="sampark" name="brand" radioValue="sampark" label="Sampark" />`,
    ...examples(
      'SamparkRadio',
      '<BapsRadio id="sampark" brand="sampark" name="brand" value="sampark" label="Sampark" defaultChecked />',
      true,
    ),
  },
};
