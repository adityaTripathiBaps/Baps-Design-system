import { Component, Input } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';

@Component({
  selector: 'baps-floatlabel',
  imports: [FloatLabel],
  template: `
    <p-floatlabel [style]="style" [class]="styleClass">
      <ng-content></ng-content>
    </p-floatlabel>
  `,
})
export class BapsFloatLabel {
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
}
