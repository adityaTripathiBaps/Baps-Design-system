import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TreeNode } from 'primeng/api';
import { TreeTable } from 'primeng/treetable';

import { BapsTreeTable, type BapsTreeRowNode } from './tree-table.component';

/**
 * `baps-tree-table` wraps `p-treeTable`. PrimeNG owns the hierarchy, the
 * sorting and the paging; this wrapper owns three things that break
 * silently.
 *
 * 1. **Five outputs are re-emitted by hand**, one template binding each.
 *    Delete or mistype one and the tree still renders, still expands, still
 *    sorts — the consumer's handler just never fires.
 *
 * 2. **`toggle()` exists because `p-treeTableToggler` cannot be used from a
 *    forwarded template.** It has to do all three parts of the toggler's own
 *    job: flip `expanded`, emit on the PrimeNG instance (not on this
 *    wrapper's Output, or the caller would see the event twice), and
 *    re-serialise so the row list actually changes. Skip the re-serialise
 *    and the model is right while the table on screen does not move.
 *
 * 3. **`isLeaf` decides which rows get a toggler at all.** Returning the
 *    wrong answer gives a childless row a chevron that does nothing, or
 *    hides the chevron on a row that has children.
 */
const TREE: TreeNode[] = [
  {
    key: 'a',
    data: { name: 'Alpha' },
    children: [{ key: 'a1', data: { name: 'Alpha one' } }],
  },
  { key: 'b', data: { name: 'Beta' }, children: [] },
  { key: 'c', data: { name: 'Gamma' } },
];

@Component({
  standalone: true,
  imports: [BapsTreeTable],
  template: `
    <baps-tree-table
      [value]="value()"
      [dataKey]="dataKey()"
      [loading]="loading()"
      [sortField]="sortField()"
      [sortOrder]="sortOrder()"
      [styleClass]="styleClass()"
      [brand]="brand()"
      (nodeExpand)="log('nodeExpand', $event)"
      (nodeCollapse)="log('nodeCollapse', $event)"
      (sortEvent)="log('sortEvent', $event)"
      (lazyLoad)="log('lazyLoad', $event)"
      (selectionChange)="log('selectionChange', $event)"
    />
  `,
})
class Host {
  // A fresh copy per fixture: several tests mutate `expanded` on a node, and
  // the nodes would otherwise carry that state into the next test. (JSON
  // rather than structuredClone, which this jsdom environment does not have;
  // TREE is plain data, so the round trip is lossless.)
  readonly value = signal<TreeNode[]>(JSON.parse(JSON.stringify(TREE)));
  readonly dataKey = signal<string | undefined>('key');
  readonly loading = signal(false);
  readonly sortField = signal<string | undefined>(undefined);
  readonly sortOrder = signal(1);
  readonly styleClass = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly seen: Array<[string, unknown]> = [];

