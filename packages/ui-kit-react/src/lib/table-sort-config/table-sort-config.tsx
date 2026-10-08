'use client';

import {
  createElement,
  useCallback,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';
import { BapsButton } from '../button/button.js';
import { BapsDrawer } from '../drawer/drawer.js';
import { BapsSelect } from '../select/select.js';

/**
 * Multi-column sort panel.
 *
 * The `.ts-cfg-*` class names are the contract —
 * `@org/ui-kit/styles/table-sort-config` targets them, and that stylesheet
 * only began shipping once the Angular component's inline `styles:` block
 * moved to a partial.
 */
export type BapsTableSortConfigBrand = 'mybky' | 'sampark';

export interface BapsTableSortField {
  key: string;
  label: string;
}

/**
 * One row of the sort order.
 *
 * `direction` follows PrimeNG — 1 ascending, -1 descending — so a row maps
 * onto a `SortMeta` with no translation.
 *
 * `locked` marks the table's default sort: the tie-breaker that is always
 * applied, so it cannot be removed. It CAN still be reordered and flipped,
 * because "always applied" is not the same as "always last".
 */
export interface BapsTableSortRow {
  field: string | null;
  direction: 1 | -1;
  locked?: boolean;
}

type NativeProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onChange'>;

export type BapsTableSortConfigProps = NativeProps & {
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  fields: ReadonlyArray<BapsTableSortField>;
  rows?: ReadonlyArray<BapsTableSortRow>;
  defaultRows?: ReadonlyArray<BapsTableSortRow>;
  /** The locked tie-breaker, shown even when the caller passes no rows. */
  defaultSort?: BapsTableSortRow;
  header?: string;
  addLabel?: string;
  applyLabel?: string;
  emptyMessage?: string;
  onSortChange?: (rows: BapsTableSortRow[]) => void;
  onClosed?: () => void;
  brand?: BapsTableSortConfigBrand;
  ref?: Ref<HTMLElement>;
};

/**
 * Which fields a row may still choose: everything not already taken by another
 * row, plus whatever this row holds now.
 *
 * Exported for the same reason as `getColumnConfigBuckets` — the component
 * draws through `BapsDrawer`, which always portals into `document.body`, so
 * it cannot be rendered by `renderToStaticMarkup`. This is the logic worth
 * pinning, and it is pinned directly.
 */
export function getAvailableSortFields(
  fields: ReadonlyArray<BapsTableSortField>,
  rows: ReadonlyArray<BapsTableSortRow>,
  rowIndex: number,
): BapsTableSortField[] {
  const taken = new Set(
    rows.map((r, i) => (i === rowIndex ? null : r.field)).filter(Boolean),
  );
  return fields.filter((f) => !taken.has(f.key));
}

/** Rows that can actually be applied: a row with no field chosen is not a sort. */
export function getApplicableSortRows(
  rows: ReadonlyArray<BapsTableSortRow>,
): BapsTableSortRow[] {
  return rows.filter((r) => r.field !== null);
}

export function BapsTableSortConfig({
  visible,
  defaultVisible = false,
  onVisibleChange,
  fields,
  rows,
  defaultRows,
  defaultSort,
  header = 'Sort',
  addLabel = 'Add sort',
  applyLabel = 'Apply',
  emptyMessage = 'No sorting applied',
  onSortChange,
  onClosed,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsTableSortConfigProps): ReactElement {
  const [ownVisible, setOwnVisible] = useState(defaultVisible);
  const open = visible ?? ownVisible;

  // Memoised rather than a plain function so the effect below can depend on it
  // honestly — a function rebuilt every render would either re-seed on every
  // render or need its dependency list lied about.
  const seed = useCallback((): BapsTableSortRow[] => {
    const base = rows ?? defaultRows ?? [];
    if (base.length > 0) return base.map((r) => ({ ...r }));
    // The locked default sort is always applied, so it is shown even when the
    // caller passes nothing — otherwise the panel claims no sorting while the
    // table is sorted.
    return defaultSort ? [{ ...defaultSort, locked: true }] : [];
  }, [rows, defaultRows, defaultSort]);

  const [draft, setDraft] = useState<BapsTableSortRow[]>(seed);

  // Re-stage on open, so a cancelled edit cannot leak into the next visit.
  useEffect(() => {
    if (open) setDraft(seed());
  }, [open, seed]);

  const close = () => {
    if (visible === undefined) setOwnVisible(false);
    onVisibleChange?.(false);
    onClosed?.();
  };

  const patch = (i: number, change: Partial<BapsTableSortRow>) =>
    setDraft((prev) => prev.map((r, n) => (n === i ? { ...r, ...change } : r)));

  const remove = (i: number) =>
    setDraft((prev) => prev.filter((_, n) => n !== i));

  const add = () =>
    setDraft((prev) => [...prev, { field: null, direction: 1 }]);

  const apply = () => {
    onSortChange?.(getApplicableSortRows(draft));
    close();
  };

  const panel = (
    <div className="ts-cfg">
      {draft.length === 0 ? (
        <p className="ts-cfg-empty">{emptyMessage}</p>
      ) : (
        <div className="ts-cfg-list">
          {draft.map((row, i) => (
            <div
              key={`${row.field ?? 'unset'}-${i}`}
              className={['ts-cfg-row', row.locked && 'ts-cfg-row--locked']
                .filter(Boolean)
                .join(' ')}
            >
              <span className="ts-cfg-handle" aria-hidden="true" />

              <span className="ts-cfg-field">
                <BapsSelect
                  ariaLabel={`Sort field ${i + 1}`}
                  value={row.field}
                  brand={brand}
                  options={getAvailableSortFields(fields, draft, i).map((f) => ({
                    label: f.label,
                    value: f.key,
                  }))}
                  onValueChange={(value) => patch(i, { field: value })}
                />
              </span>

              <div className="ts-cfg-chips">
                {([1, -1] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    className="ts-cfg-chip"
                    // Two buttons in one group, so the pressed one is the
                    // answer rather than a label that changes under the user.
                    aria-pressed={row.direction === dir}
                    onClick={() => patch(i, { direction: dir })}
                  >
                    {dir === 1 ? 'Asc' : 'Desc'}
                  </button>
                ))}
              </div>

              {row.locked ? (
                // Locked is the table's tie-breaker: always applied, so there
                // is nothing to remove. It can still be flipped above.
                <span className="ts-cfg-locked">Default</span>
              ) : (
                <button
                  type="button"
                  className="ts-cfg-btn"
                  aria-label={`Remove sort ${i + 1}`}
                  onClick={() => remove(i)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="ts-cfg-actions">
        {brand === 'sampark' ? (
          <>
            <BapsButton brand="sampark" severity="secondary" size="small" onClick={add}>
              {addLabel}
            </BapsButton>
            <BapsButton brand="sampark" severity="primary" size="small" onClick={apply}>
              {applyLabel}
            </BapsButton>
          </>
        ) : (
          <>
            <BapsButton severity="secondary" size="small" onClick={add}>
              {addLabel}
            </BapsButton>
            <BapsButton severity="primary" size="small" onClick={apply}>
              {applyLabel}
            </BapsButton>
          </>
        )}
      </div>
    </div>
  );

  return createElement(
    'baps-table-sort-config',
    {
      ...nativeProps,
      ref,
      className:
        [brand === 'sampark' && 'baps-sampark', className]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    <BapsDrawer
      visible={open}
      header={header}
      position="right"
      brand={brand}
      onVisibleChange={(next) => {
        if (!next) close();
      }}
    >
      {panel}
    </BapsDrawer>,
  );
}

BapsTableSortConfig.displayName = 'BapsTableSortConfig';
