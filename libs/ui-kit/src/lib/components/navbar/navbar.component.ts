import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Ripple } from 'primeng/ripple';

/**
 * baps-navbar — top application navigation bar.
 *
 * Custom component (PrimeNG has no toolbar with this layout).
 *
 * Anatomy:
 *   [ logo | title | version ] [ menu button ] ─ stretch ─ [ actions ] [ mobile button ]
 *
 * ## Sampark skin — spm-ui `app-topbar`
 *
 * `brand="sampark"` reproduces the live Sampark Portal topbar
 * (`_topbar_main.scss` + a `themes/_topbar_*.scss`, applied under the app's
 * `.layout-topbar-{topbarTheme}` wrapper): a **50px bar**, not the 56px bar the
 * MyBKY default renders.
 *
 * Colour is a separate axis from geometry — see `[topbarTheme]`:
 * `indigo` (dark `#1d1c1b`, the documented default) or `light` (white bar,
 * maroon wordmark). Only `indigo` is backed by stylesheet source; `light` was
 * reconstructed from a screenshot of the running app.
 *
 * | spm-ui | here |
 * |---|---|
 * | `.layout-topbar` | `.baps-navbar` |
 * | `.layout-topbar-start` | `.baps-navbar__start` |
 * | `.layout-topbar-end` | `.baps-navbar__center` + `__end` |
 * | `.layout-menu-button` | `[menuButton]` / `(menuToggle)` |
 * | `.layout-topbar-mobile-button` | `(mobileMenuToggle)` |
 * | `.logo-text` | `[title]` |
 * | `.env-version-badge` | `[version]` |
 *
 * ### The 50px contract
 * The Sampark height is load-bearing in the consuming app — `_content.scss`
 * pads `.layout-content-wrapper` by the same amount, and `_table.scss` and the
 * viewport flex math both hardcode `50px`. Those are not derived from this
 * value. Re-point `--navbar-height` and you must update them too.
 *
 * Expressed here as a literal `50px`, not upstream's `3.125rem`: that only
 * resolves to 50 because `app.layout.service.ts` pins the root font-size to
 * 16px from JavaScript at startup. Anywhere the root is 14px — which this
 * workspace's own `styles.scss` very nearly does — `3.125rem` is 43.75px and
 * the contract silently breaks.
 *
 * ### Deliberately not implemented
 * - **Fixed positioning** (`position: fixed; z-index: 999`) — the app shell owns
 *   page layout; a design-system bar that escapes its container breaks every
 *   Storybook frame and every embedded usage. Set it at the consumer.
 * - **The slim-plus logo swap** (`.layout-topbar-logo-full` ⇄ `-slim` at ≥768px)
 *   and hiding the menu button there — both keyed off the sidebar's `menuMode`,
 *   which this component has no knowledge of.
 */
@Component({
  selector: 'baps-navbar',
  imports: [Ripple],
  template: `
    <nav class="baps-navbar" [attr.aria-label]="ariaLabel || 'Main navigation'">
      <div class="baps-navbar__start">
        @if (logo) {
          <span class="baps-navbar__logo" aria-hidden="true">
            <img
              [src]="logo"
              [alt]="title || 'Logo'"
              class="baps-navbar__logo-img"
            />
          </span>
        }
        @if (title) {
          <span class="baps-navbar__title">{{ title }}</span>
        }
        @if (version) {
          <span class="baps-navbar__version">{{ version }}</span>
        }
        <ng-content select="[navbar-start]"></ng-content>

        @if (menuButton) {
          <button
            type="button"
            pRipple
            class="baps-navbar__menu-button"
            [attr.aria-label]="menuOpen ? 'Collapse menu' : 'Expand menu'"
            [attr.aria-expanded]="menuOpen"
            (click)="menuToggle.emit(!menuOpen)"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        }
      </div>

      <div class="baps-navbar__center">
        <ng-content select="[navbar-center]"></ng-content>
      </div>

      <div class="baps-navbar__end">
        <ng-content select="[navbar-end]"></ng-content>
        <ng-content></ng-content>
      </div>

      <!-- Mobile only (<=767px): toggles the actions row, like spm-ui's
           onTopbarMenuToggle(). CSS hides it on every larger viewport. -->
      <button
        type="button"
        pRipple
        class="baps-navbar__mobile-button"
        [attr.aria-label]="mobileMenuOpen ? 'Close menu' : 'Open menu'"
        [attr.aria-expanded]="mobileMenuOpen"
        (click)="mobileMenuToggle.emit(!mobileMenuOpen)"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    </nav>
  `,
  encapsulation: ViewEncapsulation.None,
  // CSS lives in ../../styles/components/navbar/_navbar.scss so the same rules
  // ship to non-Angular consumers through @org/ui-kit/styles — an inline
  // `styles:` block compiles into the JS bundle and reaches no one else.
  // styleUrls keeps it shipping with the component too.
  styleUrls: ['../../styles/components/navbar/_navbar.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-navbar-topbar-light]': "topbarTheme === 'light'",
    '[class.baps-navbar-menu-open]': 'menuOpen',
    '[class.baps-navbar-mobile-open]': 'mobileMenuOpen',
  },
})
export class BapsNavbar {
  /** URL for the logo image. */
  @Input() logo?: string;
  /** Application / section title. Renders as spm-ui's `.logo-text` under Sampark. */
  @Input() title?: string;
  /** Environment / version chip beside the title (spm-ui `.env-version-badge`). */
  @Input() version?: string;
  /** Accessible label for the nav element. */
  @Input() ariaLabel?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /**
   * Sampark topbar colour theme — upstream's `topbarTheme`, applied there as a
   * `.layout-topbar-{theme}` class on the layout container.
   *
   * - `indigo` — the dark `#1d1c1b` bar documented in `_topbar_indigo.scss`.
   * - `light` — the white bar with the maroon wordmark, as seen running at
   *   `localhost:4200`. Colours are read off a screenshot, not source.
   *
   * No effect on the MyBKY brand.
   */
  @Input() topbarTheme: 'indigo' | 'light' = 'indigo';

  /**
   * Show the yellow sidebar chevron (spm-ui `.layout-menu-button`). Sampark
   * skin only — the MyBKY bar has no equivalent.
   */
  @Input() menuButton = false;
  /** Chevron rotation state. The sidebar itself is the consumer's to own. */
  @Input() menuOpen = false;
  /** Emits the requested next `menuOpen` value. */
  @Output() menuToggle = new EventEmitter<boolean>();

  /** Whether the mobile actions row is expanded (spm-ui `.layout-topbar-menu-active`). */
  @Input() mobileMenuOpen = false;
  /** Emits the requested next `mobileMenuOpen` value. */
  @Output() mobileMenuToggle = new EventEmitter<boolean>();
}
