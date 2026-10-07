import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('divider', false, '@org/ui-kit-react/styles')}

import { BapsDivider } from '@org/ui-kit-react';`;

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

export const dividerSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-divider align="center">OR</baps-divider>`,
    ...examples(
      'DefaultDivider',
      '<BapsDivider align="center">OR</BapsDivider>',
    ),
  },
  ToolbarSeparator: {
    primeng: `<baps-divider layout="vertical" brand="sampark" />`,
    ...examples(
      'ToolbarSeparator',
      '<BapsDivider layout="vertical" brand="sampark" aria-label="Action separator" />',
    ),
  },
};
