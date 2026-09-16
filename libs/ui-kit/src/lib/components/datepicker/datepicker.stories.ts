import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsDatepicker } from './datepicker.component';

/**
 * DatePicker — Figma file xc0L2xnREMgjyb5XcKyLIz:
 *   17512:78299            single month, 250x250
 *   17512:78298 / :78300   dual-month range, 500x282
 *
 * The frames' optional "Frame 4" (top, 500x48) and "Calendar Actions"
 * (footer, 500x48) slots are both hidden, so no API is exposed for them —
 * PrimeNG's own `showButtonBar` covers the footer case if it is ever
 * turned on, and `<ng-content>` forwards a `<ng-template pTemplate>` for
 * anything else.
 *
 * Stories render `inline` so the calendar is visible without a click; the
 * portaled-overlay path is exercised by Overlay below.
 */
const meta: Meta<BapsDatepicker> = {
  title: 'Components/Molecules/Date Picker',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-datepicker.
  id: 'components-datepicker',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    styleClass: '',
    inputStyleClass: '',
    panelStyleClass: '',
    disabled: false,
    inline: false,
    numberOfMonths: 1,
    readonlyInput: false,
    selectOtherMonths: false,
    showButtonBar: false,
    showClear: false,
    showIcon: false,
    showOtherMonths: true,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    dateSelect: { control: false },
    panelClose: { control: false },
    selectionMode: { control: 'inline-radio', options: [undefined, 'single', 'multiple', 'range'] },
    view: { control: 'inline-radio', options: [undefined, 'date', 'month', 'year'] },
    iconDisplay: { control: 'inline-radio', options: [undefined, 'input', 'button'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    disabled: { control: 'boolean' },
    readonlyInput: { control: 'boolean' },
    inline: { control: 'boolean' },
    showIcon: { control: 'boolean' },
    showButtonBar: { control: 'boolean' },
    showClear: { control: 'boolean' },
    showOtherMonths: { control: 'boolean' },
    selectOtherMonths: { control: 'boolean' },
    numberOfMonths: { control: 'number' },
    dateFormat: { control: 'text' },
    placeholder: { control: 'text' },
    styleClass: { control: 'text' },
    inputStyleClass: { control: 'text' },
    panelStyleClass: { control: 'text' },
    inputId: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:78299.
    // Harvested from datepicker.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-78299' },
  },
  component: BapsDatepicker,
  decorators: [moduleMetadata({ imports: [FormsModule] })],
};

export default meta;

/**
 * Single date — Figma 17512:78299.
 *
 * NO brand attribute, on purpose. MyBKY is the design system's UNSCOPED
 * default, so an unmarked instance follows whatever the toolbar's "Design
 * system" toggle selects. Pinning brand="sampark" here made the story render
 * Sampark even with the toggle on MyBKY — a per-instance host class beats the
 * page-wide scope, which is the entire point of that class and exactly wrong
 * for a generic example.
 */
export const Default: StoryObj<BapsDatepicker> = {
  render: () => ({
    props: { date: new Date(2025, 0, 10) },
    template: `
      <baps-datepicker inline="true" ariaLabel="Event date" [(ngModel)]="date"></baps-datepicker>
    `,
  }),
};

/**
 * Dual-month range — Figma 17512:78298. Jan 10 → Feb 20 reproduces the
 * frame exactly: solid Primary/60 endpoints, a continuous 10%-primary
 * band across the interior, Jan 8 carrying the today marker.
 *
 * Follows the toolbar toggle, like Default. RangeMyBKY below is the same range
 * PINNED to MyBKY, so the two skins can be compared whichever way the toggle
 * happens to be set.
 */
export const Range: StoryObj<BapsDatepicker> = {
  render: () => ({
    props: { range: [new Date(2025, 0, 10), new Date(2025, 1, 20)] },
    template: `
      <baps-datepicker
        inline="true"
        selectionMode="range"
        [numberOfMonths]="2"
        ariaLabel="Event date range"
        [(ngModel)]="range"
      ></baps-datepicker>
    `,
  }),
};

/**
 * The same range PINNED to MyBKY with brand="mybky".
 *
 * Pinned rather than left unmarked so the story's name stays true with the
 * toggle on Sampark. The unmarked version is Range, above.
 */
export const RangeMyBKY: StoryObj<BapsDatepicker> = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  render: () => ({
    props: { range: [new Date(2025, 0, 10), new Date(2025, 1, 20)] },
    template: `
      <baps-datepicker
        brand="mybky"
        inline="true"
        selectionMode="range"
        [numberOfMonths]="2"
        ariaLabel="Event date range"
        [(ngModel)]="range"
      ></baps-datepicker>
    `,
  }),
};

