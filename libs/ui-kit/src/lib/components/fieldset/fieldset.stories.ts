import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule } from 'primeng/api';
import { BapsFieldset } from './fieldset.component';
import { BapsAvatar } from '../avatar/avatar.component';

const meta: Meta = {
  title: 'Components/Molecules/Fieldset',
  id: 'components-fieldset',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsFieldset, BapsAvatar, SharedModule] })],
};
export default meta;
type Story = StoryObj;

const TEXT = `<p style="margin:0">The Patel family joined the Robbinsville centre in 2019. Three members attend weekly sabha; the children take part in Bal and Kishore activities.</p>`;

/** PrimeNG "Basic". */
export const Basic: Story = {
  render: () => ({ template: `<baps-fieldset legend="Family">${TEXT}</baps-fieldset>` }),
};

/** PrimeNG "Toggleable": the legend folds the content. */
export const Toggleable: Story = {
  render: () => ({
    props: { collapsed: false },
    template: `<baps-fieldset legend="Family" [toggleable]="true" [(collapsed)]="collapsed">${TEXT}</baps-fieldset>
      <code style="display:block;margin-top:var(--space-3)">collapsed: {{ collapsed }}</code>`,
  }),
};

/** PrimeNG "Template": a custom legend. */
export const Template: Story = {
  render: () => ({
    template: `<baps-fieldset>
      <ng-template pTemplate="header">
        <span style="display:inline-flex;align-items:center;gap:var(--space-2);padding-inline:var(--space-2)">
          <baps-avatar label="P" shape="circle" />
          <span style="font-weight:600">Patel family</span>
        </span>
      </ng-template>
      ${TEXT}
    </baps-fieldset>`,
  }),
};
