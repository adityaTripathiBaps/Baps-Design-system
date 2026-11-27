import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsListbox, BapsListboxOption } from './listbox.component';

const meta: Meta = {
  title: 'Components/Molecules/Listbox',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-molecules-listbox.
  id: 'components-listbox',
  parameters: {
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-87722' },
  },
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [BapsListbox, FormsModule],
    }),
  ],
};

export default meta;
type Story = StoryObj;

const listboxArgTypes = {
  ariaLabel: { control: 'text' as const },
  multiple: { control: 'boolean' as const },
  checkbox: { control: 'boolean' as const },
  filter: { control: 'boolean' as const },
  disabled: { control: 'boolean' as const },
  readonly: { control: 'boolean' as const },
};

const listboxBaseArgs = {
  ariaLabel: 'Select an option',
  multiple: false,
  checkbox: false,
  filter: false,
  disabled: false,
  readonly: false,
};

const basicOptions: BapsListboxOption[] = [
  { label: 'John F. Kennedy', value: 'JFK' },
  { label: 'Heathrow', value: 'LHR' },
  { label: 'Charles de Gaulle', value: 'CDG' },
  { label: 'Frankfurt', value: 'FRA' },
  { label: 'Schiphol', value: 'AMS' },
  { label: 'Istanbul', value: 'IST' },
  { label: 'Dubai', value: 'DXB' },
  { label: 'Changi', value: 'SIN' },
  { label: 'Haneda', value: 'HND' },
];

export const ListboxPlayground: Story = {
  name: 'Listbox — Playground',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [ariaLabel]="ariaLabel"
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [filter]="filter"
          [disabled]="disabled"
          [(ngModel)]="value"
        ></baps-listbox>
        <div style="margin-top: 16px; font-size: 13px; color: var(--color-sampark-text-secondary, #595656)">
          Selected Value: {{ value | json }}
        </div>
      </div>
    `,
  }),
};

export const MultiSelectWithCheckboxes: Story = {
  name: 'Listbox — Multi Select With Checkboxes',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
    multiple: true,
    checkbox: true,
  },
  render: (args) => ({
    props: {
      ...args,
      value: ['JFK', 'LHR'],
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [ariaLabel]="ariaLabel"
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [filter]="filter"
          [disabled]="disabled"
          [(ngModel)]="value"
        ></baps-listbox>
        <div style="margin-top: 16px; font-size: 13px; color: var(--color-sampark-text-secondary, #595656)">
          Selected Values: {{ value | json }}
        </div>
      </div>
    `,
  }),
};

export const WithFiltering: Story = {
  name: 'Listbox — With Filtering',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
    filter: true,
    filterPlaceholder: 'Search airports...',
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [ariaLabel]="ariaLabel"
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [filter]="filter"
          [filterPlaceholder]="filterPlaceholder"
          [disabled]="disabled"
          [(ngModel)]="value"
        ></baps-listbox>
      </div>
    `,
  }),
};

export const Grouped: Story = {
  name: 'Listbox — Grouped',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    group: true,
    optionGroupLabel: 'label',
    optionGroupChildren: 'items',
    options: [
      {
        label: 'USA',
        code: 'US',
        items: [
          { label: 'Chicago', value: 'ORD' },
          { label: 'Los Angeles', value: 'LAX' },
          { label: 'New York', value: 'JFK' },
          { label: 'San Francisco', value: 'SFO' },
        ],
      },
      {
        label: 'Japan',
        code: 'JP',
        items: [
          { label: 'Tokyo Haneda', value: 'HND' },
          { label: 'Tokyo Narita', value: 'NRT' },
          { label: 'Osaka', value: 'KIX' },
        ],
      },
    ],
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [ariaLabel]="ariaLabel"
          [options]="options"
          [group]="group"
          [optionGroupLabel]="optionGroupLabel"
          [optionGroupChildren]="optionGroupChildren"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [disabled]="disabled"
          [(ngModel)]="value"
        ></baps-listbox>
      </div>
    `,
  }),
};

