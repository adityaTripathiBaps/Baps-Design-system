import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsAccordionWrapper } from './accordion-wrapper.component';
import { BapsAccordionPanel } from './accordion-panel.component';

/**
 * SPM dev filter sections paint a 0 count on the neutral 4% ink tint and only a
 * non-zero count on the primary tint. The kit marks the zero badge with a
 * modifier class; the Sampark partial keys the neutral fill on it.
 */
@Component({
  imports: [BapsAccordionWrapper, BapsAccordionPanel],
  template: `
    <baps-accordion brand="sampark" [multiple]="true" [value]="[]">
      <baps-accordion-panel value="a" label="Empty" [count]="0">A</baps-accordion-panel>
      <baps-accordion-panel value="b" label="Three" [count]="3">B</baps-accordion-panel>
      <baps-accordion-panel value="c" label="Text zero" count="0">C</baps-accordion-panel>
    </baps-accordion>
  `,
})
class HostComponent {}

describe('BapsAccordionWrapper count badge', () => {
  it('marks only a zero count with baps-accordion-count--zero', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const badges = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.baps-accordion-count')];
    expect(badges.map((b) => b.textContent!.trim())).toEqual(['0', '3', '0']);
    expect(badges.map((b) => b.classList.contains('baps-accordion-count--zero'))).toEqual([true, false, true]);
  });
});
