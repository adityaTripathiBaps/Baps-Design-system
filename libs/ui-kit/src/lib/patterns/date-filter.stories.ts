import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BapsSelect } from '../components/select/select.component';
import { BapsDatepicker } from '../components/datepicker/datepicker.component';
import { BapsInputText } from '../components/form-field/directives/input-text.directive';

/**
 * Date filter: a condition plus an inline calendar, as the Calendar page of
 * Figma "🟢 Component Library" (10069:3032) draws it for table filters.
 *
 * A composition of existing kit parts, not a component: `baps-select` holds
 * the condition, read-only `bapsInputText` fields echo the chosen date, and
 * `baps-datepicker` renders inline under them. "Date is in between" switches
 * the calendar to a two-month range and adds the end-date field.
 *
 * Panel geometry from Figma: an 8px header row with 4px gaps; condition 180px
 * wide (205px for a range), each date field 120px (130px for a range), and a
 * "-" between the two range fields. The header sets the panel width: 320px,
 * or 500px for a range.
 *
 * Known difference, left for the datepicker owner: the inline calendar keeps
 * the kit datepicker's own fixed width and 1px border, which were tuned to
 * SPM dev. In Figma the calendar fills the panel with 12px padding and has no
 * border of its own. A range also opens on the end date's month, because
 * PrimeNG does that, where Figma shows the start month first.
 */
const CONDITIONS = [
  { label: 'Date is', value: 'is' },
  { label: 'Date is before', value: 'before' },
  { label: 'Date is after', value: 'after' },
  { label: 'Date is on or before', value: 'onOrBefore' },
  { label: 'Date is on or after', value: 'onOrAfter' },
  { label: 'Date is in between', value: 'between' },
];

const PANEL = `
  display: inline-flex; flex-direction: column;
  background: var(--color-sampark-surface-card, #ffffff);
  border-radius: var(--radius-sampark-default, 4px);
  box-shadow: var(--shadow-sampark-dropdown);
`;
const HEADER = 'display:flex; align-items:center; gap: var(--space-1); padding: var(--space-2);';

const meta: Meta = {
  title: 'Patterns/Date filter',
  id: 'patterns-date-filter',
  tags: ['ds:sampark'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/PKHWEQTVUKl6FAeQSIkXMW/?node-id=10069-3032',
    },
  },
  decorators: [
    moduleMetadata({ imports: [BapsSelect, BapsDatepicker, BapsInputText, FormsModule, DatePipe] }),
  ],
};

export default meta;
type Story = StoryObj;

/** One date with a condition. Pick "Date is in between" to see the range form. */
export const Default: Story = {
  render: () => ({
    props: {
      conditions: CONDITIONS,
      condition: 'onOrBefore',
      date: new Date(2025, 6, 10),
      range: [new Date(2025, 6, 10), new Date(2025, 7, 20)],
      panel: PANEL,
      header: HEADER,
    },
    template: `
      <div class="baps-ds-sampark" style="padding: 8px 8px 360px;">
        <div [style]="panel">
          <div [style]="header">
            <baps-select
              appendTo="body"
              [options]="conditions" optionLabel="label" optionValue="value"
              [(ngModel)]="condition" ariaLabel="Date condition"
              style="flex: none"
              [style.width]="condition === 'between' ? '12.8125rem' : '11.25rem'" />
            @if (condition === 'between') {
              <span style="display:flex; flex:none; width:8.125rem">
                <input bapsInputText readonly aria-label="Start date"
                  [value]="(range?.[0] | date: 'd MMM, y') ?? ''" placeholder="Select Start Date" />
              </span>
              <span aria-hidden="true">-</span>
              <span style="display:flex; flex:none; width:8.125rem">
                <input bapsInputText readonly aria-label="End date"
                  [value]="(range?.[1] | date: 'd MMM, y') ?? ''" placeholder="Select End Date" />
              </span>
            } @else {
              <span style="display:flex; flex:none; width:7.5rem">
                <input bapsInputText readonly aria-label="Date"
                  [value]="(date | date: 'd MMM, y') ?? ''" placeholder="Select Date" />
              </span>
            }
          </div>
          @if (condition === 'between') {
            <baps-datepicker inline="true" selectionMode="range" [numberOfMonths]="2"
              ariaLabel="Date range" [(ngModel)]="range" />
          } @else {
            <baps-datepicker inline="true" ariaLabel="Date" [(ngModel)]="date" />
          }
        </div>
      </div>
    `,
  }),
};