export const RichTemplatePanelList: Story = {
  name: 'Listbox — Rich Template Panel List',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: [
      {
        title: 'Ghanshyam Pandey',
        subtitle: 'Nation Leader',
        avatarLabel: 'GP',
        value: 'user1',
      },
      {
        title: 'Nilesh Patel',
        subtitle: 'Regional Admin',
        avatarLabel: 'NP',
        value: 'user2',
      },
      {
        title: 'Vimal Shah',
        subtitle: 'Satsang Coordinator',
        avatarLabel: 'VS',
        value: 'user3',
        disabled: true,
      },
      {
        title: 'Sanjay Sharma',
        subtitle: 'Donation Auditor',
        avatarLabel: 'SS',
        value: 'user4',
      },
      {
        title: 'Anish Mehta',
        subtitle: 'Event Volunteer',
        avatarIcon: 'pi-user',
        value: 'user5',
      },
    ],
  },
  render: (args) => ({
    props: {
      ...args,
      value: 'user1',
    },
    template: `
      <div style="max-width: 340px;">
        <h4 style="margin: 0 0 12px 0; font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: var(--color-sampark-text-primary, #151414);">Select User Role</h4>
        <baps-listbox
          [ariaLabel]="ariaLabel"
          [options]="options"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [disabled]="disabled"
          [(ngModel)]="value"
        ></baps-listbox>
        <div style="margin-top: 16px; font-size: 13px; color: var(--color-sampark-text-secondary, #595656)">
          Selected User: {{ value }}
        </div>
      </div>
    `,
  }),
};

export const CustomTemplatesUsingPTemplate: Story = {
  name: 'Listbox — Custom Templates Using P Template',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [ariaLabel]="ariaLabel"
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [(ngModel)]="value"
        >
          <ng-template pTemplate="item" let-option>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="pi pi-compass" style="color: var(--color-sampark-primary-default, #c96868);"></i>
              <span style="font-weight: 500;">{{ option.label }}</span>
              <span style="font-size: 12px; color: var(--color-sampark-text-muted, #9f9c9c);">({{ option.value }})</span>
            </div>
          </ng-template>
        </baps-listbox>
      </div>
    `,
  }),
};

export const DisabledAndInvalid: Story = {
  name: 'Listbox — Disabled And Invalid',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: [
      { label: 'Active Option A', value: 'A' },
      { label: 'Active Option B', value: 'B' },
      { label: 'Disabled Option C', value: 'C', disabled: true },
      { label: 'Active Option D', value: 'D' },
    ],
    optionLabel: 'label',
    optionValue: 'value',
    optionDisabled: 'disabled',
  },
  render: (args) => ({
    props: {
      ...args,
      value: 'A',
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 320px;">
        <div>
          <h4 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: var(--color-sampark-text-secondary, #595656);">Some Disabled Options</h4>
          <baps-listbox
            [ariaLabel]="ariaLabel"
            [options]="options"
            [optionLabel]="optionLabel"
            [optionValue]="optionValue"
            [optionDisabled]="optionDisabled"
            [(ngModel)]="value"
          ></baps-listbox>
        </div>

        <div>
          <h4 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: var(--color-sampark-text-secondary, #595656);">Entire Listbox Disabled</h4>
          <baps-listbox
            [ariaLabel]="ariaLabel"
            [options]="options"
            [optionLabel]="optionLabel"
            [optionValue]="optionValue"
            [disabled]="true"
            [(ngModel)]="value"
          ></baps-listbox>
        </div>

        <div>
          <h4 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: var(--color-sampark-text-secondary, #595656);">Readonly Listbox</h4>
          <baps-listbox
            [ariaLabel]="ariaLabel"
            [options]="options"
            [optionLabel]="optionLabel"
            [optionValue]="optionValue"
            [readonly]="true"
            [(ngModel)]="value"
          ></baps-listbox>
        </div>
      </div>
    `,
  }),
};

const box = (label: string, attrs: string, model = 'value') => `
        <div style="display:grid;gap:8px;max-width:20rem">
          <span style="font-size:13px;font-weight:600">${label}</span>
          <baps-listbox ${attrs} [(ngModel)]="${model}"></baps-listbox>
        </div>`;

