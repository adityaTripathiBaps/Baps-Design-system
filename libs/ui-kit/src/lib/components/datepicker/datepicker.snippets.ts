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

export type { SnippetSet };

const SETUP = `${setupFor('datepicker', false, '@org/ui-kit-react/styles')}

import { BapsDatepicker } from '@org/ui-kit-react';`;

const next = (source: string) =>
  `'use client';\n\n${source.replace(
    'export function Example()',
    'export default function Example()',
  )}`;

const example = (props: string) => `${SETUP}

export function Example() {
  return <BapsDatepicker ariaLabel="Visit date" ${props} />;
}`;

export const datepickerSnippets: Record<string, SnippetSet> = {
  Default: {
    react: example('inline'),
    next: next(example('inline')),
    primeng: `<baps-datepicker ariaLabel="Visit date" [inline]="true" [(ngModel)]="value" />`,
  },
  Range: {
    react: example('selectionMode="range" numberOfMonths={2} brand="sampark"'),
    next: next(
      example('selectionMode="range" numberOfMonths={2} brand="sampark"'),
    ),
    primeng: `<baps-datepicker ariaLabel="Visit date range" selectionMode="range" [numberOfMonths]="2" brand="sampark" [(ngModel)]="range" />`,
  },
  RangeMyBKY: {
    react: example('selectionMode="range" numberOfMonths={2} brand="mybky"'),
    next: next(
      example('selectionMode="range" numberOfMonths={2} brand="mybky"'),
    ),
    primeng: `<baps-datepicker ariaLabel="Visit date range" selectionMode="range" [numberOfMonths]="2" brand="mybky" [(ngModel)]="range" />`,
  },
  Overlay: {
    react: example('selectionMode="range" showIcon'),
    next: next(example('selectionMode="range" showIcon')),
    primeng: `<baps-datepicker ariaLabel="Visit date range" selectionMode="range" [showIcon]="true" [(ngModel)]="range" />`,
  },
  Constrained: {
    react: `${SETUP}

export function Example() {
  return (
    <BapsDatepicker
      ariaLabel="Visit date"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 11, 31)}
      disabledDays={[0, 6]}
      showIcon
    />
  );
}`,
    next: next(`${SETUP}

export function Example() {
  return (
    <BapsDatepicker
      ariaLabel="Visit date"
      minDate={new Date(2026, 0, 1)}
      maxDate={new Date(2026, 11, 31)}
      disabledDays={[0, 6]}
      showIcon
    />
  );
}`),
    primeng: `<baps-datepicker ariaLabel="Visit date" [minDate]="minDate" [maxDate]="maxDate" [disabledDays]="[0, 6]" [showIcon]="true" [(ngModel)]="value" />`,
  },
};
