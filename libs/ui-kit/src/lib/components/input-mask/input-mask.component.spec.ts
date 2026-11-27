import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputMask } from 'primeng/inputmask';
import { BapsInputMask } from './input-mask.component';

@Component({
  imports: [BapsInputMask, ReactiveFormsModule],
  template: `<baps-input-mask mask="999-99-9999" inputId="ssn" slotChar="#" [unmask]="true" [formControl]="control" [brand]="brand()" />`,
})
class Host {
  readonly control = new FormControl<string | null>(null, Validators.required);
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
  f.debugElement.query(By.directive(BapsInputMask)).componentInstance as any;

describe('BapsInputMask', () => {
  it('forwards the mask inputs to PrimeNG', async () => {
    const f = await render();
    const p = f.debugElement.query(By.directive(InputMask)).componentInstance as any;
    expect(p.mask).toBe('999-99-9999');
    expect(p.slotChar).toBe('#');
    expect(p.unmask).toBe(true);
    expect(f.nativeElement.querySelector('input#ssn')).toBeTruthy();
  });

  it('reports typed values to the form', async () => {
    const f = await render();
    wrapper(f).onModel('123456789');
    expect(f.componentInstance.control.value).toBe('123456789');
  });

  it('follows the form error on Sampark', async () => {
    const f = await render((h) => h.brand.set('sampark'));
    f.componentInstance.control.markAsTouched();
    f.detectChanges();
    expect(wrapper(f).resolvedInvalid).toBe(true);
  });

  it('follows the form disabled state', async () => {
    const f = await render();
    f.componentInstance.control.disable();
    f.detectChanges();
    expect(wrapper(f).disabled).toBe(true);
  });
});