/** PrimeNG "Checkmark": a tick beside the selected option instead of a filled row. */
export const Checkmark: Story = {
  name: 'Listbox — Checkmark',
  render: () => ({
    props: { options: basicOptions, value: 'LHR' },
    template: box('Checkmark', 'ariaLabel="Airport" [options]="options" optionLabel="label" optionValue="value" [checkmark]="true" [highlightOnSelect]="false"'),
  }),
};

/** PrimeNG "Multiple" and "Meta Key Selection": without and with Ctrl/Cmd to add to the selection. */
export const MultipleAndMetaKey: Story = {
  name: 'Listbox — Multiple and Meta Key Selection',
  render: () => ({
    props: { options: basicOptions, a: ['JFK'], b: ['JFK'] },
    template: `<div style="display:flex;gap:24px;flex-wrap:wrap">
      ${box('Multiple', 'ariaLabel="Airports" [options]="options" optionLabel="label" optionValue="value" [multiple]="true" [metaKeySelection]="false"', 'a')}
      ${box('Meta key selection (Ctrl/Cmd + click)', 'ariaLabel="Airports" [options]="options" optionLabel="label" optionValue="value" [multiple]="true" [metaKeySelection]="true"', 'b')}
    </div>`,
  }),
};

/** PrimeNG "Virtual Scroll": 10,000 rows rendered on demand, with filter, checkboxes, select all and stripes. */
export const VirtualScroll: Story = {
  name: 'Listbox — Virtual Scroll',
  render: () => ({
    props: {
      options: Array.from({ length: 10000 }, (_, i) => ({ label: `Item #${i}`, value: i })),
      value: [],
    },
    template: box('10,000 items', 'ariaLabel="Items" [options]="options" optionLabel="label" optionValue="value" [multiple]="true" [checkbox]="true" [filter]="true" [metaKeySelection]="false" [virtualScroll]="true" [virtualScrollItemSize]="40" scrollHeight="250px" [striped]="true"'),
  }),
};

/** PrimeNG "Drag and Drop": reorder the options by dragging. */
export const DragDrop: Story = {
  name: 'Listbox — Drag and Drop',
  render: () => ({
    props: { options: basicOptions.slice(0, 5).map((o) => ({ ...o })), value: null },
    template: box('Drag to reorder', 'ariaLabel="Airports" [options]="options" optionLabel="label" optionValue="value" [dragdrop]="true"'),
  }),
};

/** PrimeNG "Focus Behavior": autoOptionFocus, selectOnFocus and focusOnHover. */
export const FocusBehavior: Story = {
  name: 'Listbox — Focus Behavior',
  render: () => ({
    props: { options: basicOptions, value: null },
    template: box('Select on focus, first option focused', 'ariaLabel="Airport" [options]="options" optionLabel="label" optionValue="value" [autoOptionFocus]="true" [selectOnFocus]="true" [focusOnHover]="false"'),
  }),
};

/** Empty list and empty filter result messages. */
export const EmptyMessages: Story = {
  name: 'Listbox — Empty Messages',
  render: () => ({
    props: { none: [], options: basicOptions, value: null },
    template: `<div style="display:flex;gap:24px;flex-wrap:wrap">
      ${box('No options', 'ariaLabel="Nothing" [options]="none" emptyMessage="No airports yet"')}
      ${box('Filter with no match (type xyz)', 'ariaLabel="Airport" [options]="options" optionLabel="label" optionValue="value" [filter]="true" emptyFilterMessage="No airport matches"')}
    </div>`,
  }),
};

/** Invalid without a form, and fluid width. */
export const InvalidAndFluid: Story = {
  name: 'Listbox — Invalid and Fluid',
  render: () => ({
    props: { options: basicOptions, value: null },
    template: `<div style="display:grid;gap:24px">
      ${box('Invalid', 'ariaLabel="Airport" [options]="options" optionLabel="label" optionValue="value" [invalid]="true"')}
      <div style="display:grid;gap:8px"><span style="font-size:13px;font-weight:600">Fluid</span>
        <baps-listbox ariaLabel="Airport" [options]="options" optionLabel="label" optionValue="value" [fluid]="true" [(ngModel)]="value"></baps-listbox></div>
    </div>`,
  }),
};
