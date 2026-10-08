'use client';

import {
  createElement,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsSortIcon, type BapsSortOrder } from '../sort-icon/sort-icon.js';

/**
 * Data table.
 *
 * The DOM is PrimeNG's `.p-datatable-*` contract, not an invention: the
 * canonical stylesheet `@org/ui-kit/styles/table` targets 19 of those class
 * names directly, so anything else renders unstyled. Same approach the rest of
 * this package already takes — the React progress bar emits `p-progressbar`
 * for exactly the same reason.
 *
 * Sorting is controlled or uncontrolled. Pass `sortField`/`sortOrder` and
 * handle `onSort` to drive it yourself — server-side paging needs that — or
 * pass neither and the table sorts its own rows.
 *
 * Deliberately NOT built, because each needs an API or design decision rather
 * than code: row selection, frozen columns, virtual scroll, row expansion,
 * column resize and reorder. The Angular table gets these from PrimeNG; here
 * they would each be a new public surface.
 */
export type BapsTableBrand = 'mybky' | 'sampark';

export type { BapsSortOrder };

export interface BapsTableColumn<T> {
  /** Key into the row, and the identity used for sorting. */
  field: string;
  header: ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Render the cell yourself. Without it the raw field value is printed. */
  body?: (row: T, rowIndex: number) => ReactNode;
}

export interface BapsTableSortEvent {
  field: string;
  order: BapsSortOrder;
}

type NativeProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onSelect'>;

export type BapsTableProps<T> = NativeProps & {
  columns: ReadonlyArray<BapsTableColumn<T>>;
  value: ReadonlyArray<T>;
  sortField?: string;
  sortOrder?: BapsSortOrder;
  defaultSortField?: string;
  defaultSortOrder?: BapsSortOrder;
  onSort?: (event: BapsTableSortEvent) => void;
  loading?: boolean;
  emptyMessage?: ReactNode;
  striped?: boolean;
  size?: 'small';
  scrollable?: boolean;
  scrollHeight?: string;
  footer?: ReactNode;
  /** Stable row identity. Falls back to the index, which is fine for static data. */
  rowKey?: (row: T, index: number) => string | number;
  brand?: BapsTableBrand;
  ref?: Ref<HTMLElement>;
};

/** Next order in the three-state cycle: none -> ascending -> descending -> none. */
const nextOrder = (current: BapsSortOrder): BapsSortOrder =>
  current === 0 ? 1 : current === 1 ? -1 : 0;

const ARIA_SORT = {
  1: 'ascending',
  '-1': 'descending',
  0: 'none',
} as const;

/** Undefined and null sort last in both directions — they are absent, not small. */
function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export function BapsTable<T>({
  columns,
  value,
  sortField,
  sortOrder,
  defaultSortField = '',
  defaultSortOrder = 0,
  onSort,
  loading = false,
  emptyMessage = 'No results found',
  striped = false,
  size,
  scrollable = false,
  scrollHeight,
  footer,
  rowKey,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsTableProps<T>): ReactElement {
  const [ownField, setOwnField] = useState(defaultSortField);
  const [ownOrder, setOwnOrder] = useState<BapsSortOrder>(defaultSortOrder);

  // Controlled the moment the caller passes sortField, so a server-paged table
  // never sorts the page it was handed.
  const controlled = sortField !== undefined;
  const activeField = controlled ? sortField : ownField;
  const activeOrder = controlled ? (sortOrder ?? 0) : ownOrder;

  const rows = useMemo(() => {
    if (controlled || !activeField || activeOrder === 0) return value;
    const column = columns.find((c) => c.field === activeField);
    if (!column) return value;
    const copy = [...value];
    copy.sort(
      (a, b) =>
        compare(
          (a as Record<string, unknown>)[activeField],
          (b as Record<string, unknown>)[activeField],
        ) * activeOrder,
    );
    return copy;
  }, [controlled, value, columns, activeField, activeOrder]);

  const toggle = (field: string) => {
    const order = field === activeField ? nextOrder(activeOrder) : 1;
    if (!controlled) {
      setOwnField(order === 0 ? '' : field);
      setOwnOrder(order);
    }
    onSort?.({ field, order });
  };

  const header = (
    <thead className="p-datatable-thead">
      <tr>
        {columns.map((col) => {
          const sorted = col.sortable && col.field === activeField;
          const order: BapsSortOrder = sorted ? activeOrder : 0;
          const content = (
            <div className="p-datatable-column-header-content">
              <span className="p-datatable-column-title">{col.header}</span>
              {col.sortable && <BapsSortIcon order={order} />}
            </div>
          );

          return (
            <th
              key={col.field}
              scope="col"
              className={sorted ? 'p-datatable-column-sorted' : undefined}
              style={{ width: col.width, textAlign: col.align }}
              // aria-sort belongs on the header cell, not the button, and only
              // a sortable column may carry it at all.
              aria-sort={col.sortable ? ARIA_SORT[`${order}`] : undefined}
            >
              {col.sortable ? (
                // A real button: Enter and Space, focus ring and the
                // actionable role all come from the platform.
                <button type="button" onClick={() => toggle(col.field)}>
                  {content}
                </button>
              ) : (
                content
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );

  const body = (
    <tbody className="p-datatable-tbody">
      {rows.length === 0 ? (
        <tr>
          <td className="p-datatable-empty-message" colSpan={columns.length}>
            {emptyMessage}
          </td>
        </tr>
      ) : (
        rows.map((row, i) => (
          <tr key={rowKey ? rowKey(row, i) : i}>
            {columns.map((col) => (
              <td key={col.field} style={{ textAlign: col.align }}>
                {col.body
                  ? col.body(row, i)
                  : ((row as Record<string, unknown>)[col.field] as ReactNode)}
              </td>
            ))}
          </tr>
        ))
      )}
    </tbody>
  );

  // createElement rather than JSX for the host: this package declares no
  // JSX.IntrinsicElements entry for its custom elements, and the rest of the
  // package reaches them the same way.
  const shell = (
    <div
        className={[
          'p-datatable',
          'p-component',
          striped && 'p-datatable-striped',
          size === 'small' && 'p-datatable-sm',
          scrollable && 'p-datatable-scrollable',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {loading && (
          // aria-busy on the container is what a screen reader acts on; the
          // mask itself is decoration.
          <div className="p-datatable-mask" aria-hidden="true">
            <span className="p-datatable-loading-icon" />
          </div>
        )}
        <div
          className="p-datatable-table-container"
          style={scrollHeight ? { maxHeight: scrollHeight } : undefined}
          aria-busy={loading || undefined}
        >
          <table className="p-datatable-table">
            {header}
            {body}
            {footer && (
              <tfoot className="p-datatable-tfoot">
                <tr>
                  <td colSpan={columns.length}>{footer}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
    </div>
  );

  return createElement(
    'baps-table',
    {
      ...nativeProps,
      ref,
      className:
        [brand === 'sampark' && 'baps-sampark', className]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    shell,
  );
}

BapsTable.displayName = 'BapsTable';
