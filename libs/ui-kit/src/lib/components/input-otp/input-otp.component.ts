import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputOtp } from 'primeng/inputotp';
import { InputText } from 'primeng/inputtext';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-input-otp: a one-time-code field, one box per digit.
 *
 * Wraps PrimeNG `p-inputotp`. Its own cell rendering is replaced through the
 * documented `#input` template for one reason: Figma's 6-digit variant splits
 * the code 3-3 with a "-" between the groups, and PrimeNG has no separator
 * slot. Focus traversal still belongs to PrimeNG, because `findNextInput` /
 * `findPrevInput` skip any sibling that is not an `<input>`, so the separator
 * `<span>` does not break typing, Backspace or the arrow keys.
 *
 * Each cell keeps `pInputText`, so the brand input skin (border, hover, focus
 * ring, error, disabled) applies to it exactly as it does to a text field. The
 * partial only sets the geometry that differs: a 36 × 36 cell with centred
 * 20px digits.
 *
 * Figma: "🟢 Component Library" PKHWEQTVUKl6FAeQSIkXMW, Input OTP 754:4740
 * (web) and 7772:165802 (mobile). Label and hint are not part of this
 * component; compose them around it like any other field.
 *
 * ## Usage
 *   <label for="otp">Verification code</label>
 *   <baps-input-otp inputId="otp" [(ngModel)]="code" [length]="6" />
 */
let nextOtpId = 0;

@Component({
  selector: 'baps-input-otp',
  imports: [InputOtp, InputText, FormsModule],
  template: `
    <p-inputotp
      [(ngModel)]="value"
      [length]="length"
      [integerOnly]="integerOnly"
      [disabled]="disabled"
      [readonly]="readonly"
      [invalid]="invalid"
      (onChange)="onUserChange($event.value)"
      (onBlur)="onTouched()"
    >
      <ng-template #input let-token let-events="events" let-index="index">
        <input
          type="text"
          pInputText
          class="p-inputotp-input"
          [attr.id]="index === 1 ? inputId : null"
          [value]="token ?? ''"
          [attr.maxlength]="index === 1 ? length : 1"
          [attr.inputmode]="integerOnly ? 'numeric' : 'text'"
          [attr.autocomplete]="index === 1 ? 'one-time-code' : 'off'"
          [attr.aria-label]="'Digit ' + index + ' of ' + length"
          [attr.readonly]="readonly ? '' : null"
          [disabled]="disabled"
          [invalid]="invalid"
          (input)="events.input($event)"
          (keydown)="events.keydown($event)"
          (focus)="events.focus($event)"
          (blur)="events.blur($event)"
          (paste)="events.paste($event)"
        />
        @if (showSeparator && index === length / 2) {
          <span class="baps-input-otp__separator" aria-hidden="true">-</span>
        }
      </ng-template>
    </p-inputotp>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/input-otp/_input-otp.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsInputOtp),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsInputOtp implements ControlValueAccessor {
  /** Number of digit boxes. Figma ships 4 and 6. */
  @Input() length = 6;
  /**
   * Split the boxes into two halves with a "-". Unset follows Figma: on for
   * 6 digits, off for 4. Ignored for an odd length.
   */
  @Input() separator?: boolean;
  /** Digits only, with the numeric keypad on touch devices. */
  @Input() integerOnly = true;
  @Input() disabled = false;
  @Input() readonly = false;
  /** Paints every box in the error state. */
  @Input() invalid = false;
  /** Lands on the first box, so a `<label for>` focuses the field. */
  @Input() inputId = `baps-input-otp-${nextOtpId++}`;
  @Input() brand: BapsBrand = injectBapsBrand();
  /** The code, emitted only when the user types or pastes. */
  @Output() valueChange = new EventEmitter<string>();

  value: string | null = null;

  get showSeparator(): boolean {
    return this.length % 2 === 0 && (this.separator ?? this.length === 6);
  }

  private onModelChange: (value: string) => void = () => {
    /* set by registerOnChange */
  };
  onTouched: () => void = () => {
    /* set by registerOnTouched */
  };

  onUserChange(value: string): void {
    this.onModelChange(value);
    this.valueChange.emit(value);
  }

  writeValue(value: string | null): void {
    this.value = value ?? null;
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onModelChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
