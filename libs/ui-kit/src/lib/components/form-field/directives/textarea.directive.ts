import { Directive, Input } from '@angular/core';
import { Textarea } from 'primeng/textarea';

@Directive({
  selector: '[bapsTextarea]',
  hostDirectives: [
    {
      directive: Textarea,
      inputs: ['autoResize', 'pSize', 'variant', 'invalid', 'fluid'],
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsTextarea {
  /**
   * Sampark skin on this field without a page scope. The class lands on the
   * element itself, which _input-sampark.scss also matches (spm-ui sets no
   * root class, so a bare [bapsInputText] there rendered the MyBKY pill).
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
