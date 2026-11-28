import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedModule } from 'primeng/api';
import { BapsTimeline } from './timeline.component';

@Component({
  imports: [BapsTimeline, SharedModule],
  template: `<baps-timeline [brand]="brand()" [value]="events" align="alternate">
    <ng-template pTemplate="opposite" let-e><span class="date">{{ e.date }}</span></ng-template>
    <ng-template pTemplate="content" let-e><span class="status">{{ e.status }}</span></ng-template>
  </baps-timeline>`,
})
class Host {
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly events = [{ status: 'Created', date: '12 Nov' }, { status: 'Done', date: '26 Nov' }];
}

describe('BapsTimeline', () => {
  it('hands the content and opposite templates to PrimeNG', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    expect([...f.nativeElement.querySelectorAll('.status')].map((e: Element) => e.textContent)).toEqual(['Created', 'Done']);
    expect([...f.nativeElement.querySelectorAll('.date')].map((e: Element) => e.textContent)).toEqual(['12 Nov', '26 Nov']);
    expect(f.nativeElement.querySelector('p-timeline').classList).toContain('p-timeline-alternate');
  });

  it('marks the Sampark brand on the PrimeNG timeline', () => {
    const f = TestBed.createComponent(Host);
    f.componentInstance.brand.set('sampark');
    f.detectChanges();
    expect(f.nativeElement.querySelector('p-timeline').classList).toContain('baps-sampark');
  });
});
