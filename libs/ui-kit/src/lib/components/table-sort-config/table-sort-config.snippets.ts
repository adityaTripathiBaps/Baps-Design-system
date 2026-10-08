/**
 * Framework snippets for the Table sort config docs page.
 *
 * ## Route B: no Custom tab, and why
 *
 * The panel lives inside a drawer, and the drawer's DOM is built at runtime —
 * PrimeNG's in Angular, a React portal in `@org/ui-kit-react`. There is no
 * static markup that reproduces it, so none is written. A Custom block here
 * would look authoritative and be wrong, which is worse than its absence.
 *
 * The skin does ship: `@org/ui-kit/styles/table-sort-config` targets the
 * `.ts-cfg-*` classes, and it only began shipping once the Angular
 * component's inline `styles:` block moved to a partial.
 *
 * ## The model is small and two parts of it are load-bearing
 *
 * A row is `{ field, direction, locked? }`. `direction` is PrimeNG's
 * convention — 1 ascending, -1 descending — so a row maps onto a `SortMeta`
 * without translation.
 *
 * `locked` marks the table's default sort: the tie-breaker that is always
 * applied, so it cannot be removed. It CAN still be reordered and flipped,
 * because "always applied" is not the same as "always last".
 *
 * Two rules the panel enforces that are easy to miss when rolling your own:
 * a field another row already uses is not offered again, and a row with no
 * field chosen is dropped on Apply, because a sort by nothing is not a sort.
 *
 * Drag-to-reorder is not implemented in React. The pointer and keyboard
 * affordances both need deciding first.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('table-sort-config');

export const tableSortConfigSnippets: Record<string, SnippetSet> = {
  // Rows the caller already has, plus the locked default underneath them.
  Default: {
    primeng: `<baps-table-sort-config
  [(visible)]="sortOpen"
  [fields]="fields"
  [rows]="sortRows"
  [defaultSort]="{ field: 'updatedAt', direction: -1 }"
  (sortChange)="sortRows = $event"
/>`,
    react: `${SETUP}

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'centre', label: 'Centre' },
  { key: 'updatedAt', label: 'Last updated' },
];

export function SortPanel({ open, onOpenChange, onApply }) {
  // Uncontrolled rows: the panel stages its own edits and emits once, on
  // Apply. Dismissing throws them away, which is what makes Cancel mean
  // something.
  return (
    <BapsTableSortConfig
      visible={open}
      onVisibleChange={onOpenChange}
      fields={FIELDS}
      defaultRows={[{ field: 'name', direction: 1 }]}
      defaultSort={{ field: 'updatedAt', direction: -1 }}
      onSortChange={onApply}
    />
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' because the panel is a drawer that owns open state and staged
   edits. The sort it emits can go straight into a search param. */
const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'centre', label: 'Centre' },
  { key: 'updatedAt', label: 'Last updated' },
];

export default function SortPanel({ open, onOpenChange, onApply }) {
  return (
    <BapsTableSortConfig
      visible={open}
      onVisibleChange={onOpenChange}
      fields={FIELDS}
      defaultRows={[{ field: 'name', direction: 1 }]}
      defaultSort={{ field: 'updatedAt', direction: -1 }}
      onSortChange={onApply}
    />
  );
}`,
  },

  // Nothing but the locked default. The panel still shows it, because a panel
  // claiming "no sorting" while the table is sorted is a lie the user pays for.
  DefaultOnly: {
    primeng: `<baps-table-sort-config
  [(visible)]="sortOpen"
  [fields]="fields"
  [rows]="[]"
  [defaultSort]="{ field: 'updatedAt', direction: -1 }"
/>`,
    react: `${SETUP}

export function DefaultOnlyPanel({ open, onOpenChange }) {
  // No defaultRows at all — defaultSort alone seeds the list, and the row it
  // produces is locked, so it has no remove button.
  return (
    <BapsTableSortConfig
      visible={open}
      onVisibleChange={onOpenChange}
      fields={FIELDS}
      defaultSort={{ field: 'updatedAt', direction: -1 }}
    />
  );
}`,
    next: `'use client';

${SETUP}

export default function DefaultOnlyPanel({ open, onOpenChange }) {
  return (
    <BapsTableSortConfig
      visible={open}
      onVisibleChange={onOpenChange}
      fields={FIELDS}
      defaultSort={{ field: 'updatedAt', direction: -1 }}
    />
  );
}`,
  },

  // No rows and no default: the one state where the panel genuinely has
  // nothing to show, so it says so rather than rendering an empty list.
  Empty: {
    primeng: `<baps-table-sort-config [(visible)]="sortOpen" [fields]="fields" [rows]="[]" />`,
    react: `${SETUP}

export function EmptySortPanel({ open, onOpenChange }) {
  return (
    <BapsTableSortConfig
      visible={open}
      onVisibleChange={onOpenChange}
      fields={FIELDS}
      emptyMessage="No sorting applied"
    />
  );
}`,
    next: `'use client';

${SETUP}

export default function EmptySortPanel({ open, onOpenChange }) {
  return (
    <BapsTableSortConfig
      visible={open}
      onVisibleChange={onOpenChange}
      fields={FIELDS}
      emptyMessage="No sorting applied"
    />
  );
}`,
  },

  // Opened from a toolbar button rather than an external flag. The panel owns
  // its own visibility here, which is the simpler wiring when nothing else
  // needs to know whether it is open.
  FromTrigger: {
    primeng: `<baps-button label="Sort" (onClick)="sortOpen = true" />
<baps-table-sort-config [(visible)]="sortOpen" [fields]="fields" [rows]="sortRows" />`,
    react: `${SETUP}

export function SortFromToolbar({ onApply }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BapsButton severity="secondary" size="small" onClick={() => setOpen(true)}>
        Sort
      </BapsButton>
      <BapsTableSortConfig
        visible={open}
        onVisibleChange={setOpen}
        fields={FIELDS}
        defaultSort={{ field: 'updatedAt', direction: -1 }}
        onSortChange={onApply}
      />
    </>
  );
}`,
    next: `'use client';

${SETUP}

export default function SortFromToolbar({ onApply }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BapsButton severity="secondary" size="small" onClick={() => setOpen(true)}>
        Sort
      </BapsButton>
      <BapsTableSortConfig
        visible={open}
        onVisibleChange={setOpen}
        fields={FIELDS}
        defaultSort={{ field: 'updatedAt', direction: -1 }}
        onSortChange={onApply}
      />
    </>
  );
}`,
  },

};
