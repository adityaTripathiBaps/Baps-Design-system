/**
 * Framework snippets for the Toggle switch docs page.
 *
 * ## Route A, and what that took
 *
 * This is a PrimeNG wrapper with an AUTHORED Custom tab, like Button and Tag.
 * It needed a standalone partial written first, because the one that existed —
 * `styles/components/toggle-switch/_switch.scss` — is the Angular-side skin:
 * every selector in it reads `baps-toggleswitch … .p-toggleswitch`, so it
 * styles the DOM PrimeNG renders and can never reach markup written by hand.
 * Measured, the packaged toggle-switch.css carried 33 `.p-*` selectors against
 * 28 `.baps-*` ones, none of which a consumer could use.
 *
 * `_toggle-switch-standalone.scss` is the other half, built from the published
 * tokens against values measured on the live component:
 *
 *   MyBKY    track 36 x 20 radius 99px · off rgb(141,155,165) · on
 *            rgb(95,120,184) · thumb 17 x 17 white radius 50%
 *   Sampark  track 36 x 22 radius 4px · off rgb(188,185,185) · on
 *            rgb(201,104,104) · disabled rgb(243,242,242) · thumb 18 x 18
 *            radius 2px
 *
 * Every one of those resolved to a token that already existed. Sampark
 * publishes no track-on/track-off pair of its own, so those two read the mono
 * and primary ramps the measurement landed on rather than new names invented
 * here. tools/check-toggle-switch-drift.mjs renders both sides and compares.
 *
 * ## The markup, and why it is an input
 *
 *   <span class="baps-toggle-switch">
 *     <input type="checkbox" role="switch" class="baps-toggle-switch__input">
 *     <span class="baps-toggle-switch__track" aria-hidden="true">
 *       <span class="baps-toggle-switch__thumb"></span>
 *     </span>
 *   </span>
 *
 * A native checkbox carries the state, the focus and the keyboard behaviour,
 * so this control WORKS before a line of JavaScript is written. That makes it
 * the one interactive component on this site whose React tab is not
 * markup-only: Space and Tab do the right thing because the platform does
 * them, not because Angular does.
 *
 * `role="switch"` is what makes it announce as a switch rather than a
 * checkbox. The input is visually hidden rather than `display: none`, because
 * a `display: none` input is unfocusable and drops out of the tab order.
 *
 * ## Inputs to classes
 *
 *   size="small"      -> class="baps-toggle-switch--s"
 *   size="large"      -> class="baps-toggle-switch--l"
 *   [disabled]="true" -> the native disabled attribute on the input
 *   brand="sampark"   -> class="baps-sampark" on the wrapper
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('toggle-switch');

/** One switch, in the markup every block below repeats. */
const sw = (
  label: string,
  { on = false, disabled = false, sampark = false, size = '' } = {},
) => {
  const cls = ['baps-toggle-switch', sampark ? 'baps-sampark' : null, size]
    .filter(Boolean)
    .join(' ');
  const attrs = [
    'type="checkbox"',
    'role="switch"',
    'class="baps-toggle-switch__input"',
  ]
    .concat(on ? ['checked'] : [])
    .concat(disabled ? ['disabled'] : [])
    .join(' ');
  return `  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    ${label}
    <span class="${cls}">
      <input ${attrs} />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>`;
};

const ROW = 'display:flex; gap: 24px; align-items: center;';

export const toggleSwitchSnippets: Record<string, SnippetSet> = {
  States: {
    primeng: `<div style="${ROW}">
  <baps-toggleswitch [(ngModel)]="off" />
  <baps-toggleswitch [(ngModel)]="on" />
  <baps-toggleswitch [(ngModel)]="offDisabled" [disabled]="true" />
  <baps-toggleswitch [(ngModel)]="onDisabled" [disabled]="true" />
</div>`,
    custom: `<!-- The checked state is the input's, not a class: a checked attribute on the input
     moves the thumb and repaints the track through a sibling selector, so
     nothing has to toggle a class. Disabled is the native attribute, which
     also takes the control out of the tab order for free. -->
<div style="${ROW}">
${sw('Off')}
${sw('On', { on: true })}
${sw('Off · disabled', { disabled: true })}
${sw('On · disabled', { on: true, disabled: true })}
</div>`,
    react: `${SETUP}

import { useState } from 'react';

/* Not markup-only. The native checkbox gives this Space, Tab and the focus
   ring without any JavaScript — React only has to hold the value. */
export function Example() {
  const [on, setOn] = useState(false);

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className="baps-toggle-switch">
        <input
          type="checkbox"
          role="switch"
          className="baps-toggle-switch__input"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
        />
        <span className="baps-toggle-switch__track" aria-hidden="true">
          <span className="baps-toggle-switch__thumb" />
        </span>
      </span>
      Email notifications
    </label>
  );
}`,
    next: `'use client';

${SETUP}

import { useState } from 'react';

/* 'use client' because the value changes. A switch rendered read-only — a
   settings summary, say — needs none of it. */
export default function Example() {
  const [on, setOn] = useState(false);

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span className="baps-toggle-switch">
        <input
          type="checkbox"
          role="switch"
          className="baps-toggle-switch__input"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
        />
        <span className="baps-toggle-switch__track" aria-hidden="true">
          <span className="baps-toggle-switch__thumb" />
        </span>
      </span>
      Email notifications
    </label>
  );
}`,
  },

  SamparkStates: {
    primeng: `<div style="${ROW}">
  <baps-toggleswitch brand="sampark" [(ngModel)]="off" />
  <baps-toggleswitch brand="sampark" [(ngModel)]="on" />
  <baps-toggleswitch brand="sampark" [(ngModel)]="offDisabled" [disabled]="true" />
  <baps-toggleswitch brand="sampark" [(ngModel)]="onDisabled" [disabled]="true" />
</div>`,
    custom: `<!-- Sampark is a different SHAPE, not a recolour: the track is square
     (4px radius) with an inset shadow and the thumb is a 2px-radius square
     rather than a circle. Per instance with baps-sampark, or put
     .baps-ds-sampark on an ancestor for a whole page. -->
<div style="${ROW}">
${sw('Off', { sampark: true })}
${sw('On', { on: true, sampark: true })}
${sw('Off · disabled', { disabled: true, sampark: true })}
${sw('On · disabled', { on: true, disabled: true, sampark: true })}
</div>`,
    react: `${SETUP}

import { useState } from 'react';

/* The only difference from the MyBKY block is the scope class. Nothing is
   imported per brand and no markup changes. */
export function SamparkSwitch() {
  const [on, setOn] = useState(false);

  return (
    <span className="baps-toggle-switch baps-sampark">
      <input
        type="checkbox"
        role="switch"
        aria-label="Email notifications"
        className="baps-toggle-switch__input"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
      />
      <span className="baps-toggle-switch__track" aria-hidden="true">
        <span className="baps-toggle-switch__thumb" />
      </span>
    </span>
  );
}`,
    next: `'use client';

${SETUP}

import { useState } from 'react';

export default function SamparkSwitch() {
  const [on, setOn] = useState(false);

  return (
    <span className="baps-toggle-switch baps-sampark">
      <input
        type="checkbox"
        role="switch"
        aria-label="Email notifications"
        className="baps-toggle-switch__input"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
      />
      <span className="baps-toggle-switch__track" aria-hidden="true">
        <span className="baps-toggle-switch__thumb" />
      </span>
    </span>
  );
}`,
  },
};
