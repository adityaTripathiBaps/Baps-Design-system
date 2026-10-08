import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { BapsButton } from './button.component';

/**
 * `baps-button` is the most reused component in the kit and had no spec at all.
 *
 * It wraps `p-button`, so PrimeNG's own behaviour is covered upstream and is
 * not retested here. What IS pinned is the four places this wrapper diverges
 * from its wrapper — each one silent when broken, because the button still
 * renders, still clicks and still looks close enough.
 *
 * 1. **`xlarge` is not a PrimeNG size.** PrimeNG stops at 'large', so the
 *    wrapper withholds it from `[size]` and paints it with a host class
 *    instead. Forward it by accident and PrimeNG receives a size it does not
 *    know; drop the host class and the button silently renders at default
 *    height.
 *
 * 2. **Two icon systems share one input.** `icon` takes either a PrimeIcons
 *    class or a BAPS glyph name, and `isBapsIcon` decides which. Get it wrong
 *    and the glyph is handed to PrimeNG as a class name, which renders
 *    nothing at all rather than erroring.
 *
 * 3. **The brand is a host class**, not a PrimeNG input — the Sampark skin is
 *    scoped CSS, so losing the class loses the whole brand with no error.
 *
 * 4. **`ariaLabel` is the only name an icon-only button has.** Without it the
 *    button is announced as nothing.
 */
@Component({
  standalone: true,
  imports: [BapsButton],
  template: `
    <baps-button
      [label]="label()"
      [icon]="icon()"
      [size]="size()"
      [brand]="brand()"
      [disabled]="disabled()"
      [ariaLabel]="ariaLabel()"
    />
  `,
})
class Host {
  // Signals rather than plain fields so a test can change an input at runtime
  // the way a consuming app would.
  readonly label = signal<string | undefined>('Save');
  readonly icon = signal<string | undefined>(undefined);
  readonly size = signal<'small' | 'large' | 'xlarge' | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly disabled = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
}

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

const hostEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('baps-button') as HTMLElement;

const buttonEl = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('button') as HTMLButtonElement;

describe('BapsButton', () => {
  describe('size', () => {
    it('keeps xlarge out of the PrimeNG size input and paints it with a class', async () => {
      const fixture = await setup();
      fixture.componentInstance.size.set('xlarge');
      await fixture.whenStable();
      fixture.detectChanges();

      const cmp = fixture.debugElement.children[0].componentInstance as BapsButton;
      // PrimeNG has no 'xlarge', so it must receive nothing rather than a
      // value it will not recognise.
      expect(cmp.primeSize).toBeUndefined();
      expect(hostEl(fixture).classList).toContain('baps-button-xl');
    });

    it('forwards the sizes PrimeNG does support, with no extra class', async () => {
      const fixture = await setup();
      fixture.componentInstance.size.set('small');
      await fixture.whenStable();
      fixture.detectChanges();

      const cmp = fixture.debugElement.children[0].componentInstance as BapsButton;
      expect(cmp.primeSize).toBe('small');
      expect(hostEl(fixture).classList).not.toContain('baps-button-xl');
    });
  });

  describe('icon', () => {
    it('treats a pi- class as PrimeIcons and hands it straight to p-button', async () => {
      const fixture = await setup();
      fixture.componentInstance.icon.set('pi-check');
      await fixture.whenStable();

      const cmp = fixture.debugElement.children[0].componentInstance as BapsButton;
      expect(cmp.isBapsIcon).toBe(false);
      expect(cmp.primeIcon).toBe('pi-check');
    });

    it('treats a BAPS glyph name as ours and withholds it from p-button', async () => {
      const fixture = await setup();
      fixture.componentInstance.icon.set('settings');
      await fixture.whenStable();

      const cmp = fixture.debugElement.children[0].componentInstance as BapsButton;
      expect(cmp.isBapsIcon).toBe(true);
      // Handing a glyph name to PrimeNG as a class renders nothing and throws
      // nothing, so this is the assertion that catches it.
      expect(cmp.primeIcon).toBeUndefined();
    });

    it('reports no icon at all when the input is unset', async () => {
      const fixture = await setup();
      const cmp = fixture.debugElement.children[0].componentInstance as BapsButton;
      expect(cmp.isBapsIcon).toBe(false);
      expect(cmp.primeIcon).toBeUndefined();
    });
  });

  describe('brand', () => {
    it('is absent for mybky and present for sampark, including at runtime', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain('baps-sampark');

      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      fixture.detectChanges();
      expect(hostEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('accessibility', () => {
    it('puts ariaLabel on the rendered button', async () => {
      const fixture = await setup();
      fixture.componentInstance.ariaLabel.set('Delete row');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(buttonEl(fixture).getAttribute('aria-label')).toBe('Delete row');
    });

    it('disables the native button, not just its appearance', async () => {
      const fixture = await setup();
      expect(buttonEl(fixture).disabled).toBe(false);

      fixture.componentInstance.disabled.set(true);
      await fixture.whenStable();
      fixture.detectChanges();
      // The native attribute is what removes it from the tab order; a class
      // alone would leave it reachable by keyboard.
      expect(buttonEl(fixture).disabled).toBe(true);
    });
  });
});
