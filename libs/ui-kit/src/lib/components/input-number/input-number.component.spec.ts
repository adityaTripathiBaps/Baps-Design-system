import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputNumber, InputNumberInputEvent } from 'primeng/inputnumber';

import { BapsInputNumber } from './input-number.component';

@Component({
  imports: [BapsInputNumber, ReactiveFormsModule],
  template: `
    <div>
      Attendance
      <baps-input-number
        [formControl]="control"
        [showButtons]="showButtons()"
        [min]="min()"
        [max]="max()"
        [maxlength]="maxlength()"
        [maxFractionDigits]="maxFractionDigits()"
        [inputStyleClass]="inputStyleClass()"
        [styleClass]="styleClass()"
        [useGrouping]="useGrouping()"
        [mode]="mode()"
        [placeholder]="placeholder()"
        [size]="size()"
        [brand]="brand()"
        (valueChange)="events.push($event.value)"
      />
    </div>
  `,
})
class Host {
  readonly control = new FormControl<number | null>(12345);
  readonly showButtons = signal(true);
  readonly min = signal<number | undefined>(0);
  readonly max = signal<number | undefined>(20000);
  readonly maxlength = signal<number | undefined>(6);
  readonly maxFractionDigits = signal<number | undefined>(2);
  readonly inputStyleClass = signal<string | undefined>('number-input');
  readonly styleClass = signal<string | undefined>('number-root');
  readonly useGrouping = signal(true);
  readonly mode = signal<'decimal' | 'currency'>('decimal');
  readonly placeholder = signal<string | undefined>('Enter attendance');
  readonly size = signal<'small' | 'large' | undefined>(undefined);
  readonly brand = signal<'mybky' | 'sampark'>('mybky');
  readonly events: Array<number | null> = [];
}

