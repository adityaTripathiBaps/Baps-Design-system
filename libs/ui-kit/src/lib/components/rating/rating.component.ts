import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  forwardRef,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { Rating } from 'primeng/rating';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-rating — pick a score out of a row of stars. Wraps PrimeNG Rating
 * (primeng.dev/rating) as a form control; `onicon` / `officon` templates
 * replace the stars.
 */
@Component({
  selector: 'baps-rating',
  imports: [Rating, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-rating
      [(ngModel)]="value"
      [stars]="stars"
      [readonly]="readonly"
      [disabled]="disabled"
      [autofocus]="autofocus"
      [iconOnClass]="iconOnClass!"
      [iconOnStyle]="iconOnStyle!"
      [iconOffClass]="iconOffClass!"
      [iconOffStyle]="iconOffStyle!"
      (ngModelChange)="onPick($event)"
      (onRate)="rated.emit($event)"
      (onFocus)="focused.emit($event)"
      (onBlur)="onTouched(); blurred.emit($event)"
    >
      @if (tpl('onicon'); as t) {
        <ng-template pTemplate="onicon" let-star let-cls="class">
          <ng-container *ngTemplateOutlet="t; context: { $implicit: star, class: cls }" />
        </ng-template>
      }
      @if (tpl('officon'); as t) {
        <ng-template pTemplate="officon" let-star let-cls="class">
          <ng-container *ngTemplateOutlet="t; context: { $implicit: star, class: cls }" />
        </ng-template>
      }
    </p-rating>
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BapsRating), multi: true }],
  host: { '[class.baps-sampark]': "brand === 'sampark'", style: 'display: inline-block' },
})
export class BapsRating implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() stars = 5;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() autofocus = false;
  @Input() iconOnClass?: string;
  @Input() iconOnStyle?: Record<string, string | number>;
  @Input() iconOffClass?: string;
  @Input() iconOffStyle?: Record<string, string | number>;
  @Input() brand: BapsBrand = injectBapsBrand();

  /** PrimeNG's onRate event ({ originalEvent, value }). */
  @Output() readonly rated = new EventEmitter<any>();
  @Output() readonly focused = new EventEmitter<any>();
  @Output() readonly blurred = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  value: number | null = null;
  private onChange: (v: unknown) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

  protected onPick(value: number | null): void {
    this.onChange(value);
  }

  writeValue(value: number | null): void {
    this.cdr.markForCheck();
    this.value = value;
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cdr.markForCheck();
    this.disabled = isDisabled;
  }
}
