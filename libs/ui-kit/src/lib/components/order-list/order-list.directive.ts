import { Directive, Input } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * bapsOrderList — brand hook on PrimeNG's own `<p-orderlist>`
 * (primeng.dev/orderlist): a list the user reorders with the side buttons or
 * by dragging. No wrapper component: OrderList takes its templates both as
 * pTemplate and by reference name, mutates `value` in place and reports it
 * with `onReorder`; on PrimeNG's element all of that works as documented.
 *
 *   <p-orderlist bapsOrderList [value]="steps" dataKey="id" [dragdrop]="true">
 *     <ng-template #item let-step> {{ step.name }} </ng-template>
 *   </p-orderlist>
 */
@Directive({
  selector: 'p-orderlist[bapsOrderList], p-orderList[bapsOrderList], p-order-list[bapsOrderList]',
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsOrderList {
  @Input() brand: BapsBrand = injectBapsBrand();
}
