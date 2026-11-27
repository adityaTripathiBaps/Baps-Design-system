import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Injector,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation,
  forwardRef,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { InputMask } from 'primeng/inputmask';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-input-mask — a text field that takes input in a fixed format
 * (phone, date, serial). Wraps PrimeNG InputMask (primeng.dev/inputmask) as a
 * form control; the inner field is a pInputText, so it wears the kit's input
 * skin in both brands.
 *
 * Mask characters: `a` letter, `9` digit, `*` letter or digit; text after `?`
 * is optional.
 */
@Component({
  selector: 'baps-input-mask',
  imports: [InputMask, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-inputmask
      [(ngModel)]="value"
      [mask]="mask!"
      [slotChar]="slotChar"
      [autoClear]="autoClear"
      [unmask]="unmask"
      [keepBuffer]="keepBuffer"
      [characterPattern]="characterPattern"
      [showClear]="showClear"
      [type]="type"
      [placeholder]="placeholder!"
      [disabled]="disabled"
      [readonly]="readonly!"
      [invalid]="resolvedInvalid"
      [size]="size!"
      [variant]="variant!"
      [fluid]="fluid"
      [inputId]="inputId!"
      [name]="name!"
      [tabindex]="tabindex!"
      [title]="title!"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [ariaRequired]="ariaRequired!"
      [autofocus]="autofocus"
      [autocomplete]="autocomplete!"
      [styleClass]="styleClass!"
      (ngModelChange)="onModel($event)"
      (onComplete)="completed.emit($event)"
      (onFocus)="focused.emit($event)"
      (onBlur)="onTouched(); blurred.emit($event)"
      (onInput)="inputChange.emit($event)"
      (onKeydown)="keydown.emit($event)"
      (onClear)="cleared.emit($event)"
    >
      @if (tpl('clearicon'); as t) {
        <ng-template pTemplate="clearicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
    </p-inputmask>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-input-mask {
      display: block;
    }
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BapsInputMask), multi: true }],
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsInputMask implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private hostControl?: NgControl | null;

  /** e.g. `99-999999`, `(999) 999-9999`, `a*-999-a999`. */
  @Input() mask?: string;
  /** Placeholder for each unfilled slot. */
  @Input() slotChar = '_';
  /** Clear an incomplete value on blur. */
  @Input() autoClear = true;
  /** Report the raw characters only, without the mask's literals. */
  @Input() unmask = false;
  @Input() keepBuffer = false;
  /** Regex class for `a`. */
  @Input() characterPattern = '[A-Za-z]';
  @Input() showClear = false;
  @Input() type = 'text';
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() readonly?: boolean;
  /** Left unset, a Sampark field follows its form control, as baps-select. */
  @Input() invalid?: boolean;
  @Input() size?: 'small' | 'large';
  @Input() variant?: 'outlined' | 'filled';
  @Input() fluid = false;
  @Input() inputId?: string;
  @Input() name?: string;
  @Input() tabindex?: string;
  @Input() title?: string;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() ariaRequired?: boolean;
  @Input() autofocus = false;
  @Input() autocomplete?: string;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  /** Every slot is filled. */
  @Output() readonly completed = new EventEmitter<any>();
  @Output() readonly focused = new EventEmitter<Event>();
  @Output() readonly blurred = new EventEmitter<Event>();
  @Output() readonly inputChange = new EventEmitter<Event>();
  @Output() readonly keydown = new EventEmitter<Event>();
  @Output() readonly cleared = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  value: any;
  private onChange: (v: unknown) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

  get resolvedInvalid(): boolean | undefined {
    if (this.invalid !== undefined) return this.invalid;
    if (this.brand !== 'sampark') return undefined;
    this.hostControl ??= this.injector.get(NgControl, null, { self: true, optional: true });
    const c = this.hostControl;
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  protected onModel(value: unknown): void {
    this.onChange(value);
  }

  writeValue(value: unknown): void {
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
