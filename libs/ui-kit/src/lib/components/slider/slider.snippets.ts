import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('slider', false, '@org/ui-kit-react/styles')}

import { BapsSlider } from '@org/ui-kit-react';`;

const next = (source: string) =>
  `'use client';\n\n${source.replace(
    'export function Example()',
    'export default function Example()',
  )}`;

const example = (props: string) => `${SETUP}

export function Example() {
  return <BapsSlider ariaLabel="Value" ${props} />;
}`;

export const sliderSnippets: Record<string, SnippetSet> = {
  Default: {
    react: example('defaultValue={40}'),
    next: next(example('defaultValue={40}')),
    primeng: `<baps-slider ariaLabel="Value" [(ngModel)]="value" />`,
  },
  Range: {
    react: example(
      'range ariaLabels={["Minimum value", "Maximum value"]} defaultValue={[20, 80]}',
    ),
    next: next(
      example(
        'range ariaLabels={["Minimum value", "Maximum value"]} defaultValue={[20, 80]}',
      ),
    ),
    primeng: `<baps-slider ariaLabel="Value range" [range]="true" [(ngModel)]="range" />`,
  },
  ValueTooltip: {
    react: example('defaultValue={40} showValueTooltip brand="sampark"'),
    next: next(example('defaultValue={40} showValueTooltip brand="sampark"')),
    primeng: `<baps-slider ariaLabel="Value" [showValueTooltip]="true" brand="sampark" [(ngModel)]="value" />`,
  },
  Disabled: {
    react: example('defaultValue={40} disabled'),
    next: next(example('defaultValue={40} disabled')),
    primeng: `<baps-slider ariaLabel="Value" [disabled]="true" [(ngModel)]="value" />`,
  },
};
