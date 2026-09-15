import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { BapsIcon } from '../icon/icon.component';
import type { BapsIconName } from '../icon/icon-set';

export interface InternalNavItem {
  label: string;
  /**
   * A PrimeIcons CLASS string, e.g. 'pi-home'. Kept for existing callers.
   * Prefer `iconName`, which draws from the BAPS icon set.
   */
  icon?: string;
  /**
   * A name from the BAPS icon set, drawn as an SVG by baps-icon.
   *
   * Additive: `icon` still works, so no existing caller changes. When both are
   * set this one wins, because rendering both would stack two glyphs in the
   * same slot.
   */
  iconName?: BapsIconName;
  routerLink?: string | any[];
  command?: () => void;
  disabled?: boolean;
  separator?: boolean;
  badge?: string | number;
  /** Small unlabeled status dot, top-right of the icon — Sampark rail mode only (Figma node 13197:89998, "Nav Bar Status Dot"). */
  notification?: boolean;
  children?: InternalNavItem[];
}

/**
 * One rendered row of the (possibly nested) menu — an item plus its depth.
 *
 * The tree is flattened into a single list rather than rendered recursively:
 * a recursive template needs NgTemplateOutlet plus a nested <ul> per branch,
 * and this component has no directive imports at all today. A flat list keeps
 * one @for, one <li> shape, and makes `aria-level` fall out of the data.
 */
export interface InternalNavRow {
  item: InternalNavItem;
  level: number;
}

/**
 * baps-internal-navbar — sidebar / secondary navigation.
 *
 * Custom component for vertical navigation. Renders a 264px sidebar with menu
 * items, an optional collapsible state, and a left accent bar marking the
 * active item.
 *
 * BRANDED, not maroon. Every colour goes through a `--baps-inav-*` variable
 * that defaults to MyBKY and is re-pointed under the Sampark scope. It used to
 * read Sampark tokens directly, so a MyBKY consumer got a maroon rail however
 * it set `brand` — measured in the MyBKY app, the active item rendered #C96868
 * on #FBF4F4 with `brand="mybky"` on the element.
 *
 * `brand="sampark"` + `[collapsed]="true"` switches to the dark 72px icon
 * rail from the Sampark Portal Figma ("Web Nav Bar" component, node
 * 13197:89998) — icon-over-label tiles on a Secondary/100 rail, hover
 * Secondary/80, selected Secondary/60 + drop shadow. This differs from the
 * generic (MyBKY) collapsed mode, which stays a plain icon-only 56px rail —
 * so every rail-specific rule below is scoped under `.baps-sampark`.
 *
 * Usage:
 *   <baps-internal-navbar [items]="menuItems" [activeItem]="currentRoute" brand="sampark">
 *   </baps-internal-navbar>
 */
