import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BapsKeyFilter } from './directives/key-filter.directive';
import { BapsInputText } from './directives/input-text.directive';

const meta: Meta = {
  title: 'Components/Molecules/KeyFilter',
  id: 'components-keyfilter',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsKeyFilter, BapsInputText, FormsModule, ReactiveFormsModule] })],
};
export default meta;
type Story = StoryObj;

const field = (label: string, id: string, filter: string) => `
  <div style="display:grid;gap:var(--space-1)">
    <label for="${id}">${label}</label>
    <input bapsInputText id="${id}" ${filter} [(ngModel)]="v['${id}']" />
  </div>`;

/** PrimeNG "Presets". */
export const Presets: Story = {
  render: () => ({
    props: { v: {} },
    template: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4)">
      ${field('Integer', 'kf-int', 'bapsKeyFilter="int"')}
      ${field('Number', 'kf-num', 'bapsKeyFilter="num"')}
      ${field('Money', 'kf-money', 'bapsKeyFilter="money"')}
      ${field('Hex', 'kf-hex', 'bapsKeyFilter="hex"')}
      ${field('Alphabetic', 'kf-alpha', 'bapsKeyFilter="alpha"')}
      ${field('Alphanumeric', 'kf-alnum', 'bapsKeyFilter="alphanum"')}
    </div>`,
  }),
};

/** PrimeNG "Regex": any RegExp; here, no special characters. */
export const Regex: Story = {
  render: () => ({
    props: { v: {}, blockChars: /^[^<>*!]+$/, blockSpace: /^[^\s]+$/ },
    template: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:var(--space-4)">
      ${field('Block space', 'kf-space', '[bapsKeyFilter]="blockSpace"')}
      ${field('Block < > * !', 'kf-chars', '[bapsKeyFilter]="blockChars"')}
    </div>`,
  }),
};

/** `validateOnly`: typing is free; the form control turns invalid instead. */
export const ValidateOnly: Story = {
  render: () => ({
    props: { control: new FormControl('') },
    template: `<div style="display:grid;gap:var(--space-2);max-width:18rem">
      <label for="kf-validate">Integer (validate only)</label>
      <input bapsInputText id="kf-validate" bapsKeyFilter="int" [validateOnly]="true" [formControl]="control" />
      <code>value: "{{ control.value }}" · valid: {{ control.valid }}</code>
    </div>`,
  }),
};
