import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Rating } from 'primeng/rating';
import { BapsRating } from './rating.component';

@Component({
  imports: [BapsRating, ReactiveFormsModule],
  template: `<baps-rating [stars]="10" [formControl]="control" />`,
})
class Host {
  readonly control = new FormControl<number | null>(2);
}

async function render() {
  const f = TestBed.createComponent(Host);
  f.detectChanges();
  await f.whenStable();
  f.detectChanges();
  return f;
}
const wrapper = (f: Awaited<ReturnType<typeof render>>) => f.debugElement.query(By.directive(BapsRating)).componentInstance as any;

describe('BapsRating', () => {
  it('renders the given number of stars', async () => {
    const f = await render();
    expect((f.debugElement.query(By.directive(Rating)).componentInstance as any).stars).toBe(10);
    expect(f.nativeElement.querySelectorAll('.p-rating-option').length).toBe(10);
  });

  it('reports a pick to the form', async () => {
    const f = await render();
    wrapper(f).onPick(4);
    expect(f.componentInstance.control.value).toBe(4);
  });

  it('follows the form disabled state', async () => {
    const f = await render();
    f.componentInstance.control.disable();
    f.detectChanges();
    expect(wrapper(f).disabled).toBe(true);
  });
});
