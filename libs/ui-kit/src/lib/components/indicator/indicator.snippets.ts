/**
 * Framework snippets for the Indicator docs page.
 *
 * ## Proven standalone
 *
 * `tools/check-standalone.mjs` renders the live story, strips Angular's own
 * attributes, puts that markup on a bare file:// page with only tokens.css and
 * the partials, and compares computed styles element by element. Indicator
 * passes on both its elements, every property.
 *
 * `_indicator.scss` carries no `.p-*` selector: the component wraps nothing
 * from PrimeNG, so the markup Angular renders is the markup anyone can write.
 *
 * ## Inputs become classes
 *
 *   severity="error"   -> class="baps-indicator--error"
 *                         grey | primary | info | success | warning | error
 *                         grey is the Status Dot neutral; primary is Icon
 *                         Badge only.
 *   size="m"           -> class="baps-indicator--m"
 *                         s 12px · m 16px · l 20px · xl 24px
 *   [ring]="true"      -> class="baps-indicator--ring"
 *   [text]="true"      -> class="baps-indicator--text"
 *   [disabled]="true"  -> class="baps-indicator--disabled"
 *                         the muted fill, whatever the severity says
 *
 * ## The one thing that is not a class
 *
 * Accessibility, and it works the same way icon's does. The component binds
 * `role` and `aria-label` from the `ariaLabel` input, and hides the inner span
 * when there is none:
 *
 *   ariaLabel set     role="status" on the host, aria-label on the host
 *   ariaLabel unset   aria-hidden="true" on .baps-indicator__inner
 *
 * A dot that means something — "3 unread", "online" — needs the label or it
 * announces nothing. A dot beside text that already says it is decorative, and
 * labelling it reads the same thing twice.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('indicator');

export const indicatorSnippets: Record<string, SnippetSet> = {
  // Counts rather than a bare dot: [text]="true" switches the fill to the one
  // sized for a number, and the number is projected content.
  //
  // A count that a user acts on is NOT decorative. Give the host an
  // aria-label saying what it counts — "3 unread notifications" — or a screen
  // reader gets the digit with no noun.
  NotificationCounts: {
    primeng: `<div style="display:flex; align-items:center; gap:1rem">
  @for (sz of sizes; track sz) {
    <baps-indicator severity="error" [size]="sz" [text]="true" ariaLabel="3 unread notifications">3</baps-indicator>
  }
</div>

<!-- On the component: sizes = ['s','m','l','xl'] -->`,
    custom: `<!-- role and aria-label are on the HOST; the inner span loses its
     aria-hidden the moment the indicator carries a label, or the count would
     be announced and then hidden. -->
<div style="display:flex; align-items:center; gap:1rem">
  <baps-indicator class="baps-indicator--error baps-indicator--s baps-indicator--text" role="status" aria-label="3 unread notifications"><span class="baps-indicator__inner">3</span></baps-indicator>
  <baps-indicator class="baps-indicator--error baps-indicator--m baps-indicator--text" role="status" aria-label="3 unread notifications"><span class="baps-indicator__inner">3</span></baps-indicator>
  <baps-indicator class="baps-indicator--error baps-indicator--l baps-indicator--text" role="status" aria-label="3 unread notifications"><span class="baps-indicator__inner">3</span></baps-indicator>
  <baps-indicator class="baps-indicator--error baps-indicator--xl baps-indicator--text" role="status" aria-label="3 unread notifications"><span class="baps-indicator__inner">3</span></baps-indicator>
</div>`,
    react: `${SETUP}

const SIZES = ['s', 'm', 'l', 'xl'];

export function NotificationCounts({ count = 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {SIZES.map((size) => (
        <Indicator
          key={size}
          severity="error"
          size={size}
          text
          label={count + ' unread notifications'}
        >
          {count}
        </Indicator>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

const SIZES = ['s', 'm', 'l', 'xl'];

export default function NotificationCounts({ count = 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {SIZES.map((size) => (
        <Indicator
          key={size}
          severity="error"
          size={size}
          text
          label={count + ' unread notifications'}
        >
          {count}
        </Indicator>
      ))}
    </div>
  );
}`,
  },

  // The same component with a glyph projected into it instead of a number.
  // Note the severity list differs from StatusDot's: primary is Icon Badge
  // only, and grey is Status Dot only.
  //
  // The glyph is the consumer's own SVG, drawn at stroke-width 3 because an
  // indicator is small enough that the icon set's 1.75 disappears. It is
  // aria-hidden: the badge's meaning belongs on the host, not on the path.
  IconBadge: {
    primeng: `<div style="display:flex; align-items:center; gap:1rem">
  @for (sz of sizes; track sz) {
    <baps-indicator severity="success" [size]="sz">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </baps-indicator>
  }
</div>

<!-- On the component: sizes = ['m','l','xl'] — the s step is too small for a
     glyph, which is why Icon Badge starts at m. -->`,
    custom: `<div style="display:flex; align-items:center; gap:1rem">
  <baps-indicator class="baps-indicator--success baps-indicator--m">
    <span class="baps-indicator__inner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  </baps-indicator>
  <baps-indicator class="baps-indicator--success baps-indicator--l">
    <span class="baps-indicator__inner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  </baps-indicator>
  <baps-indicator class="baps-indicator--success baps-indicator--xl">
    <span class="baps-indicator__inner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  </baps-indicator>
</div>`,
    react: `${SETUP}

const SIZES = ['m', 'l', 'xl'];

/* stroke-width 3, not the icon set's 1.75: an indicator is small enough that
   the thinner stroke disappears. */
