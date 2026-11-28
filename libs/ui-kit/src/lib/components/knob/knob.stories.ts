import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BapsKnob } from './knob.component';
import { BapsButton } from '../button/button.component';

const meta: Meta<BapsKnob> = {
  title: 'Components/Molecules/Knob',
  id: 'components-knob',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsKnob,
  decorators: [moduleMetadata({ imports: [BapsKnob, BapsButton, FormsModule, ReactiveFormsModule] })],
};
export default meta;
type Story = StoryObj<BapsKnob>;

const one = (attrs: string, label = 'Volume') => ({
  props: { value: 50 },
  template: `<baps-knob ariaLabel="${label}" ${attrs} [(ngModel)]="value" />`,
});

/** PrimeNG "Basic". */
export const Basic: Story = { render: () => one('') };

/** PrimeNG "Min/Max". */
export const MinMax: Story = { render: () => one('[min]="-50" [max]="50"', 'Offset') };

/** PrimeNG "Step". */
export const Step: Story = { render: () => one('[step]="10"') };

/** PrimeNG "Template": text around the number. */
export const Template: Story = { render: () => one('valueTemplate="{value}%"', 'Progress') };

/** PrimeNG "Stroke". */
export const Stroke: Story = { render: () => one('[strokeWidth]="5"') };

/** PrimeNG "Size". */
export const Size: Story = { render: () => one('[size]="200"') };

/** PrimeNG "Color": any CSS colour; the kit's tokens keep it on brand. */
export const Color: Story = {
  render: () => one('valueColor="var(--p-primary-700)" rangeColor="var(--p-primary-100)" textColor="var(--p-primary-700)"'),
};

/** PrimeNG "Reactive": the value changes from outside. */
export const Reactive: Story = {
  render: () => ({
    props: { value: 0 },
    template: `<div style="display:grid;gap:var(--space-3);justify-items:center;width:max-content">
      <baps-knob ariaLabel="Level" [(ngModel)]="value" [readonly]="true" />
      <div style="display:flex;gap:var(--space-2)">
        <baps-button icon="pi pi-plus" ariaLabel="Increase" (click)="value = value + 1" [disabled]="value >= 100" />
        <baps-button icon="pi pi-minus" ariaLabel="Decrease" (click)="value = value - 1" [disabled]="value <= 0" />
      </div>
    </div>`,
  }),
};

/** PrimeNG "ReadOnly". */
export const ReadOnly: Story = { render: () => one('[readonly]="true"') };

/** PrimeNG "Disabled". */
export const Disabled: Story = { render: () => one('[disabled]="true"') };

/** PrimeNG "Forms": a value that must be at least 20. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { control: new FormControl<number>(10, Validators.min(20)) },
    template: `<div style="display:grid;gap:var(--space-2);justify-items:start">
      <baps-knob ariaLabel="Level" [formControl]="control" />
      <code>value: {{ control.value }} · valid: {{ control.valid }}</code>
    </div>`,
  }),
};
