import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { BapsAvatar } from '../avatar/avatar.component';

/**
 * baps-menu-item — the Sampark Portal "Base Menu Item"
 * (Figma nodes 13197-87952 / 13197-88988).
 *
 * A selectable row used across menus, dropdown/select overlays, context menus
 * and list options (see baps-users-dropdown). Presentational primitive — no
 * PrimeNG menu model, since a menu item appears across Menu/Select/MultiSelect/
 * Listbox/ContextMenu.
 *
 * Anatomy (left → right):
 *   [ control? ] [ media? ] [ title (+ subtitle?) ]
 *     control : optional checkbox / radio (multi- / single-select lists)
 *     media   : optional glyph icon, or an avatar box (initials / icon)
 *     text    : one line (title) or two (title + subtitle, e.g. name + role)
 *
 * A left accent bar marks the selected row and previews on hover; `severity="danger"` turns it red.
 * Colours map to the Sampark palette (libs/tokens); every value flows through
 * the --menu-item-* CSS variables so they can be re-pointed centrally. Sizes
 * are estimated from the Figma screenshots — reconcile against Dev Mode.
 */
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
        <!-- baps-avatar's icon slot takes projected SVG, not a PrimeIcons
             class string (see BapsAvatar's icon-slot doc) — avatarIcon stays
             a plain string on THIS component's own public API (unchanged,
             every BapsUserOption/BapsListboxOption caller keeps passing
             'pi-envelope' etc.), translated to the matching Lucide glyph
             here. Only the two values ever used in this codebase today are
             covered; an unrecognised avatarIcon renders no glyph rather than
             silently falling back to the wrong one. -->
        <baps-avatar
          class="menu-item__avatar"
          [brand]="brand"
          size="s"
          [variant]="avatarIcon ? 'secondary' : 'primary'"
          [label]="avatarIcon ? undefined : avatarLabel"
        >
          @switch (avatarIcon) {
            @case ('pi-envelope') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
            @case ('pi-user') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
  styles: `
    baps-menu-item {
      /* ── Geometry (verify against Figma Dev Mode) ── */
      --menu-item-min-height: 40px;
      --menu-item-padding-x: 16px;
      --menu-item-padding-y: 10px;
      --menu-item-gap: 12px;
      --menu-item-icon-size: 20px;
      --menu-item-control-size: 18px;
      --menu-item-bar-width: 3px;
      --menu-item-font-size: 14px;
      --menu-item-subtitle-size: 12px;

      /* ── Colours — Sampark palette (libs/tokens) ── */
      --menu-item-bg: transparent;
      --menu-item-bg-selected: var(--color-sampark-secondary-0, #f8f7f7);
      --menu-item-text: var(--color-sampark-text-primary, #151414);
      --menu-item-subtitle: var(--color-sampark-text-muted, #9f9c9c);
      --menu-item-text-danger: var(--color-sampark-error-80, #ea151a);
      --menu-item-text-disabled: var(--color-sampark-text-disabled, #bcb9b9);
      --menu-item-bar: var(--color-sampark-primary-default, #c96868);
      --menu-item-bar-danger: var(--color-sampark-error-80, #ea151a);
      --menu-item-control-border: var(--color-sampark-mono-40, #bcb9b9);
      --menu-item-control-checked: var(
        --color-sampark-primary-default,
        #c96868
      );

      display: block;
    }

    baps-menu-item .menu-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--menu-item-gap);
      min-height: var(--menu-item-min-height);
      padding: var(--menu-item-padding-y) var(--menu-item-padding-x);
      font-family: inherit;
      font-size: var(--menu-item-font-size);
      font-weight: 400;
      line-height: 1.3;
      color: var(--menu-item-text);
      background: var(--menu-item-bg);
      cursor: pointer;
      user-select: none;
      transition: background 120ms ease;
    }

    baps-menu-item .menu-item:hover:not(.menu-item--disabled) {
      background: var(--menu-item-bg-selected);
    }
    baps-menu-item .menu-item--selected {
      background: var(--menu-item-bg-selected);
    }
    baps-menu-item .menu-item:focus-visible {
      outline: 2px solid var(--menu-item-bar);
      outline-offset: -2px;
    }

    baps-menu-item .menu-item__bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--menu-item-bar-width);
      background: var(--menu-item-bar);
      opacity: 0;
    }
    /* Hover previews the selected look: same background AND the same accent
       bar. That is the panel-list row idiom (see the spm-ui / MyBky panel
       guides) — showing the bar only on an already-selected row left hover as a
       plain grey wash with no hint of what clicking would commit to. */
    baps-menu-item .menu-item:hover:not(.menu-item--disabled) .menu-item__bar,
    baps-menu-item .menu-item--selected .menu-item__bar {
      opacity: 1;
    }

    baps-menu-item .menu-item--danger {
      color: var(--menu-item-text-danger);
    }
    baps-menu-item .menu-item--danger .menu-item__bar {
      background: var(--menu-item-bar-danger);
    }

    baps-menu-item .menu-item--disabled {
      color: var(--menu-item-text-disabled);
      cursor: not-allowed;
      pointer-events: none;
    }
    /* Fade the media boxes too when disabled. */
    baps-menu-item .menu-item--disabled .menu-item__avatar,
    baps-menu-item .menu-item--disabled .menu-item__control {
      opacity: 0.5;
    }
    baps-menu-item .menu-item--disabled .menu-item__subtitle {
      color: var(--menu-item-text-disabled);
    }

    baps-menu-item .menu-item__icon {
      flex: none;
      width: var(--menu-item-icon-size);
      height: var(--menu-item-icon-size);
      font-size: var(--menu-item-icon-size);
      color: currentColor;
    }

    /* Text block — one or two lines. */
    baps-menu-item .menu-item__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1 1 auto;
    }
    baps-menu-item .menu-item__title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    baps-menu-item .menu-item--two-line .menu-item__title {
      font-weight: 500;
    }
    baps-menu-item .menu-item__subtitle {
      font-size: var(--menu-item-subtitle-size);
      color: var(--menu-item-subtitle);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Checkbox / radio — neutral border regardless of severity. */
    baps-menu-item .menu-item__control {
      flex: none;
      box-sizing: border-box;
      width: var(--menu-item-control-size);
      height: var(--menu-item-control-size);
      border: 1.5px solid var(--menu-item-control-border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    baps-menu-item .menu-item__control--check {
      border-radius: 4px;
    }
    baps-menu-item .menu-item__control--radio {
      border-radius: 50%;
    }
    baps-menu-item .menu-item__control svg {
      width: 12px;
      height: 12px;
      opacity: 0;
    }
    baps-menu-item .menu-item__control--check.is-checked {
      background: var(--menu-item-control-checked);
      border-color: var(--menu-item-control-checked);
    }
    baps-menu-item .menu-item__control--check.is-checked svg {
      opacity: 1;
    }
    baps-menu-item .menu-item__control--radio.is-checked {
      border-color: var(--menu-item-control-checked);
    }
    baps-menu-item .menu-item__control--radio.is-checked::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--menu-item-control-checked);
    }

    /* Avatar — the design-system baps-avatar (Sampark bordered square, size s). */
    baps-menu-item .menu-item__avatar {
      flex: none;
    }

    /* MyBKY brand — same anatomy, MyBKY palette (mirrors the baps-listbox
       brand block). Sampark stays the default, per the Figma this came from. */
    baps-menu-item.baps-mybky {
      --menu-item-bg-selected: var(--color-mybky-mono-50, #f8fafb);
      --menu-item-text: var(--color-mybky-mono-900, #181b1d);
      --menu-item-subtitle: var(--color-mybky-mono-500, #6f777d);
      --menu-item-text-danger: var(--color-mybky-error-80, #e05255);
      --menu-item-text-disabled: var(--color-mybky-mono-400, #b6b6af);
      --menu-item-bar: var(--color-mybky-blue-600, #5f78b8);
      --menu-item-bar-danger: var(--color-mybky-error-100, #c32226);
      --menu-item-control-border: var(--color-mybky-mono-400, #b6b6af);
      --menu-item-control-checked: var(--color-mybky-blue-600, #5f78b8);
    }

    /* Dark mode — Sampark has no dark palette yet, so neutrals borrow the mybky
       mono darks (same set as the input/button dark blocks). Danger red, accent
       bar and the rose avatar read fine on dark. */
    .baps-dark baps-menu-item {
      --menu-item-bg-selected: var(--color-mybky-mono-800, #2b2f32);
      --menu-item-text: var(--color-mybky-mono-50, #f8fafb);
      --menu-item-subtitle: var(--color-mybky-mono-400, #b6b6af);
      --menu-item-text-disabled: var(--color-mybky-mono-500, #6f777d);
      --menu-item-control-border: var(--color-mybky-dark-border-control, #6f777d);
      /* The danger row kept the light error red: #e05255 measures 3.54:1 on the
         raised surface it sits on. The tint step is the dark counterpart the
         messages, tags and avatars all use. */
      --menu-item-text-danger: var(--color-mybky-error-tint, #ec9394);
    }

    /* This component's base block is authored in Sampark's palette, so a
       Sampark-scoped row kept light ink in dark — title and subtitle both at
       3.80:1 on the dark ground. */
    .baps-dark :is(baps-menu-item.baps-sampark, .baps-ds-sampark baps-menu-item) {
      --menu-item-bg-selected: var(--color-sampark-dark-surface-card, #2c2c2a);
      --menu-item-text: var(--color-sampark-dark-text-primary, #f8f7f7);
      --menu-item-subtitle: var(--color-sampark-dark-text-muted, #b7b6b3);
      --menu-item-text-disabled: var(--color-sampark-dark-text-disabled, #94928f);
      --menu-item-control-border: var(--color-sampark-dark-border-control, #94928f);
      --menu-item-text-danger: var(--color-sampark-error-40, #f9b9ba);
    }
  `,
  host: {
    '[class.baps-mybky]': "brand === 'mybky'",
  },
})
export class BapsMenuItem {
  /** Primary line. Falls back to projected content if omitted. */
  @Input() title?: string;

