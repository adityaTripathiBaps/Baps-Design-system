/**
 * Framework snippets for the Navbar docs page.
 *
 * ## Why this page exists at all
 *
 * Until 485e386 it could not. The component carried 340 lines of CSS in an
 * inline `styles:` block, which Angular compiles into the JS bundle and
 * injects at runtime — so `@org/ui-kit/styles` shipped 26 component
 * stylesheets and this was not one of them. Moving it to a partial emitted
 * `navbar.css`: 12,961 bytes, 34 rules, and 0 `.p-` selectors. That last
 * number is what makes the Custom tab honest. The component imports only
 * `primeng/ripple`, a behaviour directive with no skin of its own.
 *
 * What raw markup therefore loses is the ripple, and nothing else: the two
 * buttons below are styled identically and simply do not splash on press.
 *
 * ## Every input is a class on the HOST
 *
 * Unusually tidy for this library — all four state inputs map one to one, and
 * none of them touch the inner markup:
 *
 *   brand="sampark"         class="baps-sampark"
 *   topbarTheme="light"     class="baps-navbar-topbar-light"
 *   [menuOpen]="true"       class="baps-navbar-menu-open"
 *   [mobileMenuOpen]="true" class="baps-navbar-mobile-open"
 *
 * The rest are content: `logo`, `title` and `version` each render a span in
 * `__start` when set and nothing when unset, and `[menuButton]="true"` is
 * what adds the chevron button — it is off by default.
 *
 * Note the host element and the nav inside it share the name `baps-navbar`,
 * one as an element and one as a class. Both are load-bearing: the custom
 * property block is declared on the element and the layout rules on the class.
 *
 * ## Projection lands inside a slot, not beside it
 *
 * `<span navbar-end>` is written as a CHILD of `<baps-navbar>` in Angular and
 * Angular moves it into `.baps-navbar__end`. Raw markup has no one to do the
 * moving, so it goes straight into that div. Same for `navbar-start` and
 * `navbar-center`.
 *
 * The `sb-navbar-user` class in the stories is Storybook's own, not the design
 * system's — these snippets use plain elements instead so nothing points at a
 * class a consumer cannot import.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('navbar');

export const navbarSnippets: Record<string, SnippetSet> = {
  // Narrow the browser below 768px to see this do anything.
  //
  // The mobile rules are a @media (max-width: 767px) query, so they key off
  // the VIEWPORT and not the element. A fixed-width wrapper would look like a
  // mobile simulation while actually rendering the desktop bar — which is why
  // the story does not use one and neither does this.
  //
  // Below the breakpoint the start block grows to 4rem full-width, the chevron
  // rejoins the flow, and the actions row collapses behind the mobile button.
  // mobileMenuOpen shows it already expanded.
  SamparkMobile: {
    primeng: `<div class="baps-ds-sampark">
  <baps-navbar brand="sampark" title="Sampark" version="DEV" [menuButton]="true" [mobileMenuOpen]="true">
    <button navbar-end type="button" aria-label="Notifications">
      <baps-icon name="notification" />
    </button>
    <button navbar-end type="button" aria-label="Settings">
      <baps-icon name="settings" />
    </button>
  </baps-navbar>
</div>`,
    custom: `<div class="baps-ds-sampark">
  <baps-navbar class="baps-sampark baps-navbar-mobile-open">
    <nav class="baps-navbar" aria-label="Main navigation">
      <div class="baps-navbar__start">
        <span class="baps-navbar__title">Sampark</span>
        <span class="baps-navbar__version">DEV</span>
        <button type="button" class="baps-navbar__menu-button" aria-label="Expand menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      </div>
      <div class="baps-navbar__center"></div>
      <div class="baps-navbar__end">
          <button type="button" aria-label="Notifications">
            <baps-icon><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['notification'] --></span></baps-icon>
          </button>
          <button type="button" aria-label="Settings">
            <baps-icon><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['settings'] --></span></baps-icon>
          </button>
      </div>
      <button type="button" class="baps-navbar__mobile-button" aria-label="Close menu" aria-expanded="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </button>
    </nav>
  </baps-navbar>
</div>`,
    react: `${SETUP}

import { useState } from 'react';
import { BapsNavbar } from '@org/ui-kit-react';

export function MobileBar() {
  const [mobileOpen, setMobileOpen] = useState(true);

  return (
    <BapsNavbar
      brand="sampark"
      title="Sampark"
      version="DEV"
      menuButton
      mobileMenuOpen={mobileOpen}
      onMobileMenuToggle={setMobileOpen}
      end={
        <>
          <button type="button" aria-label="Notifications">
            <Glyph name="notification" />
          </button>
          <button type="button" aria-label="Settings">
            <Glyph name="settings" />
          </button>
        </>
      }
    />
  );
}`,
    next: `'use client';

${SETUP}

export { MobileBar as default } from './MobileBar';`,
  },

  // Chevron rotation. menuOpen drives the ICON and nothing else — the sidebar
  // is the consumer's state, pushed back through (menuToggle). The component
  // never opens anything itself.
  //
  // Keep the class and aria-expanded in step. The class paints the rotation;
  // aria-expanded is what a screen reader actually reads. Setting one without
  // the other looks correct and announces the wrong thing.
  SamparkMenuStates: {
    primeng: `<div class="baps-ds-sampark" style="display:flex;flex-direction:column;gap:1.5rem;">
  <baps-navbar brand="sampark" title="Sampark" [menuButton]="true" [menuOpen]="false" />
  <baps-navbar brand="sampark" title="Sampark" [menuButton]="true" [menuOpen]="true" />
</div>`,
    custom: `<div class="baps-ds-sampark" style="display:flex;flex-direction:column;gap:1.5rem;">
  <baps-navbar class="baps-sampark">
    <nav class="baps-navbar" aria-label="Main navigation">
      <div class="baps-navbar__start">
        <span class="baps-navbar__title">Sampark</span>
        <button type="button" class="baps-navbar__menu-button" aria-label="Expand menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      </div>
      <div class="baps-navbar__center"></div>
      <div class="baps-navbar__end">
      </div>
      <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </button>
    </nav>
  </baps-navbar>
  <baps-navbar class="baps-sampark baps-navbar-menu-open">
    <nav class="baps-navbar" aria-label="Main navigation">
      <div class="baps-navbar__start">
        <span class="baps-navbar__title">Sampark</span>
        <button type="button" class="baps-navbar__menu-button" aria-label="Collapse menu" aria-expanded="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      </div>
      <div class="baps-navbar__center"></div>
      <div class="baps-navbar__end">
      </div>
      <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </button>
    </nav>
  </baps-navbar>
</div>`,
    react: `${SETUP}

import { useState } from 'react';
import { BapsNavbar } from '@org/ui-kit-react';

export function MenuStates() {
  const [open, setOpen] = useState(false);

  return (
    <BapsNavbar
      brand="sampark"
      title="Sampark"
      menuButton
      menuOpen={open}
      onMenuToggle={setOpen}
    />
  );
}`,
    next: `'use client';

${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export default function MenuStates({ open, onToggle }) {
  return (
    <BapsNavbar
      brand="sampark"
      title="Sampark"
      menuButton
      menuOpen={open}
      onMenuToggle={onToggle}
    />
  );
}`,
  },

  // topbarTheme is the second axis and it is independent of brand: the bar is
  // still Sampark, just the light variant. Two classes stack on the host,
  // which is why the CSS can key the light rules off .baps-sampark and
  // .baps-navbar-topbar-light together without a third scope.
  SamparkLightTopbar: {
    primeng: `<div class="baps-ds-sampark">
  <baps-navbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0" />
</div>`,
    custom: `<div class="baps-ds-sampark">
  <baps-navbar class="baps-sampark baps-navbar-topbar-light">
    <nav class="baps-navbar" aria-label="Main navigation">
      <div class="baps-navbar__start">
        <span class="baps-navbar__title">Sampark</span>
        <span class="baps-navbar__version">v1.1.0</span>
      </div>
      <div class="baps-navbar__center"></div>
      <div class="baps-navbar__end">
      </div>
      <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </button>
    </nav>
  </baps-navbar>
</div>`,
    react: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export function LightTopbar() {
  return (
    <div className="baps-ds-sampark">
      <BapsNavbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0" />
    </div>
  );
}`,
    next: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export default function LightTopbar() {
  return (
    <div className="baps-ds-sampark">
      <BapsNavbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0" />
    </div>
  );
}`,
  },

  // The two themes side by side. Only the host class differs between them —
  // identical markup otherwise, which is the point of the example.
  SamparkTopbarThemes: {
    primeng: `<div class="baps-ds-sampark" style="display:flex;flex-direction:column;gap:1.5rem;">
  <baps-navbar brand="sampark" topbarTheme="indigo" title="Sampark" version="v1.1.0" [menuButton]="true" />
  <baps-navbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0" [menuButton]="true" />
</div>`,
    custom: `<div class="baps-ds-sampark" style="display:flex;flex-direction:column;gap:1.5rem;">
  <baps-navbar class="baps-sampark">
    <nav class="baps-navbar" aria-label="Main navigation">
      <div class="baps-navbar__start">
        <span class="baps-navbar__title">Sampark</span>
        <span class="baps-navbar__version">v1.1.0</span>
        <button type="button" class="baps-navbar__menu-button" aria-label="Expand menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      </div>
      <div class="baps-navbar__center"></div>
      <div class="baps-navbar__end">
      </div>
      <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </button>
    </nav>
  </baps-navbar>
  <baps-navbar class="baps-sampark baps-navbar-topbar-light">
    <nav class="baps-navbar" aria-label="Main navigation">
      <div class="baps-navbar__start">
        <span class="baps-navbar__title">Sampark</span>
        <span class="baps-navbar__version">v1.1.0</span>
        <button type="button" class="baps-navbar__menu-button" aria-label="Expand menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      </div>
      <div class="baps-navbar__center"></div>
      <div class="baps-navbar__end">
      </div>
      <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </button>
    </nav>
  </baps-navbar>
</div>`,
    react: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export function TopbarThemes() {
  return (
    <div className="baps-ds-sampark" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <BapsNavbar brand="sampark" topbarTheme="indigo" title="Sampark" version="v1.1.0" menuButton />
      <BapsNavbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0" menuButton />
    </div>
  );
}`,
    next: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export default function TopbarThemes() {
  return (
    <div className="baps-ds-sampark" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <BapsNavbar brand="sampark" topbarTheme="indigo" title="Sampark" version="v1.1.0" menuButton />
      <BapsNavbar brand="sampark" topbarTheme="light" title="Sampark" version="v1.1.0" menuButton />
    </div>
  );
}`,
  },

  // The MyBKY bar: white, 56px, no chevron. brand="mybky" is the default, so
  // the host carries NO class — the white bar is what you get for free and
  // the dark Sampark bar is the opt-in. Easy to read backwards.
  MyBky: {
    primeng: `<baps-navbar brand="mybky" title="Member Database">
  <button navbar-end type="button" aria-label="Notifications">
    <baps-icon name="notification" />
  </button>
</baps-navbar>`,
    custom: `<baps-navbar>
  <nav class="baps-navbar" aria-label="Main navigation">
    <div class="baps-navbar__start">
      <span class="baps-navbar__title">Member Database</span>
    </div>
    <div class="baps-navbar__center"></div>
    <div class="baps-navbar__end">
      <button type="button" aria-label="Notifications">
        <baps-icon><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['notification'] --></span></baps-icon>
      </button>
    </div>
    <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
    </button>
  </nav>
</baps-navbar>`,
    react: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export function MyBkyTopbar() {
  return (
    <BapsNavbar
      title="Member Database"
      end={
        <button type="button" aria-label="Notifications">
          <Glyph name="notification" />
        </button>
      }
    />
  );
}`,
    next: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export default function MyBkyTopbar() {
  return (
    <BapsNavbar
      title="Member Database"
      end={
        <button type="button" aria-label="Notifications">
          <Glyph name="notification" />
        </button>
      }
    />
  );
}`,
  },

  // The reference render, matched against a screenshot of the running app:
  // dark 50px bar, Sampark wordmark, v1.1.0 badge, user block beside a square
  // avatar. No chevron — slim-plus hides the menu button at >=768px, so the
  // desktop bar has none.
  //
  // TWO scopes are in play and they are not the same thing. The stories wrap
  // the bar in .baps-ds-sampark, which re-points the token layer for a whole
  // subtree; brand="sampark" puts .baps-sampark on the bar itself. An app that
  // is Sampark throughout sets the wrapper once, high up, and still passes
  // brand on each component.
  Sampark: {
    primeng: `<div class="baps-ds-sampark">
  <baps-navbar brand="sampark" title="Sampark" version="v1.1.0">
    <span navbar-end>
      <span>System Admin 8</span>
      <span>North America</span>
    </span>
    <baps-avatar navbar-end brand="sampark" size="m" label="HP" />
  </baps-navbar>
</div>`,
    custom: `<div class="baps-ds-sampark">
  <baps-navbar class="baps-sampark">
    <nav class="baps-navbar" aria-label="Main navigation">
      <div class="baps-navbar__start">
        <span class="baps-navbar__title">Sampark</span>
        <span class="baps-navbar__version">v1.1.0</span>
      </div>
      <div class="baps-navbar__center"></div>
      <div class="baps-navbar__end">
        <span>
          <span>System Admin 8</span>
          <span>North America</span>
        </span>
      </div>
      <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
      </button>
    </nav>
  </baps-navbar>
</div>`,
    react: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export function SamparkTopbar() {
  return (
    <div className="baps-ds-sampark">
      <BapsNavbar
        brand="sampark"
        title="Sampark"
        version="v1.1.0"
        end={
          <span>
            <span>System Admin 8</span>
            <span>North America</span>
          </span>
        }
      />
    </div>
  );
}`,
    next: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export default function SamparkTopbar() {
  return (
    <div className="baps-ds-sampark">
      <BapsNavbar
        brand="sampark"
        title="Sampark"
        version="v1.1.0"
        end={
          <span>
            <span>System Admin 8</span>
            <span>North America</span>
          </span>
        }
      />
    </div>
  );
}`,
  },

  // The controls story. Worth reading for what it does NOT set: `brand` is
  // absent from the meta's args, so it falls back to the component default
  // 'mybky' and the host carries no scope class — the "Sampark" wordmark here
  // is just the title string, not the brand.
  Playground: {
    primeng: `<baps-navbar title="Sampark" version="v1.1.0" (menuToggle)="onMenuToggle($event)">
  <span navbar-end>
    <span>System Admin 8</span>
    <span>North America</span>
  </span>
  <baps-avatar navbar-end size="m" label="HP" />
</baps-navbar>`,
    custom: `<!-- Projected content lands INSIDE the slot. In Angular you write
     <span navbar-end> as a child of <baps-navbar> and Angular moves it into
     .baps-navbar__end; here you put it there yourself.

     <baps-avatar> is a PrimeNG wrapper with no raw-markup equivalent, so it
     is not reproduced — supply your own avatar in that slot. The mobile
     button is always rendered and the CSS hides it above 767px.

     The buttons carry pRipple in Angular. Raw markup loses the splash on
     press and nothing else: the styling is identical. -->
<baps-navbar>
  <nav class="baps-navbar" aria-label="Main navigation">
    <div class="baps-navbar__start">
      <span class="baps-navbar__title">Sampark</span>
      <span class="baps-navbar__version">v1.1.0</span>
    </div>
    <div class="baps-navbar__center"></div>
    <div class="baps-navbar__end">
      <span>
        <span>System Admin 8</span>
        <span>North America</span>
      </span>
    </div>
    <button type="button" class="baps-navbar__mobile-button" aria-label="Open menu" aria-expanded="false">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
    </button>
  </nav>
</baps-navbar>`,
    react: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export function Topbar({ onMenuToggle }) {
  return (
    <BapsNavbar
      title="Sampark"
      version="v1.1.0"
      onMenuToggle={onMenuToggle}
      end={
        <span>
          <span>System Admin 8</span>
          <span>North America</span>
        </span>
      }
    />
  );
}`,
    next: `${SETUP}

import { BapsNavbar } from '@org/ui-kit-react';

export default function Topbar() {
  return (
    <BapsNavbar
      title="Sampark"
      version="v1.1.0"
      end={
        <span>
          <span>System Admin 8</span>
          <span>North America</span>
        </span>
      }
    />
  );
}`,
  },
};