  log(name: string, payload: unknown): void {
    this.seen.push([name, payload]);
  }
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

const hostEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('baps-tree-table') as HTMLElement;

const wrapper = (fixture: { debugElement: { children: Array<{ componentInstance: unknown }> } }) =>
  fixture.debugElement.children[0].componentInstance as BapsTreeTable;

const prime = (fixture: {
  debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof TreeTable)
    .componentInstance as TreeTable;

/** A row as PrimeNG serialises it, which is what a body template receives. */
const rowFor = (node: TreeNode, level = 0): BapsTreeRowNode => ({
  node,
  parent: null,
  level,
});

describe('BapsTreeTable', () => {
  describe('output forwarding', () => {
    const CASES: Array<[string, keyof TreeTable]> = [
      ['nodeExpand', 'onNodeExpand'],
      ['nodeCollapse', 'onNodeCollapse'],
      ['sortEvent', 'onSort'],
      ['lazyLoad', 'onLazyLoad'],
      ['selectionChange', 'selectionChange'],
    ];

    it.each(CASES)('re-emits %s from the PrimeNG tree table', async (ours, theirs) => {
      const fixture = await setup();
      const payload = { marker: ours };

      (prime(fixture)[theirs] as unknown as { emit: (v: unknown) => void }).emit(
        payload,
      );
      await fixture.whenStable();

      expect(fixture.componentInstance.seen).toContainEqual([ours, payload]);
    });
  });

  describe('toggle', () => {
    it('flips expanded and re-serialises so the rendered rows change', async () => {
      const fixture = await setup();
      const alpha = fixture.componentInstance.value()[0];
      const spy = jest.spyOn(prime(fixture), 'updateSerializedValue');

      wrapper(fixture).toggle(rowFor(alpha));
      await apply(fixture);

      expect(alpha.expanded).toBe(true);
      // Without this the model is right and the table on screen does not
      // move, which is the hardest version of this bug to spot.
      expect(spy).toHaveBeenCalled();
    });

    it('emits through PrimeNG so the caller sees one event, not two', async () => {
      const fixture = await setup();
      const alpha = fixture.componentInstance.value()[0];

      wrapper(fixture).toggle(rowFor(alpha));
      await apply(fixture);

      // Emitting on this wrapper's Output as well would double it, because
      // the (onNodeExpand) binding already forwards PrimeNG's.
      const expands = fixture.componentInstance.seen.filter(
        ([name]) => name === 'nodeExpand',
      );
      expect(expands).toHaveLength(1);
      expect(expands[0][1]).toMatchObject({ node: alpha });
    });

    it('emits a collapse on the way back', async () => {
      const fixture = await setup();
      const alpha = fixture.componentInstance.value()[0];

      wrapper(fixture).toggle(rowFor(alpha));
      await apply(fixture);
      wrapper(fixture).toggle(rowFor(alpha));
      await apply(fixture);

      expect(alpha.expanded).toBe(false);
      expect(
        fixture.componentInstance.seen.map(([name]) => name),
      ).toEqual(['nodeExpand', 'nodeCollapse']);
    });

    it('does nothing for a row with no node behind it', async () => {
      const fixture = await setup();
      // A forwarded template can hand this anything; it must not throw.
      expect(() =>
        wrapper(fixture).toggle(undefined as unknown as BapsTreeRowNode),
      ).not.toThrow();
      expect(fixture.componentInstance.seen).toEqual([]);
    });
  });

  describe('isExpanded / isLeaf', () => {
    it('reports expansion from the node, defaulting to collapsed', async () => {
      const fixture = await setup();
      const alpha = fixture.componentInstance.value()[0];
      expect(wrapper(fixture).isExpanded(rowFor(alpha))).toBe(false);

      alpha.expanded = true;
      expect(wrapper(fixture).isExpanded(rowFor(alpha))).toBe(true);
    });

    it('treats an empty children array as a leaf, same as no array', async () => {
      const fixture = await setup();
      const [alpha, beta, gamma] = fixture.componentInstance.value();

      expect(wrapper(fixture).isLeaf(rowFor(alpha))).toBe(false);
      // `children: []` and no `children` key must agree, or a childless row
      // gets a chevron that does nothing.
      expect(wrapper(fixture).isLeaf(rowFor(beta))).toBe(true);
      expect(wrapper(fixture).isLeaf(rowFor(gamma))).toBe(true);
    });

    it('survives a row with no node', async () => {
      const fixture = await setup();
      const missing = undefined as unknown as BapsTreeRowNode;
      expect(wrapper(fixture).isExpanded(missing)).toBe(false);
      expect(wrapper(fixture).isLeaf(missing)).toBe(true);
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('forwarding', () => {
    it('passes the tree and the data key through', async () => {
      const fixture = await setup();
      expect(prime(fixture).value).toBe(fixture.componentInstance.value());
      expect(prime(fixture).dataKey).toBe('key');
    });

    it('passes loading, sort and styleClass through', async () => {
      const fixture = await setup();
      fixture.componentInstance.loading.set(true);
      fixture.componentInstance.sortField.set('name');
      fixture.componentInstance.sortOrder.set(-1);
      fixture.componentInstance.styleClass.set('dense');
      await apply(fixture);

      const tree = prime(fixture);
      expect(tree.loading).toBe(true);
      expect(tree.sortField).toBe('name');
      expect(tree.sortOrder).toBe(-1);
      expect(tree.styleClass).toBe('dense');
    });
  });
});
