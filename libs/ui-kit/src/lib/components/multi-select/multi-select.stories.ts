import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { BapsMultiSelect } from './multi-select.component';

/**
 * MultiSelect — multi-value dropdown, wrapping PrimeNG MultiSelect.
 *
 * The Sampark and MyBKY skins for this component already shipped in
 * `_select.scss` / `_select-sampark.scss` (88 rules) before the component
 * existed; every story below is rendering styling that was previously only
 * reachable by writing raw `p-multiselect` in application code.
 */
const meta: Meta<BapsMultiSelect> = {
  title: 'Components/Molecules/Multi Select',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-multiselect.
  id: 'components-multiselect',
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    styleClass: '',
    panelStyleClass: '',
    style: {},
    disabled: false,
    filter: false,
    fluid: false,
    group: false,
    maxSelectedLabels: 3,
    readonly: false,
    resetFilterOnHide: false,
    showClear: false,
    showHeader: true,
    showToggleAll: true,
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsMultiSelect,
  decorators: [moduleMetadata({ imports: [BapsMultiSelect, FormsModule] })],
  argTypes: {
    filterQueryChange: { control: false },
    itemRemove: { control: false },
    selectAllChange: { control: false },
    display: { control: 'select', options: ['comma', 'chip'] },
    size: { control: 'select', options: [undefined, 'small', 'large'] },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
    filter: { control: 'boolean' },
    showToggleAll: { control: 'boolean' },
    showClear: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<BapsMultiSelect>;

const CITIES = [
  { name: 'Ahmedabad', code: 'AMD' },
  { name: 'London', code: 'LDN' },
  { name: 'Nairobi', code: 'NBO' },
  { name: 'New Jersey', code: 'NJ' },
  { name: 'Toronto', code: 'TOR' },
];

export const Default: Story = {
  args: {
    placeholder: 'Select cities',
    optionLabel: 'name',
    options: CITIES,
  },
  render: (args) => ({
    props: { ...args, model: null },
    template: `
      <div style="max-width: 20rem">
        <baps-multi-select
          ariaLabel="Select cities"
          appendTo="body"
          [options]="options"
          [optionLabel]="optionLabel"
          [placeholder]="placeholder"
          [brand]="brand"
          [disabled]="disabled"
          [filter]="filter"
          [showToggleAll]="showToggleAll"
          [showClear]="showClear"
          [display]="display"
          [size]="size"
          [(ngModel)]="model"
        ></baps-multi-select>
      </div>
    `,
  }),
};

/**
 * `display="chip"` — each selection becomes a removable chip. The Sampark skin
 * styles these through `.p-multiselect-chip-item`.
 */
export const Chips: Story = {
  render: () => ({
    props: { options: CITIES, model: [CITIES[0], CITIES[2]] },
    template: `
      <div style="max-width: 22rem">
        <baps-multi-select
          ariaLabel="Select cities"
          appendTo="body"

          display="chip"
          optionLabel="name"
          placeholder="Select cities"
          [options]="options"
          [(ngModel)]="model"
        ></baps-multi-select>
      </div>
    `,
  }),
};

/**
 * Filter row plus the header's "Select All" box. Both are PrimeNG's — it owns
 * the checked state (all selected only, never indeterminate) and the announcement, which is why the wrapper
 * exposes `showToggleAll` rather than building a header row by hand.
 */
export const FilterAndSelectAll: Story = {
  render: () => ({
    props: { options: CITIES, model: null },
    template: `
      <div style="max-width: 20rem">
        <baps-multi-select
          ariaLabel="Select cities"
          appendTo="body"

          optionLabel="name"
          placeholder="Select cities"
          [filter]="true"
          filterPlaceholder="Search cities"
          [showToggleAll]="true"
          [options]="options"
          [(ngModel)]="model"
        ></baps-multi-select>
      </div>
    `,
  }),
};

/**
 * Grouped options, via `optionGroupLabel` / `optionGroupChildren`.
 */
export const Grouped: Story = {
  render: () => ({
    props: {
      groups: [
        { region: 'India', cities: [{ name: 'Ahmedabad' }, { name: 'Mumbai' }] },
        { region: 'UK', cities: [{ name: 'London' }, { name: 'Leicester' }] },
        { region: 'North America', cities: [{ name: 'Toronto' }, { name: 'New Jersey' }] },
      ],
      model: null,
    },
    template: `
      <div style="max-width: 20rem">
        <baps-multi-select
          ariaLabel="Select cities"
          appendTo="body"

          [group]="true"
          optionGroupLabel="region"
          optionGroupChildren="cities"
          optionLabel="name"
          placeholder="Select cities"
          [options]="groups"
          [(ngModel)]="model"
        ></baps-multi-select>
      </div>
    `,
  }),
};

/** Both size steps against the default. */
export const Sizes: Story = {
  render: () => ({
    props: { options: CITIES, a: [], b: [], c: [] },
    template: `
      <div style="max-width: 20rem; display: grid; gap: 0.75rem">
        <baps-multi-select
          ariaLabel="Select cities" appendTo="body" size="small" optionLabel="name" placeholder="Small" [options]="options" [(ngModel)]="a"></baps-multi-select>
        <baps-multi-select
          ariaLabel="Select cities" appendTo="body" optionLabel="name" placeholder="Default" [options]="options" [(ngModel)]="b"></baps-multi-select>
        <baps-multi-select
          ariaLabel="Select cities" appendTo="body" size="large" optionLabel="name" placeholder="Large" [options]="options" [(ngModel)]="c"></baps-multi-select>
      </div>
    `,
  }),
};

/** Both brands side by side. */
export const Brands: Story = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { options: CITIES, a: [], b: [] },
    template: `
      <div style="max-width: 20rem; display: grid; gap: 0.75rem">
        <baps-multi-select
          ariaLabel="Select cities" appendTo="body" brand="mybky" optionLabel="name" placeholder="MyBKY" [options]="options" [(ngModel)]="a"></baps-multi-select>
        <baps-multi-select
          ariaLabel="Select cities" appendTo="body" brand="sampark" optionLabel="name" placeholder="Sampark" [options]="options" [(ngModel)]="b"></baps-multi-select>
      </div>
    `,
  }),
};

