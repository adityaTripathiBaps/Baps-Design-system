import { Component, EventEmitter, Input, Output, forwardRef, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

/**
 * baps-select — dropdown / single-select form field.
 *
 * Wraps PrimeNG Select. The Sampark SCSS skin (_select-sampark.scss)
 * handles the visual overrides; this wrapper provides the baps-* API
 * and enables per-instance brand scoping via the host class.
 */
@Component({
  selector: 'baps-select',
  imports: [Select, FormsModule],
  template: `
    <p-select
      [(ngModel)]="value"
      [options]="options"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="optionDisabled"
      [optionGroupLabel]="optionGroupLabel"
      [optionGroupChildren]="optionGroupChildren!"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [filter]="filter"
      [filterBy]="filterBy"
      [filterPlaceholder]="filterPlaceholder"
      [showClear]="showClear"
      [editable]="editable"
      [appendTo]="appendTo"
      [group]="group"
      [size]="primeSize"
      [style]="style"
      [styleClass]="styleClass"
      [panelStyleClass]="resolvedPanelStyleClass"
      [ariaLabel]="ariaLabel"
      [ariaLabelledBy]="ariaLabelledBy"
      [inputId]="inputId"
      (onChange)="onSelectChange($event)"
      (onFilter)="onSelectFilter($event)"
    >
      <ng-content></ng-content>
    </p-select>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-select {
      display: block;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsSelect),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsSelect implements ControlValueAccessor {
  @Input() options: any[] = [];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input() optionDisabled?: string;
  @Input() optionGroupLabel?: string;
  @Input() optionGroupChildren: string | undefined;
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() filter = false;
  @Input() filterBy?: string;
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
  @Input() editable = false;
  @Input() appendTo?: any;
  @Input() group = false;
  /**
   * PrimeNG size: 'small' or 'large'. Default (no value) maps to the
   * standard 32px Sampark / 36px MyBKY height.
   */
  @Input() size?: 'small' | 'large';
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

  value: any;

  private onChange: any = () => { /* empty */ };
  private onTouched: any = () => { /* empty */ };

  get primeSize(): 'small' | 'large' | undefined {
    return this.size;
  }

  /**
   * The option panel is portaled out to `<body>` (PrimeNG's default
   * `appendTo`), so it escapes both the `baps-select.baps-sampark` host
   * class and any `.baps-ds-sampark` ancestor — a per-instance Sampark
   * select would render a Sampark trigger above a MyBKY-skinned overlay.
   * Stamping the page-scope class onto the panel itself is the only hook
   * that survives the portal; same approach `baps-table-column-config`
   * uses for its portaled drawer.
   */
  get resolvedPanelStyleClass(): string {
    const consumer = this.panelStyleClass ?? '';
    if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
    return `${consumer} baps-ds-sampark`.trim();
  }

  onSelectChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  onSelectFilter(event: any): void {
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
