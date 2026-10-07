import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('skeleton', false, '@org/ui-kit-react/styles')}

import { BapsSkeleton } from '@org/ui-kit-react';`;

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

export const skeletonSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<baps-skeleton width="12rem" height="1rem" />`,
    ...examples(
      'DefaultSkeleton',
      '<BapsSkeleton width="12rem" height="1rem" />',
    ),
  },
  Circle: {
    primeng: `<baps-skeleton shape="circle" size="2.5rem" />`,
    ...examples(
      'CircleSkeleton',
      '<BapsSkeleton shape="circle" size="2.5rem" />',
    ),
  },
  Static: {
    primeng: `<baps-skeleton animation="none" width="12rem" height="1rem" />`,
    ...examples(
      'StaticSkeleton',
      '<BapsSkeleton animation="none" width="12rem" height="1rem" />',
    ),
  },
  ListItem: {
    primeng: `<baps-skeleton shape="circle" size="2.5rem" />
<baps-skeleton width="12rem" height="1rem" />`,
    ...examples(
      'ListItemSkeleton',
      `<section aria-busy="true" aria-label="Loading member">
      <BapsSkeleton shape="circle" size="2.5rem" />
      <BapsSkeleton width="12rem" height="1rem" />
      <BapsSkeleton width="8rem" height="1rem" />
    </section>`,
    ),
  },
  Card: {
    primeng: `<baps-skeleton width="100%" height="8rem" />`,
    ...examples(
      'CardSkeleton',
      `<section aria-busy="true" aria-label="Loading card">
      <BapsSkeleton width="100%" height="8rem" />
      <BapsSkeleton width="60%" height="1rem" />
    </section>`,
    ),
  },
};
