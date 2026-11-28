import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ToggleButton } from 'primeng/togglebutton';
import { BapsToggleButton } from './toggle-button.component';

@Component({
  imports: [BapsToggleButton, ReactiveFormsModule],
  template: `<baps-toggle-button [formControl]="control" onIcon="pi pi-check" />`,
})
class Host {
  readonly control = new FormControl<boolean>(false);
}

async function render() {
  const f = TestBed.createComponent(Host);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}
const prime = (f: Awaited<ReturnType<typeof render>>) => f.debugElement.query(By.directive(ToggleButton)).componentInstance as any;
const wrapper = (f: Awaited<ReturnType<typeof render>>) => f.debugElement.query(By.directive(BapsToggleButton)).componentInstance as any;

describe('BapsToggleButton', () => {
  it("keeps PrimeNG's labels when none are given", async () => {
    const p = prime(await render());
    expect(p.onLabel).toBe('Yes');
    expect(p.offLabel).toBe('No');
    expect(p.onIcon).toBe('pi pi-check');
  });

  it('reports a toggle to the form and marks it touched', async () => {
    const f = await render();
    wrapper(f).onPick({ checked: true });
    expect(f.componentInstance.control.value).toBe(true);
    expect(f.componentInstance.control.touched).toBe(true);
  });

  it('follows the form disabled state', async () => {
    const f = await render();
    f.componentInstance.control.disable();
    f.detectChanges();
    expect(wrapper(f).disabled).toBe(true);
  });
});
