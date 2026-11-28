import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule, TreeNode } from 'primeng/api';
import { OrganizationChart } from 'primeng/organizationchart';
import { BapsOrgChart } from './org-chart.directive';

@Component({
  imports: [OrganizationChart, BapsOrgChart, SharedModule],
  template: `<p-organizationchart bapsOrgChart [brand]="brand()" [value]="tree">
    <ng-template let-node pTemplate="person"><span class="person">{{ node.data }}</span></ng-template>
    <ng-template let-node pTemplate="default"><span class="plain">{{ node.label }}</span></ng-template>
  </p-organizationchart>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly tree: TreeNode[] = [{ type: 'person', data: 'Hari', expanded: true, children: [{ label: 'Edison' }] }];
}

describe('BapsOrgChart', () => {
  it("leaves PrimeNG's per-type node templates working", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.person').textContent).toBe('Hari');
    expect(f.nativeElement.querySelector('.plain').textContent).toBe('Edison');
  });

  it('marks the Sampark brand on p-organizationchart', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-organizationchart').classList).toContain('baps-sampark');
  });
});
