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
  buttonLayout: 'stacked' | 'horizontal' | 'vertical';
  step: number;
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
    buttonLayout: 'stacked',
    step: 1,
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
    buttonLayout: { control: 'inline-radio', options: ['stacked', 'horizontal', 'vertical'] },
    step: { control: 'number' },
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
          [buttonLayout]="buttonLayout"
          [step]="step"
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

/** PrimeNG "Numerals": integer only, no grouping, fraction digits, boundaries. */
export const Numerals: Story = {
  render: () => ({
    props: { a: 42723, b: 58151, c: 2351.35, d: 50 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Integer only<baps-input-number [showButtons]="false" [(ngModel)]="a" /></label>
        <label style="display:grid;gap:var(--space-1)">Without grouping<baps-input-number [showButtons]="false" [useGrouping]="false" [(ngModel)]="b" /></label>
        <label style="display:grid;gap:var(--space-1)">Min-max fraction digits<baps-input-number [showButtons]="false" [minFractionDigits]="2" [maxFractionDigits]="5" [(ngModel)]="c" /></label>
        <label style="display:grid;gap:var(--space-1)">Min-max boundaries<baps-input-number [showButtons]="false" [min]="0" [max]="100" [(ngModel)]="d" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Locale": grouping and decimal marks follow the locale. */
export const Locale: Story = {
  render: () => ({
    props: { a: 151351, b: 115744, c: 635524, d: 732762 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">User locale<baps-input-number [showButtons]="false" [minFractionDigits]="2" [(ngModel)]="a" /></label>
        <label style="display:grid;gap:var(--space-1)">United States<baps-input-number [showButtons]="false" locale="en-US" [minFractionDigits]="2" [(ngModel)]="b" /></label>
        <label style="display:grid;gap:var(--space-1)">German<baps-input-number [showButtons]="false" locale="de-DE" [minFractionDigits]="2" [(ngModel)]="c" /></label>
        <label style="display:grid;gap:var(--space-1)">Indian<baps-input-number [showButtons]="false" locale="en-IN" [minFractionDigits]="2" [(ngModel)]="d" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Currency": mode="currency" with an ISO code and locale. */
export const Currency: Story = {
  render: () => ({
    props: { a: 1500, b: 2500, c: 4250, d: 5002 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">United States<baps-input-number [showButtons]="false" mode="currency" currency="USD" locale="en-US" [(ngModel)]="a" /></label>
        <label style="display:grid;gap:var(--space-1)">Germany<baps-input-number [showButtons]="false" mode="currency" currency="EUR" locale="de-DE" [(ngModel)]="b" /></label>
        <label style="display:grid;gap:var(--space-1)">India<baps-input-number [showButtons]="false" mode="currency" currency="INR" currencyDisplay="code" locale="en-IN" [(ngModel)]="c" /></label>
        <label style="display:grid;gap:var(--space-1)">Japan<baps-input-number [showButtons]="false" mode="currency" currency="JPY" locale="ja-JP" [(ngModel)]="d" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Prefix & Suffix": text around the number that is not part of the value. */
export const PrefixSuffix: Story = {
  render: () => ({
    props: { a: 20, b: 50, c: 10, d: 20 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Mile<baps-input-number [showButtons]="false" suffix=" mi" [(ngModel)]="a" /></label>
        <label style="display:grid;gap:var(--space-1)">Percent<baps-input-number [showButtons]="false" prefix="%" [(ngModel)]="b" /></label>
        <label style="display:grid;gap:var(--space-1)">Expiry<baps-input-number [showButtons]="false" prefix="Expires in " suffix=" days" [(ngModel)]="c" /></label>
        <label style="display:grid;gap:var(--space-1)">Temperature<baps-input-number [showButtons]="false" prefix="↑ " suffix="℃" [min]="0" [max]="40" [(ngModel)]="d" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Buttons": stacked (default), min-max boundaries, and Horizontal with Step (buttonLayout="horizontal", step 0.25, minus before and plus after the field). */
export const Buttons: Story = {
  render: () => ({
    props: { a: 20, b: 25, c: 10.5 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Stacked<baps-input-number mode="currency" currency="USD" locale="en-US" [(ngModel)]="a" /></label>
        <label style="display:grid;gap:var(--space-1)">Min-max boundaries<baps-input-number [min]="0" [max]="100" [(ngModel)]="b" /></label>
        <label style="display:grid;gap:var(--space-1)">Horizontal with step<baps-input-number buttonLayout="horizontal" [step]="0.25" mode="currency" currency="EUR" locale="de-DE" [(ngModel)]="c" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Vertical": plus above and minus below the field. */
export const Vertical: Story = {
  render: () => ({
    props: { a: 50 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Vertical<baps-input-number buttonLayout="vertical" [inputStyle]="{ width: '3rem' }" [(ngModel)]="a" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Clear Icon": a clear control inside the field; clearing reports null. */
export const ClearIcon: Story = {
  render: () => ({
    props: { a: 1250 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Price<baps-input-number [showButtons]="false" [showClear]="true" mode="currency" currency="USD" locale="en-US" [(ngModel)]="a" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Sizes": small, default and large. */
export const Sizes: Story = {
  render: () => ({
    props: { a: null, b: null, c: null },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Small<baps-input-number size="small" [showButtons]="false" placeholder="Small" [(ngModel)]="a" /></label>
        <label style="display:grid;gap:var(--space-1)">Normal<baps-input-number [showButtons]="false" placeholder="Normal" [(ngModel)]="b" /></label>
        <label style="display:grid;gap:var(--space-1)">Large<baps-input-number size="large" [showButtons]="false" placeholder="Large" [(ngModel)]="c" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Fluid": the field fills its container. */
export const Fluid: Story = {
  render: () => ({
    props: { a: 1250 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Fluid<baps-input-number [fluid]="true" mode="currency" currency="USD" locale="en-US" [(ngModel)]="a" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Filled": the filled variant. */
export const Filled: Story = {
  render: () => ({
    props: { a: 1250 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Filled<baps-input-number variant="filled" [showButtons]="false" [(ngModel)]="a" /></label>
      </div>
    `,
  }),
};

/** PrimeNG "Invalid": the invalid state without a form, outlined and filled. */
export const Invalid: Story = {
  render: () => ({
    props: { a: null, b: null },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Amount<baps-input-number [invalid]="true" [showButtons]="false" [minFractionDigits]="2" placeholder="Amount" [(ngModel)]="a" /></label>
        <label style="display:grid;gap:var(--space-1)">Amount (filled)<baps-input-number [invalid]="true" variant="filled" [showButtons]="false" [minFractionDigits]="2" placeholder="Amount" [(ngModel)]="b" /></label>
      </div>
    `,
  }),
};

/** Readonly: the value shows, the buttons and typing do nothing. */
export const Readonly: Story = {
  render: () => ({
    props: { a: 1250 },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4);align-items:end">
        <label style="display:grid;gap:var(--space-1)">Readonly<baps-input-number [readonly]="true" [(ngModel)]="a" /></label>
      </div>
    `,
  }),
};
