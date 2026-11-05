import {
  Component,
  ContentChildren,
  EventEmitter,
  Injector,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, NgControl } from '@angular/forms';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { Select, type SelectLazyLoadEvent } from 'primeng/select';

/**
 * baps-select — dropdown / single-select form field.
 *
 * Wraps PrimeNG Select. The Sampark SCSS skin (_select-sampark.scss)
 * handles the visual overrides; this wrapper provides the baps-* API
 * and enables per-instance brand scoping via the host class.
 */
@Component({
  selector: 'baps-select',
  imports: [Select, FormsModule, SharedModule, NgTemplateOutlet],
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
      [resetFilterOnHide]="resetFilterOnHide"
      [autofocusFilter]="autofocusFilter"
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
      [loading]="loading"
      [invalid]="resolvedInvalid"
      [dataKey]="dataKey!"
      [lazy]="lazy"
      [virtualScroll]="virtualScroll"
      [virtualScrollItemSize]="virtualScrollItemSize!"
      [scrollHeight]="scrollHeight"
      (onChange)="onSelectChange($event)"
      (onFilter)="onSelectFilter($event)"
      (onClick)="onSelectClick()"
      (onClear)="onSelectClear()"
      (onLazyLoad)="lazyLoad.emit($event)"
    >
      <!-- Template forwarding, as baps-tree-select does. PrimeNG collects its
           slots with @ContentChildren(PrimeTemplate), which never sees a
           template projected through this host's ng-content, so a consumer's
           pTemplate here was silently ignored. Each slot is re-declared with
           the context PrimeNG 21 passes it. -->
      @if (tpl('item'); as t) {
        <ng-template pTemplate="item" let-option>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: option }" />
        </ng-template>
      }
      @if (tpl('group'); as t) {
        <ng-template pTemplate="group" let-group>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: group }" />
        </ng-template>
      }
      @if (tpl('selectedItem'); as t) {
        <ng-template pTemplate="selectedItem" let-selected>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: selected }" />
        </ng-template>
      }
      @if (tpl('filter'); as t) {
        <ng-template pTemplate="filter" let-options="options">
          <ng-container *ngTemplateOutlet="t; context: { options: options }" />
        </ng-template>
      }
      @if (tpl('dropdownicon'); as t) {
        <ng-template pTemplate="dropdownicon" let-cls="class">
          <ng-container *ngTemplateOutlet="t; context: { class: cls }" />
        </ng-template>
      }
      @if (tpl('clearicon'); as t) {
        <ng-template pTemplate="clearicon" let-cls="class">
          <ng-container *ngTemplateOutlet="t; context: { class: cls }" />
        </ng-template>
      }
      @if (tpl('header'); as t) {
        <ng-template pTemplate="header"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('footer'); as t) {
        <ng-template pTemplate="footer"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('empty'); as t) {
        <ng-template pTemplate="empty"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('emptyfilter'); as t) {
        <ng-template pTemplate="emptyfilter"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
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
  /** Clears the search when the panel closes. PrimeNG default (off). */
  @Input() resetFilterOnHide = false;
  /** Focuses the search when the panel opens. PrimeNG default (on). */
  @Input() autofocusFilter = true;
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
  /** Shows PrimeNG's loading icon in the trigger. Default off. */
  @Input() loading = false;
  /**
   * Error state. Left unset, a Sampark field follows its own form control
   * (invalid and dirty or touched): the host carries `ng-invalid`, but the
   * inner PrimeNG control only sees its private ngModel, so the error border
   * never showed. MyBKY keeps PrimeNG's default unless this is set.
   */
  @Input() invalid?: boolean;

  private readonly injector = inject(Injector);
  private hostControl?: NgControl | null;

  get resolvedInvalid(): boolean | undefined {
    if (this.invalid !== undefined) return this.invalid;
    if (this.brand !== 'sampark') return undefined;
    // Read lazily: injecting NgControl in the constructor is circular, it
    // needs this component as its value accessor.
    this.hostControl ??= this.injector.get(NgControl, null, { self: true, optional: true });
    const c = this.hostControl;
    return !!(c?.invalid && (c.dirty || c.touched));
  }
  /** Property that uniquely identifies an option; PrimeNG pass-through. */
  @Input() dataKey?: string;
  /**
   * A click cycles to the next option instead of opening the panel, for a
   * two-value field used as a switch. Default off.
   */
  @Input() toggleOnClick = false;
  /** PrimeNG lazy mode; pair with `virtualScroll` and listen to `lazyLoad`. */
  @Input() lazy = false;
  @Input() virtualScroll = false;
  /**
   * Row height the virtual scroller positions rows by. It must equal the
   * rendered option height: the Sampark Select row is 37px, MyBKY 48px.
   */
  @Input() virtualScrollItemSize?: number;
  /** Panel list height; PrimeNG's default (200px) when unset. */
  @Input() scrollHeight = '200px';

  /** Emits the filter query on every keystroke when `filter` is enabled. */
  @Output() filterQueryChange = new EventEmitter<string>();
  /**
   * Fires when the clear icon empties the field, with the value it held.
   * PrimeNG nulls the model before its onClear, so the wrapper keeps the last
   * non-null value itself.
   */
  @Output() cleared = new EventEmitter<unknown>();

  private lastValue: unknown = null;
  /** PrimeNG's lazy-load event (first/last visible index) in lazy mode. */
  @Output() lazyLoad = new EventEmitter<SelectLazyLoadEvent>();

  @ViewChild(Select) private select?: Select;
  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  /** A consumer's pTemplate of the given type, if any. */
  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

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
    if (event.value != null) this.lastValue = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  /** toggleOnClick: close the panel PrimeNG just opened and pick the next option. */
  onSelectClick(): void {
    if (!this.toggleOnClick || this.disabled || !this.options?.length) return;
    this.select?.hide();
    const key = this.optionValue;
    const valueOf = (o: unknown): unknown => (key ? (o as Record<string, unknown>)?.[key] : o);
    const index = this.options.findIndex((o) => valueOf(o) === this.value);
    this.value = valueOf(this.options[(index + 1) % this.options.length]);
    this.lastValue = this.value;
    this.onChange(this.value);
    this.onTouched();
  }

  onSelectFilter(event: any): void {
    this.filterQueryChange.emit(event.filter);
  }

  onSelectClear(): void {
    const previous = this.lastValue;
    this.lastValue = null;
    this.cleared.emit(previous);
  }

  writeValue(value: any): void {
    this.value = value;
    if (value != null) this.lastValue = value;
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
