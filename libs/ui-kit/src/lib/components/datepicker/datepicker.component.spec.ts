import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BapsDatepicker } from './datepicker.component';

/**
 * Pins the three things this wrapper is actually responsible for, all of
 * which are invisible to the type system:
 *
 * 1. Brand host classes. `.baps-ds-sampark` is not decorative — the
 *    pre-existing calendar skin in _select-sampark.scss scopes itself to
 *    `:is(.baps-ds-sampark, baps-select.baps-sampark)`, an :is() list that
 *    cannot see a `baps-datepicker` host. Drop that class and a per-instance
 *    Sampark datepicker silently renders the MyBKY skin. That is exactly the
 *    bug select.component.spec.ts was written for, one component over.
 * 2. Portal scope. The panel appends to <body> and escapes every ancestor
 *    scope, so the class has to ride on the panel itself.
 * 3. Accessible name. An unnamed combobox is the control's default a11y
 *    failure; `ariaLabel` falls back to `placeholder`.
 */
@Component({
  imports: [BapsDatepicker],
  template: `
    <baps-datepicker
      [brand]="brand"
      [panelStyleClass]="panelStyleClass"
      [ariaLabel]="ariaLabel"
      [placeholder]="placeholder"
    />
  `,
})
class Host {
  brand: 'mybky' | 'sampark' = 'mybky';
  panelStyleClass?: string;
  ariaLabel?: string;
  placeholder?: string;
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function instanceOf(fixture: Awaited<ReturnType<typeof render>>): BapsDatepicker {
  return fixture.debugElement.query(By.directive(BapsDatepicker))
    .componentInstance as BapsDatepicker;
}

function hostOf(fixture: Awaited<ReturnType<typeof render>>): HTMLElement {
  return (fixture.nativeElement as HTMLElement).querySelector('baps-datepicker')!;
}

describe('BapsDatepicker brand scoping', () => {
  it('emits no brand class for the default mybky brand', async () => {
    const host = hostOf(await render());
    expect(host.classList.contains('baps-sampark')).toBe(false);
    expect(host.classList.contains('baps-ds-sampark')).toBe(false);
  });

  it('emits both scope classes for brand="sampark"', async () => {
    const host = hostOf(await render({ brand: 'sampark' }));
    expect(host.classList.contains('baps-sampark')).toBe(true);
    // Without this one the _select-sampark.scss calendar rules never match.
    expect(host.classList.contains('baps-ds-sampark')).toBe(true);
  });

  it('toggles the scope classes when brand changes at runtime', async () => {
    // The test env is zoneless; a signal input schedules change detection
    // the way a consuming app would, where a mutated plain property + a
    // forced detectChanges() would only trip NG0100.
    @Component({
      imports: [BapsDatepicker],
      template: `<baps-datepicker [brand]="brand()" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-datepicker')!;
    expect(host.classList.contains('baps-ds-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-ds-sampark')).toBe(false);
  });
});

describe('BapsDatepicker portaled panel scope', () => {
  it('adds baps-ds-sampark to the panel for brand="sampark"', async () => {
    expect(instanceOf(await render({ brand: 'sampark' })).resolvedPanelStyleClass).toBe(
      'baps-ds-sampark',
    );
  });

  it('adds nothing for the mybky brand', async () => {
    expect(instanceOf(await render()).resolvedPanelStyleClass).toBe('');
  });

  it('preserves a consumer panelStyleClass alongside the scope class', async () => {
    const fixture = await render({ brand: 'sampark', panelStyleClass: 'my-panel' });
    expect(instanceOf(fixture).resolvedPanelStyleClass).toBe('my-panel baps-ds-sampark');
  });

  it('does not double-append when the consumer already set the scope class', async () => {
    const fixture = await render({ brand: 'sampark', panelStyleClass: 'baps-ds-sampark' });
    expect(instanceOf(fixture).resolvedPanelStyleClass).toBe('baps-ds-sampark');
  });
});

describe('BapsDatepicker accessible name', () => {
  it('uses an explicit ariaLabel', async () => {
    const fixture = await render({ ariaLabel: 'Event date', placeholder: 'Pick one' });
    expect(instanceOf(fixture).resolvedAriaLabel).toBe('Event date');
  });

  it('falls back to the placeholder when no ariaLabel is given', async () => {
    const fixture = await render({ placeholder: 'Pick one' });
    expect(instanceOf(fixture).resolvedAriaLabel).toBe('Pick one');
  });

  it('stays undefined when neither is given, rather than emitting an empty label', async () => {
    expect(instanceOf(await render()).resolvedAriaLabel).toBeUndefined();
  });
});

describe('BapsDatepicker form control', () => {
  it('writes through the CVA and clears back to null', async () => {
    const dp = instanceOf(await render());
    const changes: unknown[] = [];
    dp.registerOnChange((v) => changes.push(v));

    const range = [new Date(2025, 0, 10), new Date(2025, 1, 20)];
    dp.writeValue(range);
    expect(dp.value).toBe(range);

    // In range mode ngModel already holds the tuple when onSelect fires,
    // so the wrapper must forward `value`, not the clicked day.
    dp.onDateSelect(new Date(2025, 1, 20));
    expect(changes.at(-1)).toBe(range);

    dp.onDateClear();
    expect(dp.value).toBeNull();
    expect(changes.at(-1)).toBeNull();
  });

  it('mirrors setDisabledState onto the disabled input', async () => {
    const dp = instanceOf(await render());
    dp.setDisabledState(true);
    expect(dp.disabled).toBe(true);
  });
});
