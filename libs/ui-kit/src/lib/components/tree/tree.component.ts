import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule, TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-tree — a nested list that expands, selects (single, multiple,
 * checkbox), filters and drags. Wraps PrimeNG Tree (primeng.dev/tree).
 *
 * Node templates are chosen by each node's `type`: write
 * `<ng-template pTemplate="centre" let-node>` (any name, plus `default`),
 * and `header` / `footer` / `empty` / icon templates, inside the tag; each is
 * handed to PrimeNG under the same type. The inner p-tree keeps the
 * `bapsTree` attribute `_tree.scss` keys on, so TreeSelect's overlay tree is
 * never touched.
 *
 * Defaults are PrimeNG's own (primeng-tree.mjs).
 */
@Component({
  selector: 'baps-tree',
  imports: [Tree, SharedModule, NgTemplateOutlet],
  template: `
    <p-tree
      bapsTree
      [class.baps-sampark]="brand === 'sampark'"
      [value]="value"
      [selectionMode]="selectionMode"
      [selection]="selection"
      [metaKeySelection]="metaKeySelection"
      [propagateSelectionUp]="propagateSelectionUp"
      [propagateSelectionDown]="propagateSelectionDown"
      [filter]="filter!"
      [filterBy]="filterBy"
      [filterMode]="filterMode"
      [filterPlaceholder]="filterPlaceholder!"
      [filterLocale]="filterLocale!"
      [filterInputAutoFocus]="filterInputAutoFocus"
      [draggableNodes]="draggableNodes!"
      [droppableNodes]="droppableNodes!"
      [draggableScope]="draggableScope"
      [droppableScope]="droppableScope"
      [validateDrop]="validateDrop!"
      [loading]="loading!"
      [loadingIcon]="loadingIcon!"
      [loadingMode]="loadingMode"
      [lazy]="lazy"
      [scrollHeight]="scrollHeight!"
      [virtualScroll]="virtualScroll!"
      [virtualScrollItemSize]="virtualScrollItemSize!"
      [indentation]="indentation"
      [emptyMessage]="emptyMessage"
      [highlightOnSelect]="highlightOnSelect"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [togglerAriaLabel]="togglerAriaLabel!"
      [styleClass]="styleClass!"
      (selectionChange)="onSelection($event)"
      (onNodeSelect)="nodeSelect.emit($event)"
      (onNodeUnselect)="nodeUnselect.emit($event)"
      (onNodeExpand)="nodeExpand.emit($event)"
      (onNodeCollapse)="nodeCollapse.emit($event)"
      (onNodeDoubleClick)="nodeDoubleClick.emit($event)"
      (onNodeDrop)="nodeDrop.emit($event)"
      (onLazyLoad)="lazyLoad.emit($event)"
      (onFilter)="filtered.emit($event)"
    >
      @for (t of templates?.toArray() ?? []; track t) {
        <ng-template [pTemplate]="t.getType()" let-implicit let-partialSelected="partialSelected" let-class="class">
          <ng-container *ngTemplateOutlet="t.template; context: { $implicit: implicit, partialSelected: partialSelected, class: class }" />
        </ng-template>
      }
    </p-tree>
  `,
  host: { style: 'display: block' },
})
export class BapsTree {
  /** TreeNode[]: key, label, icon, children, expanded, type, data, leaf. */
  @Input() value: TreeNode[] = [];
  @Input() selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
  /** Two-way bindable: `[(selection)]`. */
  @Input() selection: any = null;
  @Input() metaKeySelection = false;
  @Input() propagateSelectionUp = true;
  @Input() propagateSelectionDown = true;
  /** Adds a search box. */
  @Input() filter?: boolean;
  @Input() filterBy = 'label';
  /** lenient keeps a matching node's parents and children; strict only the path. */
  @Input() filterMode: 'lenient' | 'strict' = 'lenient';
  @Input() filterPlaceholder?: string;
  @Input() filterLocale?: string;
  @Input() filterInputAutoFocus = false;
  @Input() draggableNodes?: boolean;
  @Input() droppableNodes?: boolean;
  @Input() draggableScope: any;
  @Input() droppableScope: any;
  @Input() validateDrop?: boolean;
  @Input() loading?: boolean;
  @Input() loadingIcon?: string;
  @Input() loadingMode: 'mask' | 'icon' = 'mask';
  @Input() lazy = false;
  @Input() scrollHeight?: string;
  @Input() virtualScroll?: boolean;
  @Input() virtualScrollItemSize?: number;
  /** Indent per level, rem. */
  @Input() indentation = 1.5;
  @Input() emptyMessage = '';
  @Input() highlightOnSelect = false;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() togglerAriaLabel?: string;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly selectionChange = new EventEmitter<any>();
  @Output() readonly nodeSelect = new EventEmitter<any>();
  @Output() readonly nodeUnselect = new EventEmitter<any>();
  @Output() readonly nodeExpand = new EventEmitter<any>();
  @Output() readonly nodeCollapse = new EventEmitter<any>();
  @Output() readonly nodeDoubleClick = new EventEmitter<any>();
  @Output() readonly nodeDrop = new EventEmitter<any>();
  @Output() readonly lazyLoad = new EventEmitter<any>();
  @Output() readonly filtered = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  protected onSelection(v: any): void {
    this.selection = v;
    this.selectionChange.emit(v);
  }
}
