import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'primeng/api';
import type { ScrollerOptions } from 'primeng/api';
import { Table } from 'primeng/table';

import { BapsTable } from './table.component';

/**
 * `baps-table` had no spec, and it is the component the most screens depend on.
 *
 * It is a thin wrapper over `p-table`: inputs are forwarded, outputs are
 * re-emitted, and one host class carries the brand. PrimeNG's own sorting,
 * paging and selection are covered upstream and are not retested here.
 *
 * What IS pinned is the wrapper's own contract, which is the part that breaks
 * silently:
 *
 * - **Seven outputs are re-emitted by hand**, one template binding each
 *   (`(onSort)="sortEvent.emit($event)"` and so on). Delete or mistype one and
 *   the table still renders, still sorts, still pages — the consumer's handler
 *   just never fires. Nothing errors. Each is asserted by emitting from the
 *   PrimeNG instance and checking ours arrives with the same payload.
 *
 * - **The brand is a host class**, so losing it loses the entire Sampark skin
 *   with no error.
 */
@Component({
  standalone: true,
  imports: [BapsTable],
  template: `
    <baps-table
      [value]="value()"
      [brand]="brand()"
      [styleClass]="styleClass()"
      [virtualScroll]="virtualScroll()"
      [virtualScrollDelay]="virtualScrollDelay()"
      [virtualScrollOptions]="virtualScrollOptions()"
      [keepScrollPosition]="keepScrollPosition()"
      [reorderableColumns]="reorderableColumns()"
      (sortEvent)="log('sort', $event)"
      (pageEvent)="log('page', $event)"
      (rowSelect)="log('rowSelect', $event)"
      (rowUnselect)="log('rowUnselect', $event)"
      (lazyLoad)="log('lazyLoad', $event)"
      (selectionChange)="log('selectionChange', $event)"
      (firstChange)="log('firstChange', $event)"
      (colReorder)="log('colReorder', $event)"
    />
  `,
})
class Host {
  readonly value = signal<Array<{ id: number; name: string }>>([
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
  ]);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly styleClass = signal<string | undefined>(undefined);
  readonly virtualScroll = signal(false);
  readonly virtualScrollDelay = signal(0);
  readonly virtualScrollOptions = signal<ScrollerOptions | undefined>(
    undefined,
  );
  readonly keepScrollPosition = signal(false);
  readonly reorderableColumns = signal(false);
  readonly seen: Array<[string, unknown]> = [];

  log(name: string, payload: unknown): void {
    this.seen.push([name, payload]);
  }
}

@Component({
  standalone: true,
  imports: [BapsTable, SharedModule],
  template: `
    <baps-table
      [value]="value"
      rowGroupMode="subheader"
      groupRowsBy="location"
      [collapsibleGroups]="true"
      [collapsedGroupKeys]="collapsedGroupKeys"
      (collapsedGroupKeysChange)="onCollapsedGroupKeysChange($event)"
    >
      <ng-template
        pTemplate="groupheader"
        let-row
        let-collapsed="collapsed"
        let-toggleGroup="toggleGroup"
      >
        <tr class="group-header">
          <td>
            <button
              type="button"
              [attr.aria-expanded]="!collapsed"
              (click)="toggleGroup()"
            >
              {{ row.location }}
            </button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr class="member-row">
          <td>{{ row.name }}</td>
        </tr>
      </ng-template>
    </baps-table>
  `,
})
class GroupHost {
  readonly value = [
    { location: 'North', name: 'North one' },
    { location: 'South', name: 'South one' },
  ];
  collapsedGroupKeys: readonly string[] = ['South'];
  readonly seen: string[][] = [];

