import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Injector,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation,
  forwardRef,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import {
  AutoComplete,
  type AutoCompleteCompleteEvent,
  type AutoCompleteDropdownClickEvent,
  type AutoCompleteLazyLoadEvent,
  type AutoCompleteSelectEvent,
  type AutoCompleteUnselectEvent,
} from 'primeng/autocomplete';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-autocomplete — a text field that suggests matches as the user types.
 *
 * Wraps PrimeNG AutoComplete (primeng.dev/autocomplete). The field and its
 * panel are already skinned for both brands by the shared select partials
 * (_select.scss / _select-sampark.scss target .p-autocomplete and
 * .p-autocomplete-overlay), so this wrapper adds the baps-* API: a form
 * control, brand scoping that survives the body-level panel, a Sampark error
 * state that follows the host form control, and template forwarding.
 *
 * The consumer filters: listen to `completeMethod` and set `suggestions`.
 * For several values as chips use `baps-chips-input`; PrimeNG 21 deprecates
 * AutoComplete's own `multiple`.
 */
@Component({
  selector: 'baps-autocomplete',
  imports: [AutoComplete, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-autocomplete
      [(ngModel)]="value"
      [suggestions]="suggestions"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="optionDisabled"
      [group]="group"
      [optionGroupLabel]="optionGroupLabel!"
      [optionGroupChildren]="optionGroupChildren!"
      [dropdown]="dropdown"
      [dropdownMode]="dropdownMode"
      [forceSelection]="forceSelection"
      [minQueryLength]="minQueryLength"
      [delay]="delay"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [showClear]="showClear"
      [fluid]="fluid"
      [variant]="variant"
      [size]="size"
      [invalid]="resolvedInvalid"
      [inputId]="inputId"
      [inputStyle]="inputStyle"
      [inputStyleClass]="inputStyleClass"
      [panelStyle]="panelStyle"
      [panelStyleClass]="resolvedPanelStyleClass"
      [scrollHeight]="scrollHeight"
      [lazy]="lazy"
      [virtualScroll]="virtualScroll"
      [virtualScrollItemSize]="virtualScrollItemSize!"
      [virtualScrollOptions]="virtualScrollOptions"
      [autoHighlight]="autoHighlight"
      [unique]="unique"
      [completeOnFocus]="completeOnFocus"
      [showEmptyMessage]="showEmptyMessage"
      [emptyMessage]="emptyMessage"
      [autofocus]="autofocus"
      [autocomplete]="autocomplete"
      [typeahead]="typeahead"
      [dataKey]="dataKey"
      [autoOptionFocus]="autoOptionFocus"
      [selectOnFocus]="selectOnFocus"
      [focusOnHover]="focusOnHover"
      [searchLocale]="searchLocale"
      [appendTo]="appendTo"
      [ariaLabel]="ariaLabel"
      [ariaLabelledBy]="ariaLabelledBy"
      [dropdownAriaLabel]="dropdownAriaLabel"
      [dropdownIcon]="dropdownIcon"
      [tabindex]="tabindex"
      [searchMessage]="searchMessage"
      [emptySelectionMessage]="emptySelectionMessage"
      [selectionMessage]="selectionMessage"
      [maxlength]="maxlength ?? null"
      (completeMethod)="completeMethod.emit($event)"
      (onSelect)="onPick($event)"
      (onUnselect)="unselected.emit($event)"
      (onDropdownClick)="dropdownClick.emit($event)"
      (onClear)="onClear()"
      (onShow)="shown.emit()"
      (onHide)="hidden.emit()"
      (onLazyLoad)="lazyLoad.emit($event)"
      (onKeyUp)="keyUp.emit($event)"
      (onBlur)="onTouched()"
      (ngModelChange)="onModelChange($event)"
    >
      <!-- PrimeNG collects slots with @ContentChildren(PrimeTemplate), which
           never sees a template projected through this host, so each slot is
           re-declared with the context PrimeNG 21 passes it (as baps-select). -->
      @if (tpl('item'); as t) {
        <ng-template pTemplate="item" let-option let-i="index">
          <ng-container *ngTemplateOutlet="t; context: { $implicit: option, index: i }" />
        </ng-template>
      }
      @if (tpl('group'); as t) {
        <ng-template pTemplate="group" let-group>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: group }" />
        </ng-template>
      }
      @if (tpl('selecteditem'); as t) {
        <ng-template pTemplate="selecteditem" let-selected>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: selected }" />
        </ng-template>
      }
      @if (tpl('loader'); as t) {
        <ng-template pTemplate="loader" let-options="options">
          <ng-container *ngTemplateOutlet="t; context: { options: options }" />
        </ng-template>
      }
      @if (tpl('removeicon'); as t) {
        <ng-template pTemplate="removeicon" let-cls="class" let-remove="removeCallback" let-index="index">
          <ng-container *ngTemplateOutlet="t; context: { class: cls, removeCallback: remove, index: index }" />
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
      @if (tpl('loadingicon'); as t) {
        <ng-template pTemplate="loadingicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('clearicon'); as t) {
        <ng-template pTemplate="clearicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('dropdownicon'); as t) {
        <ng-template pTemplate="dropdownicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
    </p-autocomplete>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-autocomplete {
      display: block;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsAutocomplete),
      multi: true,
    },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsAutocomplete implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private hostControl?: NgControl | null;

  /** The matches to show; set it from `completeMethod`. */
  @Input() suggestions: any[] = [];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input() optionDisabled?: string;
  @Input() group = false;
  @Input() optionGroupLabel?: string;
  @Input() optionGroupChildren?: string;
  /** A button that opens the panel with every suggestion. */
  @Input() dropdown = false;
  /** 'blank' asks completeMethod with an empty query; 'current' with the typed text. */
  @Input() dropdownMode: 'blank' | 'current' = 'blank';
  /** Clear the field on blur unless a suggestion was picked. */
  @Input() forceSelection = false;
  @Input() minQueryLength?: number;
  /** Milliseconds after the last keystroke before completeMethod fires. */
  @Input() delay = 300;
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() showClear = false;
  @Input() fluid = false;
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  @Input() size?: 'small' | 'large';
  /**
   * Error state. Left unset, a Sampark field follows its own form control
   * (invalid and dirty or touched), as baps-select does.
   */
  @Input() invalid?: boolean;
  @Input() inputId?: string;
  @Input() inputStyle?: Record<string, string | number>;
  @Input() inputStyleClass?: string;
  @Input() panelStyle?: Record<string, string | number>;
  @Input() panelStyleClass?: string;
  @Input() scrollHeight = '200px';
  @Input() lazy = false;
  @Input() virtualScroll = false;
  @Input() virtualScrollItemSize?: number;
  @Input() virtualScrollOptions?: any;
  /** Highlight the first suggestion as the panel opens. */
  @Input() autoHighlight = false;
  /** Do not offer a value that is already selected. */
  @Input() unique = true;
  /** Ask for suggestions as soon as the field gains focus. */
  @Input() completeOnFocus = false;
  @Input() showEmptyMessage = true;
  @Input() emptyMessage?: string;
  @Input() autofocus = false;
  @Input() autocomplete = 'off';
  /** Off: the panel only opens from the dropdown button. */
  @Input() typeahead = true;
  @Input() dataKey?: string;
  @Input() autoOptionFocus = false;
  @Input() selectOnFocus = false;
  @Input() focusOnHover = true;
  @Input() searchLocale?: string | string[];
  /** Where the panel is attached. 'body' escapes clipping ancestors. */
  @Input() appendTo: any = 'body';
  /** Accessible name when there is no visible `<label for>`. */
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() dropdownAriaLabel?: string;
  @Input() dropdownIcon?: string;
  @Input() tabindex?: number;
  @Input() searchMessage?: string;
  @Input() emptySelectionMessage?: string;
  @Input() selectionMessage?: string;
  @Input() maxlength?: number;
  @Input() brand: BapsBrand = injectBapsBrand();

  /** The typed query; answer it by setting `suggestions`. */
  @Output() readonly completeMethod = new EventEmitter<AutoCompleteCompleteEvent>();
  @Output() readonly selected = new EventEmitter<AutoCompleteSelectEvent>();
  @Output() readonly unselected = new EventEmitter<AutoCompleteUnselectEvent>();
  @Output() readonly dropdownClick = new EventEmitter<AutoCompleteDropdownClickEvent>();
  @Output() readonly cleared = new EventEmitter<void>();
  @Output() readonly shown = new EventEmitter<void>();
  @Output() readonly hidden = new EventEmitter<void>();
  @Output() readonly lazyLoad = new EventEmitter<AutoCompleteLazyLoadEvent>();
  @Output() readonly keyUp = new EventEmitter<KeyboardEvent>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  value: any;
  private onChange: (v: unknown) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

  get resolvedInvalid(): boolean | undefined {
    if (this.invalid !== undefined) return this.invalid;
    if (this.brand !== 'sampark') return undefined;
    this.hostControl ??= this.injector.get(NgControl, null, { self: true, optional: true });
    const c = this.hostControl;
    return !!(c?.invalid && (c.dirty || c.touched));
  }

  /**
   * The panel is appended to <body>, out of reach of the host's brand class
   * and of a page-wide .baps-ds-sampark ancestor, so the scope rides on the
   * panel itself (as baps-select).
   */
  get resolvedPanelStyleClass(): string {
    const consumer = this.panelStyleClass ?? '';
    if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
    return `${consumer} baps-ds-sampark`.trim();
  }

  protected onModelChange(next: unknown): void {
    this.value = next;
    this.onChange(next);
  }

  protected onPick(event: AutoCompleteSelectEvent): void {
    this.selected.emit(event);
    this.onTouched();
  }

  protected onClear(): void {
    this.value = null;
    this.onChange(null);
    this.cleared.emit();
  }

  writeValue(value: unknown): void {
    this.cdr.markForCheck();
    this.value = value;
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cdr.markForCheck();
    this.disabled = isDisabled;
  }
}
