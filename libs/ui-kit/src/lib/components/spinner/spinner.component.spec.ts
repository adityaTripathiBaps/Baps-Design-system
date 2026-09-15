import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsSpinner } from './spinner.component';

/**
 * Two things carry real weight here.
 *
 * The first is the determinate/indeterminate split, because a single unset
 * input flips the ARIA contract as well as the drawing: `role="status"` with
 * no value versus `role="progressbar"` with a full valuenow/min/max triple.
 * Get that wrong and a screen reader either announces a percentage that does
 * not exist or silently drops the one that does — and the ring looks
 * identical either way.
 *
 * The second is the dash geometry, which is the only place the arc length
 * lives. `stroke-dashoffset` is inverted (offset = remaining), so an
 * off-by-one-direction bug renders 25% as a 75% ring and still animates
 * happily.
 */
@Component({
  imports: [BapsSpinner],
  template: `<baps-spinner [value]="value" [size]="size" [brand]="brand" [ariaLabel]="ariaLabel" />`,
})
class Host {
  value?: number;
  size: 'small' | 'large' = 'large';
  brand: 'mybky' | 'sampark' = 'mybky';
  ariaLabel = 'Loading';
}

async function host(overrides: Partial<Host> = {}): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return (fixture.nativeElement as HTMLElement).querySelector('baps-spinner')!;
}

const CIRCUMFERENCE = 2 * Math.PI * 14;

describe('BapsSpinner mode switching', () => {
  it('is indeterminate with role=status when value is unset', async () => {
    const el = await host({ value: undefined });
    expect(el.getAttribute('role')).toBe('status');
    expect(el.classList.contains('baps-spinner-indeterminate')).toBe(true);
    // A progressbar with no valuenow is worse than no progressbar.
    expect(el.getAttribute('aria-valuenow')).toBeNull();
    expect(el.getAttribute('aria-valuemin')).toBeNull();
    expect(el.getAttribute('aria-valuemax')).toBeNull();
  });

  it('is determinate with the full value triple when value is set', async () => {
    const el = await host({ value: 40 });
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.classList.contains('baps-spinner-indeterminate')).toBe(false);
    expect(el.getAttribute('aria-valuenow')).toBe('40');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
  });

  it('treats value=0 as determinate, not as "unset"', async () => {
    // The falsy-zero trap: 0% progress is a real reading.
    const el = await host({ value: 0 });
    expect(el.getAttribute('role')).toBe('progressbar');
    expect(el.getAttribute('aria-valuenow')).toBe('0');
  });

  it('flips back to indeterminate when value is cleared at runtime', async () => {
    @Component({
      imports: [BapsSpinner],
      template: `<baps-spinner [value]="value()" />`,
    })
    class SignalHost {
      readonly value = signal<number | undefined>(60);
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const el = (fixture.nativeElement as HTMLElement).querySelector('baps-spinner')!;
    expect(el.getAttribute('role')).toBe('progressbar');

    fixture.componentInstance.value.set(undefined);
    await fixture.whenStable();
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-valuenow')).toBeNull();
  });
});

describe('BapsSpinner arc geometry', () => {
  const arc = (el: HTMLElement) => el.querySelector('.baps-spinner-arc')!;

  it('draws a quarter arc with no offset when indeterminate', async () => {
    const a = arc(await host({ value: undefined }));
    expect(a.getAttribute('stroke-dasharray')).toBe(`${CIRCUMFERENCE / 4} ${CIRCUMFERENCE}`);
    expect(a.getAttribute('stroke-dashoffset')).toBe('0');
  });

  it.each([
    [0, CIRCUMFERENCE],
    [25, CIRCUMFERENCE * 0.75],
    [50, CIRCUMFERENCE * 0.5],
    [100, 0],
  ])('renders %i%% as dashoffset %f (offset is the *remaining* arc)', async (value, expected) => {
    const a = arc(await host({ value }));
    expect(a.getAttribute('stroke-dasharray')).toBe(`${CIRCUMFERENCE}`);
    expect(Number(a.getAttribute('stroke-dashoffset'))).toBeCloseTo(expected, 6);
  });

  it.each([
    [-20, 0],
    [140, 100],
  ])('clamps an out-of-range value %i to %i', async (value, expected) => {
    // Unclamped, a negative value produces a dashoffset past the
    // circumference and the arc wraps into a second lap.
    const el = await host({ value });
    expect(el.getAttribute('aria-valuenow')).toBe(String(expected));
    expect(Number(arc(el).getAttribute('stroke-dashoffset'))).toBeCloseTo(
      (CIRCUMFERENCE * (100 - expected)) / 100,
      6,
    );
  });
});

describe('BapsSpinner brand and size classes', () => {
  it('emits no brand class for the default mybky brand', async () => {
    expect((await host({ brand: 'mybky' })).classList.contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await host({ brand: 'sampark' })).classList.contains('baps-sampark')).toBe(true);
  });

  it('emits .baps-spinner-small only for the 24px step', async () => {
    expect((await host({ size: 'small' })).classList.contains('baps-spinner-small')).toBe(true);
    expect((await host({ size: 'large' })).classList.contains('baps-spinner-small')).toBe(false);
  });
});

describe('BapsSpinner accessible name', () => {
  it('defaults to a usable name rather than an unlabelled graphic', async () => {
    expect((await host()).getAttribute('aria-label')).toBe('Loading');
  });

  it('takes a caller-supplied name', async () => {
    expect((await host({ ariaLabel: 'Uploading photos' })).getAttribute('aria-label')).toBe(
      'Uploading photos',
    );
  });

  it('hides the svg from the accessibility tree so the name is not doubled', async () => {
    const svg = (await host()).querySelector('.baps-spinner-svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
