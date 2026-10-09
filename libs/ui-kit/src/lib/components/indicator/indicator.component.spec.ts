import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  BapsIndicator,
  type BapsIndicatorSeverity,
  type BapsIndicatorSize,
} from './indicator.component';

/**
 * `baps-indicator` has no PrimeNG under it and no template to speak of — the
 * whole component is a computed host class string and one accessibility
 * decision. Both fail silently.
 *
 * 1. **`hostClasses` is a `[class]` binding**, which REPLACES the host's
 *    class list rather than adding to it. Every size, severity and modifier
 *    rule in the stylesheet keys off a name produced here, so one wrong
 *    template literal and the marker renders as an unstyled empty span with
 *    no error.
 *
 * 2. **The dot is silent unless it is given a name.** A status dot beside a
 *    label that already says "Active" would otherwise be read twice; a count
 *    badge with no label would be read as a bare number with no context. So
 *    `ariaLabel` drives `role="status"` on the host AND removes
 *    `aria-hidden` from the inner span — two bindings that have to agree, or
 *    the component is announced as an empty live region.
 */
@Component({
  standalone: true,
  imports: [BapsIndicator],
  template: `
    <baps-indicator
      [severity]="severity()"
      [size]="size()"
      [disabled]="disabled()"
      [text]="text()"
      [ring]="ring()"
      [ariaLabel]="ariaLabel()"
      >{{ content() }}</baps-indicator
    >
  `,
})
class Host {
  readonly severity = signal<BapsIndicatorSeverity>('error');
  readonly size = signal<BapsIndicatorSize>('m');
  readonly disabled = signal(false);
  readonly text = signal(false);
  readonly ring = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly content = signal('');
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
  fixture.nativeElement.querySelector('baps-indicator') as HTMLElement;

const innerEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('.baps-indicator__inner') as HTMLElement;

describe('BapsIndicator', () => {
  describe('hostClasses', () => {
    it('always carries a size and a severity class, at the defaults', async () => {
      const fixture = await setup();
      const classes = [...hostEl(fixture).classList];
      expect(classes).toContain('baps-indicator--m');
      expect(classes).toContain('baps-indicator--error');
    });

    it.each(['s', 'm', 'l', 'xl'] as const)('maps size %s', async (size) => {
      const fixture = await setup();
      fixture.componentInstance.size.set(size);
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain(`baps-indicator--${size}`);
    });

    it.each([
      'primary',
      'info',
      'success',
      'warning',
      'error',
      'grey',
    ] as const)('maps severity %s', async (severity) => {
      const fixture = await setup();
      fixture.componentInstance.severity.set(severity);
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain(
        `baps-indicator--${severity}`,
      );
    });

    it('adds each modifier only when its input is on', async () => {
      const fixture = await setup();
      const classes = () => [...hostEl(fixture).classList];
      expect(classes()).not.toContain('baps-indicator--disabled');
      expect(classes()).not.toContain('baps-indicator--text');
      expect(classes()).not.toContain('baps-indicator--ring');

      fixture.componentInstance.disabled.set(true);
      fixture.componentInstance.text.set(true);
      fixture.componentInstance.ring.set(true);
      await apply(fixture);

      expect(classes()).toContain('baps-indicator--disabled');
      expect(classes()).toContain('baps-indicator--text');
      expect(classes()).toContain('baps-indicator--ring');
    });

    it('leaves no empty class name behind when the modifiers are off', async () => {
      const fixture = await setup();
      // The getter joins on a space after filtering, so a dropped filter
      // would produce "baps-indicator--m  baps-indicator--error" and an
      // empty token in the list.
      expect([...hostEl(fixture).classList].every(Boolean)).toBe(true);
      expect(hostEl(fixture).className).not.toMatch(/\s{2}/);
    });
  });

  describe('accessibility', () => {
    it('is silent by default: no role, and the content hidden', async () => {
      const fixture = await setup();
      // A dot beside a label that already reads "Active" must not say it
      // again, and a decorative marker has nothing to announce.
      expect(hostEl(fixture).hasAttribute('role')).toBe(false);
      expect(hostEl(fixture).hasAttribute('aria-label')).toBe(false);
      expect(innerEl(fixture).getAttribute('aria-hidden')).toBe('true');
    });

    it('becomes a named live region once ariaLabel is set', async () => {
      const fixture = await setup();
      fixture.componentInstance.ariaLabel.set('3 unread');
      fixture.componentInstance.content.set('3');
      await apply(fixture);

      expect(hostEl(fixture).getAttribute('role')).toBe('status');
      expect(hostEl(fixture).getAttribute('aria-label')).toBe('3 unread');
      // Both halves have to move together: a named host whose content is
      // still aria-hidden is announced as an empty live region.
      expect(innerEl(fixture).hasAttribute('aria-hidden')).toBe(false);
    });

    it('goes back to silent when the label is removed', async () => {
      const fixture = await setup();
      fixture.componentInstance.ariaLabel.set('3 unread');
      await apply(fixture);
      fixture.componentInstance.ariaLabel.set(undefined);
      await apply(fixture);

      expect(hostEl(fixture).hasAttribute('role')).toBe(false);
      expect(innerEl(fixture).getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('content', () => {
    it('projects children into the inner span', async () => {
      const fixture = await setup();
      fixture.componentInstance.content.set('3');
      await apply(fixture);
      expect(innerEl(fixture).textContent?.trim()).toBe('3');
    });
  });
});
