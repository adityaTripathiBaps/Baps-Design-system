import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

import { BapsBreadcrumb } from './breadcrumb.component';

/**
 * `baps-breadcrumb` forwards four inputs to `p-breadcrumb` and carries the
 * Sampark skin as one host class. PrimeNG owns the trail itself.
 *
 * `home` is declared without the `@Input()` decorator and registered through
 * the `inputs:` array instead, because the decorated signature trips TS1272
 * under `isolatedModules`. That makes it the one input whose wiring is not
 * visible at its declaration, so it is the one most likely to be dropped by
 * a refactor — and a dropped `home` just renders a trail with no root.
 */
@Component({
  standalone: true,
  imports: [BapsBreadcrumb],
  template: `
    <baps-breadcrumb
      [model]="model()"
      [home]="home()"
      [style]="style()"
      [styleClass]="styleClass()"
      [brand]="brand()"
    />
  `,
})
class Host {
  readonly model = signal<MenuItem[]>([
    { label: 'Events', routerLink: '/events' },
    { label: 'Registrations' },
  ]);
  readonly home = signal<MenuItem | undefined>(undefined);
  readonly style = signal<Record<string, string | number> | undefined>(
    undefined,
  );
  readonly styleClass = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

async function setup() {
  // A breadcrumb item is a routerLink in every real use, and PrimeNG renders
  // RouterLink for one — which needs ActivatedRoute. Testing with plain urls
  // instead would sidestep the directive the component actually renders.
  TestBed.configureTestingModule({ providers: [provideRouter([])] });

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
  fixture.nativeElement.querySelector('baps-breadcrumb') as HTMLElement;

const prime = (fixture: {
  debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof Breadcrumb)
    .componentInstance as Breadcrumb;

describe('BapsBreadcrumb', () => {
  describe('model', () => {
    it('forwards the trail to PrimeNG in order', async () => {
      const fixture = await setup();
      expect(prime(fixture).model).toEqual([
        { label: 'Events', routerLink: '/events' },
        { label: 'Registrations' },
      ]);
    });

    it('forwards an empty trail rather than substituting one', async () => {
      const fixture = await setup();
      fixture.componentInstance.model.set([]);
      await apply(fixture);
      expect(prime(fixture).model).toEqual([]);
    });
  });

  describe('home', () => {
    it('is undefined until set — no root is invented', async () => {
      const fixture = await setup();
      expect(prime(fixture).home).toBeUndefined();
    });

    it('reaches PrimeNG even though it is registered through inputs:', async () => {
      const fixture = await setup();
      const home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
      fixture.componentInstance.home.set(home);
      await apply(fixture);
      // The one input with no decorator at its declaration, so the one a
      // refactor can silently drop.
      expect(prime(fixture).home).toBe(home);
    });
  });

  describe('aria-current', () => {
    const links = (fixture: { nativeElement: HTMLElement }) =>
      [...fixture.nativeElement.querySelectorAll('.p-breadcrumb-item-link')] as HTMLElement[];

    it('marks the last crumb as the current page, and only the last', async () => {
      const fixture = await setup();
      const marked = links(fixture).map((a) => a.getAttribute('aria-current'));

      // The last crumb IS the page you are on. Without aria-current a
      // screen reader reads the whole trail as a row of ordinary links and
      // never says which one is here — the styling that makes it obvious to
      // a sighted reader carries nothing.
      expect(marked).toEqual([null, 'page']);
    });

    it('moves the mark when the trail changes', async () => {
      const fixture = await setup();
      fixture.componentInstance.model.set([
        { label: 'Events', routerLink: '/events' },
        { label: 'Registrations', routerLink: '/events/1' },
        { label: 'Payment' },
      ]);
      await apply(fixture);

      expect(links(fixture).map((a) => a.getAttribute('aria-current'))).toEqual([
        null,
        null,
        'page',
      ]);
    });

    it('marks nothing when the trail is empty', async () => {
      const fixture = await setup();
      fixture.componentInstance.model.set([]);
      await apply(fixture);
      expect(links(fixture)).toEqual([]);
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      // The entire Sampark breadcrumb — transparent background, slash
      // separator, bold last item — is scoped to this class.
      expect(hostEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('forwarding', () => {
    it('passes style and styleClass through', async () => {
      const fixture = await setup();
      fixture.componentInstance.style.set({ margin: '0' });
      fixture.componentInstance.styleClass.set('dense');
      await apply(fixture);

      expect(prime(fixture).style).toEqual({ margin: '0' });
      expect(prime(fixture).styleClass).toBe('dense');
    });
  });
});
