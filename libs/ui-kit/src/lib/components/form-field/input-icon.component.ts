import { Component, Input, ViewEncapsulation } from '@angular/core';
import { InputIcon } from 'primeng/inputicon';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

@Component({
  selector: 'baps-inputicon',
  imports: [InputIcon],
  template: `
    <p-inputicon [styleClass]="styleClass" [style]="style">
      <ng-content></ng-content>
    </p-inputicon>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/form-field/_input-icon-sampark.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsInputIcon {
  @Input() styleClass?: string;
  @Input() style?: Record<string, string | number>;
  @Input() brand: BapsBrand = injectBapsBrand();
}
