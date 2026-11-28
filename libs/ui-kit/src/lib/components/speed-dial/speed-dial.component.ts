import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MenuItem, PrimeTemplate, SharedModule } from 'primeng/api';
import { SpeedDial } from 'primeng/speeddial';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

/**
 * baps-speed-dial — a floating button that fans out a few related actions.
 * Wraps PrimeNG SpeedDial (primeng.dev/speeddial). Items are MenuItems
 * (`label`, `icon`, `command`, `url`, `routerLink`); the actions and the main
 * button are pButtons, so they wear the kit button skin.
 *
 * Defaults are PrimeNG's own (primeng-speeddial.mjs): an unset input bound
 * through as undefined would wipe them.
 */
@Component({
  selector: 'baps-speed-dial',
  imports: [SpeedDial, SharedModule, NgTemplateOutlet],
  template: `
    <p-speeddial
      [model]="model"
      [visible]="visible"
      [direction]="direction"
      [type]="type"
      [radius]="radius"
      [transitionDelay]="transitionDelay"
      [mask]="mask"
      [disabled]="disabled"
      [hideOnClickOutside]="hideOnClickOutside"
      [rotateAnimation]="rotateAnimation"
      [showIcon]="showIcon!"
      [hideIcon]="hideIcon!"
      [buttonClassName]="buttonClassName!"
      [buttonStyle]="buttonStyle!"
      [maskClassName]="maskClassName!"
      [maskStyle]="maskStyle!"
      [className]="className!"
      [style]="style!"
      [tooltipOptions]="tooltipOptions!"
      [buttonProps]="buttonProps!"
      [ariaLabel]="ariaLabel!"
      [ariaLabelledBy]="ariaLabelledBy!"
      [id]="id!"
      (visibleChange)="onVisible($event)"
      (onClick)="clicked.emit($event)"
      (onShow)="shown.emit($event)"
      (onHide)="hidden.emit($event)"
    >
      @if (tpl('button'); as t) {
        <ng-template pTemplate="button" let-toggleCallback="toggleCallback">
          <ng-container *ngTemplateOutlet="t; context: { toggleCallback: toggleCallback }" />
        </ng-template>
      }
      @if (tpl('item'); as t) {
        <ng-template pTemplate="item" let-item let-index="index" let-toggleCallback="toggleCallback">
          <ng-container *ngTemplateOutlet="t; context: { $implicit: item, index: index, toggleCallback: toggleCallback }" />
        </ng-template>
      }
      @if (tpl('icon'); as t) {
        <ng-template pTemplate="icon"><ng-container *ngTemplateOutlet="t" /></ng-template>
      }
    </p-speeddial>
  `,
  host: { '[class.baps-sampark]': "brand === 'sampark'" },
})
export class BapsSpeedDial {
  @Input() model: MenuItem[] | null = null;
  /** Open state. Two-way bindable: `[(visible)]`. */
  @Input() visible = false;
  @Input() direction:
    | 'up'
    | 'down'
    | 'left'
    | 'right'
    | 'up-left'
    | 'up-right'
    | 'down-left'
    | 'down-right' = 'up';
  @Input() type: 'linear' | 'circle' | 'semi-circle' | 'quarter-circle' = 'linear';
  /** Distance of the actions from the button in a circle layout, px. */
  @Input() radius = 0;
  /** Stagger between the actions, ms. */
  @Input() transitionDelay = 30;
  /** Dim the page while open. */
  @Input() mask = false;
  @Input() disabled = false;
  @Input() hideOnClickOutside = true;
  /** Turn the main icon 45deg while open (a plus becomes a close). */
  @Input() rotateAnimation = true;
  @Input() showIcon?: string;
  @Input() hideIcon?: string;
  @Input() buttonClassName?: string;
  @Input() buttonStyle?: Record<string, string | number>;
  @Input() maskClassName?: string;
  @Input() maskStyle?: Record<string, string | number>;
  @Input() className?: string;
  @Input() style?: Record<string, string | number>;
  /** Tooltip on every action, e.g. { tooltipLabel, tooltipPosition }. */
  @Input() tooltipOptions?: any;
  @Input() buttonProps?: any;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;
  @Input() id?: string;
  @Input() brand: BapsBrand = injectBapsBrand();

  @Output() readonly visibleChange = new EventEmitter<boolean>();
  /** The main button was clicked. */
  @Output() readonly clicked = new EventEmitter<MouseEvent>();
  @Output() readonly shown = new EventEmitter<Event>();
  @Output() readonly hidden = new EventEmitter<Event>();

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

  protected onVisible(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
  }
}
