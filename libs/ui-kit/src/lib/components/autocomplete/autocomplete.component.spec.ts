import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AutoComplete } from 'primeng/autocomplete';

import { BapsAutocomplete } from './autocomplete.component';

@Component({
  imports: [BapsAutocomplete, ReactiveFormsModule],
  template: `<baps-autocomplete
    ariaLabel="City"
    [formControl]="control"
    [suggestions]="suggestions()"
    optionLabel="name"
    [dropdown]="true"
    [forceSelection]="true"
    [showClear]="true"
    [brand]="brand()"
    appendTo="self"
    (completeMethod)="queries.push($event.query)"
  />`,
})
class Host {
  readonly control = new FormControl<{ name: string } | null>(null, Validators.required);
  readonly suggestions = signal([{ name: 'Edison' }, { name: 'Robbinsville' }]);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly queries: string[] = [];
}

async function render(configure: (h: Host) => void = () => undefined) {
  const f = TestBed.createComponent(Host);
  configure(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}

const prime = (f: Awaited<ReturnType<typeof render>>) =>
  f.debugElement.query(By.directive(AutoComplete)).componentInstance as AutoComplete;

describe('BapsAutocomplete', () => {
  it('forwards the PrimeNG inputs', async () => {
    const f = await render();
    const p = prime(f) as any;
    const read = (v: any) => (typeof v === 'function' ? v() : v);
    expect(read(p.suggestions)).toHaveLength(2);
    expect(read(p.optionLabel)).toBe('name');
    expect(read(p.dropdown)).toBe(true);
    expect(read(p.forceSelection)).toBe(true);
    expect(read(p.showClear)).toBe(true);
    expect(read(p.ariaLabel)).toBe('City');
  });

  it('writes the form value into the field and reports a pick back', async () => {
    const f = await render();
    f.componentInstance.control.setValue({ name: 'Edison' });
    f.detectChanges();
    await f.whenStable();
    expect((f.debugElement.query(By.directive(BapsAutocomplete)).componentInstance as BapsAutocomplete).value).toEqual({ name: 'Edison' });

    const cmp = f.debugElement.query(By.directive(BapsAutocomplete)).componentInstance as any;
    cmp.onModelChange({ name: 'Robbinsville' });
    expect(f.componentInstance.control.value).toEqual({ name: 'Robbinsville' });
  });

  it('clearing reports null to the form', async () => {
    const f = await render((h) => h.control.setValue({ name: 'Edison' }));
    const cmp = f.debugElement.query(By.directive(BapsAutocomplete)).componentInstance as any;
    cmp.onClear();
    expect(f.componentInstance.control.value).toBeNull();
  });

  it('stamps the Sampark scope on the body-level panel', async () => {
    const f = await render((h) => h.brand.set('sampark'));
    const p = prime(f) as any;
    expect(p.panelStyleClass).toContain('baps-ds-sampark');
  });

  it('a Sampark field shows the form control error once touched', async () => {
    const f = await render((h) => h.brand.set('sampark'));
    f.componentInstance.control.markAsTouched();
    f.detectChanges();
    const cmp = f.debugElement.query(By.directive(BapsAutocomplete)).componentInstance as BapsAutocomplete;
    expect(cmp.resolvedInvalid).toBe(true);
  });
});
