import { FormsModule } from '@angular/forms';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';

import { BapsChipsInput } from './chips-input.component';

interface ChipsInputArgs {
  placeholder?: string;
  disabled: boolean;
  size?: 'small' | 'large';
  brand: 'mybky' | 'sampark';
  separator?: string;
  onValueChange?: (value: string[]) => void;
}

const meta: Meta<ChipsInputArgs> = {
  title: 'Components/Molecules/Chips Input',
  id: 'components-chips-input',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsChipsInput,
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  args: {
    placeholder: 'Add a skill',
    disabled: false,
    brand: 'mybky',
    separator: ',',
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { control: 'inline-radio', options: [undefined, 'small', 'large'] },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    separator: { control: 'text' },
    onValueChange: { control: false },
  },
  render: (args) => ({
    props: {
      ...args,
      model: ['Angular'],
      onValueChange: action('valueChange'),
    },
    template: `
      <div>
        <span id="chips-input-default-label">Skills</span>
        <baps-chips-input
          aria-labelledby="chips-input-default-label"
          [(ngModel)]="model"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [size]="size"
          [brand]="brand"
          [separator]="separator"
          (ngModelChange)="onValueChange($event)"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<ChipsInputArgs>;

/** Enter commits free text; the configured separator does the same. */
export const Default: Story = {};

/** A semicolon can commit values when commas are meaningful to the content. */
export const CustomSeparator: Story = {
  args: { separator: ';' },
};

/** Disabled state reaches both the text field and every rendered chip. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Both brand skins share the same entry and removal behavior. */
export const Brands: Story = {
  tags: ['ds:comparison'],
  render: () => ({
    props: {
      mybky: ['Angular'],
      sampark: ['React'],
    },
    template: `
      <div style="display:grid;gap:var(--space-4)">
        <div>
          <span id="chips-input-mybky-label">MyBKY skills</span>
          <baps-chips-input
            aria-labelledby="chips-input-mybky-label"
            [(ngModel)]="mybky"
            placeholder="Add a skill"
          />
        </div>
        <div>
          <span id="chips-input-sampark-label">Sampark skills</span>
          <baps-chips-input
            aria-labelledby="chips-input-sampark-label"
            brand="sampark"
            [(ngModel)]="sampark"
            placeholder="Add a skill"
          />
        </div>
      </div>
    `,
  }),
};

/** Both brands keep the field and chips on their existing dark token aliases. */
export const Dark: Story = {
  tags: ['ds:comparison'],
  render: () => ({
    props: {
      mybky: ['Angular'],
      sampark: ['React'],
    },
    template: `
      <div style="display:grid;gap:var(--space-4)">
        <div
          class="baps-dark"
          style="padding:var(--space-4);background:var(--color-mybky-dark-surface-ground)"
        >
          <span id="chips-input-mybky-dark-label">MyBKY skills</span>
          <baps-chips-input
            aria-labelledby="chips-input-mybky-dark-label"
            [(ngModel)]="mybky"
            placeholder="Add a skill"
          />
        </div>
        <div
          class="baps-dark baps-ds-sampark"
          style="padding:var(--space-4);background:var(--color-sampark-dark-surface-ground)"
        >
          <span id="chips-input-sampark-dark-label">Sampark skills</span>
          <baps-chips-input
            aria-labelledby="chips-input-sampark-dark-label"
            brand="sampark"
            [(ngModel)]="sampark"
            placeholder="Add a skill"
          />
        </div>
      </div>
    `,
  }),
};

export const KeyboardInteraction: Story = {
  name: 'Interaction — keyboard entry and removal',
  render: (args) => ({
    props: { ...args, model: [] },
    template: `
      <div>
        <span id="chips-input-interaction-label">Skills</span>
        <baps-chips-input
          aria-labelledby="chips-input-interaction-label"
          [(ngModel)]="model"
          [separator]="separator"
        />
      </div>
      <output aria-label="Committed value count">{{ model.length }}</output>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Skills' });

    await userEvent.click(input);
    await userEvent.type(input, 'Angular');
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getAllByRole('button', { name: 'Remove' }),
    ).toHaveLength(1);
    await expect(
      canvas.getByRole('status', { name: 'Committed value count' }),
    ).toHaveTextContent('1');

    await userEvent.type(input, 'React');
    await userEvent.keyboard(',');
    await expect(
      canvas.getAllByRole('button', { name: 'Remove' }),
    ).toHaveLength(2);
    await expect(
      canvas.getByRole('status', { name: 'Committed value count' }),
    ).toHaveTextContent('2');
    const firstRemove = canvas.getAllByRole('button', { name: 'Remove' })[0];
    firstRemove.focus();
    await expect(firstRemove).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getAllByRole('button', { name: 'Remove' }),
    ).toHaveLength(1);
    await expect(
      canvas.getByRole('status', { name: 'Committed value count' }),
    ).toHaveTextContent('1');

    input.focus();
    await userEvent.keyboard('{Backspace}');
    await expect(
      canvas.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('status', { name: 'Committed value count' }),
    ).toHaveTextContent('0');
  },
};
