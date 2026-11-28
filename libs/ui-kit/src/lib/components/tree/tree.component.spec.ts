import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SharedModule, TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { BapsTree } from './tree.component';

@Component({
  imports: [BapsTree, SharedModule],
  template: `<baps-tree [brand]="brand()" [value]="nodes" selectionMode="single" [(selection)]="picked">
    <ng-template let-node pTemplate="centre"><span class="centre">{{ node.label }}</span></ng-template>
  </baps-tree>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly nodes: TreeNode[] = [{ key: 'na', label: 'North America', expanded: true, children: [{ key: 'ed', label: 'Edison', type: 'centre' }] }];
  picked: TreeNode | null = null;
}

async function render(configure: (h: Host) => void = () => undefined) {
  const f = TestBed.createComponent(Host);
  configure(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}

describe('BapsTree', () => {
  it('hands per-type node templates to PrimeNG', async () => {
    const f = await render();
    expect(f.nativeElement.querySelector('.centre').textContent).toBe('Edison');
  });

  it("keeps PrimeNG's defaults and the bapsTree attribute the brand partial keys on", async () => {
    const f = await render((h) => h.brand.set('sampark'));
    const p = f.debugElement.query(By.directive(Tree)).componentInstance as any;
    expect(p.filterBy).toBe('label');
    expect(p.indentation).toBe(1.5);
    const host: HTMLElement = f.nativeElement.querySelector('p-tree');
    expect(host.hasAttribute('bapstree')).toBe(true);
    expect(host.classList).toContain('baps-sampark');
  });

  it('two-way binds selection', async () => {
    const f = await render();
    (f.debugElement.query(By.directive(BapsTree)).componentInstance as any).onSelection({ key: 'ed', label: 'Edison' });
    expect(f.componentInstance.picked?.label).toBe('Edison');
  });
});
