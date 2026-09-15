import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsDrawer, BapsDrawerPosition } from './drawer.component';

/**
 * The wrapper's whole job is what happens at the PrimeNG boundary, and every
 * failure mode there is silent.
 *
 * **Two-way `visible`.** `onVisibleChange` writes PrimeNG's close back onto
 * the local field *and* re-emits it, deliberately in TypeScript rather than
 * as a `[(visible)]` plus a second `(visibleChange)` listener on the same
 * element (see the component's own note). Drop either half and the drawer
 * still opens — it just never tells the consumer it closed, so `[(visible)]`
 * desyncs and the next open is a no-op.
 *
 * **Header / footer templates.** PrimeNG finds those with `@ContentChild`,
 * which resolves against the *declaration* tree — a consumer's
 * `<ng-template pTemplate="footer">` written inside `<baps-drawer>` would
 * never be found. That is why this wrapper declares both templates itself and
 * projects `[drawer-actions]` / `[drawer-footer]` into them. Same class of
 * boundary bug as `components/template-forwarding.spec.ts` covers for
 * listbox/table, so it is asserted the same way: the projected node has to
 * land inside PrimeNG's own `.p-drawer-header` / `.p-drawer-footer`, not just
 * somewhere in the DOM.
 *
 * **Brand.** The panel is portalled out of the host, so the host class cannot
 * reach it — the Sampark opt-in has to ride on PrimeNG's `styleClass`, and it
 * must not eat a consumer's own class while doing so.
 */
@Component({
  imports: [BapsDrawer],
  template: `
    <baps-drawer
      [(visible)]="visible"
      [position]="position()"
      [brand]="brand()"
      [styleClass]="styleClass()"
      header="Filters"
    >
      <div drawer-actions><button type="button" class="my-action">Apply</button></div>
      <p class="my-body">body</p>
      <div drawer-footer><span class="my-footer">24 of 180</span></div>
    </baps-drawer>
  `,
})
class Host {
  readonly visible = signal(true);
  readonly position = signal<BapsDrawerPosition>('right');
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly styleClass = signal<string | undefined>(undefined);
}

async function setup(overrides: Partial<Record<'position' | 'brand' | 'styleClass', string>> = {}) {
  const fixture = TestBed.createComponent(Host);
  const host = fixture.componentInstance;
  if (overrides.position) host.position.set(overrides.position as BapsDrawerPosition);
  if (overrides.brand) host.brand.set(overrides.brand as 'mybky' | 'sampark');
  if (overrides.styleClass) host.styleClass.set(overrides.styleClass);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

// The panel is portalled — PrimeNG moves/renders it outside this component's
// own subtree — so everything is queried off document.body, never
// fixture.nativeElement.
const panel = () => document.querySelector('.p-drawer');

describe('BapsDrawer', () => {
  describe('visible two-way binding', () => {
    it('renders the panel when visible starts true', async () => {
      await setup();
      expect(panel()).not.toBeNull();
      expect(document.querySelector('.p-drawer-title')!.textContent).toContain('Filters');
    });

    it('writes PrimeNG close back onto the consumer binding', async () => {
      const fixture = await setup();
      // `.p-drawer-close-button` is on the <p-button> host; the clickable
      // element is the <button> it renders.
      document.querySelector<HTMLButtonElement>('.p-drawer-close-button button')!.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.visible()).toBe(false);
    });

    it('does not render a panel while visible is false', async () => {
      const fixture = TestBed.createComponent(Host);
      fixture.componentInstance.visible.set(false);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(panel()).toBeNull();
    });
  });

  describe('position', () => {
    it.each(['left', 'right', 'top', 'bottom'] as const)(
      'passes %s through to the PrimeNG panel',
      async (position) => {
        await setup({ position });
        expect(panel()!.classList.contains(`p-drawer-${position}`)).toBe(true);
      },
    );
  });

  describe('ng-template forwarding across the PrimeNG boundary', () => {
    it('lands [drawer-actions] inside PrimeNG .p-drawer-header', async () => {
      await setup();
      const header = document.querySelector('.p-drawer-header')!;
      expect(header.querySelector('.my-action')).not.toBeNull();
      // Body content must NOT have leaked into the header slot.
      expect(header.querySelector('.my-body')).toBeNull();
    });

    it('lands [drawer-footer] inside PrimeNG .p-drawer-footer', async () => {
      await setup();
      const footer = document.querySelector('.p-drawer-footer');
      expect(footer).not.toBeNull();
      expect(footer!.querySelector('.my-footer')!.textContent).toContain('24 of 180');
    });

    it('keeps PrimeNG own close button alongside the projected actions', async () => {
      // The skin reorders the header with CSS rather than replacing it, so the
      // shipped close button (and its aria-label / focus-trap wiring) survives.
      await setup();
      const close = document.querySelector('.p-drawer-close-button button');
      expect(close).not.toBeNull();
      expect(close!.getAttribute('aria-label')).toBe('Close');
    });

    it('puts default-slot content in the content region, not header or footer', async () => {
      await setup();
      expect(document.querySelector('.p-drawer-content')!.querySelector('.my-body')).not.toBeNull();
    });
  });

  describe('brand scoping (§40 — both brands)', () => {
    it('adds baps-drawer-sampark to the portalled panel for sampark', async () => {
      await setup({ brand: 'sampark' });
      expect(panel()!.classList.contains('baps-drawer-sampark')).toBe(true);
    });

    it('adds nothing to the panel for mybky', async () => {
      await setup();
      expect(panel()!.classList.contains('baps-drawer-sampark')).toBe(false);
    });

    it('preserves a consumer styleClass alongside the scope class', async () => {
      await setup({ brand: 'sampark', styleClass: 'my-panel' });
      const classList = panel()!.classList;
      expect(classList.contains('my-panel')).toBe(true);
      expect(classList.contains('baps-drawer-sampark')).toBe(true);
    });

    it('emits the baps-sampark host class only for sampark', async () => {
      const fixture = await setup();
      const host = (fixture.nativeElement as HTMLElement).querySelector('baps-drawer')!;
      expect(host.classList.contains('baps-sampark')).toBe(false);
      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      expect(host.classList.contains('baps-sampark')).toBe(true);
    });
  });
});
