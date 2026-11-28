import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PickList } from 'primeng/picklist';
import { BapsPickList } from './pick-list.directive';

@Component({
  imports: [PickList, BapsPickList],
  template: `<p-picklist bapsPickList [brand]="brand()" [(source)]="source" [(target)]="target" dataKey="id" sourceHeader="Available" targetHeader="Assigned">
    <ng-template #item let-k><span class="k">{{ k.name }}</span></ng-template>
  </p-picklist>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  source = [{ id: 1, name: 'Hari' }, { id: 2, name: 'Mira' }];
  target: { id: number; name: string }[] = [];
}

describe('BapsPickList', () => {
  it("leaves PrimeNG's headers and #item template working", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const headers = [...f.nativeElement.querySelectorAll('.p-listbox-header')].map((e: Element) => e.textContent?.trim());
    expect(headers).toEqual(['Available', 'Assigned']);
    expect([...f.nativeElement.querySelectorAll('.k')].map((e: Element) => e.textContent)).toEqual(['Hari', 'Mira']);
  });

  it('marks the Sampark brand on p-picklist', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-picklist').classList).toContain('baps-sampark');
  });
});
