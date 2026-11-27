import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ColorPicker } from 'primeng/colorpicker';
import { BapsColorPicker } from './color-picker.component';

@Component({
  imports: [BapsColorPicker, ReactiveFormsModule],
  template: `<baps-color-picker [formControl]="control" format="hex" inputId="c" />`,
})
class Host {
  readonly control = new FormControl<string | null>('#5f78b8');
}

async function render() {
  const f = TestBed.createComponent(Host);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}
const wrapper = (f: Awaited<ReturnType<typeof render>>) =>
  f.debugElement.query(By.directive(BapsColorPicker)).componentInstance as any;

describe('BapsColorPicker', () => {
  it('passes the form value and inputs to PrimeNG', async () => {
    const f = await render();
    const p = f.debugElement.query(By.directive(ColorPicker)).componentInstance as any;
    expect(wrapper(f).value).toBe('#5f78b8');
    expect(p.format).toBe('hex');
    expect(p.inputId).toBe('c');
  });

  it('reports a pick to the form', async () => {
    const f = await render();
    wrapper(f).onPick({ value: '#2b58cc' });
    expect(f.componentInstance.control.value).toBe('#2b58cc');
  });

  it('follows the form disabled state', async () => {
    const f = await render();
    f.componentInstance.control.disable();
    f.detectChanges();
    expect(wrapper(f).disabled).toBe(true);
  });
});
