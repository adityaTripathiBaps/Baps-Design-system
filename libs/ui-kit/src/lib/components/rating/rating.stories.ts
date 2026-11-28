import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { BapsRating } from './rating.component';

const meta: Meta<BapsRating> = {
  title: 'Components/Molecules/Rating',
  id: 'components-rating',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsRating,
  decorators: [moduleMetadata({ imports: [BapsRating, FormsModule, ReactiveFormsModule, SharedModule] })],
};
export default meta;
type Story = StoryObj<BapsRating>;

const one = (attrs: string, value: number | null = null, body = '') => ({
  props: { value },
  template: `<div style="display:flex;gap:var(--space-4);align-items:center">
    <baps-rating ${attrs} [(ngModel)]="value">${body}</baps-rating><code>{{ value ?? 'null' }}</code>
  </div>`,
});

/** PrimeNG "Basic": click a star; click it again to clear. */
export const Basic: Story = { render: () => one('') };

/** PrimeNG "Number of Stars". */
export const NumberOfStars: Story = { render: () => one('[stars]="10"') };

/** PrimeNG "Template": any icon in place of the stars. */
export const Template: Story = {
  render: () =>
    one(
      '',
      null,
      `
      <ng-template pTemplate="onicon"><i class="pi pi-heart-fill" style="color:var(--p-primary-color);font-size:1.25rem"></i></ng-template>
      <ng-template pTemplate="officon"><i class="pi pi-heart" style="color:var(--p-text-muted-color);font-size:1.25rem"></i></ng-template>`,
    ),
};

/** PrimeNG "ReadOnly". */
export const ReadOnly: Story = { render: () => one('[readonly]="true"', 3) };

/** PrimeNG "Disabled". */
export const Disabled: Story = { render: () => one('[disabled]="true"', 3) };

/** PrimeNG "Forms": a required rating. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { control: new FormControl<number | null>(null, Validators.required) },
    template: `<div style="display:grid;gap:var(--space-2);justify-items:start">
      <baps-rating [formControl]="control" />
      <code>value: {{ control.value ?? 'null' }} · valid: {{ control.valid }} · touched: {{ control.touched }}</code>
    </div>`,
  }),
};
