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
  // CSS lives in ../../styles/components/indicator/_indicator.scss so the same rules
  // can style raw markup that Angular never rendered — see the header comment
  // there. styleUrls keeps it shipping with the component.
  styleUrls: ['../../styles/components/indicator/_indicator.scss'],
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
