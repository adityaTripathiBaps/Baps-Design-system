/*
 * Route B: no Custom tab.
 *
 * Angular relies on PrimeNG for locale-aware parsing and the spinbutton input,
 * while React owns equivalent stateful parsing. A raw-markup sample would
 * copy behaviour that belongs in those implementations and drift immediately.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

const SETUP = `${setupFor('input-number', false, '@org/ui-kit-react/styles')}

import { BapsInputNumber } from '@org/ui-kit-react';`;

const example = (name: string, props: string) => ({
  react: `${SETUP}

export function ${name}() {
  return <label>Attendance <BapsInputNumber ${props} /></label>;
}`,
  next: `'use client';

${SETUP}

export default function ${name}() {
  return <label>Attendance <BapsInputNumber ${props} /></label>;
}`,
});

export const inputNumberSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<label>
  Attendance
  <baps-input-number
    [(ngModel)]="attendance"
    (valueChange)="handleAttendanceInput($event)"
  />
</label>`,
    ...example(
      'AttendanceInput',
      'defaultValue={1250} onInput={({ value }) => console.log(value)}',
    ),
  },
  Constrained: {
    primeng: `<label>
  Rating
  <baps-input-number
    [(ngModel)]="rating"
    [min]="1"
    [max]="10"
    [maxFractionDigits]="2"
    [useGrouping]="false"
  />
</label>`,
    ...example(
      'ConstrainedNumberInput',
      'defaultValue={5.25} min={1} max={10} maxFractionDigits={2} useGrouping={false}',
    ),
  },
  Disabled: {
    primeng: `<label>
  Attendance
  <baps-input-number [(ngModel)]="attendance" [disabled]="true" />
</label>`,
    ...example('DisabledNumberInput', 'defaultValue={1250} disabled'),
  },
  Brands: {
    primeng: `<label>MyBKY attendance <baps-input-number [(ngModel)]="mybky" /></label>
<label>Sampark attendance <baps-input-number brand="sampark" [(ngModel)]="sampark" /></label>`,
    ...example('SamparkNumberInput', 'brand="sampark" defaultValue={1250}'),
  },
};
