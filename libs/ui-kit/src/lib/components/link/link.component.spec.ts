import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsLink } from './link.component';

/**
 * `baps-link` is one of the few components here with no PrimeNG underneath,
 * so there is no upstream behaviour to lean on — everything it does is in
 * this file's template and host bindings, and all of it fails silently.
 *
 * Three things are pinned:
 *
 * 1. **`disabled` has to mean disabled.** An `<a>` has no disabled
 *    attribute, so the component has to withhold `href`, set
 *    `aria-disabled` and take the anchor out of the tab order by hand. Miss
 *    any one and the link still looks grey and still navigates, or still
 *    answers the Tab key.
 *
 * 2. **`target="_blank"` has to carry `rel="noopener noreferrer"`.** The
 *    opened page can otherwise reach back through `window.opener`. Nothing
 *    about the rendered link looks different when it is missing.
 *
 * 3. **Variant, size and brand are host classes**, so losing one drops the
 *    whole skin for that axis with no error.
 */
@Component({
  standalone: true,
  imports: [BapsLink],
  template: `
    <baps-link
      [href]="href()"
      [target]="target()"
      [disabled]="disabled()"
      [variant]="variant()"
      [size]="size()"
      [brand]="brand()"
      >Settings</baps-link
    >
  `,
})
class Host {
  readonly href = signal<string | undefined>('/settings');
  readonly target = signal<string | undefined>(undefined);
  readonly disabled = signal(false);
  readonly variant = signal<'primary' | 'secondary'>('primary');
  readonly size = signal<'small' | 'large' | 'xlarge' | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

const hostEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('baps-link') as HTMLElement;

const anchorEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

/** Re-render after changing a host signal. */
async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('BapsLink', () => {
  describe('disabled', () => {
    it('withholds href, marks aria-disabled and leaves the tab order', async () => {
      const fixture = await setup();
      expect(anchorEl(fixture).getAttribute('href')).toBe('/settings');
      expect(anchorEl(fixture).tabIndex).toBe(0);

      fixture.componentInstance.disabled.set(true);
      await apply(fixture);

      const anchor = anchorEl(fixture);
      // No href: an anchor without one is not a link and does not navigate,
      // which is the only way to stop an <a> without intercepting the click.
      expect(anchor.hasAttribute('href')).toBe(false);
      expect(anchor.getAttribute('aria-disabled')).toBe('true');
      // -1 rather than absent: still focusable programmatically, never by Tab.
      expect(anchor.tabIndex).toBe(-1);
      expect(anchor.classList).toContain('baps-link--disabled');
    });

    it('sets no aria-disabled at all when enabled', async () => {
      const fixture = await setup();
      // `false` would be read out as a state the link has; absent is silence.
      expect(anchorEl(fixture).hasAttribute('aria-disabled')).toBe(false);
    });
  });

  describe('target', () => {
    it('adds rel="noopener noreferrer" for _blank', async () => {
      const fixture = await setup();
      fixture.componentInstance.target.set('_blank');
      await apply(fixture);

      // Without this the opened page can reach back through window.opener,
      // and nothing about the rendered link shows that it is missing.
      expect(anchorEl(fixture).getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('adds no rel for a same-tab target', async () => {
      const fixture = await setup();
      fixture.componentInstance.target.set('_self');
      await apply(fixture);
      expect(anchorEl(fixture).hasAttribute('rel')).toBe(false);
    });
  });

  describe('variant', () => {
    it('is primary by default and swaps class on change', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).toContain('baps-link--primary');
      expect(hostEl(fixture).classList).not.toContain('baps-link--secondary');

      fixture.componentInstance.variant.set('secondary');
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain('baps-link--secondary');
      expect(hostEl(fixture).classList).not.toContain('baps-link--primary');
    });
  });

  describe('size', () => {
    it.each([
      ['small', 'baps-link-sm'],
      ['large', 'baps-link-lg'],
      ['xlarge', 'baps-link-xl'],
    ] as const)('maps %s to %s', async (size, expected) => {
      const fixture = await setup();
      fixture.componentInstance.size.set(size);
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain(expected);
    });

    it('adds no size class when size is unset, keeping font-size: inherit', async () => {
      const fixture = await setup();
      const classes = [...hostEl(fixture).classList];
      expect(classes.filter((c) => /^baps-link-(sm|lg|xl)$/.test(c))).toEqual([]);
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('content', () => {
    it('projects its children into the anchor, not beside it', async () => {
      const fixture = await setup();
      // Outside the anchor the text is not part of the link's accessible
      // name and is not clickable.
      expect(anchorEl(fixture).textContent?.trim()).toBe('Settings');
    });
  });
});
