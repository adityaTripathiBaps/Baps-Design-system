import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'primeng/api';
import { BapsDataView } from './data-view.component';

@Component({
  imports: [BapsDataView, SharedModule],
  template: `
    <baps-dataview id="a" [brand]="brand()" [value]="items" [layout]="layout()">
      <ng-template #header><span class="hdr">Centres</span></ng-template>
      <ng-template #list let-rows>@for (r of rows; track r) { <div class="row">{{ r }}</div> }</ng-template>
      <ng-template #grid let-rows>@for (r of rows; track r) { <div class="card">{{ r }}</div> }</ng-template>
    </baps-dataview>
    <baps-dataview id="b" [value]="items">
      <ng-template pTemplate="list" let-rows>@for (r of rows; track r) { <div class="prow">{{ r }}</div> }</ng-template>
    </baps-dataview>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly layout = signal<'list' | 'grid'>('list');
  readonly items = ['Robbinsville', 'Edison'];
}

describe('BapsDataView', () => {
  it('re-declares #header and #list for PrimeNG', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const a: HTMLElement = f.nativeElement.querySelector('#a');
    expect(a.querySelector('.hdr')?.textContent).toBe('Centres');
    expect([...a.querySelectorAll('.row')].map((e) => e.textContent)).toEqual(['Robbinsville', 'Edison']);
  });

  it('switches to #grid with the layout', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.layout.set('grid');
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('#a .card').length).toBe(2);
  });

  it('accepts pTemplate="list" too', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('#b .prow').length).toBe(2);
  });

  it('marks the Sampark brand on the PrimeNG dataview', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('#a p-dataview').classList).toContain('baps-sampark');
  });
});
