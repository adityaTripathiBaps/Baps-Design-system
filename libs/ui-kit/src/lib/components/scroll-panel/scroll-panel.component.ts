import { Component, Input, ViewChild } from '@angular/core';
import { ScrollPanel } from 'primeng/scrollpanel';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-scrollpanel (also `baps-scroll-panel`) — a scroll area with a thin
 * custom scrollbar that looks the same on every OS. Wraps PrimeNG ScrollPanel
 * (primeng.dev/scrollpanel; ScrollArea in the v21 list). Give it a height
 * (`style="height: 12rem"`); the content is projected.
 */
@Component({
  selector: 'baps-scrollpanel, baps-scroll-panel',
  imports: [ScrollPanel],
  template: `
    <p-scrollpanel [class.baps-sampark]="brand === 'sampark'" [step]="step" [styleClass]="styleClass!" [style]="{ height: '100%', width: '100%' }">
      <ng-content />
    </p-scrollpanel>
  `,
  host: { style: 'display: block' },
})
export class BapsScrollPanel {
  /** Pixels per arrow-key press on the focused bar (PrimeNG default 5). */
  @Input() step = 5;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @ViewChild(ScrollPanel) private panel?: ScrollPanel;

  /** Scroll the content to a y offset, px. */
  scrollTop(y: number): void {
    this.panel?.scrollTop(y);
  }

  /** Re-measure after the content changes size. */
  refresh(): void {
    this.panel?.refresh();
  }
}
