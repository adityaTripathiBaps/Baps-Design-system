/**
 * Framework snippets for the Internal navbar docs page.
 *
 * ## Proven standalone, and what it took
 *
 * `tools/check-standalone.mjs` reported this component as NOT standalone for
 * a long time: four differences across two elements. Three attempts went at it
 * as a layout problem and changed nothing.
 *
 * Dumping both sides element by element showed what the summary had hidden —
 * every box on the raw page was exactly ONE pixel wider. The nav carries
 * `border-width: 0 1px 0 0`; in Storybook that border sits inside the box, on
 * a bare page it sits outside, and every child inherited the shift. The cause
 * was a missing `box-sizing: border-box` reset, which Storybook supplies and
 * no ui-kit partial does. See `.agents/rules/app-shell-host-page.md`.
 *
 * With the reset, all seven elements match the live component on every
 * property. `_internal-navbar.scss` carries 105 rules and no `.p-*` selector
 * at all.
 *
 * ## Inputs become structure, not classes
 *
 * This is the first component on the site where the Angular inputs are not a
 * class map. `items` is an array the component expands into list rows, so
 * outside Angular you write the rows:
 *
 *   items           the <li> + <button> rows, written out or mapped
 *   activeItem      class="baps-internal-nav__item--active" on that row,
 *                   plus aria-current="page" on its button
 *   title           the optional __header / __title block
 *   collapsed       class="baps-internal-nav--collapsed" on the nav
 *   brand="sampark" class="baps-sampark" on the HOST element
 *
 * Every row is a real `<button type="button">`, not a div with a click
 * handler: it has to be reachable by keyboard and announced as actionable,
 * and the native element does both without help.
 *
 * ## The React detail that costs an hour
 *
 * `className` does not reach a custom element's class attribute in React 18.
 * Measured in a real app: `<baps-icon className="baps-internal-nav__icon">`
 * rendered with `class = null` while its inline `style` landed fine. The brand
 * class on `<baps-internal-navbar>` and the icon's layout class therefore go
 * on through a ref callback.
 *
 * Nothing warns you. The component still renders — it just renders in the
 * wrong skin, or without the layout rule, and looks close enough to pass.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('internal-navbar');

export const internalNavbarSnippets: Record<string, SnippetSet> = {
  // The Sampark rail: dark 72px tiles, icon over label, from the Sampark
  // Portal Figma (node 13197:89998). This is the shape both app shells use
  // for their sidebar.
  //
  // Three inputs do the work, and each lands somewhere different:
  //   brand="sampark"     class on the HOST element, not the nav
  //   [collapsed]="true"  class on the NAV element
  //   activeItem          a class on the row plus aria-current on its button
  //
  // Collapsed under Sampark still shows the label — that is the rail's whole
  // shape. Generic collapsed hides it, which is why the CSS keys the label's
  // display off the brand scope rather off collapsed alone.
  SamparkRail: {
    primeng: `<baps-internal-navbar brand="sampark" [collapsed]="true" [items]="items" activeItem="Settings" />

<!-- On the component:
     items = [
       { label: 'Dashboard', icon: 'pi-th-large' },
       { label: 'Reports', icon: 'pi-chart-bar', notification: true },
       { label: 'Settings', icon: 'pi-cog' },
     ] -->`,
    custom: `<baps-internal-navbar class="baps-sampark">
  <nav class="baps-internal-nav baps-internal-nav--collapsed" aria-label="Section navigation">
    <ul class="baps-internal-nav__list">
      <li class="baps-internal-nav__item">
        <button type="button" class="baps-internal-nav__link">
          <span class="baps-internal-nav__bar" aria-hidden="true"></span>
          <baps-icon class="baps-internal-nav__icon"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['pi-th-large'] --></span></baps-icon>
          <span class="baps-internal-nav__label">Dashboard</span>
        </button>
      </li>
      <li class="baps-internal-nav__item">
        <button type="button" class="baps-internal-nav__link">
          <span class="baps-internal-nav__bar" aria-hidden="true"></span>
          <baps-icon class="baps-internal-nav__icon"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['pi-chart-bar'] --></span></baps-icon>
          <span class="baps-internal-nav__label">Reports</span>
          <span class="baps-internal-nav__status-dot" aria-hidden="true"></span>
        </button>
      </li>
      <li class="baps-internal-nav__item baps-internal-nav__item--active">
        <button type="button" class="baps-internal-nav__link" aria-current="page">
          <span class="baps-internal-nav__bar" aria-hidden="true"></span>
          <baps-icon class="baps-internal-nav__icon"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['pi-cog'] --></span></baps-icon>
          <span class="baps-internal-nav__label">Settings</span>
        </button>
      </li>
    </ul>
    <div class="baps-internal-nav__footer"></div>
  </nav>
</baps-internal-navbar>`,
    react: `${SETUP}

import { useCallback } from 'react';

const NAV = [
  { label: 'Dashboard', icon: 'pi-th-large' },
  { label: 'Reports', icon: 'pi-chart-bar', notification: true },
  { label: 'Settings', icon: 'pi-cog' },
];

export function SamparkRail({ active = 'Settings', onSelect }) {
  /* className does NOT reach a custom element's class attribute in React 18 —
     measured: the class came back null while an inline style landed fine. The
     Sampark rail CSS is scoped under baps-internal-navbar.baps-sampark, so
     without this the rail renders in the generic skin and nothing says so. */
  const brandRef = useCallback((el) => {
    if (el) el.setAttribute('class', 'baps-sampark');
  }, []);

  return (
    <baps-internal-navbar ref={brandRef}>
      <nav
        className="baps-internal-nav baps-internal-nav--collapsed"
        aria-label="Section navigation"
      >
        <ul className="baps-internal-nav__list">
          {NAV.map((item) => (
            <li
              key={item.label}
              className={
                'baps-internal-nav__item' +
                (active === item.label ? ' baps-internal-nav__item--active' : '')
              }
            >
              {/* A real button: reachable by keyboard and announced as
                  actionable, both for free. */}
              <button
                type="button"
                className="baps-internal-nav__link"
                aria-current={active === item.label ? 'page' : undefined}
                onClick={() => onSelect(item.label)}
              >
                <span className="baps-internal-nav__bar" aria-hidden="true" />
                <Glyph name={item.icon} className="baps-internal-nav__icon" />
                <span className="baps-internal-nav__label">{item.label}</span>
                {item.notification && (
                  <span className="baps-internal-nav__status-dot" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
        <div className="baps-internal-nav__footer" />
      </nav>
    </baps-internal-navbar>
  );
}`,
    next: `'use client';

${SETUP}

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/* 'use client' for two reasons only: usePathname marks the active row, and
   the brand class needs a ref. The markup itself is static. */
const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: 'pi-th-large' },
  { label: 'Reports', href: '/reports', icon: 'pi-chart-bar', notification: true },
  { label: 'Settings', href: '/settings', icon: 'pi-cog' },
];

export default function SamparkRail() {
  const pathname = usePathname();
  const router = useRouter();

  const brandRef = useCallback((el) => {
    if (el) el.setAttribute('class', 'baps-sampark');
  }, []);

  return (
    <baps-internal-navbar ref={brandRef}>
      <nav
        className="baps-internal-nav baps-internal-nav--collapsed"
        aria-label="Section navigation"
      >
        <ul className="baps-internal-nav__list">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li
                key={item.href}
                className={
                  'baps-internal-nav__item' +
                  (active ? ' baps-internal-nav__item--active' : '')
                }
              >
                <button
                  type="button"
                  className="baps-internal-nav__link"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => router.push(item.href)}
                >
                  <span className="baps-internal-nav__bar" aria-hidden="true" />
                  <Glyph name={item.icon} className="baps-internal-nav__icon" />
                  <span className="baps-internal-nav__label">{item.label}</span>
                  {item.notification && (
                    <span className="baps-internal-nav__status-dot" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="baps-internal-nav__footer" />
      </nav>
    </baps-internal-navbar>
  );
}`,
  },

  // The meta's own story, and the simplest case: three links projected into
  // the component rather than passed as `items`. The nav chrome is the
  // component's; the anchors are yours.
  //
  // Projected content needs no list markup — the component's own <ul> stays
  // empty and the anchors sit beside it, which is why this example has no
  // __item or __link classes at all.
  Default: {
    primeng: `<baps-internal-navbar>
  <a href="#" class="active">Overview</a>
  <a href="#">Settings</a>
  <a href="#">Members</a>
</baps-internal-navbar>`,
    custom: `<!-- The nav element and its empty list are the component's structure; the
     anchors are projected, so they are written as-is. aria-current, not a
     class, is what a screen reader reads for "you are here" — the class only
     paints it. -->
<baps-internal-navbar>
  <nav class="baps-internal-nav" aria-label="Section navigation">
    <ul class="baps-internal-nav__list"></ul>
    <div class="baps-internal-nav__footer"></div>
  </nav>
  <a href="#" class="active" aria-current="page">Overview</a>
  <a href="#">Settings</a>
  <a href="#">Members</a>
</baps-internal-navbar>`,
    react: `${SETUP}

const LINKS = [
  ['Overview', true],
  ['Settings', false],
  ['Members', false],
];

export function Example() {
  return (
    <baps-internal-navbar>
      <nav className="baps-internal-nav" aria-label="Section navigation">
        <ul className="baps-internal-nav__list" />
        <div className="baps-internal-nav__footer" />
      </nav>
      {LINKS.map(([label, active]) => (
        <a
          key={label}
          href="#"
          className={active ? 'active' : undefined}
          aria-current={active ? 'page' : undefined}
        >
          {label}
        </a>
      ))}
    </baps-internal-navbar>
  );
}`,
    next: `${SETUP}

import Link from 'next/link';

/* No 'use client': the nav is markup, and next/link does the navigating.
   Derive the active item from usePathname in a client component if you need
   it to follow the route. */
const LINKS = [
  ['Overview', '/overview'],
  ['Settings', '/settings'],
  ['Members', '/members'],
];

export default function Example({ pathname = '/overview' }) {
  return (
    <baps-internal-navbar>
      <nav className="baps-internal-nav" aria-label="Section navigation">
        <ul className="baps-internal-nav__list" />
        <div className="baps-internal-nav__footer" />
      </nav>
      {LINKS.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? 'active' : undefined}
          aria-current={pathname === href ? 'page' : undefined}
        >
          {label}
        </Link>
      ))}
    </baps-internal-navbar>
  );
}`,
  },
};
