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
 * ## The two examples with no snippets, and why
 *
 * HtmlCss and HtmlCssTypes are the only displayed examples on this page with
 * no framework set. They are not an oversight: both exist to demonstrate the
 * `.baps-avatar-html` partial, which is the very thing the audit measured and
 * rejected — 0 Sampark rules and 0 dark rules against the component's 36 and
 * 8. Writing React and Next snippets for them would document a partial this
 * page already declines to expose as a Custom tab.
 *
 * They are recorded for deletion with the rest of the option B work. Until
 * that lands, the honest state of this page is 13 of 15, not 15 of 15.
 *
 * ## Inputs to markup
 *
 * React and Next use the typed BapsAvatar and BapsAvatarGroup exports. The
 * PrimeNG-Angular tab keeps the existing custom-element API unchanged.
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

const SETUP = `${setupFor('avatar', false, '@org/ui-kit-react/styles')}

import { BapsAvatar, BapsAvatarGroup } from '@org/ui-kit-react';`;

export const avatarSnippets: Record<string, SnippetSet> = {
  // The stack at each step. The overlap scales with the avatars, so the group
  // reads the same at every size. baps-avatargroup takes the size too: it is
  // what sets the overlap, and leaving it off gives a row of avatars that
  // happen to sit next to each other.
  MyBkyGroupSizes: {
    primeng: `<!-- sizes is a field on your component: ['xs', 's', 'm', 'l', 'xl', '2xl'].
     The story declares it as a Storybook prop; an app declares it on the class. -->
<div style="display:flex; flex-direction:column; gap:20px; align-items:flex-start;">
  @for (size of sizes; track size) {
    <div style="display:flex; align-items:center; gap:16px;">
      <baps-avatargroup [size]="size">
        <baps-avatar [size]="size" shape="circle" label="RW" />
        <baps-avatar [size]="size" shape="circle" label="SP" />
        <baps-avatar [size]="size" shape="circle" label="DG" />
        <baps-avatar [size]="size" shape="circle" label="GD" />
        <baps-avatar [size]="size" shape="circle" label="+2" />
      </baps-avatargroup>
    </div>
  }
</div>`,
    react: `${SETUP}

const SIZES = ['xs', 's', 'm', 'l', 'xl', '2xl'];

export function MyBkyGroupSizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <BapsAvatarGroup size={size}>
            <BapsAvatar size={size} shape="circle" label="RW" />
            <BapsAvatar size={size} shape="circle" label="SP" />
            <BapsAvatar size={size} shape="circle" label="DG" />
            <BapsAvatar size={size} shape="circle" label="GD" />
            <BapsAvatar size={size} shape="circle" label="+2" />
          </BapsAvatarGroup>
        </div>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

const SIZES = ['xs', 's', 'm', 'l', 'xl', '2xl'];

export default function MyBkyGroupSizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <BapsAvatarGroup size={size}>
            <BapsAvatar size={size} shape="circle" label="RW" />
            <BapsAvatar size={size} shape="circle" label="SP" />
            <BapsAvatar size={size} shape="circle" label="DG" />
            <BapsAvatar size={size} shape="circle" label="GD" />
            <BapsAvatar size={size} shape="circle" label="+2" />
          </BapsAvatarGroup>
        </div>
      ))}
    </div>
  );
}`,
  },

  // The Sampark stack at each step — squares overlapping rather than circles.
  SamparkGroupSizes: {
    primeng: `<!-- sizes is a field on your component: ['xs', 's', 'm', 'l', 'xl', '2xl'].
     The story declares it as a Storybook prop; an app declares it on the class. -->
<div style="display:flex; flex-direction:column; gap:20px; align-items:flex-start;">
  @for (size of sizes; track size) {
    <div style="display:flex; align-items:center; gap:16px;">
      <baps-avatargroup [size]="size">
        <baps-avatar brand="sampark" [size]="size" shape="square" label="RW" />
        <baps-avatar brand="sampark" [size]="size" shape="square" label="SP" />
        <baps-avatar brand="sampark" [size]="size" shape="square" label="DG" />
        <baps-avatar brand="sampark" [size]="size" shape="square" label="GD" />
        <baps-avatar brand="sampark" [size]="size" shape="square" label="+2" />
      </baps-avatargroup>
    </div>
  }
</div>`,
    react: `${SETUP}

const SIZES = ['xs', 's', 'm', 'l', 'xl', '2xl'];

export function SamparkGroupSizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <BapsAvatarGroup size={size} brand="sampark">
            <BapsAvatar brand="sampark" size={size} shape="square" label="RW" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="SP" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="DG" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="GD" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="+2" />
          </BapsAvatarGroup>
        </div>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

const SIZES = ['xs', 's', 'm', 'l', 'xl', '2xl'];

export default function SamparkGroupSizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <BapsAvatarGroup size={size} brand="sampark">
            <BapsAvatar brand="sampark" size={size} shape="square" label="RW" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="SP" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="DG" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="GD" />
            <BapsAvatar brand="sampark" size={size} shape="square" label="+2" />
          </BapsAvatarGroup>
        </div>
      ))}
    </div>
  );
}`,
  },

  // The MyBKY variant matrix: three content shapes (initials, icon, photo)
  // crossed with the variant ramp, all at the l step.
  //
  // The story reaches this with a nested @for and a three-way @if on the
  // content shape. In React the same thing is a pair of maps over two arrays,
  // which is why the data sits in constants above the component rather than
  // in the markup.
  //
  // The photo row points at a remote demo image. In an app that is your own
  // asset path, and the avatar still needs an accessible name — the component
  // renders an <img> whose alt text is yours to supply.
  MyBkyStatuses: {
    primeng: `<!-- rows and variants are fields on your component:
       rows = [{ content: 'initial' }, { content: 'icon' }, { content: 'image' }]
       variants = ['primary', 'secondary', 'warning', 'success', 'error', 'info'] -->
<div style="display:flex; flex-direction:column; gap:14px;">
  @for (row of rows; track row.content) {
    <div style="display:flex; gap:16px; align-items:center;">
      @for (v of variants; track v) {
        @if (row.content === 'initial') {
          <baps-avatar label="GP" [variant]="v" size="l" />
        } @else if (row.content === 'icon') {
          <baps-avatar [variant]="v" size="l">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </baps-avatar>
        } @else {
          <baps-avatar [variant]="v" size="l" image="/assets/users/amyelsner.png" />
        }
      }
    </div>
  }
</div>`,
    react: `${SETUP}

const VARIANTS = ['primary', 'secondary', 'warning', 'success', 'error', 'info'];
const SHAPES = ['initial', 'icon', 'image'];

/* The Lucide user glyph at stroke-width 1.75, which is what
   design-language.md specifies. */
function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

export function MyBkyStatuses() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {SHAPES.map((shape) => (
        <div key={shape} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {VARIANTS.map((variant) =>
            shape === 'initial' ? (
              <BapsAvatar key={variant} label="GP" variant={variant} size="l" />
            ) : shape === 'icon' ? (
              <BapsAvatar key={variant} variant={variant} size="l" aria-hidden>
                <UserIcon />
              </BapsAvatar>
            ) : (
              <BapsAvatar
                key={variant}
                variant={variant}
                size="l"
                image="/assets/users/amyelsner.png"
                imageAlt="Amy Elsner"
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': this is markup. Put the image under /public and Next serves
   it from the same path. */
const VARIANTS = ['primary', 'secondary', 'warning', 'success', 'error', 'info'];
const SHAPES = ['initial', 'icon', 'image'];

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

export default function MyBkyStatuses() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {SHAPES.map((shape) => (
        <div key={shape} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {VARIANTS.map((variant) =>
            shape === 'initial' ? (
              <BapsAvatar key={variant} label="GP" variant={variant} size="l" />
            ) : shape === 'icon' ? (
              <BapsAvatar key={variant} variant={variant} size="l" aria-hidden>
                <UserIcon />
              </BapsAvatar>
            ) : (
              <BapsAvatar
                key={variant}
                variant={variant}
                size="l"
                image="/assets/users/amyelsner.png"
                imageAlt="Amy Elsner"
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}`,
  },

  // The meta's own args at the MyBKY defaults: initials in a circle. The
  // other inputs are at their defaults and are left off rather than written
  // out — size="m" and variant="primary" are what the component already does.
  HtmlCss: {},
  MyBkyPlayground: {
    primeng: `<baps-avatar label="AT" shape="circle" />`,
    react: `${SETUP}

export function Example() {
  return (
    <BapsAvatar label="AT" shape="circle" />
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <BapsAvatar label="AT" shape="circle" />
  );
}`,
  },

  // The same playground under the second brand. Square is Sampark's shape,
  // circle is MyBKY's; both are available on either through the shape input.
  // brand="sampark" scopes one instance — a whole page uses .baps-ds-sampark
  // on an ancestor instead.
  SamparkPlayground: {
    primeng: `<baps-avatar brand="sampark" label="AT" variant="primary" shape="square" />`,
    react: `${SETUP}

export function Example() {
  return (
    <BapsAvatar brand="sampark" label="AT" variant="primary" shape="square" />
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <BapsAvatar brand="sampark" label="AT" variant="primary" shape="square" />
  );
}`,
  },

  // Initials, an icon, and a photo. The icon is a Lucide user glyph at
  // stroke-width 1.75, which is what design-language.md specifies.
  Types: {
    primeng: `    <div style="display:flex; gap: 16px; align-items: center;">
      <baps-avatar label="AT" shape="circle" />
      <baps-avatar shape="circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="5" />
  <path d="M20 21a8 8 0 0 0-16 0" />
</svg></baps-avatar>
      <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
    </div>`,
    react: `${SETUP}

export function Example() {
  return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <BapsAvatar label="AT" shape="circle" />
          <BapsAvatar shape="circle" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" shape="circle" />
        </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <BapsAvatar label="AT" shape="circle" />
          <BapsAvatar shape="circle" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" shape="circle" />
        </div>
  );
}`,
  },

  // The six MyBKY steps. Size is an input, not a class — the component sets
  // its box from the step, and the initials scale with it.
  Sizes: {
    primeng: `<div style="display:flex; gap: 16px; align-items: center;">
  <baps-avatar label="XS" shape="circle" size="xs" />
  <baps-avatar label="S" shape="circle" size="s" />
  <baps-avatar label="M" shape="circle" />
  <baps-avatar label="L" shape="circle" size="l" />
  <baps-avatar label="XL" shape="circle" size="xl" />
  <baps-avatar label="2X" shape="circle" size="2xl" />
</div>`,
    react: `${SETUP}

export function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar label="XS" shape="circle" size="xs" />
      <BapsAvatar label="S" shape="circle" size="s" />
      <BapsAvatar label="M" shape="circle" />
      <BapsAvatar label="L" shape="circle" size="l" />
      <BapsAvatar label="XL" shape="circle" size="xl" />
      <BapsAvatar label="2X" shape="circle" size="2xl" />
    </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar label="XS" shape="circle" size="xs" />
      <BapsAvatar label="S" shape="circle" size="s" />
      <BapsAvatar label="M" shape="circle" />
      <BapsAvatar label="L" shape="circle" size="l" />
      <BapsAvatar label="XL" shape="circle" size="xl" />
      <BapsAvatar label="2X" shape="circle" size="2xl" />
    </div>
  );
}`,
  },

  // Circle against square on the same component. The brand default is circle
  // under MyBKY and square under Sampark; the input overrides either.
  Shapes: {
    primeng: `<div style="display:flex; gap: 16px; align-items: center;">
  <baps-avatar label="AT" shape="circle" size="large" />
  <baps-avatar label="AT" shape="square" size="large" />
</div>`,
    react: `${SETUP}

export function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar label="AT" shape="circle" size="large" />
      <BapsAvatar label="AT" shape="square" size="large" />
    </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar label="AT" shape="circle" size="large" />
      <BapsAvatar label="AT" shape="square" size="large" />
    </div>
  );
}`,
  },

  // Sampark's four combinations: initials and icon, each primary and
  // secondary. Primary is the filled maroon; secondary is the muted pair.
  SamparkVariants: {
    primeng: `    <div style="display:grid; grid-template-columns:repeat(4, max-content); gap:20px 28px; align-items:center;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark" label="GP" />
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark" label="GP" variant="secondary" />
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="5" />
  <path d="M20 21a8 8 0 0 0-16 0" />
</svg></baps-avatar>
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark" variant="secondary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="5" />
  <path d="M20 21a8 8 0 0 0-16 0" />
</svg></baps-avatar>
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark" variant="success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="5" />
  <path d="M20 21a8 8 0 0 0-16 0" />
</svg></baps-avatar>
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark" variant="error"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="5" />
  <path d="M20 21a8 8 0 0 0-16 0" />
</svg></baps-avatar>
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark" image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" />
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <baps-avatar brand="sampark" label="GP" variant="warning" />
      </div>
    </div>`,
    react: `${SETUP}

export function Example() {
  return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: '20px 28px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" label="GP" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" label="GP" variant="secondary" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" variant="secondary" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" variant="success" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" variant="error" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" label="GP" variant="warning" />
          </div>
        </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, max-content)', gap: '20px 28px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" label="GP" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" label="GP" variant="secondary" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" variant="secondary" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" variant="success" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" variant="error" aria-hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg></BapsAvatar>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <BapsAvatar brand="sampark" label="GP" variant="warning" />
          </div>
        </div>
  );
}`,
  },

  // The same six steps under Sampark. The boxes differ from MyBKY's — this is
  // the brand's own ramp, not MyBKY's recoloured.
  SamparkSizes: {
    primeng: `<div style="display:flex; gap: 16px; align-items: center;">
  <baps-avatar brand="sampark" label="XS" size="xs" />
  <baps-avatar brand="sampark" label="S" size="s" />
  <baps-avatar brand="sampark" label="GP" />
  <baps-avatar brand="sampark" label="GP" size="l" />
  <baps-avatar brand="sampark" label="GP" size="xl" />
  <baps-avatar brand="sampark" label="GP" size="2xl" />
</div>`,
    react: `${SETUP}

export function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar brand="sampark" label="XS" size="xs" />
      <BapsAvatar brand="sampark" label="S" size="s" />
      <BapsAvatar brand="sampark" label="GP" />
      <BapsAvatar brand="sampark" label="GP" size="l" />
      <BapsAvatar brand="sampark" label="GP" size="xl" />
      <BapsAvatar brand="sampark" label="GP" size="2xl" />
    </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar brand="sampark" label="XS" size="xs" />
      <BapsAvatar brand="sampark" label="S" size="s" />
      <BapsAvatar brand="sampark" label="GP" />
      <BapsAvatar brand="sampark" label="GP" size="l" />
      <BapsAvatar brand="sampark" label="GP" size="xl" />
      <BapsAvatar brand="sampark" label="GP" size="2xl" />
    </div>
  );
}`,
  },

  // Status dot (top-right) and icon badge (bottom-right), each sized per step
  // with a white ring. Sampark-only: MyBKY anchors counts and status with
  // baps-overlaybadge instead.
  //
  // Both are decorative as written. An indicator that carries meaning — "this
  // person is online" — needs text beside it or an aria-label on the avatar,
  // or it announces nothing.
  SamparkIndicators: {
    primeng: `<div style="display:flex; gap: 16px; align-items: center;">
  <baps-avatar brand="sampark" label="GP" size="xs" [statusDot]="true" />
  <baps-avatar brand="sampark" label="GP" [statusDot]="true" />
  <baps-avatar brand="sampark" label="GP" [iconBadge]="true" />
  <baps-avatar brand="sampark" label="GP" [statusDot]="true" [iconBadge]="true" />
  <baps-avatar brand="sampark" label="GP" size="xl" [statusDot]="true" [iconBadge]="true" />
</div>`,
    react: `${SETUP}

export function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar brand="sampark" label="GP" size="xs" statusDot />
      <BapsAvatar brand="sampark" label="GP" statusDot />
      <BapsAvatar brand="sampark" label="GP" iconBadge />
      <BapsAvatar brand="sampark" label="GP" statusDot iconBadge />
      <BapsAvatar brand="sampark" label="GP" size="xl" statusDot iconBadge />
    </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <BapsAvatar brand="sampark" label="GP" size="xs" statusDot />
      <BapsAvatar brand="sampark" label="GP" statusDot />
      <BapsAvatar brand="sampark" label="GP" iconBadge />
      <BapsAvatar brand="sampark" label="GP" statusDot iconBadge />
      <BapsAvatar brand="sampark" label="GP" size="xl" statusDot iconBadge />
    </div>
  );
}`,
  },

  // Stacked avatars for compact multi-user contexts: attendees, assignees.
  // The overlap is the group's own layout, not a per-avatar modifier.
  MyBkyGroup: {
    primeng: `<baps-avatargroup [size]="size">
  <baps-avatar [image]="image || 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'" shape="circle" [variant]="variant" />
  <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" shape="circle" [variant]="variant" />
  <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" shape="circle" [variant]="variant" />
  <baps-avatar label="+3" shape="circle" [variant]="variant" />
</baps-avatargroup>`,
    react: `${SETUP}

export function Example() {
  return (
    <BapsAvatarGroup size="m" aria-label="Members">
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" shape="circle" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" imageAlt="Asiya Javayant" shape="circle" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" imageAlt="Onyama Limba" shape="circle" />
      <BapsAvatar label="+3" shape="circle" />
    </BapsAvatarGroup>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <BapsAvatarGroup size="m" aria-label="Members">
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" shape="circle" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" imageAlt="Asiya Javayant" shape="circle" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" imageAlt="Onyama Limba" shape="circle" />
      <BapsAvatar label="+3" shape="circle" />
    </BapsAvatarGroup>
  );
}`,
  },

  // The same stack under Sampark, where the squares overlap rather than the
  // circles.
  SamparkGroup: {
    primeng: `<baps-avatargroup [size]="size">
  <baps-avatar [image]="image || 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'" shape="square" [variant]="variant" brand="sampark" />
  <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" shape="square" [variant]="variant" brand="sampark" />
  <baps-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" shape="square" [variant]="variant" brand="sampark" />
  <baps-avatar label="+3" shape="square" [variant]="variant" brand="sampark" />
</baps-avatargroup>`,
    react: `${SETUP}

export function Example() {
  return (
    <BapsAvatarGroup size="m" brand="sampark" aria-label="Members">
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" shape="square" brand="sampark" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" imageAlt="Asiya Javayant" shape="square" brand="sampark" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" imageAlt="Onyama Limba" shape="square" brand="sampark" />
      <BapsAvatar label="+3" shape="square" brand="sampark" />
    </BapsAvatarGroup>
  );
}`,
    next: `${SETUP}

/* No 'use client': an avatar is markup. */
export default function Example() {
  return (
    <BapsAvatarGroup size="m" brand="sampark" aria-label="Members">
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" imageAlt="Amy Elsner" shape="square" brand="sampark" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png" imageAlt="Asiya Javayant" shape="square" brand="sampark" />
      <BapsAvatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png" imageAlt="Onyama Limba" shape="square" brand="sampark" />
      <BapsAvatar label="+3" shape="square" brand="sampark" />
    </BapsAvatarGroup>
  );
}`,
  },
};
