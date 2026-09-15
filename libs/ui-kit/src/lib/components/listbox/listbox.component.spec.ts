import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BapsListbox, BapsListboxOption } from './listbox.component';

/**
 * `baps-listbox` is the `NG_VALUE_ACCESSOR` for its own host, so a consuming
 * form never sees PrimeNG's listbox — it sees this wrapper, which re-publishes
 * PrimeNG's `(onChange)` as the registered change callback and mirrors the
 * form value back down through `[(ngModel)]`.
 *
 * What that chain has to preserve, and what silently breaks if it does not:
 *
 * - **The value SHAPE flips with `multiple`.** Single selection yields the
 *   bare option value; multiple yields an array. A wrapper that forwards the
 *   wrong field of the change event hands a form an array where it expected a
 *   scalar (or vice versa), and nothing throws until the payload hits an API.
 * - **`writeValue` is the only way a pre-populated form paints selection.**
 *   Edit screens open with a value already in the control; if it does not
 *   reach `[(ngModel)]` the list opens blank and a user "re-picks" what was
 *   already chosen.
 * - **`disabled`, `readonly` and per-option `optionDisabled` must all stop a
 *   click.** They are three different inputs on three different levels and
 *   only one of them (`disabled`) is reachable via `setDisabledState`.
 *
 * Item-template forwarding is covered separately in
 * `components/template-forwarding.spec.ts` and is not repeated here.
 */
const OPTIONS: BapsListboxOption[] = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
  { label: 'Gamma', value: 'c', disabled: true },
];

