import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { OrderList } from 'primeng/orderlist';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-orderlist (also `baps-order-list`) — a list the user reorders with the
 * side buttons or by dragging. Wraps PrimeNG OrderList (primeng.dev/orderlist);
 * the list takes the shared Listbox skin.
 *
 * OrderList reorders `value` in place and emits `reorder`. Templates:
 * `pTemplate="item"`, `"header"` (a title: PrimeNG v21 does not render a
 * `header` input), `"empty"`, `"emptyfilter"`, the move icons; each is handed
 * to PrimeNG under the same type.
 *
 * Defaults are PrimeNG's own (primeng-orderlist.mjs).
 */
@Component({
  selector: 'baps-orderlist, baps-order-list',
  imports: [OrderList, SharedModule, NgTemplateOutlet],
  template: `
    <p-orderlist
      [class.baps-sampark]="brand === 'sampark'"
      [value]="value"
      [selection]="selection"
      [dataKey]="dataKey!"
      [dragdrop]="dragdrop"
      [controlsPosition]="controlsPosition"
      [filterBy]="filterBy!"
      [filterPlaceholder]="filterPlaceholder!"
      [filterMatchMode]="filterMatchMode"
      [filterLocale]="filterLocale!"
      [metaKeySelection]="metaKeySelection"
      [responsive]="responsive!"
      [breakpoint]="breakpoint"
      [scrollHeight]="scrollHeight"
      [stripedRows]="stripedRows!"
      [disabled]="disabled"
      [listStyle]="listStyle"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [ariaFilterLabel]="ariaFilterLabel!"
      [autoOptionFocus]="autoOptionFocus"
      [buttonProps]="buttonProps"
      [tabindex]="tabindex!"
      [styleClass]="styleClass!"
      (selectionChange)="onSelection($event)"
      (onReorder)="reorder.emit($event)"
      (onFilterEvent)="filtered.emit($event)"
    >
      @for (t of templates?.toArray() ?? []; track t) {
        <ng-template [pTemplate]="t.getType()" let-implicit let-index="index" let-selected="selected">
          <ng-container *ngTemplateOutlet="t.template; context: { $implicit: implicit, index: index, selected: selected }" />
        </ng-template>
      }
    </p-orderlist>
  `,
  host: { style: 'display: block' },
})
export class BapsOrderList {
  /** Reordered in place by PrimeNG; listen to `reorder`. */
  @Input() value: any[] = [];
  /** Two-way bindable: `[(selection)]`. */
  @Input() selection: any[] = [];
  @Input() dataKey?: string;
  @Input() dragdrop = false;
  @Input() controlsPosition: 'left' | 'right' = 'left';
  @Input() filterBy?: string;
  @Input() filterPlaceholder?: string;
  @Input() filterMatchMode: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte' = 'contains';
  @Input() filterLocale?: string;
  @Input() metaKeySelection = false;
  @Input() responsive?: boolean;
  @Input() breakpoint = '960px';
  @Input() scrollHeight = '14rem';
  @Input() stripedRows?: boolean;
  @Input() disabled = false;
  @Input() listStyle: any;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() ariaFilterLabel?: string;
  @Input() autoOptionFocus = true;
  @Input() buttonProps: any = { severity: 'secondary' };
  @Input() tabindex?: number;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly selectionChange = new EventEmitter<any[]>();
  /** The list was reordered (PrimeNG's onReorder). */
  @Output() readonly reorder = new EventEmitter<any>();
  @Output() readonly filtered = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  protected onSelection(v: any[]): void {
    this.selection = v;
    this.selectionChange.emit(v);
  }
}
