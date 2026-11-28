import { Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { Splitter } from 'primeng/splitter';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-splitter — two or more panels side by side (or stacked) with a
 * draggable gutter between them. Wraps PrimeNG Splitter
 * (primeng.dev/splitter).
 *
 * Each panel is a template inside the tag: `<ng-template pTemplate="panel">`
 * or `<ng-template #panel>`, in order. `panelSizes` are percentages.
 * Defaults are PrimeNG's own (primeng-splitter.mjs).
 */
@Component({
  selector: 'baps-splitter',
  imports: [Splitter, SharedModule, NgTemplateOutlet],
  template: `
    <p-splitter
      [class.baps-sampark]="brand === 'sampark'"
      [layout]="layout"
      [gutterSize]="gutterSize"
      [step]="step"
      [panelSizes]="panelSizes"
      [minSizes]="minSizes"
      [stateKey]="stateKey!"
      [stateStorage]="stateStorage"
      [panelStyleClass]="panelStyleClass!"
      [panelStyle]="panelStyle"
      [styleClass]="styleClass!"
      (onResizeStart)="resizeStart.emit($event)"
      (onResizeEnd)="resizeEnd.emit($event)"
    >
      @for (t of panels; track $index) {
        <ng-template pTemplate="panel"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
    </p-splitter>
  `,
  /* The host takes the height (style="height: 12rem"); PrimeNG's splitter
     sized to its content and ignored it (54px in a 12rem host, measured). */
  styles: `
    baps-splitter > .p-splitter {
      height: 100%;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display: block' },
})
export class BapsSplitter {
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  /** Gutter thickness, px. */
  @Input() gutterSize = 4;
  /** Percent per arrow-key press on the focused gutter. */
  @Input() step = 5;
  /** Initial sizes in percent, one per panel, e.g. [25, 75]. */
  @Input() panelSizes: number[] = [];
  /** Minimum sizes in percent, one per panel. */
  @Input() minSizes: number[] = [];
  /** Remember the sizes under this key. */
  @Input() stateKey?: string | null;
  @Input() stateStorage: 'session' | 'local' = 'session';
  @Input() panelStyleClass?: string;
  @Input() panelStyle: any;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly resizeStart = new EventEmitter<any>();
  @Output() readonly resizeEnd = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) private templates?: QueryList<PrimeTemplate>;
  @ContentChildren('panel') private refs?: QueryList<TemplateRef<unknown>>;

  /** The consumer's panels in order: pTemplates, else #panel refs. */
  protected get panels(): TemplateRef<unknown>[] {
    const typed = this.templates?.map((t) => t.template) ?? [];
    return typed.length ? typed : (this.refs?.toArray() ?? []);
  }
}
