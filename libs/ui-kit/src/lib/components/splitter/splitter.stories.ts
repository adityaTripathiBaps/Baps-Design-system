import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule } from 'primeng/api';
import { BapsSplitter } from './splitter.component';

const meta: Meta = {
  title: 'Components/Molecules/Splitter',
  id: 'components-splitter',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsSplitter, SharedModule] })],
};
export default meta;
type Story = StoryObj;

const cell = (t: string) => `<div style="display:flex;height:100%;align-items:center;justify-content:center;padding:var(--space-4)">${t}</div>`;
const panel = (t: string) => `<ng-template pTemplate="panel">${cell(t)}</ng-template>`;

/** PrimeNG "Horizontal": drag the gutter. */
export const Horizontal: Story = {
  render: () => ({ template: `<baps-splitter style="height:12rem">${panel('Families')}${panel('Visit notes')}</baps-splitter>` }),
};

/** PrimeNG "Size": initial sizes and minimums in percent. */
export const Size: Story = {
  render: () => ({
    template: `<baps-splitter style="height:12rem" [panelSizes]="[25, 75]" [minSizes]="[15, 40]">${panel('Filters')}${panel('Results')}</baps-splitter>`,
  }),
};

/** PrimeNG "Vertical". */
export const Vertical: Story = {
  render: () => ({ template: `<baps-splitter style="height:18rem" layout="vertical">${panel('Map')}${panel('Centres')}</baps-splitter>` }),
};

/** PrimeNG "Nested": a splitter inside a panel. */
export const Nested: Story = {
  render: () => ({
    template: `<baps-splitter style="height:18rem" [panelSizes]="[20, 80]">
      ${panel('Regions')}
      <ng-template pTemplate="panel">
        <baps-splitter layout="vertical" style="height:100%" [panelSizes]="[40, 60]">
          ${panel('Summary')}${panel('Families')}
        </baps-splitter>
      </ng-template>
    </baps-splitter>`,
  }),
};
