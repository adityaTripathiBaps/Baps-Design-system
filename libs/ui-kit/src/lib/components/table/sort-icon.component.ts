import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * baps-sort-icon — the sort affordance for a `baps-table` header cell.
 *
 * ## Why this exists rather than PrimeNG's `p-sortIcon`
 *
 * `p-sortIcon` injects `Table`. Content projected into `baps-table` sits under
 * the CONSUMER in Angular's declaration tree, not under `p-table`, so that
 * injection walks straight past the table and throws
 * `NG0201: No provider found for _Table` — the same element-injector trap that
 * made accordion and tabs ship as directives. The header cell is markup the
 * consumer writes, so it can never satisfy it.
 *
 * The answer is to stop asking DI for the state and pass it in. `baps-table`
 * exposes `sortOrderOf()` and `sortIndexOf()` through a template reference,
 * and this component renders exactly the markup PrimeNG would have:
 *
 *     <baps-table #t sortMode="multiple" [multiSortMeta]="order">
 *       <ng-template pTemplate="header">
 *         <tr>
 *           <th (click)="t.sort('name', $event)">
 *             Name
 *             <baps-sort-icon [order]="t.sortOrderOf('name')"
 *                             [index]="t.sortIndexOf('name')" />
 *           </th>
 *
 * ## The class names are load-bearing
 *
 * `.p-datatable-sort-icon` and `.p-datatable-sort-badge` are PrimeNG's own,
 * reproduced deliberately: the Sampark table skin styles the reveal-on-hover
 * icon and the multi-sort pill through those exact selectors. Renaming them
 * here would mean a second copy of that skin.
 *
 * The pill is drawn on the WRAPPER, which for PrimeNG is its `p-sorticon`
 * element and here is this component's own host — so the skin matches
 * `:is(p-sorticon, baps-sort-icon):has(.p-datatable-sort-badge)` and one rule
 * covers both.
 *
 * The glyphs are PrimeNG's three sort icons inlined, and they paint with
 * `currentColor` so the skin's colour rules reach them.
 */
@Component({
  selector: 'baps-sort-icon',
  template: `
    @switch (order) {
      @case (1) {
      <svg
        class="p-datatable-sort-icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.99994 -0.000136375C6.91097 -0.000542799 6.82281 0.0167359 6.74064 0.0508408C6.65843 0.0849457 6.58387 0.135169 6.52133 0.198481L1.10198 5.61784C0.982318 5.74625 0.917158 5.91609 0.920256 6.09159C0.923354 6.2671 0.994471 6.43454 1.11862 6.55868C1.24276 6.68282 1.4102 6.75394 1.5857 6.75704C1.7612 6.76014 1.93104 6.69498 2.05946 6.57532L6.99994 1.63484L11.9404 6.57532C12.0688 6.69498 12.2387 6.76014 12.4142 6.75704C12.5897 6.75394 12.7571 6.68282 12.8813 6.55868C13.0054 6.43454 13.0765 6.2671 13.0796 6.09159C13.0827 5.91609 13.0176 5.74625 12.8979 5.61784L7.47855 0.198481C7.41601 0.135169 7.34145 0.0849457 7.25924 0.0508408C7.17707 0.0167359 7.08891 -0.000542799 6.99994 -0.000136375Z"
          fill="currentColor"
        />
      </svg>
      }
      @case (-1) {
      <svg
        class="p-datatable-sort-icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.99994 14C6.91097 14.0004 6.82281 13.983 6.74064 13.9489C6.65843 13.9148 6.58387 13.8646 6.52133 13.8013L1.10198 8.38193C0.982318 8.25351 0.917158 8.08367 0.920256 7.90817C0.923354 7.73267 0.994471 7.56523 1.11862 7.44109C1.24276 7.31694 1.4102 7.24582 1.5857 7.24273C1.7612 7.23963 1.93104 7.30479 2.05946 7.42445L6.99994 12.3649L11.9404 7.42445C12.0688 7.30479 12.2387 7.23963 12.4142 7.24273C12.5897 7.24582 12.7571 7.31694 12.8813 7.44109C13.0054 7.56523 13.0765 7.73267 13.0796 7.90817C13.0827 8.08367 13.0176 8.25351 12.8979 8.38193L7.47855 13.8013C7.41601 13.8646 7.34145 13.9148 7.25924 13.9489C7.17707 13.983 7.08891 14.0004 6.99994 14Z"
          fill="currentColor"
        />
      </svg>
      }
      @default {
      <svg
        class="p-datatable-sort-icon"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.99994 14C6.91097 14.0004 6.82281 13.983 6.74064 13.9489C6.65843 13.9148 6.58387 13.8646 6.52133 13.8013L1.10198 8.38193C0.982318 8.25351 0.917158 8.08367 0.920256 7.90817C0.923354 7.73267 0.994471 7.56523 1.11862 7.44109C1.24276 7.31694 1.4102 7.24582 1.5857 7.24273C1.7612 7.23963 1.93104 7.30479 2.05946 7.42445L6.99994 12.3649L11.9404 7.42445C12.0688 7.30479 12.2387 7.23963 12.4142 7.24273C12.5897 7.24582 12.7571 7.31694 12.8813 7.44109C13.0054 7.56523 13.0765 7.73267 13.0796 7.90817C13.0827 8.08367 13.0176 8.25351 12.8979 8.38193L7.47855 13.8013C7.41601 13.8646 7.34145 13.9148 7.25924 13.9489C7.17707 13.983 7.08891 14.0004 6.99994 14Z"
          fill="currentColor"
        />
        <path
          d="M6.99994 -0.000136375C6.91097 -0.000542799 6.82281 0.0167359 6.74064 0.0508408C6.65843 0.0849457 6.58387 0.135169 6.52133 0.198481L1.10198 5.61784C0.982318 5.74625 0.917158 5.91609 0.920256 6.09159C0.923354 6.2671 0.994471 6.43454 1.11862 6.55868C1.24276 6.68282 1.4102 6.75394 1.5857 6.75704C1.7612 6.76014 1.93104 6.69498 2.05946 6.57532L6.99994 1.63484L11.9404 6.57532C12.0688 6.69498 12.2387 6.76014 12.4142 6.75704C12.5897 6.75394 12.7571 6.68282 12.8813 6.55868C13.0054 6.43454 13.0765 6.2671 13.0796 6.09159C13.0827 5.91609 13.0176 5.74625 12.8979 5.61784L7.47855 0.198481C7.41601 0.135169 7.34145 0.0849457 7.25924 0.0508408C7.17707 0.0167359 7.08891 -0.000542799 6.99994 -0.000136375Z"
          fill="currentColor"
        />
      </svg>
      }
    }
    @if (index > 0) {
      <span class="p-datatable-sort-badge">{{ index }}</span>
    }
  `,
  // None, because the skin that styles this lives in a global partial and
  // would never reach a scoped view.
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-sort-icon {
      display: inline-flex;
      align-items: center;
    }
  `,
})
export class BapsSortIcon {
  /** 1 ascending, -1 descending, 0 unsorted. `baps-table.sortOrderOf()`. */
  @Input() order: 1 | -1 | 0 = 0;

  /**
   * 1-based position in a multi-column order, or 0 for no badge.
   * `baps-table.sortIndexOf()` already applies PrimeNG's rule that the badge
   * only appears once more than one column is sorted.
   */
  @Input() index = 0;
}
