import { Directive, Input } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * bapsDataView — brand hook on PrimeNG's own `<p-dataview>`
 * (primeng.dev/dataview). No wrapper component on purpose: DataView finds its
 * `#list`, `#grid`, `#header`, `#footer` and `#emptymessage` templates by
 * reference name, which a wrapper would have to re-declare and forward one by
 * one; on PrimeNG's element they work as PrimeNG documents them. The preset
 * and the kit paginator skin do the rest.
 *
 *   <p-dataview bapsDataView [value]="items" [paginator]="true" [rows]="6">
 *     <ng-template #list let-items> … </ng-template>
 *   </p-dataview>
 */
@Directive({
  selector: 'p-dataview[bapsDataView], p-dataView[bapsDataView], p-data-view[bapsDataView]',
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsDataView {
  @Input() brand: BapsBrand = injectBapsBrand();
}
