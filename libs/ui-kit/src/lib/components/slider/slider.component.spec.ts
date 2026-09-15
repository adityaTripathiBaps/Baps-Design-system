import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BapsSlider } from './slider.component';

/**
 * `baps-slider` is the `NG_VALUE_ACCESSOR` for its own host, so the outer form
 * talks to this wrapper and never to PrimeNG's slider. Three things earn a
 * test:
 *
 * **1. `ariaLabel` / `ariaLabelledBy` forwarding.** A slider handle has no
 * text content, so without one of these it is announced as an unnamed
 * "slider". Both inputs were added specifically to close that gap; they are
 * pure passthroughs, which is exactly the kind of binding a template tidy-up
 * deletes without anything visibly changing.
 *
 * **2. `writeValue`'s empty-value default.** `null`/`undefined` from a form is
 * substituted with `min` (or `[min, max]` in range mode) rather than left
 * undefined — otherwise the handle position is computed from `undefined` and
 * the thumb disappears off the track.
 *
 * **3. The change event shape differs between single and range mode.** PrimeNG
 * emits `{ value }` for a single handle and `{ values }` for a range. The
 * wrapper has to read the right one or the form control receives `undefined`
 * from a perfectly normal drag.
 *
 * `min` / `max` / `step` are asserted through the handle's own ARIA values and
 * a keyboard step, which is the only place they are observable.
 */
@Component({
  imports: [BapsSlider, ReactiveFormsModule],
  template: `
    <span id="volume-label">Volume</span>
    <baps-slider
      [formControl]="control"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [range]="range()"
      [brand]="brand()"
      [ariaLabel]="ariaLabel()"
      [ariaLabelledBy]="ariaLabelledBy()"
    />
  `,
})
class Host {
  readonly control = new FormControl<number | number[] | null>(20);
  // Signals: the env is zoneless, so a plain field mutation plus a forced
  // detectChanges() trips NG0100 instead of testing a runtime input change.
  readonly min = signal(0);
  readonly max = signal(100);
  readonly step = signal(1);
  readonly range = signal(false);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly ariaLabelledBy = signal<string | undefined>(undefined);
}

interface Overrides {
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  brand?: 'mybky' | 'sampark';
  ariaLabel?: string;
  ariaLabelledBy?: string;
  value?: number | number[] | null;
  disabled?: boolean;
}

async function setup(overrides: Overrides = {}): Promise<ComponentFixture<Host>> {
  const fixture = TestBed.createComponent(Host);
  const host = fixture.componentInstance;
  if (overrides.min !== undefined) host.min.set(overrides.min);
  if (overrides.max !== undefined) host.max.set(overrides.max);
  if (overrides.step !== undefined) host.step.set(overrides.step);
  if (overrides.range !== undefined) host.range.set(overrides.range);
  if (overrides.brand) host.brand.set(overrides.brand);
  if (overrides.ariaLabel) host.ariaLabel.set(overrides.ariaLabel);
  if (overrides.ariaLabelledBy) host.ariaLabelledBy.set(overrides.ariaLabelledBy);
  // Seeded before the first pass: `writeValue` / `setDisabledState` assign
  // plain fields without marking the view dirty, so a mid-test write renders
  // nothing under the zoneless test env.
  if (overrides.value !== undefined) host.control.setValue(overrides.value);
  if (overrides.disabled) host.control.disable();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

const handles = (fixture: ComponentFixture<Host>) => [
  ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="slider"]'),
];

const instance = (fixture: ComponentFixture<Host>) =>
  fixture.debugElement.query(By.directive(BapsSlider)).componentInstance as BapsSlider;

const press = (handle: HTMLElement, code: string) =>
  handle.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));

