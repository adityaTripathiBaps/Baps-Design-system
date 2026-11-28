import { Directive, Input } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * bapsPickList — brand hook on PrimeNG's own `<p-picklist>`
 * (primeng.dev/picklist): move items between a source and a target list, and
 * reorder either. No wrapper component: PickList takes some twenty templates
 * by reference name and pTemplate and two-way binds `source` / `target`; on
 * PrimeNG's element all of it works as documented. Both lists take the shared
 * Listbox skin (`_listbox.scss`).
 *
 *   <p-picklist bapsPickList [(source)]="available" [(target)]="chosen" dataKey="id"
 *               sourceHeader="Available" targetHeader="Selected">
 *     <ng-template #item let-x> {{ x.name }} </ng-template>
 *   </p-picklist>
 */
@Directive({
  selector: 'p-picklist[bapsPickList], p-pickList[bapsPickList], p-pick-list[bapsPickList]',
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsPickList {
  @Input() brand: BapsBrand = injectBapsBrand();
}
