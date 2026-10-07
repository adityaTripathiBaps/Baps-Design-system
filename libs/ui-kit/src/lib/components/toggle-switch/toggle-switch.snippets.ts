import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('toggle-switch', false, '@org/ui-kit-react/styles')}

import { BapsToggleSwitch } from '@org/ui-kit-react';`;

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

export const toggleSwitchSnippets: Record<string, SnippetSet> = {
  Playground: {
    primeng: `<baps-toggleswitch inputId="notifications" ariaLabel="Notifications" />`,
    ...examples(
      'ToggleSwitchPlayground',
      '<BapsToggleSwitch id="notifications" label="Notifications" />',
    ),
  },
  States: {
    primeng: `<baps-toggleswitch inputId="enabled" [ngModel]="true" ariaLabel="Enabled" />`,
    ...examples(
      'ToggleSwitchStates',
      `<>
      <BapsToggleSwitch id="off" label="Off" />
      <BapsToggleSwitch id="on" label="On" defaultChecked />
      <BapsToggleSwitch id="readonly" label="Read only" readOnly defaultChecked />
      <BapsToggleSwitch id="disabled" label="Disabled" disabled />
    </>`,
    ),
  },
  Sizes: {
    primeng: `<baps-toggleswitch toggleSize="sm" ariaLabel="Small" />`,
    ...examples(
      'ToggleSwitchSizes',
      `<>
      <BapsToggleSwitch aria-label="Extra small" toggleSize="xs" />
      <BapsToggleSwitch aria-label="Small" toggleSize="sm" />
      <BapsToggleSwitch aria-label="Medium" toggleSize="md" />
      <BapsToggleSwitch aria-label="Large" toggleSize="lg" />
    </>`,
    ),
  },
  SamparkStates: {
    primeng: `<baps-toggleswitch brand="sampark" inputId="sampark-on" [ngModel]="true" />`,
    ...examples(
      'SamparkToggleSwitchStates',
      `<>
      <BapsToggleSwitch id="sampark-off" brand="sampark" label="Off" />
      <BapsToggleSwitch id="sampark-on" brand="sampark" label="On" defaultChecked />
      <BapsToggleSwitch id="sampark-disabled" brand="sampark" label="Disabled" disabled />
    </>`,
    ),
  },
  SamparkSizes: {
    primeng: `<baps-toggleswitch brand="sampark" toggleSize="lg" ariaLabel="Large" />`,
    ...examples(
      'SamparkToggleSwitchSizes',
      `<>
      <BapsToggleSwitch brand="sampark" aria-label="Extra small" toggleSize="xs" />
      <BapsToggleSwitch brand="sampark" aria-label="Small" toggleSize="sm" />
      <BapsToggleSwitch brand="sampark" aria-label="Medium" toggleSize="md" />
      <BapsToggleSwitch brand="sampark" aria-label="Large" toggleSize="lg" />
    </>`,
    ),
  },
  WithLabel: {
    primeng: `<baps-toggleswitch inputId="email-notifications" />
<label for="email-notifications">Email notifications</label>`,
    ...examples(
      'LabeledToggleSwitch',
      '<BapsToggleSwitch id="email-notifications" label="Email notifications" />',
    ),
  },
};
