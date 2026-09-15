import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
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
            <img [src]="logo" [alt]="title || 'Logo'" class="baps-navbar__logo-img" />
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
  styles: `
    /* Every value flows through a --navbar-* variable so a product can
       re-point the bar centrally, same pattern as baps-menu-item. Defaults
       below are the MyBKY (white) bar; the Sampark block re-points them to
       spm-ui's --topbar-* palette. */
    baps-navbar {
      --navbar-height: 56px;
      --navbar-padding: 0 1.5rem;
      --navbar-bg: var(--color-sampark-surface-card, #ffffff);
      --navbar-border: var(--color-sampark-border-default, #e1e0e0);
      --navbar-text: var(--color-sampark-text-primary, #151414);
      --navbar-title-size: 1rem;
      --navbar-item-hover-bg: var(--color-sampark-mono-20, #f3f2f2);
      --navbar-logo-height: 32px;
      /* Defaulted here, not only in the Sampark block: the mobile rules below
         run for both brands and reference it in a transition shorthand, which
         is dropped wholesale if the variable is unset. */
      --navbar-transition-duration: 0.2s;

      display: block;
    }

    baps-navbar .baps-navbar {
      position: relative;
      display: flex;
      align-items: center;
      height: var(--navbar-height);
      padding: var(--navbar-padding);
      background: var(--navbar-bg);
      border-bottom: 1px solid var(--navbar-border);
      color: var(--navbar-text);
      font-family: inherit;
    }

    /* flex: 0 1 auto + min-width: 0 — the start block still never GROWS, but
       it is now allowed to shrink once the bar runs out of room, and its own
       children may size below their content. Without both, a long title
       widened the bar and pushed the end actions off-screen; with them the
       title ellipsises instead. No effect at any width where the bar fits. */
    baps-navbar .baps-navbar__start {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 0 1 auto;
      min-width: 0;
    }

    baps-navbar .baps-navbar__center {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    baps-navbar .baps-navbar__end {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 0 0 auto;
    }

    baps-navbar .baps-navbar__logo-img {
      height: var(--navbar-logo-height);
      width: auto;
      object-fit: contain;
    }

    baps-navbar .baps-navbar__title {
      font-size: var(--navbar-title-size);
      font-weight: 600;
      line-height: 130%;
      color: var(--navbar-title-color, var(--navbar-text));
      white-space: nowrap;
      /* Truncate rather than widen the bar. min-width: 0 is required — a flex
         child defaults to min-width: auto and refuses to go below its text. */
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* spm-ui .env-version-badge */
    baps-navbar .baps-navbar__version {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      line-height: 130%;
      opacity: 0.75;
      vertical-align: middle;
      white-space: nowrap;
    }

    /* Both buttons are hidden until a skin opts in — the MyBKY bar has neither. */
    baps-navbar .baps-navbar__menu-button,
    baps-navbar .baps-navbar__mobile-button {
      display: none;
    }

    /* ────────────────────────────────────────────────────────────────
       Sampark skin — spm-ui app-topbar under .layout-topbar-indigo.
       Per-instance via brand="sampark", or page-wide via .baps-ds-sampark.
       ──────────────────────────────────────────────────────────────── */
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) {
      /* themes/_topbar_indigo.scss */

      /* 50px, NOT 3.125rem. Upstream writes 3.125rem and only lands on 50px
         because app.layout.service.ts pins the root font-size to 16px from JS
         at startup — from the stylesheet alone it is 43.75px. This workspace
         has its own root-size ambiguity (styles.scss sets 16px unlayered and
         14px inside @layer app-styles), and a consuming app on a 14px root
         would silently shrink the bar. The contract with the layout math is
         50 CSS pixels, so state 50 CSS pixels. */
      --navbar-height: 50px;
      --navbar-padding: 8px 12px;
      /* spm-ui's $headerMenuBg #1d1c1b / border #2c2c2a are already in the
         palette as Secondary/100 and /80 — the same ramp the Sampark nav rail
         uses (see baps-internal-navbar). Reference the tokens, not literals. */
      --navbar-bg: var(--color-sampark-secondary-100, #1d1c1b);
      --navbar-border: var(--color-sampark-secondary-80, #2c2c2a);
      --navbar-text: var(--color-sampark-mono-0, #ffffff);
      --navbar-title-size: 20px;
      /* Separate from --navbar-text on purpose. Upstream hardcodes
         .logo-text { color: var(--white) }, which makes the wordmark invisible
         the moment a light topbar theme is selected. Defaulting to the item
         text colour makes that failure structurally impossible. */
      --navbar-title-color: var(--navbar-text);
      --navbar-item-hover-bg: rgba(255, 255, 255, 0.12);
      /* Estimated. The live topbar uses a text logo, so the spec fixes no image
         height; 24px is what clears a 50px bar with the 8px padding. Reconcile
         against Figma if a raster/SVG mark ships. */
      --navbar-logo-height: 24px;
      /* No token exists for these — the chevron yellow belongs to the indigo
         topbar theme, not the Sampark palette. Literals, as in _topbar_indigo.scss. */
      --navbar-menu-button-bg: #fbc02d;
      --navbar-menu-button-hover-bg: #d3a126;
      --navbar-menu-button-text: #212121;
      --navbar-transition-duration: 0.2s;
    }

    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar {
      transition: width var(--navbar-transition-duration);
    }

    /* ── topbarTheme="light" ──────────────────────────────────────────
       Upstream skins the bar by swapping a .layout-topbar-{theme} class on
       the layout container (app.layout.service.ts topbarTheme), of which
       _topbar_indigo.scss is one. Only the geometry is shared between themes,
       so this re-points colour and nothing else.

       ⚠️ Sourced from a screenshot of localhost:4200, not from stylesheet
       source — the written spec documents only the indigo theme. The wordmark
       maroon in particular is eyeballed against the palette; reconcile the
       exact hue before relying on it. */
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar).baps-navbar-topbar-light {
      --navbar-bg: var(--color-sampark-mono-0, #ffffff);
      --navbar-border: var(--color-sampark-border-default, #e1e0e0);
      --navbar-text: var(--color-sampark-text-primary, #151414);
      --navbar-title-color: var(--color-sampark-primary-default, #c96868);
      --navbar-item-hover-bg: var(--color-sampark-mono-20, #f3f2f2);
    }

    /* .layout-topbar-end — grows and separates actions-start from actions-end.
       __center is the (usually empty) actions-start slot; left-aligning it plus
       an auto-width __end reproduces the spec's justify-content: space-between. */
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__center {
      justify-content: flex-start;
    }

    /* The chevron is 2.5rem centred on the start block's right edge, so it
       covers 1.25rem INSIDE the block as well as 1.25rem outside it. Reserve
       both: padding clears the trailing content (upstream never hits this
       because slim-plus sizes the start block for the logo alone), margin
       clears whatever the centre/end slots project. Keyed on :has() so it
       costs nothing when there is no chevron — no extra host state. */
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar)
      .baps-navbar__start:has(.baps-navbar__menu-button) {
      padding-inline-end: 1.25rem;
      margin-inline-end: 1.25rem;
    }

    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__end {
      gap: 1rem;                                     /* PrimeFlex gap-3 in the live template */
    }

    /* Action affordances: 2.5rem circles with a translucent hover, matching
       .layout-topbar-items > li > a. Applied to whatever the consumer projects
       so callers don't restate it per icon button. */
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__end > :is(a, button) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--navbar-text);
      cursor: pointer;
      transition: background-color var(--navbar-transition-duration);
    }
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__end > :is(a, button):hover {
      background: var(--navbar-item-hover-bg);
    }
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__end > :is(a, button):focus-visible {
      outline: 2px solid var(--navbar-menu-button-bg);
      outline-offset: 2px;
    }

    /* .layout-menu-button — the yellow chevron. Deliberately hangs half outside
       the start block (right: -1.25rem on a 2.5rem circle). */
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__menu-button {
      position: absolute;
      top: 50%;
      right: -1.25rem;
      margin-top: -1.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      border-radius: 50%;
      color: var(--navbar-menu-button-text);
      background: var(--navbar-menu-button-bg);
      box-shadow:
        0 3px 5px rgba(0, 0, 0, 0.06),
        0 2px 9px rgba(0, 0, 0, 0.12),
        0 4px 8px rgba(0, 0, 0, 0.18);
      cursor: pointer;
      z-index: 1;
      transition: background-color var(--navbar-transition-duration);
    }
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__menu-button:hover {
      background: var(--navbar-menu-button-hover-bg);
    }
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__menu-button svg {
      transition: transform var(--navbar-transition-duration);
    }
    :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar).baps-navbar-menu-open .baps-navbar__menu-button svg {
      transform: rotate(180deg);
    }

    /* ── Mobile (<=767px), mirroring _responsive.scss ──
       Every rule here used to be scoped to the Sampark skin, which left the
       MyBKY bar with no mobile handling at all: a 56px single row at 320px
       whose mobile toggle stayed display: none forever. The structure is not
       brand-specific (one full-width row + a collapsible actions panel), so
       the shared rules are now unscoped and serve both brands; only the
       yellow chevron rule below stays Sampark-scoped, because that control
       exists on no other skin. */
    @media (max-width: 767px) {
      baps-navbar .baps-navbar {
        flex-direction: column;
        height: auto;
        padding: 0;
        align-items: stretch;
      }

      baps-navbar .baps-navbar__start {
        width: 100%;
        height: 4rem;
        padding: 0 1rem;
        justify-content: flex-start;
      }

      /* Chevron rejoins the flow instead of hanging off the start block. */
      :is(baps-navbar.baps-sampark, .baps-ds-sampark baps-navbar) .baps-navbar__menu-button {
        position: relative;
        top: auto;
        right: auto;
        margin-top: 0;
        margin-left: 1rem;
      }

      /* spm-ui parks this with margin-left:auto inside .layout-topbar-start; here
         the button is a sibling of __start (so it survives __start going full
         width), so it is absolutely placed to the same spot. Its hover also uses
         the translucent item hover rather than the spec's --topbar-bg, which is
         the bar's own colour and therefore renders no hover at all. */
      baps-navbar .baps-navbar__mobile-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        right: 1rem;
        height: 4rem;
        width: 2.5rem;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: var(--navbar-text);
        cursor: pointer;
        transition: background-color var(--navbar-transition-duration);
      }
      baps-navbar .baps-navbar__mobile-button:hover {
        background: var(--navbar-item-hover-bg);
      }

      /* Actions collapse away until the mobile button opens them. */
      baps-navbar .baps-navbar__center,
      baps-navbar .baps-navbar__end {
        display: none;
      }

      /* .layout-topbar-menu-active */
      baps-navbar.baps-navbar-mobile-open .baps-navbar__end {
        display: flex;
        flex-direction: column-reverse;
        align-items: stretch;
        justify-content: space-between;
        position: absolute;
        top: 4rem;
        left: 0;
        width: 100%;
        padding: 0 1rem;
        background: var(--navbar-bg);
        z-index: 1;
      }
      baps-navbar.baps-navbar-mobile-open .baps-navbar__center {
        display: flex;
        align-items: center;
        height: 3rem;
        padding: 0 1rem;
        background: var(--navbar-bg);
      }
    }

    /* ── Dark mode — MyBKY only. The Sampark bar is already dark by design;
       re-tinting it here would undo the indigo theme. ── */
    .baps-dark baps-navbar:not(.baps-sampark) {
      --navbar-bg: var(--color-mybky-mono-900, #181b1d);
      --navbar-border: var(--color-mybky-mono-700, #3d4144);
      --navbar-text: var(--color-mybky-mono-50, #f8fafb);
      --navbar-item-hover-bg: var(--color-mybky-mono-800, #2b2f32);
    }
  `,
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
