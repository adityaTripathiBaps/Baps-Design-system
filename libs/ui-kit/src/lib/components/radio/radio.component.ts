import { Component, Input, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { RadioButton } from 'primeng/radiobutton';
// Sampark skin lives in the theme layer so one token block drives both the
// whole-preview Sampark preset and this per-instance dt scoping.
import { SAMPARK_RADIO_TOKENS } from '../../theme/sampark.theme';

// Deterministic per-instance id — Math.random() would break SSR hydration
// (server and client render different ids for the same label/input pair).
// Same reasoning as baps-checkbox.
let nextRadioId = 0;

/**
 * baps-radio — single-choice form control.
 *
 * Wraps PrimeNG RadioButton with ControlValueAccessor, mirroring baps-checkbox
 * so the two read identically at call sites.
 *
 * Spec: Sampark node 13197:89044 and MyBKY node 22465:108841 — each frame is
 * named "Checkbox" but carries BOTH types across the same matrix:
 * Size {S (16), L (Mob, 22)} x Status {Default, Hover, Disabled} x
 * Checked {True, False}. Resting border is Mono/60, hover Primary/80, checked
 * Primary/60, disabled fill Mono/20 with a Mono/40 ring.
 *
 * Checked stays WHITE — ring and dot carry the colour — with ONE exception:
 * a checked Sampark radio under the pointer fills solid Primary/80 #b44141
 * and flips its dot white. That is deliberate and Sampark-only; the MyBKY
 * frame has no such row, and the checkbox never fills in either brand.
 *
 * Radio has no Intermediate status — that row exists only for Checkbox, which
 * is why this component has no `indeterminate` input.
 *
 * ## Grouping
 * Radios group by a shared `name`. With reactive forms, bind several to the
 * same form control and give each a distinct `radioValue`:
 *
 *   <baps-radio name="scope" radioValue="all"  label="All"  formControlName="scope" />
 *   <baps-radio name="scope" radioValue="mine" label="Mine" formControlName="scope" />
 */
@Component({
  selector: 'baps-radio',
  imports: [RadioButton, FormsModule],
  template: `
    <div class="baps-radio-wrapper">
      <p-radiobutton
        [(ngModel)]="value"
        [value]="radioValue"
        [disabled]="disabled"
        [inputId]="inputId"
        [name]="name || ''"
        [variant]="variant"
        [dt]="dt"
        (onClick)="onRadioChange($event)"
      ></p-radiobutton>
      @if (label) {
        <label [for]="inputId" class="p-radiobutton-label" [class.p-disabled]="disabled">{{ label }}</label>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Structured exactly like baps-checkbox: everything with a PrimeNG token
       (box size, resting/hover/checked border, the white checked fill, dot
       colour and size, disabled fill) lives in each brand's preset, and only
       what has no token slot is written here, brand-neutral, with each brand
       re-pointing the custom properties.

       MyBKY is the default brand and holds the base values. */
    baps-radio {
      --sel-border-hover: var(--color-mybky-primary-active, #384871);
      --sel-ring: 0 0 0 2px #f2f1f0;
      --sel-disabled-border: var(--color-mybky-mono-450, #8d9ba5);
      --sel-disabled-checked-bg: var(--color-mybky-mono-300, #e4ecf1);
      --sel-disabled-checked-dot: var(--color-mybky-mono-450, #8d9ba5);
      --sel-dot-lg: 11px;
      --sel-label: var(--color-mybky-text-primary, #181b1d);
      --sel-label-disabled: var(--color-mybky-mono-450, #8d9ba5);
    }

    :is(baps-radio.baps-sampark, .baps-ds-sampark baps-radio) {
      --sel-border-hover: var(--color-sampark-primary-hover, #b44141);
      --sel-disabled-border: var(--color-sampark-mono-40, #bcb9b9);
      /* As with the checkbox, Sampark's disabled+checked control fills solid
         and flips its dot white; MyBKY keeps the pale ground and greys the
         dot. */
      --sel-disabled-checked-bg: var(--color-sampark-mono-40, #bcb9b9);
      --sel-disabled-checked-dot: var(--color-sampark-mono-0, #ffffff);
      --sel-dot-lg: 10px;
      --sel-label: var(--color-sampark-text-primary, #151414);
      --sel-label-disabled: var(--color-sampark-text-disabled, #bcb9b9);
    }

    baps-radio .baps-radio-wrapper {
      display: inline-flex;
      align-items: center;
    }

    /* Border width lives in styles/components/checkbox/_checkbox.scss with the
       checkbox's, for the same reason: PrimeNG renders bare p-radiobutton
       elements of its own that a baps-radio-anchored rule cannot reach. */
    baps-radio .p-radiobutton-box {
      transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
    }

    /* Hover and keyboard focus share one treatment. Focus lands on the nested
       input.p-radiobutton-input, not on .p-radiobutton, which is why the ring
       is drawn off the input rather than the wrapper. The near-white ring is
       paired with the border-colour change so focus stays perceivable on a
       white surface (WCAG 2.4.7). */
    baps-radio .p-radiobutton-input:focus-visible + .p-radiobutton-box {
      border-color: var(--sel-border-hover);
    }
    baps-radio .p-radiobutton:not(.p-disabled):hover .p-radiobutton-box,
    baps-radio .p-radiobutton-input:focus-visible + .p-radiobutton-box {
      box-shadow: var(--sel-ring);
    }
    baps-radio .p-radiobutton-input:focus,
    baps-radio .p-radiobutton-input:focus-visible {
      outline: 0;
      box-shadow: none;
    }

    /* PrimeNG dims a disabled control with opacity; both frames swap to
       distinct inks at full opacity instead. disabledBorderColor has no token
       slot for the UNCHECKED row, hence the explicit border. */
    baps-radio .p-radiobutton.p-disabled .p-radiobutton-box {
      opacity: 1;
      border-width: 1px;
      border-color: var(--sel-disabled-border);
      box-shadow: none;
    }

    /* Checked + disabled. PrimeNG keeps checkedBackground here rather than
       falling back to disabledBackground, so the fill and the dot are both
       restated. */
    baps-radio .p-radiobutton-checked.p-disabled .p-radiobutton-box {
      background: var(--sel-disabled-checked-bg);
    }
    baps-radio .p-radiobutton-checked.p-disabled .p-radiobutton-icon {
      background: var(--sel-disabled-checked-dot);
    }

    /* Label: BAPS's own markup, so no PrimeNG radiobutton token addresses it.
       Typography is identical to the checkbox by design — both frames specify
       Inter 14/400 at 130% with an 8px gap. */
    baps-radio .p-radiobutton-label {
      color: var(--sel-label);
      font-size: 0.875rem;
      line-height: 1.3;
      margin-left: 0.5rem;
      cursor: pointer;
      user-select: none;
    }
    baps-radio .p-radiobutton.p-disabled + .p-radiobutton-label {
      color: var(--sel-label-disabled);
      cursor: not-allowed;
    }

    /* ── Size L (mobile) ──
       22px, not the 24 in the layer name — measured off both brand frames,
       same as the checkbox. The dot scales with the box; only the box used to
       be resized, so a large radio kept its small-size dot. */
    baps-radio.baps-radio-lg .p-radiobutton,
    baps-radio.baps-radio-lg .p-radiobutton-box {
      width: 22px;
      height: 22px;
    }
    baps-radio.baps-radio-lg .p-radiobutton-icon {
      width: var(--sel-dot-lg);
      height: var(--sel-dot-lg);
    }
    baps-radio.baps-radio-lg .p-radiobutton-label {
      font-size: 1rem;
      margin-left: 0.625rem;
    }

    /* ── Dark ──
       The control itself comes from each preset's colorScheme.dark block; only
       the label and the ring need re-pointing, since the pale ring disappears
       on a dark ground. */
    .baps-dark baps-radio {
      --sel-ring: 0 0 0 2px rgba(255, 255, 255, 0.12);
      --sel-label: var(--color-mybky-dark-text-primary, #f8fafb);
      --sel-label-disabled: var(--color-mybky-dark-text-disabled, #6f777d);
    }
    .baps-dark :is(baps-radio.baps-sampark, .baps-ds-sampark baps-radio) {
      --sel-label: var(--color-sampark-dark-text-primary, #f8fafb);
      --sel-label-disabled: var(--color-sampark-dark-text-disabled, #6f777d);
    }`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsRadio),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-radio-lg]': "size === 'large'",
  },
})
export class BapsRadio implements ControlValueAccessor {
  /** Label displayed next to the control. */
  @Input() label?: string;
  /** The value this radio contributes to its group when selected. */
  @Input() radioValue?: any;
  @Input() disabled = false;
  @Input() inputId = `baps-radio-${nextRadioId++}`;
  /** Radios sharing a `name` form one group. */
  @Input() name: string | undefined;
  /** PrimeNG variant: 'outlined' or 'filled'. */
  @Input() variant?: 'outlined' | 'filled';
  /**
   * Figma defines two steps: S (16px control / 14px label) and
   * L (22px box / 16px label), the latter for mobile. Figma names the step
   * "L (24) (Mob)" but draws a 22px box.
   */
  @Input() size?: 'small' | 'large';
  /** Visual skin. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  value: any = null;

  private onChange: any = () => { /* empty */ };
  private onTouched: any = () => { /* empty */ };

  /**
   * Per-instance Sampark skin, so one radio can be Sampark on a MyBKY page.
   * MyBKY needs no override — it is the global preset.
   */
  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_RADIO_TOKENS : undefined;
  }

  onRadioChange(_event: unknown): void {
    // PrimeNG has already written the selected value into `value` through
    // ngModel by the time onClick fires; forward it to the form and mark
    // touched, matching baps-checkbox's contract.
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