@Component({
  imports: [BapsListbox, ReactiveFormsModule],
  template: `
    <baps-listbox
      [formControl]="control"
      [options]="OPTIONS"
      optionLabel="label"
      optionValue="value"
      optionDisabled="disabled"
      [multiple]="multiple()"
      [readonly]="readonly()"
      [brand]="brand()"
    />
  `,
})
class Host {
  readonly OPTIONS = OPTIONS;
  readonly control = new FormControl<unknown>(null);
  readonly multiple = signal(false);
  readonly readonly = signal(false);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

interface Overrides {
  multiple?: boolean;
  readonly?: boolean;
  brand?: 'mybky' | 'sampark';
  value?: unknown;
  disabled?: boolean;
}

async function setup(overrides: Overrides = {}): Promise<ComponentFixture<Host>> {
  const fixture = TestBed.createComponent(Host);
  const host = fixture.componentInstance;
  if (overrides.multiple !== undefined) host.multiple.set(overrides.multiple);
  if (overrides.readonly !== undefined) host.readonly.set(overrides.readonly);
  if (overrides.brand) host.brand.set(overrides.brand);
  // Seeded before the first pass: `writeValue` / `setDisabledState` assign
  // plain fields without marking the view dirty, so a mid-test write renders
  // nothing under the zoneless test env (and forcing detectChanges() there
  // reports NG0100 rather than failing on anything real).
  if (overrides.value !== undefined) host.control.setValue(overrides.value);
  if (overrides.disabled) host.control.disable();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

const options = (fixture: ComponentFixture<Host>) => [
  ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.p-listbox-option'),
];

const instance = (fixture: ComponentFixture<Host>) =>
  fixture.debugElement.query(By.directive(BapsListbox)).componentInstance as BapsListbox;

describe('BapsListbox', () => {
  it('renders one option row per option, labelled by optionLabel', async () => {
    const fixture = await setup();
    expect(options(fixture).map((o) => o.textContent!.trim())).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ]);
  });

  describe('single selection', () => {
    it('writes the bare option value to the form control', async () => {
      const fixture = await setup();
      options(fixture)[1].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe('b');
    });

    it('replaces rather than accumulates on a second pick', async () => {
      const fixture = await setup();
      options(fixture)[0].click();
      await fixture.whenStable();
      options(fixture)[1].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe('b');
    });

    it('paints a pre-populated control value as selected', async () => {
      const fixture = await setup({ value: 'b' });
      expect(options(fixture).map((o) => o.getAttribute('aria-selected'))).toEqual([
        'false',
        'true',
        'false',
      ]);
    });
  });

  describe('multiple selection', () => {
    it('writes an array and accumulates picks', async () => {
      const fixture = await setup({ multiple: true });
      options(fixture)[0].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toEqual(['a']);

      options(fixture)[1].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toEqual(['a', 'b']);
    });

    it('deselects on a repeat click, leaving an array', async () => {
      const fixture = await setup({ multiple: true });
      options(fixture)[0].click();
      await fixture.whenStable();
      options(fixture)[0].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toEqual([]);
    });

    it('paints a pre-populated array as selected', async () => {
      const fixture = await setup({ multiple: true, value: ['a', 'b'] });
      expect(options(fixture).map((o) => o.getAttribute('aria-selected'))).toEqual([
        'true',
        'true',
        'false',
      ]);
    });
  });

  describe('writeValue / isSelected', () => {
    it('routes a later control.setValue through writeValue', async () => {
      const fixture = await setup();
      fixture.componentInstance.control.setValue('c');
      expect(instance(fixture).value).toBe('c');
    });

    it('isSelected compares by optionValue in single mode', async () => {
      const fixture = await setup({ value: 'b' });
      const component = instance(fixture);
      expect(component.isSelected(OPTIONS[1])).toBe(true);
      expect(component.isSelected(OPTIONS[0])).toBe(false);
    });

    it('isSelected does membership, not identity, in multiple mode', async () => {
      const fixture = await setup({ multiple: true, value: ['a', 'c'] });
      const component = instance(fixture);
      expect(OPTIONS.map((o) => component.isSelected(o))).toEqual([true, false, true]);
    });
  });

  describe('blocked interaction', () => {
    it('setDisabledState stops selection entirely', async () => {
      const fixture = await setup({ disabled: true });
      options(fixture)[1].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBeNull();
    });

    it('readonly stops selection but still renders the options', async () => {
      const fixture = await setup({ readonly: true });
      expect(options(fixture).length).toBe(3);
      options(fixture)[1].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBeNull();
    });

    it('a disabled option is marked and unselectable while its siblings work', async () => {
      const fixture = await setup();
      expect(options(fixture)[2].getAttribute('aria-disabled')).toBe('true');
      options(fixture)[2].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBeNull();

      options(fixture)[0].click();
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe('a');
    });
  });

  describe('option label resolution', () => {
    it('falls back through optionLabel, label, title and String()', () => {
      const component = TestBed.createComponent(BapsListbox).componentInstance;
      expect(component.getOptionLabel(null)).toBe('');
      expect(component.getOptionLabel('plain')).toBe('plain');
      expect(component.getOptionLabel({ label: 'L', title: 'T' })).toBe('L');
      expect(component.getOptionLabel({ title: 'T' })).toBe('T');
      component.optionLabel = 'name';
      expect(component.getOptionLabel({ name: 'N', label: 'L' })).toBe('N');
    });

    it('hasCustomLayout only opts into the menu-item row for rich options', () => {
      const component = TestBed.createComponent(BapsListbox).componentInstance;
      expect(component.hasCustomLayout({ label: 'plain', value: 1 })).toBe(false);
      expect(component.hasCustomLayout('string')).toBe(false);
      expect(component.hasCustomLayout(null)).toBe(false);
      expect(component.hasCustomLayout({ title: 'T' })).toBe(true);
      expect(component.hasCustomLayout({ avatarLabel: 'AT' })).toBe(true);
      expect(component.hasCustomLayout({ icon: 'pi-user' })).toBe(true);
    });
  });

  describe('brand host class (§40 — both brands)', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      const host = (fixture.nativeElement as HTMLElement).querySelector('baps-listbox')!;
      expect(host.classList.contains('baps-sampark')).toBe(false);
      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      expect(host.classList.contains('baps-sampark')).toBe(true);
    });
  });
});
