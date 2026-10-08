'use client';

import {
  createElement,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';
import { BapsButton } from '../button/button.js';
import { BapsDrawer } from '../drawer/drawer.js';
import { BapsIconField } from '../form-field/icon-field.js';
import { BapsInputIcon } from '../form-field/input-icon.js';
import { BapsInputText } from '../form-field/input-text.js';
import { BapsToggleSwitch } from '../toggle-switch/toggle-switch.js';

/**
 * The "Fields" panel: search, a column list in three buckets, and edits that
 * only reach the caller on Apply.
 *
 * The `.ct-cfg-*` class names are the contract — `@org/ui-kit/styles/table-column-config`
 * targets them directly, and that stylesheet only started shipping when the
 * Angular component's inline `styles:` block moved to a partial.
 *
 * Three buckets, and which one a column lands in is derived, not stored:
 *
 *   locked   always visible, no toggle, no pin, no drag
 *   pinned   frozen, always visible; unpin returns it to regular
 *   regular  toggleable and pinnable
 *
 * `end: true` anchors a locked column at the bottom — a trailing actions
 * column belongs after everything the user can reorder.
 *
 * Edits are staged. Dismissing the drawer throws them away, which is what
 * makes Cancel mean something; only Apply emits `onColumnsChange`.
 *
 * NOT built, and each is a design decision rather than missing code:
 * drag-to-reorder (pointer and keyboard affordances both need deciding),
 * column grouping beyond the `group` label, and per-bucket counts. The drag
 * handle renders in its static form so the row keeps its shape.
 */
export type BapsTableColumnConfigBrand = 'mybky' | 'sampark';

export interface BapsTableColumnConfigColumn {
  key: string;
  label: string;
  visible?: boolean;
  /** Always on, never reordered — identity columns and the actions column. */
  locked?: boolean;
  /** Anchors a locked column after the reorderable ones. */
  end?: boolean;
  frozen?: boolean;
  group?: string;
}

type NativeProps = Omit<HTMLAttributes<HTMLElement>, 'children' | 'onChange'>;

export type BapsTableColumnConfigProps = NativeProps & {
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  columns: ReadonlyArray<BapsTableColumnConfigColumn>;
  /** Restores to this set. Without it, Reset restores the columns as first received. */
  defaultColumns?: ReadonlyArray<BapsTableColumnConfigColumn>;
  allowPin?: boolean;
  header?: string;
  sectionLabel?: string;
  searchPlaceholder?: string;
  applyLabel?: string;
  resetLabel?: string;
  onColumnsChange?: (columns: BapsTableColumnConfigColumn[]) => void;
  onClosed?: () => void;
  brand?: BapsTableColumnConfigBrand;
  ref?: Ref<HTMLElement>;
};

/**
 * Split columns into the four render buckets, applying the search filter.
 *
 * Exported because it is the component's actual logic and the component itself
 * cannot be rendered in a test: it draws through `BapsDrawer`, which always
 * portals into `document.body`, so `renderToStaticMarkup` throws
 * "document is not defined". Drawer, Dialog and Popover are untested here for
 * the same reason. Pagination already exports `getPaginationPages` on this
 * precedent.
 *
 * Order is the contract: locked first, then pinned, then the reorderable ones,
 * then locked columns marked `end` — a trailing actions column has to stay
 * trailing.
 */
export function getColumnConfigBuckets(
  columns: ReadonlyArray<BapsTableColumnConfigColumn>,
  query = '',
): Record<'locked' | 'pinned' | 'regular' | 'end', BapsTableColumnConfigColumn[]> {
  const q = query.trim().toLowerCase();
  const shown = columns.filter((c) => !q || c.label.toLowerCase().includes(q));
  return {
    locked: shown.filter((c) => c.locked && !c.end),
    pinned: shown.filter((c) => !c.locked && c.frozen),
    regular: shown.filter((c) => !c.locked && !c.frozen),
    end: shown.filter((c) => c.locked && c.end),
  };
}

/** Static drag affordance. Decorative — reordering is not implemented. */
const DragHandle = (): ReactElement => (
  <span
    className="ct-cfg-drag-handle ct-cfg-drag-handle--static"
    aria-hidden="true"
  >
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
      {[2, 8, 14].flatMap((y) =>
        [2, 8].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.25" fill="currentColor" />
        )),
      )}
    </svg>
  </span>
);

