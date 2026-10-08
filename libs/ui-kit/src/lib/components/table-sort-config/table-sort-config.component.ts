import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Draggable, Droppable } from 'primeng/dragdrop';
import { BapsDrawer } from '../drawer/drawer.component';
import { BapsButton } from '../button/button.component';
import { BapsSelect } from '../select/select.component';

/** A sortable field, as offered in the panel's quick-sort chips and row selects. */
export interface BapsTableSortField {
  key: string;
  label: string;
}

/**
 * One row of the sort order: which field, which direction, and whether the
 * consumer pinned it.
 *
 * `direction` is PrimeNG's own convention — 1 ascending, -1 descending — so a
 * row maps onto a `SortMeta` without translation.
 *
 * `locked` marks the table's default sort. It is the tie-breaker that is always
 * applied, so it cannot be removed; it CAN be reordered and flipped, because
 * "always applied" is not the same as "always last".
 */
export interface BapsTableSortRow {
  field: string | null;
  direction: 1 | -1;
  locked?: boolean;
}

/**
 * baps-table-sort-config — the multi-column sort panel.
 *
 * ## Why sorting needs a panel at all
 *
 * PrimeNG's own multi-sort is ctrl/meta-click on successive headers. It works,
 * but it is invisible: nothing on screen says the modifier exists, the order
 * you clicked in is the priority order whether you meant it or not, and there
 * is no way to see or change that order afterwards. This panel is the explicit
 * form of the same thing — the priority IS the row order, and it is draggable.
 *
 * So the interaction splits in two, and consumers should keep it that way:
 * a plain header click sorts by that one column, and multi-column sort is
 * reached only here. `baps-table` stays on `sortMode="multiple"` throughout,
 * because that is what makes PrimeNG render the order badge in the header
 * (see the multi-sort pill in the Sampark table skin) — the single-click
 * behaviour is the consumer replacing the sort array rather than appending
 * to it.
 *
 * ## Staged edits
 *
 * Like `baps-table-column-config`, edits are local until Apply. Dismissing the
 * drawer — mask, Esc, the X — discards them. A table re-sorting under the
 * pointer on every keystroke in the panel is the behaviour this avoids.
 *
 * Usage:
 *
 *     <baps-table-sort-config
 *       [(visible)]="showSort"
 *       [fields]="sortFields"
 *       [rows]="sortRows"
 *       [defaultSort]="{ field: 'name', direction: 1, locked: true }"
 *       (sortChange)="applySort($event)"
 *     />
 *
 * Sampark-only, for the same reason `baps-table-column-config` is: this panel
 * is a Sampark Portal pattern with no MyBKY counterpart, so there is no
 * `brand` input and every child is pinned to `brand="sampark"`. The
 * `styleClass="baps-ds-sampark"` on the drawer is load-bearing rather than
 * decorative — `appendTo` portals the panel out of this component's DOM, so it
 * can never inherit a `.baps-ds-sampark` ancestor the ordinary way.
 */
