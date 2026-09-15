import { Component, EventEmitter, Input, Output, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';

/**
 * baps-multi-select — multi-value dropdown form field.
 *
 * Wraps PrimeNG MultiSelect. This wrapper exists because the skin already did:
 * `_select.scss` and `_select-sampark.scss` carry 88 rules against
 * `.p-multiselect` and its sub-elements — sizes, overlay, options, groups,
 * filter row, header, chip items, clear icon and empty message — but there was
 * no component in the library, so the only way to reach any of it was to drop
 * to raw `p-multiselect` in application code. That is exactly the leak the
 * design system exists to close, so this adds the missing API surface rather
 * than any new styling.
 *
 * Deliberately mirrors `baps-select` input-for-input wherever the two overlap,
 * so switching a field from single to multi select is an element rename. The
 * one place they cannot match is PrimeNG's own inconsistency — see
 * `filterPlaceholder` below.
 */
@Component({
  selector: 'baps-multi-select',
  imports: [MultiSelect, FormsModule],
  template: `
    <p-multiselect
      [(ngModel)]="value"
      [options]="options"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="optionDisabled"
      [optionGroupLabel]="optionGroupLabel"
      [optionGroupChildren]="optionGroupChildren!"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [filter]="filter"
      [filterBy]="filterBy!"
      [filterPlaceHolder]="filterPlaceholder"
      [showClear]="showClear"
      [showHeader]="showHeader"
      [showToggleAll]="showToggleAll"
      [selectionLimit]="selectionLimit!"
      [maxSelectedLabels]="maxSelectedLabels"
      [selectedItemsLabel]="selectedItemsLabel!"
      [display]="display"
      [chipIcon]="chipIcon!"
      [emptyMessage]="emptyMessage"
      [emptyFilterMessage]="emptyFilterMessage"
      [resetFilterOnHide]="resetFilterOnHide"
      [scrollHeight]="scrollHeight"
      [appendTo]="appendTo"
      [group]="group"
      [size]="size!"
      [fluid]="fluid"
      [style]="style"
      [styleClass]="styleClass"
      [panelStyleClass]="resolvedPanelStyleClass"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [inputId]="inputId!"
      (onChange)="onMultiSelectChange($event)"
      (onFilter)="onMultiSelectFilter($event)"
      (onSelectAllChange)="selectAllChange.emit($event)"
      (onRemove)="itemRemove.emit($event)"
    >
      <ng-content></ng-content>
    </p-multiselect>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-multi-select {
      display: block;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsMultiSelect),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsMultiSelect implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input() optionDisabled?: string;
  @Input() optionGroupLabel?: string;
  @Input() optionGroupChildren: string | undefined;
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() filter = false;
  @Input() filterBy?: string;
  /**
   * Named to match `baps-select`, NOT PrimeNG. MultiSelect spells this input
   * `filterPlaceHolder` with a capital H while Select spells it
   * `filterPlaceholder`; both are v21. Normalising it here is the whole point
   * of the abstraction layer — a consumer switching a field between the two
   * should not have to know which one capitalises the H.
   */
  /**
   * Placeholder for the panel's own search field.
   *
   * Defaults to "Search" rather than being left undefined: PrimeNG renders the
   * filter input with no placeholder at all when it is unset, so a filterable
   * panel opened with an empty list showed a blank box with nothing saying what
   * it was for. Pass a more specific string ("Search cities") wherever the list
   * has a name worth using.
   */
  @Input() filterPlaceholder = 'Search';
  @Input() showClear = false;
  /** The overlay header row, which carries the filter and the toggle-all box. */
  @Input() showHeader = true;
  /**
   * The "Select All" checkbox in the overlay header. PrimeNG owns the
   * indeterminate state and the announcement, which is why this is a wrapper
   * input rather than a hand-built header row.
   */
  @Input() showToggleAll = true;
  @Input() selectionLimit?: number;
  /** Above this count the trigger collapses to `selectedItemsLabel`. */
  @Input() maxSelectedLabels = 3;
  @Input() selectedItemsLabel?: string;
  /**
   * `chip` renders each selection as a removable chip; the Sampark skin styles
   * these through `.p-multiselect-chip-item`. `comma` is PrimeNG's default and
   * stays the default here.
   */
  @Input() display: 'comma' | 'chip' = 'comma';
  @Input() chipIcon?: string;
  @Input() emptyMessage = '';
  @Input() emptyFilterMessage = '';
  @Input() resetFilterOnHide = false;
  @Input() scrollHeight = '200px';
  @Input() appendTo?: any;
  @Input() group = false;
  /**
   * PrimeNG size: 'small' or 'large'. Default (no value) maps to the standard
   * 32px Sampark / 36px MyBKY height, and drives `.p-multiselect-sm` /
   * `.p-multiselect-lg` in the skin.
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

  /** Emits the filter query on every keystroke when `filter` is enabled. */
  @Output() filterQueryChange = new EventEmitter<string>();
  /** Fires when the header's toggle-all box changes. */
  @Output() selectAllChange = new EventEmitter<any>();
  /** Fires when a single chip is dismissed in `display="chip"`. */
  @Output() itemRemove = new EventEmitter<any>();

  value: any;

  private onChange: any = () => { /* empty */ };
  private onTouched: any = () => { /* empty */ };

  /**
   * Same portal problem `baps-select` has: the option overlay is appended to
   * `<body>`, so it escapes both the `baps-multi-select.baps-sampark` host
   * class and any `.baps-ds-sampark` ancestor. Without this a per-instance
   * Sampark field renders a Sampark trigger above a MyBKY-skinned overlay.
   * Stamping the page-scope class onto the panel is the only hook that
   * survives the portal.
   */
  get resolvedPanelStyleClass(): string {
    const consumer = this.panelStyleClass ?? '';
    if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
    return `${consumer} baps-ds-sampark`.trim();
  }

  onMultiSelectChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  onMultiSelectFilter(event: any): void {
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
