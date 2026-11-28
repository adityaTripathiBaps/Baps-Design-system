import { Directive, Input } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * bapsFieldset — brand hook on PrimeNG's own `<p-fieldset>`
 * (primeng.dev/fieldset): a bordered group with a legend, optionally
 * collapsible. No wrapper component: it needs no BAPS-specific inputs, and
 * its `header` / `content` / icon templates work as PrimeNG documents them
 * on its own element.
 *
 *   <p-fieldset bapsFieldset legend="Family" [toggleable]="true"> … </p-fieldset>
 */
@Directive({
  selector: 'p-fieldset[bapsFieldset]',
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsFieldset {
  @Input() brand: BapsBrand = injectBapsBrand();
}
