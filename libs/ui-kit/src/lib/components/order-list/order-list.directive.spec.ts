import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrderList } from 'primeng/orderlist';
import { BapsOrderList } from './order-list.directive';

@Component({
  imports: [OrderList, BapsOrderList],
  template: `<p-orderlist bapsOrderList [brand]="brand()" [value]="steps" dataKey="id">
    <ng-template #header>Visit steps</ng-template>
    <ng-template #item let-s><span class="step">{{ s.name }}</span></ng-template>
  </p-orderlist>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly steps = [{ id: 1, name: 'Welcome' }, { id: 2, name: 'Notes' }];
}

describe('BapsOrderList', () => {
  it("leaves PrimeNG's #header and #item templates working", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.p-listbox-header').textContent).toContain('Visit steps');
    expect([...f.nativeElement.querySelectorAll('.step')].map((e: Element) => e.textContent)).toEqual(['Welcome', 'Notes']);
  });

  it('marks the Sampark brand on p-orderlist', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-orderlist').classList).toContain('baps-sampark');
  });
});
