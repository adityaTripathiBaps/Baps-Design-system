import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  forwardRef,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { InputNumber, InputNumberInputEvent } from 'primeng/inputnumber';

import { BapsIcon } from '../icon/icon.component';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * A numeric field with the spinner treatment used throughout Sampark forms.
 *
 * PrimeNG owns parsing, locale-aware formatting, and the spinbutton semantics
 * on the input. Its built-in icon buttons are deliberately removed from the
 * tab order, however, so this wrapper renders named native buttons when
 * `showButtons` is enabled. That keeps the measured spinner shape while making
 * both actions reachable to keyboard and screen-reader users.
 */
@Component({
  selector: 'baps-input-number',
  imports: [FormsModule, InputNumber, BapsIcon],
  template: `
    <span
      class="baps-input-number__control"
      [class.baps-input-number__control--horizontal]="showButtons && buttonLayout === 'horizontal'"
      [class.baps-input-number__control--vertical]="showButtons && buttonLayout === 'vertical'"
      [class.baps-input-number__control--fluid]="fluid"
      [style.--baps-input-number-field-width]="inputStyle?.['width'] ?? null"
    >
      @if (showButtons && buttonLayout !== 'stacked') {
        <button
          type="button"
          class="baps-input-number__button baps-input-number__button--side"
          [class.baps-input-number__button--decrement]="buttonLayout === 'horizontal'"
          [class.baps-input-number__button--increment]="buttonLayout === 'vertical'"
          [attr.aria-label]="buttonLayout === 'vertical' ? 'Increase value' : 'Decrease value'"
          [disabled]="disabled || readonly || (buttonLayout === 'vertical' ? atMaximum : atMinimum)"
          (click)="stepValue($event, buttonLayout === 'vertical' ? 1 : -1)"
        >
          <baps-icon [name]="buttonLayout === 'vertical' ? 'plus' : 'minus'" size="xs" />
        </button>
      }
      <p-inputnumber
        [(ngModel)]="value"
        [showButtons]="false"
        [min]="min"
        [max]="max"
        [step]="step"
        [maxlength]="maxlength ?? null"
        [minFractionDigits]="minFractionDigits"
        [maxFractionDigits]="maxFractionDigits"
        [inputStyleClass]="inputStyleClass"
        [inputStyle]="inputStyle"
        [styleClass]="styleClass"
        [useGrouping]="useGrouping"
        [mode]="mode"
        [locale]="locale"
        [currency]="currency"
        [currencyDisplay]="currencyDisplay"
        [prefix]="prefix"
        [suffix]="suffix"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [readonly]="readonly"
        [invalid]="invalid"
        [fluid]="fluid"
        [variant]="variant"
        [showClear]="showClear"
        [allowEmpty]="allowEmpty"
        [format]="format"
        [inputId]="inputId"
        [ariaLabel]="ariaLabel"
        [ariaLabelledBy]="ariaLabelledBy"
        [tabindex]="tabindex"
        [autofocus]="autofocus"
        [size]="size"
        (onInput)="handleInput($event)"
        (onBlur)="handleBlur()"
        (onClear)="handleClear()"
      />

      @if (showButtons && buttonLayout === 'stacked') {
        <span class="baps-input-number__buttons">
          <button
            type="button"
            class="baps-input-number__button baps-input-number__button--increment"
            aria-label="Increase value"
            [disabled]="disabled || readonly || atMaximum"
            (click)="stepValue($event, 1)"
          >
            <baps-icon name="plus" size="xs" />
          </button>
          <button
            type="button"
            class="baps-input-number__button baps-input-number__button--decrement"
            aria-label="Decrease value"
            [disabled]="disabled || readonly || atMinimum"
            (click)="stepValue($event, -1)"
          >
            <baps-icon name="minus" size="xs" />
          </button>
        </span>
      }
      @if (showButtons && buttonLayout !== 'stacked') {
        <button
          type="button"
          class="baps-input-number__button baps-input-number__button--side"
          [class.baps-input-number__button--increment]="buttonLayout === 'horizontal'"
          [class.baps-input-number__button--decrement]="buttonLayout === 'vertical'"
          [attr.aria-label]="buttonLayout === 'vertical' ? 'Decrease value' : 'Increase value'"
          [disabled]="disabled || readonly || (buttonLayout === 'vertical' ? atMinimum : atMaximum)"
          (click)="stepValue($event, buttonLayout === 'vertical' ? -1 : 1)"
        >
          <baps-icon [name]="buttonLayout === 'vertical' ? 'minus' : 'plus'" size="xs" />
        </button>
      }
    </span>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/input-number/_input-number.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsInputNumber),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsInputNumber implements ControlValueAccessor {
  /** A value written from code has no template event behind it to schedule a render. */
  private readonly cdr = inject(ChangeDetectorRef);
  /** Spinner controls are the default because all measured consumers use them. */
  @Input() showButtons = true;
  @Input() min?: number;
  @Input() max?: number;
  @Input() maxlength?: number;
  @Input() maxFractionDigits?: number;
  @Input() inputStyleClass?: string;
  @Input() styleClass?: string;
  @Input() useGrouping = true;
  @Input() mode: 'decimal' | 'currency' = 'decimal';
  /**
   * Where the spin buttons sit, as PrimeNG's buttonLayout. 'stacked' (default)
   * is the measured Sampark spinner: a column of two to the right of the field.
   * 'horizontal' puts minus before and plus after the field ("Horizontal with
   * Step" in PrimeNG's demo); 'vertical' puts plus above and minus below.
   */
  @Input() buttonLayout: 'stacked' | 'horizontal' | 'vertical' = 'stacked';
  /** Amount one button press or arrow key adds or removes. */
  @Input() step = 1;
  @Input() minFractionDigits?: number;
  /** BCP 47 locale for grouping and decimal separators, e.g. 'en-IN'. */
  @Input() locale?: string;
  /** ISO 4217 code; required when mode is 'currency'. */
  @Input() currency?: string;
  @Input() currencyDisplay?: 'symbol' | 'code' | 'name';
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() inputStyle?: Record<string, string | number>;
  @Input() readonly = false;
  @Input() invalid = false;
  /** Full width of its container. */
  @Input() fluid = false;
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  /** A clear icon inside the field; clearing reports null. */
  @Input() showClear = false;
  @Input() allowEmpty = true;
  /** false shows the raw number without locale formatting. */
  @Input() format = true;
  @Input() inputId?: string;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() tabindex?: number;
  @Input() autofocus = false;
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() size?: 'small' | 'large';
  @Input() brand: BapsBrand = injectBapsBrand();
  /**
   * When min/max apply. `input` (default) clamps on every keystroke, so a
   * typed 0 with min 1 becomes 1 at once. `blur` keeps the typed value until
   * the field loses focus, as raw PrimeNG does, so a form validator can still
   * see and report the out-of-range value while the user is typing.
   */
  @Input() clampOn: 'input' | 'blur' = 'input';

  /** Mirrors PrimeNG's input event with the clamped numeric value. */
  @Output() readonly valueChange = new EventEmitter<InputNumberInputEvent>();

  value: number | null = null;
  /** The last value handed to the form. */
  private sent: number | null = null;

  private onChange: (value: number | null) => void = () => {
    /* empty */
  };
  private onTouched: () => void = () => {
    /* empty */
  };

  get atMaximum(): boolean {
    return this.value != null && this.max != null && this.value >= this.max;
  }

  get atMinimum(): boolean {
    return this.value != null && this.min != null && this.value <= this.min;
  }

  handleInput(event: InputNumberInputEvent): void {
    const next = this.normalise(event.value, this.clampOn === 'input');
    this.value = next;
    this.emit(next);
    this.valueChange.emit({ ...event, value: next });
  }

  handleBlur(): void {
    // Compare with what the form last received: PrimeNG's own blur may already
    // have clamped `value` through the inner [(ngModel)].
    if (this.clampOn === 'blur') {
      const next = this.normalise(this.value);
      this.value = next;
      if (next !== this.sent) this.emit(next);
    }
    this.onTouched();
  }

  stepValue(event: MouseEvent, direction: 1 | -1): void {
    if (this.disabled || this.readonly) return;

    const base = this.value ?? 0;
    // Round to the precision of step or value: 0.1 + 0.2 must read 0.3, not
    // 0.30000000000000004, when the step is a fraction (0.25, 0.1).
    const digits = Math.max(decimals(this.step), decimals(base));
    const factor = 10 ** digits;
    const raw = Math.round((base + direction * this.step) * factor) / factor;
    const next = this.normalise(raw);
    this.value = next;
    this.emit(next);
    this.onTouched();
    this.valueChange.emit({
      originalEvent: event,
      value: next,
      formattedValue: next == null ? '' : String(next),
    });
  }

  handleClear(): void {
    this.value = null;
    this.emit(null);
  }

  /**
   * Shows the form's value as it is, out of range or not, as raw PrimeNG does.
   * Clamping here displayed min while the form still held the stored value:
   * SPM dev shows a saved 0 in a min-1 field, the kit showed 1 (Templates
   * reminder, 2026-11-19). Range applies when the user edits (clampOn).
   */
  writeValue(value: number | null): void {
    this.cdr.markForCheck();
    this.value = value;
    this.sent = value;
  }

  private emit(next: number | null): void {
    this.sent = next;
    this.onChange(next);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cdr.markForCheck();
    this.disabled = isDisabled;
  }

  private normalise(value: number | null, clamp = true): number | null {
    if (value == null || Number.isNaN(value)) return null;

    let next = value;
    if (clamp && this.min != null) next = Math.max(this.min, next);
    if (clamp && this.max != null) next = Math.min(this.max, next);

    if (this.maxFractionDigits != null) {
      const factor = 10 ** this.maxFractionDigits;
      next = Math.round((next + Number.EPSILON) * factor) / factor;
    }

    return next;
  }
}

function decimals(n: number): number {
  const s = String(n);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}
