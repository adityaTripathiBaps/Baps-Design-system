import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BapsToggleButton } from './toggle-button.component';

const meta: Meta<BapsToggleButton> = {
  title: 'Components/Molecules/ToggleButton',
  id: 'components-togglebutton',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsToggleButton,
  decorators: [moduleMetadata({ imports: [BapsToggleButton, FormsModule, ReactiveFormsModule] })],
};
export default meta;
type Story = StoryObj<BapsToggleButton>;

const row = 'display:flex;gap:var(--space-3);align-items:center;flex-wrap:wrap';

/** PrimeNG "Basic". */
export const Basic: Story = {
  render: () => ({
    props: { checked: false },
    template: `<div style="${row}"><baps-toggle-button [(ngModel)]="checked" onLabel="On" offLabel="Off" /><code>{{ checked }}</code></div>`,
  }),
};

/** PrimeNG "Customized": a label and an icon per state. */
export const Customized: Story = {
  render: () => ({
    props: { checked: false },
    template: `<baps-toggle-button [(ngModel)]="checked" onLabel="Locked" offLabel="Unlocked" onIcon="pi pi-lock" offIcon="pi pi-lock-open" ariaLabel="Lock" />`,
  }),
};

/** PrimeNG "Sizes". */
export const Sizes: Story = {
  render: () => ({
    props: { a: false, b: false, c: false },
    template: `<div style="${row}">
      <baps-toggle-button [(ngModel)]="a" onLabel="On" offLabel="Off" size="small" />
      <baps-toggle-button [(ngModel)]="b" onLabel="On" offLabel="Off" />
      <baps-toggle-button [(ngModel)]="c" onLabel="On" offLabel="Off" size="large" />
    </div>`,
  }),
};

/** PrimeNG "Invalid". */
export const Invalid: Story = {
  render: () => ({
    props: { checked: false },
    template: `<baps-toggle-button [(ngModel)]="checked" onLabel="On" offLabel="Off" [invalid]="!checked" />`,
  }),
};

/** PrimeNG "Disabled". */
export const Disabled: Story = {
  render: () => ({
    props: { checked: false },
    template: `<baps-toggle-button [(ngModel)]="checked" onLabel="On" offLabel="Off" [disabled]="true" />`,
  }),
};

/** PrimeNG "Forms": must be switched on. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { control: new FormControl<boolean>(false, Validators.requiredTrue) },
    template: `<div style="display:grid;gap:var(--space-2);justify-items:start">
      <baps-toggle-button [formControl]="control" onLabel="Accepted" offLabel="Accept terms" onIcon="pi pi-check" offIcon="pi pi-times" />
      <code>value: {{ control.value }} · valid: {{ control.valid }} · touched: {{ control.touched }}</code>
    </div>`,
  }),
};