describe('BapsSlider', () => {
  describe('accessible name forwarding (a11y regression)', () => {
    it('forwards ariaLabel to the handle', async () => {
      const fixture = await setup({ ariaLabel: 'Volume' });
      expect(handles(fixture)[0].getAttribute('aria-label')).toBe('Volume');
    });

    it('forwards ariaLabelledBy to the handle', async () => {
      const fixture = await setup({ ariaLabelledBy: 'volume-label' });
      expect(handles(fixture)[0].getAttribute('aria-labelledby')).toBe('volume-label');
    });

    it('forwards the name to BOTH handles in range mode', async () => {
      const fixture = await setup({ range: true, value: [20, 60], ariaLabel: 'Price' });
      expect(handles(fixture).map((h) => h.getAttribute('aria-label'))).toEqual([
        'Price',
        'Price',
      ]);
    });

    it('leaves the handle unnamed when neither input is set', async () => {
      const fixture = await setup();
      expect(handles(fixture)[0].getAttribute('aria-label')).toBeNull();
      expect(handles(fixture)[0].getAttribute('aria-labelledby')).toBeNull();
    });
  });

  describe('writeValue', () => {
    it('renders the value the form control holds', async () => {
      const fixture = await setup({ value: 42 });
      expect(handles(fixture)[0].getAttribute('aria-valuenow')).toBe('42');
    });

    it('substitutes min for an empty single value', () => {
      const component = TestBed.createComponent(BapsSlider).componentInstance;
      component.min = 5;
      component.writeValue(null);
      expect(component.value).toBe(5);
      component.writeValue(undefined);
      expect(component.value).toBe(5);
    });

    it('substitutes [min, max] for an empty range value', () => {
      const component = TestBed.createComponent(BapsSlider).componentInstance;
      component.range = true;
      component.min = 10;
      component.max = 90;
      component.writeValue(null);
      expect(component.value).toEqual([10, 90]);
    });

    it('keeps a legitimate 0 rather than treating it as empty', () => {
      const component = TestBed.createComponent(BapsSlider).componentInstance;
      component.min = 5;
      component.writeValue(0);
      expect(component.value).toBe(0);
    });

    it('routes a later control.setValue through writeValue', async () => {
      const fixture = await setup();
      fixture.componentInstance.control.setValue(77);
      expect(instance(fixture).value).toBe(77);
    });
  });

  describe('min / max / step passthrough', () => {
    it('publishes min and max on the handle', async () => {
      const fixture = await setup({ min: 10, max: 40, value: 20 });
      const handle = handles(fixture)[0];
      expect(handle.getAttribute('aria-valuemin')).toBe('10');
      expect(handle.getAttribute('aria-valuemax')).toBe('40');
    });

    it('moves by step on an arrow key', async () => {
      const fixture = await setup({ step: 5, value: 20 });
      press(handles(fixture)[0], 'ArrowRight');
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe(25);
    });

    it('clamps at max', async () => {
      const fixture = await setup({ max: 30, step: 10, value: 25 });
      press(handles(fixture)[0], 'End');
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe(30);
    });

    it('clamps at min', async () => {
      const fixture = await setup({ min: 10, step: 10, value: 15 });
      press(handles(fixture)[0], 'Home');
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe(10);
    });
  });

  describe('change propagation', () => {
    it('pushes a single value to the form control', async () => {
      const fixture = await setup({ value: 20 });
      press(handles(fixture)[0], 'ArrowRight');
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe(21);
    });

    it('pushes the ARRAY, not undefined, in range mode', async () => {
      // PrimeNG emits `{ values }` here and `{ value }` for a single handle —
      // reading the wrong field sends `undefined` to the form on every drag.
      const fixture = await setup({ range: true, value: [20, 60] });
      press(handles(fixture)[1], 'ArrowRight');
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toEqual([20, 61]);
    });

    it('calls the callback given to registerOnChange', async () => {
      const fixture = await setup({ value: 20 });
      const onChange = jest.fn();
      instance(fixture).registerOnChange(onChange);
      press(handles(fixture)[0], 'ArrowRight');
      await fixture.whenStable();
      expect(onChange).toHaveBeenCalledWith(21);
    });

    it('marks the control touched on interaction (registerOnTouched)', async () => {
      const fixture = await setup({ value: 20 });
      expect(fixture.componentInstance.control.touched).toBe(false);
      press(handles(fixture)[0], 'ArrowRight');
      await fixture.whenStable();
      expect(fixture.componentInstance.control.touched).toBe(true);
    });
  });

  describe('setDisabledState', () => {
    it('takes the handle out of the tab order', async () => {
      expect(handles(await setup()).map((h) => h.getAttribute('tabindex'))).toEqual(['0']);
      expect(handles(await setup({ disabled: true })).map((h) => h.getAttribute('tabindex'))).toEqual(
        [null],
      );
    });
  });

  /**
   * The bubble is positioned by percentage, so a wrong denominator puts it
   * somewhere the handle is not — a silent visual drift no render check
   * catches. It also has to stay off by default: every existing slider story
   * is a baseline without it.
   */
  describe('value tooltip', () => {
    const bubbles = (fixture: ComponentFixture<Host>) => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.baps-slider-tooltip'),
    ];

    it('renders nothing by default', async () => {
      expect(bubbles(await setup({ value: 40 }))).toHaveLength(0);
    });

    it('renders one bubble per handle, showing that handle value', async () => {
      const fixture = TestBed.createComponent(BapsSlider);
      const component = fixture.componentInstance;
      component.showValueTooltip = true;
      component.range = true;
      component.value = [20, 70];
      await fixture.whenStable();
      fixture.detectChanges();
      const rendered = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('.baps-slider-tooltip'),
      ].map((b) => b.textContent!.trim());
      expect(rendered).toEqual(['20', '70']);
    });

    it('positions the bubble on the handle percentage, not the raw value', async () => {
      const component = TestBed.createComponent(BapsSlider).componentInstance;
      component.min = 20;
      component.max = 60;
      expect(component.percent(40)).toBe(50);
      // Out-of-range models clamp the same way PrimeNG clamps its handles.
      expect(component.percent(100)).toBe(100);
      expect(component.percent(0)).toBe(0);
    });

    it('stays off for a vertical slider (the bubble is an above-handle shape)', () => {
      const component = TestBed.createComponent(BapsSlider).componentInstance;
      component.showValueTooltip = true;
      component.orientation = 'vertical';
      expect(component.tooltipValues).toEqual([]);
    });
  });

  describe('brand host class (§40 — both brands)', () => {
    it('is absent for mybky and present for sampark', async () => {
      const fixture = await setup();
      const host = (fixture.nativeElement as HTMLElement).querySelector('baps-slider')!;
      expect(host.classList.contains('baps-sampark')).toBe(false);
      fixture.componentInstance.brand.set('sampark');
      await fixture.whenStable();
      expect(host.classList.contains('baps-sampark')).toBe(true);
    });
  });
});
