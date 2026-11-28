import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule, TreeNode } from 'primeng/api';
import { OrganizationChart } from 'primeng/organizationchart';
import { BapsOrgChart } from './org-chart.directive';
import { BapsAvatar } from '../avatar/avatar.component';

const meta: Meta = {
  title: 'Components/Molecules/OrgChart',
  id: 'components-orgchart',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [OrganizationChart, BapsOrgChart, BapsAvatar, SharedModule] })],
};
export default meta;
type Story = StoryObj;

const REGIONS = (): TreeNode[] => [
  {
    label: 'North America',
    expanded: true,
    children: [
      { label: 'Northeast', expanded: true, children: [{ label: 'Robbinsville' }, { label: 'Edison' }] },
      { label: 'Southeast', expanded: true, children: [{ label: 'Atlanta' }, { label: 'Lilburn' }] },
    ],
  },
];

const PEOPLE = (): TreeNode[] => [
  {
    expanded: true,
    type: 'person',
    data: { name: 'Hari Patel', title: 'Regional coordinator' },
    children: [
      {
        expanded: true,
        type: 'person',
        data: { name: 'Mira Shah', title: 'Northeast lead' },
        children: [
          { label: 'Robbinsville' },
          { label: 'Edison' },
        ],
      },
      {
        expanded: true,
        type: 'person',
        data: { name: 'Dev Joshi', title: 'Southeast lead' },
        children: [{ label: 'Atlanta' }],
      },
    ],
  },
];

/** PrimeNG "Basic": click a node's toggle to fold its branch. */
export const Basic: Story = {
  render: () => ({
    props: { tree: REGIONS() },
    template: `<p-organizationchart bapsOrgChart [value]="tree" [collapsible]="true" />`,
  }),
};

/** PrimeNG "Template": a person card for `type: 'person'`, plain label otherwise. */
export const Template: Story = {
  render: () => ({
    props: { tree: PEOPLE() },
    template: `<p-organizationchart bapsOrgChart [value]="tree" [collapsible]="true">
      <ng-template let-node pTemplate="person">
        <div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-2)">
          <baps-avatar [label]="node.data.name.charAt(0)" shape="circle" />
          <div style="font-weight:600">{{ node.data.name }}</div>
          <div style="color:var(--p-text-muted-color);font-size:0.875rem">{{ node.data.title }}</div>
        </div>
      </ng-template>
      <ng-template let-node pTemplate="default">{{ node.label }}</ng-template>
    </p-organizationchart>`,
  }),
};

/** PrimeNG "Selection": click nodes to select several. */
export const Selection: Story = {
  render: () => ({
    props: { tree: REGIONS(), selection: [], names: (s: TreeNode[]) => s.map((n) => n.label).join(', ') || 'none' },
    template: `<p-organizationchart bapsOrgChart [value]="tree" selectionMode="multiple" [(selection)]="selection" />
      <code style="display:block;margin-top:var(--space-3)">selected: {{ names(selection) }}</code>`,
  }),
};

/** PrimeNG "Colored": per-node `styleClass` for emphasis. */
export const Colored: Story = {
  render: () => ({
    props: {
      tree: [
        {
          label: 'North America',
          expanded: true,
          styleClass: 'baps-orgchart-demo-accent',
          children: [
            { label: 'Northeast', expanded: true, children: [{ label: 'Robbinsville' }, { label: 'Edison' }] },
            { label: 'Southeast', expanded: true, children: [{ label: 'Atlanta' }] },
          ],
        },
      ],
    },
    template: `<style>.baps-orgchart-demo-accent { background: var(--p-primary-color) !important; color: var(--p-primary-contrast-color) !important; border-color: var(--p-primary-color) !important; }</style>
      <p-organizationchart bapsOrgChart [value]="tree" />`,
  }),
};
