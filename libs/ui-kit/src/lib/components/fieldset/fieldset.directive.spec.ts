import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Fieldset } from 'primeng/fieldset';
import { BapsFieldset } from './fieldset.directive';

@Component({
  imports: [Fieldset, BapsFieldset],
  template: `<p-fieldset bapsFieldset [brand]="brand()" [toggleable]="true">
    <ng-template #header><span class="legend">Patel family</span></ng-template>
    <p class="body">Body</p>
  </p-fieldset>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

describe('BapsFieldset', () => {
  it("leaves PrimeNG's #header template and projected content working", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect(f.nativeElement.querySelector('.legend').textContent).toBe('Patel family');
    expect(f.nativeElement.querySelector('.body').textContent).toBe('Body');
  });

  it('marks the Sampark brand on p-fieldset', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-fieldset').classList).toContain('baps-sampark');
  });
});
