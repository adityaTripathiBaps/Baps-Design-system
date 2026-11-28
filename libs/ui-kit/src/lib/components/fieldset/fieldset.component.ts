import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { Fieldset } from 'primeng/fieldset';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-fieldset — a bordered group with a legend on the border, optionally
 * collapsible. Wraps PrimeNG Fieldset (primeng.dev/fieldset). Content is
 * projected; `pTemplate="header"` (the legend), `"expandicon"` and
 * `"collapseicon"` are handed to PrimeNG under the same type. Brand colours
 * come from `_fieldset.scss`.
 */
@Component({
  selector: 'baps-fieldset',
  imports: [Fieldset, SharedModule, NgTemplateOutlet],
  template: `
    <p-fieldset
      [class.baps-sampark]="brand === 'sampark'"
      [legend]="legend!"
      [toggleable]="toggleable"
      [collapsed]="collapsed"
      [transitionOptions]="transitionOptions"
      [styleClass]="styleClass!"
      (collapsedChange)="onCollapsed($event)"
      (onBeforeToggle)="beforeToggle.emit($event)"
      (onAfterToggle)="afterToggle.emit($event)"
    >
      @for (t of templates?.toArray() ?? []; track t) {
        <ng-template [pTemplate]="t.getType()"><ng-container *ngTemplateOutlet="t.template" /></ng-template>
      }
      <ng-content />
    </p-fieldset>
  `,
  host: { style: 'display: block' },
})
export class BapsFieldset {
  @Input() legend?: string;
  /** The legend folds the content. */
  @Input() toggleable = false;
  /** Two-way bindable: `[(collapsed)]`. */
  @Input() collapsed = false;
  @Input() transitionOptions = '400ms cubic-bezier(0.86, 0, 0.07, 1)';
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly collapsedChange = new EventEmitter<boolean>();
  @Output() readonly beforeToggle = new EventEmitter<any>();
  @Output() readonly afterToggle = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  protected onCollapsed(v: boolean): void {
    this.collapsed = v;
    this.collapsedChange.emit(v);
  }
}
