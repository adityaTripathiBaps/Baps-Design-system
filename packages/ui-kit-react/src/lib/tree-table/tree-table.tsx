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

/**
 * Hierarchical table.
 *
 * The DOM is PrimeNG's `.p-treetable-*` contract — `@org/ui-kit/styles/tree-table`
 * targets `.p-treetable-thead`, `.p-treetable-tbody`,
 * `.p-treetable-header-cell` and `.p-treetable-node-toggle-button` directly,
 * so anything else renders unstyled. That stylesheet only started shipping
 * once the Angular component's inline `styles:` block moved to a partial.
 *
 * Expansion is controlled or uncontrolled, the same split the Table uses.
 *
 * NOT built, each a public-API decision rather than missing code: selection,
 * lazy loading, built-in paginator, column resize, and sorting. Sorting in a
 * tree is its own question — whether children sort within their parent or the
 * tree flattens — and guessing it would be worse than leaving it out.
 */
export type BapsTreeTableBrand = 'mybky' | 'sampark';

/**
 * A tree-table row.
 *
 * Deliberately NOT the `BapsTreeNode` that tree-select exports: that one is
 * select-shaped — `label`, `icon`, `selectable`, and `data` optional — while a
 * table row needs `data` as the required record its columns read. Sharing the
 * name would also have been a breaking change to an existing export.
 */
export interface BapsTreeTableNode<T = Record<string, unknown>> {
  key: string;
  data: T;
  children?: BapsTreeTableNode<T>[];
  /** Paints the row as an error state; purely presentational. */
  error?: boolean;
}

export interface BapsTreeTableColumn<T = Record<string, unknown>> {
  field: string;
  header: ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  body?: (node: BapsTreeTableNode<T>, depth: number) => ReactNode;
}

export interface BapsTreeTableRow<T = Record<string, unknown>> {
  node: BapsTreeTableNode<T>;
  depth: number;
  expandable: boolean;
  expanded: boolean;
}

type NativeProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onSelect'>;

export type BapsTreeTableProps<T = Record<string, unknown>> = NativeProps & {
  value: ReadonlyArray<BapsTreeTableNode<T>>;
  columns: ReadonlyArray<BapsTreeTableColumn<T>>;
  expandedKeys?: ReadonlyArray<string>;
  defaultExpandedKeys?: ReadonlyArray<string>;
  onToggle?: (key: string, expanded: boolean) => void;
  loading?: boolean;
  emptyMessage?: ReactNode;
  scrollable?: boolean;
  scrollHeight?: string;
  brand?: BapsTreeTableBrand;
  ref?: Ref<HTMLElement>;
};

/**
 * Flatten the tree to the rows actually on screen: a node appears only when
 * every ancestor is expanded.
 *
 * Exported and tested directly, like `getColumnConfigBuckets` and
 * `getAvailableSortFields` — this is where the component's behaviour lives,
 * and a flattener is far easier to get subtly wrong than to read.
 */
export function flattenTreeTableRows<T>(
  nodes: ReadonlyArray<BapsTreeTableNode<T>>,
  expandedKeys: ReadonlyArray<string>,
  depth = 0,
  out: BapsTreeTableRow<T>[] = [],
): BapsTreeTableRow<T>[] {
  const open = new Set(expandedKeys);
  for (const node of nodes) {
    // An empty children array is not expandable: a parent with nothing in it
    // would otherwise offer a toggle that reveals nothing.
    const expandable = Boolean(node.children && node.children.length > 0);
    const expanded = expandable && open.has(node.key);
    out.push({ node, depth, expandable, expanded });
    if (expanded && node.children) {
      flattenTreeTableRows(node.children, expandedKeys, depth + 1, out);
    }
  }
  return out;
}

export function BapsTreeTable<T = Record<string, unknown>>({
  value,
  columns,
  expandedKeys,
  defaultExpandedKeys = [],
  onToggle,
  loading = false,
  emptyMessage = 'No results found',
  scrollable = false,
  scrollHeight,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsTreeTableProps<T>): ReactElement {
  const [ownKeys, setOwnKeys] = useState<string[]>([...defaultExpandedKeys]);
  const controlled = expandedKeys !== undefined;
  const keys = controlled ? expandedKeys : ownKeys;

  const rows = useMemo(
    () => flattenTreeTableRows(value, keys),
    [value, keys],
  );

  const toggle = (key: string, expanded: boolean) => {
    if (!controlled) {
      setOwnKeys((prev) =>
        expanded ? prev.filter((k) => k !== key) : [...prev, key],
      );
    }
    onToggle?.(key, !expanded);
  };

  const shell = (
    <div
      className={['p-treetable', 'p-component', scrollable && 'p-treetable-scrollable']
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="p-treetable-table-container"
        style={scrollHeight ? { maxHeight: scrollHeight } : undefined}
        aria-busy={loading || undefined}
      >
        <table className="p-treetable-table">
          <thead className="p-treetable-thead">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.field}
                  scope="col"
                  className="p-treetable-header-cell"
                  style={{ width: col.width, textAlign: col.align }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="p-treetable-tbody">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            ) : (
              rows.map(({ node, depth, expandable, expanded }) => (
                <tr
                  key={node.key}
                  className={node.error ? 'baps-tree-row-error' : undefined}
                  // aria-level is 1-based; depth is not. A screen reader reads
                  // this as the row's place in the hierarchy.
                  aria-level={depth + 1}
                  aria-expanded={expandable ? expanded : undefined}
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.field} style={{ textAlign: col.align }}>
                      {colIndex === 0 && (
                        <>
                          {/* Indent is padding on a spacer, not a nested
                              table: the row stays one <tr> so the column grid
                              still lines up across depths. */}
                          <span
                            style={{ paddingInlineStart: `${depth * 1.25}rem` }}
                            aria-hidden="true"
                          />
                          {expandable ? (
                            <button
                              type="button"
                              className="p-treetable-node-toggle-button"
                              aria-label={expanded ? 'Collapse' : 'Expand'}
                              onClick={() => toggle(node.key, expanded)}
                            >
                              {expanded ? '▾' : '▸'}
                            </button>
                          ) : (
                            // A leaf keeps the slot so its text aligns with a
                            // sibling that has a toggle.
                            <span
                              className="p-treetable-node-toggle-button"
                              aria-hidden="true"
                            />
                          )}
                        </>
                      )}
                      {col.body
                        ? col.body(node, depth)
                        : ((node.data as Record<string, unknown>)[
                            col.field
                          ] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return createElement(
    'baps-tree-table',
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

BapsTreeTable.displayName = 'BapsTreeTable';
