import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsCard, type BapsCardPadding } from './card.component';

/**
 * `baps-card` renders no PrimeNG and almost no markup: three content slots
 * and eight host bindings. The host bindings are the component.
 *
 * Two of them are not cosmetic:
 *
 * - **`interactive` makes the card a button.** It adds `tabindex="0"` AND
 *   `role="button"`, and both are needed: the role without the tabindex is a
 *   button nobody can reach with a keyboard, and the tabindex without the
 *   role is a focus stop announced as nothing. A card that merely *looks*
 *   clickable is the commonest accessibility regression in this kit.
 *
 * - **The header is laid out by `:empty`.** The template deliberately puts
 *   the three slot elements directly in `.baps-card__header` with no
 *   grouping wrappers, so that an unfilled header matches `:empty` and
 *   collapses. Add a wrapper and the selector stops matching, leaving a
 *   blank band above every card — with nothing in the DOM to explain it.
 */
@Component({
  standalone: true,
  imports: [BapsCard],
  template: `
    <baps-card
      [padding]="padding()"
      [divided]="divided()"
      [raised]="raised()"
      [interactive]="interactive()"
      [brand]="brand()"
    >
      @if (withTitle()) {
        <h3 card-title>Title</h3>
      }
      Body text
      @if (withFooter()) {
        <span card-footer>Footer</span>
      }
    </baps-card>
  `,
})
class Host {
  readonly padding = signal<BapsCardPadding>('default');
  readonly divided = signal(false);
  readonly raised = signal(false);
  readonly interactive = signal(false);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly withTitle = signal(false);
  readonly withFooter = signal(false);
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
  fixture.nativeElement.querySelector('baps-card') as HTMLElement;

const part = (fixture: { nativeElement: HTMLElement }, name: string) =>
  fixture.nativeElement.querySelector(`.baps-card__${name}`) as HTMLElement;

describe('BapsCard', () => {
  describe('padding', () => {
    it('adds no class at the default', async () => {
      const fixture = await setup();
      const classes = [...hostEl(fixture).classList];
      expect(classes).not.toContain('baps-card-compact');
      expect(classes).not.toContain('baps-card-flush');
    });

    it.each([
      ['compact', 'baps-card-compact'],
      ['none', 'baps-card-flush'],
    ] as const)('maps %s to %s', async (padding, expected) => {
      const fixture = await setup();
      fixture.componentInstance.padding.set(padding);
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain(expected);
    });
  });

  describe('flags', () => {
    it.each([
      ['divided', 'baps-card-divided'],
      ['raised', 'baps-card-raised'],
    ] as const)('%s adds %s only when on', async (flag, expected) => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain(expected);

      fixture.componentInstance[flag].set(true);
      await apply(fixture);
      expect(hostEl(fixture).classList).toContain(expected);
    });
  });

  describe('interactive', () => {
    it('is not focusable and has no role when off', async () => {
      const fixture = await setup();
      const host = hostEl(fixture);
      // null, not "-1": a card that is not interactive should not appear in
      // the accessibility tree as a control at all.
      expect(host.hasAttribute('tabindex')).toBe(false);
      expect(host.hasAttribute('role')).toBe(false);
    });

    it('becomes a reachable button when on', async () => {
      const fixture = await setup();
      fixture.componentInstance.interactive.set(true);
      await apply(fixture);

      const host = hostEl(fixture);
      expect(host.classList).toContain('baps-card-interactive');
      // Both, together. role alone is a button no keyboard can reach;
      // tabindex alone is a focus stop announced as nothing.
      expect(host.getAttribute('tabindex')).toBe('0');
      expect(host.getAttribute('role')).toBe('button');
    });

    it('drops both again when turned back off', async () => {
      const fixture = await setup();
      fixture.componentInstance.interactive.set(true);
      await apply(fixture);
      fixture.componentInstance.interactive.set(false);
      await apply(fixture);

      expect(hostEl(fixture).hasAttribute('tabindex')).toBe(false);
      expect(hostEl(fixture).hasAttribute('role')).toBe(false);
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

  describe('slots', () => {
    it('leaves the header truly empty when no slot is filled', async () => {
      const fixture = await setup();
      // `:empty` is what collapses the header band. Ivy leaves no DOM node
      // behind for an unfilled <ng-content>, and preserveWhitespaces: false
      // strips the text nodes between them — so this stays true only as long
      // as nobody adds a grouping wrapper.
      const header = part(fixture, 'header');
      expect(header.children.length).toBe(0);
      expect(header.textContent).toBe('');
      // Measured: the one node left is Angular's `<!--container-->` anchor.
      // `:empty` ignores comments, so the band still collapses — but an
      // element or a text node here would stop it dead.
      expect(
        [...header.childNodes].filter((n) => n.nodeType !== Node.COMMENT_NODE),
      ).toEqual([]);
    });

    it('fills the header from the card-title slot', async () => {
      const fixture = await setup();
      fixture.componentInstance.withTitle.set(true);
      await apply(fixture);
      expect(part(fixture, 'header').textContent?.trim()).toBe('Title');
    });

    it('fills the footer from the card-footer slot', async () => {
      const fixture = await setup();
      fixture.componentInstance.withFooter.set(true);
      await apply(fixture);
      expect(part(fixture, 'footer').textContent?.trim()).toBe('Footer');
    });

    it('puts unslotted content in the body, not the header', async () => {
      const fixture = await setup();
      expect(part(fixture, 'body').textContent?.trim()).toBe('Body text');
      expect(part(fixture, 'header').textContent?.trim()).toBe('');
    });
  });
});
