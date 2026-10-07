import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('input-group', false, '@org/ui-kit-react/styles')}

import { BapsInputGroup, BapsInputText } from '@org/ui-kit-react';`;

const examples = (
  name: string,
  jsx: string,
): Pick<SnippetSet, 'react' | 'next'> => ({
  react: `${SETUP}

export function ${name}() {
  return ${jsx};
}`,
  next: `${SETUP}

export default function ${name}() {
  return ${jsx};
}`,
});

export const inputGroupSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-input-group prefix="min" suffix="day/s">
  <input bapsInputText type="number" aria-label="Minimum days" />
</baps-input-group>`,
    ...examples(
      'DefaultInputGroup',
      `<BapsInputGroup prefix="min" suffix="day/s">
      <BapsInputText type="number" aria-label="Minimum days" />
    </BapsInputGroup>`,
    ),
  },
  SuffixOnly: {
    primeng: `<baps-input-group suffix="kg">
  <input bapsInputText type="number" aria-label="Weight" />
</baps-input-group>`,
    ...examples(
      'SuffixInputGroup',
      `<BapsInputGroup suffix="kg">
      <BapsInputText type="number" aria-label="Weight" />
    </BapsInputGroup>`,
    ),
  },
  MinMaxRow: {
    primeng: `<baps-input-group prefix="min"><input bapsInputText type="number" aria-label="Minimum" /></baps-input-group>
<baps-input-group prefix="max"><input bapsInputText type="number" aria-label="Maximum" /></baps-input-group>`,
    ...examples(
      'MinMaxInputGroups',
      `<>
      <BapsInputGroup prefix="min"><BapsInputText type="number" aria-label="Minimum" /></BapsInputGroup>
      <BapsInputGroup prefix="max"><BapsInputText type="number" aria-label="Maximum" /></BapsInputGroup>
    </>`,
    ),
  },
  Brands: {
    primeng: `<baps-input-group brand="sampark" prefix="min" suffix="day/s">
  <input bapsInputText type="number" aria-label="Minimum days" />
</baps-input-group>`,
    ...examples(
      'InputGroupBrands',
      `<>
      <BapsInputGroup prefix="min" suffix="day/s"><BapsInputText type="number" aria-label="MyBKY minimum days" /></BapsInputGroup>
      <BapsInputGroup brand="sampark" prefix="min" suffix="day/s"><BapsInputText type="number" aria-label="Sampark minimum days" /></BapsInputGroup>
    </>`,
    ),
  },
};
