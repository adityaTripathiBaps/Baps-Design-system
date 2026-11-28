import { Directive, Input } from '@angular/core';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * bapsTimeline — brand hook on PrimeNG's own `<p-timeline>`
 * (primeng.dev/timeline): events along a line, with optional opposite text
 * and custom markers. No wrapper component: it needs no BAPS-specific
 * inputs, and its `content` / `marker` / `opposite` templates work as PrimeNG
 * documents them on its own element.
 *
 *   <p-timeline bapsTimeline [value]="events">
 *     <ng-template #content let-e>{{ e.status }}</ng-template>
 *   </p-timeline>
 */
@Directive({
  selector: 'p-timeline[bapsTimeline]',
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsTimeline {
  @Input() brand: BapsBrand = injectBapsBrand();
}
