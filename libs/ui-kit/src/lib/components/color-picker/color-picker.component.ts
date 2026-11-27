import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColorPicker } from 'primeng/colorpicker';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-color-picker — pick a colour from a saturation square and a hue strip,
 * in a popup or inline. Wraps PrimeNG ColorPicker (primeng.dev/colorpicker)
 * as a form control; the value is a hex string, or an { r, g, b } /
 * { h, s, b } object with `format`.
 */
@Component({
  selector: 'baps-color-picker',
  imports: [ColorPicker, FormsModule],
  template: `
    <p-colorpicker
      [(ngModel)]="value"
      [inline]="inline"
      [format]="format"
      [defaultColor]="defaultColor!"
      [disabled]="disabled"
      [inputId]="inputId!"
      [tabindex]="tabindex!"
      [autofocus]="autofocus"
      [appendTo]="appendTo"
      [styleClass]="styleClass!"
      (onChange)="onPick($event)"
      (onShow)="shown.emit($event)"
      (onHide)="hidden.emit($event); onTouched()"
    />
  `,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BapsColorPicker), multi: true }],
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsColorPicker implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  /** Show the picker in the page instead of a popup. */
  @Input() inline = false;
  @Input() format: 'hex' | 'rgb' | 'hsb' = 'hex';
  /** Colour the picker opens on while there is no value. */
  @Input() defaultColor?: string;
  @Input() disabled = false;
  @Input() inputId?: string;
  @Input() tabindex?: string;
  @Input() autofocus = false;
  @Input() appendTo: any = 'body';
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  /** PrimeNG's onChange event ({ originalEvent, value }); the form already gets the value. */
  @Output() readonly changed = new EventEmitter<any>();
  @Output() readonly shown = new EventEmitter<any>();
  @Output() readonly hidden = new EventEmitter<any>();

  value: any;
  private onChange: (v: unknown) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected onPick(event: any): void {
    this.value = event.value;
    this.onChange(event.value);
    this.changed.emit(event);
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
