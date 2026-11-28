import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Fieldset } from 'primeng/fieldset';
import { BapsFieldset } from './fieldset.directive';
import { BapsAvatar } from '../avatar/avatar.component';

const meta: Meta = {
  title: 'Components/Molecules/Fieldset',
  id: 'components-fieldset',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [Fieldset, BapsFieldset, BapsAvatar] })],
};
export default meta;
type Story = StoryObj;

const TEXT = `<p style="margin:0">The Patel family joined the Robbinsville centre in 2019. Three members attend weekly sabha; the children take part in Bal and Kishore activities.</p>`;

/** PrimeNG "Basic". */
export const Basic: Story = {
  render: () => ({ template: `<p-fieldset bapsFieldset legend="Family">${TEXT}</p-fieldset>` }),
};

/** PrimeNG "Toggleable": the legend folds the content. */
export const Toggleable: Story = {
  render: () => ({
    props: { collapsed: false },
    template: `<p-fieldset bapsFieldset legend="Family" [toggleable]="true" [(collapsed)]="collapsed">${TEXT}</p-fieldset>
      <code style="display:block;margin-top:var(--space-3)">collapsed: {{ collapsed }}</code>`,
  }),
};

/** PrimeNG "Template": a custom legend. */
export const Template: Story = {
  render: () => ({
    template: `<p-fieldset bapsFieldset>
      <ng-template #header>
        <span style="display:inline-flex;align-items:center;gap:var(--space-2);padding-inline:var(--space-2)">
          <baps-avatar label="P" shape="circle" />
          <span style="font-weight:600">Patel family</span>
        </span>
      </ng-template>
      ${TEXT}
    </p-fieldset>`,
  }),
};
