import { Directive, Input } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * bapsTree — brand hook on PrimeNG's own `<p-tree>` (primeng.dev/tree): a
 * nested list that expands, selects (single, multiple, checkbox), filters and
 * drags. No wrapper component: node templates are picked by each node's
 * `type` (any name, plus `default`), which a wrapper cannot forward without
 * knowing the names in advance.
 *
 *   <p-tree bapsTree [value]="nodes" selectionMode="checkbox" [(selection)]="picked" />
 */
@Directive({
  selector: 'p-tree[bapsTree]',
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsTree {
  @Input() brand: BapsBrand = injectBapsBrand();
}
