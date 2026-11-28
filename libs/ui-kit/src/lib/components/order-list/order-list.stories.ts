import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule } from 'primeng/api';
import { BapsOrderList } from './order-list.component';

const meta: Meta = {
  title: 'Components/Molecules/OrderList',
  id: 'components-orderlist',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsOrderList, SharedModule] })],
};
export default meta;
type Story = StoryObj;

const STEPS = () => [
  { id: 1, name: 'Welcome', duration: '5 min' },
  { id: 2, name: 'Family details', duration: '10 min' },
  { id: 3, name: 'Satsang activity', duration: '8 min' },
  { id: 4, name: 'Seva interests', duration: '6 min' },
  { id: 5, name: 'Follow-up', duration: '4 min' },
  { id: 6, name: 'Notes', duration: '3 min' },
];
const item = `<ng-template pTemplate="header"><span style="font-weight:600">Visit steps</span></ng-template>
<ng-template pTemplate="item" let-step>
  <div style="display:flex;justify-content:space-between;gap:var(--space-3);width:100%">
    <span>{{ step.name }}</span><span style="color:var(--p-text-muted-color)">{{ step.duration }}</span>
  </div>
</ng-template>`;
const order = `<code style="display:block;margin-top:var(--space-3)">{{ order(steps) }}</code>`;
const props = () => ({ steps: STEPS(), order: (s: { name: string }[]) => s.map((x) => x.name).join(' → ') });

/** PrimeNG "Basic": select a row, then move it with the side buttons. */
export const Basic: Story = {
  render: () => ({
    props: props(),
    template: `<baps-orderlist [value]="steps" dataKey="id" ariaLabel="Visit steps">${item}</baps-orderlist>${order}`,
  }),
};

/** PrimeNG "Drag Drop": reorder by dragging too. */
export const DragDrop: Story = {
  render: () => ({
    props: props(),
    template: `<baps-orderlist [value]="steps" dataKey="id" [dragdrop]="true" ariaLabel="Visit steps">${item}</baps-orderlist>${order}`,
  }),
};

/** PrimeNG "Filter": a search box over the list. */
export const Filter: Story = {
  render: () => ({
    props: props(),
    template: `<baps-orderlist [value]="steps" dataKey="id" filterBy="name" filterPlaceholder="Search steps" ariaLabel="Visit steps">${item}</baps-orderlist>`,
  }),
};

/** Controls on the right. */
export const ControlsRight: Story = {
  render: () => ({
    props: props(),
    template: `<baps-orderlist [value]="steps" dataKey="id" controlsPosition="right" ariaLabel="Visit steps">${item}</baps-orderlist>`,
  }),
};
