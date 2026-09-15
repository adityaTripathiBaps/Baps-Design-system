import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { TrackByFunction } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule, SortMeta } from 'primeng/api';

/**
 * baps-table — data table with sorting, filtering, pagination, and selection.
 *
 * Wraps PrimeNG Table. The Sampark SCSS skin (_table-sampark.scss) provides
 * the visual overrides; this wrapper provides the baps-* API surface.
 *
 * Usage relies on PrimeNG's template-driven approach — column definitions
 * are passed via ng-template with pTemplate:
 *
 *   <baps-table [value]="data" [paginator]="true" [rows]="10" brand="sampark">
 *     <ng-template pTemplate="header">
 *       <tr><th pSortableColumn="name">Name <p-sortIcon field="name" /></th></tr>
 *     </ng-template>
 *     <ng-template pTemplate="body" let-row>
 *       <tr><td>{{ row.name }}</td></tr>
 *     </ng-template>
 *   </baps-table>
 *
 * Template-driven features (sticky columns via pFrozenColumn, skeleton
 * loading via pTemplate="loadingbody", row-group headers via
 * pTemplate="groupheader") need TableModule imported by the *consumer*,
 * since the ng-templates are declared in the consumer's component.
 */
@Component({
  selector: 'baps-table',
  imports: [TableModule, NgTemplateOutlet, SharedModule],
  template: `
    <p-table
      #pt
      [value]="value"
      [frozenValue]="frozenValue"
      [paginator]="paginator"
      [first]="first"
      [rows]="rows"
      [totalRecords]="totalRecords"
      [rowsPerPageOptions]="rowsPerPageOptions"
      [showCurrentPageReport]="showCurrentPageReport"
      [currentPageReportTemplate]="currentPageReportTemplate"
      [sortMode]="sortMode"
      [sortField]="sortField"
      [sortOrder]="sortOrder!"
      [multiSortMeta]="multiSortMeta!"
      [showInitialSortBadge]="showInitialSortBadge"
      [scrollable]="scrollable"
      [scrollHeight]="scrollHeight"
      [virtualScroll]="virtualScroll"
      [virtualScrollItemSize]="virtualScrollItemSize!"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      [loading]="loading"
      [lazy]="lazy"
      [rowHover]="rowHover"
      [rowTrackBy]="rowTrackBy!"
      [globalFilterFields]="globalFilterFields"
      [rowGroupMode]="rowGroupMode!"
      [groupRowsBy]="groupRowsBy"
      [resizableColumns]="resizableColumns"
      [columnResizeMode]="columnResizeMode"
      [showGridlines]="showGridlines"
      [stripedRows]="stripedRows"
      [size]="size"
      [responsiveLayout]="responsiveLayout"
      [style]="style"
      [styleClass]="computedStyleClass"
      [tableStyle]="tableStyle"
      [dataKey]="dataKey"
      (onSort)="sortEvent.emit($event)"
      (onPage)="pageEvent.emit($event)"
      (onRowSelect)="rowSelect.emit($event)"
      (onRowUnselect)="rowUnselect.emit($event)"
      (onLazyLoad)="lazyLoad.emit($event)"
      (selectionChange)="selectionChange.emit($event)"
      (firstChange)="firstChange.emit($event)"
    >
      @for (t of templates; track t) {
        <ng-template
          [pTemplate]="t.getType()"
          let-rowData
          let-columns="columns"
          let-rowIndex="rowIndex"
          let-expanded="expanded"
          let-editing="editing"
          let-frozen="frozen"
          let-rowgroup="rowgroup"
          let-rowspan="rowspan"
        >
          <ng-container
            *ngTemplateOutlet="
              t.template;
              context: {
                $implicit: rowData,
                columns: columns,
                rowIndex: rowIndex,
                expanded: expanded,
                editing: editing,
                frozen: frozen,
                rowgroup: rowgroup,
                rowspan: rowspan
              }
            "
          ></ng-container>
        </ng-template>
      }
    </p-table>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-table {
      display: block;
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsTable {
  /**
   * The PrimeNG table underneath.
   *
   * Exposed because a consumer's own header markup CANNOT reach it any other
   * way. `pSortableColumn`, `p-sortIcon` and `pSelectableRow` all inject
   * `Table`, and content projected into this wrapper sits under the CONSUMER
   * in the declaration tree rather than under `p-table` — so the lookup walks
   * straight past it and throws NG0201. That is the same element-injector trap
   * that made accordion and tabs ship as directives instead of wrappers; here
   * it is answered by handing the instance out through a template reference
   * rather than through DI:
   *
   *     <baps-table #t sortMode="multiple" [multiSortMeta]="order">
   *       <ng-template pTemplate="header">
   *         <th (click)="t.sort('name', $event)">
   *           Name <baps-sort-icon [order]="t.sortOrderOf('name')"
   *                                [index]="t.sortIndexOf('name')" />
   *         </th>
   *
   * Prefer the three methods below to poking at this directly — they are the
   * supported surface, and they are what the icon needs.
   */
  @ViewChild(Table) table?: Table;
  /** Array of data objects to display. */
  @Input() value: any[] = [];
  /** Rows pinned above the scrollable body (sticky header rows). */
  @Input() frozenValue?: any[];
  @Input() paginator = false;
  /** Index of the first displayed record — two-way via (firstChange). */
  @Input() first = 0;
  @Input() rows = 10;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions?: number[];
  @Input() showCurrentPageReport = false;
  @Input() currentPageReportTemplate = '{first} - {last} of {totalRecords}';
  @Input() sortMode: 'single' | 'multiple' = 'single';
  @Input() sortField?: string;
  @Input() sortOrder: number | undefined;
  /**
   * The multi-column sort order, highest priority first — PrimeNG's own
   * SortMeta, so `baps-table-sort-config`'s output drops straight in.
   *
   * Without this input the panel had nowhere to send its result: sortField /
   * sortOrder describe one column, and ctrl-clicking headers was the only way
   * to reach a multi-column order at all.
   */
  @Input() multiSortMeta?: SortMeta[];
  /**
   * Whether a sorted column shows its position in the order.
   *
   * PrimeNG only stamps the badge when this is on, the mode is 'multiple' AND
   * two or more columns are sorted — which is exactly when an order number
   * carries information. The Sampark skin draws the arrow and that badge as one
   * bordered pill; a single sorted column stays a bare arrow.
   */
  @Input() showInitialSortBadge = true;
  @Input() scrollable = false;
  @Input() scrollHeight?: string;
  /** Needs [scrollable]="true", a [scrollHeight] and [virtualScrollItemSize]. */
  @Input() virtualScroll = false;
  @Input() virtualScrollItemSize?: number;
  @Input() selectionMode?: 'single' | 'multiple' | null;
  @Input() selection: any;
  @Input() loading = false;
  @Input() lazy = false;
  /** Row hover highlight. PrimeNG also enables it implicitly when selectable. */
  @Input() rowHover = true;
  /** trackBy for the row ngFor — pass the app's existing trackBy function. */
  @Input() rowTrackBy?: TrackByFunction<any>;
  @Input() globalFilterFields?: string[];
  /** 'subheader' needs pTemplate="groupheader"; 'rowspan' merges cells. */
  @Input() rowGroupMode?: 'subheader' | 'rowspan';
  @Input() groupRowsBy?: any;
  @Input() resizableColumns = false;
  @Input() columnResizeMode: 'fit' | 'expand' = 'fit';
  @Input() showGridlines = false;
  /** Off by default — the Sampark Figma spec has flat white rows. */
  @Input() stripedRows = false;
  @Input() size?: 'small' | 'large';
  @Input() responsiveLayout: 'scroll' | 'stack' = 'scroll';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() tableStyle?: Record<string, string | number>;
  @Input() dataKey?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /**
   * Sort by one column, replacing any existing order.
   *
   * Deliberately single-column: multi-column order is reached through
   * `baps-table-sort-config`, where the priority is visible and draggable,
   * not by holding a modifier nobody is told about. Passing the event through
   * lets PrimeNG honour ctrl/meta-click for anyone who does want it — in
   * 'multiple' mode a plain click already resets the order to this column.
   */
  sort(field: string, event?: Event): void {
    this.table?.sort({ originalEvent: event ?? new MouseEvent('click'), field });
  }

  /**
   * 1 ascending, -1 descending, 0 unsorted — the shape baps-sort-icon wants.
   *
   * Read off the INPUTS, not off the PrimeNG instance. The header template is
   * evaluated during the consumer's change detection, and asking a ViewChild
   * for it returned 0 for every column even while multiSortMeta plainly held
   * one — the inputs are the source of truth the consumer already owns, so
   * they are what the icon should follow.
   */
  sortOrderOf(field: string): 1 | -1 | 0 {
    if (this.sortMode === 'single') {
      return this.sortField === field ? ((this.sortOrder as 1 | -1) ?? 0) : 0;
    }
    const meta = this.multiSortMeta?.find((m) => m.field === field);
    return meta ? ((meta.order as 1 | -1) ?? 0) : 0;
  }

  /**
   * 1-based position in the multi-column order, or 0 when the badge should not
   * show. Mirrors PrimeNG's own rule: only in 'multiple' mode, and only once
   * MORE THAN ONE column is sorted — an order number on a single sorted column
   * says nothing.
   */
  sortIndexOf(field: string): number {
    const meta = this.multiSortMeta;
    if (this.sortMode !== 'multiple' || !meta || meta.length < 2) return 0;
    const i = meta.findIndex((m) => m.field === field);
    return i === -1 ? 0 : i + 1;
  }

  @Output() sortEvent = new EventEmitter<any>();
  @Output() pageEvent = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() lazyLoad = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();
  @Output() firstChange = new EventEmitter<number>();

  @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

  get computedStyleClass(): string {
    return this.styleClass || '';
  }
}
