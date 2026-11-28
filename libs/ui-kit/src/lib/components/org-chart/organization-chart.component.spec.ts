import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule, TreeNode } from 'primeng/api';
import { BapsOrganizationChart } from './organization-chart.component';

@Component({
  imports: [BapsOrganizationChart, SharedModule],
  template: `<baps-organizationchart [brand]="brand()" [value]="tree" selectionMode="single" [(selection)]="picked">
    <ng-template let-node pTemplate="person"><span class="person">{{ node.data }}</span></ng-template>
    <ng-template let-node pTemplate="default"><span class="plain">{{ node.label }}</span></ng-template>
  </baps-organizationchart>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly tree: TreeNode[] = [{ type: 'person', data: 'Hari', expanded: true, children: [{ label: 'Edison' }] }];
  picked: TreeNode | null = null;
}

describe('BapsOrganizationChart', () => {
  it("hands each per-type pTemplate to PrimeNG under its own name", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.person').textContent).toBe('Hari');
    expect(f.nativeElement.querySelector('.plain').textContent).toBe('Edison');
  });

  it('marks the Sampark brand on the PrimeNG chart, where the brand partial looks', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-organizationchart').classList).toContain('baps-sampark');
  });

  it('two-way binds selection', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    (f.nativeElement.querySelector('.plain') as HTMLElement).closest('.p-organizationchart-node')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    f.detectChanges();
    expect(f.componentInstance.picked?.label).toBe('Edison');
  });
});
