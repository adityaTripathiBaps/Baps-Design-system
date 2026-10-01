/**
 * Framework snippets for the Avatar docs page.
 *
 * ## No Custom tab — a measured decision, not an omission
 *
 * Avatar is a PrimeNG wrapper, and an earlier version of this file carried a
 * third implementation of the design under `.baps-avatar-html` so a Custom tab
 * could show standalone markup. That partial was measured against the
 * component and does not match where it matters:
 *
 *   .baps-avatar-html   0 Sampark rules, 0 dark rules
 *   baps-avatar         36 Sampark rules, 8 dark rules
 *
 * Raw markup therefore renders the same under MyBKY, under
 * `.baps-ds-sampark` and under `.baps-dark` — measured in a browser, all three
 * identical — while the component changes. A Custom tab there would be a tab
 * claiming to BE the component, so the page hides it (`hideCustom`) and this
 * file offers the three tabs that document intent honestly.
 *
 * The key this file used to use, `htmlcss`, was not a framework key the docs
 * blocks ever read, so those two examples rendered no tab strip at all.
 * tools/check-snippets.mjs now rejects it.
 *
 * ## Inputs to markup
 *
 * React and Next show the same `<baps-avatar>` element the Angular template
 * does, because the element name is what the CSS keys off. The inputs map
 * straight across as attributes:
 *
 *   label="AT"                initials; the component renders them as text
 *   image="…"                 a photo; the component renders an <img> inside
 *   shape="circle | square"   default is circle under MyBKY
 *   size="xs | s | m | l | xl | 2xl"
 *   variant="primary | secondary | warning | success | error | info"
 *   brand="sampark"           one instance in the other brand; a whole page
 *                             uses the .baps-ds-sampark scope instead
 *
 * Accessibility stays with the markup, not the framework: an avatar that
 * identifies a person is an image with a name (`role="img"` plus
 * `aria-label`), and one sitting beside that person's name is decorative
 * (`aria-hidden="true"`), or the name is announced twice.
 */

import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('avatar');

export const avatarSnippets: Record<string, SnippetSet> = {
  MyBkyPlayground: {
    react: `${SETUP}

export function Example() {
  return (
    <baps-avatar label="AT" shape="circle" role="img" aria-label="Aditya Tripathi" />
  );
}`,
    next: `'use client';

${SETUP}

export default function Example() {
  return (
    <baps-avatar label="AT" shape="circle" role="img" aria-label="Aditya Tripathi" />
  );
}`,
    primeng: `<baps-avatar label="AT" shape="circle" ariaLabel="Aditya Tripathi" />`,
  },

  Types: {
    react: `export function AvatarTypes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {/* initials, named for assistive technology */}
      <baps-avatar label="AT" shape="circle" role="img" aria-label="Aditya Tripathi" />

      {/* icon beside a visible name — decorative, or the name is read twice */}
      <baps-avatar shape="circle" aria-hidden="true" />
      <span>Aditya Tripathi</span>

      {/* photo; the alt text lives on the image the component renders */}
      <baps-avatar
        image="/assets/users/aditya.png"
        shape="circle"
        role="img"
        aria-label="Aditya Tripathi"
      />
    </div>
  );
}`,
    next: `'use client';

export default function AvatarTypes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <baps-avatar label="AT" shape="circle" role="img" aria-label="Aditya Tripathi" />

      <baps-avatar shape="circle" aria-hidden="true" />
      <span>Aditya Tripathi</span>

      <baps-avatar
        image="/assets/users/aditya.png"
        shape="circle"
        role="img"
        aria-label="Aditya Tripathi"
      />
    </div>
  );
}`,
    primeng: `<div style="display: flex; gap: 16px; align-items: center">
  <baps-avatar label="AT" shape="circle" ariaLabel="Aditya Tripathi" />

  <baps-avatar shape="circle" aria-hidden="true" />
  <span>Aditya Tripathi</span>

  <baps-avatar image="/assets/users/aditya.png" shape="circle" ariaLabel="Aditya Tripathi" />
</div>`,
  },
};
