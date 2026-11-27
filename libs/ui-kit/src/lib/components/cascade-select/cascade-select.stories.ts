import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { BapsCascadeSelect } from './cascade-select.component';

const COUNTRIES = [
  {
    name: 'United States', code: 'US',
    states: [
      { name: 'New Jersey', cities: [{ cname: 'Robbinsville', code: 'RB' }, { cname: 'Edison', code: 'ED' }, { cname: 'Parsippany', code: 'PA' }] },
      { name: 'Georgia', cities: [{ cname: 'Atlanta', code: 'AT' }, { cname: 'Lilburn', code: 'LI' }] },
      { name: 'Illinois', cities: [{ cname: 'Chicago', code: 'CH' }, { cname: 'Bartlett', code: 'BA' }] },
    ],
  },
  {
    name: 'Canada', code: 'CA',
    states: [{ name: 'Ontario', cities: [{ cname: 'Toronto', code: 'TO' }, { cname: 'Markham', code: 'MA' }] }],
  },
  {
    name: 'India', code: 'IN',
    states: [
      { name: 'Gujarat', cities: [{ cname: 'Ahmedabad', code: 'AM' }, { cname: 'Sarangpur', code: 'SA' }, { cname: 'Gondal', code: 'GO' }] },
      { name: 'Delhi', cities: [{ cname: 'New Delhi', code: 'ND' }] },
    ],
  },
];

const meta: Meta<BapsCascadeSelect> = {
  title: 'Components/Molecules/CascadeSelect',
  id: 'components-cascadeselect',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsCascadeSelect,
  decorators: [moduleMetadata({ imports: [BapsCascadeSelect, FormsModule, ReactiveFormsModule, SharedModule] })],
};
export default meta;
type Story = StoryObj<BapsCascadeSelect>;

const attrs = `[options]="countries" optionLabel="cname" optionGroupLabel="name" [optionGroupChildren]="['states', 'cities']"`;
const field = (label: string, extra: string, model = 'value') => `
      <label style="display:grid;gap:var(--space-1);max-width:18rem">
        <span>${label}</span>
        <baps-cascade-select ariaLabel="${label}" ${attrs} ${extra} [(ngModel)]="${model}" />
      </label>`;

/** PrimeNG "Basic": country, then state, then city. */
export const Basic: Story = {
  render: () => ({ props: { countries: COUNTRIES, value: null }, template: field('City', 'placeholder="Select a city"') }),
};

/** PrimeNG "Template": a custom option row per level. */
export const Template: Story = {
  render: () => ({
    props: { countries: COUNTRIES, value: null },
    template: `
      <label style="display:grid;gap:var(--space-1);max-width:18rem"><span>City</span>
        <baps-cascade-select ariaLabel="City" ${attrs} placeholder="Select a city" [(ngModel)]="value">
          <ng-template pTemplate="option" let-option>
            <span style="display:flex;gap:var(--space-2);align-items:center">
              <i class="pi" [class.pi-globe]="option.states" [class.pi-map]="option.cities" [class.pi-map-marker]="option.cname"></i>
              {{ option.cname || option.name }}
            </span>
          </ng-template>
        </baps-cascade-select>
      </label>`,
  }),
};

/** PrimeNG "Loading" and "Clear Icon". */
export const LoadingAndClear: Story = {
  render: () => ({
    props: { countries: COUNTRIES, a: null, b: { cname: 'Edison', code: 'ED' } },
    template: `<div style="display:grid;gap:var(--space-3)">
      ${field('Loading', '[loading]="true" placeholder="Loading…"', 'a')}
      ${field('Clear icon', '[showClear]="true"', 'b')}
    </div>`,
  }),
};

/** PrimeNG "Sizes". */
export const Sizes: Story = {
  render: () => ({
    props: { countries: COUNTRIES, a: null, b: null, c: null },
    template: `<div style="display:grid;gap:var(--space-3)">
      ${field('Small', 'size="small" placeholder="Small"', 'a')}
      ${field('Normal', 'placeholder="Normal"', 'b')}
      ${field('Large', 'size="large" placeholder="Large"', 'c')}
    </div>`,
  }),
};

/** PrimeNG "Filled", "Invalid" and "Disabled". */
export const States: Story = {
  render: () => ({
    props: { countries: COUNTRIES, a: null, b: null, c: null },
    template: `<div style="display:grid;gap:var(--space-3)">
      ${field('Filled', 'variant="filled" placeholder="Select a city"', 'a')}
      ${field('Invalid', '[invalid]="true" placeholder="Select a city"', 'b')}
      ${field('Disabled', '[disabled]="true" placeholder="Disabled"', 'c')}
    </div>`,
  }),
};

/** PrimeNG "Fluid". */
export const Fluid: Story = {
  render: () => ({
    props: { countries: COUNTRIES, value: null },
    template: `<baps-cascade-select ariaLabel="City" ${attrs} [fluid]="true" placeholder="Select a city" [(ngModel)]="value" />`,
  }),
};

/** PrimeNG "Reactive Forms": required, error after touch. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { countries: COUNTRIES, control: new FormControl(null, Validators.required) },
    template: `<label style="display:grid;gap:var(--space-1);max-width:18rem"><span>City (required)</span>
      <baps-cascade-select ariaLabel="City" ${attrs} placeholder="Select a city" [formControl]="control" />
      @if (control.invalid && control.touched) { <small class="p-error">City is required</small> }</label>`,
  }),
};
