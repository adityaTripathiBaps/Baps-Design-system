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
import { Password } from 'primeng/password';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-password — a password field with an optional strength meter and a
 * show/hide toggle. Wraps PrimeNG Password (primeng.dev/password) as a form
 * control; the inner field is a pInputText, so it wears the kit input skin.
 */
@Component({
  selector: 'baps-password',
  imports: [Password, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-password
      [(ngModel)]="value"
      [feedback]="feedback"
      [toggleMask]="toggleMask"
      [promptLabel]="promptLabel!"
      [weakLabel]="weakLabel!"
      [mediumLabel]="mediumLabel!"
      [strongLabel]="strongLabel!"
      [mediumRegex]="mediumRegex"
      [strongRegex]="strongRegex"
      [maxLength]="maxLength!"
      [showClear]="showClear"
      [placeholder]="placeholder!"
      [disabled]="disabled"
      [invalid]="resolvedInvalid"
      [size]="size!"
      [variant]="variant!"
      [fluid]="fluid"
      [inputId]="inputId!"
      [name]="name!"
      [label]="label!"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [autocomplete]="autocomplete!"
      [autofocus]="autofocus"
      [tabindex]="tabindex!"
      [appendTo]="appendTo"
      [styleClass]="styleClass!"
      [inputStyleClass]="inputStyleClass!"
      [inputStyle]="inputStyle!"
      (ngModelChange)="onChange($event)"
      (onFocus)="focused.emit($event)"
      (onBlur)="onTouched(); blurred.emit($event)"
      (onClear)="cleared.emit($event)"
    >
      @if (tpl('header'); as t) {
        <ng-template pTemplate="header"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('content'); as t) {
        <ng-template pTemplate="content"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('footer'); as t) {
        <ng-template pTemplate="footer"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('clearicon'); as t) {
        <ng-template pTemplate="clearicon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
      @if (tpl('showicon'); as t) {
        <ng-template pTemplate="showicon" let-cls="class">
          <ng-container *ngTemplateOutlet="t; context: { class: cls }" />
        </ng-template>
      }
      @if (tpl('hideicon'); as t) {
        <ng-template pTemplate="hideicon" let-cls="class">
          <ng-container *ngTemplateOutlet="t; context: { class: cls }" />
        </ng-template>
      }
    </p-password>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-password {
      display: block;
    }
    /* Full width of its container, as the kit input; PrimeNG's wrapper is
       inline-flex and shrank to the input's intrinsic size. */
    baps-password .p-password {
      width: 100%;
    }
    /* Room for the eye / clear icon. PrimeNG reserves it in @layer primeng,
       which the kit's !important input padding overrides, so text ran under
       the icon. Same values as the kit's trailing-icon and clearable fields
       (_input.scss: 2.5rem one icon, 5rem two). */
    baps-password .p-password:has(.p-password-toggle-mask-icon, .p-password-clear-icon) .p-password-input.p-inputtext {
      padding-inline-end: 2.5rem !important;
    }
    baps-password .p-password:has(.p-password-toggle-mask-icon):has(.p-password-clear-icon) .p-password-input.p-inputtext {
      padding-inline-end: 5rem !important;
    }
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BapsPassword), multi: true }],
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsPassword implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly injector = inject(Injector);
  private hostControl?: NgControl | null;

  /** Strength meter in a popup while typing. */
  @Input() feedback = true;
  /** Eye icon that shows or hides the password. */
  @Input() toggleMask = false;
  @Input() promptLabel?: string;
  @Input() weakLabel?: string;
  @Input() mediumLabel?: string;
  @Input() strongLabel?: string;
  /**
   * PrimeNG's own defaults (primeng-password.mjs). An unset input bound
   * through as undefined became new RegExp(undefined), which matches
   * anything, so every password read as Strong.
   */
  @Input() mediumRegex = '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})';
  @Input() strongRegex = '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})';
  @Input() maxLength?: number;
  @Input() showClear = false;
  @Input() placeholder?: string;
  @Input() disabled = false;
  /** Left unset, a Sampark field follows its form control, as baps-select. */
  @Input() invalid?: boolean;
  @Input() size?: 'small' | 'large';
  @Input() variant?: 'outlined' | 'filled';
  @Input() fluid = false;
  @Input() inputId?: string;
  @Input() name?: string;
  @Input() label?: string;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() autocomplete?: string;
  @Input() autofocus = false;
  @Input() tabindex?: number;
  @Input() appendTo: any = 'body';
  @Input() styleClass?: string;
  @Input() inputStyleClass?: string;
  @Input() inputStyle?: Record<string, string | number>;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly focused = new EventEmitter<Event>();
  @Output() readonly blurred = new EventEmitter<Event>();
  @Output() readonly cleared = new EventEmitter<any>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  value: any;
  protected onChange: (v: unknown) => void = () => undefined;
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