@Component({
  selector: 'baps-table-sort-config',
  imports: [FormsModule, Draggable, Droppable, BapsDrawer, BapsButton, BapsSelect],
  template: `
    <baps-drawer
      [visible]="visible"
      (visibleChange)="onVisibleChange($event)"
      [header]="header"
      position="right"
      brand="sampark"
      styleClass="baps-ds-sampark"
      [appendTo]="appendTo"
    >
      <div drawer-actions class="ts-cfg-actions">
        <baps-button
          label="Reset Default"
          severity="secondary"
          [outlined]="true"
          size="small"
          brand="sampark"
          (click)="resetDefault()"
        />
        <baps-button label="Apply" size="small" brand="sampark" (click)="apply()" />
        <span class="ts-cfg-divider"></span>
      </div>

      <div class="ts-cfg">
        <!-- Quick-sort chips: one tap adds a field at the end of the order.
             A field already in the order is disabled rather than hidden, so the
             set of chips does not reshuffle while you are aiming at one. -->
        @if (fields?.length) {
          <div class="ts-cfg-chips" role="group" aria-label="Add a field to sort by">
            @for (f of fields; track f.key) {
              <button
                type="button"
                class="ts-cfg-chip"
                [disabled]="isUsed(f.key)"
                [attr.aria-disabled]="isUsed(f.key)"
                (click)="addField(f.key)"
              >
                {{ f.label }}
              </button>
            }
          </div>
        }

        <div class="ts-cfg-list">
          @for (row of draft; track $index; let i = $index) {
            <div
              class="ts-cfg-row"
              [class.ts-cfg-row--locked]="row.locked"
              [pDraggable]="'baps-ts-cfg-row'"
              [pDroppable]="'baps-ts-cfg-row'"
              (onDragStart)="onDragStart(row)"
              (onDragEnd)="onDragEnd()"
              (onDrop)="onDrop(row)"
            >
              <button
                type="button"
                class="ts-cfg-btn ts-cfg-handle"
                [attr.aria-label]="'Reorder ' + labelFor(row) + '. Use arrow up or down to move.'"
                (keydown.arrowup)="move(row, -1); $event.preventDefault()"
                (keydown.arrowdown)="move(row, 1); $event.preventDefault()"
              >
                <i class="pi pi-bars" aria-hidden="true"></i>
              </button>

              <span class="ts-cfg-row-label">{{ rowLabel(row, i) }}</span>

              <baps-select
                class="ts-cfg-field"
                brand="sampark"
                size="small"
                appendTo="body"
                panelStyleClass="baps-ds-sampark"
                optionLabel="label"
                optionValue="key"
                placeholder="Select field"
                [options]="optionsFor(row)"
                [ngModel]="row.field"
                (ngModelChange)="setField(row, $event)"
                [ariaLabel]="'Sort field for ' + rowLabel(row, i)"
              />

              <button
                type="button"
                class="ts-cfg-btn"
                [attr.aria-label]="
                  (row.direction === 1 ? 'Ascending' : 'Descending') + '. Activate to reverse.'
                "
                (click)="flip(row)"
              >
                <i
                  class="pi"
                  [class.pi-arrow-up]="row.direction === 1"
                  [class.pi-arrow-down]="row.direction === -1"
                  aria-hidden="true"
                ></i>
              </button>

              @if (row.locked) {
                <!-- Same 28px footprint as the remove button it replaces, so a
                     locked row does not sit a control narrower than the rest. -->
                <span class="ts-cfg-btn ts-cfg-locked" title="Default sort — cannot be removed">
                  <i class="pi pi-lock" aria-hidden="true"></i>
                </span>
              } @else {
                <button
                  type="button"
                  class="ts-cfg-btn"
                  [attr.aria-label]="'Remove ' + labelFor(row) + ' from the sort order'"
                  (click)="remove(row)"
                >
                  <i class="pi pi-trash" aria-hidden="true"></i>
                </button>
              }
            </div>
          }

          @if (!draft.length) {
            <p class="ts-cfg-empty">No sort applied. Pick a field above.</p>
          }
        </div>
      </div>
    </baps-drawer>
  `,
  encapsulation: ViewEncapsulation.None,
  // CSS lives in ../../styles/components/table-sort-config/_table-sort-config.scss so the same
  // rules ship to non-Angular consumers through @org/ui-kit/styles — an inline
  // `styles:` block compiles into the JS bundle and reaches no one else.
  styleUrls: ['../../styles/components/table-sort-config/_table-sort-config.scss'],
})
export class BapsTableSortConfig implements OnChanges {
  /** Drawer visibility, two-way bindable. */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Every field the table can be sorted by. */
  @Input() fields: BapsTableSortField[] = [];

  /** The sort order in effect, highest priority first. */
  @Input() rows: BapsTableSortRow[] = [];

  /**
   * The table's default sort. Re-inserted whenever the order would otherwise
   * lose it — on Reset, and on removing the last row — so the table is never
   * left with no deterministic order at all.
   */
  @Input() defaultSort?: BapsTableSortRow;

  @Input() header = 'Sort';
  @Input() appendTo: 'self' | 'body' | HTMLElement = 'body';

  /** Emitted on Apply, highest priority first. Rows with no field are dropped. */
  @Output() sortChange = new EventEmitter<BapsTableSortRow[]>();
  @Output() closed = new EventEmitter<void>();

