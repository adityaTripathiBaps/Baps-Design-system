import { Component, Input } from '@angular/core';
import { Badge } from 'primeng/badge';
// Sampark badge skin lives in the theme layer so the same token block drives
// both the whole-preview Sampark preset and this per-instance dt scoping —
// same convention as baps-button / baps-avatar.
import { SAMPARK_BADGE_TOKENS } from '../../theme/sampark.theme';

@Component({
  selector: 'baps-badge',
  imports: [Badge],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-badge-notification]': "type === 'notification'",
    '[class.baps-badge-counts]': "type === 'counts'",
    '[class.baps-badge-disable]': "type === 'disable'",
  },
  template: `
    <p-badge
      [value]="value"
      [severity]="severity"
      [badgeSize]="badgeSize"
      [badgeDisabled]="badgeDisabled"
      [style]="style"
      [styleClass]="styleClass"
      [dt]="dt"
    ></p-badge>
  `,
})
export class BapsBadge {
  @Input() value?: string | number;
  @Input() severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  @Input() badgeSize?: 'small' | 'large' | 'xlarge';
  @Input() badgeDisabled = false;
  /**
   * Sampark's badge vocabulary: 'notification' is the alert count (filled
   * red, white ring), 'counts' is a plain count (white on a hairline) and
   * 'disable' is the inert tint.
   *
   * Deliberately a separate axis from `severity` rather than a crossover.
   * 'disable' has no severity to map onto, and `badgeDisabled` is not it —
   * that input HIDES the badge rather than recolouring it. Leaving `type`
   * unset keeps PrimeNG's severity colours, so this is additive.
   *
   * Only the Sampark skin reads it today (_badge-sampark.scss); on MyBKY the
   * host class is inert.
   */
  @Input() type?: 'notification' | 'counts' | 'disable';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  /**
   * Visual skin: 'mybky' (default) renders the global MyBky preset — pill
   * radius, 22/26/32px scale. 'sampark' applies the Sampark count-pill scale
   * (100px radius, 12/16/20/24px) via scoped design tokens, per-instance,
   * without switching the whole preview's design system.
   *
   * That scale used to be tag's (4px, 20/22/28) — p-tag is the status label,
   * p-badge is the count, and the two had been sharing one set of numbers.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_BADGE_TOKENS : undefined;
  }
}
