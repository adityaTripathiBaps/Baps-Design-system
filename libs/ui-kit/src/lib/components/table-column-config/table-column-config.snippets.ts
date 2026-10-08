/**
 * Framework snippets for the Table column config docs page.
 *
 * ## Route B: no Custom tab
 *
 * The panel is a drawer, and a drawer's DOM is built at runtime — PrimeNG's in
 * Angular, a React portal in `@org/ui-kit-react`. No static markup reproduces
 * it, so none is written. The skin itself does ship:
 * `@org/ui-kit/styles/table-column-config` targets the `.ct-cfg-*` classes,
 * and it only began shipping once the Angular component's inline `styles:`
 * block moved to a partial.
 *
 * ## Four buckets, and the order is the contract
 *
 *   locked   always on. No switch at all — not a disabled one, because a dead
 *            control invites the attempt.
 *   pinned   frozen and always on, but the user's to unpin.
 *   regular  toggleable and pinnable.
 *   end      locked AND anchored last, for a trailing actions column.
 *
 * `end: true` is why locked and "locked at the bottom" are different flags: an
 * actions column has to stay after everything the user can reorder.
 *
 * Edits are staged and only reach you on Apply. Dismissing the drawer throws
 * them away, which is what makes Cancel mean something.
 *
 * Drag-to-reorder is not implemented in React; the handle renders in its
 * static form so the row keeps its shape. Pointer and keyboard affordances
 * both need deciding first.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('table-column-config');

export const tableColumnConfigSnippets: Record<string, SnippetSet> = {
  // The controls story. Every bucket is represented, which is the point —
  // one locked column, one pinned, two regular, and a locked actions column
  // anchored at the end.
  Playground: {
    primeng: `<baps-table-column-config
  [(visible)]="configOpen"
  [columns]="columns"
  (columnsChange)="columns = $event"
/>`,
    react: `${SETUP}

const COLUMNS = [
  { key: 'name', label: 'Name', locked: true },
  { key: 'centre', label: 'Centre' },
  { key: 'role', label: 'Role' },
  { key: 'email', label: 'Email', visible: false },
  { key: 'region', label: 'Region', frozen: true },
  { key: 'actions', label: 'Actions', locked: true, end: true },
];

export function ColumnPanel({ open, onOpenChange, onApply }) {
  // columns is the staged input; onColumnsChange fires once, on Apply, with
  // the whole set rather than a diff.
  return (
    <BapsTableColumnConfig
      visible={open}
      onVisibleChange={onOpenChange}
      columns={COLUMNS}
      onColumnsChange={onApply}
    />
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' because the panel is a drawer holding staged edits. The
   applied column set can then be persisted wherever it belongs. */
const COLUMNS = [
  { key: 'name', label: 'Name', locked: true },
  { key: 'centre', label: 'Centre' },
  { key: 'role', label: 'Role' },
  { key: 'email', label: 'Email', visible: false },
  { key: 'region', label: 'Region', frozen: true },
  { key: 'actions', label: 'Actions', locked: true, end: true },
];

export default function ColumnPanel({ open, onOpenChange, onApply }) {
  return (
    <BapsTableColumnConfig
      visible={open}
      onVisibleChange={onOpenChange}
      columns={COLUMNS}
      onColumnsChange={onApply}
    />
  );
}`,
  },

  // Open on mount, with a toolbar button to reopen it. The table renders
  // whatever the panel left visible, which is the whole wiring.
  Open: {
    primeng: `<baps-button label="Fields" (onClick)="configOpen = true" />
<baps-table-column-config [(visible)]="configOpen" [columns]="columns" />`,
    react: `${SETUP}

export function ColumnsFromToolbar({ rows }) {
  const [columns, setColumns] = useState(COLUMNS);
  const [open, setOpen] = useState(true);

  return (
    <>
      <BapsButton severity="secondary" size="small" onClick={() => setOpen(true)}>
        Fields
      </BapsButton>

      {/* visible !== false, not visible === true: a column with no visible
          flag is shown, which is what makes the flag optional. */}
      <BapsTable
        columns={columns.filter((c) => c.visible !== false)}
        value={rows}
      />

      <BapsTableColumnConfig
        visible={open}
        onVisibleChange={setOpen}
        columns={columns}
        onColumnsChange={setColumns}
      />
    </>
  );
}`,
    next: `'use client';

${SETUP}

export default function ColumnsFromToolbar({ rows }) {
  const [columns, setColumns] = useState(COLUMNS);
  const [open, setOpen] = useState(true);

  return (
    <>
      <BapsButton severity="secondary" size="small" onClick={() => setOpen(true)}>
        Fields
      </BapsButton>
      <BapsTable columns={columns.filter((c) => c.visible !== false)} value={rows} />
      <BapsTableColumnConfig
        visible={open}
        onVisibleChange={setOpen}
        columns={columns}
        onColumnsChange={setColumns}
      />
    </>
  );
}`,
  },

  // Pinning off. The rows stay; only the affordance goes, and a column that
  // was already frozen keeps its bucket — allowPin hides the control, it does
  // not unpin anything.
  WithoutPinning: {
    primeng: `<baps-table-column-config
  [(visible)]="configOpen"
  [columns]="columns"
  [allowPin]="false"
/>`,
    react: `${SETUP}

export function NoPinPanel({ open, onOpenChange }) {
  return (
    <BapsTableColumnConfig
      visible={open}
      onVisibleChange={onOpenChange}
      columns={COLUMNS}
      allowPin={false}
    />
  );
}`,
    next: `'use client';

${SETUP}

export default function NoPinPanel({ open, onOpenChange }) {
  return (
    <BapsTableColumnConfig
      visible={open}
      onVisibleChange={onOpenChange}
      columns={COLUMNS}
      allowPin={false}
    />
  );
}`,
  },
};
