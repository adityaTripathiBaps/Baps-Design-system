import { Component, Input, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { Checkbox } from 'primeng/checkbox';
// Sampark skin lives in the theme layer so one token block drives both the
// whole-preview Sampark preset and this per-instance dt scoping.
import { SAMPARK_CHECKBOX_TOKENS } from '../../theme/sampark.theme';

// Deterministic per-instance id — Math.random() previously here breaks SSR
// hydration (server and client render different ids for the same element).
let nextCheckboxId = 0;

/**
 * baps-checkbox — form checkbox control.
 *
 * Wraps PrimeNG Checkbox with ControlValueAccessor.
 *
 * Both brands draw the SAME control and differ only in ramp: a 16px box
 * (22px at size="large") with a 4px radius, and — the rule that defines this
 * frame — a checked box that stays WHITE. Colour is carried by the 1.5px
 * border and the tick, never by a fill. Sampark checks in Primary/60 #c96868,
 * MyBKY in Primary/60 #5f78b8.
 *
 * Disabled does not dim with opacity either; it swaps to distinct inks. The
 * one place the two brands genuinely differ is disabled+checked: Sampark
 * fills solid Mono/40 with a white tick, MyBKY keeps the pale Mono/20 ground
 * and greys the tick to Mono/40.
 *
 * Sampark node 13197:89044, MyBKY node 22465:108841 — the same matrix in both
 * files: Size {S (16), L (Mob)} x Status {Default, Hover, Disabled} x
 * Checked {True, False}, plus an Indeterminate column.
 */
@Component({
  selector: 'baps-checkbox',
  imports: [Checkbox, FormsModule],
  template: `
    <div class="baps-checkbox-wrapper">
      <p-checkbox
        [(ngModel)]="value"
        [binary]="binary"
        [disabled]="disabled"
        [readonly]="readonly"
        [inputId]="inputId"
        [name]="name || ''"
        [value]="checkboxValue"
        [variant]="variant"
        [indeterminate]="indeterminate"
        [dt]="dt"
        (onChange)="onCheckboxChange($event)"
      ></p-checkbox>
      @if (label) {
        <label [for]="inputId" class="p-checkbox-label" [class.p-disabled]="disabled">{{ label }}</label>
      }
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Everything PrimeNG gives a token — box size, radius, resting/hover/
       checked border colour, the (white) checked fill, icon colour, disabled
       fill — lives in the preset, once per brand. What has NO token slot is
       below, written once and brand-neutral; each brand only re-points the
       custom properties.

       MyBKY is the default brand, so it holds the base values and the Sampark
       block re-points the ramp. */
    baps-checkbox {
      --sel-border-hover: var(--color-mybky-primary-active, #384871);
      --sel-border-checked: var(--color-mybky-primary-default, #5f78b8);
      --sel-ring: 0 0 0 2px #f2f1f0;
      --sel-disabled-border: var(--color-mybky-mono-450, #8d9ba5);
      --sel-disabled-checked-bg: var(--color-mybky-mono-300, #e4ecf1);
      --sel-disabled-checked-icon: var(--color-mybky-mono-450, #8d9ba5);
      --sel-label: var(--color-mybky-text-primary, #181b1d);
      --sel-label-disabled: var(--color-mybky-mono-450, #8d9ba5);
    }

    :is(baps-checkbox.baps-sampark, .baps-ds-sampark baps-checkbox) {
      --sel-border-hover: var(--color-sampark-primary-hover, #b44141);
      --sel-border-checked: var(--color-sampark-primary-default, #c96868);
      --sel-disabled-border: var(--color-sampark-mono-40, #bcb9b9);
      /* Sampark is the brand whose disabled+checked box fills SOLID; MyBKY
         keeps the pale ground and only greys the tick. The two frames really
         do differ here, so this is not an oversight to unify. */
      --sel-disabled-checked-bg: var(--color-sampark-mono-40, #bcb9b9);
      --sel-disabled-checked-icon: var(--color-sampark-mono-0, #ffffff);
      --sel-label: var(--color-sampark-text-primary, #151414);
      --sel-label-disabled: var(--color-sampark-text-disabled, #bcb9b9);
    }

    baps-checkbox .baps-checkbox-wrapper {
      display: inline-flex;
      align-items: center;
    }

    /* Border width and the suppression of Material's duplicate ::before tick
       are NOT here. They live in styles/components/checkbox/_checkbox.scss,
       because PrimeNG renders its own bare p-checkbox inside multiselect
       overlays, tables and trees, and a rule anchored to baps-checkbox can
       never reach those — they were rendering at PrimeNG's 2px while these
       were correct at 1px. One source, every checkbox on the page. */
    baps-checkbox .p-checkbox-box {
      transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
    }

    /* Indeterminate. v21 sets no class for this state on the root, but an
       unchecked box renders no icon at all — so "has an icon and is not
       checked" identifies it exactly.

       Both frames draw it the same as checked: accent border, accent minus.
       Without these two rules it inherited the RESTING grey border and, worse,
       took its glyph colour from the ambient text colour — which on a Sampark
       checkbox meant a MyBKY-navy #181b1d minus sitting in a maroon control. */
    baps-checkbox
      .p-checkbox:not(.p-checkbox-checked):not(.p-disabled)
      .p-checkbox-box:has(.p-checkbox-icon) {
      border-width: 1.5px;
      border-color: var(--sel-border-checked);
    }
    baps-checkbox
      .p-checkbox:not(.p-checkbox-checked):not(.p-disabled)
      .p-checkbox-box
      .p-checkbox-icon {
      color: var(--sel-border-checked);
    }

    /* Hover and keyboard focus share one treatment, as the frame specifies.
       Two things this fixes:
       1. The old rule was .p-checkbox:focus-visible, but .p-checkbox is a
          plain div with no tabindex — focus lands on the nested
          input.p-checkbox-input, so it never matched and keyboard users got
          no indicator at all.
       2. The ring alone is #f2f1f0, near-white, and on a white surface that is
          not a perceivable focus indicator (WCAG 2.4.7). Pairing it with the
          border-colour change is what makes focus visible — the ring is the
          accent, not the whole signal. */
    baps-checkbox .p-checkbox-input:focus-visible + .p-checkbox-box {
      border-color: var(--sel-border-hover);
    }
    baps-checkbox .p-checkbox:not(.p-disabled):hover .p-checkbox-box,
    baps-checkbox .p-checkbox-input:focus-visible + .p-checkbox-box {
      box-shadow: var(--sel-ring);
    }
    /* The native outline on the visually-hidden input is suppressed, so the
       ring above IS the focus affordance. */
    baps-checkbox .p-checkbox-input:focus,
    baps-checkbox .p-checkbox-input:focus-visible {
      outline: 0;
      box-shadow: none;
    }

    /* PrimeNG dims a disabled box with opacity; both frames use distinct inks
       instead and stay at full opacity, so the dim is forced off.
       disabledBorderColor has no token slot, hence the explicit border. */
    baps-checkbox .p-checkbox.p-disabled .p-checkbox-box {
      opacity: 1;
      border-width: 1px;
      border-color: var(--sel-disabled-border);
      box-shadow: none;
    }

    /* Checked + disabled. PrimeNG keeps checkedBackground in this state rather
       than falling back to disabledBackground, so both the fill and the glyph
       have to be restated here. */
    baps-checkbox .p-checkbox-checked.p-disabled .p-checkbox-box {
      background: var(--sel-disabled-checked-bg);
      border-color: var(--sel-disabled-border);
    }
    baps-checkbox .p-checkbox-checked.p-disabled .p-checkbox-icon {
      color: var(--sel-disabled-checked-icon);
    }

    /* .p-checkbox-label is BAPS's own markup, not PrimeNG's, so no checkbox
       token addresses it at all. */
    baps-checkbox .p-checkbox-label {
      color: var(--sel-label);
      font-size: 0.875rem;
      line-height: 1.3;
      margin-left: 0.5rem;
      cursor: pointer;
      user-select: none;
    }
    baps-checkbox .p-checkbox.p-disabled + .p-checkbox-label {
      color: var(--sel-label-disabled);
      cursor: not-allowed;
    }

    /* ── Size L (mobile) ──
       22px, not 24. Figma names the step "L (24) (Mob)" but draws a 22px box
       in BOTH brand frames — measured off the rendered frames rather than read
       off the layer name, which is where the 24 comes from.

       The radius does NOT change with the step. Both frames bind the radius
       variable set {0, 4, 999}; there is no 6px step, so 4px holds at S and L
       alike. This previously jumped to 6px at L.

       Not a token split, because the L step also moves the LABEL from 14px to
       16px and its gap from 8px to 10px, and no token covers either. */
    baps-checkbox.baps-checkbox-lg .p-checkbox,
    baps-checkbox.baps-checkbox-lg .p-checkbox-box {
      width: 22px;
      height: 22px;
    }
    /* Both glyphs scale with the box — only the box used to be resized, so on
       a large checkbox the tick stayed at its small-size width and read as
       undersized against the frame. */
    baps-checkbox.baps-checkbox-lg .p-checkbox-checked .p-checkbox-icon {
      width: 18px;
      height: 18px;
    }
    /* Indeterminate minus. v21 marks no indeterminate class on the root, but
       an unchecked box renders no icon at all — so "has an icon and is not
       checked" is exactly the indeterminate state. */
    baps-checkbox.baps-checkbox-lg .p-checkbox:not(.p-checkbox-checked) .p-checkbox-icon {
      width: 20px;
      height: 20px;
    }
    baps-checkbox.baps-checkbox-lg .p-checkbox-label {
      font-size: 1rem;
      margin-left: 0.625rem;
    }

    /* ── Dark ──
       The box itself is handled by each preset's colorScheme.dark block. Only
       the label and the ring need re-pointing here: the pale #f2f1f0 ring is
       invisible on a dark ground, so it becomes a low-alpha white instead. */
    .baps-dark baps-checkbox {
      --sel-ring: 0 0 0 2px rgba(255, 255, 255, 0.12);
      --sel-border-checked: var(--color-mybky-dark-primary-default, #9fadd9);
      --sel-label: var(--color-mybky-dark-text-primary, #f8fafb);
      --sel-label-disabled: var(--color-mybky-dark-text-disabled, #6f777d);
      /* Disabled+checked kept its light fill in dark — a pale #e4ecf1 box on the
         #2b2f32 card, the brightest thing in the group. Same muted, non-accent
         relationship as light, read for a dark ground. */
      --sel-disabled-checked-bg: var(--color-mybky-dark-surface-hover, #3d4144);
      --sel-disabled-checked-icon: var(--color-mybky-dark-text-disabled, #8d9ba5);
    }
    .baps-dark :is(baps-checkbox.baps-sampark, .baps-ds-sampark baps-checkbox) {
      --sel-border-checked: var(--color-sampark-dark-primary-default, #d48787);
      --sel-label: var(--color-sampark-dark-text-primary, #f8fafb);
      --sel-label-disabled: var(--color-sampark-dark-text-disabled, #6f777d);
      --sel-disabled-checked-bg: var(--color-sampark-dark-surface-hover, #4a4947);
      --sel-disabled-checked-icon: var(--color-sampark-dark-text-disabled, #94928f);
    }`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsCheckbox),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-checkbox-lg]': "size === 'large'",
  },
})
export class BapsCheckbox implements ControlValueAccessor {
  /** Label displayed next to the checkbox. */
  @Input() label?: string;
  /** When true, the checkbox works as a boolean toggle instead of array-based. */
  @Input() binary = true;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() inputId = `baps-chk-${nextCheckboxId++}`;
  @Input() name: string | undefined;
  /** Value used for array-based selection (non-binary mode). */
  @Input() checkboxValue?: any;
  /** PrimeNG variant: 'outlined' or 'filled'. */
  @Input() variant?: 'outlined' | 'filled';
  /**
   * Third, partial state — neither checked nor unchecked. The canonical use is
   * a "select all" header checkbox when only some rows are selected; without
   * it a partial selection is indistinguishable from an empty one. PrimeNG has
   * always supported this; the wrapper simply never forwarded it, which the
   * Data management pattern hit and had to document as a gap.
   *
   * Purely visual: it does not change `value`, and any real click resolves it
   * to a normal checked/unchecked value, so the consumer owns recomputing it.
   */
  @Input() indeterminate = false;
  /**
   * Figma defines two steps (node 13197:89044): S (16px box / 14px label) and
   * L (22px box / 16px label), the latter for mobile. Figma names the step
   * "L (24) (Mob)" but draws a 22px box. Default is S.
   */
  @Input() size?: 'small' | 'large';
  /** Visual skin. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  value: any = false;

  /**
   * Per-instance Sampark skin via PrimeNG design tokens, so one
   * `brand="sampark"` checkbox can sit on a MyBKY page. MyBKY needs no `dt`
   * override — it is the global preset — so undefined lets that apply.
   */
  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_CHECKBOX_TOKENS : undefined;
  }

  private onChange: any = () => { /* empty */ };
  private onTouched: any = () => { /* empty */ };

  onCheckboxChange(event: any): void {
    this.value = event.checked;
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
