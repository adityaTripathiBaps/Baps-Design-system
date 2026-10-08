import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('progress-bar', false, '@org/ui-kit-react/styles')}

import { BapsProgressBar } from '@org/ui-kit-react';`;

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

export const progressBarSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-progressbar [value]="64" ariaLabel="Upload progress" />`,
    ...examples(
      'DefaultProgressBar',
      '<BapsProgressBar value={64} showValue aria-label="Upload progress" />',
    ),
  },
  SeveritiesMyBKY: {
    primeng: `<baps-progressbar [value]="72" severity="success" ariaLabel="Upload progress" />`,
    ...examples(
      'MyBkyProgressSeverities',
      `<>
      <BapsProgressBar value={72} severity="success" aria-label="Success progress" />
      <BapsProgressBar value={56} severity="info" aria-label="Information progress" />
      <BapsProgressBar value={40} severity="warning" aria-label="Warning progress" />
      <BapsProgressBar value={24} severity="error" aria-label="Error progress" />
    </>`,
    ),
  },
  Severities: {
    primeng: `<baps-progressbar brand="sampark" [value]="72" severity="success" ariaLabel="Upload progress" />`,
    ...examples(
      'SamparkProgressSeverities',
      `<>
      <BapsProgressBar brand="sampark" value={72} severity="success" aria-label="Success progress" />
      <BapsProgressBar brand="sampark" value={56} severity="info" aria-label="Information progress" />
      <BapsProgressBar brand="sampark" value={40} severity="warning" aria-label="Warning progress" />
      <BapsProgressBar brand="sampark" value={24} severity="error" aria-label="Error progress" />
    </>`,
    ),
  },
  TableCellProgress: {
    primeng: `<baps-progressbar [value]="82" [showValue]="false" ariaLabel="Upload progress" />`,
    ...examples(
      'TableCellProgress',
      '<BapsProgressBar value={82} aria-label="82 percent complete" />',
    ),
  },
};
