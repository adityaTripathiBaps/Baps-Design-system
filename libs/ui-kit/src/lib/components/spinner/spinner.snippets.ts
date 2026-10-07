import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('spinner', false, '@org/ui-kit-react/styles')}

import { BapsSpinner } from '@org/ui-kit-react';`;

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

export const spinnerSnippets: Record<string, SnippetSet> = {
  Indeterminate: {
    primeng: `<baps-spinner ariaLabel="Loading projects" />`,
    ...examples(
      'IndeterminateSpinner',
      '<BapsSpinner ariaLabel="Loading projects" />',
    ),
  },
  Determinate: {
    primeng: `<baps-spinner [value]="75" ariaLabel="Upload progress" />`,
    ...examples(
      'DeterminateSpinner',
      '<BapsSpinner value={75} ariaLabel="Upload progress" />',
    ),
  },
  DeterminateSteps: {
    primeng: `<baps-spinner [value]="25" ariaLabel="Step 1 of 4" />`,
    ...examples(
      'DeterminateSpinnerSteps',
      `<>
      <BapsSpinner value={25} ariaLabel="Step 1 of 4" />
      <BapsSpinner value={50} ariaLabel="Step 2 of 4" />
      <BapsSpinner value={75} ariaLabel="Step 3 of 4" />
      <BapsSpinner value={100} ariaLabel="Step 4 of 4" />
    </>`,
    ),
  },
  Sizes: {
    primeng: `<baps-spinner size="small" ariaLabel="Loading" />
<baps-spinner size="large" ariaLabel="Loading" />`,
    ...examples(
      'SpinnerSizes',
      `<>
      <BapsSpinner size="small" ariaLabel="Loading compact region" />
      <BapsSpinner size="large" ariaLabel="Loading page section" />
      <BapsSpinner size="large" brand="sampark" ariaLabel="Loading Sampark section" />
    </>`,
    ),
  },
};
