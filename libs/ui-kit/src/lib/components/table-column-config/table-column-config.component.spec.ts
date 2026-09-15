import { SimpleChange } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsTableColumnConfig, BapsTableColumnConfigColumn } from './table-column-config.component';

/**
 * Unit-level, not DOM-level: the panel body renders inside `baps-drawer`,
 * which portals its content through PrimeNG's Drawer/CDK overlay stack when
 * `appendTo="body"` (this component's own default) — asserting through that
 * stack would test PrimeNG's overlay mechanics, not the partition/search/
 * reorder/pin logic that's actually first-party here and actually changed
 * this session (keyboard reorder, most of the rest pre-existing). Every
 * method under test (`toggleColumn`, `togglePin`, `moveRegular`,
 * `resetDefault`, `apply`, the `visible*` getters) is `public`, so calling
 * them directly is the component's real API, not a white-box shortcut.
 */
function columns(): BapsTableColumnConfigColumn[] {
  return [
    { key: 'name', label: 'Template Name', locked: true, visible: true },
    { key: 'project', label: 'Project', visible: true, group: 'Meta' },
    { key: 'scope', label: 'Scope', visible: true, group: 'Meta' },
    { key: 'status', label: 'Status', visible: false, group: 'State' },
    { key: 'actions', label: 'Actions', locked: true, end: true, visible: true },
  ];
}

function open(component: BapsTableColumnConfig, cols: BapsTableColumnConfigColumn[]): void {
  component.columns = cols;
  component.ngOnChanges({ visible: new SimpleChange(false, true, true) });
}

