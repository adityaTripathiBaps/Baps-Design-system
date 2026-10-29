import { TestBed } from '@angular/core/testing';
import { BapsOverlayBadge } from './overlay-badge.component';

/**
 * PrimeNG's OverlayBadge forwards no design tokens to its inner p-badge, so
 * the Sampark skin keys entirely off the host class this input sets.
 */
describe('BapsOverlayBadge', () => {
  it('defaults to mybky and stamps no Sampark class', async () => {
    const fixture = TestBed.createComponent(BapsOverlayBadge);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.brand).toBe('mybky');
    expect(
      (fixture.nativeElement as HTMLElement).classList.contains('baps-sampark'),
    ).toBe(false);
  });

  it('stamps baps-sampark on the host for brand="sampark"', async () => {
    const fixture = TestBed.createComponent(BapsOverlayBadge);
    fixture.componentRef.setInput('brand', 'sampark');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).classList.contains('baps-sampark'),
    ).toBe(true);
  });
});
