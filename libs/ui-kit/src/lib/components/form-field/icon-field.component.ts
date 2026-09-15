import { Component, Input } from '@angular/core';
import { IconField } from 'primeng/iconfield';

@Component({
  selector: 'baps-iconfield',
  imports: [IconField],
  template: `
    <p-iconfield [iconPosition]="iconPosition" [style]="style" [styleClass]="styleClass ?? ''">
      <ng-content></ng-content>
    </p-iconfield>
  `,
})
export class BapsIconField {
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
}
