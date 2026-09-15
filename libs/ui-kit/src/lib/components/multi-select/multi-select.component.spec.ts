import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MultiSelect } from 'primeng/multiselect';
import { BapsMultiSelect } from './multi-select.component';

/**
 * This wrapper exists to reach 88 SCSS rules that were already written. Almost
 * everything it can get wrong fails silently rather than throwing:
 *
 * - The overlay is portaled to `<body>`, so it escapes the host class. If
 *   `resolvedPanelStyleClass` stops stamping the page scope, a per-instance
 *   Sampark field renders a Sampark trigger above a MyBKY-skinned overlay —
 *   no error, just two brands in one control. Same bug that shipped in
 *   `baps-select`; these tests pin it here before it can happen again.
 * - `filterPlaceholder` is deliberately spelled differently from the PrimeNG
 *   input it feeds (`filterPlaceHolder`, capital H). If that mapping breaks,
 *   the filter row silently loses its placeholder.
 * - The brand host class gates every Sampark rule in the skin.
 */
@Component({
  imports: [BapsMultiSelect],
  template: `
    <baps-multi-select
      [brand]="brand"
      [panelStyleClass]="panelStyleClass"
      [options]="options"
    />
  `,
})
class Host {
  brand: 'mybky' | 'sampark' = 'mybky';
  panelStyleClass?: string;
  options: unknown[] = [];
}

async function render(overrides: Partial<Host> = {}) {
  const fixture = TestBed.createComponent(Host);
  Object.assign(fixture.componentInstance, overrides);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('BapsMultiSelect brand scoping', () => {
  async function hostClasses(overrides: Partial<Host> = {}): Promise<DOMTokenList> {
    const fixture = await render(overrides);
    return (fixture.nativeElement as HTMLElement).querySelector('baps-multi-select')!.classList;
  }

  it('emits no host class for the default mybky brand', async () => {
    expect((await hostClasses({ brand: 'mybky' })).contains('baps-sampark')).toBe(false);
  });

  it('emits .baps-sampark for brand="sampark"', async () => {
    expect((await hostClasses({ brand: 'sampark' })).contains('baps-sampark')).toBe(true);
  });

  it('toggles the host class when brand changes at runtime', async () => {
    @Component({
      imports: [BapsMultiSelect],
      template: `<baps-multi-select [brand]="brand()" [options]="[]" />`,
    })
    class SignalHost {
      readonly brand = signal<'mybky' | 'sampark'>('sampark');
    }

    const fixture = TestBed.createComponent(SignalHost);
    await fixture.whenStable();
    const host = (fixture.nativeElement as HTMLElement).querySelector('baps-multi-select')!;
    expect(host.classList.contains('baps-sampark')).toBe(true);

    fixture.componentInstance.brand.set('mybky');
    await fixture.whenStable();
    expect(host.classList.contains('baps-sampark')).toBe(false);
  });
});

/**
 * The overlay is appended to `<body>`, outside both the host class and any
 * `.baps-ds-sampark` ancestor, so the page-scope class has to travel on the
 * panel itself. Asserted on the getter rather than the rendered overlay
 * because the panel only exists while open.
 */
describe('BapsMultiSelect portaled overlay scope', () => {
  function scopeFor(brand: 'mybky' | 'sampark', panelStyleClass?: string): string {
    const component = TestBed.createComponent(BapsMultiSelect).componentInstance;
    component.brand = brand;
    component.panelStyleClass = panelStyleClass;
    return component.resolvedPanelStyleClass;
  }

  it('adds the page scope for sampark', () => {
    expect(scopeFor('sampark')).toBe('baps-ds-sampark');
  });

  it('adds nothing for mybky', () => {
    expect(scopeFor('mybky')).toBe('');
  });

  it('preserves a consumer class alongside the scope', () => {
    expect(scopeFor('sampark', 'my-panel')).toBe('my-panel baps-ds-sampark');
  });

  it('passes a consumer class through untouched at mybky', () => {
    expect(scopeFor('mybky', 'my-panel')).toBe('my-panel');
  });

  it('does not double-stamp when the consumer already opted in', () => {
    expect(scopeFor('sampark', 'baps-ds-sampark')).toBe('baps-ds-sampark');
  });
});

/**
 * PrimeNG spells this input `filterPlaceHolder` on MultiSelect and
 * `filterPlaceholder` on Select. The wrapper presents the Select spelling so
 * the two components stay interchangeable; this pins that the value actually
 * reaches PrimeNG rather than being dropped on the floor.
 */
describe('BapsMultiSelect filter placeholder normalisation', () => {
  it('forwards filterPlaceholder to PrimeNG filterPlaceHolder', async () => {
    @Component({
      imports: [BapsMultiSelect],
      template: `
        <baps-multi-select
          [options]="[]"
          [filter]="true"
          filterPlaceholder="Search cities"
        />
      `,
    })
    class FilterHost {}

    const fixture = TestBed.createComponent(FilterHost);
    await fixture.whenStable();
    fixture.detectChanges();

    const prime = fixture.debugElement.query(By.directive(MultiSelect)).componentInstance as MultiSelect;
    expect(prime.filterPlaceHolder).toBe('Search cities');
  });
});

/**
 * `value` is the ControlValueAccessor field, not an `@Input` — binding
 * `[value]` on this element throws NG0303. These cover the CVA contract the
 * form integration depends on.
 */
describe('BapsMultiSelect value accessor', () => {
  it('writes an incoming value', () => {
    const component = TestBed.createComponent(BapsMultiSelect).componentInstance;
    component.writeValue(['a', 'b']);
    expect(component.value).toEqual(['a', 'b']);
  });

  it('propagates a selection change to the registered callback', () => {
    const component = TestBed.createComponent(BapsMultiSelect).componentInstance;
    const seen: unknown[] = [];
    component.registerOnChange((v: unknown) => seen.push(v));
    component.onMultiSelectChange({ value: ['a'] });
    expect(seen).toEqual([['a']]);
    expect(component.value).toEqual(['a']);
  });

  it('marks the control touched on change', () => {
    const component = TestBed.createComponent(BapsMultiSelect).componentInstance;
    let touched = false;
    component.registerOnTouched(() => (touched = true));
    component.onMultiSelectChange({ value: [] });
    expect(touched).toBe(true);
  });

  it('honours setDisabledState from the forms API', () => {
    const component = TestBed.createComponent(BapsMultiSelect).componentInstance;
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('re-emits the filter query', () => {
    const component = TestBed.createComponent(BapsMultiSelect).componentInstance;
    const seen: string[] = [];
    component.filterQueryChange.subscribe((q) => seen.push(q));
    component.onMultiSelectFilter({ filter: 'lon' });
    expect(seen).toEqual(['lon']);
  });
});

/**
 * Defaults chosen to match the design system rather than PrimeNG where the two
 * differ — a changed default silently alters every existing call site.
 */
describe('BapsMultiSelect defaults', () => {
  it('defaults to comma display, toggle-all on, header on', () => {
    const component = TestBed.createComponent(BapsMultiSelect).componentInstance;
    expect(component.display).toBe('comma');
    expect(component.showToggleAll).toBe(true);
    expect(component.showHeader).toBe(true);
  });

  it('defaults brand to mybky, like every other brand-switchable component', () => {
    expect(TestBed.createComponent(BapsMultiSelect).componentInstance.brand).toBe('mybky');
  });

  it('leaves size unset so the standard height rule owns it', () => {
    expect(TestBed.createComponent(BapsMultiSelect).componentInstance.size).toBeUndefined();
  });
});
