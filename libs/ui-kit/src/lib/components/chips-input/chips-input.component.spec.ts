import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { BapsChipsInput } from './chips-input.component';

@Component({
  imports: [BapsChipsInput, FormsModule],
  template: `
    <span id="skills-label">Skills</span>
    <baps-chips-input
      aria-labelledby="skills-label"
      [(ngModel)]="value"
      [disabled]="disabled"
      [separator]="separator"
    />
  `,
})
class Host {
  @ViewChild(BapsChipsInput) readonly control!: BapsChipsInput;
  value = ['Angular'];
  disabled = false;
  separator = ',';
}

async function render(setup: (host: Host) => void = () => undefined) {
  const fixture = TestBed.createComponent(Host);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function inputFor(
  fixture: Awaited<ReturnType<typeof render>>,
): HTMLInputElement {
  const input = (fixture.nativeElement as HTMLElement).querySelector('input');
  if (!(input instanceof HTMLInputElement)) throw new Error('input not found');
  return input;
}

function enterValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true,
    }),
  );
}

describe('BapsChipsInput', () => {
  it('round-trips values through its ControlValueAccessor callbacks', () => {
    const component = TestBed.createComponent(BapsChipsInput).componentInstance;
    const changes: string[][] = [];
    const touched = jest.fn();

    component.registerOnChange((value) => changes.push(value));
    component.registerOnTouched(touched);
    component.writeValue(['Angular']);
    component.handleValueChange(['Angular', 'React']);
    component.markTouched();

    expect(component.value).toEqual(['Angular', 'React']);
    expect(changes).toEqual([['Angular', 'React']]);
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('copies incoming arrays instead of retaining the consumer reference', () => {
    const component = TestBed.createComponent(BapsChipsInput).componentInstance;
    const incoming = ['Angular'];
    component.writeValue(incoming);
    incoming.push('React');
    expect(component.value).toEqual(['Angular']);
  });

  it('adds free text with Enter through the PrimeNG replacement control', async () => {
    const fixture = await render();
    enterValue(inputFor(fixture), 'React');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(['Angular', 'React']);
  });

  it('removes the final value with Backspace when the input is empty', async () => {
    const fixture = await render((host) => (host.value = ['Angular', 'React']));
    inputFor(fixture).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Backspace',
        code: 'Backspace',
        bubbles: true,
      }),
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(['Angular']);
  });

  it('renders each value through baps-chip with a named remove button', async () => {
    const fixture = await render((host) => (host.value = ['Angular', 'React']));
    const host = fixture.nativeElement as HTMLElement;
    const chips = host.querySelectorAll('baps-chip');
    const remove = chips[0].querySelector('.p-chip-remove-icon');

    expect(chips).toHaveLength(2);
    expect(remove?.getAttribute('aria-label')).toBe('Remove');

    remove?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toEqual(['React']);
    expect(host.querySelector('baps-chip .p-chip-label')?.textContent).toBe(
      'React',
    );
    expect(
      (host.querySelector('baps-chip .p-chip') as HTMLElement | null)?.style
        .display,
    ).not.toBe('none');
  });

  it('forwards disabled state to the native input and blocks chip removal', async () => {
    const fixture = await render((host) => (host.disabled = true));
    expect(inputFor(fixture).disabled).toBe(true);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        'baps-chip .p-chip-remove-icon',
      ),
    ).toBeNull();
  });

  it('labels both PrimeNG input fields from the visible host label', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;

    expect(inputFor(fixture).getAttribute('aria-labelledby')).toBe(
      'skills-label',
    );
    expect(
      host
        .querySelector('.p-autocomplete-input-multiple')
        ?.getAttribute('aria-labelledby'),
    ).toBe('skills-label');
    expect(
      host
        .querySelector('.p-autocomplete-input-multiple')
        ?.getAttribute('role'),
    ).toBe('group');
    expect(
      host.querySelector('.p-autocomplete-input-chip')?.getAttribute('role'),
    ).toBe('presentation');
    expect(
      host
        .querySelector('.p-autocomplete-input-multiple')
        ?.hasAttribute('aria-orientation'),
    ).toBe(false);
  });
});
