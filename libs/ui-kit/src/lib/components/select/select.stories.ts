import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { BapsSelect } from './select.component';

/**
 * appendTo="body" on the examples is deliberate, and it is the usage the docs
 * page recommends. Left inline, the overlay is clipped: Storybook's docs
 * preview wraps each canvas in containers that are overflow:hidden and about
 * 80-130px tall, so an open panel is cut off mid-option with a scrollbar.
 * Any consumer with an overflow:hidden ancestor -- a dialog, a drawer, a
 * scrolling table cell -- sees the same thing, which is why the component
 * documents this input.
 */
const meta: Meta<BapsSelect> = {
  title: 'Components/Molecules/Select',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-select.
  id: 'components-select',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    styleClass: '',
    panelStyleClass: '',
    style: {},
    disabled: false,
    editable: false,
    filter: false,
    group: false,
    showClear: false,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    filterQueryChange: { control: false },
    size: { control: 'inline-radio', options: [undefined, 'small', 'large'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    disabled: { control: 'boolean' },
    filter: { control: 'boolean' },
    showClear: { control: 'boolean' },
    editable: { control: 'boolean' },
    group: { control: 'boolean' },
    optionLabel: { control: 'text' },
    optionValue: { control: 'text' },
    optionDisabled: { control: 'text' },
    optionGroupLabel: { control: 'text' },
    placeholder: { control: 'text' },
    filterBy: { control: 'text' },
  },
  component: BapsSelect,
  render: (args) => ({
    props: args,
    template: `
      <baps-select
        [options]="options"
        [optionLabel]="optionLabel"
        [placeholder]="placeholder"
        [brand]="brand"
        [disabled]="disabled"
        [filter]="filter"
        [showClear]="showClear"
        [editable]="editable"
        [size]="size"
        appendTo="body">
      </baps-select>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsSelect> = {
  args: {
    placeholder: 'Select a City',
    optionLabel: 'name',
    options: [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ],
  },
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Open the panel, pick an option, see it land in the trigger.
 *
 * The panel is portaled to <body>, so it is queried on the document. The last
 * assertion is the one that matters: an option that highlights but never
 * reaches the closed trigger is a select that looks like it works.
 */
export const SelectOptionInteraction: StoryObj<BapsSelect> = {
  name: 'Interaction — open and select',
  args: {
    placeholder: 'Select a City',
    optionLabel: 'name',
    options: [
      { name: 'New York', code: 'NY' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('combobox');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));

    await userEvent.click(await waitFor(() => page.getByRole('option', { name: 'Rome' })));
    await waitFor(() => expect(canvas.getByText('Rome')).toBeVisible());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

/** Keyboard: the trigger is a combobox, so Enter/Space opens the panel. */
export const KeyboardInteraction: StoryObj<BapsSelect> = {
  name: 'Interaction — keyboard opens the panel',
  args: {
    placeholder: 'Select a City',
    optionLabel: 'name',
    options: [{ name: 'New York', code: 'NY' }, { name: 'Rome', code: 'RM' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
  },
};
