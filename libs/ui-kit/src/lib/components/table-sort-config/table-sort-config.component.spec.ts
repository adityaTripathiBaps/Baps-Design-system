import { SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsTableSortConfig, BapsTableSortField, BapsTableSortRow } from './table-sort-config.component';

/**
 * Unit-level rather than DOM-level, for the same reason
 * `table-column-config.component.spec.ts` is: the panel body renders inside
 * `baps-drawer`, which portals through PrimeNG's Drawer/CDK overlay when
 * `appendTo="body"` (this component's default). Asserting through that stack
 * would be testing PrimeNG's overlay mechanics rather than the ordering,
 * locked-row and staging rules that are first-party here. Every method under
 * test is public, so calling it directly is the component's real API.
 */
const FIELDS: BapsTableSortField[] = [
  { key: 'name', label: 'Project Name' },
  { key: 'location', label: 'Location' },
  { key: 'karyakars', label: '# Karyakars' },
];

const DEFAULT_SORT: BapsTableSortRow = { field: 'name', direction: 1, locked: true };

function open(c: BapsTableSortConfig, rows: BapsTableSortRow[], defaultSort?: BapsTableSortRow): void {
  c.fields = FIELDS;
  c.rows = rows;
  c.defaultSort = defaultSort;
  // Angular assigns the input before it calls ngOnChanges; the panel only
  // re-seeds on an OPEN, so setting the flag is part of opening it.
  c.visible = true;
  c.ngOnChanges({ visible: new SimpleChange(false, true, true) });
}

