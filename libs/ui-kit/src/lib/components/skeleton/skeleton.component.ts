import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

/**
 * baps-skeleton — a placeholder block shown while real content loads.
 *
 * Wraps PrimeNG Skeleton. The only thing that differs by brand is the corner:
 * MyBKY rounds to its 6px step, Sampark to its 4px one, and `shape="circle"`
 * ignores both. Colours are shared — a skeleton is a neutral surface, not a
 * branded one, and tinting it would make loading states read as content.
 *
 * ACCESSIBILITY: a skeleton is decorative. It is hidden from screen readers
 * here, because announcing a dozen empty boxes tells a non-sighted user
 * nothing. Give the REGION that is loading an `aria-busy="true"` and a live
 * region that announces when the real content arrives; that is the part a
 * screen-reader user actually needs, and it is not something this component
 * can do on its behalf.
 */
@Component({
  selector: 'baps-skeleton',
  imports: [Skeleton],
  template: `
    <p-skeleton
      [shape]="shape"
      [size]="size"
      [width]="width"
      [height]="height"
      [borderRadius]="borderRadius"
      [animation]="animation"
      [styleClass]="styleClass"
    ></p-skeleton>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-skeleton {
      display: block;
      --baps-skeleton-radius: var(--radius-mybky-sm, 0.375rem);
      --baps-skeleton-bg: var(--color-mybky-mono-100, #eff1f3);
    }

    :is(baps-skeleton.baps-sampark, .baps-ds-sampark baps-skeleton) {
      --baps-skeleton-radius: var(--radius-sampark-default, 0.25rem);
      --baps-skeleton-bg: var(--color-sampark-mono-20, #f3f2f2);
    }

    baps-skeleton .p-skeleton {
      background: var(--baps-skeleton-bg);
      border-radius: var(--baps-skeleton-radius);
    }

    /* A circle is a circle in both brands — the radius token does not apply. */
    baps-skeleton .p-skeleton.p-skeleton-circle {
      border-radius: 50%;
    }

    /* prefers-reduced-motion: the shimmer is pure decoration, and a repeating
       sweep is exactly the kind of motion that triggers discomfort. The block
       still shows; only the animation stops. */
    @media (prefers-reduced-motion: reduce) {
      baps-skeleton .p-skeleton::after {
        animation: none;
      }
    }

    /* ── Dark ── */
    .baps-dark baps-skeleton {
      --baps-skeleton-bg: var(--color-mybky-dark-surface-hover, #2b2f32);
    }
    .baps-dark :is(baps-skeleton.baps-sampark, .baps-ds-sampark baps-skeleton) {
      --baps-skeleton-bg: var(--color-sampark-dark-surface-hover, #2c2c2a);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    'aria-hidden': 'true',
  },
})
export class BapsSkeleton {
  /** 'rectangle' (default) or 'circle'. A circle ignores `borderRadius`. */
  @Input() shape: 'rectangle' | 'circle' = 'rectangle';
  /** Sets width AND height at once — the usual way to make a square/circle. */
  @Input() size?: string;
  /** Any CSS length. Percentages are useful for text lines. */
  @Input() width = '100%';
  @Input() height = '1rem';
  /** Overrides the brand radius for a one-off. */
  @Input() borderRadius?: string;
  /** 'wave' (default) or 'none' to hold a static block. */
  @Input() animation: 'wave' | 'none' = 'wave';
  /** Additional CSS class(es) forwarded to the PrimeNG root. */
  @Input() styleClass?: string;
  /** Visual skin: 'mybky' (default) or 'sampark'. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