async function setup(
  configure: (host: Host) => void = () => {
    /* empty */
  },
) {
  const fixture = TestBed.createComponent(Host);
  configure(fixture.componentInstance);
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

async function apply(fixture: Awaited<ReturnType<typeof setup>>) {
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}

function wrapper(fixture: Awaited<ReturnType<typeof setup>>): BapsInputNumber {
  return fixture.debugElement.query(By.directive(BapsInputNumber))
    .componentInstance as BapsInputNumber;
}

function prime(fixture: Awaited<ReturnType<typeof setup>>): InputNumber {
  return fixture.debugElement.query(By.directive(InputNumber))
    .componentInstance as InputNumber;
}

function element(
  fixture: Awaited<ReturnType<typeof setup>>,
  selector: string,
): HTMLElement {
  const found = (fixture.nativeElement as HTMLElement).querySelector(selector);
  if (!(found instanceof HTMLElement)) {
    throw new Error(`Expected ${selector} to render`);
  }
  return found;
}

function inputEvent(value: number | null): InputNumberInputEvent {
  return {
    originalEvent: new Event('input'),
    value,
    formattedValue: value == null ? '' : String(value),
  };
}

describe('BapsInputNumber', () => {
  it('uses the spinner-button shape by default with named keyboard controls', async () => {
    const fixture = await setup();
    const buttons = [
      ...fixture.nativeElement.querySelectorAll('.baps-input-number__button'),
    ] as HTMLButtonElement[];

    expect(buttons).toHaveLength(2);
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Increase value',
      'Decrease value',
    ]);
    expect(buttons.every((button) => button.tabIndex === 0)).toBe(true);
  });

  it('round-trips a form value and marks the control touched on blur', async () => {
    const fixture = await setup((host) => host.control.setValue(7));
    const component = wrapper(fixture);
    expect(component.value).toBe(7);

    component.handleInput(inputEvent(9));
    component.handleBlur();
    await apply(fixture);

    expect(fixture.componentInstance.control.value).toBe(9);
    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(fixture.componentInstance.events).toEqual([9]);
  });

  it('clamps min/max and rounds to maxFractionDigits', async () => {
    const fixture = await setup((host) => {
      host.min.set(1);
      host.max.set(10);
      host.maxFractionDigits.set(2);
    });
    const component = wrapper(fixture);

    component.handleInput(inputEvent(12.345));
    expect(component.value).toBe(10);

    component.handleInput(inputEvent(-1.236));
    expect(component.value).toBe(1);

    component.handleInput(inputEvent(5.236));
    expect(component.value).toBe(5.24);
  });

  it('forwards grouping, mode, maxlength, size, and consumer classes', async () => {
    const fixture = await setup((host) => {
      host.useGrouping.set(false);
      host.size.set('large');
    });
    const input = element(fixture, 'input') as HTMLInputElement;

    expect(prime(fixture).useGrouping).toBe(false);
    expect(prime(fixture).mode).toBe('decimal');
    expect(input.maxLength).toBe(6);
    expect(input.classList).toContain('number-input');
    expect(element(fixture, 'p-inputnumber').classList).toContain(
      'number-root',
    );
    expect(input.classList).toContain('p-inputtext-lg');
  });

  it('uses locale grouping only when requested', async () => {
    const grouped = await setup();
    expect((element(grouped, 'input') as HTMLInputElement).value).toMatch(
      /12.345/,
    );

    const plain = await setup((host) => host.useGrouping.set(false));
    expect((element(plain, 'input') as HTMLInputElement).value).toBe('12345');
  });

  it('uses native disabled state for the input and both buttons', async () => {
    const fixture = await setup();
    fixture.componentInstance.control.disable();
    await apply(fixture);

    expect(wrapper(fixture).disabled).toBe(true);
    expect((element(fixture, 'input') as HTMLInputElement).disabled).toBe(true);
    const buttons = [
      ...fixture.nativeElement.querySelectorAll('.baps-input-number__button'),
    ] as HTMLButtonElement[];
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('scopes only the Sampark brand on the host', async () => {
    const mybky = await setup();
    expect(element(mybky, 'baps-input-number').classList).not.toContain(
      'baps-sampark',
    );

    const sampark = await setup((host) => host.brand.set('sampark'));
    expect(element(sampark, 'baps-input-number').classList).toContain(
      'baps-sampark',
    );
  });
});

describe('BapsInputNumber clampOn', () => {
  function setup(clampOn: 'input' | 'blur') {
    const c = TestBed.createComponent(BapsInputNumber).componentInstance;
    c.min = 1;
    c.clampOn = clampOn;
    const sent: (number | null)[] = [];
    c.registerOnChange((v) => sent.push(v));
    c.writeValue(5);
    return { c, sent };
  }
  const typed = (value: number) => ({ value }) as InputNumberInputEvent;

  it('clamps on every keystroke by default', () => {
    const { c, sent } = setup('input');
    c.handleInput(typed(0));
    expect(sent).toEqual([1]);
  });

  it('with blur, keeps the typed value until blur, then clamps once', () => {
    const { c, sent } = setup('blur');
    c.handleInput(typed(0));
    expect(sent).toEqual([0]);
    c.value = 1; // PrimeNG's own blur clamp lands through the inner [(ngModel)]
    c.handleBlur();
    expect(sent).toEqual([0, 1]);
    c.handleBlur();
    expect(sent).toEqual([0, 1]);
  });
});

describe('BapsInputNumber writeValue', () => {
  it('shows a written out-of-range value as is and sends nothing back to the form', () => {
    const c = TestBed.createComponent(BapsInputNumber).componentInstance;
    c.min = 1;
    const sent: (number | null)[] = [];
    c.registerOnChange((v) => sent.push(v));
    c.writeValue(0);
    expect(c.value).toBe(0);
    expect(sent).toEqual([]);
  });
});

describe('BapsInputNumber button layouts, step and forwarded PrimeNG inputs', () => {
  @Component({
    imports: [BapsInputNumber, ReactiveFormsModule],
    template: `<baps-input-number
      [formControl]="control"
      [buttonLayout]="layout()"
      [step]="step()"
      [readonly]="readonly()"
      mode="currency"
      currency="EUR"
      locale="de-DE"
      prefix="~"
      [minFractionDigits]="2"
      [showClear]="true"
      [fluid]="true"
      variant="filled"
      [invalid]="true"
      inputId="price"
    />`,
  })
  class LayoutHost {
    readonly control = new FormControl<number | null>(10.5);
    readonly layout = signal<'stacked' | 'horizontal' | 'vertical'>('horizontal');
    readonly step = signal(0.25);
    readonly readonly = signal(false);
  }

  async function render(configure: (h: LayoutHost) => void = () => undefined) {
    const fixture = TestBed.createComponent(LayoutHost);
    configure(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  const order = (el: HTMLElement) =>
    [...el.querySelector('.baps-input-number__control')!.children].map((c) =>
      c.tagName === 'P-INPUTNUMBER' ? 'field' : (c.getAttribute('aria-label') ?? c.className),
    );

  it('horizontal puts minus before and plus after the field', async () => {
    const f = await render();
    expect(order(f.nativeElement)).toEqual(['Decrease value', 'field', 'Increase value']);
  });

  it('vertical puts plus above and minus below the field', async () => {
    const f = await render((h) => h.layout.set('vertical'));
    expect(order(f.nativeElement)).toEqual(['Increase value', 'field', 'Decrease value']);
  });

  it('stacked keeps both buttons in one column after the field', async () => {
    const f = await render((h) => h.layout.set('stacked'));
    const o = order(f.nativeElement);
    expect(o[0]).toBe('field');
    expect(o).toHaveLength(2);
  });

  it('steps by step without float drift', async () => {
    const f = await render();
    const inc = f.nativeElement.querySelector('[aria-label="Increase value"]') as HTMLButtonElement;
    inc.click();
    expect(f.componentInstance.control.value).toBe(10.75);
    f.componentInstance.control.setValue(0.2);
    f.componentInstance.step.set(0.1);
    f.detectChanges();
    await f.whenStable();
    inc.click();
    expect(f.componentInstance.control.value).toBe(0.3);
  });

  it('readonly ignores the buttons', async () => {
    const f = await render((h) => h.readonly.set(true));
    (f.nativeElement.querySelector('[aria-label="Increase value"]') as HTMLButtonElement).click();
    expect(f.componentInstance.control.value).toBe(10.5);
  });

  it('forwards the PrimeNG formatting and state inputs', async () => {
    const f = await render();
    const p = f.debugElement.query(By.directive(InputNumber)).componentInstance as InputNumber;
    expect(p.mode).toBe('currency');
    expect(p.currency).toBe('EUR');
    expect(p.locale).toBe('de-DE');
    expect(p.prefix).toBe('~');
    expect(p.minFractionDigits).toBe(2);
    expect(p.showClear).toBe(true);
    expect(p.inputId).toBe('price');
    const step = p.step as unknown as number | (() => number);
    expect(typeof step === 'function' ? step() : step).toBe(0.25);
  });
});
