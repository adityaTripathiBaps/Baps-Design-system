import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { BapsRadio } from './radio.component';
import { SAMPARK_RADIO_TOKENS } from '../../theme/sampark.theme';

/**
 * `baps-radio` is a `ControlValueAccessor`, which is the part worth testing:
 * everything PrimeNG draws is covered upstream, but a CVA that writes but
 * never reports back is a form that silently stays pristine and empty while
 * the control on screen looks correctly selected.
 *
 * Three things are pinned.
 *
 * 1. **The round trip.** `writeValue` has to land on the control, and a user
 *    selection has to reach `onChange` AND `onTouched`. Dropping `onTouched`
 *    is the quiet one: validation that fires on touch then never fires at
 *    all, so a required field shows no error and the form will not submit.
 *
 * 2. **`inputId` is deterministic.** It is a module counter rather than
 *    `Math.random()` so the server and the client render the same id for a
 *    label/input pair — a random id breaks SSR hydration, and the label
 *    stops being associated with the input, which is the only thing giving
 *    the radio an accessible name.
 *
 * 3. **The brand is a `dt` token object, not CSS.** No class to inspect in a
 *    review, so a typo in the brand check ships every radio in the wrong
 *    ramp with nothing to see.
 */
@Component({
  standalone: true,
  imports: [BapsRadio, ReactiveFormsModule],
  template: `
    <baps-radio
      [formControl]="control"
      [label]="label()"
      [radioValue]="radioValue()"
      [disabled]="disabled()"
      [name]="name()"
      [size]="size()"
      [brand]="brand()"
    />
  `,
})
class Host {
  readonly control = new FormControl<string | null>(null);
  readonly label = signal<string | undefined>('Last Week');
  readonly radioValue = signal<unknown>('week');
  readonly disabled = signal(false);
  readonly name = signal<string | undefined>('period');
  readonly size = signal<'small' | 'large' | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

/**
 * `initial` is applied BEFORE the first change-detection pass on purpose.
 * Setting a form value on an already-settled fixture and then forcing
 * another pass trips NG0100 in dev mode: `writeValue` mutates the field the
 * `[(ngModel)]` two-way binding has already read this cycle. That is a
 * harness artifact, not a component bug — a real app's setValue schedules
 * its own pass — so the test writes the value the way a form does.
 */
async function setup(initial?: string) {
  const fixture = TestBed.createComponent(Host);
  if (initial !== undefined) fixture.componentInstance.control.setValue(initial);
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
  fixture.nativeElement.querySelector('baps-radio') as HTMLElement;

const radio = (fixture: { debugElement: { children: Array<{ componentInstance: unknown }> } }) =>
  fixture.debugElement.children[0].componentInstance as BapsRadio;

describe('BapsRadio', () => {
  describe('ControlValueAccessor', () => {
    it('writes a form value onto the control', async () => {
      const fixture = await setup('week');
      expect(radio(fixture).value).toBe('week');
    });

    it('reports a selection back to the form and marks it touched', async () => {
      const fixture = await setup();
      const component = radio(fixture);

      // What PrimeNG does before onClick fires: ngModel has already written
      // the selected value in.
      component.value = 'week';
      component.onRadioChange(new MouseEvent('click'));
      await apply(fixture);

      expect(fixture.componentInstance.control.value).toBe('week');
      // Without touched, validation that fires on blur never fires, so a
      // required group shows no error and the form will not submit.
      expect(fixture.componentInstance.control.touched).toBe(true);
    });

    it('takes disabled from the form, not only from the input', async () => {
      const fixture = await setup();
      expect(radio(fixture).disabled).toBe(false);

      fixture.componentInstance.control.disable();
      await apply(fixture);
      expect(radio(fixture).disabled).toBe(true);
    });
  });

  describe('inputId', () => {
    it('is deterministic and unique per instance', async () => {
      const first = (await setup()).debugElement.children[0]
        .componentInstance as BapsRadio;
      const second = (await setup()).debugElement.children[0]
        .componentInstance as BapsRadio;

      // Sequential, not random: a random id renders differently on the
      // server and the client, which breaks hydration and detaches the
      // label from the input.
      expect(first.inputId).toMatch(/^baps-radio-\d+$/);
      expect(second.inputId).toMatch(/^baps-radio-\d+$/);
      expect(first.inputId).not.toBe(second.inputId);
    });

    it('associates the label with the input it names', async () => {
      const fixture = await setup();
      const label = fixture.nativeElement.querySelector(
        'label',
      ) as HTMLLabelElement;
      // The label is the radio's only accessible name, and `for` is what
      // attaches it.
      expect(label.getAttribute('for')).toBe(radio(fixture).inputId);
      expect(label.textContent?.trim()).toBe('Last Week');
    });

    it('renders no label element when no label is given', async () => {
      const fixture = await setup();
      fixture.componentInstance.label.set(undefined);
      await apply(fixture);
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
    });
  });

  describe('brand', () => {
    it('has no dt override for mybky — it inherits the global preset', async () => {
      const fixture = await setup();
      expect(radio(fixture).dt).toBeUndefined();
      expect(hostEl(fixture).classList).not.toContain('baps-sampark');
    });

    it('returns SAMPARK_RADIO_TOKENS for sampark', async () => {
      const fixture = await setup();
      fixture.componentInstance.brand.set('sampark');
      await apply(fixture);

      expect(radio(fixture).dt).toBe(SAMPARK_RADIO_TOKENS);
      expect(hostEl(fixture).classList).toContain('baps-sampark');
    });
  });

  describe('size', () => {
    it('adds the large host class only for large', async () => {
      const fixture = await setup();
      expect(hostEl(fixture).classList).not.toContain('baps-radio-lg');

      fixture.componentInstance.size.set('small');
      await apply(fixture);
      expect(hostEl(fixture).classList).not.toContain('baps-radio-lg');

      fixture.componentInstance.size.set('large');
      await apply(fixture);
      // The dot scales with the box through this class; without it a large
      // radio keeps the small-size dot.
      expect(hostEl(fixture).classList).toContain('baps-radio-lg');
    });
  });
});