const Tick = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export function IconBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {SIZES.map((size) => (
        <Indicator key={size} severity="success" size={size}>
          <Tick />
        </Indicator>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

const SIZES = ['m', 'l', 'xl'];

const Tick = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function IconBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {SIZES.map((size) => (
        <Indicator key={size} severity="success" size={size}>
          <Tick />
        </Indicator>
      ))}
    </div>
  );
}`,
  },

  // Five severities down, four sizes across. These are decorative in the
  // story — a grid showing the fills — so none carries a label. A dot used to
  // mean "online" or "3 unread" in an app takes one.
  //
  // The story's caption colour is hardcoded hex, which is story chrome; this
  // uses the token it came from.
  StatusDot: {
    primeng: `<div style="display:flex; flex-direction:column; gap:0.75rem">
  @for (sev of sevs; track sev) {
    <div style="display:flex; align-items:center; gap:1rem">
      @for (sz of sizes; track sz) {
        <baps-indicator [severity]="sev" [size]="sz" />
      }
      <span style="font-size:12px; color: var(--color-sampark-mono-80)">{{ sev }}</span>
    </div>
  }
</div>

<!-- On the component: sevs = ['success','error','info','warning','grey'],
     sizes = ['s','m','l','xl'] -->`,
    custom: `<div style="display:flex; flex-direction:column; gap:0.75rem">
  <div style="display:flex; align-items:center; gap:1rem">
    <baps-indicator class="baps-indicator--success baps-indicator--s"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--success baps-indicator--m"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--success baps-indicator--l"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--success baps-indicator--xl"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <span style="font-size:12px; color: var(--color-sampark-mono-80)">success</span>
  </div>
  <div style="display:flex; align-items:center; gap:1rem">
    <baps-indicator class="baps-indicator--error baps-indicator--s"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--error baps-indicator--m"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--error baps-indicator--l"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--error baps-indicator--xl"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <span style="font-size:12px; color: var(--color-sampark-mono-80)">error</span>
  </div>
  <div style="display:flex; align-items:center; gap:1rem">
    <baps-indicator class="baps-indicator--info baps-indicator--s"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--info baps-indicator--m"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--info baps-indicator--l"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--info baps-indicator--xl"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <span style="font-size:12px; color: var(--color-sampark-mono-80)">info</span>
  </div>
  <div style="display:flex; align-items:center; gap:1rem">
    <baps-indicator class="baps-indicator--warning baps-indicator--s"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--warning baps-indicator--m"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--warning baps-indicator--l"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--warning baps-indicator--xl"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <span style="font-size:12px; color: var(--color-sampark-mono-80)">warning</span>
  </div>
  <div style="display:flex; align-items:center; gap:1rem">
    <baps-indicator class="baps-indicator--grey baps-indicator--s"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--grey baps-indicator--m"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--grey baps-indicator--l"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <baps-indicator class="baps-indicator--grey baps-indicator--xl"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
    <span style="font-size:12px; color: var(--color-sampark-mono-80)">grey</span>
  </div>
</div>`,
    react: `${SETUP}

const SEVERITIES = ['success', 'error', 'info', 'warning', 'grey'];
const SIZES = ['s', 'm', 'l', 'xl'];

export function StatusDot() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {SEVERITIES.map((severity) => (
        <div key={severity} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {SIZES.map((size) => (
            <Indicator key={size} severity={severity} size={size} />
          ))}
          <span style={{ fontSize: 12, color: 'var(--color-sampark-mono-80)' }}>{severity}</span>
        </div>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

const SEVERITIES = ['success', 'error', 'info', 'warning', 'grey'];
const SIZES = ['s', 'm', 'l', 'xl'];

export default function StatusDot() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {SEVERITIES.map((severity) => (
        <div key={severity} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {SIZES.map((size) => (
            <Indicator key={size} severity={severity} size={size} />
          ))}
          <span style={{ fontSize: 12, color: 'var(--color-sampark-mono-80)' }}>{severity}</span>
        </div>
      ))}
    </div>
  );
}`,
  },

  // The ring is a halo for a dot sitting on a coloured surface: without it the
  // dot and the surface can be close enough in value that the dot disappears.
  // The story proves it by putting both on a dark panel.
  WithRing: {
    primeng: `<div style="display:flex; align-items:center; gap:1.5rem; background: var(--color-sampark-mono-80); padding:1rem; border-radius:0.5rem">
  <baps-indicator severity="success" size="l" />
  <baps-indicator severity="success" size="l" [ring]="true" />
</div>`,
    custom: `<!-- [ring]="true" -> class="baps-indicator--ring". The story's panel colour
     is hardcoded hex; this uses the token it came from. -->
<div style="display:flex; align-items:center; gap:1.5rem; background: var(--color-sampark-mono-80); padding:1rem; border-radius:0.5rem">
  <baps-indicator class="baps-indicator--success baps-indicator--l"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
  <baps-indicator class="baps-indicator--success baps-indicator--l baps-indicator--ring"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>
</div>`,
    react: `${SETUP}

export function WithRing() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: 'var(--color-sampark-mono-80)',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}
    >
      <Indicator severity="success" size="l" />
      <Indicator severity="success" size="l" ring />
    </div>
  );
}`,
    next: `${SETUP}

