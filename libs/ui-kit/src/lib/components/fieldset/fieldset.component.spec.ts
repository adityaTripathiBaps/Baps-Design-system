import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'primeng/api';
import { BapsFieldset } from './fieldset.component';

@Component({
  imports: [BapsFieldset, SharedModule],
  template: `<baps-fieldset [brand]="brand()" [toggleable]="true" [(collapsed)]="folded">
    <ng-template pTemplate="header"><span class="legend">Patel family</span></ng-template>
    <p class="body">Body</p>
  </baps-fieldset>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  folded = false;
}

describe('BapsFieldset', () => {
  it('hands the header template to PrimeNG and projects the content', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.p-fieldset-legend .legend').textContent).toBe('Patel family');
    expect(f.nativeElement.querySelector('.p-fieldset-content .body').textContent).toBe('Body');
  });

  it('two-way binds collapsed when the legend toggles', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    (f.nativeElement.querySelector('.p-fieldset-legend button') as HTMLElement).click();
    f.detectChanges();
    expect(f.componentInstance.folded).toBe(true);
  });

  it('marks the Sampark brand on the PrimeNG fieldset', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-fieldset').classList).toContain('baps-sampark');
  });
});
