import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

/*
 * PrimeNG 21's primeng-cascadeselect.mjs reads CascadeSelect before its class
 * is initialised (line 274) once Jest's CommonJS transform has rewritten it,
 * so the real module cannot load in this test environment (it is fine in the
 * browser: Storybook renders it). The wrapper's own logic is tested against
 * a stub with the same selector, inputs and outputs.
 */
jest.mock('primeng/cascadeselect', () => {
  const { Component, EventEmitter, forwardRef } = jest.requireActual('@angular/core');
  const { NG_VALUE_ACCESSOR } = jest.requireActual('@angular/forms');
  class CascadeSelect {
    onChange = new EventEmitter();
    onGroupChange = new EventEmitter();
    onShow = new EventEmitter();
    onHide = new EventEmitter();
    onClear = new EventEmitter();
    onBlur = new EventEmitter();
    writeValue() { /* stub */ }
    registerOnChange() { /* stub */ }
    registerOnTouched() { /* stub */ }
  }
  Component({
    selector: 'p-cascadeselect',
    template: '',
    inputs: ["options","optionLabel","optionValue","optionGroupLabel","optionGroupChildren","optionDisabled","placeholder","disabled","showClear","loading","loadingIcon","size","variant","fluid","invalid","dataKey","inputId","tabindex","ariaLabel","ariaLabelledBy","panelStyle","panelStyleClass","appendTo","breakpoint","autofocus","autoOptionFocus","selectOnFocus","focusOnHover","searchLocale","searchMessage","emptyMessage","selectionMessage","emptySearchMessage","emptySelectionMessage"],
    outputs: ['onChange', 'onGroupChange', 'onShow', 'onHide', 'onClear', 'onBlur'],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CascadeSelect), multi: true }],
  })(CascadeSelect);
  return { CascadeSelect };
});
import { CascadeSelect } from 'primeng/cascadeselect';

import { BapsCascadeSelect } from './cascade-select.component';

@Component({
  imports: [BapsCascadeSelect, ReactiveFormsModule],
  template: `<baps-cascade-select
    ariaLabel="City"
    [formControl]="control"
    [options]="options"
    optionLabel="cname"
    optionGroupLabel="name"
    [optionGroupChildren]="['cities']"
    [showClear]="true"
    [brand]="brand()"
    appendTo="self"
  />`,
})
class Host {
  readonly control = new FormControl<unknown>(null, Validators.required);
  readonly options = [{ name: 'NJ', cities: [{ cname: 'Edison' }, { cname: 'Robbinsville' }] }];
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
}

async function render(configure: (h: Host) => void = () => undefined) {
  const f = TestBed.createComponent(Host);
  configure(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}
const wrapper = (f: Awaited<ReturnType<typeof render>>) =>
  f.debugElement.query(By.directive(BapsCascadeSelect)).componentInstance as any;

describe('BapsCascadeSelect', () => {
  it('forwards the PrimeNG inputs', async () => {
    const f = await render();
    const p = f.debugElement.query(By.directive(CascadeSelect)).componentInstance as any;
    const read = (v: any) => (typeof v === 'function' ? v() : v);
    expect(read(p.optionLabel)).toBe('cname');
    expect(read(p.optionGroupChildren)).toEqual(['cities']);
    expect(read(p.showClear)).toBe(true);
    expect(read(p.ariaLabel)).toBe('City');
  });

  it('reports a pick to the form and marks it touched', async () => {
    const f = await render();
    wrapper(f).onPick({ value: { cname: 'Edison' } });
    expect(f.componentInstance.control.value).toEqual({ cname: 'Edison' });
    expect(f.componentInstance.control.touched).toBe(true);
  });

  it('clearing reports null', async () => {
    const f = await render((h) => h.control.setValue({ cname: 'Edison' }));
    wrapper(f).onClear();
    expect(f.componentInstance.control.value).toBeNull();
  });

  it('stamps the Sampark scope on the panel and follows the form error', async () => {
    const f = await render((h) => h.brand.set('sampark'));
    f.componentInstance.control.markAsTouched();
    f.detectChanges();
    expect(wrapper(f).resolvedPanelStyleClass).toContain('baps-ds-sampark');
    expect(wrapper(f).resolvedInvalid).toBe(true);
  });
});
