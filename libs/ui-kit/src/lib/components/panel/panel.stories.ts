import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule } from 'primeng/api';
import { BapsPanel } from './panel.component';
import { BapsAvatar } from '../avatar/avatar.component';
import { BapsButton } from '../button/button.component';

const meta: Meta = {
  title: 'Components/Molecules/Panel',
  id: 'components-panel',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsPanel, BapsAvatar, BapsButton, SharedModule] })],
};
export default meta;
type Story = StoryObj;

const TEXT = `<p style="margin:0">The Robbinsville centre holds weekly sabha on Sundays. 412 families are registered; 38 joined this year.</p>`;

/** PrimeNG "Basic". */
export const Basic: Story = {
  render: () => ({ template: `<baps-panel header="Robbinsville">${TEXT}</baps-panel>` }),
};

/** PrimeNG "Toggleable": the icon folds the body. */
export const Toggleable: Story = {
  render: () => ({
    props: { collapsed: false },
    template: `<baps-panel header="Robbinsville" [toggleable]="true" [(collapsed)]="collapsed">${TEXT}</baps-panel>
      <code style="display:block;margin-top:var(--space-3)">collapsed: {{ collapsed }}</code>`,
  }),
};

/** PrimeNG "Template": custom header, header actions and footer. */
export const Template: Story = {
  render: () => ({
    template: `<baps-panel [toggleable]="true">
      <ng-template pTemplate="header">
        <span style="display:inline-flex;align-items:center;gap:var(--space-2)">
          <baps-avatar label="R" shape="circle" />
          <span style="font-weight:600">Robbinsville</span>
        </span>
      </ng-template>
      <ng-template pTemplate="icons">
        <baps-button icon="pi pi-cog" severity="secondary" [text]="true" [rounded]="true" ariaLabel="Settings" />
      </ng-template>
      <ng-template pTemplate="footer">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="color:var(--p-text-muted-color);font-size:0.875rem">Updated 2 hours ago</span>
          <baps-button label="Open centre" size="small" />
        </div>
      </ng-template>
      ${TEXT}
    </baps-panel>`,
  }),
};