/** Disabled state. */
export const Disabled: Story = {
  render: () => ({
    props: { options: CITIES, model: [CITIES[0]] },
    template: `
      <div style="max-width: 20rem">
        <baps-multi-select
          ariaLabel="Select cities"
          appendTo="body"
          optionLabel="name"
          placeholder="Select cities"
          [disabled]="true"
          [options]="options"
          [(ngModel)]="model"
        ></baps-multi-select>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Pick two options and the panel STAYS OPEN.
 *
 * That is the difference from a single select, and it is the thing a
 * regression would quietly break — a multiselect that closes after each pick
 * is technically functional and miserable to use for three selections.
 */
export const MultiSelectInteraction: Story = {
  name: 'Interaction — select several, panel stays open',
  args: { placeholder: 'Select cities', optionLabel: 'name', options: CITIES },
  render: (args) => ({
    props: { ...args, model: null },
    template: `
      <div style="max-width: 20rem">
        <baps-multi-select
          ariaLabel="Select cities"
          appendTo="body"
          [options]="options"
          [optionLabel]="optionLabel"
          [placeholder]="placeholder"
          [brand]="brand"
          [(ngModel)]="model"
        ></baps-multi-select>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('combobox');

    // The combobox node is an inner element; clicking the styled trigger is
    // what PrimeNG listens to, so the click goes to the wrapper.
    const wrapper = canvasElement.querySelector<HTMLElement>('.p-multiselect');
    await userEvent.click(wrapper ?? trigger);

    // Portaled panel, and it animates in — so wait for the options to exist
    // rather than asserting on the first frame.
    const options = await waitFor(() => page.getAllByRole('option'), { timeout: 5000 });
    await expect(options.length).toBeGreaterThan(1);

    await userEvent.click(options[0]);
    await userEvent.click(options[1]);

    // Still open after two picks — that is the difference from a single select.
    await expect(page.getAllByRole('option').length).toBeGreaterThan(1);
    await waitFor(() => expect(options[0]).toHaveAttribute('aria-selected', 'true'));
    await expect(options[1]).toHaveAttribute('aria-selected', 'true');
  },
};

/** A consumer `pTemplate="item"` reaches the inner p-multiselect (AT-042). */
export const ItemTemplate: Story = {
  decorators: [moduleMetadata({ imports: [FormsModule, SharedModule] })],
  render: () => ({
    props: { options: CITIES, model: ['AMD'] },
    template: `
      <div style="display:flex; gap:1rem; max-width:40rem">
        @for (brand of ['mybky', 'sampark']; track brand) {
          <baps-multi-select [brand]="brand" ariaLabel="Select cities" appendTo="body" optionLabel="name" optionValue="code" [options]="options" [ngModel]="model">
            <ng-template pTemplate="item" let-option>
              <span><strong>{{ option.code }}</strong> · {{ option.name }}</span>
            </ng-template>
          </baps-multi-select>
        }
      </div>
    `,
  }),
};

/**
 * `lockedValues` keep a value selected (its option is disabled and a removal
 * re-adds it); `keepOneSelected` never lets the selection go empty.
 */
export const LockedValues: Story = {
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  render: () => ({
    props: { options: CITIES, locked: ['AMD', 'LDN'], one: ['NBO'] },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:20rem">
        <baps-multi-select brand="sampark" ariaLabel="Locked cities" appendTo="body" display="chip" optionLabel="name" optionValue="code" [options]="options" [lockedValues]="['AMD']" [(ngModel)]="locked" />
        <baps-multi-select brand="sampark" ariaLabel="At least one city" appendTo="body" optionLabel="name" optionValue="code" [options]="options" [keepOneSelected]="true" [(ngModel)]="one" />
      </div>
    `,
  }),
};

/**
 * `chipOverflow`: past `maxSelectedLabels` the field keeps that many chips and
 * adds a "+N" chip whose tooltip lists the rest. A locked chip has no remove icon.
 */
export const ChipOverflow: Story = {
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  render: () => ({
    props: { options: CITIES, model: ['AMD', 'LDN', 'NBO', 'NJ'] },
    template: `
      <div style="max-width:20rem">
        <baps-multi-select brand="sampark" ariaLabel="Cities" appendTo="body" display="chip" [chipOverflow]="true" [maxSelectedLabels]="2" optionLabel="name" optionValue="code" [options]="options" [lockedValues]="['AMD']" [(ngModel)]="model" />
      </div>
    `,
  }),
};

/**
 * Sampark page, panel appended to body: the scrim catches the outside click
 * (z-index 3000, pointer-events auto) and the panel sits above it, so one
 * click outside closes only the panel, as on SPM dev (spm AT-076 / AT-090).
 * Open the panel, then click the dimmed page.
 */
export const SamparkScrimCatchesOutsideClick: Story = {
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  render: () => ({
    props: { options: CITIES, model: ['AMD'] },
    template: `
      <div style="max-width:20rem">
        <baps-multi-select brand="sampark" ariaLabel="Cities on a Sampark page" appendTo="body" optionLabel="name" optionValue="code" [options]="options" [(ngModel)]="model" />
      </div>
    `,
  }),
};
