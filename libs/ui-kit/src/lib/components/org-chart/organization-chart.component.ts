import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PrimeTemplate, SharedModule, TreeNode } from 'primeng/api';
import { OrganizationChart } from 'primeng/organizationchart';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';
import { BapsOrgChart } from './org-chart.directive';

/**
 * baps-organizationchart (also `baps-organization-chart`) — a tree drawn
 * top-down with connector lines. Wraps PrimeNG OrganizationChart
 * (primeng.dev/organizationchart).
 *
 * Node templates are chosen by each node's `type`: write
 * `<ng-template pTemplate="person" let-node>` (any name, plus `default`)
 * inside the tag and the wrapper hands every one to PrimeNG under the same
 * name. Brand colours come from `_org-chart.scss` through `bapsOrgChart`.
 */
@Component({
  selector: 'baps-organizationchart, baps-organization-chart',
  imports: [OrganizationChart, BapsOrgChart, SharedModule, NgTemplateOutlet],
  template: `
    <p-organizationchart
      bapsOrgChart
      [brand]="brand"
      [value]="value"
      [selectionMode]="selectionMode"
      [selection]="selection"
      [collapsible]="collapsible"
      [preserveSpace]="preserveSpace"
      [styleClass]="styleClass!"
      (selectionChange)="onSelection($event)"
      (onNodeSelect)="nodeSelect.emit($event)"
      (onNodeUnselect)="nodeUnselect.emit($event)"
      (onNodeExpand)="nodeExpand.emit($event)"
      (onNodeCollapse)="nodeCollapse.emit($event)"
    >
      @for (t of templates?.toArray() ?? []; track t) {
        <ng-template [pTemplate]="t.getType()" let-node>
          <ng-container *ngTemplateOutlet="t.template; context: { $implicit: node }" />
        </ng-template>
      }
    </p-organizationchart>
  `,
  host: { style: 'display: block' },
})
export class BapsOrganizationChart {
  /** One root node; `children`, `expanded`, `type`, `data`, `styleClass`. */
  @Input() value: TreeNode[] = [];
  @Input() selectionMode?: 'single' | 'multiple' | null;
  /** Selected node(s). Two-way bindable: `[(selection)]`. */
  @Input() selection: any;
  /** Show a toggle under parents to fold their branch. */
  @Input() collapsible = false;
  /** Keep a folded branch's width (PrimeNG default: true). */
  @Input() preserveSpace = true;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly selectionChange = new EventEmitter<any>();
  @Output() readonly nodeSelect = new EventEmitter<any>();
  @Output() readonly nodeUnselect = new EventEmitter<any>();
  @Output() readonly nodeExpand = new EventEmitter<any>();
  @Output() readonly nodeCollapse = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  protected onSelection(value: any): void {
    this.selection = value;
    this.selectionChange.emit(value);
  }
}