export default function WithRing() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: 'var(--color-sampark-mono-80)',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}
    >
      <Indicator severity="success" size="l" />
      <Indicator severity="success" size="l" ring />
    </div>
  );
}`,
  },

  // The meta's own args: one error dot at the m step, decorative.
  Playground: {
    primeng: `<baps-indicator severity="error" size="m" />`,
    custom: `<!-- Decorative, so the inner span is hidden and the host takes no role.
     A dot that MEANS something takes an aria-label instead — see StatusDot. -->
<baps-indicator class="baps-indicator--error baps-indicator--m"><span class="baps-indicator__inner" aria-hidden="true"></span></baps-indicator>`,
    react: `${SETUP}

/* One component for every variant on this page. Each input is a class, so
   this is a join rather than a lookup table. */
function Indicator({ severity = 'error', size = 'm', ring, text, disabled, label, children }) {
  const cls = [
    'baps-indicator',
    \`baps-indicator--\${severity}\`,
    \`baps-indicator--\${size}\`,
    ring && 'baps-indicator--ring',
    text && 'baps-indicator--text',
    disabled && 'baps-indicator--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <baps-indicator className={cls} role={label ? 'status' : undefined} aria-label={label}>
      <span className="baps-indicator__inner" aria-hidden={label ? undefined : true}>
        {children}
      </span>
    </baps-indicator>
  );
}

export function Example() {
  return <Indicator severity="error" size="m" />;
}`,
    next: `${SETUP}

/* No 'use client': an indicator is markup. */
function Indicator({ severity = 'error', size = 'm', ring, text, disabled, label, children }) {
  const cls = [
    'baps-indicator',
    \`baps-indicator--\${severity}\`,
    \`baps-indicator--\${size}\`,
    ring && 'baps-indicator--ring',
    text && 'baps-indicator--text',
    disabled && 'baps-indicator--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <baps-indicator className={cls} role={label ? 'status' : undefined} aria-label={label}>
      <span className="baps-indicator__inner" aria-hidden={label ? undefined : true}>
        {children}
      </span>
    </baps-indicator>
  );
}

export default function Example() {
  return <Indicator severity="error" size="m" />;
}`,
  },
};
