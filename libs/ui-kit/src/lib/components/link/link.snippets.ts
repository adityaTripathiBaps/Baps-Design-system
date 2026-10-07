/**
 * Framework snippets for the Link docs page, keyed by story export name.
 *
 * `baps-link` is not a PrimeNG wrapper — its template is a single `<a>` and its
 * CSS has no `.p-*` selector — so this is the card/alert shape rather than the
 * button one: the Custom tab is the SAME markup the Angular component renders,
 * and `styles/components/link/_link.scss` (moved out of the component, byte for
 * byte) is what styles it when Angular is not there.
 *
 * ## Inputs become classes
 *
 * Every input is a host class binding, so outside Angular you write the class
 * the binding would have added:
 *
 *   variant="primary"    -> class="baps-link--primary"
 *   variant="secondary"  -> class="baps-link--secondary"
 *   size="small"         -> class="baps-link-sm"
 *   size="large"         -> class="baps-link-lg"
 *   size="xlarge"        -> class="baps-link-xl"
 *   brand="sampark"      -> class="baps-sampark"
 *   [disabled]="true"    -> class="baps-link--disabled" ON THE ANCHOR, plus
 *                           aria-disabled and tabindex="-1"
 *
 * `disabled` is the one that is not on the host: the component puts it on the
 * inner `<a>`, because the disabled rule has to outrank the brand colour rules
 * and those are anchored there. Copy all three parts — an anchor that only
 * LOOKS disabled is still focusable and still navigates.
 *
 * Size is unset by default and inherits the surrounding font-size, which is why
 * the Sizes example sets `font-size: 20px` on its container and one link reads
 * "inherits 20px".
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

/** Stated once; the same loads sit behind every snippet on this page. */
const SETUP = `${setupFor('link', false, '@org/ui-kit-react/styles')}

import { BapsLink } from '@org/ui-kit-react';`;

const anchor = (cls: string, text: string, href = '#') =>
  `  <baps-link class="${cls}"><a class="baps-link__anchor" href="${href}">${text}</a></baps-link>`;

