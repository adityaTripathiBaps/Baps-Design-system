import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('input', false, '@org/ui-kit-react/styles')}

import {
  BapsFloatLabel,
  BapsIconField,
  BapsInputIcon,
  BapsInputText,
  BapsMessage,
  BapsTextarea,
} from '@org/ui-kit-react';`;

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

export const formFieldSnippets: Record<string, SnippetSet> = {
  Playground: {
    primeng: `<label for="email">Email</label>
<input id="email" bapsInputText placeholder="you@baps.dev" aria-describedby="email-help" />
<baps-message id="email-help" severity="info" variant="simple" size="small">We'll never share your address.</baps-message>`,
    ...examples(
      'InputPlayground',
      `<>
      <label htmlFor="email">Email</label>
      <BapsInputText id="email" placeholder="you@baps.dev" aria-describedby="email-help" />
      <BapsMessage id="email-help" severity="info" variant="simple" size="small">
        We'll never share your address.
      </BapsMessage>
    </>`,
    ),
  },
  States: {
    primeng: `<input bapsInputText placeholder="Default" />
<input bapsInputText variant="filled" value="Filled" />
<input bapsInputText [invalid]="true" aria-describedby="error-help" />
<baps-message id="error-help" severity="error" variant="simple">This field is required.</baps-message>`,
    ...examples(
      'InputStates',
      `<>
      <BapsInputText aria-label="Default input" placeholder="Default" />
      <BapsInputText aria-label="Filled input" variant="filled" defaultValue="Filled" />
      <BapsInputText aria-label="Ghost input" variant="ghost" placeholder="Ghost" />
      <BapsInputText aria-label="Invalid input" invalid aria-describedby="input-error" />
      <BapsMessage id="input-error" severity="error" variant="simple">This field is required.</BapsMessage>
      <BapsInputText aria-label="Disabled input" disabled placeholder="Disabled" />
    </>`,
    ),
  },
  Sizes: {
    primeng: `<input bapsInputText pSize="small" aria-label="Small input" />
<input bapsInputText aria-label="Default input" />
<input bapsInputText pSize="large" aria-label="Large input" />`,
    ...examples(
      'InputSizes',
      `<>
      <BapsInputText pSize="small" aria-label="Small input" />
      <BapsInputText aria-label="Default input" />
      <BapsInputText pSize="large" aria-label="Large input" />
    </>`,
    ),
  },
  FloatLabelExample: {
    primeng: `<baps-floatlabel>
  <input id="member-name" bapsInputText />
  <label for="member-name">Member name</label>
</baps-floatlabel>`,
    ...examples(
      'FloatLabelExample',
      `<BapsFloatLabel>
      <BapsInputText id="member-name" />
      <label htmlFor="member-name">Member name</label>
    </BapsFloatLabel>`,
    ),
  },
  WithIcon: {
    primeng: `<baps-iconfield>
  <baps-inputicon icon="search-2" />
  <input bapsInputText aria-label="Search members" />
</baps-iconfield>`,
    ...examples(
      'InputWithIcon',
      `<BapsIconField>
      <BapsInputIcon icon="search-2" />
      <BapsInputText aria-label="Search members" />
    </BapsIconField>`,
    ),
  },
  SamparkStates: {
    primeng: `<baps-floatlabel brand="sampark">
  <input id="sampark-email" bapsInputText [invalid]="true" aria-describedby="sampark-error" />
  <label for="sampark-email">Email</label>
</baps-floatlabel>
<baps-message id="sampark-error" brand="sampark" severity="error" variant="simple">Email is required.</baps-message>`,
    ...examples(
      'SamparkInputStates',
      `<>
      <BapsFloatLabel brand="sampark">
        <BapsInputText id="sampark-email" invalid aria-describedby="sampark-error" />
        <label htmlFor="sampark-email">Email</label>
      </BapsFloatLabel>
      <BapsMessage id="sampark-error" brand="sampark" severity="error" variant="simple">Email is required.</BapsMessage>
    </>`,
    ),
  },
  SamparkSizes: {
    primeng: `<baps-floatlabel brand="sampark"><input id="sampark-small" bapsInputText pSize="small" /><label for="sampark-small">Small</label></baps-floatlabel>`,
    ...examples(
      'SamparkInputSizes',
      `<>
      <BapsFloatLabel brand="sampark"><BapsInputText id="sampark-small" pSize="small" /><label htmlFor="sampark-small">Small</label></BapsFloatLabel>
      <BapsFloatLabel brand="sampark"><BapsInputText id="sampark-default" /><label htmlFor="sampark-default">Default</label></BapsFloatLabel>
      <BapsFloatLabel brand="sampark"><BapsInputText id="sampark-large" pSize="large" /><label htmlFor="sampark-large">Large</label></BapsFloatLabel>
    </>`,
    ),
  },
  SamparkFloatLabel: {
    primeng: `<baps-floatlabel brand="sampark">
  <input id="sampark-member" bapsInputText />
  <label for="sampark-member">Member name</label>
</baps-floatlabel>`,
    ...examples(
      'SamparkFloatLabel',
      `<BapsFloatLabel brand="sampark">
      <BapsInputText id="sampark-member" />
      <label htmlFor="sampark-member">Member name</label>
    </BapsFloatLabel>`,
    ),
  },
  SamparkWithIcon: {
    primeng: `<baps-iconfield brand="sampark">
  <baps-inputicon icon="search-2" />
  <input bapsInputText aria-label="Search Sampark members" />
</baps-iconfield>`,
    ...examples(
      'SamparkInputWithIcon',
      `<BapsIconField brand="sampark">
      <BapsInputIcon icon="search-2" />
      <BapsInputText aria-label="Search Sampark members" />
    </BapsIconField>`,
    ),
  },
  TextareaExample: {
    primeng: `<textarea bapsTextarea autoResize aria-label="Notes"></textarea>`,
    ...examples(
      'TextareaExample',
      '<BapsTextarea aria-label="Notes" autoResize rows={4} placeholder="Add notes" />',
    ),
  },
  SamparkTextarea: {
    primeng: `<baps-floatlabel brand="sampark"><textarea id="sampark-notes" bapsTextarea></textarea><label for="sampark-notes">Notes</label></baps-floatlabel>`,
    ...examples(
      'SamparkTextarea',
      `<BapsFloatLabel brand="sampark">
      <BapsTextarea id="sampark-notes" rows={4} />
      <label htmlFor="sampark-notes">Notes</label>
    </BapsFloatLabel>`,
    ),
  },
  Dropdowns: {
    primeng: `<p-select [options]="cities" optionLabel="name" placeholder="Select a city" />`,
  },
  SamparkDropdowns: {
    primeng: `<div class="baps-ds-sampark"><p-select [options]="cities" optionLabel="name" placeholder="Select a city" /></div>`,
  },
  SamparkDropdownSizes: {
    primeng: `<div class="baps-ds-sampark"><p-select size="small" [options]="cities" placeholder="Small" /></div>`,
  },
};
