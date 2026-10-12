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

  /** Mirrors PrimeNG's input event with the clamped numeric value. */
  @Output() readonly valueChange = new EventEmitter<InputNumberInputEvent>();

  value: number | null = null;

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
    const next = this.normalise(event.value);
    this.value = next;
    this.onChange(next);
    this.valueChange.emit({ ...event, value: next });
  }

  handleBlur(): void {
    this.onTouched();
  }

  stepValue(event: MouseEvent, direction: 1 | -1): void {
    if (this.disabled) return;

    const base = this.value ?? 0;
    const next = this.normalise(base + direction);
    this.value = next;
    this.onChange(next);
    this.onTouched();
    this.valueChange.emit({
      originalEvent: event,
      value: next,
      formattedValue: next == null ? '' : String(next),
    });
  }

  writeValue(value: number | null): void {
    this.value = this.normalise(value);
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

  private normalise(value: number | null): number | null {
    if (value == null || Number.isNaN(value)) return null;

    let next = value;
    if (this.min != null) next = Math.max(this.min, next);
    if (this.max != null) next = Math.min(this.max, next);

    if (this.maxFractionDigits != null) {
      const factor = 10 ** this.maxFractionDigits;
      next = Math.round((next + Number.EPSILON) * factor) / factor;
    }

    return next;
  }
}
