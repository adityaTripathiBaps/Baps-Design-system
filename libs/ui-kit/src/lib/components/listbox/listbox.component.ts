import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef,
  ViewEncapsulation,
  ContentChildren,
  QueryList,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { Listbox } from 'primeng/listbox';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { BapsMenuItem } from '../menu-item/menu-item.component';
import { NgTemplateOutlet } from '@angular/common';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

export interface BapsListboxOption {
  value: any;
  label?: string;
  title?: string;
  subtitle?: string;
  avatarLabel?: string;
  avatarIcon?: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'baps-listbox',
  imports: [Listbox, FormsModule, BapsMenuItem, NgTemplateOutlet, SharedModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BapsListbox),
      multi: true,
    },
  ],
  template: `
    <p-listbox
      [ariaLabel]="ariaLabel"
      [(ngModel)]="value"
      [options]="options"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="optionDisabled"
      [multiple]="multiple"
      [metaKeySelection]="metaKeySelection"
      [filter]="filter || false"
      [filterFields]="filterFields!"
      [filterPlaceHolder]="filterPlaceholder"
      [checkbox]="checkbox || false"
      [disabled]="disabled || false"
      [readonly]="readonly || false"
      [group]="group || false"
      [optionGroupLabel]="optionGroupLabel!"
      [optionGroupChildren]="optionGroupChildren!"
      [style]="style"
      [styleClass]="styleClass"
      [checkmark]="checkmark"
      [highlightOnSelect]="highlightOnSelect"
      [striped]="striped"
      [scrollHeight]="scrollHeight"
      [virtualScroll]="virtualScroll"
      [virtualScrollItemSize]="virtualScrollItemSize"
      [virtualScrollOptions]="virtualScrollOptions"
      [lazy]="lazy"
      [dragdrop]="dragdrop"
      [dropListData]="dropListData"
      [showToggleAll]="showToggleAll"
      [selectAll]="selectAll"
      [emptyMessage]="emptyMessage"
      [emptyFilterMessage]="emptyFilterMessage"
      [filterMatchMode]="filterMatchMode"
      [filterBy]="filterBy"
      [filterLocale]="filterLocale"
      [filterValue]="filterValue!"
      [dataKey]="dataKey"
      [autoOptionFocus]="autoOptionFocus"
      [selectOnFocus]="selectOnFocus"
      [focusOnHover]="focusOnHover"
      [searchLocale]="searchLocale"
      [tabindex]="tabindex"
      [listStyle]="listStyle"
      [listStyleClass]="listStyleClass"
      [invalid]="invalid"
      [fluid]="fluid"
      [ariaFilterLabel]="ariaFilterLabel"
      [searchMessage]="searchMessage"
      [emptySelectionMessage]="emptySelectionMessage"
      [selectionMessage]="selectionMessage"
      [filterMessage]="filterMessage"
      (onChange)="onModelChange($event.value); changed.emit($event)"
      (onClick)="clicked.emit($event)"
      (onDblClick)="dblClicked.emit($event)"
      (onFilter)="filtered.emit($event)"
      (onSelectAllChange)="selectAllChange.emit($event)"
      (onLazyLoad)="lazyLoad.emit($event)"
      (onDrop)="dropped.emit($event)"
      (onBlur)="onModelTouched()"
    >
      <!-- Forward custom templates if provided by user -->
      @for (t of templates; track t) {
        <ng-template [pTemplate]="t.getType()" let-option let-index="index">
          <ng-container
            *ngTemplateOutlet="
              t.template;
              context: { $implicit: option, index: index }
            "
          ></ng-container>
        </ng-template>
      }

      <!-- Default item template if no user item template is provided -->
      @if (!hasCustomItemTemplate()) {
        <ng-template pTemplate="item" let-option>
          @if (hasCustomLayout(option)) {
            <baps-menu-item
              [title]="option.title || option.label"
              [subtitle]="option.subtitle"
              [media]="
                option.avatarLabel || option.avatarIcon
                  ? 'avatar'
                  : option.icon
                    ? 'icon'
                    : 'none'
              "
              [avatarLabel]="option.avatarLabel"
              [avatarIcon]="option.avatarIcon"
              [icon]="option.icon"
              [disabled]="option.disabled"
              [brand]="brand"
              [control]="checkbox ? 'checkbox' : 'none'"
              [checked]="isSelected(option)"
              class="baps-listbox-item"
            ></baps-menu-item>
          } @else {
            <span class="baps-listbox-default-label">{{
              getOptionLabel(option)
            }}</span>
          }
        </ng-template>
      }
    </p-listbox>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/listbox/_listbox.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsListbox implements ControlValueAccessor {
  /** A value written from code has no template event behind it to schedule a render. */
  private readonly cdr = inject(ChangeDetectorRef);
  @Input() options: any[] = [];
  @Input() ariaLabel?: string;
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  @Input() optionDisabled?: string;
  @Input() multiple = false;
  @Input() metaKeySelection = false;
  @Input() filter = false;
  @Input() filterFields?: string[];
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
  @Input() group = false;
  @Input() optionGroupLabel?: string;
  @Input() optionGroupChildren?: string;
  @Input() checkbox = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();
  /** A check mark beside the selected option (single selection). */
  @Input() checkmark = false;
  /** Fill the selected option's row. Off with checkmark for a tick-only look. */
  @Input() highlightOnSelect = true;
  @Input() striped = false;
  /** Height of the scrolling list, e.g. '250px'. */
  @Input() scrollHeight = '14rem';
  @Input() virtualScroll = false;
  @Input() virtualScrollItemSize?: number;
  @Input() virtualScrollOptions?: any;
  @Input() lazy = false;
  /** Reorder options by dragging (CDK). */
  @Input() dragdrop = false;
  @Input() dropListData?: any[];
  /** Header "select all" checkbox with checkbox + multiple. */
  @Input() showToggleAll = true;
  /** Controlled select-all state, for virtual or lazy lists. */
  @Input() selectAll?: boolean;
  @Input() emptyMessage?: string;
  @Input() emptyFilterMessage?: string;
  @Input() filterMatchMode:
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'equals'
    | 'notEquals'
    | 'in'
    | 'lt'
    | 'lte'
    | 'gt'
    | 'gte' = 'contains';
  @Input() filterBy?: string;
  @Input() filterLocale?: string;
  @Input() filterValue?: string;
  @Input() dataKey?: string;
  @Input() autoOptionFocus = false;
  @Input() selectOnFocus = false;
  @Input() focusOnHover = true;
  @Input() searchLocale = false;
  @Input() tabindex = 0;
  @Input() listStyle?: Record<string, string | number>;
  @Input() listStyleClass?: string;
  @Input() invalid = false;
  @Input() fluid = false;
  @Input() ariaFilterLabel?: string;
  @Input() searchMessage?: string;
  @Input() emptySelectionMessage?: string;
  @Input() selectionMessage?: string;
  @Input() filterMessage?: string;

  /** PrimeNG's onChange event (the form already gets the value). */
  @Output() readonly changed = new EventEmitter<any>();
  @Output() readonly clicked = new EventEmitter<any>();
  @Output() readonly dblClicked = new EventEmitter<any>();
  @Output() readonly filtered = new EventEmitter<any>();
  @Output() readonly selectAllChange = new EventEmitter<any>();
  @Output() readonly lazyLoad = new EventEmitter<any>();
  @Output() readonly dropped = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

  value: any;

  onModelChange: (value: unknown) => void = () => {
    /* set by registerOnChange */
  };
  onModelTouched: () => void = () => {
    /* set by registerOnTouched */
  };

  writeValue(value: any): void {
    this.cdr.markForCheck();
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cdr.markForCheck();
    this.disabled = isDisabled;
  }

  hasCustomItemTemplate(): boolean {
    return this.templates
      ? this.templates.some((t) => t.getType() === 'item')
      : false;
  }

  hasCustomLayout(option: any): boolean {
    if (!option || typeof option !== 'object') return false;
    return !!(
      option.title ||
      option.subtitle ||
      option.avatarLabel ||
      option.avatarIcon ||
      option.icon
    );
  }

  getOptionLabel(option: any): string {
    if (!option) return '';
    if (typeof option !== 'object') return String(option);
    if (this.optionLabel) return option[this.optionLabel];
    return option.label || option.title || String(option);
  }

  isSelected(option: any): boolean {
    const val = this.getOptionValue(option);
    if (this.multiple && Array.isArray(this.value)) {
      return this.value.includes(val);
    }
    return this.value === val;
  }

  private getOptionValue(option: any): any {
    if (!option) return undefined;
    if (typeof option !== 'object') return option;
    if (this.optionValue) return option[this.optionValue];
    return option.value !== undefined ? option.value : option;
  }
}
