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
import { CascadeSelect } from 'primeng/cascadeselect';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-cascade-select — pick one value from a nested tree of options, level by
 * level (country → state → city).
 *
 * Wraps PrimeNG CascadeSelect (primeng.dev/cascadeselect) on the baps-select
 * pattern: a form control, brand scope stamped on the body-level panel, a
 * Sampark error state that follows the host form control, and template
 * forwarding. The field shares the select partials' skin.
 */
@Component({
  selector: 'baps-cascade-select',
  imports: [CascadeSelect, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-cascadeselect
      [(ngModel)]="value"
      [options]="options"
      [optionLabel]="optionLabel!"
      [optionValue]="optionValue!"
      [optionGroupLabel]="optionGroupLabel!"
      [optionGroupChildren]="optionGroupChildren!"
      [optionDisabled]="optionDisabled!"
      [placeholder]="placeholder!"
      [disabled]="disabled"
      [showClear]="showClear"
      [loading]="loading"
      [loadingIcon]="loadingIcon!"
      [size]="size"
      [variant]="variant"
      [fluid]="fluid"
      [invalid]="resolvedInvalid"
      [dataKey]="dataKey!"
      [inputId]="inputId!"
      [tabindex]="tabindex"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [panelStyle]="panelStyle"
      [panelStyleClass]="resolvedPanelStyleClass"
      [appendTo]="appendTo"
      [breakpoint]="breakpoint"
      [autofocus]="autofocus"
      [autoOptionFocus]="autoOptionFocus"
      [selectOnFocus]="selectOnFocus"
      [focusOnHover]="focusOnHover"
      [searchLocale]="searchLocale!"
      [searchMessage]="searchMessage!"
      [emptyMessage]="emptyMessage!"
      [selectionMessage]="selectionMessage!"
      [emptySearchMessage]="emptySearchMessage!"
      [emptySelectionMessage]="emptySelectionMessage!"
      (onChange)="onPick($event)"
      (onGroupChange)="groupChange.emit($event)"
      (onShow)="shown.emit($event)"
      (onHide)="hidden.emit($event)"
      (onClear)="onClear()"
      (onBlur)="onTouched()"
    >
      @if (tpl('option'); as t) {
        <ng-template pTemplate="option" let-option>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: option }" />
        </ng-template>
      }
      @if (tpl('value'); as t) {
        <ng-template pTemplate="value" let-value let-placeholder="placeholder">
          <ng-container *ngTemplateOutlet="t; context: { $implicit: value, placeholder: placeholder }" />
        </ng-template>
      }
      @if (tpl('header'); as t) {
        <ng-template pTemplate="header"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('footer'); as t) {
        <ng-template pTemplate="footer"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('triggericon'); as t) {
        <ng-template pTemplate="triggericon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('loadingicon'); as t) {
        <ng-template pTemplate="loadingicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('groupicon'); as t) {
        <ng-template pTemplate="groupicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('clearicon'); as t) {
        <ng-template pTemplate="clearicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
    </p-cascadeselect>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-cascade-select {
      display: block;
    }
    /* Full width of its container, as baps-select; PrimeNG's field is
       inline-flex and shrank to its placeholder. */
    baps-cascade-select .p-cascadeselect {
      width: 100%;
    }
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BapsCascadeSelect), multi: true },
  ],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsCascadeSelect implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private hostControl?: NgControl | null;

  @Input() options: any[] = [];
  @Input() optionLabel?: string;
  @Input() optionValue?: string;
  /** Label of a group row (country, state). */
  @Input() optionGroupLabel?: string;
  /** Children per level, e.g. ['states', 'cities']. */
  @Input() optionGroupChildren?: string[];
  @Input() optionDisabled?: string;
  @Input() placeholder?: string;
  @Input() disabled = false;
  @Input() showClear = false;
  @Input() loading = false;
  @Input() loadingIcon?: string;
  @Input() size?: 'small' | 'large';
  @Input() variant: 'outlined' | 'filled' = 'outlined';
  @Input() fluid = false;
  /** Left unset, a Sampark field follows its form control, as baps-select. */
  @Input() invalid?: boolean;
  @Input() dataKey?: string;
  @Input() inputId?: string;
  @Input() tabindex = 0;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() panelStyle?: Record<string, string | number>;
  @Input() panelStyleClass?: string;
  @Input() appendTo: any = 'body';
  /** Below this width the panel stacks its levels instead of cascading sideways. */
  @Input() breakpoint = '960px';
  @Input() autofocus = false;
  @Input() autoOptionFocus = false;
  @Input() selectOnFocus = false;
  @Input() focusOnHover = true;
  @Input() searchLocale?: string;
  @Input() searchMessage?: string;
  @Input() emptyMessage?: string;
  @Input() selectionMessage?: string;
  @Input() emptySearchMessage?: string;
  @Input() emptySelectionMessage?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  /** PrimeNG's onChange event; the form already gets the value. */
  @Output() readonly changed = new EventEmitter<any>();
  @Output() readonly groupChange = new EventEmitter<any>();
  @Output() readonly shown = new EventEmitter<any>();
  @Output() readonly hidden = new EventEmitter<any>();
  @Output() readonly cleared = new EventEmitter<void>();

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

  get resolvedPanelStyleClass(): string {
    const consumer = this.panelStyleClass ?? '';
    if (this.brand !== 'sampark' || consumer.includes('baps-ds-sampark')) return consumer;
    return `${consumer} baps-ds-sampark`.trim();
  }

  protected onPick(event: any): void {
    this.value = event.value;
    this.onChange(event.value);
    this.onTouched();
    this.changed.emit(event);
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
