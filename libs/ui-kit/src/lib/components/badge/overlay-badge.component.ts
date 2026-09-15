import { Component, Input } from '@angular/core';
import { OverlayBadge } from 'primeng/overlaybadge';

@Component({
  selector: 'baps-overlaybadge',
  imports: [OverlayBadge],
  template: `
    <p-overlaybadge
      [value]="value"
      [severity]="severity"
      [badgeSize]="badgeSize"
      [badgeDisabled]="badgeDisabled"
      [style]="style"
      [styleClass]="styleClass"
    >
      <ng-content></ng-content>
    </p-overlaybadge>
  `,
})
export class BapsOverlayBadge {
  @Input() value?: string | number;
  @Input() severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  @Input() badgeSize?: 'small' | 'large' | 'xlarge';
  @Input() badgeDisabled = false;
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
}
