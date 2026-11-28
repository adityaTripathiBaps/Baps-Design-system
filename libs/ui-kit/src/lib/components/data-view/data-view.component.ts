import { Component, ContentChild, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-dataview (also `baps-data-view`) — a collection laid out with your own
 * template per item, as a list or a grid. Wraps PrimeNG DataView
 * (primeng.dev/dataview).
 *
 * DataView finds its templates by reference name only. Write `#list`,
 * `#grid`, `#header`, `#footer` and `#emptymessage` (or the same names as
 * `pTemplate`) inside the tag; the wrapper re-declares each under that name
 * for PrimeNG.
 *
 * For paging, page the value and put `baps-paginator` under the view, as with
 * `baps-table`: DataView's own `[paginator]` draws PrimeNG's p-paginator.
 * Defaults are PrimeNG's own (primeng-dataview.mjs).
 */
@Component({
  selector: 'baps-dataview, baps-data-view',
  imports: [DataView, SharedModule, NgTemplateOutlet],
  template: `
    <p-dataview
      [class.baps-sampark]="brand === 'sampark'"
      [value]="value"
      [layout]="layout"
      [paginator]="paginator!"
      [rows]="rows!"
      [first]="first"
      [totalRecords]="totalRecords!"
      [pageLinks]="pageLinks"
      [rowsPerPageOptions]="rowsPerPageOptions!"
      [paginatorPosition]="paginatorPosition"
      [alwaysShowPaginator]="alwaysShowPaginator"
      [lazy]="lazy!"
      [lazyLoadOnInit]="lazyLoadOnInit"
      [sortField]="sortField!"
      [sortOrder]="sortOrder!"
      [filterBy]="filterBy!"
      [filterLocale]="filterLocale!"
      [emptyMessage]="emptyMessage"
      [loading]="loading!"
      [loadingIcon]="loadingIcon!"
      [gridStyleClass]="gridStyleClass"
      [styleClass]="styleClass!"
      (onLazyLoad)="lazyLoad.emit($event)"
      (onPage)="page.emit($event)"
      (onSort)="sort.emit($event)"
      (onChangeLayout)="changeLayout.emit($event)"
    >
      @if (tpl('list'); as t) {
        <ng-template #list let-items><ng-container *ngTemplateOutlet="t; context: { $implicit: items }" /></ng-template>
      }
      @if (tpl('grid'); as t) {
        <ng-template #grid let-items><ng-container *ngTemplateOutlet="t; context: { $implicit: items }" /></ng-template>
      }
      @if (tpl('header'); as t) {
        <ng-template #header><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('footer'); as t) {
        <ng-template #footer><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('emptymessage'); as t) {
        <ng-template #emptymessage><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
    </p-dataview>
  `,
  host: { style: 'display: block' },
})
export class BapsDataView {
  @Input() value: any[] = [];
  @Input() layout: 'list' | 'grid' = 'list';
  /** PrimeNG's own paginator; the kit pattern is baps-paginator under the view. */
  @Input() paginator?: boolean;
  @Input() rows?: number;
  @Input() first = 0;
  @Input() totalRecords?: number;
  @Input() pageLinks = 5;
  @Input() rowsPerPageOptions?: any[];
  @Input() paginatorPosition: 'top' | 'bottom' | 'both' = 'bottom';
  @Input() alwaysShowPaginator = true;
  @Input() lazy?: boolean;
  @Input() lazyLoadOnInit = true;
  @Input() sortField?: string;
  /** 1 ascending, -1 descending. */
  @Input() sortOrder?: number;
  @Input() filterBy?: string;
  @Input() filterLocale?: string;
  @Input() emptyMessage = '';
  @Input() loading?: boolean;
  @Input() loadingIcon?: string;
  @Input() gridStyleClass = '';
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly lazyLoad = new EventEmitter<any>();
  @Output() readonly page = new EventEmitter<any>();
  @Output() readonly sort = new EventEmitter<any>();
  @Output() readonly changeLayout = new EventEmitter<any>();

  @ContentChild('list') private listRef?: TemplateRef<unknown>;
  @ContentChild('grid') private gridRef?: TemplateRef<unknown>;
  @ContentChild('header') private headerRef?: TemplateRef<unknown>;
  @ContentChild('footer') private footerRef?: TemplateRef<unknown>;
  @ContentChild('emptymessage') private emptyRef?: TemplateRef<unknown>;
  @ContentChildren(PrimeTemplate) private templates?: QueryList<PrimeTemplate>;

  /** A `#name` template, else a `pTemplate="name"` one. */
  tpl(name: 'list' | 'grid' | 'header' | 'footer' | 'emptymessage'): TemplateRef<unknown> | undefined {
    const ref = { list: this.listRef, grid: this.gridRef, header: this.headerRef, footer: this.footerRef, emptymessage: this.emptyRef }[name];
    return ref ?? this.templates?.find((t) => t.getType() === name)?.template;
  }
}
