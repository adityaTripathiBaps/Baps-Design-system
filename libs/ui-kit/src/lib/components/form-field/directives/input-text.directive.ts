import { Directive, Input } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { BapsBrand, injectBapsBrand } from '../../../theme/brand';

@Directive({
  selector: '[bapsInputText]',
  hostDirectives: [
    {
      directive: InputText,
      inputs: ['pSize', 'variant', 'invalid', 'fluid'],
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsInputText {
  /**
   * Sampark skin on this field without a page scope. The class lands on the
   * element itself, which _input-sampark.scss also matches (spm-ui sets no
   * root class, so a bare [bapsInputText] there rendered the MyBKY pill).
   */
  @Input() brand: BapsBrand = injectBapsBrand();
}
