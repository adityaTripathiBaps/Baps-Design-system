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

import { useCallback, useState } from 'react';

export function MobileBar() {
  const [mobileOpen, setMobileOpen] = useState(true);

  const ref = useCallback(
    (el) => {
      if (el) {
        el.setAttribute(
          'class',
          'baps-sampark' + (mobileOpen ? ' baps-navbar-mobile-open' : ''),
        );
      }
    },
    [mobileOpen],
  );

  return (
    <baps-navbar ref={ref}>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Sampark</span>
          <span className="baps-navbar__version">DEV</span>
          <button type="button" className="baps-navbar__menu-button" aria-label="Expand menu" aria-expanded={false}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end">
          <button type="button" aria-label="Notifications">
            <Glyph name="notification" />
          </button>
          <button type="button" aria-label="Settings">
            <Glyph name="settings" />
          </button>
        </div>
        {/* Always rendered — the CSS hides it above 767px, so there is no
            viewport check to write and nothing to keep in sync. */}
        <button
          type="button"
          className="baps-navbar__mobile-button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </nav>
    </baps-navbar>
  );
}`,
    next: `'use client';

${SETUP}

/* Byte for byte the React component above — the only Next-specific part is
   that the open/closed boolean needs 'use client'. Import it rather than
   keeping a second copy that can drift. */
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

import { useCallback, useState } from 'react';

