import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { PickList } from 'primeng/picklist';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-picklist (also `baps-pick-list`) — move items between a source and a
 * target list and reorder either. Wraps PrimeNG PickList
 * (primeng.dev/picklist); both lists take the shared Listbox skin.
 *
 * Templates: write `<ng-template pTemplate="item" let-item>` (or `sourceHeader`,
 * `targetHeader`, `emptymessagesource`, any PrimeNG PickList template type)
 * inside the tag; each is handed to PrimeNG under the same type.
 *
 * Defaults are PrimeNG's own (primeng-picklist.mjs): an unset input bound
 * through as undefined would wipe them (breakpoint, scrollHeight, buttons).
 */
@Component({
  selector: 'baps-picklist, baps-pick-list',
  imports: [PickList, SharedModule, NgTemplateOutlet],
  template: `
    <p-picklist
      [class.baps-sampark]="brand === 'sampark'"
      [source]="source"
      [target]="target"
      [dataKey]="dataKey!"
      [sourceHeader]="sourceHeader!"
      [targetHeader]="targetHeader!"
      [dragdrop]="dragdrop"
      [filterBy]="filterBy!"
      [filterMatchMode]="filterMatchMode"
      [filterLocale]="filterLocale!"
      [sourceFilterPlaceholder]="sourceFilterPlaceholder!"
      [targetFilterPlaceholder]="targetFilterPlaceholder!"
      [showSourceFilter]="showSourceFilter"
      [showTargetFilter]="showTargetFilter"
      [showSourceControls]="showSourceControls"
      [showTargetControls]="showTargetControls"
      [metaKeySelection]="metaKeySelection"
      [keepSelection]="keepSelection"
      [responsive]="responsive!"
      [breakpoint]="breakpoint"
      [scrollHeight]="scrollHeight"
      [stripedRows]="stripedRows!"
      [disabled]="disabled"
      [sourceOptionDisabled]="sourceOptionDisabled!"
      [targetOptionDisabled]="targetOptionDisabled!"
      [sourceStyle]="sourceStyle"
      [targetStyle]="targetStyle"
      [sourceAriaLabel]="sourceAriaLabel!"
      [targetAriaLabel]="targetAriaLabel!"
      [ariaSourceFilterLabel]="ariaSourceFilterLabel!"
      [ariaTargetFilterLabel]="ariaTargetFilterLabel!"
      [autoOptionFocus]="autoOptionFocus"
      [buttonProps]="buttonProps"
      [tabindex]="tabindex"
      [styleClass]="styleClass!"
      (sourceChange)="onSource($event)"
      (targetChange)="onTarget($event)"
      (onMoveToTarget)="moveToTarget.emit($event)"
      (onMoveAllToTarget)="moveAllToTarget.emit($event)"
      (onMoveToSource)="moveToSource.emit($event)"
      (onMoveAllToSource)="moveAllToSource.emit($event)"
      (onSourceReorder)="sourceReorder.emit($event)"
      (onTargetReorder)="targetReorder.emit($event)"
      (onSourceSelect)="sourceSelect.emit($event)"
      (onTargetSelect)="targetSelect.emit($event)"
      (onSourceFilter)="sourceFilter.emit($event)"
      (onTargetFilter)="targetFilter.emit($event)"
    >
      @for (t of templates?.toArray() ?? []; track t) {
        <ng-template [pTemplate]="t.getType()" let-implicit let-index="index" let-selected="selected" let-options="options">
          <ng-container *ngTemplateOutlet="t.template; context: { $implicit: implicit, index: index, selected: selected, options: options }" />
        </ng-template>
      }
    </p-picklist>
  `,
  host: { style: 'display: block' },
})
export class BapsPickList {
  /** Two-way bindable: `[(source)]`. PrimeNG moves items in and out of it. */
  @Input() source: any[] = [];
  /** Two-way bindable: `[(target)]`. */
  @Input() target: any[] = [];
  @Input() dataKey?: string;
  @Input() sourceHeader?: string;
  @Input() targetHeader?: string;
  @Input() dragdrop = false;
  /** Field(s) to search; adds a filter box to each list. */
  @Input() filterBy?: string;
  @Input() filterMatchMode: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'in' | 'lt' | 'lte' | 'gt' | 'gte' = 'contains';
  @Input() filterLocale?: string;
  @Input() sourceFilterPlaceholder?: string;
  @Input() targetFilterPlaceholder?: string;
  @Input() showSourceFilter = true;
  @Input() showTargetFilter = true;
  @Input() showSourceControls = true;
  @Input() showTargetControls = true;
  @Input() metaKeySelection = false;
  @Input() keepSelection = false;
  /** Stack the lists below `breakpoint`. */
  @Input() responsive?: boolean;
  @Input() breakpoint = '960px';
  @Input() scrollHeight = '14rem';
  @Input() stripedRows?: boolean;
  @Input() disabled = false;
  @Input() sourceOptionDisabled?: string;
  @Input() targetOptionDisabled?: string;
  @Input() sourceStyle: any;
  @Input() targetStyle: any;
  @Input() sourceAriaLabel?: string;
  @Input() targetAriaLabel?: string;
  @Input() ariaSourceFilterLabel?: string;
  @Input() ariaTargetFilterLabel?: string;
  @Input() autoOptionFocus = true;
  @Input() buttonProps: any = { severity: 'secondary' };
  @Input() tabindex = 0;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly sourceChange = new EventEmitter<any[]>();
  @Output() readonly targetChange = new EventEmitter<any[]>();
  @Output() readonly moveToTarget = new EventEmitter<any>();
  @Output() readonly moveAllToTarget = new EventEmitter<any>();
  @Output() readonly moveToSource = new EventEmitter<any>();
  @Output() readonly moveAllToSource = new EventEmitter<any>();
  @Output() readonly sourceReorder = new EventEmitter<any>();
  @Output() readonly targetReorder = new EventEmitter<any>();
  @Output() readonly sourceSelect = new EventEmitter<any>();
  @Output() readonly targetSelect = new EventEmitter<any>();
  @Output() readonly sourceFilter = new EventEmitter<any>();
  @Output() readonly targetFilter = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  protected onSource(v: any[]): void {
    this.source = v;
    this.sourceChange.emit(v);
  }
  protected onTarget(v: any[]): void {
    this.target = v;
    this.targetChange.emit(v);
  }
}