export function BapsTableColumnConfig({
  visible,
  defaultVisible = false,
  onVisibleChange,
  columns,
  defaultColumns,
  allowPin = true,
  header = 'Fields',
  sectionLabel = 'Column Fields',
  searchPlaceholder = 'Search fields',
  applyLabel = 'Apply',
  resetLabel = 'Reset',
  onColumnsChange,
  onClosed,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsTableColumnConfigProps): ReactElement {
  const [ownVisible, setOwnVisible] = useState(defaultVisible);
  const open = visible ?? ownVisible;

  const [draft, setDraft] = useState<BapsTableColumnConfigColumn[]>([...columns]);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(true);

  // Re-stage whenever the panel opens, so a cancelled edit cannot leak into
  // the next visit.
  useEffect(() => {
    if (open) {
      setDraft([...columns]);
      setQuery('');
    }
  }, [open, columns]);

  const close = () => {
    if (visible === undefined) setOwnVisible(false);
    onVisibleChange?.(false);
    onClosed?.();
  };

  const patch = (key: string, change: Partial<BapsTableColumnConfigColumn>) =>
    setDraft((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...change } : c)),
    );

  const buckets = useMemo(
    () => getColumnConfigBuckets(draft, query),
    [draft, query],
  );

  const apply = () => {
    onColumnsChange?.(draft);
    close();
  };

  const reset = () => setDraft([...(defaultColumns ?? columns)]);

  const row = (
    col: BapsTableColumnConfigColumn,
    kind: 'locked' | 'pinned' | 'regular',
  ) => (
    <div
      key={col.key}
      className={[
        'ct-cfg-item',
        kind === 'locked' && 'ct-cfg-item--locked',
        kind === 'pinned' && 'ct-cfg-item--pinned',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <DragHandle />
      <span className="ct-cfg-item-title">{col.label}</span>

      {allowPin && kind !== 'locked' && (
        <button
          type="button"
          className={[
            'ct-cfg-pin-btn',
            col.frozen && 'ct-cfg-pin-btn--active',
          ]
            .filter(Boolean)
            .join(' ')}
          // aria-pressed, not a label swap: the control is the same control
          // whichever state it is in, and a toggle button says so this way.
          aria-pressed={Boolean(col.frozen)}
          aria-label={`Pin ${col.label}`}
          onClick={() => patch(col.key, { frozen: !col.frozen })}
        >
          <span aria-hidden="true">📌</span>
        </button>
      )}

      {kind === 'locked' ? (
        // No switch at all rather than a disabled one: a locked column cannot
        // be turned off, and a dead control invites the attempt.
        <span className="ct-cfg-item-locked-note" aria-hidden="true" />
      ) : (
        <BapsToggleSwitch
          checked={col.visible !== false}
          brand={brand}
          aria-label={`Show ${col.label}`}
          onChange={(e) => patch(col.key, { visible: e.target.checked })}
        />
      )}
    </div>
  );

  const panel = (
    <>
      <div className="ct-cfg-actions">
        {brand === 'sampark' ? (
          <>
            <BapsButton brand="sampark" severity="secondary" size="small" onClick={reset}>
              {resetLabel}
            </BapsButton>
            <BapsButton brand="sampark" severity="primary" size="small" onClick={apply}>
              {applyLabel}
            </BapsButton>
          </>
        ) : (
          <>
            <BapsButton severity="secondary" size="small" onClick={reset}>
              {resetLabel}
            </BapsButton>
            <BapsButton severity="primary" size="small" onClick={apply}>
              {applyLabel}
            </BapsButton>
          </>
        )}
        <span className="ct-cfg-divider" />
      </div>

      <div className="ct-cfg">
        <BapsIconField>
          <BapsInputIcon />
          <BapsInputText
            value={query}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(e: { target: { value: string } }) => setQuery(e.target.value)}
          />
        </BapsIconField>

        <div className="ct-cfg-section">
          <span className="ct-cfg-section-label">{sectionLabel}</span>
          <button
            type="button"
            className="ct-cfg-active-toggle"
            aria-expanded={expanded}
            aria-label={sectionLabel}
            onClick={() => setExpanded((v) => !v)}
          >
            <i
              className={`pi ${expanded ? 'pi-angle-down' : 'pi-angle-right'}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {expanded && (
          <div className="ct-cfg-list">
            {buckets.locked.map((c) => row(c, 'locked'))}
            {buckets.pinned.map((c) => row(c, 'pinned'))}
            {buckets.regular.map((c) => row(c, 'regular'))}
            {buckets.end.map((c) => row(c, 'locked'))}
          </div>
        )}
      </div>
    </>
  );

  return createElement(
    'baps-table-column-config',
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

BapsTableColumnConfig.displayName = 'BapsTableColumnConfig';