describe('BapsTableSortConfig', () => {
  let c: BapsTableSortConfig;

  beforeEach(() => {
    c = TestBed.createComponent(BapsTableSortConfig).componentInstance;
  });

  describe('seeding', () => {
    it('copies the incoming rows rather than aliasing them', () => {
      const rows: BapsTableSortRow[] = [{ field: 'location', direction: 1 }];
      open(c, rows, undefined);
      c.flip(c.draft[0]);
      expect(rows[0].direction).toBe(1);
    });

    it('appends the locked default as the lowest-priority row', () => {
      open(c, [{ field: 'location', direction: 1 }], DEFAULT_SORT);
      expect(c.draft.map((r) => r.field)).toEqual(['location', 'name']);
      expect(c.draft[1].locked).toBe(true);
    });

    it('does not duplicate a locked row that is already in the incoming order', () => {
      open(c, [{ field: 'name', direction: -1, locked: true }], DEFAULT_SORT);
      expect(c.draft.length).toBe(1);
      expect(c.draft[0].direction).toBe(-1);
    });

    it('leaves the order empty when there is no default sort', () => {
      open(c, [], undefined);
      expect(c.draft).toEqual([]);
    });

    it('re-seeds when the parent hands it a new order', () => {
      open(c, [{ field: 'location', direction: 1 }], undefined);
      c.rows = [{ field: 'karyakars', direction: -1 }];
      c.ngOnChanges({ rows: new SimpleChange(null, c.rows, false) });
      expect(c.draft.map((r) => r.field)).toEqual(['karyakars']);
    });

    it('does not re-seed on an unrelated change, so a draft survives a parent re-render', () => {
      open(c, [{ field: 'location', direction: 1 }], undefined);
      c.flip(c.draft[0]);
      c.ngOnChanges({ header: new SimpleChange('Sort', 'Sort by', false) });
      expect(c.draft[0].direction).toBe(-1);
    });
  });

  describe('row labels', () => {
    it('reads as a sentence: Sort by, then by', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: 1 },
      ]);
      expect(c.rowLabel(c.draft[0], 0)).toBe('Sort by');
      expect(c.rowLabel(c.draft[1], 1)).toBe('then by');
    });

    it('calls a locked row Default wherever it sits', () => {
      open(c, [{ field: 'location', direction: 1 }], DEFAULT_SORT);
      expect(c.rowLabel(c.draft[1], 1)).toBe('Default');
      c.move(c.draft[1], -1);
      expect(c.rowLabel(c.draft[0], 0)).toBe('Default');
    });
  });

  describe('adding fields', () => {
    it('adds ahead of the locked row, so a deliberate sort outranks the tie-breaker', () => {
      open(c, [], DEFAULT_SORT);
      c.addField('location');
      expect(c.draft.map((r) => r.field)).toEqual(['location', 'name']);
    });

    it('appends when there is no locked row', () => {
      open(c, [{ field: 'location', direction: 1 }]);
      c.addField('karyakars');
      expect(c.draft.map((r) => r.field)).toEqual(['location', 'karyakars']);
    });

    it('adds ascending', () => {
      open(c, []);
      c.addField('location');
      expect(c.draft[0].direction).toBe(1);
    });

    it('ignores a field already in the order', () => {
      open(c, [{ field: 'location', direction: -1 }]);
      c.addField('location');
      expect(c.draft.length).toBe(1);
      expect(c.draft[0].direction).toBe(-1);
    });

    it('reports which fields are used, which is what disables a chip', () => {
      open(c, [{ field: 'location', direction: 1 }]);
      expect(c.isUsed('location')).toBe(true);
      expect(c.isUsed('karyakars')).toBe(false);
    });
  });

  describe('per-row select options', () => {
    it('offers the unused fields plus the row own value', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: 1 },
      ]);
      expect(c.optionsFor(c.draft[0]).map((f) => f.key)).toEqual(['name', 'location']);
    });

    it('offers every field to a row that has none', () => {
      open(c, [{ field: null, direction: 1 }]);
      expect(c.optionsFor(c.draft[0]).map((f) => f.key)).toEqual(['name', 'location', 'karyakars']);
    });
  });

  describe('direction', () => {
    it('flips both ways', () => {
      open(c, [{ field: 'location', direction: 1 }]);
      c.flip(c.draft[0]);
      expect(c.draft[0].direction).toBe(-1);
      c.flip(c.draft[0]);
      expect(c.draft[0].direction).toBe(1);
    });

    it('flips a locked row too — locked means unremovable, not frozen', () => {
      open(c, [], DEFAULT_SORT);
      c.flip(c.draft[0]);
      expect(c.draft[0].direction).toBe(-1);
    });
  });

  describe('removal', () => {
    it('removes an ordinary row', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: 1 },
      ]);
      c.remove(c.draft[0]);
      expect(c.draft.map((r) => r.field)).toEqual(['karyakars']);
    });

    it('refuses to remove the locked row', () => {
      open(c, [], DEFAULT_SORT);
      c.remove(c.draft[0]);
      expect(c.draft.length).toBe(1);
    });

    it('re-inserts the default when the last ordinary row goes, so the table keeps an order', () => {
      open(c, [{ field: 'location', direction: 1 }], DEFAULT_SORT);
      c.remove(c.draft[0]);
      expect(c.draft.map((r) => r.field)).toEqual(['name']);
      expect(c.draft[0].locked).toBe(true);
    });
  });

  describe('reordering', () => {
    it('moves a row up and down with the keyboard', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: 1 },
      ]);
      c.move(c.draft[1], -1);
      expect(c.draft.map((r) => r.field)).toEqual(['karyakars', 'location']);
      c.move(c.draft[0], 1);
      expect(c.draft.map((r) => r.field)).toEqual(['location', 'karyakars']);
    });

    it('stops at the ends rather than wrapping', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: 1 },
      ]);
      c.move(c.draft[0], -1);
      c.move(c.draft[1], 1);
      expect(c.draft.map((r) => r.field)).toEqual(['location', 'karyakars']);
    });

    it('reorders on drop', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: 1 },
        { field: 'name', direction: 1 },
      ]);
      const dragged = c.draft[2];
      c.onDragStart(dragged);
      c.onDrop(c.draft[0]);
      expect(c.draft.map((r) => r.field)).toEqual(['name', 'location', 'karyakars']);
    });

    it('ignores a drop on the dragged row itself', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: 1 },
      ]);
      c.onDragStart(c.draft[0]);
      c.onDrop(c.draft[0]);
      expect(c.draft.map((r) => r.field)).toEqual(['location', 'karyakars']);
    });

    it('lets the locked row be dragged out of last place', () => {
      open(c, [{ field: 'location', direction: 1 }], DEFAULT_SORT);
      c.onDragStart(c.draft[1]);
      c.onDrop(c.draft[0]);
      expect(c.draft.map((r) => r.field)).toEqual(['name', 'location']);
    });
  });

  describe('reset', () => {
    it('drops back to the default sort alone', () => {
      open(c, [
        { field: 'location', direction: 1 },
        { field: 'karyakars', direction: -1 },
      ], DEFAULT_SORT);
      c.resetDefault();
      expect(c.draft.map((r) => r.field)).toEqual(['name']);
    });

    it('clears the order entirely when there is no default', () => {
      open(c, [{ field: 'location', direction: 1 }]);
      c.resetDefault();
      expect(c.draft).toEqual([]);
    });
  });

  describe('apply', () => {
    it('emits the order and closes', () => {
      open(c, [{ field: 'location', direction: 1 }], DEFAULT_SORT);
      const emitted: BapsTableSortRow[][] = [];
      const visibility: boolean[] = [];
      c.sortChange.subscribe((r) => emitted.push(r));
      c.visibleChange.subscribe((v) => visibility.push(v));
      c.apply();
      expect(emitted[0].map((r) => r.field)).toEqual(['location', 'name']);
      expect(visibility).toEqual([false]);
    });

    it('drops rows that never got a field', () => {
      open(c, [
        { field: null, direction: 1 },
        { field: 'location', direction: 1 },
      ]);
      const emitted: BapsTableSortRow[][] = [];
      c.sortChange.subscribe((r) => emitted.push(r));
      c.apply();
      expect(emitted[0].map((r) => r.field)).toEqual(['location']);
    });

    it('emits copies, so the consumer array is not the draft', () => {
      open(c, [{ field: 'location', direction: 1 }]);
      let emitted: BapsTableSortRow[] = [];
      c.sortChange.subscribe((r) => (emitted = r));
      c.apply();
      c.flip(c.draft[0]);
      expect(emitted[0].direction).toBe(1);
    });

    it('does not emit a sort when the drawer is merely dismissed', () => {
      open(c, [{ field: 'location', direction: 1 }]);
      const emitted: BapsTableSortRow[][] = [];
      const closed: number[] = [];
      c.sortChange.subscribe((r) => emitted.push(r));
      c.closed.subscribe(() => closed.push(1));
      c.onVisibleChange(false);
      expect(emitted).toEqual([]);
      expect(closed.length).toBe(1);
    });
  });
});
