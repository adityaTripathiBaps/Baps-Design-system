import { Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Popover } from 'primeng/popover';

import { BapsPopover } from './popover.component';

/**
 * `baps-popover` wraps `p-popover`. PrimeNG owns the positioning, the
 * click-outside and Escape; this wrapper owns three things that break
 * silently.
 *
 * 1. **`panelClass`, not a host class.** The panel is portalled to `<body>`,
 *    so it leaves the host's subtree entirely — a `[class.baps-sampark]`
 *    host binding, which is how every other wrapper here carries the brand,
 *    would never reach it. The brand has to ride on the panel's own class
 *    list, and the Sampark skin disappears with no error if it does not.
 *
 * 2. **`appendTo` defaults to 'body', not PrimeNG's 'self'.** Rendered
 *    inline, the panel is clipped by any ancestor with `overflow` or a
 *    `transform` — most cards and every scrolling table. Reverting the
 *    default produces a panel that is simply invisible in half the app.
 *
 * 3. **`toggle` / `open` / `close` are the whole public API.** There is no
 *    `visible` input; a consumer drives this component only through these,
 *    so a rename or a dropped delegation makes an unopenable popover.
 */
@Component({
  standalone: true,
  imports: [BapsPopover],
  template: `
    <button #trigger type="button">Open</button>
    <baps-popover
      [dismissable]="dismissable()"
      [focusOnShow]="focusOnShow()"
      [ariaLabel]="ariaLabel()"
      [appendTo]="appendTo()"
      [styleClass]="styleClass()"
      [brand]="brand()"
      (show)="seen.push('show')"
      (hide)="seen.push('hide')"
    >
      <p>Panel body</p>
    </baps-popover>
  `,
})
class Host {
  @ViewChild(BapsPopover) readonly popover!: BapsPopover;
  @ViewChild('trigger') readonly trigger!: { nativeElement: HTMLButtonElement };

  readonly dismissable = signal(true);
  readonly focusOnShow = signal(true);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly appendTo = signal<unknown>('body');
  readonly styleClass = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly seen: string[] = [];
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

const prime = (fixture: {
  debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof Popover)
    .componentInstance as Popover;

describe('BapsPopover', () => {
  describe('panelClass', () => {
    it('is empty for mybky, so the panel inherits the preset', async () => {
      const fixture = await setup();
      expect(prime(fixture).styleClass).toBe('');
    });

    it('carries the Sampark scope onto the portalled panel', async () => {
      const fixture = await setup();
      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);

      // Both: the scope class so the token set applies, and the component
      // class so the popover's own Sampark rules match.
      expect(prime(fixture).styleClass).toContain('baps-ds-sampark');
      expect(prime(fixture).styleClass).toContain('baps-popover-sampark');
    });

    it('appends a caller styleClass after the brand class', async () => {
      const fixture = await setup();
      fixture.componentInstance.brand.set('sampark');
      fixture.componentInstance.styleClass.set('bkyms-split-menu');
      await apply(fixture);

      expect(prime(fixture).styleClass).toBe(
        'baps-ds-sampark baps-popover-sampark bkyms-split-menu',
      );
    });

    it('passes a caller styleClass alone when the brand is mybky', async () => {
      const fixture = await setup();
      fixture.componentInstance.styleClass.set('bkyms-split-menu');
      await apply(fixture);
      // No leading space: the empty brand class is filtered out, not joined.
      expect(prime(fixture).styleClass).toBe('bkyms-split-menu');
    });
  });

  describe('appendTo', () => {
    it("defaults to 'body' rather than PrimeNG's 'self'", async () => {
      const fixture = await setup();
      // Inline, the panel is clipped by any ancestor with overflow or a
      // transform — which is most cards and every scrolling table.
      expect(prime(fixture).appendTo()).toBe('body');
    });
  });

  describe('imperative API', () => {
    it('opens through open() and reports it once', async () => {
      const fixture = await setup();
      const trigger = fixture.componentInstance.trigger.nativeElement;

      fixture.componentInstance.popover.open(new MouseEvent('click'), trigger);
      await apply(fixture);

      expect(prime(fixture).overlayVisible).toBe(true);
      expect(fixture.componentInstance.seen).toEqual(['show']);
    });

    it('closes again through close()', async () => {
      const fixture = await setup();
      const trigger = fixture.componentInstance.trigger.nativeElement;

      fixture.componentInstance.popover.open(new MouseEvent('click'), trigger);
      await apply(fixture);
      fixture.componentInstance.popover.close();
      await apply(fixture);

      expect(prime(fixture).overlayVisible).toBe(false);
      expect(fixture.componentInstance.seen).toEqual(['show', 'hide']);
    });

    it('toggle() opens then closes', async () => {
      const fixture = await setup();
      const trigger = fixture.componentInstance.trigger.nativeElement;

      fixture.componentInstance.popover.toggle(new MouseEvent('click'), trigger);
      await apply(fixture);
      expect(prime(fixture).overlayVisible).toBe(true);

      fixture.componentInstance.popover.toggle(new MouseEvent('click'), trigger);
      await apply(fixture);
      expect(prime(fixture).overlayVisible).toBe(false);
    });
  });

  describe('forwarding', () => {
    it('passes dismissable, focusOnShow and ariaLabel through', async () => {
      const fixture = await setup();
      fixture.componentInstance.dismissable.set(false);
      fixture.componentInstance.focusOnShow.set(false);
      fixture.componentInstance.ariaLabel.set('Column options');
      await apply(fixture);

      const popover = prime(fixture);
      expect(popover.dismissable).toBe(false);
      expect(popover.focusOnShow).toBe(false);
      expect(popover.ariaLabel).toBe('Column options');
    });

    it('keeps focusOnShow on by default', async () => {
      const fixture = await setup();
      // A popover opened by keyboard that leaves focus behind cannot be
      // reached again without a mouse.
      expect(prime(fixture).focusOnShow).toBe(true);
      expect(prime(fixture).dismissable).toBe(true);
    });
  });
});