  draft: BapsTableSortRow[] = [];
  private dragged: BapsTableSortRow | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // Re-seed only when the panel is handed a new order, or when it opens —
    // NOT on every change, or typing in the panel while the parent re-renders
    // would throw the draft away.
    if (changes['rows'] || (changes['visible'] && this.visible)) this.seed();
  }

  private seed(): void {
    // ?? [] because an input with a default can still be handed undefined by a
    // binding — Storybook's generated docs args do exactly that, and the panel
    // threw "Cannot read properties of undefined (reading 'map')" on the docs
    // page where all four stories render at once.
    const next = (this.rows ?? []).map((r) => ({ ...r }));
    this.draft = this.withDefault(next);
  }

  /** The locked default row, appended as the lowest-priority tie-breaker if absent. */
  private withDefault(list: BapsTableSortRow[]): BapsTableSortRow[] {
    if (!this.defaultSort) return list;
    return list.some((r) => r.locked) ? list : [...list, { ...this.defaultSort, locked: true }];
  }

  labelFor(row: BapsTableSortRow): string {
    return (this.fields ?? []).find((f) => f.key === row.field)?.label ?? 'this field';
  }

  /**
   * "Sort by" for the first row, "then by" for the rest — reading the list as
   * a sentence is what makes the priority order legible without a legend. A
   * locked row says "Default" wherever it sits.
   */
  rowLabel(row: BapsTableSortRow, index: number): string {
    if (row.locked) return 'Default';
    return index === 0 ? 'Sort by' : 'then by';
  }

  isUsed(key: string): boolean {
    return this.draft.some((r) => r.field === key);
  }

  /**
   * A row's select offers the unused fields plus its own — without the latter
   * the control would show a value that is not in its own option list, which
   * PrimeNG renders as an empty trigger.
   */
  optionsFor(row: BapsTableSortRow): BapsTableSortField[] {
    return (this.fields ?? []).filter((f) => f.key === row.field || !this.isUsed(f.key));
  }

  addField(key: string): void {
    if (this.isUsed(key)) return;
    // Before the locked row, not after it: the default sort is the
    // tie-breaker, so anything added on purpose outranks it.
    const lockedAt = this.draft.findIndex((r) => r.locked);
    const row: BapsTableSortRow = { field: key, direction: 1 };
    if (lockedAt === -1) this.draft = [...this.draft, row];
    else this.draft = [...this.draft.slice(0, lockedAt), row, ...this.draft.slice(lockedAt)];
  }

  setField(row: BapsTableSortRow, key: string | null): void {
    row.field = key;
  }

  flip(row: BapsTableSortRow): void {
    row.direction = row.direction === 1 ? -1 : 1;
  }

  remove(row: BapsTableSortRow): void {
    if (row.locked) return;
    this.draft = this.withDefault(this.draft.filter((r) => r !== row));
  }

  onDragStart(row: BapsTableSortRow): void {
    this.dragged = row;
  }

  onDragEnd(): void {
    this.dragged = null;
  }

  onDrop(target: BapsTableSortRow): void {
    const dragged = this.dragged;
    this.dragged = null;
    if (!dragged || dragged === target) return;
    const from = this.draft.indexOf(dragged);
    const to = this.draft.indexOf(target);
    if (from === -1 || to === -1) return;
    const next = [...this.draft];
    next.splice(from, 1);
    next.splice(to, 0, dragged);
    this.draft = next;
  }

  /** Keyboard reorder, because pDraggable/pDroppable is pointer-only. */
  move(row: BapsTableSortRow, direction: -1 | 1): void {
    const from = this.draft.indexOf(row);
    if (from === -1) return;
    const to = from + direction;
    if (to < 0 || to >= this.draft.length) return;
    const next = [...this.draft];
    [next[from], next[to]] = [next[to], next[from]];
    this.draft = next;
  }

  resetDefault(): void {
    this.draft = this.withDefault([]);
  }

  apply(): void {
    this.sortChange.emit(this.draft.filter((r) => r.field !== null).map((r) => ({ ...r })));
    this.setVisible(false);
  }

  onVisibleChange(next: boolean): void {
    this.setVisible(next);
  }

  private setVisible(next: boolean): void {
    this.visible = next;
    this.visibleChange.emit(next);
    if (!next) this.closed.emit();
  }
}
