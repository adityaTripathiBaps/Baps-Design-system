import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Skeleton } from 'primeng/skeleton';

import { BapsSkeleton } from './skeleton.component';

/**
 * `baps-skeleton` forwards seven inputs to `p-skeleton` and makes one
 * accessibility decision, which is the part worth pinning.
 *
 * **`aria-hidden="true"` is unconditional on the host.** A loading screen is
 * typically a dozen of these, and announcing a dozen empty boxes tells a
 * non-sighted user nothing — the useful signal is `aria-busy` on the region
 * plus a live region when the content lands, which the consumer owns. Drop
 * the attribute and nothing looks different; a screen reader just starts
 * reading placeholder noise.
 */
@Component({
  standalone: true,
  imports: [BapsSkeleton],
  template: `
    <baps-skeleton
      [shape]="shape()"
      [size]="size()"
      [width]="width()"
      [height]="height()"
      [borderRadius]="borderRadius()"
      [animation]="animation()"
      [styleClass]="styleClass()"
      [brand]="brand()"
    />
  `,
})
class Host {
  readonly shape = signal<'rectangle' | 'circle'>('rectangle');
  readonly size = signal<string | undefined>(undefined);
  readonly width = signal('100%');
  readonly height = signal('1rem');
  readonly borderRadius = signal<string | undefined>(undefined);
  readonly animation = signal<'wave' | 'none'>('wave');
  readonly styleClass = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

const hostEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('baps-skeleton') as HTMLElement;

const prime = (fixture: {
  debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof Skeleton)
    .componentInstance as Skeleton;

describe('BapsSkeleton', () => {
  describe('accessibility', () => {
    it('hides itself from assistive technology, always', async () => {
      const fixture = await setup();
      // Unconditional on purpose — see the component's own note. The loading
      // signal belongs on the region, not on each placeholder.
      expect(hostEl(fixture).getAttribute('aria-hidden')).toBe('true');
    });

    it('stays hidden whatever the inputs do', async () => {
      const fixture = await setup();
      fixture.componentInstance.shape.set('circle');
      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      expect(hostEl(fixture).getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      // The radius token is the only thing the brand changes here — colours
      // are shared, because tinting a skeleton makes loading read as content.
      expect(hostEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('forwarding', () => {
    it('passes the geometry inputs through to PrimeNG', async () => {
      const fixture = await setup();
      fixture.componentInstance.width.set('12rem');
      fixture.componentInstance.height.set('2rem');
      fixture.componentInstance.borderRadius.set('0.5rem');
      await apply(fixture);

      const skeleton = prime(fixture);
      expect(skeleton.width).toBe('12rem');
      expect(skeleton.height).toBe('2rem');
      expect(skeleton.borderRadius).toBe('0.5rem');
    });

    it('passes shape and size through', async () => {
      const fixture = await setup();
      fixture.componentInstance.shape.set('circle');
      fixture.componentInstance.size.set('3rem');
      await apply(fixture);

      const skeleton = prime(fixture);
      expect(skeleton.shape).toBe('circle');
      // size sets width AND height at once upstream — the usual way to make
      // a square or a circle.
      expect(skeleton.size).toBe('3rem');
    });

    it('turns the shimmer off when animation is none', async () => {
      const fixture = await setup();
      expect(prime(fixture).animation).toBe('wave');

      fixture.componentInstance.animation.set('none');
      await apply(fixture);
      expect(prime(fixture).animation).toBe('none');
    });

    it('defaults to a full-width 1rem rectangle', async () => {
      const fixture = await setup();
      const skeleton = prime(fixture);
      expect(skeleton.shape).toBe('rectangle');
      expect(skeleton.width).toBe('100%');
      expect(skeleton.height).toBe('1rem');
    });
  });
});
