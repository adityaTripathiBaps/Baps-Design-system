/**
 * Framework snippets for the Menu item docs page.
 *
 * ## Route A: a real Custom tab
 *
 * `baps-menu-item` wraps nothing. It renders its own `<div class="menu-item">`
 * and `menu-item.css` styles exactly that, so raw markup works unchanged —
 * no PrimeNG DOM, no runtime theme, no portal.
 *
 * ## Inputs become classes, with one exception
 *
 *   selected        .menu-item--selected
 *   severity=danger .menu-item--danger
 *   disabled        .menu-item--disabled
 *   subtitle        .menu-item--two-line, PLUS the subtitle span
 *   brand=sampark   .baps-sampark on the HOST element
 *
 * `subtitle` is the exception: it is the only input that changes both a class
 * and the markup, because a two-line row needs the extra height and the extra
 * element.
 *
 * `control` and `media` select which optional child renders — a check, a
 * radio, an icon or an avatar — rather than toggling a class.
 *
 * ## The bar is not decoration
 *
 * `.menu-item__bar` is always present and always first. It is the selected
 * indicator, drawn even when unselected so the row's text never shifts when
 * selection changes. Leave it out and every selected row jumps.
 *
 * Every control and the icon are `aria-hidden`: the row's accessible name is
 * its title, and a checkmark announced beside it would say the same thing
 * twice.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('menu-item', true);

export const menuItemSnippets: Record<string, SnippetSet> = {
  // Every variant together. Worth reading for what is independent of what:
  // control, media and severity combine freely, and only the subtitle changes
  // the markup as well as a class.
  AllVariants: {
    primeng: `<baps-menu-item brand="sampark" title="Notifications" subtitle="3 unread" control="checkbox" [checked]="true" />
<baps-menu-item brand="sampark" title="Delete account" severity="danger" media="icon" icon="pi-trash" />
<baps-menu-item brand="sampark" title="Archived" [disabled]="true" />`,
    custom: `<!-- brand="sampark" is a class on the HOST, not on .menu-item. -->
<baps-menu-item class="baps-sampark">
  <div class="menu-item menu-item--two-line">
    <span class="menu-item__bar"></span>
    <span class="menu-item__control menu-item__control--check is-checked" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
    <span class="menu-item__text">
      <span class="menu-item__title">Notifications</span>
      <span class="menu-item__subtitle">3 unread</span>
    </span>
  </div>
</baps-menu-item>

<baps-menu-item class="baps-sampark">
  <div class="menu-item menu-item--danger">
    <span class="menu-item__bar"></span>
    <i class="menu-item__icon pi pi-trash" aria-hidden="true"></i>
    <span class="menu-item__text">
      <span class="menu-item__title">Delete account</span>
    </span>
  </div>
</baps-menu-item>

<baps-menu-item class="baps-sampark">
  <div class="menu-item menu-item--disabled">
    <span class="menu-item__bar"></span>
    <span class="menu-item__text">
      <span class="menu-item__title">Archived</span>
    </span>
  </div>
</baps-menu-item>`,
    react: `${SETUP}

import { useCallback } from 'react';

const ITEMS = [
  { id: 'notify', title: 'Notifications', subtitle: '3 unread', checked: true },
  { id: 'delete', title: 'Delete account', icon: 'pi-trash', danger: true },
  { id: 'archived', title: 'Archived', disabled: true },
];

export function MenuItems({ onSelect }) {
  /* className does not reach a custom element's class attribute in React 18 —
     measured: the class came back null while an inline style landed fine. The
     Sampark scope is on the host, so it goes on through a ref. */
  const brandRef = useCallback((el) => {
    if (el) el.setAttribute('class', 'baps-sampark');
  }, []);

  return (
    <>
      {ITEMS.map((item) => (
        <baps-menu-item key={item.id} ref={brandRef}>
          <button
            type="button"
            className={[
              'menu-item',
              item.subtitle && 'menu-item--two-line',
              item.danger && 'menu-item--danger',
              item.disabled && 'menu-item--disabled',
            ]
              .filter(Boolean)
              .join(' ')}
            // The native attribute, not just the class: a class alone leaves
            // the row in the tab order and still clickable.
            disabled={item.disabled}
            onClick={() => onSelect(item.id)}
          >
            <span className="menu-item__bar" />
            {item.checked && (
              <span className="menu-item__control menu-item__control--check is-checked" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
            )}
            {item.icon && <i className={'menu-item__icon pi ' + item.icon} aria-hidden="true" />}
            <span className="menu-item__text">
              <span className="menu-item__title">{item.title}</span>
              {item.subtitle && <span className="menu-item__subtitle">{item.subtitle}</span>}
            </span>
          </button>
        </baps-menu-item>
      ))}
    </>
  );
}`,
    next: `'use client';

