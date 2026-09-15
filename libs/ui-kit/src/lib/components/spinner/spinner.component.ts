import { Component, Input, ViewEncapsulation } from '@angular/core';

/** Circumference of the r=14 ring in the 32-unit viewBox. */
const CIRCUMFERENCE = 2 * Math.PI * 14;

/**
 * baps-spinner — circular loading indicator, indeterminate or determinate.
 *
 * Leave `value` unset for the spinning quarter-arc (Figma "Regular Spinner",
 * 17512:84149). Set `value` (0–100) for the ring that fills clockwise from
 * 12 o'clock (Figma "Animated loader - linear", 17512:84516 — the name says
 * linear, the render is a circle).
 *
 * Hand-rolled rather than wrapping primeng/progressspinner: that component's
 * whole token surface is progressspinner.color.{one,two,three,four} — the
 * four hues of its rainbow dash cycle. It has no token for size, stroke
 * width or a track ring, renders a single <circle> so there is nowhere for a
 * track to live, and has no determinate mode at all. Nothing in this design
 * is reachable through it.
 *
 * Geometry is straight off the Figma vectors: outer r=16, inner r=12, so a
 * 4-unit stroke on an r=14 ring. Both size steps keep stroke/diameter at
 * 1/8, so scaling the fixed 0 0 32 32 viewBox is the whole size mechanism.
 */
@Component({
  selector: 'baps-spinner',
  template: `
    <svg class="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle class="baps-spinner-track" cx="16" cy="16" r="14" />
      <circle
        class="baps-spinner-arc"
        cx="16"
        cy="16"
        r="14"
        [attr.stroke-dasharray]="dashArray"
        [attr.stroke-dashoffset]="dashOffset"
      />
    </svg>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-spinner {
      display: inline-flex;
      /* Figma: 32px ring (determinate loader symbol). */
      inline-size: var(--baps-spinner-size, 2rem);
      block-size: var(--baps-spinner-size, 2rem);
    }

    /* Figma: 24px ring (Regular Spinner symbol). Only two steps are drawn,
       so only two are offered — there is no invented size ramp here. */
    baps-spinner.baps-spinner-small {
      --baps-spinner-size: 1.5rem;
    }

    baps-spinner .baps-spinner-svg {
      inline-size: 100%;
      block-size: 100%;
    }

    baps-spinner .baps-spinner-track,
    baps-spinner .baps-spinner-arc {
      fill: none;
      /* 4 user units in a 32-unit viewBox = the 16/12 radius pair Figma
         exports, and it scales to 3px at the 24px step by itself. */
      stroke-width: 4;
    }

    /* MyBKY reading of the Figma pair. The spec was drawn in Sampark
       (#f8f7f7 track = sampark mono.10, #b44141 arc = sampark primary.80),
       so MyBKY takes the structural equivalents from its own ramp. */
    baps-spinner .baps-spinner-track {
      stroke: var(--color-mybky-mono-50, #f8fafb);
    }

    baps-spinner .baps-spinner-arc {
      stroke: var(--color-mybky-primary-default, #5f78b8);
      /* Start the arc at 12 o'clock and sweep clockwise. Lives on the arc,
         not the svg, so the indeterminate rotation below owns the svg
         transform outright and the two never fight. */
      transform: rotate(-90deg);
      transform-box: fill-box;
      transform-origin: center;
      transition: stroke-dashoffset 0.3s ease;
    }

    /* Indeterminate: the 90-degree arc with the rounded leading cap Figma
       draws as a separate 3px dot at the arc tip. */
    baps-spinner.baps-spinner-indeterminate .baps-spinner-arc {
      stroke-linecap: round;
      transition: none;
    }

    baps-spinner.baps-spinner-indeterminate .baps-spinner-svg {
      animation: baps-spinner-rotate 1s linear infinite;
    }

    @keyframes baps-spinner-rotate {
      to {
        transform: rotate(360deg);
      }
    }

    /* ── Sampark ── the values Figma actually specifies. */
    :is(baps-spinner.baps-sampark, .baps-ds-sampark baps-spinner) .baps-spinner-track {
      stroke: var(--color-sampark-mono-10, #f8f7f7);
    }
    :is(baps-spinner.baps-sampark, .baps-ds-sampark baps-spinner) .baps-spinner-arc {
      stroke: var(--color-sampark-primary-80, #b44141);
    }

    /* An infinite 1s rotation is the textbook vestibular trigger, so it stops
       outright — the static quarter arc still reads as a busy indicator, and
       role="status" carries the meaning for anyone who cannot see it at all.
       The determinate sweep loses its tween too: value changes snap. */
    @media (prefers-reduced-motion: reduce) {
      baps-spinner .baps-spinner-svg {
        animation: none;
      }
      baps-spinner .baps-spinner-arc {
        transition: none;
      }
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-spinner-small]': "size === 'small'",
    '[class.baps-spinner-indeterminate]': '!isDeterminate',
    '[attr.role]': "isDeterminate ? 'progressbar' : 'status'",
    '[attr.aria-label]': 'ariaLabel',
    '[attr.aria-valuenow]': 'isDeterminate ? clampedValue : null',
    '[attr.aria-valuemin]': 'isDeterminate ? 0 : null',
    '[attr.aria-valuemax]': 'isDeterminate ? 100 : null',
  },
})
export class BapsSpinner {
  /**
   * Progress 0–100. Unset (the default) is the indeterminate spinner —
   * these are one component because they are one drawing: same ring, same
   * stroke ratio, same track, same arc colour, differing only in whether
   * the arc length is a clock or a measurement.
   */
  @Input() value?: number;
  /** small = 24px ring, large = 32px ring. Both are drawn in Figma. */
  @Input() size: 'small' | 'large' = 'large';
  /** Accessible name announced in place of the graphic. */
  @Input() ariaLabel = 'Loading';
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  get isDeterminate(): boolean {
    return this.value != null && !Number.isNaN(this.value);
  }

  /** Guards the arc geometry against out-of-range input from callers. */
  get clampedValue(): number {
    return Math.min(100, Math.max(0, this.value ?? 0));
  }

  get dashArray(): string {
    return this.isDeterminate
      ? `${CIRCUMFERENCE}`
      : `${CIRCUMFERENCE / 4} ${CIRCUMFERENCE}`;
  }

  get dashOffset(): number {
    return this.isDeterminate ? (CIRCUMFERENCE * (100 - this.clampedValue)) / 100 : 0;
  }
}
