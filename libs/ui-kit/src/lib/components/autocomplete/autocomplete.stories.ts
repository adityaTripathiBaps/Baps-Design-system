import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { BapsAutocomplete } from './autocomplete.component';

const CITIES = [
  'Robbinsville', 'Edison', 'Parsippany', 'Cherry Hill', 'Atlanta', 'Chicago', 'Houston',
  'Dallas', 'Los Angeles', 'Toronto', 'London', 'Leicester', 'Nairobi', 'Ahmedabad', 'Sarangpur',
].map((name, i) => ({ name, code: `C${i}` }));

const GROUPS = [
  { label: 'United States', items: CITIES.slice(0, 9).map((c) => ({ label: c.name, value: c.code })) },
  { label: 'Canada', items: CITIES.slice(9, 10).map((c) => ({ label: c.name, value: c.code })) },
  { label: 'United Kingdom', items: CITIES.slice(10, 12).map((c) => ({ label: c.name, value: c.code })) },
  { label: 'India', items: CITIES.slice(13).map((c) => ({ label: c.name, value: c.code })) },
];

/** The consumer filters; these helpers stand in for an API call. */
const filterObjects = (q: string) => CITIES.filter((c) => c.name.toLowerCase().includes((q ?? '').toLowerCase()));
const filterStrings = (q: string) => filterObjects(q).map((c) => c.name);
const filterGroups = (q: string) =>
  GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes((q ?? '').toLowerCase())) })).filter((g) => g.items.length);

const meta: Meta<BapsAutocomplete> = {
  title: 'Components/Molecules/AutoComplete',
  id: 'components-autocomplete',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsAutocomplete,
  decorators: [moduleMetadata({ imports: [BapsAutocomplete, FormsModule, ReactiveFormsModule, SharedModule] })],
};
export default meta;
type Story = StoryObj<BapsAutocomplete>;

const field = (label: string, attrs: string, model = 'value', filter = 'filterObjects') => `
      <label style="display:grid;gap:var(--space-1);max-width:20rem">
        <span>${label}</span>
        <baps-autocomplete ${attrs} [suggestions]="items" (completeMethod)="items = ${filter}($event.query)" [(ngModel)]="${model}" />
      </label>`;
const props = (extra: Record<string, unknown> = {}) => ({ items: [], value: null, filterObjects, filterStrings, filterGroups, ...extra });

/** PrimeNG "Basic": strings in, strings out. */
export const Basic: Story = {
  render: () => ({ props: props(), template: field('City', 'ariaLabel="City" placeholder="Type a city"', 'value', 'filterStrings') }),
};

/** PrimeNG "Objects": suggestions are objects; optionLabel names the field shown. */
export const Objects: Story = {
  render: () => ({ props: props(), template: field('City', 'ariaLabel="City" optionLabel="name" placeholder="Search a city"') }),
};

/** PrimeNG "Dropdown": a button opens every suggestion. */
export const Dropdown: Story = {
  render: () => ({ props: props(), template: field('City', 'ariaLabel="City" optionLabel="name" [dropdown]="true"') }),
};

/** PrimeNG "Force Selection": typed text that is not a suggestion is cleared on blur. */
export const ForceSelection: Story = {
  render: () => ({ props: props(), template: field('City', 'ariaLabel="City" optionLabel="name" [forceSelection]="true"') }),
};

/** PrimeNG "Group": suggestions under group headers. */
export const Group: Story = {
  render: () => ({ props: props(), template: field('City', 'ariaLabel="City" [group]="true" optionLabel="label" optionGroupLabel="label" optionGroupChildren="items" scrollHeight="250px"', 'value', 'filterGroups') }),
};

