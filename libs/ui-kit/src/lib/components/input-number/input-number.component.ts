import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { InputNumber, InputNumberInputEvent } from 'primeng/inputnumber';

import { BapsIcon } from '../icon/icon.component';

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
    <span class="baps-input-number__control">
      <p-inputnumber
        [(ngModel)]="value"
        [showButtons]="false"
        [min]="min"
        [max]="max"
        [maxlength]="maxlength ?? null"
        [maxFractionDigits]="maxFractionDigits"
        [inputStyleClass]="inputStyleClass"
        [styleClass]="styleClass"
        [useGrouping]="useGrouping"
        [mode]="mode"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [size]="size"
        (onInput)="handleInput($event)"
        (onBlur)="handleBlur()"
      />

      @if (showButtons) {
        <span class="baps-input-number__buttons">
          <button
            type="button"
            class="baps-input-number__button baps-input-number__button--increment"
            aria-label="Increase value"
            [disabled]="disabled || atMaximum"
            (click)="stepValue($event, 1)"
          >
            <baps-icon name="plus" size="xs" />
          </button>
          <button
            type="button"
            class="baps-input-number__button baps-input-number__button--decrement"
            aria-label="Decrease value"
            [disabled]="disabled || atMinimum"
            (click)="stepValue($event, -1)"
          >
            <baps-icon name="minus" size="xs" />
          </button>
        </span>
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
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() size?: 'small' | 'large';
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
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
    if (this.disabled) return;

    const base = this.value ?? 0;
    const next = this.normalise(base + direction);
    this.value = next;
    this.emit(next);
    this.onTouched();
    this.valueChange.emit({
      originalEvent: event,
      value: next,
      formattedValue: next == null ? '' : String(next),
    });
  }

  /**
   * Shows the form's value as it is, out of range or not, as raw PrimeNG does.
   * Clamping here displayed min while the form still held the stored value:
   * SPM dev shows a saved 0 in a min-1 field, the kit showed 1 (Templates
   * reminder, 2026-11-19). Range applies when the user edits (clampOn).
   */
  writeValue(value: number | null): void {
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
