import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  forwardRef,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TreeSelect } from 'primeng/treeselect';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import type { TreeNode } from 'primeng/api';

/**
 * baps-tree-select — hierarchy dropdown: a select whose options are a tree
 * rather than a flat list.
 *
 * Wraps PrimeNG TreeSelect. Same story as `baps-multi-select`: the skin landed
 * before the component did. `_select.scss` and `_select-sampark.scss` already
 * carry rules for `.p-treeselect`, its overlay, label and dropdown, plus
 * `.p-tree-node-content` and `.p-tree-node-selected` — but with no component
 * there was no way to reach them except raw `p-treeselect` in application code.
 *
 * Mirrors `baps-select` and `baps-multi-select` input-for-input wherever the
 * three overlap, so the choice between flat and hierarchical options does not
 * change the shape of the call site.
 *
 * Use this over `baps-multi-select` only when the nesting carries meaning —
 * a region containing centres, a sabha containing groups. A flat list with
 * indent styling is not a tree and should stay a multi-select.
 */
@Component({
  selector: 'baps-tree-select',
  imports: [TreeSelect, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-treeselect
      [ngModel]="value"
      (ngModelChange)="onValueChange($event)"
      [options]="options"
      [selectionMode]="selectionMode"
      [display]="display"
      [placeholder]="placeholder!"
      [disabled]="disabled"
      [filter]="filter"
      [filterBy]="filterBy"
      [filterPlaceholder]="filterPlaceholder!"
      [filterMode]="filterMode"
      [propagateSelectionDown]="propagateSelectionDown"
      [propagateSelectionUp]="propagateSelectionUp"
      [showClear]="showClear"
      [resetFilterOnHide]="resetFilterOnHide"
      [emptyMessage]="emptyMessage"
      [scrollHeight]="scrollHeight"
      [loading]="loading"
      [appendTo]="appendTo"
      [size]="size!"
      [fluid]="fluid"
      [containerStyle]="style!"
      [containerStyleClass]="styleClass!"
      [panelStyleClass]="resolvedPanelStyleClass"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [inputId]="inputId!"
      (onNodeSelect)="nodeSelect.emit($event)"
      (onNodeUnselect)="nodeUnselect.emit($event)"
      (onNodeExpand)="nodeExpand.emit($event)"
      (onNodeCollapse)="nodeCollapse.emit($event)"
      (onFilter)="onTreeSelectFilter($event)"
      (onClear)="cleared.emit()"
    >
      <!-- Template forwarding, the same shape baps-table uses.
           A bare ng-content is not enough: PrimeNG collects its slots with
           @ContentChildren(PrimeTemplate), and a template projected through
           TWO levels (consumer -> baps-tree-select -> p-treeselect) never
           registers with the inner query. Written that way, a consumer's
           pTemplate="value" silently did nothing and the trigger kept
           rendering its default label. -->
      @if (valueTemplate) {
        <ng-template pTemplate="value" let-value let-placeholder="placeholder">
          <ng-container
            *ngTemplateOutlet="valueTemplate; context: { $implicit: value, placeholder: placeholder }"
          />
        </ng-template>
      }
      <ng-content></ng-content>
    </p-treeselect>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-tree-select {
      display: block;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsTreeSelect),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsTreeSelect implements ControlValueAccessor {
  /** The hierarchy. PrimeNG's `TreeNode` shape — `label`, `children`, `data`. */
  @Input() options: TreeNode[] = [];
  /**
   * `single` picks one node. `checkbox` is the one to reach for when parents
   * and children are independently selectable — it is what makes
   * `propagateSelectionDown` / `propagateSelectionUp` meaningful. `multiple`
   * is ctrl-click multi-select with no checkboxes.
   */
  @Input() selectionMode: 'single' | 'multiple' | 'checkbox' = 'single';
  /** `chip` renders each selected node as a removable chip. */
  @Input() display: 'comma' | 'chip' = 'comma';
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() filter = false;
  @Input() filterBy = 'label';
  /** Named to match `baps-select`; TreeSelect happens to agree on the spelling. */
  @Input() filterPlaceholder?: string;
  /** `lenient` keeps a matching node's descendants visible; `strict` does not. */
  @Input() filterMode: 'lenient' | 'strict' = 'lenient';
  /** Checking a parent checks its descendants. Only meaningful in checkbox mode. */
  @Input() propagateSelectionDown = true;
  /** Checking every child checks the parent. Only meaningful in checkbox mode. */
  @Input() propagateSelectionUp = true;
  @Input() showClear = false;
  @Input() resetFilterOnHide = false;
  @Input() emptyMessage = '';
  @Input() scrollHeight = '200px';
  /** Set while children are being fetched, for lazy hierarchies. */
  @Input() loading = false;
  @Input() appendTo?: any;
  /**
   * PrimeNG size: 'small' or 'large'. Default (no value) maps to the standard
   * 32px Sampark / 36px MyBKY height.
   */
  @Input() size?: 'small' | 'large';
  @Input() fluid = false;
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() panelStyleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  /** Accessible name for the trigger when there's no visible `<label for>`. */
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() inputId?: string;

  /**
   * Templates the consumer projected. Collected here so they can be handed to
   * PrimeNG explicitly — see the forwarding note in the template.
   *
   * Only `value` is forwarded today, because that is the one a consumer has
   * needed: it is what turns this control into something other than a field,
   * such as the Projects page's globe pill. `header`, `footer` and `empty`
   * would follow the same three lines each.
   */
  @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

  get valueTemplate() {
    return this.templates?.find((t) => t.getType() === 'value')?.template;
  }

  @Output() nodeSelect = new EventEmitter<any>();
  @Output() nodeUnselect = new EventEmitter<any>();
  /** Fires before children render — the hook for lazy-loading a subtree. */
  @Output() nodeExpand = new EventEmitter<any>();
  @Output() nodeCollapse = new EventEmitter<any>();
  /** Emits the filter query on every keystroke when `filter` is enabled. */
  @Output() filterQueryChange = new EventEmitter<string>();
  @Output() cleared = new EventEmitter<void>();

  value: any;

  private onChange: any = () => { /* empty */ };
  private onTouched: any = () => { /* empty */ };

  /**
   * The overlay is appended to `<body>`, so it escapes both the
   * `baps-tree-select.baps-sampark` host class and any `.baps-ds-sampark`
   * ancestor. Without stamping the page scope onto the panel, a per-instance
   * Sampark field renders a Sampark trigger above a MyBKY-skinned overlay —
   * the bug that shipped in `baps-select` before it was caught.
   *
   * TreeSelect exposes both `panelClass` and `panelStyleClass`; it is
   * `panelStyleClass` that is merged into the overlay element's class list
   * (`cn(cx('panel'), panelStyleClass)` in primeng 21.1.3), so that is the one
   * this rides on.
   */
  get resolvedPanelStyleClass(): string {
    const consumer = this.panelStyleClass ?? '';
    if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
    return `${consumer} baps-ds-sampark`.trim();
  }

  /**
   * Wired through `ngModelChange` rather than a PrimeNG `onChange` output,
   * because TreeSelect does not have one — its outputs are `onNodeSelect` and
   * `onNodeUnselect`, which fire per node and would miss both a clear and a
   * cascade from `propagateSelectionDown`. `baps-select` and
   * `baps-multi-select` can use `onChange` because they do have it; going
   * through the model here is what keeps the CVA contract honest, since a
   * two-way `[(ngModel)]` on the inner control would update this field and
   * never tell the parent form.
   */
  onValueChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }

  onTreeSelectFilter(event: any): void {
    this.filterQueryChange.emit(event.filter);
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
