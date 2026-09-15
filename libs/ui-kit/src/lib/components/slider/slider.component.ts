import { Component, Input, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { Slider } from 'primeng/slider';
// Sampark skin lives in the theme layer so one token block drives both the
// whole-preview Sampark preset and this per-instance dt scoping.
import { SAMPARK_SLIDER_TOKENS } from '../../theme/sampark.theme';

/**
 * baps-slider — range slider input.
 *
 * Wraps PrimeNG Slider with ControlValueAccessor. Sampark skin: maroon
 * fill track, 4px radius track, maroon handle.
 */
@Component({
  selector: 'baps-slider',
  imports: [Slider, FormsModule],
  template: `
    <p-slider
      [(ngModel)]="value"
      [min]="min"
      [max]="max"
      [step]="step"
      [range]="range"
      [orientation]="orientation"
      [disabled]="disabled"
      [style]="style"
      [styleClass]="styleClass"
      [ariaLabel]="ariaLabel"
      [ariaLabelledBy]="ariaLabelledBy"
      [dt]="dt"
      (onChange)="onSliderChange($event)"
    ></p-slider>
    @for (v of tooltipValues; track $index) {
      <span class="baps-slider-tooltip" [style.left.%]="percent(v)" aria-hidden="true">{{ v }}</span>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* ── Value tooltips (opt-in, Figma 13197:89384) ──
       Every variant in the Figma frame carries a persistent bubble over each
       handle: a 24x32 instance (24px white plate + an 8x24 beak) sitting on
       top of the 16px handle. White is Mono/0 #ffffff, the number is Inter
       12/1.3 in Mono/80 #595656, radius 4px, and the lift is Figma's
       "S Drop Shadow" pair. Layout only kicks in with the input on, so a
       tooltip-less slider renders exactly as before. */
    baps-slider.baps-slider-has-tooltip {
      display: block;
      position: relative;
    }

    /* PrimeNG anchors a handle with inset-inline-start plus a half-width
       negative margin; translateX(-50%) is the same centring, so bubble and
       handle stay locked together at every percentage.
       The 1rem lift = half the 16px handle + the 8px beak. */
    baps-slider .baps-slider-tooltip {
      position: absolute;
      bottom: calc(50% + 1rem);
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      min-width: 1.5rem;
      min-height: 1.5rem;
      padding: 0 0.5rem;
      border-radius: var(--slider-tooltip-radius, var(--radius-sampark-default, 0.25rem));
      background: var(--slider-tooltip-background, var(--color-sampark-mono-0, #ffffff));
      color: var(--slider-tooltip-text, var(--color-sampark-mono-80, #595656));
      font-size: 0.75rem;
      line-height: 1.3;
      white-space: nowrap;
      pointer-events: none;
      /* Same Figma effect as shadow.sampark.s, but deliberately NOT that
         token: this is a filter, and drop-shadow() takes bare offsets while
         the token holds box-shadow syntax. The two are not interchangeable,
         so the values are duplicated on purpose. Keep them in step. */
      filter: var(
        --slider-tooltip-shadow,
        drop-shadow(0 2px 4px rgba(16, 24, 40, 0.06)) drop-shadow(0 1px 4px rgba(16, 24, 40, 0.12))
      );
    }

    /* The 24x8 beak. It hangs off the plate, so the shadow has to be a
       filter on the parent — a box-shadow would square it off. */
    baps-slider .baps-slider-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-inline: 0.75rem solid transparent;
      border-bottom: 0;
      border-top: 0.5rem solid
        var(--slider-tooltip-background, var(--color-sampark-mono-0, #ffffff));
    }

    /* ── Sampark slider ──
       Track radius, range fill, handle fill, handle hover fill and the dark
       track background are NOT here — they come from SAMPARK_SLIDER_TOKENS
       via the dt input, because PrimeNG's slider surface exposes
       track.borderRadius, track.background, range.background,
       handle.background and handle.hoverBackground.

       Only what has no usable token remains below, each with its reason. ── */

    /* The handle's border colour has no token. PrimeNG's slider surface stops
       at handle.background / handle.hoverBackground — there is no
       handle.borderColor — so the maroon ring has to be stated here. */
    :is(baps-slider.baps-sampark, .baps-ds-sampark baps-slider) .p-slider-handle {
      border-color: var(--color-sampark-primary-default, #c96868);
    }

    :is(baps-slider.baps-sampark, .baps-ds-sampark baps-slider) .p-slider:not(.p-disabled) .p-slider-handle:hover {
      border-color: var(--color-sampark-primary-hover, #b44141);
    }

    /* handle.focusRing.shadow DOES exist, but it cannot be used here. The
       Material preset this theme extends re-declares
       .p-slider-handle:focus-visible in its own css block with a hard-coded
       color-mix halo — equal specificity, later in the primeng cascade layer
       — so a token value would always lose to it. Only an unlayered rule like
       this one wins, which is why the focus ring stays as CSS. */
    :is(baps-slider.baps-sampark, .baps-ds-sampark baps-slider) .p-slider-handle:focus-visible {
      box-shadow: 0 0 0 3px var(--shadow-sampark-input-focus, #f2f1f0);
    }

    /* The slider surface has no disabled token of any kind — all 27 tokens sit
       on root, track, range and handle, none of them state-qualified. */
    :is(baps-slider.baps-sampark, .baps-ds-sampark baps-slider) .p-slider.p-disabled {
      opacity: 0.5;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsSlider),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-slider-has-tooltip]': 'tooltipValues.length > 0',
  },
})
export class BapsSlider implements ControlValueAccessor {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() range = false;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() disabled = false;
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  /** Accessible name for the handle when there's no visible `<label for>`. */
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  /**
   * Persistent value bubble above every handle (Figma 13197:89329 shows one
   * on all 11 variants). Off by default — existing sliders keep their
   * baseline. ponytail: horizontal only; a vertical slider would need the
   * bubble beside the handle, not above it, and nothing asks for that yet.
   */
  @Input() showValueTooltip = false;

  value: any = 0;

  /** One entry per handle, empty when the bubble is off. */
  get tooltipValues(): number[] {
    if (!this.showValueTooltip || this.orientation !== 'horizontal') return [];
    return this.range ? (this.value ?? []) : [this.value ?? this.min];
  }

  /** Handle position, clamped the way PrimeNG clamps its own handles. */
  percent(value: number): number {
    const span = this.max - this.min;
    if (span <= 0) return 0;
    return Math.min(100, Math.max(0, ((value - this.min) / span) * 100));
  }

  /**
   * Per-instance Sampark skin via PrimeNG design tokens, so one
   * `brand="sampark"` slider can sit on a MyBKY page. MyBKY needs no `dt`
   * override — it is the global preset — so undefined lets that apply.
   */
  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_SLIDER_TOKENS : undefined;
  }

  private onChange: any = () => { /* empty */ };
  private onTouched: any = () => { /* empty */ };

  onSliderChange(event: any): void {
    // PrimeNG emits `{ values }` for a two-handle range and `{ value }` for a
    // single handle. Reading only `value` sent `undefined` to the form control
    // on every range interaction.
    this.value = this.range ? event.values : event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value ?? (this.range ? [this.min, this.max] : this.min);
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
