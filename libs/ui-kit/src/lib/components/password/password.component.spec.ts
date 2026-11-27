import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Password } from 'primeng/password';
import { BapsPassword } from './password.component';

@Component({
  imports: [BapsPassword, ReactiveFormsModule],
  template: `<baps-password inputId="pw" [toggleMask]="true" [formControl]="control" [brand]="brand()" appendTo="self" />`,
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
const prime = (f: Awaited<ReturnType<typeof render>>) => f.debugElement.query(By.directive(Password)).componentInstance as any;
const wrapper = (f: Awaited<ReturnType<typeof render>>) =>
  f.debugElement.query(By.directive(BapsPassword)).componentInstance as any;

describe('BapsPassword', () => {
  it('keeps PrimeNG strength rules when none are given', async () => {
    const f = await render();
    const p = prime(f);
    p.ngOnInit?.();
    expect(p.testStrength('abc')).toBe(1);
    expect(p.testStrength('abc123')).toBe(2);
    expect(p.testStrength('abcAbc123')).toBe(3);
  });

  it('forwards the inputs and renders the field', async () => {
    const f = await render();
    expect(prime(f).toggleMask).toBe(true);
    expect(f.nativeElement.querySelector('input#pw')).toBeTruthy();
  });

  it('reports typed values to the form', async () => {
    const f = await render();
    const input: HTMLInputElement = f.nativeElement.querySelector('input#pw');
    input.value = 'secret';
    input.dispatchEvent(new Event('input'));
    f.detectChanges();
    expect(f.componentInstance.control.value).toBe('secret');
  });

  it('follows the form error on Sampark', async () => {
    const f = await render((h) => h.brand.set('sampark'));
    f.componentInstance.control.markAsTouched();
    f.detectChanges();
    expect(wrapper(f).resolvedInvalid).toBe(true);
  });
});
