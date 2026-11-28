import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule, TreeNode } from 'primeng/api';

import { BapsTree } from './tree.component';
import { BapsButton } from '../button/button.component';
import { BapsTag } from '../tag/tag.component';

const meta: Meta = {
  title: 'Components/Molecules/Tree',
  id: 'components-tree',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsTree, BapsButton, BapsTag, SharedModule] })],
};
export default meta;
type Story = StoryObj;

const NODES = (): TreeNode[] => [
  {
    key: 'na', label: 'North America', icon: 'pi pi-globe',
    children: [
      { key: 'ne', label: 'Northeast', icon: 'pi pi-map', children: [{ key: 'rb', label: 'Robbinsville', icon: 'pi pi-building' }, { key: 'ed', label: 'Edison', icon: 'pi pi-building' }] },
      { key: 'se', label: 'Southeast', icon: 'pi pi-map', children: [{ key: 'at', label: 'Atlanta', icon: 'pi pi-building' }] },
    ],
  },
  {
    key: 'in', label: 'India', icon: 'pi pi-globe',
    children: [{ key: 'gj', label: 'Gujarat', icon: 'pi pi-map', children: [{ key: 'sa', label: 'Sarangpur', icon: 'pi pi-building' }] }],
  },
];
const expandAll = (nodes: TreeNode[], open: boolean): TreeNode[] =>
  nodes.map((n) => ({ ...n, expanded: open, children: n.children ? expandAll(n.children, open) : undefined }));
const labels = (s: TreeNode | TreeNode[] | null) => (Array.isArray(s) ? s.map((n) => n.label).join(', ') : s?.label) || 'none';
const out = (v: string) => `<code style="display:block;margin-top:var(--space-3)">${v}</code>`;
const box = 'style="max-width:28rem"';

/** PrimeNG "Basic". */
export const Basic: Story = {
  render: () => ({ props: { nodes: NODES() }, template: `<baps-tree [value]="nodes" ${box}></baps-tree>` }),
};

/** PrimeNG "Controlled": expand or collapse everything from outside. */
export const Controlled: Story = {
  render: () => ({
    props: { nodes: NODES(), expandAll },
    template: `<div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3)">
        <baps-button label="Expand all" icon="pi pi-plus" severity="secondary" [outlined]="true" (click)="nodes = expandAll(nodes, true)" />
        <baps-button label="Collapse all" icon="pi pi-minus" severity="secondary" [outlined]="true" (click)="nodes = expandAll(nodes, false)" />
      </div>
      <baps-tree [value]="nodes" ${box}></baps-tree>`,
  }),
};

/** PrimeNG "Selection": single and checkbox. */
export const Selection: Story = {
  render: () => ({
    props: { a: expandAll(NODES(), true), b: expandAll(NODES(), true), one: null, many: [], labels },
    template: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-6)">
      <div><baps-tree [value]="a" selectionMode="single" [(selection)]="one"></baps-tree>${out('single: {{ labels(one) }}')}</div>
      <div><baps-tree [value]="b" selectionMode="checkbox" [(selection)]="many"></baps-tree>${out('checkbox: {{ labels(many) }}')}</div>
    </div>`,
  }),
};

/** PrimeNG "Filter": search the labels; matching branches stay open. */
export const Filter: Story = {
  render: () => ({
    props: { nodes: NODES() },
    template: `<baps-tree [value]="nodes" [filter]="true" filterPlaceholder="Search centres" ${box}></baps-tree>`,
  }),
};

/** PrimeNG "Template": a template per node type. */
export const Template: Story = {
  render: () => ({
    props: {
      nodes: [
        {
          key: 'na', label: 'North America', type: 'region', expanded: true, data: { families: 1621 },
          children: [
            { key: 'rb', label: 'Robbinsville', type: 'centre', data: { status: 'Active' } },
            { key: 'ch', label: 'Chicago', type: 'centre', data: { status: 'Review' } },
          ],
        },
      ],
    },
    template: `<baps-tree [value]="nodes" ${box}>
      <ng-template let-node pTemplate="region"><strong>{{ node.label }}</strong> <span style="color:var(--p-text-muted-color)">· {{ node.data.families }} families</span></ng-template>
      <ng-template let-node pTemplate="centre">
        <span style="display:inline-flex;gap:var(--space-2);align-items:center">{{ node.label }} <baps-tag [value]="node.data.status" [severity]="node.data.status === 'Active' ? 'success' : 'warn'" /></span>
      </ng-template>
    </baps-tree>`,
  }),
};

/** PrimeNG "Drag Drop": move nodes within the tree. */
export const DragDrop: Story = {
  render: () => ({
    props: { nodes: expandAll(NODES(), true) },
    template: `<baps-tree [value]="nodes" [draggableNodes]="true" [droppableNodes]="true" draggableScope="self" droppableScope="self" ${box}></baps-tree>`,
  }),
};
