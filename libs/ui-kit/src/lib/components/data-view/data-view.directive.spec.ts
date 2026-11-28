import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataView } from 'primeng/dataview';
import { BapsDataView } from './data-view.directive';

@Component({
  imports: [DataView, BapsDataView],
  template: `<p-dataview bapsDataView [brand]="brand()" [value]="items" layout="list">
    <ng-template #list let-rows>
      @for (r of rows; track r) { <div class="row">{{ r }}</div> }
    </ng-template>
  </p-dataview>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly items = ['Robbinsville', 'Edison', 'Atlanta'];
}

describe('BapsDataView', () => {
  it('leaves the #list template to PrimeNG, which renders it', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect([...f.nativeElement.querySelectorAll('.row')].map((e: Element) => e.textContent)).toEqual(['Robbinsville', 'Edison', 'Atlanta']);
  });

  it('marks the Sampark brand on p-dataview', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-dataview').classList).toContain('baps-sampark');
  });
});
