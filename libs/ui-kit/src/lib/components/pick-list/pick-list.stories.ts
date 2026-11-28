import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PickList } from 'primeng/picklist';
import { BapsPickList } from './pick-list.directive';

const meta: Meta = {
  title: 'Components/Molecules/PickList',
  id: 'components-picklist',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [PickList, BapsPickList] })],
};
export default meta;
type Story = StoryObj;

const KARYAKARS = () => [
  { id: 1, name: 'Hari Patel', center: 'Robbinsville' },
  { id: 2, name: 'Mira Shah', center: 'Edison' },
  { id: 3, name: 'Dev Joshi', center: 'Atlanta' },
  { id: 4, name: 'Asha Desai', center: 'Chicago' },
  { id: 5, name: 'Nilesh Rao', center: 'Houston' },
  { id: 6, name: 'Kavya Mehta', center: 'Toronto' },
];
const item = `<ng-template #item let-k>
  <div style="display:flex;justify-content:space-between;gap:var(--space-3);width:100%">
    <span>{{ k.name }}</span><span style="color:var(--p-text-muted-color)">{{ k.center }}</span>
  </div>
</ng-template>`;
const props = () => ({ source: KARYAKARS(), target: [] as unknown[], names: (l: { name: string }[]) => l.map((x) => x.name).join(', ') || 'none' });
const out = `<code style="display:block;margin-top:var(--space-3)">assigned: {{ names(target) }}</code>`;

/** PrimeNG "Basic": move people across with the middle buttons, or drag them. */
export const Basic: Story = {
  render: () => ({
    props: props(),
    template: `<p-picklist bapsPickList [(source)]="source" [(target)]="target" dataKey="id" [dragdrop]="true"
      sourceHeader="Available" targetHeader="Assigned" [responsive]="true" breakpoint="900px">${item}</p-picklist>${out}`,
  }),
};

/** PrimeNG "Filter": search each list by name. */
export const Filter: Story = {
  render: () => ({
    props: props(),
    template: `<p-picklist bapsPickList [(source)]="source" [(target)]="target" dataKey="id" filterBy="name"
      sourceFilterPlaceholder="Search available" targetFilterPlaceholder="Search assigned"
      sourceHeader="Available" targetHeader="Assigned" [showSourceControls]="false" [showTargetControls]="false">${item}</p-picklist>`,
  }),
};
