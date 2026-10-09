import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Chip } from 'primeng/chip';

import { BapsChip } from './chip.component';

/**
 * `baps-chip` wraps `p-chip`. PrimeNG owns the label, the image and the
 * remove icon; this wrapper owns one real piece of logic and two outputs.
 *
 * **`disabled` suppresses `removable`.** The template passes
 * `[removable]="removable && !disabled"`, so a disabled chip has no remove
 * button at all rather than a greyed-out one that still fires. Drop the
 * `&& !disabled` and the chip looks disabled, is announced as disabled, and
 * still deletes the value when clicked — the worst of the three states.
 *
 * `disabled` is also a `data-disabled` attribute rather than a class,
 * because that is what the stylesheet selects on.
 */
@Component({
  standalone: true,
  imports: [BapsChip],
  template: `
    <baps-chip
      [label]="label()"
      [icon]="icon()"
      [image]="image()"
      [alt]="alt()"
      [removable]="removable()"
      [removeIcon]="removeIcon()"
      [styleClass]="styleClass()"
      [brand]="brand()"
      [disabled]="disabled()"
      (remove)="log('remove', $event)"
      (imageError)="log('imageError', $event)"
    />
  `,
})
class Host {
  readonly label = signal<string | undefined>('G-Sampark');
  readonly icon = signal<string | undefined>(undefined);
  readonly image = signal<string | undefined>(undefined);
  readonly alt = signal<string | undefined>(undefined);
  readonly removable = signal(false);
  readonly removeIcon = signal<string | undefined>(undefined);
  readonly styleClass = signal<string | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly disabled = signal(false);
  readonly seen: Array<[string, unknown]> = [];

  log(name: string, payload: unknown): void {
    this.seen.push([name, payload]);
  }
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
  fixture.nativeElement.querySelector('baps-chip') as HTMLElement;

const prime = (fixture: {
  debugElement: { query: (p: (de: { componentInstance: unknown }) => boolean) => { componentInstance: unknown } };
}) =>
  fixture.debugElement.query((de) => de.componentInstance instanceof Chip)
    .componentInstance as Chip;

describe('BapsChip', () => {
  describe('disabled', () => {
    it('writes data-disabled only when disabled', async () => {
      const fixture = await setup();
      // null rather than "false": the stylesheet selects on the attribute's
      // presence, so writing it always would disable every chip.
      expect(hostEl(fixture).hasAttribute('data-disabled')).toBe(false);

      fixture.componentInstance.disabled.set(true);
      await apply(fixture);
      expect(hostEl(fixture).getAttribute('data-disabled')).toBe('true');
    });

    it('takes the remove button away rather than greying it out', async () => {
      const fixture = await setup();
      fixture.componentInstance.removable.set(true);
      await apply(fixture);
      expect(prime(fixture).removable).toBe(true);

      fixture.componentInstance.disabled.set(true);
      await apply(fixture);
      // A disabled chip whose X still fires is the one failure mode that
      // destroys data, and it looks identical to the correct version.
      expect(prime(fixture).removable).toBe(false);
    });

    it('leaves a non-removable chip non-removable either way', async () => {
      const fixture = await setup();
      expect(prime(fixture).removable).toBe(false);

      fixture.componentInstance.disabled.set(true);
      await apply(fixture);
      expect(prime(fixture).removable).toBe(false);
    });
  });

  describe('outputs', () => {
    it.each([
      ['remove', 'onRemove'],
      ['imageError', 'onImageError'],
    ] as const)('re-emits %s from the PrimeNG chip', async (ours, theirs) => {
      const fixture = await setup();
      const payload = { marker: ours };

      (prime(fixture)[theirs] as unknown as { emit: (v: unknown) => void }).emit(
        payload,
      );
      await fixture.whenStable();

      // Each is a hand-written template binding, so each can rot on its own:
      // the chip still renders, still removes, the consumer's handler just
      // never fires.
      expect(fixture.componentInstance.seen).toContainEqual([ours, payload]);
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

  describe('forwarding', () => {
    it('passes label, icon, image and alt through', async () => {
      const fixture = await setup();
      fixture.componentInstance.icon.set('pi pi-tag');
      fixture.componentInstance.image.set('/avatar.png');
      fixture.componentInstance.alt.set('Amy Elsner');
      await apply(fixture);

      const chip = prime(fixture);
      expect(chip.label).toBe('G-Sampark');
      expect(chip.icon).toBe('pi pi-tag');
      expect(chip.image).toBe('/avatar.png');
      expect(chip.alt).toBe('Amy Elsner');
    });

    it('passes styleClass and removeIcon through', async () => {
      const fixture = await setup();
      fixture.componentInstance.styleClass.set('dense');
      fixture.componentInstance.removeIcon.set('pi pi-times-circle');
      await apply(fixture);

      expect(prime(fixture).styleClass).toBe('dense');
      expect(prime(fixture).removeIcon).toBe('pi pi-times-circle');
    });
  });
});
