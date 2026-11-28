import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation,
  forwardRef,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { ToggleButton } from 'primeng/togglebutton';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-toggle-button — a button that stays pressed: on or off, with its own
 * label and icon for each state. Wraps PrimeNG ToggleButton
 * (primeng.dev/togglebutton) as a boolean form control.
 *
 * Labels default to PrimeNG's own ('Yes' / 'No'); an unset input bound
 * through as undefined would blank the button.
 */
@Component({
  selector: 'baps-toggle-button',
  imports: [ToggleButton, FormsModule, SharedModule, NgTemplateOutlet],
  template: `
    <p-togglebutton
      [(ngModel)]="value"
      [onLabel]="onLabel"
      [offLabel]="offLabel"
      [onIcon]="onIcon!"
      [offIcon]="offIcon!"
      [iconPos]="iconPos"
      [size]="size!"
      [fluid]="fluid"
      [allowEmpty]="allowEmpty!"
      [disabled]="disabled"
      [invalid]="invalid!"
      [inputId]="inputId!"
      [tabindex]="tabindex"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [autofocus]="autofocus"
      [styleClass]="styleClass!"
      (onChange)="onPick($event)"
    >
      @if (tpl('content'); as t) {
        <ng-template pTemplate="content" let-checked>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: checked }" />
        </ng-template>
      }
      @if (tpl('icon'); as t) {
        <ng-template pTemplate="icon" let-checked>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: checked }" />
        </ng-template>
      }
    </p-togglebutton>
  `,
  encapsulation: ViewEncapsulation.None,
  /* The Material base gave a 46px, 16px/500 toggle next to the kit's 36px
     (Sampark 32px) 14px/400 buttons. Geometry follows the kit button sizes
     (button stories: MyBKY 32/36/42, Sampark 28/32/36). Sampark also swaps
     Material's slate hover/checked fills and icon colour for its own tokens:
     hover is the secondary button's hover (mono-20), checked the next step
     (mono-borders). Set through PrimeNG's own variables. */
  styles: `
    baps-toggle-button {
      --p-togglebutton-padding: 0 1rem;
      --p-togglebutton-sm-padding: 0 1rem;
      --p-togglebutton-lg-padding: 0 1rem;
      --p-togglebutton-font-weight: 400;
      --p-togglebutton-sm-font-size: 0.875rem;
      --p-togglebutton-lg-font-size: 1rem;
      --baps-toggle-height: 2.25rem;
      --baps-toggle-height-sm: 2rem;
      --baps-toggle-height-lg: 2.625rem;
    }
    baps-toggle-button .p-togglebutton {
      height: var(--baps-toggle-height);
      font-size: 0.875rem;
    }
    baps-toggle-button .p-togglebutton.p-togglebutton-sm {
      height: var(--baps-toggle-height-sm);
    }
    baps-toggle-button .p-togglebutton.p-togglebutton-lg {
      height: var(--baps-toggle-height-lg);
    }
    :is(baps-toggle-button.baps-sampark, .baps-ds-sampark baps-toggle-button) {
      --p-togglebutton-padding: 0 0.625rem;
      --p-togglebutton-sm-padding: 0 0.625rem;
      --p-togglebutton-lg-padding: 0 0.825rem;
      --p-togglebutton-lg-font-size: 1.125rem;
      --baps-toggle-height: 2rem;
      --baps-toggle-height-sm: 1.75rem;
      --baps-toggle-height-lg: 2.25rem;
      --p-togglebutton-hover-background: var(--color-sampark-mono-20, #f3f2f2);
      --p-togglebutton-checked-background: var(--color-sampark-mono-borders, #e1e0e0);
      --p-togglebutton-icon-color: var(--color-sampark-text-primary, #151414);
      --p-togglebutton-icon-hover-color: var(--color-sampark-text-primary, #151414);
      --p-togglebutton-icon-checked-color: var(--color-sampark-text-primary, #151414);
    }
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BapsToggleButton), multi: true }],
  host: { '[class.baps-sampark]': "brand === 'sampark'", style: 'display: inline-block' },
})
export class BapsToggleButton implements ControlValueAccessor {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() onLabel = 'Yes';
  @Input() offLabel = 'No';
  @Input() onIcon?: string;
  @Input() offIcon?: string;
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() size?: 'small' | 'large';
  @Input() fluid = false;
  /** Whether a pressed button may be released back to off (PrimeNG default: yes). */
  @Input() allowEmpty?: boolean;
  @Input() disabled = false;
  @Input() invalid?: boolean;
  @Input() inputId?: string;
  @Input() tabindex = 0;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() autofocus = false;
  @Input() styleClass?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  /** PrimeNG's onChange event ({ originalEvent, checked }). */
  @Output() readonly changed = new EventEmitter<any>();

  value = false;
  private onChange: (v: unknown) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  protected onPick(event: any): void {
    this.value = event.checked;
    this.onChange(event.checked);
    this.onTouched();
    this.changed.emit(event);
  }

  writeValue(value: boolean): void {
    this.cdr.markForCheck();
    this.value = !!value;
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
