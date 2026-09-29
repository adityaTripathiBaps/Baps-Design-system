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
  // CSS lives in ../../styles/components/spinner/_spinner.scss so the same rules
  // can style raw markup that Angular never rendered — see the header comment
  // there. styleUrls keeps it shipping with the component.
  styleUrls: ['../../styles/components/spinner/_spinner.scss'],
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