  onCollapsedGroupKeysChange(keys: string[]): void {
    this.collapsedGroupKeys = keys;
    this.seen.push(keys);
  }
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('BapsTable', () => {
  afterEach(() => jest.useRealTimers());

  describe('output forwarding', () => {
    // name on baps-table -> name on p-table. Every row is a separate hand
    // written binding in the template, so every row can rot on its own.
    const CASES: Array<[string, keyof Table]> = [
      ['sort', 'onSort'],
      ['page', 'onPage'],
      ['rowSelect', 'onRowSelect'],
      ['rowUnselect', 'onRowUnselect'],
      ['lazyLoad', 'onLazyLoad'],
      ['selectionChange', 'selectionChange'],
      ['firstChange', 'firstChange'],
      ['colReorder', 'onColReorder'],
    ];

    it.each(CASES)('re-emits %s from the PrimeNG table', async (ours, theirs) => {
      const fixture = await setup();
      const prime = fixture.debugElement.query(
        (de) => de.componentInstance instanceof Table,
      ).componentInstance as Table;

      const payload = { marker: ours };
      (prime[theirs] as { emit: (v: unknown) => void }).emit(payload);
      await fixture.whenStable();

      expect(fixture.componentInstance.seen).toContainEqual([ours, payload]);
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark, including at runtime', async () => {
      const fixture = await setup();
      const host = (fixture.nativeElement as HTMLElement).querySelector(
        'baps-table',
      )!;
      expect(host.classList.contains('baps-sampark')).toBe(false);

      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      fixture.detectChanges();
      expect(host.classList.contains('baps-sampark')).toBe(true);
    });
  });

  describe('computedStyleClass', () => {
    it('is the empty string rather than undefined when styleClass is unset', async () => {
      const fixture = await setup();
      const cmp = fixture.debugElement.children[0]
        .componentInstance as BapsTable;
      // PrimeNG concatenates this into a class attribute, so undefined would
      // render the literal text "undefined" as a class name.
      expect(cmp.computedStyleClass).toBe('');
    });

    it('passes a caller-supplied styleClass straight through', async () => {
      const fixture = await setup();
      fixture.componentInstance.styleClass.set('dense');
      await fixture.whenStable();

      const cmp = fixture.debugElement.children[0]
        .componentInstance as BapsTable;
      expect(cmp.computedStyleClass).toBe('dense');
    });
  });

  describe('value', () => {
    it('forwards rows to the PrimeNG table', async () => {
      const fixture = await setup();
      const prime = fixture.debugElement.query(
        (de) => de.componentInstance instanceof Table,
      ).componentInstance as Table;

      expect(prime.value).toEqual([
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Beta' },
      ]);
    });
  });

  describe('virtual scrolling', () => {
    it('forwards delay, reorder and caller scroller options', async () => {
      const fixture = await setup();
      const options: ScrollerOptions = { autoSize: true, delay: 40 };
      fixture.componentInstance.virtualScrollDelay.set(25);
      fixture.componentInstance.virtualScrollOptions.set(options);
      fixture.componentInstance.reorderableColumns.set(true);
      await fixture.whenStable();

      const prime = fixture.debugElement.query(
        (de) => de.componentInstance instanceof Table,
      ).componentInstance as Table;
      expect(prime.virtualScrollDelay).toBe(25);
      expect(prime.virtualScrollOptions).toBe(options);
      expect(prime.reorderableColumns).toBe(true);
    });

    it('disables auto-size while preserving the caller options when scroll position is kept', async () => {
      const fixture = await setup();
      fixture.componentInstance.virtualScrollOptions.set({
        delay: 40,
        autoSize: true,
      });
      fixture.componentInstance.keepScrollPosition.set(true);
      await fixture.whenStable();

      const component = fixture.debugElement.children[0]
        .componentInstance as BapsTable;
      expect(component.resolvedVirtualScrollOptions).toEqual({
        delay: 40,
        autoSize: false,
      });
    });

    it('resets a virtual viewport on value replacement by default', async () => {
      const fixture = await setup();
      const prime = fixture.debugElement.query(
        (de) => de.componentInstance instanceof Table,
      ).componentInstance as Table;
      const reset = jest.spyOn(prime, 'resetScrollTop').mockImplementation();
      jest.useFakeTimers();

      fixture.componentInstance.virtualScroll.set(true);
      fixture.componentInstance.value.set([{ id: 3, name: 'Gamma' }]);
      fixture.detectChanges();
      jest.runOnlyPendingTimers();

      expect(reset).toHaveBeenCalledTimes(1);
    });

    it('does not reset a virtual viewport when keepScrollPosition is enabled', async () => {
      const fixture = await setup();
      const prime = fixture.debugElement.query(
        (de) => de.componentInstance instanceof Table,
      ).componentInstance as Table;
      const reset = jest.spyOn(prime, 'resetScrollTop').mockImplementation();
      jest.useFakeTimers();

      fixture.componentInstance.virtualScroll.set(true);
      fixture.componentInstance.keepScrollPosition.set(true);
      fixture.componentInstance.value.set([{ id: 3, name: 'Gamma' }]);
      fixture.detectChanges();
      jest.runOnlyPendingTimers();

      expect(reset).not.toHaveBeenCalled();
    });
  });

  describe('collapsible groups', () => {
    it('keeps group headers, hides collapsed members and toggles from the template context', async () => {
      const fixture = TestBed.createComponent(GroupHost);
      fixture.detectChanges();
      await fixture.whenStable();

      const text = () =>
        (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text()).toContain('North one');
      expect(text()).not.toContain('South one');

      const south = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ].find((button) => button.textContent?.trim() === 'South');
      expect(south?.getAttribute('aria-expanded')).toBe('false');
      south?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(text()).toContain('South one');
      expect(fixture.componentInstance.seen).toEqual([[]]);
      expect(south?.getAttribute('aria-expanded')).toBe('true');
    });
  });
});
