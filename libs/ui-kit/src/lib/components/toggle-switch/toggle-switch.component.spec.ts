import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BapsToggleSwitch } from './toggle-switch.component';

/**
 * `baps-toggleswitch` registers itself as the `NG_VALUE_ACCESSOR` for its own
 * host element, so the outer form talks to *this* class — PrimeNG's own CVA is
 * consumed internally by the `[(ngModel)]` in the template. All four CVA
 * methods are hand-written here and each has a quiet failure mode:
 *
 * - `writeValue` coerces with `!!`, so a form seeded from JSON (`0`, `''`,
 *   `null`, `'false'`) still lands on a real boolean. Lose the coercion and
 *   the switch renders un-checked for a truthy string while the control
 *   disagrees.
 * - `registerOnChange` is what carries a user toggle back to the form, and it
 *   is wired through PrimeNG's `(onChange)` rather than the internal ngModel —
 *   an innocuous template edit can sever it while the switch still animates.
 * - `setDisabledState` is the only path `control.disable()` has into the
 *   rendered input; without it a disabled control stays clickable.
 *
 * The size and brand host classes are the sole hooks `_switch.scss` /
 * `_switch-sampark.scss` key off — wrong class, default geometry, no error.
 *
 * One current limitation is pinned rather than assumed — see the
 * `registerOnTouched` test.
 */
@Component({
  imports: [BapsToggleSwitch, ReactiveFormsModule],
  template: `<baps-toggleswitch [formControl]="control" [size]="size()" [brand]="brand()" />`,
})
class Host {
  readonly control = new FormControl(false);
  // Signals for the inputs: the env is zoneless, so a plain field mutation
  // plus a forced detectChanges() trips NG0100 instead of testing anything.
  readonly size = signal<'xs' | 'sm' | 'md' | 'lg'>('md');
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

interface Overrides {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  brand?: 'mybky' | 'sampark';
  value?: boolean;
  disabled?: boolean;
}

async function setup(overrides: Overrides = {}): Promise<ComponentFixture<Host>> {
  const fixture = TestBed.createComponent(Host);
  const host = fixture.componentInstance;
  if (overrides.size) host.size.set(overrides.size);
  if (overrides.brand) host.brand.set(overrides.brand);
  // Control state is seeded *before* the first pass on purpose: `writeValue`
  // and `setDisabledState` assign plain fields and never mark the view dirty,
  // so under the zoneless test env a mid-test `setValue()` renders nothing.
  // DOM assertions therefore start from a seeded control; assertions about a
  // mid-test write look at the component field instead.
  if (overrides.value !== undefined) host.control.setValue(overrides.value);
  if (overrides.disabled) host.control.disable();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

const switchInput = (fixture: ComponentFixture<Host>) =>
  (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[role="switch"]')!;

const hostEl = (fixture: ComponentFixture<Host>) =>
  (fixture.nativeElement as HTMLElement).querySelector('baps-toggleswitch')!;

const instance = (fixture: ComponentFixture<Host>) =>
  fixture.debugElement.query(By.directive(BapsToggleSwitch)).componentInstance as BapsToggleSwitch;

describe('BapsToggleSwitch', () => {
  describe('writeValue coercion', () => {
    it.each([
      [true, true],
      ['yes', true],
      [1, true],
      ['false', true], // a non-empty string is truthy — coercion, not parsing
      [false, false],
      [0, false],
      ['', false],
      [null, false],
      [undefined, false],
    ])('coerces %p to %p', (input, expected) => {
      const component = TestBed.createComponent(BapsToggleSwitch).componentInstance;
      component.writeValue(input);
      expect(component.value).toBe(expected);
    });
  });

  describe('form integration', () => {
    it('renders the checked state the form control holds', async () => {
      expect(switchInput(await setup()).getAttribute('aria-checked')).toBe('false');
      expect(switchInput(await setup({ value: true })).getAttribute('aria-checked')).toBe('true');
    });

    it('routes a later control.setValue through writeValue', async () => {
      const fixture = await setup();
      fixture.componentInstance.control.setValue(true);
      expect(instance(fixture).value).toBe(true);
    });

    it('pushes the NEW value back to the control when toggled', async () => {
      const fixture = await setup();
      switchInput(fixture).click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe(true);

      switchInput(fixture).click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe(false);
    });

    it('calls the callback given to registerOnChange with the new value', async () => {
      const fixture = await setup();
      const onChange = jest.fn();
      instance(fixture).registerOnChange(onChange);
      switchInput(fixture).click();
      await fixture.whenStable();
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('setDisabledState disables the rendered input', async () => {
      expect(switchInput(await setup()).disabled).toBe(false);
      expect(switchInput(await setup({ disabled: true })).disabled).toBe(true);
    });

    it('does not change the value while disabled', async () => {
      const fixture = await setup({ disabled: true });
      switchInput(fixture).click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe(false);
    });

    it('registerOnTouched is stored but never invoked — the control stays untouched', async () => {
      // KNOWN GAP, pinned so it is visible rather than assumed: the template
      // forwards PrimeNG's (onChange) but not its blur, so the callback
      // registered here is dead code and validation UI keyed on `touched`
      // never lights up. Wire blur and this test should be inverted.
      const fixture = await setup();
      const onTouched = jest.fn();
      instance(fixture).registerOnTouched(onTouched);

      const input = switchInput(fixture);
      input.click();
      input.dispatchEvent(new FocusEvent('blur'));
      await fixture.whenStable();

      expect(onTouched).not.toHaveBeenCalled();
      expect(fixture.componentInstance.control.touched).toBe(false);
    });
  });

  describe('size host classes', () => {
    it.each([
      ['xs', 'baps-switch-xs'],
      ['sm', 'baps-switch-sm'],
      ['lg', 'baps-switch-lg'],
    ] as const)('applies %s -> .%s', async (size, className) => {
      expect(hostEl(await setup({ size })).classList.contains(className)).toBe(true);
    });

    it('applies no size class for the md default', async () => {
      const host = hostEl(await setup());
      expect(
        ['baps-switch-xs', 'baps-switch-sm', 'baps-switch-lg'].some((c) =>
          host.classList.contains(c),
        ),
      ).toBe(false);
    });

    it('swaps the size class at runtime', async () => {
      const fixture = await setup({ size: 'sm' });
      const host = hostEl(fixture);
      expect(host.classList.contains('baps-switch-sm')).toBe(true);
      fixture.componentInstance.size.set('lg');
      await fixture.whenStable();
      expect(host.classList.contains('baps-switch-sm')).toBe(false);
      expect(host.classList.contains('baps-switch-lg')).toBe(true);
    });
  });

  describe('brand host class (§40 — both brands)', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      const host = hostEl(fixture);
      expect(host.classList.contains('baps-sampark')).toBe(false);
      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      expect(host.classList.contains('baps-sampark')).toBe(true);
    });
  });
});
