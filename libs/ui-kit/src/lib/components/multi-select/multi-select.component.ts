import {
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
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule, NgControl } from '@angular/forms';
import { PrimeTemplate, SharedModule, type ScrollerOptions } from 'primeng/api';
import { MultiSelect } from 'primeng/multiselect';
import { Chip } from 'primeng/chip';
import { BapsTooltip } from '../tooltip/tooltip.directive';

/** Option flag the wrapper adds when lockedValues / keepOneSelected disable an option. */
const LOCK_FLAG = '__bapsLocked';
/** Labels the "+N" chip tooltip lists before the rest collapse into one "+N" line. */
const MAX_OVERFLOW_LABELS = 20;

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
  imports: [MultiSelect, Chip, BapsTooltip, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-multiselect
      [(ngModel)]="value"
      [options]="resolvedOptions"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="resolvedOptionDisabled!"
      [optionGroupLabel]="optionGroupLabel"
      [optionGroupChildren]="optionGroupChildren!"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [readonly]="readonly"
      [filter]="filter || false"
      [filterBy]="filterBy!"
      [filterPlaceHolder]="filterPlaceholder"
      [showClear]="showClear || false"
      [showHeader]="showHeader !== false"
      [showToggleAll]="showToggleAll !== false"
      [selectionLimit]="selectionLimit!"
      [maxSelectedLabels]="maxSelectedLabels"
      [selectedItemsLabel]="selectedItemsLabel!"
      [display]="display || 'comma'"
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
      [loading]="loading"
      [invalid]="resolvedInvalid"
      [dataKey]="dataKey!"
      [virtualScroll]="virtualScroll"
      [virtualScrollItemSize]="virtualScrollItemSize!"
      [virtualScrollOptions]="virtualScrollOptions!"
      (onChange)="onMultiSelectChange($event)"
      (onClear)="cleared.emit()"
      (onFilter)="onMultiSelectFilter($event)"
      (onSelectAllChange)="selectAllChange.emit($event)"
      (onRemove)="itemRemove.emit($event)"
    >
      <!-- Template forwarding: see baps-select. PrimeNG never sees a
           pTemplate projected through this host, so each slot is re-declared
           with the context PrimeNG 21 passes it. -->
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
      @if (tpl('selecteditems'); as t) {
        <ng-template pTemplate="selecteditems" let-selected let-removeChip="removeChip">
          <ng-container *ngTemplateOutlet="t; context: { $implicit: selected, removeChip: removeChip }" />
        </ng-template>
      } @else if (display === 'chip' && chipOverflow) {
        <ng-template pTemplate="selecteditems">
          @for (v of visibleChips; track v) {
            <div class="p-multiselect-chip-item">
              <p-chip
                class="p-multiselect-chip"
                [label]="labelOf(v)"
                [removable]="canRemove(v)"
                (onRemove)="removeChip(v, $event)"
                [bapsTooltip]="labelOf(v)"
                [brand]="brand"
                tooltipPosition="top"
              />
            </div>
          }
          @if (hiddenChipCount) {
            <div class="p-multiselect-chip-item baps-multi-select__overflow">
              <p-chip
                class="p-multiselect-chip"
                [label]="'+' + hiddenChipCount"
                [bapsTooltip]="hiddenChipLabels"
                [brand]="brand"
                tooltipPosition="top"
                tooltipStyleClass="baps-multiselect-overflow-tooltip"
              />
            </div>
          }
        </ng-template>
      }
      @if (tpl('filter'); as t) {
        <ng-template pTemplate="filter" let-options="options">
          <ng-container *ngTemplateOutlet="t; context: { options: options }" />
        </ng-template>
      }
      @if (tpl('dropdownicon'); as t) {
        <ng-template pTemplate="dropdownicon" let-dataP="dataP">
          <ng-container *ngTemplateOutlet="t; context: { dataP: dataP }" />
        </ng-template>
      }
      @if (tpl('chipicon'); as t) {
        <ng-template pTemplate="chipicon" let-cls="class">
          <ng-container *ngTemplateOutlet="t; context: { class: cls }" />
        </ng-template>
      }
      @if (tpl('clearicon'); as t) {
        <ng-template pTemplate="clearicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
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
   * The "Select All" checkbox in the overlay header. PrimeNG owns its state
   * (checked only when every option is; never indeterminate, as on SPM dev)
   * and the announcement, which is why this is a wrapper input rather than a
   * hand-built header row.
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
  @Input() virtualScroll = false;
  /** Row height for the virtual scroller; must equal the rendered option height. */
  @Input() virtualScrollItemSize?: number;
  /**
   * PrimeNG pass-through. PrimeNG sizes the panel from `scrollHeight` but never
   * hands it to the scroller, which re-measures after a search and grows a
   * second scrollbar; pass `{ scrollHeight }` to cap both.
   */
  @Input() virtualScrollOptions?: ScrollerOptions;
  /**
   * Values that stay selected: their options are disabled (so Select All and
   * clicks keep them, as PrimeNG keeps selected disabled options) and any
   * change, including a chip removal, re-adds them. Default none.
   */
  @Input() lockedValues: unknown[] = [];
  /**
   * Never let the selection go empty: the last selected option is disabled,
   * and a change that would empty it restores the previous last value.
   * Default off.
   */
  @Input() keepOneSelected = false;
  /**
   * `display="chip"` only: past `maxSelectedLabels`, keep that many chips and
   * add a "+N" chip whose tooltip lists the rest, instead of PrimeNG's switch
   * to `selectedItemsLabel`. Each chip carries its label as a tooltip, and a
   * locked chip has no remove icon. Default off.
   */
  @Input() chipOverflow = false;

  /** Emits the filter query on every keystroke when `filter` is enabled. */
  @Output() filterQueryChange = new EventEmitter<string>();
  /** Fires when the clear icon empties the field. */
  @Output() cleared = new EventEmitter<void>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  /** A consumer's pTemplate of the given type, if any. */
  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

  private lockCache?: { key: string; options: unknown[]; result: Record<string, unknown>[] };

  /** Values the panel must not let the user deselect right now. */
  private get lockedNow(): unknown[] {
    const locked = [...(this.lockedValues ?? [])];
    if (this.keepOneSelected && Array.isArray(this.value) && this.value.length === 1) {
      locked.push(this.value[0]);
    }
    return locked;
  }

  private valueOf(option: Record<string, unknown>): unknown {
    return this.optionValue ? option?.[this.optionValue] : option;
  }

  /**
   * `options` unchanged unless something is locked; then a copy carrying
   * LOCK_FLAG, cached so PrimeNG sees a new array only when the lock set or
   * the options change.
   */
  get resolvedOptions(): unknown[] {
    const locked = this.lockedNow;
    if (!locked.length || !Array.isArray(this.options)) return this.options;
    const key = JSON.stringify(locked) + '|' + (this.optionDisabled ?? '');
    if (this.lockCache?.options === this.options && this.lockCache.key === key) {
      return this.lockCache.result;
    }
    const lockSet = new Set(locked);
    const disabledKey = this.optionDisabled ?? 'disabled';
    const result = (this.options as Record<string, unknown>[]).map((o) => ({
      ...o,
      [LOCK_FLAG]: lockSet.has(this.valueOf(o)) || !!o?.[disabledKey],
    }));
    this.lockCache = { key, options: this.options, result };
    return result;
  }

  get resolvedOptionDisabled(): string | undefined {
    return this.lockedNow.length ? LOCK_FLAG : this.optionDisabled;
  }

  private labelCache?: { options: unknown[]; labels: Map<unknown, unknown> };

  /** An option's label from its value (chipOverflow chips). */
  labelOf(v: unknown): string {
    if (v && typeof v === 'object') {
      return String((v as Record<string, unknown>)[this.optionLabel ?? 'label'] ?? '');
    }
    if (this.labelCache?.options !== this.options) {
      const labels = new Map<unknown, unknown>();
      for (const o of (this.options ?? []) as Record<string, unknown>[]) {
        const key = this.valueOf(o);
        if (!labels.has(key)) labels.set(key, this.optionLabel ? o?.[this.optionLabel] : o);
      }
      this.labelCache = { options: this.options, labels };
    }
    return String(this.labelCache.labels.get(v) ?? v);
  }

  private get selectedValues(): unknown[] {
    return Array.isArray(this.value) ? this.value : [];
  }

  get visibleChips(): unknown[] {
    const max = this.maxSelectedLabels;
    return max ? this.selectedValues.slice(0, max) : this.selectedValues;
  }

  get hiddenChipCount(): number {
    return this.selectedValues.length - this.visibleChips.length;
  }

  /** One label per line; the tooltip class keeps the line breaks. */
  get hiddenChipLabels(): string {
    const hidden = this.selectedValues.slice(this.visibleChips.length);
    const lines = hidden.slice(0, MAX_OVERFLOW_LABELS).map((v) => this.labelOf(v));
    if (hidden.length > MAX_OVERFLOW_LABELS) lines.push(`+${hidden.length - MAX_OVERFLOW_LABELS}`);
    return lines.join('\n');
  }

  canRemove(v: unknown): boolean {
    return !this.disabled && !this.readonly && !this.lockedNow.includes(v);
  }

  removeChip(v: unknown, event: Event): void {
    event.stopPropagation();
    this.onMultiSelectChange({ value: this.selectedValues.filter((x) => x !== v) });
    this.itemRemove.emit({ originalEvent: event, value: v });
  }
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
    let next = event.value;
    if (this.lockedValues?.length) {
      next = [...new Set([...(Array.isArray(next) ? next : []), ...this.lockedValues])];
    }
    if (this.keepOneSelected && Array.isArray(this.value) && this.value.length && !next?.length) {
      next = [this.value[this.value.length - 1]];
    }
    this.value = next;
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