describe('BapsTableColumnConfig', () => {
  let component: BapsTableColumnConfig;

  beforeEach(() => {
    component = TestBed.createComponent(BapsTableColumnConfig).componentInstance;
  });

  describe('partitioning on open', () => {
    it('splits locked-start, locked-end, pinned and regular into separate buckets', () => {
      open(component, columns());
      expect(component.visibleLockedStart.map((c) => c.key)).toEqual(['name']);
      expect(component.visibleLockedEnd.map((c) => c.key)).toEqual(['actions']);
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['project', 'scope', 'status']);
      expect(component.visiblePinned).toEqual([]);
    });

    it('clones columns rather than sharing references with the input array', () => {
      const source = columns();
      open(component, source);
      component.toggleColumn(component.visibleRegular[0]);
      // The consumer's original array must be untouched until Apply.
      expect(source[1].visible).toBe(true);
    });

    it('resets search and the active-only filter every time it opens', () => {
      open(component, columns());
      component.searchQuery = 'sco';
      component.showActiveOnly = true;
      open(component, columns());
      expect(component.searchQuery).toBe('');
      expect(component.showActiveOnly).toBe(false);
    });

    it('does nothing on a change that is not visible turning true', () => {
      open(component, columns());
      const before = component.visibleRegular.map((c) => c.key);
      component.ngOnChanges({ allowPin: new SimpleChange(true, false, false) });
      expect(component.visibleRegular.map((c) => c.key)).toEqual(before);
    });
  });

  describe('search + active-only filtering', () => {
    beforeEach(() => open(component, columns()));

    it('filters every bucket by label, case-insensitively', () => {
      component.searchQuery = 'SCO';
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['scope']);
      expect(component.visibleLockedStart).toEqual([]); // "Template Name" doesn't match
    });

    it('an empty (whitespace) query matches everything', () => {
      component.searchQuery = '   ';
      expect(component.visibleRegular.length).toBe(3);
    });

    it('active-only hides columns whose visible is false', () => {
      component.showActiveOnly = true;
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['project', 'scope']);
    });

    it('search and active-only compose (both must pass)', () => {
      component.showActiveOnly = true;
      component.searchQuery = 'status';
      expect(component.visibleRegular).toEqual([]); // status matches search but is hidden
    });

    it('activeCount counts locked columns unconditionally and others only when visible', () => {
      // locked: name + actions = 2 (always on) + project/scope visible = 2, status hidden = 0
      expect(component.activeCount).toBe(4);
    });
  });

  describe('toggleColumn', () => {
    beforeEach(() => open(component, columns()));

    it('flips visibility on a regular column', () => {
      const status = component.visibleRegular.find((c) => c.key === 'status')!;
      expect(status.visible).toBe(false);
      component.toggleColumn(status);
      expect(status.visible).toBe(true);
    });

    it('is a no-op on a locked column', () => {
      const name = component.visibleLockedStart[0];
      component.toggleColumn(name);
      expect(name.visible).toBe(true); // unchanged, still visible
    });
  });

  describe('togglePin', () => {
    beforeEach(() => open(component, columns()));

    it('moves a regular column into pinned, forcing it visible', () => {
      const status = component.visibleRegular.find((c) => c.key === 'status')!;
      component.togglePin(status, false);
      expect(component.visiblePinned.map((c) => c.key)).toEqual(['status']);
      expect(component.visibleRegular.some((c) => c.key === 'status')).toBe(false);
      expect(status.frozen).toBe(true);
      expect(status.visible).toBe(true); // pinning also unhides it
    });

    it('moves a pinned column back to regular on unpin', () => {
      const status = component.visibleRegular.find((c) => c.key === 'status')!;
      component.togglePin(status, false);
      component.togglePin(status, true);
      expect(component.visiblePinned).toEqual([]);
      expect(component.visibleRegular.some((c) => c.key === 'status')).toBe(true);
      expect(status.frozen).toBe(false);
    });

    it('does nothing when allowPin is false', () => {
      component.allowPin = false;
      const project = component.visibleRegular[0];
      component.togglePin(project, false);
      expect(component.visiblePinned).toEqual([]);
    });

    it('does nothing on a locked column even if allowPin is true', () => {
      const name = component.visibleLockedStart[0];
      component.togglePin(name, false);
      expect(component.visiblePinned).toEqual([]);
    });
  });

  describe('moveRegular (keyboard reorder)', () => {
    beforeEach(() => open(component, columns()));

    it('swaps a column with its neighbour within the same group', () => {
      const project = component.visibleRegular.find((c) => c.key === 'project')!;
      component.moveRegular(project, 1);
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['scope', 'project', 'status']);
    });

    it('clamps at the top of the list', () => {
      const project = component.visibleRegular[0];
      component.moveRegular(project, -1);
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['project', 'scope', 'status']);
    });

    it('clamps at the bottom of the list', () => {
      const status = component.visibleRegular.find((c) => c.key === 'status')!;
      component.moveRegular(status, 1);
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['project', 'scope', 'status']);
    });

    it('refuses to cross a group boundary', () => {
      // scope (group "Meta") -> status (group "State") are adjacent; moving
      // scope down would cross groups and must be blocked.
      const scope = component.visibleRegular.find((c) => c.key === 'scope')!;
      component.moveRegular(scope, 1);
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['project', 'scope', 'status']);
    });

    it('is a no-op for a column not in the regular bucket', () => {
      const ghost: BapsTableColumnConfigColumn = { key: 'ghost', label: 'Ghost' };
      const before = component.visibleRegular.map((c) => c.key);
      component.moveRegular(ghost, 1);
      expect(component.visibleRegular.map((c) => c.key)).toEqual(before);
    });
  });

  describe('resetDefault', () => {
    it('reseeds from defaultColumns when provided, discarding staged edits', () => {
      const defaults = columns();
      open(component, columns());
      component.defaultColumns = defaults;
      component.togglePin(component.visibleRegular[0], false);
      component.resetDefault();
      expect(component.visiblePinned).toEqual([]);
      expect(component.visibleRegular.map((c) => c.key)).toEqual(['project', 'scope', 'status']);
    });

    it('without defaultColumns, unpins everything and shows everything', () => {
      open(component, columns());
      const status = component.visibleRegular.find((c) => c.key === 'status')!;
      component.togglePin(status, false);
      component.resetDefault();
      expect(component.visiblePinned).toEqual([]);
      // status was hidden originally; reset without defaults shows everything.
      const resetStatus = component.visibleRegular.find((c) => c.key === 'status')!;
      expect(resetStatus.visible).toBe(true);
    });
  });

  describe('apply', () => {
    it('emits the full column order (locked-start, pinned, regular, locked-end) and closes', () => {
      open(component, columns());
      const status = component.visibleRegular.find((c) => c.key === 'status')!;
      component.togglePin(status, false);

      let emitted: BapsTableColumnConfigColumn[] | undefined;
      let closed = false;
      component.columnsChange.subscribe((v) => (emitted = v));
      component.closed.subscribe(() => (closed = true));

      component.apply();

      expect(emitted!.map((c) => c.key)).toEqual(['name', 'status', 'project', 'scope', 'actions']);
      expect(component.visible).toBe(false);
      expect(closed).toBe(true);
    });

    it('does not emit closed when Apply is not called (visible stays true on open)', () => {
      let closed = false;
      component.closed.subscribe(() => (closed = true));
      open(component, columns());
      expect(closed).toBe(false);
    });
  });
});
