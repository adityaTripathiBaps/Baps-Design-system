import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SharedModule } from 'primeng/api';
import { OrderList } from 'primeng/orderlist';
import { BapsOrderList } from './order-list.component';

@Component({
  imports: [BapsOrderList, SharedModule],
  template: `<baps-orderlist [brand]="brand()" [value]="steps" dataKey="id" [(selection)]="picked">
    <ng-template pTemplate="header">Visit steps</ng-template>
    <ng-template pTemplate="item" let-s><span class="step">{{ s.name }}</span></ng-template>
  </baps-orderlist>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly steps = [{ id: 1, name: 'Welcome' }, { id: 2, name: 'Notes' }];
  picked: unknown[] = [];
}

async function render(configure: (h: Host) => void = () => undefined) {
  const f = TestBed.createComponent(Host);
  configure(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}

describe('BapsOrderList', () => {
  it('hands the header and item templates to PrimeNG', async () => {
    const f = await render();
    expect(f.nativeElement.querySelector('.p-listbox-header').textContent).toContain('Visit steps');
    expect([...f.nativeElement.querySelectorAll('.step')].map((e: Element) => e.textContent)).toEqual(['Welcome', 'Notes']);
  });

  it("keeps PrimeNG's defaults for unset inputs", async () => {
    const p = (await render()).debugElement.query(By.directive(OrderList)).componentInstance as any;
    expect(p.breakpoint).toBe('960px');
    expect(p.scrollHeight).toBe('14rem');
    expect(p.controlsPosition).toBe('left');
  });

  it('marks the Sampark brand on the PrimeNG orderlist', async () => {
    const f = await render((h) => h.brand.set('sampark'));
    expect(f.nativeElement.querySelector('p-orderlist').classList).toContain('baps-sampark');
  });
});
