/*
 * Route B: no Custom tab.
 *
 * This component's stylesheet is a DELTA over the rules PrimeNG generates at
 * runtime from the preset — it restyles PrimeNG's own class names rather than
 * defining the whole look. Raw markup would pick up the delta and none of the
 * base, so it would render wrong while looking plausible. That is worse than
 * having no Custom tab, so there is none.
 *
 * The React component emits the same class names, so a consuming app that
 * loads the kit's CSS gets both layers.
 */
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
  SamparkHeaderSeparator: {
    ...examples(
      'SamparkHeaderSeparator',
      '<BapsDivider layout="vertical" brand="sampark" />',
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
