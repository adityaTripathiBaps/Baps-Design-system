import {
  Component,
  Input,
  forwardRef,
  ViewEncapsulation,
  ContentChildren,
  QueryList,
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
      [(ngModel)]="value"
      [options]="options"
      [optionLabel]="optionLabel"
      [optionValue]="optionValue"
      [optionDisabled]="optionDisabled"
      [multiple]="multiple"
      [metaKeySelection]="metaKeySelection"
      [filter]="filter"
      [filterFields]="filterFields"
      [filterPlaceHolder]="filterPlaceholder"
      [checkbox]="checkbox"
      [disabled]="disabled"
      [readonly]="readonly"
      [group]="group"
      [optionGroupLabel]="optionGroupLabel"
      [optionGroupChildren]="optionGroupChildren"
      [style]="style"
      [styleClass]="styleClass"
      (onChange)="onModelChange($event.value)"
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
  styles: `
    baps-listbox {
      display: block;
    }

    /* Projected menu-item rows fill the option cell and drop their own
       border — the surrounding .p-listbox already draws one, so a second
       would double up. Was an inline style attribute; moved here per the
       no-inline-styling rule, since this is static design-system styling
       rather than a runtime value. */
    baps-listbox .baps-listbox-item {
      width: 100%;
      border: none;
    }

    baps-listbox .p-listbox {
      border: 1px solid
        var(--listbox-border, var(--color-sampark-border-default, #e1e0e0));
      border-radius: var(--listbox-radius, 10px);
      background: var(--listbox-bg, var(--color-sampark-mono-0, #ffffff));
      overflow: hidden;
      box-shadow: none;
    }

    baps-listbox .p-listbox-header {
      padding: 8px 12px;
      border-bottom: 1px solid
        var(--listbox-border, var(--color-sampark-border-default, #e1e0e0));
      background: var(--listbox-bg, var(--color-sampark-mono-0, #ffffff));
    }

    baps-listbox .p-listbox-filter {
      width: 100%;
    }

    baps-listbox .p-listbox-list-container {
      max-height: var(--listbox-max-height, 320px);
      overflow-y: auto;
    }

    baps-listbox .p-listbox-list {
      padding: 4px 0;
      margin: 0;
      list-style: none;
    }

    baps-listbox .p-listbox-option {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 40px;
      padding: 10px 16px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.3;
      color: var(--listbox-text, var(--color-sampark-text-primary, #151414));
      cursor: pointer;
      user-select: none;
      transition: background 120ms ease;
      border-radius: 0;
    }

    baps-listbox .p-listbox-option::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0.25rem;
      background: var(
        --listbox-bar-color,
        var(--color-sampark-primary-default, #c96868)
      );
      opacity: 0;
      transition: opacity 120ms ease;
    }

    /* Hover and selected share one treatment — grey fill + accent bar — matching
       the Sampark app's .af-pp-item:hover / :hover::before. */
    baps-listbox .p-listbox-option:hover:not(.p-disabled),
    baps-listbox .p-listbox-option.p-focus:not(.p-disabled),
    baps-listbox .p-listbox-option-selected {
      background: var(
        --listbox-bg-selected,
        var(--color-sampark-secondary-0, #f8f7f7)
      );
      color: var(
        --listbox-text-selected,
        var(--color-sampark-text-primary, #151414)
      );
    }

    baps-listbox .p-listbox-option:hover:not(.p-disabled)::before,
    baps-listbox .p-listbox-option-selected::before {
      opacity: 1;
    }

    /* The option row owns hover/selected chrome and the padding; the nested
       menu-item is layout only (no [selected] is passed to it). */
    baps-listbox .p-listbox-option .menu-item,
    baps-listbox .p-listbox-option .menu-item:hover:not(.menu-item--disabled) {
      background: transparent;
      padding: 0;
      /* The option row draws the accent bar itself (the ::before above), and
         menu-item now lights its own bar on hover too. Zero the nested one so a
         hovered row does not stack two bars at the same x. Done through the
         variable rather than an opacity override so there is no specificity
         fight with menu-item's own hover rule. */
      --menu-item-bar-width: 0;
    }

    /* The option row already fades at 0.5 — don't fade the media a second time. */
    baps-listbox .p-listbox-option .menu-item--disabled .menu-item__avatar,
    baps-listbox .p-listbox-option .menu-item--disabled .menu-item__control {
      opacity: 1;
    }

    baps-listbox .p-listbox-option.p-disabled {
      color: var(
        --listbox-text-disabled,
        var(--color-sampark-text-disabled, #bcb9b9)
      );
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }

    baps-listbox .p-listbox-option-group {
      padding: 8px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
      color: var(
        --listbox-text-muted,
        var(--color-sampark-text-muted, #9f9c9c)
      );
      background: var(--listbox-bg-group, transparent);
      border-top: 1px solid
        var(--listbox-border, var(--color-sampark-border-default, #e1e0e0));
      margin-top: 4px;
    }

    baps-listbox .p-listbox-option-group:first-of-type {
      border-top: none;
      margin-top: 0;
    }

    baps-listbox .p-checkbox {
      margin-right: 4px;
    }

    /* Sampark Brand theme scoped */
    baps-listbox.baps-sampark,
    .baps-ds-sampark baps-listbox {
      --listbox-radius: 4px;
      --listbox-bg: var(--color-sampark-mono-0, #ffffff);
      --listbox-border: var(--color-sampark-border-default, #e1e0e0);
      --listbox-text: var(--color-sampark-text-primary, #151414);
      --listbox-text-disabled: var(--color-sampark-text-disabled, #bcb9b9);
      --listbox-bg-selected: var(--color-sampark-secondary-0, #f8f7f7);
      --listbox-text-selected: var(--color-sampark-text-primary, #151414);
      --listbox-text-muted: var(--color-sampark-text-muted, #9f9c9c);
      --listbox-bar-color: var(--color-sampark-primary-default, #c96868);
    }

    /* MyBKY Brand theme scoped */
    baps-listbox:not(.baps-sampark):not(.baps-ds-sampark baps-listbox) {
      --listbox-radius: 10px;
      --listbox-bg: var(--color-mybky-mono-0, #ffffff);
      --listbox-border: var(--color-mybky-mono-200, #e4ecf1);
      --listbox-text: var(--color-mybky-mono-900, #0e1114);
      --listbox-text-disabled: var(--color-mybky-mono-400, #b6b6af);
      /* Neutral fill, not a blue tint — the accent bar carries the selection. */
      --listbox-bg-selected: var(--color-mybky-mono-50, #f8fafb);
      --listbox-text-selected: var(--color-mybky-mono-900, #0e1114);
      --listbox-text-muted: var(--color-mybky-mono-500, #6f777d);
      --listbox-bar-color: var(--color-mybky-blue-600, #1f4a5c);
    }

    /* ── Dark ──
       LAST on purpose. This block used to sit above the two brand blocks, and
       the MyBKY one outranks it: baps-listbox:not(.baps-sampark):not(...) is
       (0,2,2) against a plain .baps-dark baps-listbox at (0,1,1), because
       :not() carries its argument's specificity — and specificity beats source
       order, so moving the block was not enough. The dark rule repeats the same
       :not() chain to sit one class above it. The rules were correct all along
       and simply never applied: a dark docs page rendered a white listbox with
       #e4ecf1 text on it, 1.2:1.

       The Sampark half was missing entirely; it is added here rather than in
       the Sampark block above so both brands' dark values sit together. */
    .baps-dark baps-listbox:not(.baps-sampark):not(.baps-ds-sampark baps-listbox) {
      --listbox-bg: var(--color-mybky-dark-surface-ground, #181b1d);
      --listbox-border: var(--color-mybky-dark-border-divider, #3d4144);
      --listbox-text: var(--color-mybky-dark-text-primary, #f8fafb);
      --listbox-text-disabled: var(--color-mybky-dark-text-disabled, #8d9ba5);
      --listbox-bg-selected: var(--color-mybky-dark-surface-card, #2b2f32);
      --listbox-text-selected: var(--color-mybky-dark-text-primary, #f8fafb);
      --listbox-text-muted: var(--color-mybky-dark-text-muted, #b6b6af);
      --listbox-bar-color: var(--color-mybky-dark-primary-default, #9fadd9);
    }

    .baps-dark :is(baps-listbox.baps-sampark, .baps-ds-sampark baps-listbox) {
      --listbox-bg: var(--color-sampark-dark-surface-ground, #1d1c1b);
      --listbox-border: var(--color-sampark-dark-border-divider, #4a4947);
      --listbox-text: var(--color-sampark-dark-text-primary, #f8f7f7);
      --listbox-text-disabled: var(--color-sampark-dark-text-disabled, #94928f);
      --listbox-bg-selected: var(--color-sampark-dark-surface-card, #2c2c2a);
      --listbox-text-selected: var(--color-sampark-dark-text-primary, #f8f7f7);
      --listbox-text-muted: var(--color-sampark-dark-text-muted, #b7b6b3);
      --listbox-bar-color: var(--color-sampark-dark-primary-default, #d48787);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsListbox implements ControlValueAccessor {
  @Input() options: any[] = [];
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
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  @ContentChildren(PrimeTemplate) templates!: QueryList<PrimeTemplate>;

  value: any;

  onModelChange: (value: unknown) => void = () => { /* set by registerOnChange */ };
  onModelTouched: () => void = () => { /* set by registerOnTouched */ };

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
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
