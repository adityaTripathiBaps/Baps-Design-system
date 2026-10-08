import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { BapsAvatar } from '../avatar/avatar.component';

@Component({
  selector: 'baps-menu-item',
  imports: [BapsAvatar],
  template: `
    <div
      class="menu-item"
      [class.menu-item--selected]="selected"
      [class.menu-item--danger]="severity === 'danger'"
      [class.menu-item--disabled]="disabled"
      [class.menu-item--two-line]="!!subtitle"
      [attr.role]="role"
      [attr.aria-checked]="ariaChecked"
      [attr.aria-disabled]="disabled ? true : null"
      [attr.tabindex]="disabled ? null : 0"
      (click)="activate()"
      (keydown.enter)="activate()"
      (keydown.space)="$event.preventDefault(); activate()"
    >
      <span class="menu-item__bar" aria-hidden="true"></span>
      @if (control === 'checkbox') {
        <span
          class="menu-item__control menu-item__control--check"
          [class.is-checked]="checked"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      } @else if (control === 'radio') {
        <span
          class="menu-item__control menu-item__control--radio"
          [class.is-checked]="checked"
          aria-hidden="true"
        ></span>
      }
      @if (media === 'icon') {
        @if (icon) {
          <i class="menu-item__icon pi {{ icon }}" aria-hidden="true"></i>
        } @else {
          <svg
            class="menu-item__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        }
      } @else if (media === 'avatar') {
        <baps-avatar
          class="menu-item__avatar"
          [brand]="brand"
          size="s"
          [variant]="avatarIcon ? 'secondary' : 'primary'"
          [label]="avatarIcon ? undefined : avatarLabel"
        >
          @switch (avatarIcon) {
            @case ('pi-envelope') {
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
            @case ('pi-user') {
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            }
          }
        </baps-avatar>
      }
      <span class="menu-item__text">
        <span class="menu-item__title"
          >{{ title }}<ng-content></ng-content
        ></span>
        @if (subtitle) {
          <span class="menu-item__subtitle">{{ subtitle }}</span>
        }
      </span>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/menu-item/_menu-item.scss'],
  host: {
    '[class.baps-mybky]': "brand === 'mybky'",
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsMenuItem {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() control: 'none' | 'checkbox' | 'radio' = 'none';
  @Input() checked = false;
  @Input() media: 'none' | 'icon' | 'avatar' = 'none';
  @Input() icon?: string;
  @Input() avatarLabel?: string;
  @Input() avatarIcon?: string;
  @Input() severity: 'default' | 'danger' = 'default';
  @Input() selected = false;
  @Input() disabled = false;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Output() activated = new EventEmitter<void>();

  get role(): string {
    if (this.control === 'checkbox') return 'menuitemcheckbox';
    if (this.control === 'radio') return 'menuitemradio';
    return 'menuitem';
  }

  get ariaChecked(): boolean | null {
    return this.control === 'checkbox' || this.control === 'radio'
      ? this.checked
      : null;
  }

  activate(): void {
    if (!this.disabled) this.activated.emit();
  }
}
