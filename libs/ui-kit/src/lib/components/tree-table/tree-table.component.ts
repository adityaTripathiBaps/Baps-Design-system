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
import { NgTemplateOutlet } from '@angular/common';
import { TreeTable, TreeTableModule } from 'primeng/treetable';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import type { TreeNode } from 'primeng/api';

/**
 * baps-tree-table — a table whose rows nest, for data that is a hierarchy
 * rather than a list (a location and the locations under it, say).
 *
 * Wraps PrimeNG TreeTable. It is a sibling of baps-table, not a variant of it:
 * the two take different data (`TreeNode[]` against a flat array) and PrimeNG
 * ships them as separate components, so one wrapper cannot serve both without
 * pretending the shapes match.
 *
 * TEMPLATE FORWARDING works the same way as baps-table's, and for the same
 * reason: the `ng-template`s are declared in the CONSUMER's component, so they
 * cannot simply be projected — they are collected with ContentChildren and
 * re-emitted with the pTemplate name PrimeNG expects, carrying the context
 * variables back out. The body context is PrimeNG's own, verified against
 * TTBody rather than assumed: `$implicit` is the ROW NODE
 * (`{ node, parent, level, visible }`), with `node`, `rowData` and `columns`
 * alongside it. `rowData` is `node.data`.
 *
 *   <baps-tree-table #tt [value]="nodes" dataKey="id">
 *     <ng-template pTemplate="header">…</ng-template>
 *     <ng-template pTemplate="body" let-rowNode let-rowData="rowData">
 *       <tr>
 *         <td [style.padding-left.rem]="rowNode.level * 1.5">
 *           <button type="button" (click)="tt.toggle(rowNode, $event)">…</button>
 *           {{ rowData.name }}
 *         </td>
 *       </tr>
 *     </ng-template>
 *   </baps-tree-table>
 *
 * DO NOT reach for `p-treeTableToggler`, `ttRow`, `ttSortableColumn` or
 * `ttSelectableRow` inside those templates. They all inject `TreeTable`, and a
 * forwarded template's injector is its DECLARATION site — the consumer — not
 * the insertion point under `p-treeTable`. The lookup walks straight past the
 * instance and throws NG0201 `No provider found for TreeTable`, which surfaces
 * as a header with no body rows. That is the same element-injector trap
 * baps-table documents for `pSortableColumn`; the answer here is the same one,
 * handing the instance out through a template reference rather than DI. Use
 * `toggle`/`isExpanded`/`isLeaf` below — they are the supported surface.
 */
