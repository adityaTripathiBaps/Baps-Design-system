import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { BapsPassword } from './password.component';
import { BapsFloatLabel } from '../form-field/float-label.component';
import { BapsIftaLabel } from '../form-field/ifta-label.component';
import { BapsDivider } from '../divider/divider.component';

const meta: Meta<BapsPassword> = {
  title: 'Components/Molecules/Password',
  id: 'components-password',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsPassword,
  decorators: [
    moduleMetadata({ imports: [BapsPassword, BapsFloatLabel, BapsIftaLabel, BapsDivider, FormsModule, ReactiveFormsModule, SharedModule] }),
  ],
};
export default meta;
type Story = StoryObj<BapsPassword>;

const field = (label: string, id: string, attrs: string, model = 'value', body = '') => `
  <div style="display:grid;gap:var(--space-1);max-width:18rem">
    <label for="${id}">${label}</label>
    <baps-password inputId="${id}" ${attrs} [(ngModel)]="${model}">${body}</baps-password>
  </div>`;
const stack = (body: string) => `<div style="display:grid;gap:var(--space-4)">${body}</div>`;

/** PrimeNG "Basic": no strength meter. */
export const Basic: Story = {
  render: () => ({ props: { value: '' }, template: field('Password', 'pw-basic', '[feedback]="false"') }),
};

/** PrimeNG "Meter": the strength meter opens while typing. */
export const Meter: Story = {
  render: () => ({ props: { value: '' }, template: field('Password', 'pw-meter', '') }),
};

/** PrimeNG "Locale": the meter's labels. */
export const Locale: Story = {
  render: () => ({
    props: { value: '' },
    template: field('Password', 'pw-locale', 'promptLabel="Choose a password" weakLabel="Too simple" mediumLabel="Average complexity" strongLabel="Complex password"'),
  }),
};

/** PrimeNG "Toggle Mask": an eye icon shows or hides the password. */
export const ToggleMask: Story = {
  render: () => ({ props: { value: '' }, template: field('Password', 'pw-toggle', '[toggleMask]="true"') }),
};

/** PrimeNG "Template": a header and the password rules under the meter. */
export const Template: Story = {
  render: () => ({
    props: { value: '' },
    template: field(
      'Password',
      'pw-template',
      '',
      'value',
      `
      <ng-template pTemplate="header"><strong style="display:block;margin-block-end:var(--space-2)">Pick a password</strong></ng-template>
      <ng-template pTemplate="footer">
        <baps-divider />
        <ul style="margin:0;padding-inline-start:var(--space-4);line-height:1.5">
          <li>At least one lowercase</li>
          <li>At least one uppercase</li>
          <li>At least one number</li>
          <li>Minimum 8 characters</li>
        </ul>
      </ng-template>`,
    ),
  }),
};

/** PrimeNG "Filled". */
export const Filled: Story = {
  render: () => ({ props: { value: '' }, template: field('Password', 'pw-filled', 'variant="filled" [feedback]="false"') }),
};

/** PrimeNG "Float Label". */
export const FloatLabel: Story = {
  render: () => ({
    props: { value: '' },
    template: `<baps-floatlabel style="display:block;max-width:18rem">
      <baps-password inputId="pw-float" [feedback]="false" [(ngModel)]="value" />
      <label for="pw-float">Password</label>
    </baps-floatlabel>`,
  }),
};

/** PrimeNG "Ifta Label". */
export const IftaLabel: Story = {
  render: () => ({
    props: { value: '' },
    template: `<baps-iftalabel style="display:block;max-width:18rem">
      <baps-password inputId="pw-ifta" [feedback]="false" [(ngModel)]="value" />
      <label for="pw-ifta">Password</label>
    </baps-iftalabel>`,
  }),
};

/** PrimeNG "Clear Icon". */
export const ClearIcon: Story = {
  render: () => ({ props: { value: 'secret' }, template: field('Password', 'pw-clear', '[feedback]="false" [showClear]="true"') }),
};

/** PrimeNG "Sizes". */
export const Sizes: Story = {
  render: () => ({
    props: { a: '', b: '', c: '' },
    template: stack(
      field('Small', 'pw-sm', 'size="small" placeholder="Small" [feedback]="false"', 'a') +
        field('Normal', 'pw-md', 'placeholder="Normal" [feedback]="false"', 'b') +
        field('Large', 'pw-lg', 'size="large" placeholder="Large" [feedback]="false"', 'c'),
    ),
  }),
};

/** PrimeNG "Invalid". */
export const Invalid: Story = {
  render: () => ({ props: { value: '' }, template: field('Password', 'pw-invalid', '[invalid]="!value" [feedback]="false"') }),
};

/** PrimeNG "Disabled". */
export const Disabled: Story = {
  render: () => ({ props: { value: '' }, template: field('Password', 'pw-disabled', 'placeholder="Disabled" [disabled]="true"') }),
};

/** PrimeNG "Forms": a required password in a reactive form. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null, Validators.required) },
    template: `<div style="display:grid;gap:var(--space-2);max-width:18rem">
      <label for="pw-form">Password</label>
      <baps-password inputId="pw-form" [feedback]="false" [toggleMask]="true" [formControl]="control" />
      <code>valid: {{ control.valid }} · touched: {{ control.touched }} · length: {{ control.value?.length ?? 0 }}</code>
    </div>`,
  }),
};
