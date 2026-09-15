import { Directive } from '@angular/core';
import { Textarea } from 'primeng/textarea';

@Directive({
  selector: '[bapsTextarea]',
  hostDirectives: [
    {
      directive: Textarea,
      inputs: ['autoResize', 'pSize', 'variant', 'invalid', 'fluid'],
    },
  ],
})
export class BapsTextarea {}