@Component({
  selector: 'baps-tree-table',
  imports: [TreeTableModule, NgTemplateOutlet, SharedModule],
  template: `
    <p-treeTable
      [value]="value"
      [columns]="columns"
      [dataKey]="dataKey"
      [scrollable]="scrollable"
      [scrollHeight]="scrollHeight"
      [lazy]="lazy"
      [loading]="loading"
      [paginator]="paginator"
      [rows]="rows"
      [first]="first"
      [totalRecords]="totalRecords"
      [rowsPerPageOptions]="rowsPerPageOptions"
      [sortField]="sortField!"
      [sortOrder]="sortOrder"
      [sortMode]="sortMode"
      [selectionMode]="selectionMode!"
      [(selection)]="selection"
      [styleClass]="styleClass"
      [tableStyle]="tableStyle"
      (onNodeExpand)="nodeExpand.emit($event)"
      (onNodeCollapse)="nodeCollapse.emit($event)"
      (onSort)="sortEvent.emit($event)"
      (onLazyLoad)="lazyLoad.emit($event)"
      (selectionChange)="selectionChange.emit($event)"
    >
      @for (t of templates; track t) {
        <ng-template
          [pTemplate]="t.getType()"
          let-rowNode
          let-rowData="rowData"
          let-columns="columns"
          let-node="node"
          let-frozen="frozen"
        >
          <ng-container
            *ngTemplateOutlet="
              t.template;
              context: {
                $implicit: rowNode,
                rowData: rowData,
                columns: columns,
                node: node,
                frozen: frozen
              }
            "
          ></ng-container>
        </ng-template>
      }
    </p-treeTable>
  `,
  encapsulation: ViewEncapsulation.None,
  // CSS lives in ../../styles/components/tree-table/_tree-table.scss so the same
  // rules ship to non-Angular consumers through @org/ui-kit/styles — an inline
  // `styles:` block compiles into the JS bundle and reaches no one else.
  styleUrls: ['../../styles/components/tree-table/_tree-table.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsTreeTable {
  /** The hierarchy. Each node's `children` are its rows one level down. */
  @Input() value: TreeNode[] = [];
  @Input() columns?: unknown[];
  /**
   * Field that identifies a node. Expansion state is keyed on it, so without
   * it a reload collapses the tree back to the root.
   */
  @Input() dataKey?: string;
  @Input() scrollable = false;
  @Input() scrollHeight?: string;
  /** Server-side paging/sorting: emits `lazyLoad` instead of working locally. */
  @Input() lazy = false;
  @Input() loading = false;
  @Input() paginator = false;
  @Input() rows = 10;
  @Input() first = 0;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions?: number[];
  @Input() sortField?: string;
  @Input() sortOrder = 1;
  @Input() sortMode: 'single' | 'multiple' = 'single';
  @Input() selectionMode?: 'single' | 'multiple' | 'checkbox';
  @Input() selection: unknown;
  @Input() styleClass?: string;
  @Input() tableStyle?: Record<string, string | number>;
  /** Visual skin: 'mybky' (default) or 'sampark'. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  @Output() nodeExpand = new EventEmitter<unknown>();
  @Output() nodeCollapse = new EventEmitter<unknown>();
  @Output() sortEvent = new EventEmitter<unknown>();
  @Output() lazyLoad = new EventEmitter<unknown>();
  @Output() selectionChange = new EventEmitter<unknown>();

  /**
   * Collected rather than projected: the templates are declared in the
   * consumer's component, so they have to be re-emitted with the pTemplate
   * names PrimeNG looks for. Same mechanism as baps-table.
   */
  @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

  /**
   * The PrimeNG tree table underneath. Exposed for the same reason baps-table
   * exposes its own: a consumer's forwarded template cannot reach it through
   * DI. Prefer the three methods below — they are the supported surface.
   */
  @ViewChild(TreeTable) treeTable?: TreeTable;

  /**
   * Expand or collapse a row. Replaces `p-treeTableToggler`, which cannot be
   * used from a forwarded template (see the class doc).
   *
   * Mirrors the toggler's own handler exactly: flip `expanded`, emit on the
   * PrimeNG instance, then re-serialise. Emitting through PrimeNG rather than
   * this wrapper's Outputs is deliberate — the existing `(onNodeExpand)`
   * binding forwards it on, so a caller sees one event, not two.
   */
  toggle(rowNode: BapsTreeRowNode, event?: Event): void {
    const node = rowNode?.node;
    if (!node) return;
    node.expanded = !node.expanded;
    const tt = this.treeTable;
    if (!tt) return;
    (node.expanded ? tt.onNodeExpand : tt.onNodeCollapse).emit({
      // PrimeNG types this as Event; a programmatic toggle has none to pass.
      originalEvent: event as Event,
      node,
    });
    tt.updateSerializedValue();
  }

  isExpanded(rowNode: BapsTreeRowNode): boolean {
    return !!rowNode?.node?.expanded;
  }

  /** True when the row has nothing under it, so it gets no toggler. */
  isLeaf(rowNode: BapsTreeRowNode): boolean {
    return !rowNode?.node?.children?.length;
  }
}

/**
 * A row as PrimeNG serialises it — NOT the TreeNode itself. This is what a
 * body template's `$implicit` holds; `level` is what indents a row.
 */
export interface BapsTreeRowNode {
  node: TreeNode;
  parent?: TreeNode | null;
  level: number;
  visible?: boolean;
}
