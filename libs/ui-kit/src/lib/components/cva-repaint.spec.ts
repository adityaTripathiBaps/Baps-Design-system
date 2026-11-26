import 'zone.js';
import {
  ChangeDetectionStrategy,
  Component,
  provideZoneChangeDetection,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BapsCheckbox } from './checkbox/checkbox.component';
import { BapsRadio } from './radio/radio.component';
import { BapsSelect } from './select/select.component';
import { BapsMultiSelect } from './multi-select/multi-select.component';
import { BapsDatepicker } from './datepicker/datepicker.component';
import { BapsTreeSelect } from './tree-select/tree-select.component';
import { BapsSlider } from './slider/slider.component';
import { BapsToggleSwitch } from './toggle-switch/toggle-switch.component';
import { BapsSegmented } from './segmented/segmented.component';
import { BapsListbox } from './listbox/listbox.component';
import { BapsChipsInput } from './chips-input/chips-input.component';
import { BapsInputNumber } from './input-number/input-number.component';

/**
 * A value written from code (`setValue`/`patchValue` after an HTTP call) has
 * no template event behind it. In a zone app (spm-ui) with an OnPush host the
 * next app tick skips the clean host, so the wrapper never re-renders and the
 * inner PrimeNG control keeps the old value. Each wrapper marks itself for
 * check in writeValue/setDisabledState.
 *
 * Runs with zone change detection, as spm-ui does; the kit's default test env
 * is zoneless, where the bug does not show.
 */
const CASES: [string, Type<unknown>, string, unknown][] = [
  ['checkbox', BapsCheckbox, 'baps-checkbox', ['a']],
  ['radio', BapsRadio, 'baps-radio', 'a'],
  ['select', BapsSelect, 'baps-select', 'a'],
  ['multi-select', BapsMultiSelect, 'baps-multi-select', ['a']],
  ['datepicker', BapsDatepicker, 'baps-datepicker', new Date(2025, 0, 10)],
  ['tree-select', BapsTreeSelect, 'baps-tree-select', { key: 'a', label: 'A' }],
  ['slider', BapsSlider, 'baps-slider', 30],
  ['toggle-switch', BapsToggleSwitch, 'baps-toggleswitch', true],
  ['segmented', BapsSegmented, 'baps-segmented', 'a'],
  ['listbox', BapsListbox, 'baps-listbox', 'a'],
  ['chips-input', BapsChipsInput, 'baps-chips-input', ['x']],
  ['input-number', BapsInputNumber, 'baps-input-number', 5],
];

describe('form-control wrappers repaint a value written from code (zone + OnPush host)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZoneChangeDetection()] });
  });

  it.each(CASES)('%s', async (_name, cmp, selector, next) => {
    @Component({
      imports: [cmp, ReactiveFormsModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `<${selector} [formControl]="control" />`,
    })
    class Host {
      readonly control = new FormControl<unknown>(null);
    }

    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();

    // As after an HTTP response: a plain async callback; zone.js runs the app
    // tick after it. No fixture.detectChanges(): that would force the refresh.
    await new Promise<void>((resolve) =>
      setTimeout(() => {
        fixture.componentInstance.control.setValue(next);
        resolve();
      }),
    );
    await fixture.whenStable();

    const wrapper = fixture.debugElement.query(By.directive(cmp));
    const inner = wrapper.query(By.directive(NgModel)).injector.get(NgModel);
    const value = (wrapper.componentInstance as { value: unknown }).value;
    expect(value).not.toBeNull();
    expect(inner.model).toEqual(value);
  });
});
