import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { Panel } from 'primeng/panel';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-panel — a titled container whose body can fold away. Wraps PrimeNG
 * Panel (primeng.dev/panel). Content is projected; `pTemplate="header"`,
 * `"icons"` (header actions), `"headericons"` (the toggle icon) and
 * `"footer"` are handed to PrimeNG under the same type.
 *
 * Defaults are PrimeNG's own (primeng-panel.mjs).
 */
@Component({
  selector: 'baps-panel',
  imports: [Panel, SharedModule, NgTemplateOutlet],
  template: `
    <p-panel
      [class.baps-sampark]="brand === 'sampark'"
      [header]="header!"
      [toggleable]="toggleable"
      [collapsed]="collapsed"
      [toggler]="toggler"
      [iconPos]="iconPos"
      [showHeader]="showHeader"
      [transitionOptions]="transitionOptions"
      [toggleButtonProps]="toggleButtonProps"
      [styleClass]="styleClass!"
      (collapsedChange)="onCollapsed($event)"
      (onBeforeToggle)="beforeToggle.emit($event)"
      (onAfterToggle)="afterToggle.emit($event)"
    >
      @for (t of templates?.toArray() ?? []; track t) {
        <ng-template [pTemplate]="t.getType()" let-implicit>
          <ng-container *ngTemplateOutlet="t.template; context: { $implicit: implicit }" />
        </ng-template>
      }
      <ng-content />
    </p-panel>
  `,
  host: { style: 'display: block' },
})
export class BapsPanel {
  @Input() header?: string;
  @Input() toggleable = false;
  /** Two-way bindable: `[(collapsed)]`. */
  @Input() collapsed = false;
  /** What folds the panel: the toggle icon or the whole header. */
  @Input() toggler: 'icon' | 'header' = 'icon';
  @Input() iconPos: 'start' | 'end' | 'center' = 'end';
  @Input() showHeader = true;
  @Input() transitionOptions = '400ms cubic-bezier(0.86, 0, 0.07, 1)';
  @Input() toggleButtonProps: any;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly collapsedChange = new EventEmitter<boolean>();
  @Output() readonly beforeToggle = new EventEmitter<any>();
  @Output() readonly afterToggle = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  protected onCollapsed(v: boolean | undefined): void {
    this.collapsed = !!v;
    this.collapsedChange.emit(this.collapsed);
  }
}
