/**
 * Framework snippets for the Tree table docs page.
 *
 * ## Route B: markup and style intent, no Custom tab
 *
 * The Angular component wraps PrimeNG's `p-treeTable`, which builds its own
 * row DOM at runtime and resolves `rowNode.level` as it goes. There is no
 * static markup that reproduces it, so no `custom` block is written rather
 * than one that looks right and is not.
 *
 * What DOES ship is the skin: `@org/ui-kit/styles/tree-table` targets
 * `.p-treetable-thead`, `.p-treetable-tbody`, `.p-treetable-header-cell` and
 * `.p-treetable-node-toggle-button`. The React component emits exactly those,
 * which is why it looks the same without PrimeNG.
 *
 * ## The React component is not a wrapper
 *
 * `BapsTreeTable` builds its own rows from `value` and `columns`, so the API
 * is data in rather than templates in. Two consequences worth stating:
 *
 *   - expansion is controlled or uncontrolled, the same split Table uses
 *   - a node renders only when EVERY ancestor is expanded, not just its
 *     parent, which is the case a hand-rolled flattener usually gets wrong
 *
 * Sorting, selection, lazy loading and a built-in paginator are not
 * implemented. Sorting a tree first needs a decision nobody has made: whether
 * children sort within their parent or the tree flattens.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('tree-table');

export const treeTableSnippets: Record<string, SnippetSet> = {
  // Expansion is uncontrolled here: the component tracks its own open keys.
  // Pass expandedKeys and handle onToggle when something else owns that state
  // — a URL, or a server that loads children on demand.
  Default: {
    primeng: `<baps-tree-table #tt [value]="nodes" dataKey="key">
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
      <td>{{ rowData.location }}</td>
      <td>{{ rowData.provider }}</td>
      <td>{{ rowData.currency }}</td>
      <td>{{ rowData.updatedBy }}</td>
      <td>{{ rowData.status }}</td>
    </tr>
  </ng-template>
</baps-tree-table>`,
    react: `${SETUP}

const NODES = [
  {
    key: 'na',
    data: { location: 'North America', provider: 'Stripe', currency: 'USD', updatedBy: 'J. Patel', status: 'Active' },
    children: [
      { key: 'na-ne', data: { location: 'Northeast', provider: 'Stripe', currency: 'USD', updatedBy: 'J. Patel', status: 'Active' } },
      { key: 'na-mw', data: { location: 'Midwest', provider: 'Stripe', currency: 'USD', updatedBy: 'R. Shah', status: 'Active' } },
    ],
  },
  {
    key: 'ca',
    data: { location: 'Canada', provider: 'Square', currency: 'CAD', updatedBy: 'A. Desai', status: 'Active' },
    children: [
      { key: 'ca-on', data: { location: 'Ontario', provider: 'Square', currency: 'CAD', updatedBy: 'A. Desai', status: 'Active' } },
    ],
  },
];

const COLUMNS = [
  { field: 'location', header: 'Location', width: '26rem' },
  { field: 'provider', header: 'Provider' },
  { field: 'currency', header: 'Currency' },
  { field: 'updatedBy', header: 'Updated by' },
  { field: 'status', header: 'Status' },
];

export function LocationTree({ onBranchToggle }) {
  // No templates: rows come from value + columns. defaultExpandedKeys opens
  // the branches that should already be open on first paint.
  //
  // Still uncontrolled — the component owns the open keys. onToggle only
  // REPORTS the change, which is what you want for analytics or for loading a
  // branch's children lazily. Pass expandedKeys as well to take ownership.
  return (
    <BapsTreeTable
      value={NODES}
      columns={COLUMNS}
      defaultExpandedKeys={['na']}
      onToggle={(key, expanded) => onBranchToggle?.(key, expanded)}
    />
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' because the component owns the expanded keys. Lift them with
   expandedKeys + onToggle if the open branches belong in the URL. */
const NODES = [
  {
    key: 'na',
    data: { location: 'North America', provider: 'Stripe', currency: 'USD', updatedBy: 'J. Patel', status: 'Active' },
    children: [
      { key: 'na-ne', data: { location: 'Northeast', provider: 'Stripe', currency: 'USD', updatedBy: 'J. Patel', status: 'Active' } },
      { key: 'na-mw', data: { location: 'Midwest', provider: 'Stripe', currency: 'USD', updatedBy: 'R. Shah', status: 'Active' } },
    ],
  },
  {
    key: 'ca',
    data: { location: 'Canada', provider: 'Square', currency: 'CAD', updatedBy: 'A. Desai', status: 'Active' },
    children: [
      { key: 'ca-on', data: { location: 'Ontario', provider: 'Square', currency: 'CAD', updatedBy: 'A. Desai', status: 'Active' } },
    ],
  },
];

const COLUMNS = [
  { field: 'location', header: 'Location', width: '26rem' },
  { field: 'provider', header: 'Provider' },
  { field: 'currency', header: 'Currency' },
  { field: 'updatedBy', header: 'Updated by' },
  { field: 'status', header: 'Status' },
];

export default function LocationTree({ onBranchToggle }) {
  return (
    <BapsTreeTable
      value={NODES}
      columns={COLUMNS}
      defaultExpandedKeys={['na']}
    />
  );
}`,
  },

  // Empty is a row, not a blank table: a table with a head and no body reads
  // as broken rather than as "nothing here".
  Empty: {
    primeng: `<baps-tree-table [value]="[]">
  <ng-template pTemplate="emptymessage">
    <tr><td colspan="5">No results found</td></tr>
  </ng-template>
</baps-tree-table>`,
    react: `${SETUP}

export function EmptyTree() {
  // emptyMessage takes a node, so it can be an illustration or an action
  // rather than a sentence.
  return <BapsTreeTable value={[]} columns={COLUMNS} emptyMessage="No results found" />;
}`,
    next: `${SETUP}

/* No 'use client': an empty tree holds no state. */
export default function EmptyTree() {
  return <BapsTreeTable value={[]} columns={COLUMNS} emptyMessage="No results found" />;
}`,
  },

  // Loading marks the container busy rather than swapping the table for a
  // spinner, so the rows a reader already had stay on screen and the change
  // is announced instead of shown.
  Loading: {
    primeng: `<baps-tree-table [value]="nodes" [loading]="true" />`,
    react: `${SETUP}

export function LoadingTree({ loading }) {
  return <BapsTreeTable value={NODES} columns={COLUMNS} loading={loading} />;
}`,
    next: `'use client';

${SETUP}

export default function LoadingTree({ loading }) {
  return <BapsTreeTable value={NODES} columns={COLUMNS} loading={loading} />;
}`,
  },

};
