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
    custom: `<!-- role="status", not progressbar: an indeterminate spinner has no
     position to report, and a progressbar without aria-valuenow is a
     progressbar that says nothing. The arc is a quarter of the circle
     (circumference / 4) and the CSS spins it. -->
<baps-spinner class="baps-spinner-indeterminate" role="status" aria-label="Loading">
  <svg class="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle class="baps-spinner-track" cx="16" cy="16" r="14" />
    <circle
      class="baps-spinner-arc"
      cx="16"
      cy="16"
      r="14"
      stroke-dasharray="21.9911 87.9646"
      stroke-dashoffset="0"
    />
  </svg>
</baps-spinner>`,
    ...examples(
      'IndeterminateSpinner',
      '<BapsSpinner ariaLabel="Loading projects" />',
    ),
  },
  Determinate: {
    primeng: `<baps-spinner [value]="75" ariaLabel="Upload progress" />`,
    custom: `<!-- role="progressbar" with the three value attributes. The arc length is
     the whole circumference and the OFFSET is what shortens it:
     circumference x (100 - value) / 100. -->
<baps-spinner role="progressbar" aria-label="Uploading" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
  <svg class="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle class="baps-spinner-track" cx="16" cy="16" r="14" />
    <circle
      class="baps-spinner-arc"
      cx="16"
      cy="16"
      r="14"
      stroke-dasharray="87.9646"
      stroke-dashoffset="52.7788"
    />
  </svg>
</baps-spinner>`,
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
    custom: `<!-- Size is one class on the host. The SVG is identical at both sizes —
     it scales with the box rather than redrawing. -->
<baps-spinner class="baps-spinner-small" role="status" aria-label="Loading">
  <svg class="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle class="baps-spinner-track" cx="16" cy="16" r="14" />
    <circle
      class="baps-spinner-arc"
      cx="16"
      cy="16"
      r="14"
      stroke-dasharray="21.9911 87.9646"
      stroke-dashoffset="0"
    />
  </svg>
</baps-spinner>

<baps-spinner role="status" aria-label="Loading">
  <svg class="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle class="baps-spinner-track" cx="16" cy="16" r="14" />
    <circle
      class="baps-spinner-arc"
      cx="16"
      cy="16"
      r="14"
      stroke-dasharray="21.9911 87.9646"
      stroke-dashoffset="0"
    />
  </svg>
</baps-spinner>`,
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