/**
 * The real overlay path. The panel portals to `<body>`, so this is what
 * proves `resolvedPanelStyleClass` gets the Sampark scope onto it — a
 * Sampark trigger over a MyBKY panel is the regression this guards.
 *
 * STAYS pinned to Sampark, unlike the generic stories above. The thing under
 * test is the per-instance scope reaching a portalled panel, so an unmarked
 * instance would test nothing.
 */
export const Overlay: StoryObj<BapsDatepicker> = {
  render: () => ({
    props: { single: null, range: null },
    template: `
      <div style="display:flex; gap:1rem; align-items:flex-start; min-height:22rem">
        <baps-datepicker
          showIcon="true"
          placeholder="Select a date"
          [(ngModel)]="single"
        ></baps-datepicker>
        <baps-datepicker
          showIcon="true"
          selectionMode="range"
          [numberOfMonths]="2"
          placeholder="Select a date range"
          [(ngModel)]="range"
        ></baps-datepicker>
      </div>
    `,
  }),
};

/** Disabled field, plus a calendar with a min/max window. */
export const Constrained: StoryObj<BapsDatepicker> = {
  render: () => ({
    props: {
      off: new Date(2025, 0, 10),
      bounded: new Date(2025, 0, 15),
      min: new Date(2025, 0, 8),
      max: new Date(2025, 0, 24),
    },
    template: `
      <div style="display:flex; gap:1rem; align-items:flex-start">
        <baps-datepicker disabled="true" showIcon="true" [(ngModel)]="off"></baps-datepicker>
        <baps-datepicker
          inline="true"
          [minDate]="min"
          [maxDate]="max"
          ariaLabel="Booking date"
          [(ngModel)]="bounded"
        ></baps-datepicker>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Pick a day in the inline calendar.
 *
 * Inline rather than the popup form on purpose: the popup portals to <body>
 * and adds an open/close step that the select stories already cover, while
 * what is specific to a datepicker is that clicking a day cell writes the
 * date. The grid has real `gridcell` roles, so the day is found by role.
 */
export const SelectDayInteraction: StoryObj<BapsDatepicker> = {
  name: 'Interaction — pick a day',
  render: () => ({
    props: { date: null },
    template: `
      <baps-datepicker [inline]="true" ariaLabel="Event date" [(ngModel)]="date"></baps-datepicker>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Measured: PrimeNG's day cells are <td role="presentation"> holding a
    // <span class="p-datepicker-day">, NOT role="gridcell" — only the table
    // itself carries role="grid". So the day is found by its own class.
    // Leading/trailing cells are disabled, hence the filter.
    const days = [
      ...canvasElement.querySelectorAll<HTMLElement>(
        'td:not(.p-datepicker-other-month) .p-datepicker-day:not(.p-disabled)',
      ),
    ];
    await expect(days.length).toBeGreaterThan(0);

    await userEvent.click(days[9] ?? days[0]);
    await waitFor(() =>
      expect(canvasElement.querySelector('.p-datepicker-day-selected')).toBeTruthy(),
    );
  },
};

/** Keyboard: arrows move the focused day, which is the keyboard user's path. */
export const KeyboardInteraction: StoryObj<BapsDatepicker> = {
  name: 'Interaction — keyboard',
  render: () => ({
    props: { date: new Date(2025, 0, 10) },
    template: `
      <baps-datepicker [inline]="true" ariaLabel="Event date" [(ngModel)]="date"></baps-datepicker>
    `,
  }),
  play: async ({ canvasElement }) => {
    const selected = canvasElement.querySelector<HTMLElement>('.p-datepicker-day-selected');
    await expect(selected).toBeTruthy();

    selected?.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(canvasElement.ownerDocument.activeElement).not.toBe(selected),
    );
  },
};
