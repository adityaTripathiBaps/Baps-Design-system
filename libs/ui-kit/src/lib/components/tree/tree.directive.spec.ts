import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule, TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { BapsTree } from './tree.directive';

@Component({
  imports: [Tree, BapsTree, SharedModule],
  template: `<p-tree bapsTree [brand]="brand()" [value]="nodes">
    <ng-template let-node pTemplate="centre"><span class="centre">{{ node.label }}</span></ng-template>
  </p-tree>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly nodes: TreeNode[] = [{ key: 'na', label: 'North America', expanded: true, children: [{ key: 'ed', label: 'Edison', type: 'centre' }] }];
}

describe('BapsTree', () => {
  it("leaves PrimeNG's per-type node templates working", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.centre').textContent).toBe('Edison');
  });

  it('keeps the bapsTree attribute the brand partial keys on, and marks Sampark', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    const host: HTMLElement = f.nativeElement.querySelector('p-tree');
    expect(host.hasAttribute('bapstree')).toBe(true);
    expect(host.classList).toContain('baps-sampark');
  });
});
