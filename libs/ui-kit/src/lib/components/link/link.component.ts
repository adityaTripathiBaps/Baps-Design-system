import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * baps-link — styled anchor / navigation link.
 *
 * Pure HTML component — no PrimeNG dependency. Renders an `<a>` element
 * with brand-appropriate styling: Sampark uses maroon text with underline
 * on hover; MyBKY uses blue.
 *
 * Usage:
 *   <baps-link href="/settings" brand="sampark">Settings</baps-link>
 *   <baps-link href="/docs" target="_blank">Documentation</baps-link>
 */
@Component({
  selector: 'baps-link',
  template: `
    <a
      [href]="disabled ? null : href"
      [target]="target"
      [attr.rel]="target === '_blank' ? 'noopener noreferrer' : null"
      [attr.aria-disabled]="disabled || null"
      [tabindex]="disabled ? -1 : 0"
      class="baps-link__anchor"
      [class.baps-link--disabled]="disabled"
    >
      <ng-content></ng-content>
    </a>
  `,
  encapsulation: ViewEncapsulation.None,
  // CSS lives in ../../styles/components/link/_link.scss so the same rules
  // can style raw markup that Angular never rendered — see the header comment
  // there. styleUrls keeps it shipping with the component.
  styleUrls: ['../../styles/components/link/_link.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-link--primary]': "variant === 'primary'",
    '[class.baps-link--secondary]': "variant === 'secondary'",
    '[class.baps-link-sm]': "size === 'small'",
    '[class.baps-link-lg]': "size === 'large'",
    '[class.baps-link-xl]': "size === 'xlarge'",
  },
})
export class BapsLink {
  /** Target URL. */
  @Input() href?: string;
  /** Link target: '_blank', '_self', etc. */
  @Input() target?: string;
  /** Prevents interaction — greys out and removes pointer events. */
  @Input() disabled = false;
  /**
   * Figma node 13197:91800 draws two: Primary (the brand ramp — maroon for
   * Sampark, blue for MyBKY) and Secondary (the shared mono ramp, #595656 →
   * #151414 on hover). Primary is the default, so nothing existing moves.
   */
  @Input() variant: 'primary' | 'secondary' = 'primary';
  /**
   * S / L / XL from the same node, named after the rendered box height
   * (16 / 18 / 20px) — the type is 12 / 14 / 16px at 1.3 line-height.
   * Undefined keeps the historic `font-size: inherit`.
   */
  @Input() size?: 'small' | 'large' | 'xlarge';
  /** Visual skin. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
