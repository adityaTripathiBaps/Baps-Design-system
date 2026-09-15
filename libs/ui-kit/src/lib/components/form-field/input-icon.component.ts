import { Component, Input } from '@angular/core';
import { InputIcon } from 'primeng/inputicon';

@Component({
  selector: 'baps-inputicon',
  imports: [InputIcon],
  template: `
    <p-inputicon [styleClass]="styleClass" [style]="style">
      <ng-content></ng-content>
    </p-inputicon>
  `,
})
export class BapsInputIcon {
  @Input() styleClass?: string;
  @Input() style?: Record<string, string | number>;
}
