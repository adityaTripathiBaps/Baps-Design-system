import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { Timeline } from 'primeng/timeline';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-timeline — events in order along a line. Wraps PrimeNG Timeline
 * (primeng.dev/timeline). Write `pTemplate="content"`, `"opposite"` and
 * `"marker"` templates inside the tag; each is handed to PrimeNG under the
 * same type. Markers take the brand primary from the preset, the line the
 * brand border (`_timeline.scss`).
 */
@Component({
  selector: 'baps-timeline',
  imports: [Timeline, SharedModule, NgTemplateOutlet],
  template: `
    <p-timeline
      [class.baps-sampark]="brand === 'sampark'"
      [value]="value"
      [align]="align"
      [layout]="layout"
      [styleClass]="styleClass!"
    >
      @for (t of templates?.toArray() ?? []; track t) {
        <ng-template [pTemplate]="t.getType()" let-event>
          <ng-container *ngTemplateOutlet="t.template; context: { $implicit: event }" />
        </ng-template>
      }
    </p-timeline>
  `,
  host: { style: 'display: block' },
})
export class BapsTimeline {
  @Input() value: any[] = [];
  /** Vertical: left, right, alternate. Horizontal: top, bottom, alternate. */
  @Input() align: 'left' | 'right' | 'alternate' | 'top' | 'bottom' = 'left';
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;
}
