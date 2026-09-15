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
  styles: `
    baps-tree-table {
      display: block;
      --baps-tt-border: var(--tree-table-mybky-border-color, #e4ecf1);
      --baps-tt-header-bg: var(--tree-table-mybky-header-background, #f8fafb);
      --baps-tt-header-h: var(--tree-table-mybky-header-height, 2.5rem);
      --baps-tt-header-text: var(--color-mybky-text-secondary, #2b2f32);
      --baps-tt-row-bg: var(--tree-table-mybky-row-background, #ffffff);
      /* #EEF0F8, NOT the mono wash a flat table uses. A tree row is taller and
         carries connector lines, so it needs a hover that reads under them. */
      --baps-tt-row-hover: var(--tree-table-mybky-row-hover-background, #eef0f8);
      --baps-tt-row-error: var(--tree-table-mybky-row-error-background, #fff5f5);
      --baps-tt-row-h: var(--tree-table-mybky-row-height, 3.75rem);
      --baps-tt-text: var(--color-mybky-text-primary, #181b1d);
      --baps-tt-toggler: var(--color-mybky-text-muted, #6f777d);
      /* The one place a line darker than border.default is correct: the
         hierarchy trunk crosses row borders and has to stay readable over
         them. */
      --baps-tt-connector: var(--tree-table-mybky-connector-color, #8d9ba5);
    }

    :is(baps-tree-table.baps-sampark, .baps-ds-sampark baps-tree-table) {
      --baps-tt-border: var(--color-sampark-border-default, #e1e0e0);
      --baps-tt-header-bg: var(--color-sampark-mono-5, #fafafa);
      --baps-tt-header-text: var(--color-sampark-text-secondary, #595656);
      --baps-tt-row-bg: var(--color-sampark-surface-card, #ffffff);
      --baps-tt-row-hover: var(--color-sampark-mono-10, #f8f7f7);
      --baps-tt-text: var(--color-sampark-text-primary, #151414);
      --baps-tt-toggler: var(--color-sampark-text-secondary, #595656);
      --baps-tt-connector: var(--color-sampark-mono-40, #bcb9b9);
    }

    /* Both selectors are needed. PrimeNG puts .p-treetable-header-cell on the
       cells IT generates from [columns], but a forwarded header template is the
       consumer's own raw <th> and carries no class at all — measured, not
       assumed: it computed to a transparent background until the thead-scoped
       selector was added. */
    baps-tree-table .p-treetable-header-cell,
    baps-tree-table .p-treetable-thead > tr > th {
      height: var(--baps-tt-header-h);
      background: var(--baps-tt-header-bg);
      color: var(--baps-tt-header-text);
      border-color: var(--baps-tt-border);
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* NO zebra striping — every row is the card surface. Confirmed against the
       shipping screens rather than assumed: PrimeNG offers striping and it is
       deliberately unused here, so a future "add stripes for readability"
       would be a change, not a fix. */
    baps-tree-table .p-treetable-tbody > tr {
      height: var(--baps-tt-row-h);
      background: var(--baps-tt-row-bg);
      color: var(--baps-tt-text);
    }
    baps-tree-table .p-treetable-tbody > tr > td {
      /* Bottom only — vertical rules would fight the hierarchy lines. */
      border-width: 0 0 1px 0;
      border-style: solid;
      border-color: var(--baps-tt-border);
      font-size: 0.875rem;
    }
    baps-tree-table .p-treetable-tbody > tr:hover,
    baps-tree-table .p-treetable-tbody > tr:hover > td {
      background: var(--baps-tt-row-hover);
    }

    /* An expanded parent changes WEIGHT only, no fill — the fill is reserved
       for hover, and using it for expansion too would make a hovered collapsed
       row indistinguishable from an expanded one. */
    baps-tree-table .p-treetable-tbody > tr[aria-expanded='true'] > td {
      font-weight: 600;
    }

    baps-tree-table .p-treetable-tbody > tr.baps-tree-row-error,
    baps-tree-table .p-treetable-tbody > tr.baps-tree-row-error > td {
      background: var(--baps-tt-row-error);
    }

    /* The toggler is a control, not decoration — it keeps a real hit area even
       though the glyph inside it is small. */
    baps-tree-table .p-treetable-node-toggle-button {
      width: 1.75rem;
      height: 1.75rem;
      color: var(--baps-tt-toggler);
      border-radius: 50%;
    }
    baps-tree-table .p-treetable-node-toggle-button:hover {
      background: var(--baps-tt-row-hover);
    }

    /* ── Dark ── */
    .baps-dark baps-tree-table {
      --baps-tt-border: var(--color-mybky-dark-border-divider, #3d4144);
      --baps-tt-header-bg: var(--color-mybky-dark-surface-card, #2b2f32);
      --baps-tt-header-text: var(--color-mybky-dark-text-secondary, #e4ecf1);
      --baps-tt-row-bg: var(--color-mybky-dark-surface-card, #2b2f32);
      --baps-tt-row-hover: var(--color-mybky-dark-surface-hover, #3d4144);
      --baps-tt-text: var(--color-mybky-dark-text-primary, #f8fafb);
      --baps-tt-toggler: var(--color-mybky-dark-text-muted, #b6b6af);
    }
    .baps-dark :is(baps-tree-table.baps-sampark, .baps-ds-sampark baps-tree-table) {
      --baps-tt-border: var(--color-sampark-dark-border-divider, #4a4947);
      --baps-tt-header-bg: var(--color-sampark-dark-surface-card, #2c2c2a);
      --baps-tt-header-text: var(--color-sampark-dark-text-secondary, #e6e6e5);
      --baps-tt-row-bg: var(--color-sampark-dark-surface-card, #2c2c2a);
      --baps-tt-row-hover: var(--color-sampark-dark-surface-hover, #2c2c2a);
      --baps-tt-text: var(--color-sampark-dark-text-primary, #f8f7f7);
      --baps-tt-toggler: var(--color-sampark-dark-text-muted, #b7b6b3);
    }
  `,
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