export function MenuStates() {
  const [open, setOpen] = useState(false);

  /* The host class is state here, not a constant, so 'open' is in the ref's
     dependency list — React re-runs a ref callback when its identity changes,
     and without the dependency the bar would keep its first class forever. */
  const ref = useCallback(
    (el) => {
      if (el) el.setAttribute('class', 'baps-sampark' + (open ? ' baps-navbar-menu-open' : ''));
    },
    [open],
  );

  return (
    <baps-navbar ref={ref}>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Sampark</span>
          <button
            type="button"
            className="baps-navbar__menu-button"
            aria-label={open ? 'Collapse menu' : 'Expand menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end" />
      </nav>
    </baps-navbar>
  );
}`,
    next: `'use client';

${SETUP}

import { useCallback } from 'react';

/* 'use client' because the bar reflects a boolean. Own it in the layout if
   the sidebar needs the same value — this component only reflects it. */
export default function MenuStates({ open, onToggle }) {
  const ref = useCallback(
    (el) => {
      if (el) el.setAttribute('class', 'baps-sampark' + (open ? ' baps-navbar-menu-open' : ''));
    },
    [open],
  );

  return (
    <baps-navbar ref={ref}>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Sampark</span>
          <button
            type="button"
            className="baps-navbar__menu-button"
            aria-label={open ? 'Collapse menu' : 'Expand menu'}
            aria-expanded={open}
            onClick={() => onToggle(!open)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end" />
      </nav>
    </baps-navbar>
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

import { useCallback } from 'react';

/* Both classes go on in one setAttribute. React 18 does not map className
   onto a custom element, and a half-applied brand renders the wrong bar
   silently rather than failing. */
export function LightTopbar() {
  const ref = useCallback((el) => {
    if (el) el.setAttribute('class', 'baps-sampark baps-navbar-topbar-light');
  }, []);

  return (
    <div className="baps-ds-sampark">
      <baps-navbar ref={ref}>
        <nav className="baps-navbar" aria-label="Main navigation">
          <div className="baps-navbar__start">
            <span className="baps-navbar__title">Sampark</span>
            <span className="baps-navbar__version">v1.1.0</span>
          </div>
          <div className="baps-navbar__center" />
          <div className="baps-navbar__end" />
        </nav>
      </baps-navbar>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

import { useCallback } from 'react';

export default function LightTopbar() {
  const ref = useCallback((el) => {
    if (el) el.setAttribute('class', 'baps-sampark baps-navbar-topbar-light');
  }, []);

  return (
    <div className="baps-ds-sampark">
      <baps-navbar ref={ref}>
        <nav className="baps-navbar" aria-label="Main navigation">
          <div className="baps-navbar__start">
            <span className="baps-navbar__title">Sampark</span>
            <span className="baps-navbar__version">v1.1.0</span>
          </div>
          <div className="baps-navbar__center" />
          <div className="baps-navbar__end" />
        </nav>
      </baps-navbar>
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

import { useCallback } from 'react';

/* The whole difference between the two bars is this one class string, and it
   has to go on through a ref: React 18 does not map className onto a custom
   element. */
function Bar({ hostClass, title = 'Sampark', version = 'v1.1.0' }) {
  const ref = useCallback((el) => {
    if (el) el.setAttribute('class', hostClass);
  }, [hostClass]);

  return (
    <baps-navbar ref={ref}>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">{title}</span>
          <span className="baps-navbar__version">{version}</span>
          <button type="button" className="baps-navbar__menu-button" aria-label="Expand menu" aria-expanded={false}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end" />
      </nav>
    </baps-navbar>
  );
}

/* One component, one prop. The themes differ by a single class, so anything
   more than this is ceremony. */
const THEMES = ['baps-sampark', 'baps-sampark baps-navbar-topbar-light'];

export function TopbarThemes() {
  return (
    <div className="baps-ds-sampark" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {THEMES.map((cls) => (
        <Bar key={cls} hostClass={cls} />
      ))}
    </div>
  );
}`,
    next: `${SETUP}

/* Bar needs 'use client' for its ref, so it lives in its own file and this
   page stays a server component. Shown inline here to keep the example in
   one place. */
import { useCallback } from 'react';

/* The whole difference between the two bars is this one class string, and it
   has to go on through a ref: React 18 does not map className onto a custom
   element. */
function Bar({ hostClass, title = 'Sampark', version = 'v1.1.0' }) {
  const ref = useCallback((el) => {
    if (el) el.setAttribute('class', hostClass);
  }, [hostClass]);

  return (
    <baps-navbar ref={ref}>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">{title}</span>
          <span className="baps-navbar__version">{version}</span>
          <button type="button" className="baps-navbar__menu-button" aria-label="Expand menu" aria-expanded={false}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end" />
      </nav>
    </baps-navbar>
  );
}

const THEMES = ['baps-sampark', 'baps-sampark baps-navbar-topbar-light'];

export default function TopbarThemes() {
  return (
    <div className="baps-ds-sampark" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {THEMES.map((cls) => (
        <Bar key={cls} hostClass={cls} />
      ))}
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

export function MyBkyTopbar() {
  return (
    <baps-navbar>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Member Database</span>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end">
          <button type="button" aria-label="Notifications">
            <Glyph name="notification" />
          </button>
        </div>
      </nav>
    </baps-navbar>
  );
}`,
    next: `${SETUP}

/* No 'use client' — nothing here holds state. */
export default function MyBkyTopbar() {
  return (
    <baps-navbar>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Member Database</span>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end">
          <button type="button" aria-label="Notifications">
            <Glyph name="notification" />
          </button>
        </div>
      </nav>
    </baps-navbar>
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

import { useCallback } from 'react';

export function SamparkTopbar() {
  /* className does not reach a custom element's class attribute in React 18 —
     measured: the class came back null while an inline style landed fine. The
     dark bar is scoped to baps-navbar.baps-sampark, so without this the bar
     renders white and nothing says so. */
  const brandRef = useCallback((el) => {
    if (el) el.setAttribute('class', 'baps-sampark');
  }, []);

  return (
    <div className="baps-ds-sampark">
      <baps-navbar ref={brandRef}>
        <nav className="baps-navbar" aria-label="Main navigation">
          <div className="baps-navbar__start">
            <span className="baps-navbar__title">Sampark</span>
            <span className="baps-navbar__version">v1.1.0</span>
          </div>
          <div className="baps-navbar__center" />
          <div className="baps-navbar__end">
            <span>
              <span>System Admin 8</span>
              <span>North America</span>
            </span>
          </div>
        </nav>
      </baps-navbar>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

import { useCallback } from 'react';

/* 'use client' only for the ref that sets the brand class. If your app is
   Sampark everywhere, put .baps-ds-sampark on <body> in the root layout and
   this stays the one client boundary. */
export default function SamparkTopbar() {
  const brandRef = useCallback((el) => {
    if (el) el.setAttribute('class', 'baps-sampark');
  }, []);

  return (
    <baps-navbar ref={brandRef}>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Sampark</span>
          <span className="baps-navbar__version">v1.1.0</span>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end">
          <span>
            <span>System Admin 8</span>
            <span>North America</span>
          </span>
        </div>
      </nav>
    </baps-navbar>
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

export function Topbar({ onMenuToggle }) {
  return (
    <baps-navbar>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Sampark</span>
          <span className="baps-navbar__version">v1.1.0</span>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end">
          <span>
            <span>System Admin 8</span>
            <span>North America</span>
          </span>
        </div>
        <button
          type="button"
          className="baps-navbar__mobile-button"
          aria-label="Open menu"
          aria-expanded={false}
          onClick={onMenuToggle}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
        </button>
      </nav>
    </baps-navbar>
  );
}`,
    next: `${SETUP}

/* No 'use client': the bar is markup. Add it only once you hang state off the
   menu button, which the MenuStates example below does. */
export default function Topbar() {
  return (
    <baps-navbar>
      <nav className="baps-navbar" aria-label="Main navigation">
        <div className="baps-navbar__start">
          <span className="baps-navbar__title">Sampark</span>
          <span className="baps-navbar__version">v1.1.0</span>
        </div>
        <div className="baps-navbar__center" />
        <div className="baps-navbar__end">
          <span>
            <span>System Admin 8</span>
            <span>North America</span>
          </span>
        </div>
      </nav>
    </baps-navbar>
  );
}`,
  },
};
