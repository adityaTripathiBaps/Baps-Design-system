import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsInputText } from './input-text.directive';
import { BapsTextarea } from './textarea.directive';

/**
 * The brand class has to land on the field ITSELF: spm-ui sets no page scope,
 * and a bare [bapsInputText] has no Sampark ancestor to inherit the skin from.
 * _input-sampark.scss matches `.p-inputtext.baps-sampark` for exactly this.
 */
@Component({
  imports: [BapsInputText, BapsTextarea],
  template: `
    <input bapsInputText [brand]="brand()" />
    <textarea bapsTextarea [brand]="brand()"></textarea>
  `,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

describe('BapsInputText / BapsTextarea brand', () => {
  it('stamps baps-sampark on the field itself for sampark only', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLElement;
    const area = fixture.nativeElement.querySelector('textarea') as HTMLElement;
    expect(input.classList.contains('baps-sampark')).toBe(false);
    expect(area.classList.contains('baps-sampark')).toBe(false);

    fixture.componentInstance.brand.set('sampark');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(input.classList.contains('baps-sampark')).toBe(true);
    expect(area.classList.contains('baps-sampark')).toBe(true);
    // PrimeNG's own class survives next to it.
    expect(input.classList.contains('p-inputtext')).toBe(true);
  });
});
