import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Timeline } from 'primeng/timeline';
import { BapsTimeline } from './timeline.directive';

@Component({
  imports: [Timeline, BapsTimeline],
  template: `<p-timeline bapsTimeline [brand]="brand()" [value]="events">
    <ng-template #opposite let-e><span class="date">{{ e.date }}</span></ng-template>
    <ng-template #content let-e><span class="status">{{ e.status }}</span></ng-template>
  </p-timeline>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly events = [{ status: 'Created', date: '12 Nov' }, { status: 'Done', date: '26 Nov' }];
}

describe('BapsTimeline', () => {
  it("leaves PrimeNG's content and opposite templates working", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect([...f.nativeElement.querySelectorAll('.status')].map((e: Element) => e.textContent)).toEqual(['Created', 'Done']);
    expect([...f.nativeElement.querySelectorAll('.date')].map((e: Element) => e.textContent)).toEqual(['12 Nov', '26 Nov']);
  });

  it('marks the Sampark brand on p-timeline', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-timeline').classList).toContain('baps-sampark');
  });
});
