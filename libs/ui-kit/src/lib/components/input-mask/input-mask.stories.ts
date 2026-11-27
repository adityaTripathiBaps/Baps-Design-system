import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BapsInputMask } from './input-mask.component';
import { BapsFloatLabel } from '../form-field/float-label.component';
import { BapsIftaLabel } from '../form-field/ifta-label.component';

const meta: Meta<BapsInputMask> = {
  title: 'Components/Molecules/InputMask',
  id: 'components-inputmask',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsInputMask,
  decorators: [moduleMetadata({ imports: [BapsInputMask, BapsFloatLabel, BapsIftaLabel, FormsModule, ReactiveFormsModule] })],
};
export default meta;
type Story = StoryObj<BapsInputMask>;

const field = (label: string, id: string, attrs: string, model = 'value') => `
  <div style="display:grid;gap:var(--space-1);max-width:18rem">
    <label for="${id}">${label}</label>
    <baps-input-mask inputId="${id}" ${attrs} [(ngModel)]="${model}" />
  </div>`;
const stack = (body: string) => `<div style="display:grid;gap:var(--space-4)">${body}</div>`;

/** PrimeNG "Basic". */
export const Basic: Story = {
  render: () => ({ props: { value: null }, template: field('Serial', 'im-basic', 'mask="99-999999" placeholder="99-999999"') }),
};

/** PrimeNG "Mask": `9` digit, `a` letter, `*` either; other characters are literals. */
export const Mask: Story = {
  render: () => ({
    props: { a: null, b: null, c: null },
    template: stack(
      field('SSN', 'im-ssn', 'mask="999-99-9999" placeholder="999-99-9999"', 'a') +
        field('Phone', 'im-phone', 'mask="(999) 999-9999" placeholder="(999) 999-9999"', 'b') +
        field('Serial number', 'im-serial', 'mask="a*-999-a999" placeholder="a*-999-a999"', 'c'),
    ),
  }),
};

/** PrimeNG "Optional": what follows `?` may be left empty. */
export const Optional: Story = {
  render: () => ({ props: { value: null }, template: field('Phone and extension', 'im-opt', 'mask="(999) 999-9999? x99999" placeholder="(999) 999-9999? x99999"') }),
};

/** PrimeNG "SlotChar": the character shown in each empty slot. */
export const SlotChar: Story = {
  render: () => ({ props: { value: null }, template: field('Date', 'im-slot', 'mask="99/99/9999" slotChar="mm/dd/yyyy" placeholder="mm/dd/yyyy"') }),
};

/** PrimeNG "Filled". */
export const Filled: Story = {
  render: () => ({ props: { value: null }, template: field('Serial', 'im-filled', 'mask="99-999999" placeholder="99-999999" variant="filled"') }),
};

/** PrimeNG "Float Label". */
export const FloatLabel: Story = {
  render: () => ({
    props: { value: null },
    template: `<baps-floatlabel style="display:block;max-width:18rem">
      <baps-input-mask inputId="im-float" mask="999-99-9999" [(ngModel)]="value" />
      <label for="im-float">SSN</label>
    </baps-floatlabel>`,
  }),
};

/** PrimeNG "Ifta Label". */
export const IftaLabel: Story = {
  render: () => ({
    props: { value: null },
    template: `<baps-iftalabel style="display:block;max-width:18rem">
      <baps-input-mask inputId="im-ifta" mask="999-99-9999" [(ngModel)]="value" />
      <label for="im-ifta">SSN</label>
    </baps-iftalabel>`,
  }),
};

/** PrimeNG "Sizes". */
export const Sizes: Story = {
  render: () => ({
    props: { a: null, b: null, c: null },
    template: stack(
      field('Small', 'im-sm', 'mask="99-999999" placeholder="Small" size="small"', 'a') +
        field('Normal', 'im-md', 'mask="99-999999" placeholder="Normal"', 'b') +
        field('Large', 'im-lg', 'mask="99-999999" placeholder="Large" size="large"', 'c'),
    ),
  }),
};

/** PrimeNG "Invalid". */
export const Invalid: Story = {
  render: () => ({ props: { value: null }, template: field('Serial', 'im-invalid', 'mask="99-999999" placeholder="99-999999" [invalid]="!value"') }),
};

/** PrimeNG "Disabled". */
export const Disabled: Story = {
  render: () => ({ props: { value: null }, template: field('Serial', 'im-disabled', 'mask="99-999999" placeholder="Disabled" [disabled]="true"') }),
};

/** PrimeNG "Forms": a required SSN in a reactive form; `completed` fires once every slot is filled. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { control: new FormControl<string | null>(null, Validators.required), done: false },
    template: `<div style="display:grid;gap:var(--space-2);max-width:18rem">
      <label for="im-form">SSN</label>
      <baps-input-mask inputId="im-form" mask="999-99-9999" placeholder="999-99-9999" [formControl]="control" (completed)="done = true" />
      <code>value: {{ control.value ?? 'null' }} · valid: {{ control.valid }} · complete: {{ done }}</code>
    </div>`,
  }),
};