/** PrimeNG "Template": custom option, header and footer in the panel. */
export const Template: Story = {
  render: () => ({
    props: props(),
    template: `
      <label style="display:grid;gap:var(--space-1);max-width:20rem">
        <span>City</span>
        <baps-autocomplete ariaLabel="City" optionLabel="name" [suggestions]="items" (completeMethod)="items = filterObjects($event.query)" [(ngModel)]="value">
          <ng-template pTemplate="header"><div style="padding:var(--space-2) var(--space-3);font-weight:600">Available cities</div></ng-template>
          <ng-template pTemplate="item" let-city><span style="display:flex;justify-content:space-between;width:100%">{{ city.name }}<small>{{ city.code }}</small></span></ng-template>
          <ng-template pTemplate="footer"><div style="padding:var(--space-2) var(--space-3)">Type to narrow the list</div></ng-template>
        </baps-autocomplete>
      </label>`,
  }),
};

/** PrimeNG "Clear Icon". */
export const ClearIcon: Story = {
  render: () => ({ props: props({ value: CITIES[0] }), template: field('City', 'ariaLabel="City" optionLabel="name" [showClear]="true"') }),
};

/** PrimeNG "Sizes": small, default, large. */
export const Sizes: Story = {
  render: () => ({
    props: props({ a: null, b: null, c: null }),
    template: `<div style="display:grid;gap:var(--space-3)">
      ${field('Small', 'ariaLabel="Small" optionLabel="name" size="small" placeholder="Small"', 'a')}
      ${field('Normal', 'ariaLabel="Normal" optionLabel="name" placeholder="Normal"', 'b')}
      ${field('Large', 'ariaLabel="Large" optionLabel="name" size="large" placeholder="Large"', 'c')}
    </div>`,
  }),
};

/** PrimeNG "Filled", "Invalid" and "Disabled". */
export const States: Story = {
  render: () => ({
    props: props({ a: null, b: null, c: null }),
    template: `<div style="display:grid;gap:var(--space-3)">
      ${field('Filled', 'ariaLabel="Filled" optionLabel="name" variant="filled"', 'a')}
      ${field('Invalid', 'ariaLabel="Invalid" optionLabel="name" [invalid]="true" placeholder="Search"', 'b')}
      ${field('Disabled', 'ariaLabel="Disabled" optionLabel="name" [disabled]="true" placeholder="Disabled"', 'c')}
    </div>`,
  }),
};

/** PrimeNG "Fluid": full width of the container. */
export const Fluid: Story = {
  render: () => ({ props: props(), template: `<baps-autocomplete ariaLabel="City" optionLabel="name" [fluid]="true" [suggestions]="items" (completeMethod)="items = filterObjects($event.query)" [(ngModel)]="value" />` }),
};

/** PrimeNG "Virtual Scroll": 10,000 suggestions rendered on demand. */
export const VirtualScroll: Story = {
  render: () => {
    const all = Array.from({ length: 10000 }, (_, i) => ({ label: `Item #${i}`, value: i }));
    return {
      props: { items: [], value: null, filter: (q: string) => all.filter((x) => x.label.includes(q ?? '')) },
      template: `<label style="display:grid;gap:var(--space-1);max-width:20rem"><span>Item</span>
        <baps-autocomplete ariaLabel="Item" optionLabel="label" [dropdown]="true" [virtualScroll]="true" [virtualScrollItemSize]="34" [suggestions]="items" (completeMethod)="items = filter($event.query)" [(ngModel)]="value" /></label>`,
    };
  },
};

/** PrimeNG "Focus Behavior": first option focused, selected on focus, no hover focus. */
export const FocusBehavior: Story = {
  render: () => ({ props: props(), template: field('City', 'ariaLabel="City" optionLabel="name" [autoOptionFocus]="true" [selectOnFocus]="true" [focusOnHover]="false"') }),
};

/** PrimeNG "Reactive Forms": required, error after touch. */
export const ReactiveForm: Story = {
  render: () => ({
    props: { ...props(), control: new FormControl(null, Validators.required) },
    template: `<label style="display:grid;gap:var(--space-1);max-width:20rem"><span>City (required)</span>
      <baps-autocomplete ariaLabel="City" optionLabel="name" [suggestions]="items" (completeMethod)="items = filterObjects($event.query)" [formControl]="control" />
      @if (control.invalid && control.touched) { <small class="p-error">City is required</small> }</label>`,
  }),
};
