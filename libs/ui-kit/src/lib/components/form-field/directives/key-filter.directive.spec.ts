import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KeyFilter } from 'primeng/keyfilter';
import { BapsKeyFilter } from './key-filter.directive';

@Component({
  imports: [BapsKeyFilter, ReactiveFormsModule],
  template: `<input bapsKeyFilter="int" [validateOnly]="true" [formControl]="control" />`,
})
class Host {
  readonly control = new FormControl('');
}

describe('BapsKeyFilter', () => {
  it('passes the pattern and validateOnly to PrimeNG KeyFilter', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const k = f.debugElement.query(By.directive(KeyFilter)).injector.get(KeyFilter) as any;
    expect(k.pattern).toBe('int');
    expect(k.pValidateOnly).toBe(true);
  });

  it("brings PrimeNG's validator: a value off the pattern is invalid", () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    f.componentInstance.control.setValue('12a');
    expect(f.componentInstance.control.valid).toBe(false);
    f.componentInstance.control.setValue('-12');
    expect(f.componentInstance.control.valid).toBe(true);
  });
});
