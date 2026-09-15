import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * baps-indicator — the small circular status/count marker.
 *
 * ONE component covering three Figma frames that are the same primitive with
 * different content:
 *   - "Status Dot"          (13197:91718) — 5 colours x 4 sizes, no content
 *   - "Icon Badge"          (13197:91759) — 5 types  x 4 sizes, white icon
 *   - "Notification Counts" (13197:91693) — 3 variants x 4 sizes, white number
 *
 * All three share the same 12/16/20/24 circle scale and the same white-on-
 * semantic-fill treatment, so they are modelled as one `severity` x `size`
 * component with optional projected content rather than three near-identical
 * components (the design system's own rule: compose before creating).
 *
 * NOT the same thing as `baps-badge`, despite the Figma name "Icon Badge".
 * `baps-badge` wraps PrimeNG Badge on the Sampark CHIP scale (20/22/28) and
 * carries a label; this is the 12/16/20/24 dot scale. Keeping them apart is
 * deliberate — merging them would force one component to serve two different
 * size ramps.
 *
 * ## Usage
 *   <baps-indicator severity="success" />                        <!-- status dot -->
 *   <baps-indicator severity="error" size="l">3</baps-indicator> <!-- count -->
 *   <baps-indicator severity="primary" size="l">                 <!-- icon badge -->
 *     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">…</svg>
 *   </baps-indicator>
 *
 * Anchoring it to another element (the avatar/nav-rail overlay case) is the
 * consumer's job — this component only draws the marker. `baps-avatar` and
 * `baps-internal-navbar` still carry their own hard-coded pseudo-element dots;
 * those predate this component and can be migrated onto it separately.
 */
export type BapsIndicatorSeverity =
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'grey';

/** Figma steps: S 12px, M 16px, L 20px, XL 24px. */
export type BapsIndicatorSize = 's' | 'm' | 'l' | 'xl';

@Component({
  selector: 'baps-indicator',
  template: `
    <span class="baps-indicator__inner" [attr.aria-hidden]="ariaLabel ? null : 'true'">
      <ng-content></ng-content>
    </span>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Values read from the three Figma frames via get_variable_defs, then
       matched to our tokens BY VALUE, not by name.

       That distinction matters here. Figma labels these stops "Info/80",
       "Success/80", "Warning/80", but their values (#3889fa / #17b56c /
       #faab38) are our -60 steps; our own -80 steps are darker (#0661e0 /
       #089152 / #e08705). Only Error agrees on both name and value (#ea151a
       = our error-80). Trusting the names would have shipped three of the
       five colours visibly wrong.

       The naming skew is left alone rather than "corrected" — these ramps are
       used across the whole library, and renaming them to chase one frame's
       labels is a far bigger change than this component justifies.

       Not PrimeNG-token-driven because there is no PrimeNG component here:
       this is first-party markup, so there is no token surface to reach for. */
    baps-indicator {
      --baps-indicator-size: 1rem;
      --baps-indicator-font-size: 0.75rem;
      --baps-indicator-fill: var(--color-sampark-error-80, #ea151a);

      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: var(--baps-indicator-size);
      height: var(--baps-indicator-size);
      border-radius: 50%;
      background: var(--baps-indicator-fill);
      color: var(--color-sampark-mono-0, #ffffff);
      font-family: inherit;
      font-size: var(--baps-indicator-font-size);
      font-weight: 600;
      line-height: 1.3;
      user-select: none;
    }

    baps-indicator .baps-indicator__inner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* The glyph tracks the circle rather than the font, so an icon and a
         number at the same size step read as the same weight. */
      width: 0.75em;
      height: 0.75em;
      line-height: 1;
    }

    /* A number needs its own box: 0.75em would clip two digits. */
    baps-indicator.baps-indicator--text .baps-indicator__inner {
      width: auto;
      height: auto;
    }

    baps-indicator .baps-indicator__inner svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* ── Sizes — Figma S(12) / M(16) / L(20) / XL(24), with the count font
       stepping 10/12/14/16 alongside (Inter Semi Bold in every step). ── */
    baps-indicator.baps-indicator--s {
      --baps-indicator-size: 0.75rem;
      --baps-indicator-font-size: 0.625rem;
    }
    baps-indicator.baps-indicator--m {
      --baps-indicator-size: 1rem;
      --baps-indicator-font-size: 0.75rem;
    }
    baps-indicator.baps-indicator--l {
      --baps-indicator-size: 1.25rem;
      --baps-indicator-font-size: 0.875rem;
    }
    baps-indicator.baps-indicator--xl {
      --baps-indicator-size: 1.5rem;
      --baps-indicator-font-size: 1rem;
    }

    /* ── Severities ── */
    baps-indicator.baps-indicator--primary {
      --baps-indicator-fill: var(--color-sampark-primary-default, #c96868);
    }
    baps-indicator.baps-indicator--info {
      --baps-indicator-fill: var(--color-sampark-info-60, #3889fa);
    }
    baps-indicator.baps-indicator--success {
      --baps-indicator-fill: var(--color-sampark-success-60, #17b56c);
    }
    baps-indicator.baps-indicator--warning {
      --baps-indicator-fill: var(--color-sampark-warning-60, #faab38);
    }
    baps-indicator.baps-indicator--error {
      --baps-indicator-fill: var(--color-sampark-error-80, #ea151a);
    }
    baps-indicator.baps-indicator--grey {
      --baps-indicator-fill: var(--color-sampark-mono-40, #bcb9b9);
    }

    /* Disabled — the Notification Counts frame's third row. Mono/40 fill,
       same white foreground. */
    baps-indicator.baps-indicator--disabled {
      --baps-indicator-fill: var(--color-sampark-mono-40, #bcb9b9);
    }

    /* ── Ring ──
       Off by default. Only the avatar/nav overlay case needs a white ring to
       separate the marker from what it sits on, so it is opt-in rather than
       something every inline indicator pays for. */
    baps-indicator.baps-indicator--ring {
      border: 1.5px solid var(--color-sampark-mono-0, #ffffff);
    }
  `,
  host: {
    '[class]': 'hostClasses',
    '[attr.role]': "ariaLabel ? 'status' : null",
    '[attr.aria-label]': 'ariaLabel || null',
  },
})
export class BapsIndicator {
  /** Fill colour. `grey` is the Status Dot neutral; `primary` is Icon Badge only. */
  @Input() severity: BapsIndicatorSeverity = 'error';
  /** Figma steps: s 12px, m 16px, l 20px, xl 24px. */
  @Input() size: BapsIndicatorSize = 'm';
  /** Renders the muted Mono/40 fill regardless of `severity`. */
  @Input() disabled = false;
  /** Set when the marker carries a count or an icon that needs a text box. */
  @Input() text = false;
  /**
   * White separator ring, for markers overlaid on an avatar or a coloured
   * surface. Off by default — an inline dot should not draw one.
   */
  @Input() ring = false;
  /**
   * An indicator is decorative by default and is hidden from assistive tech.
   * Set this when it carries real meaning ("3 unread", "Online") — it then
   * becomes role="status" with this as its accessible name.
   */
  @Input() ariaLabel?: string;

  get hostClasses(): string {
    return [
      `baps-indicator--${this.size}`,
      `baps-indicator--${this.severity}`,
      this.disabled ? 'baps-indicator--disabled' : '',
      this.text ? 'baps-indicator--text' : '',
      this.ring ? 'baps-indicator--ring' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
