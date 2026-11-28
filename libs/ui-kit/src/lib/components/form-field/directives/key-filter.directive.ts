import { Directive } from '@angular/core';
import { KeyFilter } from 'primeng/keyfilter';

/**
 * bapsKeyFilter — blocks keystrokes and pastes that do not fit a pattern on
 * any text field. PrimeNG KeyFilter (primeng.dev/keyfilter) as a host
 * directive, so its validator (with `validateOnly`) and its `ngModelChange`
 * come along.
 *
 *   <input bapsInputText bapsKeyFilter="int" />
 *   <input bapsInputText [bapsKeyFilter]="noSpecial" />   // a RegExp
 *
 * Presets: pint, int, pnum, money, num, hex, email, alpha, alphanum.
 */
@Directive({
  selector: '[bapsKeyFilter]',
  hostDirectives: [
    {
      directive: KeyFilter,
      inputs: ['pKeyFilter: bapsKeyFilter', 'pValidateOnly: validateOnly'],
      outputs: ['ngModelChange'],
    },
  ],
})
export class BapsKeyFilter {}
