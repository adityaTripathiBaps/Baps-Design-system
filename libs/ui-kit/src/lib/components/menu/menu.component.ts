import {
  Component,
  Input,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type { MenuItem as PrimeMenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

type BapsMenuModelItemBase = Pick<
  PrimeMenuItem,
  | 'label'
  | 'visible'
  | 'icon'
  | 'styleClass'
  | 'routerLink'
  | 'command'
  | 'disabled'
>;

/** The menu-item keys approved from measured consumer usage. */
export interface BapsMenuModelItem extends BapsMenuModelItemBase {
  items?: BapsMenuModelItem[];
}

/**
 * baps-menu — a popup (or inline) navigation / command menu.
 *
 * Wraps PrimeNG Menu. Submenus are supported: any `MenuItem` with an `items`
 * array renders as a submenu header with a nested group. Items with
 * `visible: false` do not render (the most-used key after `label`).
 *
 * The panel portals to `<body>` by default when used as a popup, so the brand
 * rides on the panel's own class list — exactly the same pattern as
 * `baps-popover` and `baps-toast`.
 */
@Component({
  selector: 'baps-menu',
  imports: [Menu],
  template: `
    <p-menu
      [model]="model"
      [popup]="popup"
      [appendTo]="appendTo"
      ariaLabel="Menu"
      [styleClass]="panelClass"
    />
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/menu/_menu.scss'],
})
export class BapsMenu {
  @ViewChild(Menu) private readonly menu?: Menu;

  /** Menu items. Nested `items` arrays render submenus. */
  @Input() model?: BapsMenuModelItem[];
  /** Show as a popup anchored to the triggering event. */
  @Input() popup = false;
  /**
   * 'body' by default, NOT PrimeNG's 'self'. Rendered inline the panel is
   * clipped by any ancestor with `overflow` or a `transform`.
   */
  @Input() appendTo: unknown = 'body';
  /** Extra class(es) for the menu panel. */
  @Input() styleClass?: string;
  /** Visual skin: 'mybky' (default) or 'sampark'. */
  @Input() brand: BapsBrand = injectBapsBrand();

  /**
   * The panel is portalled out of this host, so the brand cannot be carried by
   * a host class — it rides along on the panel's own class list instead.
   * `baps-menu-panel` is what _menu.scss roots every rule at.
   */
  protected get panelClass(): string {
    const brandClass =
      this.brand === 'sampark' ? 'baps-ds-sampark baps-menu-sampark' : '';
    return ['baps-menu-panel', brandClass, this.styleClass]
      .filter(Boolean)
      .join(' ');
  }

  /** Open (or close) the popup menu against the event that triggered it. */
  toggle(event: Event): void {
    this.menu?.toggle(event);
  }
}