${SETUP}

/* Byte for byte the React component above — the brand ref is the only reason
   it needs 'use client'. Import it rather than keeping a copy that drifts. */
export { MenuItems as default } from './MenuItems';`,
  },

  // The controls story: one row, every knob reachable.
  MenuItemPlayground: {
    primeng: `<baps-menu-item title="Export as CSV" icon="pi-download" media="icon" />`,
    custom: `<baps-menu-item>
  <div class="menu-item">
    <!-- Always present, always first. This is the selected indicator; drawing
         it unselected too is what stops the text shifting when selection
         changes. -->
    <span class="menu-item__bar"></span>
    <i class="menu-item__icon pi pi-download" aria-hidden="true"></i>
    <span class="menu-item__text">
      <span class="menu-item__title">Export as CSV</span>
    </span>
  </div>
</baps-menu-item>`,
    react: `${SETUP}

export function ExportItem({ onSelect }) {
  // A row that does something is a button. role="menuitem" belongs here only
  // when the row actually sits inside a role="menu" container.
  return (
    <baps-menu-item>
      <button type="button" className="menu-item" onClick={onSelect}>
        <span className="menu-item__bar" />
        <i className="menu-item__icon pi pi-download" aria-hidden="true" />
        <span className="menu-item__text">
          <span className="menu-item__title">Export as CSV</span>
        </span>
      </button>
    </baps-menu-item>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' only for the click handler. A row that navigates should be a
   next/link instead, carrying the same classes. */
export default function ExportItem({ onSelect }) {
  return (
    <baps-menu-item>
      <button type="button" className="menu-item" onClick={onSelect}>
        <span className="menu-item__bar" />
        <i className="menu-item__icon pi pi-download" aria-hidden="true" />
        <span className="menu-item__text">
          <span className="menu-item__title">Export as CSV</span>
        </span>
      </button>
    </baps-menu-item>
  );
}`,
  },

  // The MyBKY set. Identical markup to Sampark; the only difference is the
  // absent host class, because MyBKY is the default and carries none.
  AllVariantsMyBKY: {
    primeng: `<baps-menu-item title="Notifications" subtitle="3 unread" control="checkbox" [checked]="true" />
<baps-menu-item title="Delete account" severity="danger" media="icon" icon="pi-trash" />`,
    custom: `<!-- No class on the host: MyBKY is the default, so Sampark is what gets
     added rather than MyBKY being selected. -->
<baps-menu-item>
  <div class="menu-item menu-item--two-line">
    <span class="menu-item__bar"></span>
    <span class="menu-item__control menu-item__control--check is-checked" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
    <span class="menu-item__text">
      <span class="menu-item__title">Notifications</span>
      <!-- A subtitle needs BOTH the span and --two-line: the class buys the
           height, the span carries the text. -->
      <span class="menu-item__subtitle">3 unread</span>
    </span>
  </div>
</baps-menu-item>`,
    react: `${SETUP}

/* No ref here: MyBKY adds no host class, so className on the inner elements
   is all this needs. */
export function MyBkyMenuItem({ onSelect }) {
  return (
    <baps-menu-item>
      <button type="button" className="menu-item menu-item--two-line" onClick={onSelect}>
        <span className="menu-item__bar" />
        <span className="menu-item__control menu-item__control--check is-checked" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <span className="menu-item__text">
          <span className="menu-item__title">Notifications</span>
          <span className="menu-item__subtitle">3 unread</span>
        </span>
      </button>
    </baps-menu-item>
  );
}`,
    next: `'use client';

${SETUP}

export default function MyBkyMenuItem({ onSelect }) {
  return (
    <baps-menu-item>
      <button type="button" className="menu-item menu-item--two-line" onClick={onSelect}>
        <span className="menu-item__bar" />
        <span className="menu-item__control menu-item__control--check is-checked" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </span>
        <span className="menu-item__text">
          <span className="menu-item__title">Notifications</span>
          <span className="menu-item__subtitle">3 unread</span>
        </span>
      </button>
    </baps-menu-item>
  );
}`,
  },

};
