import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BapsNavbar } from './navbar.component';

/**
 * Two things about this bar are load-bearing and neither is visible from the
 * markup at a glance.
 *
 * **1. `menuToggle` emits the NEXT requested state, not the current one.**
 * `patterns/app-shell.mdx` flags this as the easy-to-miss binding: the handler
 * is meant to assign `$event` directly, not invert it. `baps-navbar` is a
 * controlled component — it never mutates its own `menuOpen` — so if someone
 * "fixes" the template to emit `menuOpen` instead of `!menuOpen`, every
 * consumer's sidebar quietly stops toggling while the chevron still animates.
 * Both outputs are pinned here, including the fact that repeated clicks with
 * an unchanged `[menuOpen]` keep emitting the same value.
 *
 * **2. `menuButton` gates whether the chevron exists at all.** It is an
 * `@if`, not a CSS `display`, and it defaults to `false`. A consumer wiring
 * `(menuToggle)` without `[menuButton]="true"` gets a handler that can never
 * fire — no error, no warning, just a sidebar that will not open.
 *
 * The host classes are the third piece: they are the only hooks the
 * stylesheet has for the Sampark skin, the light topbar theme, the chevron
 * rotation and the mobile actions row. All four are plain string comparisons
 * that typecheck fine when wrong.
 */
@Component({
  imports: [BapsNavbar],
  template: `
    <baps-navbar
      [brand]="brand()"
      [topbarTheme]="topbarTheme()"
      [menuButton]="menuButton()"
      [menuOpen]="menuOpen()"
      [mobileMenuOpen]="mobileMenuOpen()"
      (menuToggle)="menuEvents.push($event)"
      (mobileMenuToggle)="mobileEvents.push($event)"
    />
  `,
})
class Host {
  // Signals so runtime input changes work under the zoneless test env.
  readonly brand = signal<'mybky' | 'sampark'>('sampark');
  readonly topbarTheme = signal<'indigo' | 'light'>('indigo');
  readonly menuButton = signal(true);
  readonly menuOpen = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly menuEvents: boolean[] = [];
  readonly mobileEvents: boolean[] = [];
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

const chevron = (el: HTMLElement) =>
  el.querySelector<HTMLButtonElement>('.baps-navbar__menu-button');
const mobileButton = (el: HTMLElement) =>
  el.querySelector<HTMLButtonElement>('.baps-navbar__mobile-button')!;
const hostEl = (el: HTMLElement) => el.querySelector('baps-navbar')!;

describe('BapsNavbar', () => {
  describe('menuToggle emits the requested NEXT state', () => {
    it('emits true while closed', async () => {
      const fixture = await setup();
      chevron(fixture.nativeElement)!.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.menuEvents).toEqual([true]);
    });

    it('emits false while open', async () => {
      const fixture = await setup();
      fixture.componentInstance.menuOpen.set(true);
      await fixture.whenStable();
      chevron(fixture.nativeElement)!.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.menuEvents).toEqual([false]);
    });

    it('keeps emitting the same value while [menuOpen] does not change', async () => {
      // The component is controlled — it holds no internal open state, so two
      // clicks without the consumer writing back both request `true`.
      const fixture = await setup();
      chevron(fixture.nativeElement)!.click();
      chevron(fixture.nativeElement)!.click();
      await fixture.whenStable();
      expect(fixture.componentInstance.menuEvents).toEqual([true, true]);
    });

    it('follows the consumer round-trip when the value is written back', async () => {
      const fixture = await setup();
      const host = fixture.componentInstance;
      chevron(fixture.nativeElement)!.click();
      await fixture.whenStable();
      host.menuOpen.set(host.menuEvents[0]); // assign directly, never invert
      await fixture.whenStable();
      chevron(fixture.nativeElement)!.click();
      await fixture.whenStable();
      expect(host.menuEvents).toEqual([true, false]);
    });

    it('mirrors menuOpen into the chevron aria state', async () => {
      const fixture = await setup();
      expect(chevron(fixture.nativeElement)!.getAttribute('aria-expanded')).toBe('false');
      expect(chevron(fixture.nativeElement)!.getAttribute('aria-label')).toBe('Expand menu');
      fixture.componentInstance.menuOpen.set(true);
      await fixture.whenStable();
      expect(chevron(fixture.nativeElement)!.getAttribute('aria-expanded')).toBe('true');
      expect(chevron(fixture.nativeElement)!.getAttribute('aria-label')).toBe('Collapse menu');
    });
  });

  describe('menuButton gating', () => {
    it('does not render the chevron at all by default', async () => {
      @Component({
        imports: [BapsNavbar],
        template: `<baps-navbar brand="sampark" (menuToggle)="fired = true" />`,
      })
      class DefaultHost {
        fired = false;
      }
      const fixture = TestBed.createComponent(DefaultHost);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(chevron(fixture.nativeElement)).toBeNull();
      expect(fixture.componentInstance.fired).toBe(false);
    });

    it('adds and removes the chevron as menuButton flips at runtime', async () => {
      const fixture = await setup();
      expect(chevron(fixture.nativeElement)).not.toBeNull();
      fixture.componentInstance.menuButton.set(false);
      await fixture.whenStable();
      expect(chevron(fixture.nativeElement)).toBeNull();
    });
  });

  describe('mobileMenuToggle', () => {
    it('also emits the requested next state and is always rendered', async () => {
      const fixture = await setup();
      mobileButton(fixture.nativeElement).click();
      await fixture.whenStable();
      fixture.componentInstance.mobileMenuOpen.set(true);
      await fixture.whenStable();
      mobileButton(fixture.nativeElement).click();
      await fixture.whenStable();
      expect(fixture.componentInstance.mobileEvents).toEqual([true, false]);
    });
  });

  describe('host classes (§40 — both brands)', () => {
    it('applies baps-sampark only for brand="sampark"', async () => {
      const fixture = await setup();
      const el = hostEl(fixture.nativeElement);
      expect(el.classList.contains('baps-sampark')).toBe(true);
      fixture.componentInstance.brand.set('mybky');
      await fixture.whenStable();
      expect(el.classList.contains('baps-sampark')).toBe(false);
    });

    it('applies baps-navbar-topbar-light only for topbarTheme="light"', async () => {
      const fixture = await setup();
      const el = hostEl(fixture.nativeElement);
      expect(el.classList.contains('baps-navbar-topbar-light')).toBe(false);
      fixture.componentInstance.topbarTheme.set('light');
      await fixture.whenStable();
      expect(el.classList.contains('baps-navbar-topbar-light')).toBe(true);
    });

    it('tracks menuOpen with baps-navbar-menu-open (the chevron rotation hook)', async () => {
      const fixture = await setup();
      const el = hostEl(fixture.nativeElement);
      expect(el.classList.contains('baps-navbar-menu-open')).toBe(false);
      fixture.componentInstance.menuOpen.set(true);
      await fixture.whenStable();
      expect(el.classList.contains('baps-navbar-menu-open')).toBe(true);
    });

    it('tracks mobileMenuOpen with baps-navbar-mobile-open', async () => {
      const fixture = await setup();
      const el = hostEl(fixture.nativeElement);
      expect(el.classList.contains('baps-navbar-mobile-open')).toBe(false);
      fixture.componentInstance.mobileMenuOpen.set(true);
      await fixture.whenStable();
      expect(el.classList.contains('baps-navbar-mobile-open')).toBe(true);
    });
  });
});