export const linkSnippets: Record<string, SnippetSet> = {
  // The meta's own args: one primary link opening in a new tab. Two attributes
  // on the raw side are added by the component rather than typed by its caller,
  // and both are load-bearing rather than cosmetic:
  //
  //   rel="noopener noreferrer"   bound to target === '_blank'. Without it the
  //                               opened page gets a window.opener handle back
  //                               into yours.
  //   tabindex="0"                bound to the disabled state; an <a href> is
  //                               already focusable, so this matters for the
  //                               disabled case, where it becomes -1.
  //
  // Outside Angular nothing adds them for you, so they are written out here.
  Default: {
    custom: `<baps-link class="baps-link--primary">
  <a
    class="baps-link__anchor"
    href="https://example.com"
    target="_blank"
    rel="noopener noreferrer"
    tabindex="0"
    >Click here to view more details</a
  >
</baps-link>`,
    react: `${SETUP}

export function Example() {
  return (
    <BapsLink href="https://example.com" target="_blank">
      Click here to view more details
    </BapsLink>
  );
}`,
    next: `${SETUP}

export default function Example() {
  return (
    <BapsLink href="/details">Click here to view more details</BapsLink>
  );
}`,
    primeng: `<baps-link href="https://example.com" target="_blank" variant="primary">
  Click here to view more details
</baps-link>`,
  },

  Variants: {
    primeng: `<div style="display:flex; gap:32px;">
  <baps-link href="#" variant="primary">Primary link</baps-link>
  <baps-link href="#" variant="secondary">Secondary link</baps-link>
</div>`,
    custom: `<!-- baps-link stays as the outer element: every selector in _link.scss is
     anchored to it, so a bare <a> would be unstyled. It is an unregistered
     custom element here — no Angular needed. -->
<div style="display:flex; gap:32px;">
${anchor('baps-link--primary', 'Primary link')}
${anchor('baps-link--secondary', 'Secondary link')}
</div>`,
    react: `${SETUP}

export function Variants() {
  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <BapsLink href="#">Primary link</BapsLink>
      <BapsLink href="#" variant="secondary">Secondary link</BapsLink>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function Variants() {
  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <BapsLink href="#">Primary link</BapsLink>
      <BapsLink href="#" variant="secondary">Secondary link</BapsLink>
    </div>
  );
}`,
  },

  Sizes: {
    primeng: `<!-- Size is unset by default and inherits the surrounding font-size. -->
<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start; font-size:20px;">
  <baps-link href="#" size="small">Small — 12px</baps-link>
  <baps-link href="#" size="large">Large — 14px</baps-link>
  <baps-link href="#" size="xlarge">XLarge — 16px</baps-link>
  <baps-link href="#">Unsized — inherits 20px</baps-link>
</div>`,
    custom: `<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start; font-size:20px;">
${anchor('baps-link-sm', 'Small — 12px')}
${anchor('baps-link-lg', 'Large — 14px')}
${anchor('baps-link-xl', 'XLarge — 16px')}
${anchor('', 'Unsized — inherits 20px')}
</div>`,
    react: `${SETUP}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', fontSize: 20 }}>
      <BapsLink href="#" size="small">Small — 12px</BapsLink>
      <BapsLink href="#" size="large">Large — 14px</BapsLink>
      <BapsLink href="#" size="xlarge">XLarge — 16px</BapsLink>
      <BapsLink href="#">Unsized — inherits 20px</BapsLink>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function Sizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', fontSize: 20 }}>
      <BapsLink href="#" size="small">Small — 12px</BapsLink>
      <BapsLink href="#" size="large">Large — 14px</BapsLink>
      <BapsLink href="#" size="xlarge">XLarge — 16px</BapsLink>
      <BapsLink href="#">Unsized — inherits 20px</BapsLink>
    </div>
  );
}`,
  },

  Disabled: {
    primeng: `<!-- Both brands, both variants. Disabled removes the href as well as the
     colour — the component drops it, so the anchor cannot navigate. -->
<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
  <div style="display:flex; gap:32px;">
    <baps-link brand="sampark" variant="primary" [disabled]="true">Sampark primary</baps-link>
    <baps-link brand="sampark" variant="secondary" [disabled]="true">Sampark secondary</baps-link>
  </div>
  <div style="display:flex; gap:32px;">
    <baps-link brand="mybky" variant="primary" [disabled]="true">MyBKY primary</baps-link>
    <baps-link brand="mybky" variant="secondary" [disabled]="true">MyBKY secondary</baps-link>
  </div>
</div>`,
    custom: `<!-- Disabled is THREE things, and all three matter: the class carries the
     colour, aria-disabled carries the meaning, and no href plus tabindex="-1"
     is what actually stops it navigating and takes it out of the tab order. A
     link that only looks disabled is still focusable and still works. -->
<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
  <div style="display:flex; gap:32px;">
    <baps-link class="baps-sampark baps-link--primary"><a class="baps-link__anchor baps-link--disabled" aria-disabled="true" tabindex="-1">Sampark primary</a></baps-link>
    <baps-link class="baps-sampark baps-link--secondary"><a class="baps-link__anchor baps-link--disabled" aria-disabled="true" tabindex="-1">Sampark secondary</a></baps-link>
  </div>
  <div style="display:flex; gap:32px;">
    <baps-link class="baps-link--primary"><a class="baps-link__anchor baps-link--disabled" aria-disabled="true" tabindex="-1">MyBKY primary</a></baps-link>
    <baps-link class="baps-link--secondary"><a class="baps-link__anchor baps-link--disabled" aria-disabled="true" tabindex="-1">MyBKY secondary</a></baps-link>
  </div>
</div>`,
    react: `${SETUP}

export function Disabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 32 }}>
        <BapsLink brand="sampark" disabled>Sampark primary</BapsLink>
        <BapsLink brand="sampark" variant="secondary" disabled>Sampark secondary</BapsLink>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <BapsLink disabled>MyBKY primary</BapsLink>
        <BapsLink variant="secondary" disabled>MyBKY secondary</BapsLink>
      </div>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function Disabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', gap: 32 }}>
        <BapsLink brand="sampark" disabled>Sampark primary</BapsLink>
        <BapsLink brand="sampark" variant="secondary" disabled>Sampark secondary</BapsLink>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <BapsLink disabled>MyBKY primary</BapsLink>
        <BapsLink variant="secondary" disabled>MyBKY secondary</BapsLink>
      </div>
    </div>
  );
}`,
  },
};