  /** Optional second line (e.g. role/subtitle). Two-line rows use a 500-weight title. */
  @Input() subtitle?: string;

  /** Optional leading control for select lists. */
  @Input() control: 'none' | 'checkbox' | 'radio' = 'none';

  /** Checked state for the checkbox / radio control. */
  @Input() checked = false;

  /** Leading media. 'icon' = glyph; 'avatar' = 40px box (initials or `avatarIcon`). */
  @Input() media: 'none' | 'icon' | 'avatar' = 'none';

  /** PrimeNG icon class for media='icon'; defaults to circle-alert. */
  @Input() icon?: string;

  /** Initials for media='avatar' (rose box). */
  @Input() avatarLabel?: string;

  /** PrimeNG icon class for media='avatar' (neutral box, e.g. 'pi-envelope'). */
  @Input() avatarIcon?: string;

  /** 'danger' turns the label + bar red. */
  @Input() severity: 'default' | 'danger' = 'default';

  /** Selected row — grey fill + left accent bar. */
  @Input() selected = false;

  @Input() disabled = false;

  /**
   * Visual skin. Defaults to 'sampark' — this row came from the Sampark
   * Portal Figma; 'mybky' re-points the palette for the BKY events product.
   */
  @Input() brand: 'mybky' | 'sampark' = 'sampark';

  /** Emitted on click / Enter / Space when not disabled. */
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
    if (this.disabled) return;
    this.activated.emit();
  }
}
