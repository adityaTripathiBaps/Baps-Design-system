import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsMenuItem } from './menu-item.component';

/**
 * `baps-menu-item` renders no PrimeNG. It is a `<div>` carrying a role, a
 * tabindex and three keyboard handlers — which is to say it is a control
 * built out of a non-control element, and every way that goes wrong is
 * invisible.
 *
 * 1. **The role follows `control`.** A checkbox row announced as a plain
 *    `menuitem` loses its checked state entirely: `aria-checked` is only
 *    meaningful on `menuitemcheckbox` / `menuitemradio`, so the two getters
 *    have to agree. A row that looks ticked and is announced as unticked is
 *    the exact failure.
 *
 * 2. **Space must be prevented.** On a focusable div, Space scrolls the
 *    page. Without `$event.preventDefault()` choosing an item with the
 *    keyboard also jumps the page behind the menu.
 *
 * 3. **`disabled` must block activation AND focus.** `activate()` guards the
 *    emit, and `tabindex` goes to null so Tab skips the row. Either half
 *    alone leaves a dead row that still answers the keyboard, or a live row
 *    that looks dead.
 */
@Component({
  standalone: true,
  imports: [BapsMenuItem],
  template: `
    <baps-menu-item
      [title]="title()"
      [subtitle]="subtitle()"
      [control]="control()"
      [checked]="checked()"
      [media]="media()"
      [icon]="icon()"
      [severity]="severity()"
      [selected]="selected()"
      [disabled]="disabled()"
      [brand]="brand()"
      (activated)="count = count + 1"
    />
  `,
})
class Host {
  readonly title = signal<string | undefined>('Duplicate');
  readonly subtitle = signal<string | undefined>(undefined);
  readonly control = signal<'none' | 'checkbox' | 'radio'>('none');
  readonly checked = signal(false);
  readonly media = signal<'none' | 'icon' | 'avatar'>('none');
  readonly icon = signal<string | undefined>(undefined);
  readonly severity = signal<'default' | 'danger'>('default');
  readonly selected = signal(false);
  readonly disabled = signal(false);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  count = 0;
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

const row = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('.menu-item') as HTMLElement;

describe('BapsMenuItem', () => {
  describe('role and aria-checked', () => {
    it('is a plain menuitem with no checked state when control is none', async () => {
      const fixture = await setup();
      expect(row(fixture).getAttribute('role')).toBe('menuitem');
      // null, not "false": a plain menu item has no checked state to report,
      // and "false" would announce one that does not exist.
      expect(row(fixture).hasAttribute('aria-checked')).toBe(false);
    });

    it.each([
      ['checkbox', 'menuitemcheckbox'],
      ['radio', 'menuitemradio'],
    ] as const)('maps control=%s to role=%s, with a checked state', async (
      control,
      role,
    ) => {
      const fixture = await setup();
      fixture.componentInstance.control.set(control);
      await apply(fixture);

      expect(row(fixture).getAttribute('role')).toBe(role);
      // The two getters have to move together — aria-checked means nothing
      // on a plain menuitem.
      expect(row(fixture).getAttribute('aria-checked')).toBe('false');

      fixture.componentInstance.checked.set(true);
      await apply(fixture);
      expect(row(fixture).getAttribute('aria-checked')).toBe('true');
    });
  });

  describe('activation', () => {
    it('emits on click', async () => {
      const fixture = await setup();
      row(fixture).click();
      await apply(fixture);
      expect(fixture.componentInstance.count).toBe(1);
    });

    it('emits on Enter', async () => {
      const fixture = await setup();
      row(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      await apply(fixture);
      expect(fixture.componentInstance.count).toBe(1);
    });

    it('emits on Space and prevents the page from scrolling', async () => {
      const fixture = await setup();
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      row(fixture).dispatchEvent(event);
      await apply(fixture);

      expect(fixture.componentInstance.count).toBe(1);
      // On a focusable div, Space scrolls. Without this, choosing an item by
      // keyboard also jumps the page behind the open menu.
      expect(event.defaultPrevented).toBe(true);
    });

    it('emits nothing at all when disabled, by any route', async () => {
      const fixture = await setup();
      fixture.componentInstance.disabled.set(true);
      await apply(fixture);

      row(fixture).click();
      row(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      row(fixture).dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
      );
      await apply(fixture);

      expect(fixture.componentInstance.count).toBe(0);
    });
  });

  describe('disabled', () => {
    it('takes the row out of the tab order and says so', async () => {
      const fixture = await setup();
      expect(row(fixture).getAttribute('tabindex')).toBe('0');

      fixture.componentInstance.disabled.set(true);
      await apply(fixture);

      // Both halves: unreachable by Tab, and announced as disabled rather
      // than silently skipped.
      expect(row(fixture).hasAttribute('tabindex')).toBe(false);
      expect(row(fixture).getAttribute('aria-disabled')).toBe('true');
      expect(row(fixture).classList).toContain('menu-item--disabled');
    });

    it('sets no aria-disabled when enabled', async () => {
      const fixture = await setup();
      expect(row(fixture).hasAttribute('aria-disabled')).toBe(false);
    });
  });

  describe('modifier classes', () => {
    it('adds selected, danger and two-line only when earned', async () => {
      const fixture = await setup();
      const classes = () => [...row(fixture).classList];
      expect(classes()).not.toContain('menu-item--selected');
      expect(classes()).not.toContain('menu-item--danger');
      expect(classes()).not.toContain('menu-item--two-line');

      fixture.componentInstance.selected.set(true);
      fixture.componentInstance.severity.set('danger');
      fixture.componentInstance.subtitle.set('Makes a copy');
      await apply(fixture);

      expect(classes()).toContain('menu-item--selected');
      expect(classes()).toContain('menu-item--danger');
      // Driven by the subtitle's presence, not by an input of its own, so
      // the row's height always matches what it actually renders.
      expect(classes()).toContain('menu-item--two-line');
    });
  });

  describe('content', () => {
    it('renders the title, and the subtitle only when given', async () => {
      const fixture = await setup();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.menu-item__title')?.textContent?.trim()).toBe(
        'Duplicate',
      );
      expect(el.querySelector('.menu-item__subtitle')).toBeNull();

      fixture.componentInstance.subtitle.set('Makes a copy');
      await apply(fixture);
      expect(
        el.querySelector('.menu-item__subtitle')?.textContent?.trim(),
      ).toBe('Makes a copy');
    });

    it('hides the decorative bar and the control from assistive technology', async () => {
      const fixture = await setup();
      fixture.componentInstance.control.set('checkbox');
      await apply(fixture);

      const el = fixture.nativeElement as HTMLElement;
      // The tick is drawn; the state is carried by aria-checked on the row.
      // Announcing the graphic too would say it twice.
      expect(el.querySelector('.menu-item__bar')?.getAttribute('aria-hidden')).toBe('true');
      expect(
        el.querySelector('.menu-item__control')?.getAttribute('aria-hidden'),
      ).toBe('true');
    });

    it('renders a PrimeIcons glyph when one is named', async () => {
      const fixture = await setup();
      fixture.componentInstance.media.set('icon');
      fixture.componentInstance.icon.set('pi-copy');
      await apply(fixture);

      const icon = fixture.nativeElement.querySelector(
        '.menu-item__icon',
      ) as HTMLElement;
      expect(icon.classList).toContain('pi');
      expect(icon.classList).toContain('pi-copy');
    });
  });
});
