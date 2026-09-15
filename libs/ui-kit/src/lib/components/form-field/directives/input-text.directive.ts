import { Directive } from '@angular/core';
import { InputText } from 'primeng/inputtext';

@Directive({
  selector: '[bapsInputText]',
  hostDirectives: [
    {
      directive: InputText,
      inputs: ['pSize', 'variant', 'invalid', 'fluid'],
    },
  ],
})
export class BapsInputText {}
