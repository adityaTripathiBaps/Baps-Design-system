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
  // CSS lives in ../../styles/components/internal-navbar/_internal-navbar.scss so the same rules
  // can style raw markup that Angular never rendered — see the header comment
  // there. styleUrls keeps it shipping with the component.
  styleUrls: ['../../styles/components/internal-navbar/_internal-navbar.scss'],
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
