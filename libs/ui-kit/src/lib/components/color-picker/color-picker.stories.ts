import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { BapsColorPicker } from './color-picker.component';

const meta: Meta<BapsColorPicker> = {
  title: 'Components/Molecules/ColorPicker',
  id: 'components-colorpicker',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsColorPicker,
  decorators: [moduleMetadata({ imports: [BapsColorPicker, FormsModule, ReactiveFormsModule, JsonPipe] })],
};
export default meta;
type Story = StoryObj<BapsColorPicker>;

const row = 'display:flex;gap:var(--space-4);align-items:center;flex-wrap:wrap';

/** PrimeNG "Basic": a swatch that opens the picker in a popup. */
export const Basic: Story = {
  render: () => ({
    props: { color: '#5f78b8' },
    template: `<div style="${row}">
      <label for="cp-basic">Colour</label>
      <baps-color-picker inputId="cp-basic" [(ngModel)]="color" />
      <code>{{ color }}</code>
    </div>`,
  }),
};

/** PrimeNG "Inline": the picker sits in the page. */
export const Inline: Story = {
  render: () => ({
    props: { color: '#5f78b8' },
    template: `<div style="${row}">
      <baps-color-picker [inline]="true" [(ngModel)]="color" />
      <code>{{ color }}</code>
    </div>`,
  }),
};

/** PrimeNG "Format": the value as hex, rgb or hsb. */
export const Format: Story = {
  render: () => ({
    props: { hex: '#6466f1', rgb: { r: 100, g: 102, b: 241 }, hsb: { h: 239, s: 59, b: 95 } },
    template: `<div style="${row};gap:var(--space-6)">
      <div style="display:grid;gap:var(--space-2);justify-items:start">
        <span>HEX</span><baps-color-picker format="hex" [(ngModel)]="hex" /><code>{{ hex }}</code>
      </div>
      <div style="display:grid;gap:var(--space-2);justify-items:start">
        <span>RGB</span><baps-color-picker format="rgb" [(ngModel)]="rgb" /><code>{{ rgb | json }}</code>
      </div>
      <div style="display:grid;gap:var(--space-2);justify-items:start">
        <span>HSB</span><baps-color-picker format="hsb" [(ngModel)]="hsb" /><code>{{ hsb | json }}</code>
      </div>
    </div>`,
  }),
};

/** PrimeNG "Disabled". */
export const Disabled: Story = {
  render: () => ({
    props: { color: '#5f78b8' },
    template: `<baps-color-picker [(ngModel)]="color" [disabled]="true" />`,
  }),
};

/** PrimeNG "Forms": a required colour in a reactive form. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null, Validators.required) },
    template: `<div style="${row}">
      <baps-color-picker [formControl]="control" defaultColor="ff0000" />
      <code>value: {{ control.value ?? 'null' }} · valid: {{ control.valid }} · touched: {{ control.touched }}</code>
    </div>`,
  }),
};
