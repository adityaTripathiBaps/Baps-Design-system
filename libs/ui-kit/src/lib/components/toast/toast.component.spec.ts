import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

import { BapsToast } from './toast.component';

/**
 * `baps-toast` wraps `p-toast`. PrimeNG owns the queue, the timers and the
 * markup; this wrapper owns the brand, which it cannot carry the usual way.
 *
 * **The brand rides on `styleClass`, not a host class.** The toast container
 * is portalled out of this host, so a `[class.baps-sampark]` host binding —
 * how every non-portalling wrapper here does it — never reaches the element
 * that renders. Losing it drops the whole Sampark skin with no error, and
 * the toast still appears, which is why nobody notices.
 *
 * `preventDuplicates` is also pinned, because it is the input that stops a
 * retry loop announcing the same failure on every attempt: the container is
 * a live region, so a duplicate is literally read out twice.
 */
@Component({
  standalone: true,
  imports: [BapsToast],
  template: `
    <baps-toast
      [key]="key()"
      [position]="position()"
      [life]="life()"
      [preventOpenDuplicates]="preventOpenDuplicates()"
      [preventDuplicates]="preventDuplicates()"
      [autoZIndex]="autoZIndex()"
      [baseZIndex]="baseZIndex()"
      [styleClass]="styleClass()"
      [brand]="brand()"
    />
  `,
})
class Host {
  readonly key = signal<string | undefined>(undefined);
  readonly position = signal<
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'
    | 'center'
  >('top-right');
  readonly life = signal(4000);
  readonly preventOpenDuplicates = signal(false);
  readonly preventDuplicates = signal(false);
  readonly autoZIndex = signal(true);
  readonly baseZIndex = signal(0);
  readonly styleClass = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

async function setup() {
  // p-toast injects MessageService; without it the component cannot be
  // created at all.
  TestBed.configureTestingModule({ providers: [MessageService] });

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

const prime = (fixture: {
  debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof Toast)
    .componentInstance as Toast;

describe('BapsToast', () => {
  describe('brand', () => {
    it('is empty for mybky, so the container inherits the preset', async () => {
      const fixture = await setup();
      expect(prime(fixture).styleClass).toBe('');
    });

    it('carries the Sampark scope onto the portalled container', async () => {
      const fixture = await setup();
      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);

      expect(prime(fixture).styleClass).toContain('baps-ds-sampark');
      expect(prime(fixture).styleClass).toContain('baps-toast-sampark');
    });

    it('appends a caller styleClass after the brand class', async () => {
      const fixture = await setup();
      fixture.componentInstance.brand.set('sampark');
      fixture.componentInstance.styleClass.set('dense');
      await apply(fixture);

      expect(prime(fixture).styleClass).toBe(
        'baps-ds-sampark baps-toast-sampark dense',
      );
    });

    it('passes a caller styleClass alone when the brand is mybky', async () => {
      const fixture = await setup();
      fixture.componentInstance.styleClass.set('dense');
      await apply(fixture);
      // No leading space: the empty brand class is filtered, not joined.
      expect(prime(fixture).styleClass).toBe('dense');
    });
  });

  describe('duplicates', () => {
    it('allows duplicates by default', async () => {
      const fixture = await setup();
      expect(prime(fixture).preventDuplicates).toBe(false);
      expect(prime(fixture).preventOpenDuplicates).toBe(false);
    });

    it('forwards both duplicate guards independently', async () => {
      const fixture = await setup();
      fixture.componentInstance.preventDuplicates.set(true);
      await apply(fixture);
      expect(prime(fixture).preventDuplicates).toBe(true);
      expect(prime(fixture).preventOpenDuplicates).toBe(false);

      fixture.componentInstance.preventOpenDuplicates.set(true);
      await apply(fixture);
      // Two different rules — one collapses against the whole history, the
      // other only against what is on screen — so neither may stand in for
      // the other.
      expect(prime(fixture).preventOpenDuplicates).toBe(true);
    });
  });

  describe('forwarding', () => {
    it('passes key, position and life through', async () => {
      const fixture = await setup();
      fixture.componentInstance.key.set('global');
      fixture.componentInstance.position.set('bottom-center');
      fixture.componentInstance.life.set(8000);
      await apply(fixture);

      const toast = prime(fixture);
      expect(toast.key).toBe('global');
      expect(toast.position).toBe('bottom-center');
      expect(toast.life).toBe(8000);
    });

    it('passes the z-index inputs through', async () => {
      const fixture = await setup();
      fixture.componentInstance.autoZIndex.set(false);
      fixture.componentInstance.baseZIndex.set(5000);
      await apply(fixture);

      expect(prime(fixture).autoZIndex).toBe(false);
      expect(prime(fixture).baseZIndex).toBe(5000);
    });

    it('defaults to a 4s toast at the top right', async () => {
      const fixture = await setup();
      expect(prime(fixture).position).toBe('top-right');
      expect(prime(fixture).life).toBe(4000);
    });
  });
});
