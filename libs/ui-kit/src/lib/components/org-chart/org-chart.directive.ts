import { Directive, Input } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * bapsOrgChart — brand hook on PrimeNG's own `<p-organizationchart>`
 * (primeng.dev/organizationchart): a tree drawn top-down with connector
 * lines. No wrapper component: node templates are picked by each node's
 * `type` (`pTemplate="person"`, any name, plus `default`), which a wrapper
 * cannot forward without knowing the names in advance.
 *
 *   <p-organizationchart bapsOrgChart [value]="tree" [collapsible]="true">
 *     <ng-template let-node pTemplate="default">{{ node.label }}</ng-template>
 *   </p-organizationchart>
 */
@Directive({
  selector:
    'p-organizationchart[bapsOrgChart], p-organizationChart[bapsOrgChart], p-organization-chart[bapsOrgChart]',
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsOrgChart {
  @Input() brand: BapsBrand = injectBapsBrand();
}
