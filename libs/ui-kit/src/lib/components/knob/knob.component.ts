import { ChangeDetectorRef, Component, EventEmitter, Input, Output, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Knob } from 'primeng/knob';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-knob — a round dial for a number in a range; drag, click or use the
 * arrow keys. Wraps PrimeNG Knob (primeng.dev/knob) as a form control.
 *
 * Defaults are PrimeNG's own (primeng-knob.mjs): an unset input bound through
 * as undefined would wipe them (no stroke colour, NaN size).
 */
@Component({
  selector: 'baps-knob',
  imports: [Knob, FormsModule],
  template: `
    <p-knob
      [(ngModel)]="value"
      [min]="min"
      [max]="max"
      [step]="step"
      [size]="size"
      [strokeWidth]="strokeWidth"
      [showValue]="showValue"
      [valueTemplate]="valueTemplate"
      [valueColor]="valueColor"
      [rangeColor]="rangeColor"
      [textColor]="textColor"
      [readonly]="readonly"
      [disabled]="disabled"
      [tabindex]="tabindex"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [styleClass]="styleClass!"
      (onChange)="onPick($event)"
    />
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BapsKnob), multi: true }],
  host: { '[class.baps-sampark]': "brand === 'sampark'", style: 'display: inline-block' },
})
export class BapsKnob implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  /** Diameter in px. */
  @Input() size = 100;
  @Input() strokeWidth = 14;
  @Input() showValue = true;
  /** Text in the middle; `{value}` is replaced, e.g. `{value}%`. */
  @Input() valueTemplate = '{value}';
  @Input() valueColor = 'var(--p-knob-value-background)';
  @Input() rangeColor = 'var(--p-knob-range-background)';
  @Input() textColor = 'var(--p-knob-text-color)';
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() tabindex = 0;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  /** The new number; the form already gets it. */
  @Output() readonly changed = new EventEmitter<number>();

  value: number | null = null;
  private onChange: (v: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected onPick(value: number): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.changed.emit(value);
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
