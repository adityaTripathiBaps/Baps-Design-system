import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Knob } from 'primeng/knob';
import { BapsKnob } from './knob.component';

@Component({
  imports: [BapsKnob, ReactiveFormsModule],
  template: `<baps-knob ariaLabel="Volume" [formControl]="control" />`,
})
class Host {
  readonly control = new FormControl<number>(40);
}

async function render() {
  const f = TestBed.createComponent(Host);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}
const prime = (f: Awaited<ReturnType<typeof render>>) => f.debugElement.query(By.directive(Knob)).componentInstance as any;
const wrapper = (f: Awaited<ReturnType<typeof render>>) => f.debugElement.query(By.directive(BapsKnob)).componentInstance as any;

describe('BapsKnob', () => {
  it("keeps PrimeNG's defaults when inputs are unset", async () => {
    const p = prime(await render());
    expect(p.size).toBe(100);
    expect(p.max).toBe(100);
    expect(p.valueColor).toBe('var(--p-knob-value-background)');
    expect(p.valueTemplate).toBe('{value}');
  });

  it('reports a change to the form', async () => {
    const f = await render();
    wrapper(f).onPick(70);
    expect(f.componentInstance.control.value).toBe(70);
    expect(f.componentInstance.control.touched).toBe(true);
  });

  it('follows the form disabled state', async () => {
    const f = await render();
    f.componentInstance.control.disable();
    f.detectChanges();
    expect(wrapper(f).disabled).toBe(true);
  });
});
