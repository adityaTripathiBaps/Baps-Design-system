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
  // A labelled switch, which the component treats as the norm rather than the
  // exception — a bare track beside loose text is the thing that needs a
  // reason.
  //
  // The label's TYPOGRAPHY is the one piece raw markup does not inherit.
  // Measured: the rule is `baps-toggleswitch .p-toggleswitch-label`, anchored
  // to the Angular element and PrimeNG's class name, so it is part of the
  // wrapper path and not the standalone one. The markup below therefore wraps
  // the switch in a real <label> and leaves its type to the app, which is what
  // a consumer wants anyway — their form labels already have a style.
  //
  // Wrapping in <label> rather than using [for] is deliberate: it needs no id,
  // so it survives being rendered twice on a page, and clicking the text still
  // toggles the switch.
  WithLabel: {
    primeng: `<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
  <baps-toggleswitch [(ngModel)]="notifications" label="Email notifications" />
  <baps-toggleswitch [(ngModel)]="sms" label="SMS notifications" />
  <baps-toggleswitch [(ngModel)]="locked" label="Managed by your admin" [disabled]="true" />
</div>`,
    custom: `<div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
  <label style="display:flex; align-items:center; gap:8px;">
    <span class="baps-toggle-switch">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
    Email notifications
  </label>
  <label style="display:flex; align-items:center; gap:8px;">
    <span class="baps-toggle-switch">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
    SMS notifications
  </label>
  <label style="display:flex; align-items:center; gap:8px;">
    <span class="baps-toggle-switch">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked disabled />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
    Managed by your admin
  </label>
</div>`,
    react: `${SETUP}

import { useState } from 'react';

const ROWS = [
  { label: 'Email notifications', initial: true },
  { label: 'SMS notifications', initial: false },
  { label: 'Managed by your admin', initial: true, disabled: true },
];

export function LabelledSwitches() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {ROWS.map((r) => (
        <Row key={r.label} {...r} />
      ))}
    </div>
  );
}

function Row({ label, initial, disabled = false }) {
  const [on, setOn] = useState(initial);

  /* The <label> wraps the input, so no id and no htmlFor — one less thing to
     keep unique when the row renders more than once on a page. */
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="baps-toggle-switch">
        <input
          type="checkbox"
          role="switch"
          className="baps-toggle-switch__input"
          checked={on}
          disabled={disabled}
          onChange={(e) => setOn(e.target.checked)}
        />
        <span className="baps-toggle-switch__track" aria-hidden="true">
          <span className="baps-toggle-switch__thumb" />
        </span>
      </span>
      {label}
    </label>
  );
}`,
    next: `'use client';

${SETUP}

/* Each row owns a boolean, so this is a client component. Lift the values to
   a form action if the server needs them on submit — the markup does not
   change. */
export { LabelledSwitches as default } from './LabelledSwitches';`,
  },

  // Sampark runs one size SMALLER than MyBKY, so the rail starts at xs — and
  // xs is the one step with no standalone rule. Measured: the partial defines
  // --s and --l only, while xs lives in _switch-sampark.scss as
  // `baps-toggleswitch.baps-sampark.baps-switch-xs`, anchored to the Angular
  // element and PrimeNG's class rather than the BEM block.
  //
  // So the Custom tab below shows sm, md and lg and stops there. Writing an
  // xs row would render at md size while looking deliberate, which is worse
  // than three honest rows. The drift guard checks indices 1-3 for the same
  // reason. Giving xs a standalone rule is a design decision, not a
  // mechanical one.
  SamparkSizes: {
    primeng: `<div style="display:flex; gap: 24px; align-items: center;">
  <baps-toggleswitch brand="sampark" size="xs" [(ngModel)]="a" />
  <baps-toggleswitch brand="sampark" size="sm" [(ngModel)]="b" />
  <baps-toggleswitch brand="sampark" [(ngModel)]="c" />
  <baps-toggleswitch brand="sampark" size="lg" [(ngModel)]="d" />
</div>`,
    custom: `<!-- sm, md and lg. xs is omitted deliberately — see the note above. -->
<div style="display:flex; gap: 24px; align-items: center;">
  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    sm
    <span class="baps-toggle-switch baps-sampark baps-toggle-switch--s">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    md
    <span class="baps-toggle-switch baps-sampark">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    lg
    <span class="baps-toggle-switch baps-sampark baps-toggle-switch--l">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
</div>`,
    react: `${SETUP}

import { useState } from 'react';

/* Three sizes, not four: xs has no standalone rule. The brand is a class on
   the BEM block here, not a wrapper — baps-sampark sits beside
   baps-toggle-switch, so no ref is needed and className works normally. */
const SIZES = [
  ['sm', ' baps-toggle-switch--s'],
  ['md', ''],
  ['lg', ' baps-toggle-switch--l'],
];

export function SamparkSizes() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {SIZES.map(([name, cls]) => (
        <Switch key={name} label={name} sizeClass={cls} />
      ))}
    </div>
  );
}

function Switch({ label, sizeClass }) {
  const [on, setOn] = useState(true);

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {label}
      <span className={'baps-toggle-switch baps-sampark' + sizeClass}>
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
    </label>
  );
}`,
    next: `'use client';

${SETUP}

/* Identical to the React version — only the state makes this a client
   component. Import it rather than keeping a copy that can drift. */
export { SamparkSizes as default } from './SamparkSizes';`,
  },

  // One switch, nothing set. Worth having because it is the shape every other
  // example varies: a native checkbox with role="switch", a track, a thumb.
  //
  // role="switch" rather than a plain checkbox is what makes a screen reader
  // say "on"/"off" instead of "checked"/"unchecked". Keyboard support — Space
  // to toggle, Tab to reach — comes from the native input and needs no code.
  Playground: {
    primeng: `<baps-toggleswitch [(ngModel)]="checked" />`,
    custom: `  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    Off
    <span class="baps-toggle-switch">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>`,
    react: `${SETUP}

import { useState } from 'react';

/* The checked state lives on the input, not in a class: a sibling selector
   moves the thumb and repaints the track, so there is nothing to toggle. That
   makes a controlled React switch a plain checkbox with role="switch". */
export function ToggleSwitch() {
  const [on, setOn] = useState(false);

  return (
      <span className={'baps-toggle-switch' + ''}>
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
  );
}`,
    next: `'use client';

${SETUP}

import { useState } from 'react';

/* The checked state lives on the input, not in a class: a sibling selector
   moves the thumb and repaints the track, so there is nothing to toggle. That
   makes a controlled React switch a plain checkbox with role="switch". */
export default function ToggleSwitch() {
  const [on, setOn] = useState(false);

  return (
      <span className={'baps-toggle-switch' + ''}>
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
  );
}`,
  },

  // Three sizes. md is the default and carries no modifier, which is the part
  // worth noticing — the ramp is --s, nothing, --l, not three classes.
  Sizes: {
    primeng: `<div style="display:flex; gap: 24px; align-items: center;">
  <baps-toggleswitch size="sm" [(ngModel)]="a" />
  <baps-toggleswitch [(ngModel)]="b" />
  <baps-toggleswitch size="lg" [(ngModel)]="c" />
</div>`,
    custom: `<div style="display:flex; gap: 24px; align-items: center;">
  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    sm
    <span class="baps-toggle-switch baps-toggle-switch--s">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    md
    <span class="baps-toggle-switch">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
  <label style="display:flex; flex-direction:column; gap:8px; align-items:center">
    lg
    <span class="baps-toggle-switch baps-toggle-switch--l">
      <input type="checkbox" role="switch" class="baps-toggle-switch__input" checked />
      <span class="baps-toggle-switch__track" aria-hidden="true">
        <span class="baps-toggle-switch__thumb"></span>
      </span>
    </span>
  </label>
</div>`,
    react: `${SETUP}

import { useState } from 'react';

/* The checked state lives on the input, not in a class: a sibling selector
   moves the thumb and repaints the track, so there is nothing to toggle. That
   makes a controlled React switch a plain checkbox with role="switch". */
export function Sizes() {
  const SIZES = [
    ['sm', ' baps-toggle-switch--s'],
    ['md', ''],
    ['lg', ' baps-toggle-switch--l'],
  ];

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {SIZES.map(([name, cls]) => (
        <Switch key={name} label={name} sizeClass={cls} />
      ))}
    </div>
  );
}

function Switch({ label, sizeClass }) {
  const [on, setOn] = useState(true);

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {label}
      <span className={'baps-toggle-switch' + sizeClass}>
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
    </label>
  );
}`,
    next: `'use client';

${SETUP}

import { useState } from 'react';

/* The checked state lives on the input, not in a class: a sibling selector
   moves the thumb and repaints the track, so there is nothing to toggle. That
   makes a controlled React switch a plain checkbox with role="switch". */
export default function Sizes() {
  const SIZES = [
    ['sm', ' baps-toggle-switch--s'],
    ['md', ''],
    ['lg', ' baps-toggle-switch--l'],
  ];

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {SIZES.map(([name, cls]) => (
        <Switch key={name} label={name} sizeClass={cls} />
      ))}
    </div>
  );
}`,
  },

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
