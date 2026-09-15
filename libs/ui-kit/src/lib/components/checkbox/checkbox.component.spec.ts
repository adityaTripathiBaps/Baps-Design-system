import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BapsCheckbox } from './checkbox.component';

/**
 * `inputId`'s default was `Math.random()`-based until this session — SSR
 * hydration mismatches when the server and client generate different ids
 * for the same element. The fix is a module-level counter, which is
 * deterministic per test run but only actually verifiable by asserting two
 * instances never collide — a single-instance test can't catch a regression
 * back to `Math.random()`.
 */
describe('BapsCheckbox', () => {
  it('gives every instance a unique, deterministic inputId', () => {
    const a = TestBed.createComponent(BapsCheckbox).componentInstance;
    const b = TestBed.createComponent(BapsCheckbox).componentInstance;
    expect(a.inputId).not.toBe(b.inputId);
    expect(a.inputId).toMatch(/^baps-chk-\d+$/);
    expect(b.inputId).toMatch(/^baps-chk-\d+$/);
  });

  it('respects an explicitly provided inputId instead of the generated default', () => {
    const fixture = TestBed.createComponent(BapsCheckbox);
    fixture.componentInstance.inputId = 'my-custom-id';
    expect(fixture.componentInstance.inputId).toBe('my-custom-id');
  });

  describe('ControlValueAccessor', () => {
    it('writeValue sets the internal value PrimeNG binds to', () => {
      const component = TestBed.createComponent(BapsCheckbox).componentInstance;
      component.writeValue(true);
      expect(component.value).toBe(true);
    });

    it('onCheckboxChange updates value and notifies both onChange and onTouched', () => {
      const component = TestBed.createComponent(BapsCheckbox).componentInstance;
      const onChange = jest.fn();
      const onTouched = jest.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component.onCheckboxChange({ checked: true });

      expect(component.value).toBe(true);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(onTouched).toHaveBeenCalledTimes(1);
    });

    it('setDisabledState toggles the disabled input', () => {
      const component = TestBed.createComponent(BapsCheckbox).componentInstance;
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
    });
  });

  describe('formControlName wiring', () => {
    it('reflects a reactive-forms value through writeValue on render', async () => {
      @Component({
        imports: [BapsCheckbox, FormsModule],
        template: `<baps-checkbox label="Active" [(ngModel)]="active" />`,
      })
      class Host {
        active = true;
      }

      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();

      const checkbox = fixture.debugElement.children[0].componentInstance as BapsCheckbox;
      expect(checkbox.value).toBe(true);
    });
  });

  it('applies the baps-sampark host class only for brand="sampark"', async () => {
    @Component({
      imports: [BapsCheckbox],
      template: `<baps-checkbox brand="sampark" />`,
    })
    class SamparkHost {}

    const fixture = TestBed.createComponent(SamparkHost);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    const el = (fixture.nativeElement as HTMLElement).querySelector('baps-checkbox')!;
    expect(el.classList.contains('baps-sampark')).toBe(true);
  });
});
