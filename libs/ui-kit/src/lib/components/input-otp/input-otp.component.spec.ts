import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BapsInputOtp } from './input-otp.component';

/**
 * The wrapper replaces PrimeNG's cell rendering with its own `#input`
 * template, so what PrimeNG would have bound for free is bound by hand here:
 * the cell count, the disabled and invalid state on every box, and the
 * separator. Each test pins one of those.
 */
@Component({
  imports: [BapsInputOtp, ReactiveFormsModule],
  template: `<baps-input-otp [formControl]="control" [length]="length()" [separator]="separator()" [invalid]="invalid()" inputId="code" />`,
})
class Host {
  readonly control = new FormControl<string | null>(null);
  readonly length = signal(6);
  readonly separator = signal<boolean | undefined>(undefined);
  readonly invalid = signal(false);
}

async function setup(init: (h: Host) => void = () => undefined): Promise<ComponentFixture<Host>> {
  await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
  const fixture = TestBed.createComponent(Host);
  init(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const boxes = (f: ComponentFixture<Host>): HTMLInputElement[] =>
  Array.from(f.nativeElement.querySelectorAll('input.p-inputotp-input'));
const separators = (f: ComponentFixture<Host>): Element[] =>
  Array.from(f.nativeElement.querySelectorAll('.baps-input-otp__separator'));

describe('BapsInputOtp', () => {
  it('renders one box per digit, with the input id on the first only', async () => {
    const f = await setup();
    const b = boxes(f);
    expect(b.length).toBe(6);
    expect(b[0].id).toBe('code');
    expect(b.slice(1).every((x) => x.id === '')).toBe(true);
  });

  it('splits 6 digits 3-3 by default and leaves 4 digits whole', async () => {
    const six = await setup();
    const sep = separators(six);
    expect(sep.length).toBe(1);
    expect(sep[0].previousElementSibling).toBe(boxes(six)[2]);
    TestBed.resetTestingModule();

    const four = await setup((h) => h.length.set(4));
    expect(separators(four).length).toBe(0);
  });

  it('honours an explicit separator choice', async () => {
    const f = await setup((h) => {
      h.length.set(4);
      h.separator.set(true);
    });
    expect(separators(f).length).toBe(1);
  });

  it('writes the form value into the boxes', async () => {
    const f = await setup((h) => h.control.setValue('123456'));
    expect(boxes(f).map((b) => b.value).join('')).toBe('123456');
  });

  it('disables every box when the control is disabled', async () => {
    const f = await setup((h) => h.control.disable());
    expect(boxes(f).every((b) => b.disabled)).toBe(true);
  });

  it('marks every box invalid', async () => {
    const f = await setup((h) => h.invalid.set(true));
    expect(boxes(f).every((b) => b.classList.contains('p-invalid'))).toBe(true);
  });

  it('names each box for assistive tech', async () => {
    const f = await setup();
    expect(boxes(f)[0].getAttribute('aria-label')).toBe('Digit 1 of 6');
    expect(boxes(f)[0].getAttribute('autocomplete')).toBe('one-time-code');
  });
});