@Component({
  selector: 'baps-internal-navbar',
  imports: [BapsIcon],
  template: `
    <nav
      class="baps-internal-nav"
      [class.baps-internal-nav--collapsed]="collapsed"
      [attr.aria-label]="ariaLabel || 'Section navigation'"
    >
      @if (title) {
        <div class="baps-internal-nav__header">
          <span class="baps-internal-nav__title">{{ title }}</span>
        </div>
      }
      <ul class="baps-internal-nav__list">
        @for (row of rows; track row.item) {
          @let item = row.item;
          @if (item.separator) {
            <li class="baps-internal-nav__separator"></li>
          } @else {
            <li class="baps-internal-nav__item"
                [attr.data-level]="row.level || null"
                [attr.aria-level]="hasNesting ? row.level + 1 : null"
                [class.baps-internal-nav__item--active]="activeItem === item.label"
                [class.baps-internal-nav__item--disabled]="item.disabled">
              <button
                class="baps-internal-nav__link"
                [disabled]="item.disabled"
                (click)="onItemClick(item)"
                [attr.aria-current]="activeItem === item.label ? 'page' : null"
                [attr.aria-label]="!collapsed || brand === 'sampark' ? null : item.label"
                [attr.aria-expanded]="hasChildren(item) ? isExpanded(item) : null"
                type="button"
              >
                <span class="baps-internal-nav__bar" aria-hidden="true"></span>
                @if (hasNesting) {
                  <span
                    class="baps-internal-nav__chevron"
                    [class.baps-internal-nav__chevron--open]="isExpanded(item)"
                    [class.baps-internal-nav__chevron--empty]="!hasChildren(item)"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m3.5 1.5 3.5 3.5-3.5 3.5" />
                    </svg>
                  </span>
                }
                <!-- No [size] on purpose: .baps-internal-nav__icon already
                     pins width/height (20px, and 24px in the Sampark collapsed
                     rail) and beats baps-icon's own rule on specificity. Setting
                     size here would look authoritative while doing nothing, and
                     would go stale the moment the rail size changes. -->
                @if (item.iconName) {
                  <baps-icon class="baps-internal-nav__icon" [name]="item.iconName" />
                } @else if (item.icon) {
                  <i class="baps-internal-nav__icon pi" [class]="item.icon" aria-hidden="true"></i>
                }
                @if (!collapsed || brand === 'sampark') {
                  <span class="baps-internal-nav__label">{{ item.label }}</span>
                }
                @if (item.badge && !collapsed) {
                  <span class="baps-internal-nav__badge">{{ item.badge }}</span>
                }
                @if (item.notification && collapsed) {
                  <span class="baps-internal-nav__status-dot" aria-hidden="true"></span>
                }
              </button>
            </li>
          }
        }
      </ul>
      <div class="baps-internal-nav__footer">
        <ng-content></ng-content>
      </div>
    </nav>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-internal-navbar {
      display: block;

      /* Brand surface. These used to be Sampark tokens read directly, which
         meant a MyBKY consumer got a maroon rail no matter what brand it
         passed — measured in the app: the active item rendered #C96868 on
         #FBF4F4 with brand="mybky" set. The values below are the MyBKY
         defaults; the Sampark block re-points them. */
      --baps-inav-surface: var(--color-mybky-surface-card, #ffffff);
      --baps-inav-border: var(--color-mybky-border-default, #e4ecf1);
      --baps-inav-title: var(--color-mybky-text-muted, #6f777d);
      --baps-inav-text: var(--color-mybky-text-secondary, #2b2f32);
      --baps-inav-text-strong: var(--color-mybky-text-primary, #181b1d);
      --baps-inav-hover-bg: var(--color-mybky-mono-50, #f8fafb);
      --baps-inav-accent: var(--color-mybky-blue-600, #5f78b8);
      --baps-inav-active-bg: var(--color-mybky-blue-50, #eef0f8);
      --baps-inav-disabled: var(--color-mybky-text-disabled, #869097);
      --baps-inav-on-accent: var(--color-mybky-mono-0, #ffffff);
      /* 8px in MyBKY against Sampark's 4px — the two brands' radius steps. */
      --baps-inav-radius: 0.5rem;
    }

    :is(baps-internal-navbar.baps-sampark, .baps-ds-sampark baps-internal-navbar) {
      --baps-inav-surface: var(--color-sampark-surface-card, #ffffff);
      --baps-inav-border: var(--color-sampark-border-default, #e1e0e0);
      --baps-inav-title: var(--color-sampark-text-muted, #9f9c9c);
      --baps-inav-text: var(--color-sampark-text-secondary, #595656);
      --baps-inav-text-strong: var(--color-sampark-text-primary, #151414);
      --baps-inav-hover-bg: var(--color-sampark-secondary-0, #f8f7f7);
      --baps-inav-accent: var(--color-sampark-primary-default, #c96868);
      --baps-inav-active-bg: var(--color-sampark-primary-0, #fbf4f4);
      --baps-inav-disabled: var(--color-sampark-text-disabled, #bcb9b9);
      --baps-inav-on-accent: var(--color-sampark-mono-0, #ffffff);
      --baps-inav-radius: var(--radius-sampark-default, 0.25rem);
    }

    baps-internal-navbar .baps-internal-nav {
      width: 264px;
      height: 100%;
      background: var(--baps-inav-surface);
      border-right: 1px solid var(--baps-inav-border);
      display: flex;
      flex-direction: column;
      font-family: inherit;
      transition: width 220ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    baps-internal-navbar .baps-internal-nav--collapsed {
      width: 56px;
    }

    baps-internal-navbar .baps-internal-nav__header {
      padding: 1rem 1rem 0.5rem;
    }

    baps-internal-navbar .baps-internal-nav__title {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--baps-inav-title);
    }

    baps-internal-navbar .baps-internal-nav__list {
      list-style: none;
      margin: 0;
      padding: 0.25rem 0.5rem;
      flex: 1;
      overflow-y: auto;
    }

    baps-internal-navbar .baps-internal-nav__separator {
      height: 1px;
      background: var(--baps-inav-border);
      margin: 0.5rem 0.75rem;
    }

    baps-internal-navbar .baps-internal-nav__item {
      position: relative;
    }

    baps-internal-navbar .baps-internal-nav__link {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--baps-inav-text);
      cursor: pointer;
      border-radius: var(--baps-inav-radius);
      transition: background 120ms ease, color 120ms ease;
      text-align: left;
    }

    baps-internal-navbar .baps-internal-nav__link:hover:not(:disabled) {
      background: var(--baps-inav-hover-bg);
      color: var(--baps-inav-text-strong);
    }

    baps-internal-navbar .baps-internal-nav__link:focus-visible {
      outline: 2px solid var(--baps-inav-accent);
      outline-offset: -2px;
    }

    /* Active item */
    baps-internal-navbar .baps-internal-nav__item--active .baps-internal-nav__link {
      background: var(--baps-inav-active-bg);
      color: var(--baps-inav-accent);
      font-weight: 500;
    }

    /* Left accent bar */
    baps-internal-navbar .baps-internal-nav__bar {
      position: absolute;
      left: 0; top: 4px; bottom: 4px;
      width: 3px;
      border-radius: 0 2px 2px 0;
      background: var(--baps-inav-accent);
      opacity: 0;
      transition: opacity 120ms ease;
    }
    baps-internal-navbar .baps-internal-nav__item--active .baps-internal-nav__bar {
      opacity: 1;
    }

    /* Disabled */
    baps-internal-navbar .baps-internal-nav__item--disabled .baps-internal-nav__link {
      color: var(--baps-inav-disabled);
      cursor: not-allowed;
    }

    /* ── Nested levels — Figma "♻️ Base Internal Menu Levels" (13197:94022).
       The level spacer is 18/36/54/72px wide for levels 1-4, i.e. a flat
       18px per level, added on top of the link's own 12px padding. Written
       as four static rules rather than a bound custom property so no inline
       style attribute is needed; Figma defines exactly four levels, and a
       deeper item simply stops indenting rather than running off the rail. ── */
    baps-internal-navbar .baps-internal-nav__item[data-level='1'] .baps-internal-nav__link {
      padding-left: calc(0.75rem + 18px);
    }
    baps-internal-navbar .baps-internal-nav__item[data-level='2'] .baps-internal-nav__link {
      padding-left: calc(0.75rem + 36px);
    }
    baps-internal-navbar .baps-internal-nav__item[data-level='3'] .baps-internal-nav__link {
      padding-left: calc(0.75rem + 54px);
    }
    baps-internal-navbar .baps-internal-nav__item[data-level='4'] .baps-internal-nav__link {
      padding-left: calc(0.75rem + 72px);
    }

    /* Disclosure chevron — Figma "Internal Menu Item Chevron" (13197:93780),
       a 10px glyph pointing right when closed (Hierarchy Default) and rotated
       90deg down when open (Hierarchy Open). The slot is only rendered when
       the nav actually has nesting, so a flat menu keeps its exact previous
       geometry; within a nested menu, leaf rows keep an invisible slot so
       their labels stay aligned with their expandable siblings. */
    baps-internal-navbar .baps-internal-nav__chevron {
      flex: none;
      width: 10px;
      height: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--baps-inav-text);
      transition: transform 150ms ease;
    }
    baps-internal-navbar .baps-internal-nav__chevron svg {
      width: 10px;
      height: 10px;
    }
    baps-internal-navbar .baps-internal-nav__chevron--open {
      transform: rotate(90deg);
    }
    baps-internal-navbar .baps-internal-nav__chevron--empty {
      visibility: hidden;
    }

    baps-internal-navbar .baps-internal-nav__icon {
      flex: none;
      width: 20px;
      height: 20px;
      font-size: 1.125rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    baps-internal-navbar .baps-internal-nav__label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    baps-internal-navbar .baps-internal-nav__badge {
      flex: none;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 0.375rem;
      border-radius: var(--radius-sampark-pill, 100px);
      background: var(--baps-inav-accent);
      color: var(--baps-inav-on-accent);
      font-size: 0.6875rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    baps-internal-navbar .baps-internal-nav__footer {
      padding: 0.5rem;
      border-top: 1px solid var(--baps-inav-border);
    }

    baps-internal-navbar .baps-internal-nav__footer:empty {
      display: none;
    }

    /* Collapsed state — only icons visible */
    baps-internal-navbar .baps-internal-nav--collapsed .baps-internal-nav__header,
    baps-internal-navbar .baps-internal-nav--collapsed .baps-internal-nav__label,
    baps-internal-navbar .baps-internal-nav--collapsed .baps-internal-nav__badge {
      display: none;
    }

    baps-internal-navbar .baps-internal-nav--collapsed .baps-internal-nav__link {
      justify-content: center;
      padding: 0.625rem;
    }

    /* ══════════════════════════════════════════════════════════════════
       SAMPARK RAIL — collapsed + brand="sampark" only. Figma "Web Nav Bar"
       component set (node 13197:89998): a dark 72px icon-over-label tile,
       not the generic icon-only collapse above. Every selector repeats the
       .baps-sampark host class so nothing here reaches the MyBKY collapse.
       ══════════════════════════════════════════════════════════════════ */

    /* 104px = 72px tile + 16px padding both sides (Figma frame, 104×273 for
       the 3-variant set). Rail surface is Secondary/100 — the darkest step,
       so hover (Secondary/80) and selected (Secondary/60) read as lighter. */
    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed {
      width: 104px;
      background: var(--color-sampark-secondary-100, #1d1c1b);
      border-right-color: var(--color-sampark-secondary-100, #1d1c1b);
    }

    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__list {
      padding: 1rem; /* 16px — leaves exactly 72px for the tile below */
    }

    /* Label stays visible (unlike the generic collapse) — Figma always
       shows the caption under the icon. */
    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__label {
      display: block;
      font-size: 0.75rem; /* 12px, Inter Regular */
      font-weight: 400;
      line-height: 1.3;
      color: inherit;
      text-align: center;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Left accent bar is a MyBKY/expanded-list device — this tile signals
       state with its own fill instead. */
    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__bar {
      display: none;
    }

    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__icon {
      width: 24px;
      height: 24px;
    }

    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__link {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem; /* 8px icon-label gap */
      width: 100%;
      min-height: 3rem; /* 48px */
      padding: 0.75rem 0; /* 12px vertical, Figma py-[12px] */
      border-radius: 0.5rem; /* 8px — no matching step in radius.sampark (default 4px / pill 100px) */
      color: var(--color-sampark-mono-0, #ffffff);
    }

    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__link:hover:not(:disabled) {
      background: var(--color-sampark-secondary-80, #2c2c2a);
      color: var(--color-sampark-mono-0, #ffffff);
    }

    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__item--active .baps-internal-nav__link {
      background: var(--color-sampark-secondary-60, #4a4947);
      color: var(--color-sampark-mono-0, #ffffff);
      font-weight: 400; /* Figma keeps Regular even when selected — no bold, unlike the expanded list */
      /* Figma effect "M Drop Shadow" (get_variable_defs): two drop-shadow
         layers, converted to box-shadow — not in the shared shadow token
         set (closest, shadow.sampark.l1/l2, use different offsets/spread). */
      box-shadow:
        0 2px 4px -2px rgba(16, 24, 40, 0.16),
        0 4px 8px -2px rgba(16, 24, 40, 0.08);
    }

    /* Status dot — small unlabeled indicator, distinct from the rectangular
       __badge (Figma "Nav Bar Status Dot", node 13197:90002). */
    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__status-dot {
      position: absolute;
      top: 0.5rem; /* 8px */
      right: 0.5rem; /* 8px */
      width: 0.75rem; /* 12px hit box */
      height: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__status-dot::after {
      content: '';
      width: 0.375rem; /* 6px */
      height: 0.375rem;
      border-radius: 50%;
      background: var(--color-sampark-error-80, #ea151a);
      border: 1px solid var(--color-sampark-mono-0, #ffffff);
    }

    baps-internal-navbar.baps-sampark .baps-internal-nav--collapsed .baps-internal-nav__footer {
      border-top-color: var(--color-sampark-secondary-80, #2c2c2a);
    }

    /* ══════════════════════════════════════════════════════════════════
       Mobile (<=767px) — both brands.

       collapsed is an @Input the component never derives, so an app that
       does not drive it from a breakpoint shows the full 264px rail on a
       360px phone: 73% of the screen, ~96px left for the page. Below 768px
       the rail therefore renders icon-only regardless of [collapsed], using
       the same 56px geometry the collapsed state already defines.

       Scoped :not(--collapsed) so it only supplies the state the consumer
       failed to; a rail that is already collapsed keeps its own styling,
       including the Sampark 104px tile rail (higher specificity, unchanged).

       Labels are moved out of sight rather than display: none. The icon is
       aria-hidden, so hiding the label outright would leave the button with
       no accessible name — the exact gap the collapsed MyBKY rail already
       has, and not one to reproduce here.
       ══════════════════════════════════════════════════════════════════ */
    @media (max-width: 767px) {
      baps-internal-navbar .baps-internal-nav:not(.baps-internal-nav--collapsed) {
        width: 56px;
      }

      baps-internal-navbar .baps-internal-nav:not(.baps-internal-nav--collapsed) .baps-internal-nav__link {
        justify-content: center;
        padding: 0.625rem;
      }

      baps-internal-navbar .baps-internal-nav:not(.baps-internal-nav--collapsed) .baps-internal-nav__header,
      baps-internal-navbar .baps-internal-nav:not(.baps-internal-nav--collapsed) .baps-internal-nav__badge {
        display: none;
      }

      baps-internal-navbar .baps-internal-nav:not(.baps-internal-nav--collapsed) .baps-internal-nav__label {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        border: 0;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
    }

    /* ── Dark mode ── */
    .baps-dark baps-internal-navbar .baps-internal-nav {
      background: var(--color-mybky-mono-900, #181b1d);
      border-right-color: var(--color-mybky-mono-700, #3d4144);
    }
    .baps-dark baps-internal-navbar .baps-internal-nav__link {
      color: var(--color-mybky-mono-400, #b6b6af);
    }
    .baps-dark baps-internal-navbar .baps-internal-nav__link:hover:not(:disabled) {
      background: var(--color-mybky-mono-800, #2b2f32);
      color: var(--color-mybky-mono-50, #f8fafb);
    }
    .baps-dark baps-internal-navbar .baps-internal-nav__item--active .baps-internal-nav__link {
      background: rgba(201, 104, 104, 0.1);
    }
    .baps-dark baps-internal-navbar .baps-internal-nav__separator {
      background: var(--color-mybky-mono-700, #3d4144);
    }
    .baps-dark baps-internal-navbar .baps-internal-nav__title {
      color: var(--color-mybky-mono-500, #6f777d);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    /* title is BOTH this component's @Input and a native global attribute, so
       writing title="Navigation" on the element sets the input AND leaves the
       attribute on the host. The browser then draws its own unstyled tooltip
       for the whole rail: hovering anywhere in the 1108x213 nav popped a
       "Navigation" bubble that duplicated the heading already rendered inside.
       It was also announced twice by screen readers. Stripping the attribute
       keeps the input working and costs nothing, since the heading is visible
       text. Renaming the input would have been the other fix, but that is a
       breaking change for every call site. */
    '[attr.title]': 'null',
  },
})
export class BapsInternalNavbar {
  /** Menu items to render. */
  @Input() items: InternalNavItem[] = [];
  /** Label of the currently active item (drives highlighting). */
  @Input() activeItem?: string;
  /** Optional section title above the menu list. */
  @Input() title?: string;
  /** Whether the sidebar is collapsed to icon-only mode. */
  @Input() collapsed = false;
  @Input() ariaLabel?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /** Emitted when a menu item is clicked. */
  @Output() itemClick = new EventEmitter<InternalNavItem>();

  /**
   * Expanded parents, keyed by object identity rather than label — labels are
   * only unique per level, and two branches can legitimately both hold a
   * "Settings" child.
   */
  private readonly expanded = new Set<InternalNavItem>();

  hasChildren(item: InternalNavItem): boolean {
    return !!item.children?.length;
  }

  isExpanded(item: InternalNavItem): boolean {
    return this.expanded.has(item);
  }

  /**
   * True when this menu renders a hierarchy at all. Drives the chevron slot,
   * `aria-level`, and nothing else — a flat `items` array (every consumer
   * before nesting existed) renders byte-identically to before.
   *
   * Only the top level is inspected: children are unreachable unless a
   * top-level parent declares them, so no deeper scan can change the answer.
   * Collapsed rails never nest, so they are flat by definition.
   */
  get hasNesting(): boolean {
    return !this.collapsed && this.items.some((i) => !!i.children?.length);
  }

  /** `items` flattened to the currently visible rows, each tagged with its depth. */
  get rows(): InternalNavRow[] {
    const out: InternalNavRow[] = [];
    const walk = (list: InternalNavItem[], level: number): void => {
      for (const item of list) {
        out.push({ item, level });
        if (!this.collapsed && item.children?.length && this.expanded.has(item)) {
          walk(item.children, level + 1);
        }
      }
    };
    walk(this.items, 0);
    return out;
  }

  onItemClick(item: InternalNavItem): void {
    if (item.disabled) return;
    // A parent row is its own disclosure control: one button, one accessible
    // name, `aria-expanded` on it. itemClick still fires so a consumer can
    // treat the parent as a destination as well as a branch.
    if (this.hasChildren(item)) {
      if (this.expanded.has(item)) this.expanded.delete(item);
      else this.expanded.add(item);
    }
    if (item.command) item.command();
    this.itemClick.emit(item);
  }
}
