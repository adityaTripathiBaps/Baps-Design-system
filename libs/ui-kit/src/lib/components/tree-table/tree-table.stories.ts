import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule } from 'primeng/api';
import { BapsTreeTable } from './tree-table.component';
import { BapsTag } from '../tag/tag.component';

const NODES = [
  {
    key: 'na',
    data: { name: 'North America', provider: 'Stripe', currency: 'USD', by: 'A. Patel', status: 'Active' },
    expanded: true,
    children: [
      { key: 'na-rb', data: { name: 'Robbinsvile', provider: 'Stripe', currency: 'USD', by: 'A. Patel', status: 'Active' } },
      { key: 'na-ed', data: { name: 'Edison', provider: 'Square', currency: 'USD', by: 'M. Shah', status: 'Pending' } },
    ],
  },
  {
    key: 'ca',
    data: { name: 'Canada', provider: 'Stripe', currency: 'CAD', by: 'R. Desai', status: 'Active' },
    children: [
      { key: 'ca-to', data: { name: 'Toronto', provider: 'Stripe', currency: 'CAD', by: 'R. Desai', status: 'Active' } },
    ],
  },
];

/**
 * TreeTable — a table whose rows nest, for data that is a hierarchy rather
 * than a list.
 *
 * It is a SIBLING of baps-table, not a variant: the two take different data
 * (`TreeNode[]` against a flat array) and PrimeNG ships them separately, so
 * one wrapper cannot serve both without pretending the shapes match.
 *
 * Templates are declared in the CONSUMER's component, so they are collected
 * with ContentChildren and re-emitted rather than projected — the same
 * mechanism baps-table uses, and the reason `SharedModule` has to be imported
 * alongside.
 *
 * Note what is NOT here: `p-treeTableToggler` and `ttRow`. Both inject
 * `TreeTable`, and a forwarded template resolves DI at its declaration site —
 * this story — not under `p-treeTable`, so they throw NG0201 and the body
 * renders empty while the header looks fine. Expansion goes through the
 * wrapper's own `toggle(rowNode, $event)` off a template reference instead,
 * which is the same answer baps-table gives for `pSortableColumn`.
 *
 * Three details worth noticing, all deliberate and all confirmed against the
 * shipping screens rather than assumed:
 *
 * - NO zebra striping. PrimeNG offers it; it is not used.
 * - Rows are a fixed 60px with a BOTTOM border only — vertical rules would
 *   fight the hierarchy lines.
 * - An expanded parent changes font weight, not background. The background is
 *   reserved for hover, and using it for both would make a hovered collapsed
 *   row indistinguishable from an expanded one.
 */
const meta: Meta<BapsTreeTable> = {
  title: 'Components/Organisms/Tree Table',
  // Pinned so the categorised title above does not move the docs URL.
  id: 'components-treetable',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsTreeTable,
  decorators: [
    moduleMetadata({ imports: [BapsTreeTable, BapsTag, SharedModule] }),
  ],
  argTypes: {
    lazyLoad: { control: false },
    nodeCollapse: { control: false },
    nodeExpand: { control: false },
    selectionChange: { control: false },
    sortEvent: { control: false },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
  },
  args: {
    styleClass: '',
    dataKey: 'key',
    first: 0,
    lazy: false,
    loading: false,
    paginator: false,
    rows: 10,
    scrollable: false,
    sortOrder: 1,
    totalRecords: 0,
  },
};

export default meta;
type Story = StoryObj<BapsTreeTable>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, nodes: NODES },
    template: `
      <baps-tree-table #tt [value]="nodes" [dataKey]="dataKey" [brand]="brand">
        <ng-template pTemplate="header">
          <tr>
            <th style="width:26rem">Location</th>
            <th>Provider</th>
            <th>Currency</th>
            <th>Updated by</th>
            <th>Status</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-rowNode let-rowData="rowData">
          <tr [attr.aria-expanded]="tt.isLeaf(rowNode) ? null : tt.isExpanded(rowNode)">
            <td>
              <span style="display:inline-flex; align-items:center; gap:0.25rem"
                    [style.padding-left.rem]="rowNode.level * 1.25">
                @if (tt.isLeaf(rowNode)) {
                  <span style="width:1.75rem" aria-hidden="true"></span>
                } @else {
                  <button
                    type="button"
                    class="p-treetable-node-toggle-button"
                    [attr.aria-expanded]="tt.isExpanded(rowNode)"
                    [attr.aria-label]="(tt.isExpanded(rowNode) ? 'Collapse ' : 'Expand ') + rowData.name"
                    style="border:0; background:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:center"
                    (click)="tt.toggle(rowNode, $event)"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"
                         [style.transform]="tt.isExpanded(rowNode) ? 'rotate(90deg)' : 'none'"
                         style="transition:transform 120ms ease">
                      <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                }
                {{ rowData.name }}
              </span>
            </td>
            <td>{{ rowData.provider }}</td>
            <td>{{ rowData.currency }}</td>
            <td>{{ rowData.by }}</td>
            <td>
              <baps-tag
                [value]="rowData.status"
                [severity]="rowData.status === 'Active' ? 'success' : 'warn'"
                [brand]="brand"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" style="text-align:center; padding:2rem">No locations configured.</td></tr>
        </ng-template>
      </baps-tree-table>
    `,
  }),
};

/** The empty state, which a hierarchy hits more often than a flat list does. */
export const Empty: Story = {
  render: (args) => ({
    props: { ...args, nodes: [] },
    template: `
      <baps-tree-table [value]="nodes" [dataKey]="dataKey" [brand]="brand">
        <ng-template pTemplate="header">
          <tr>
            <th style="width:26rem">Location</th>
            <th>Provider</th>
            <th>Currency</th>
            <th>Updated by</th>
            <th>Status</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" style="text-align:center; padding:2rem">No locations configured.</td></tr>
        </ng-template>
      </baps-tree-table>
    `,
  }),
};

/**
 * `loading` covers the table while a server round-trip is in flight. Pair it
 * with `lazy` when the rows come from the server, so expansion asks for
 * children instead of assuming they are already loaded.
 */
export const Loading: Story = {
  ...Default,
  args: { loading: true },
};
