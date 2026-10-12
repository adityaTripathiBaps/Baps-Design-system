import { FormsModule } from '@angular/forms';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import type { InputNumberInputEvent } from 'primeng/inputnumber';

import { BapsInputNumber } from './input-number.component';

interface InputNumberArgs {
  showButtons: boolean;
  min?: number;
  max?: number;
  maxlength?: number;
  maxFractionDigits?: number;
  inputStyleClass?: string;
  styleClass?: string;
  useGrouping: boolean;
  mode: 'decimal' | 'currency';
  placeholder?: string;
  disabled: boolean;
  size?: 'small' | 'large';
  brand: 'mybky' | 'sampark';
  onValue?: (event: InputNumberInputEvent) => void;
}

const meta: Meta<InputNumberArgs> = {
  title: 'Components/Molecules/Input Number',
  id: 'components-input-number',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsInputNumber,
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  args: {
    showButtons: true,
    min: 0,
    max: 100000,
    maxlength: 8,
    maxFractionDigits: 2,
    inputStyleClass: '',
    styleClass: '',
    useGrouping: true,
    mode: 'decimal',
    placeholder: 'Enter attendance',
    disabled: false,
    brand: 'mybky',
  },
  argTypes: {
    showButtons: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    maxlength: { control: 'number' },
    maxFractionDigits: { control: 'number' },
    inputStyleClass: { control: 'text' },
    styleClass: { control: 'text' },
    useGrouping: { control: 'boolean' },
    mode: { control: 'inline-radio', options: ['decimal', 'currency'] },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { control: 'inline-radio', options: [undefined, 'small', 'large'] },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    onValue: { control: false },
  },
  render: (args) => ({
    props: { ...args, model: 1250, onValue: action('input') },
    template: `
      <label>
        Attendance
        <baps-input-number
          [(ngModel)]="model"
          [showButtons]="showButtons"
          [min]="min"
          [max]="max"
          [maxlength]="maxlength"
          [maxFractionDigits]="maxFractionDigits"
          [inputStyleClass]="inputStyleClass"
          [styleClass]="styleClass"
          [useGrouping]="useGrouping"
          [mode]="mode"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [size]="size"
          [brand]="brand"
          (valueChange)="onValue($event)"
        />
      </label>
    `,
  }),
};

export default meta;
type Story = StoryObj<InputNumberArgs>;

/** Spinner buttons are on by default because every measured consumer uses them. */
export const Default: Story = {};

/** Min/max clamping and decimal precision. */
export const Constrained: Story = {
  args: { min: 1, max: 10, maxFractionDigits: 2, useGrouping: false },
};

/** Native disabled state reaches the field and both spinner buttons. */
export const Disabled: Story = {
  args: { disabled: true },
};

/** Both visual skins use the same numeric behaviour and shared field tokens. */
export const Brands: Story = {
  tags: ['ds:comparison'],
  render: () => ({
    props: { mybky: 1250, sampark: 1250 },
    template: `
      <div style="display:grid;gap:var(--space-4)">
        <label>
          MyBKY attendance
          <baps-input-number [(ngModel)]="mybky" />
        </label>
        <label>
          Sampark attendance
          <baps-input-number brand="sampark" [(ngModel)]="sampark" />
        </label>
      </div>
    `,
  }),
};

export const SpinnerKeyboardInteraction: StoryObj<
  InputNumberArgs & { onValue: ReturnType<typeof fn> }
> = {
  name: 'Interaction — keyboard spinner',
  args: { onValue: fn() },
  render: (args) => ({
    props: { ...args, model: 5 },
    template: `
      <label>
        Attendance
        <baps-input-number
          [(ngModel)]="model"
          [min]="0"
          [max]="10"
          (valueChange)="onValue($event)"
        />
      </label>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('spinbutton', { name: 'Attendance' });
    const increase = canvas.getByRole('button', { name: 'Increase value' });

    increase.focus();
    await expect(increase).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await expect(input).toHaveValue('6');
    await expect(args.onValue).toHaveBeenCalled();
  },
};
