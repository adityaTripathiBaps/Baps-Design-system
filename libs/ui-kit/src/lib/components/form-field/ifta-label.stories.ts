import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsIftaLabel } from './ifta-label.component';
import { BapsInputText } from './directives/input-text.directive';
import { BapsSelect } from '../select/select.component';

const meta: Meta<BapsIftaLabel> = {
  title: 'Components/Molecules/IftaLabel',
  id: 'components-iftalabel',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsIftaLabel,
  decorators: [moduleMetadata({ imports: [BapsIftaLabel, BapsInputText, BapsSelect, FormsModule] })],
};
export default meta;
type Story = StoryObj<BapsIftaLabel>;

/** PrimeNG "Basic": the label sits inside the field, above the value. */
export const Basic: Story = {
  render: () => ({
    props: { value: '' },
    template: `
      <baps-iftalabel style="display:block;max-width:18rem">
        <input bapsInputText id="ifta-username" [(ngModel)]="value" autocomplete="off" />
        <label for="ifta-username">Username</label>
      </baps-iftalabel>`,
  }),
};

/** PrimeNG "Invalid": an invalid field colours its label too. */
export const Invalid: Story = {
  render: () => ({
    props: { value: '' },
    template: `
      <baps-iftalabel style="display:block;max-width:18rem">
        <input bapsInputText id="ifta-invalid" [(ngModel)]="value" [invalid]="!value" autocomplete="off" />
        <label for="ifta-invalid">Username</label>
      </baps-iftalabel>`,
  }),
};

/** Any kit field works inside: here a select. */
export const WithSelect: Story = {
  render: () => ({
    props: { value: null, cities: ['Robbinsville', 'Edison', 'Atlanta'] },
    template: `
      <baps-iftalabel style="display:block;max-width:18rem">
        <baps-select inputId="ifta-city" [options]="cities" [(ngModel)]="value" />
        <label for="ifta-city">City</label>
      </baps-iftalabel>`,
  }),
};
