/**
 * Framework snippets for the Tag docs page, keyed by story export name.
 *
 * `baps-tag` wraps `p-tag`, so this is the button shape rather than the card
 * one: raw `<baps-tag>` markup is an empty custom element, and the Custom tab
 * carries a plain `<span>` with classes that
 * `styles/components/tag/_tag.scss` styles. That partial is AUTHORED from the
 * 94 `--tag-*` tokens, not extracted.
 *
 * ## Inputs become classes
 *
 *   severity="info"      -> class="baps-tag--info"   (grey is the default)
 *   size="xs" | "m" | "l" -> class="baps-tag--xs|m|l" (s is the default)
 *   [disabled]="true"    -> class="baps-tag--disabled"
 *   brand="sampark"      -> class="baps-sampark"
 *   icon="pi pi-check"   -> <i class="baps-tag__icon pi pi-check">
 *   [chevron]="true"     -> <span class="baps-tag-chevron pi pi-chevron-down">
 *   no value             -> class="baps-tag--icon-only"
 *
 * ## One value is deliberately a literal, and it is not an oversight
 *
 * `.baps-tag--primary` bakes its background and text instead of referencing
 * `--tag-mybky-primary-background` / `-text`. Those tokens resolve to
 * `var(--color-mybky-blue-50 / -800)`, and the theme picker rewrites the blue
 * ramp — so a token reference would make the Custom tab follow the accent while
 * the live component does not. The component's fill comes from
 * `components.tag.contrast` in `baps.theme.ts`, a resolved literal, which is the
 * sink-3 gap tag is deferred on.
 *
 * A snippet that followed the picker would be "more correct" than the component
 * it documents — amber beside a live tag that stayed blue — and the drift guard
 * would go red on a file that is not wrong. The border IS left on its token,
 * because it has no preset counterpart and genuinely does follow. Measured: at
 * accent:amber a primary tag renders an amber border around a blue fill. When
 * bucket B migrates tag off the preset literals, these two lines become token
 * references again and the drift guard is what notices.
 */
export type SnippetSet = { react?: string; next?: string; primeng?: string; custom?: string };

/** Stated once; the same loads sit behind every snippet on this page. */
const SETUP = `/* Once, at your app's entry. Paths are relative because no package export
   exists yet — see card.snippets.ts for the packaging note.

     import '<repo>/libs/tokens/build/css/tokens.css';
     import 'primeicons/primeicons.css';          // only if you use icons

   in your global stylesheet:

     @use '<repo>/libs/ui-kit/src/lib/styles/layout/fonts';
     @use '<repo>/libs/ui-kit/src/lib/styles/layout/common';
     @use '<repo>/libs/ui-kit/src/lib/styles/components/tag/tag';

   and the app's own base rules — font-feature-settings included, or every
   label measures narrower than the component. See button.snippets.ts.
*/`;

export const tagSnippets: Record<string, SnippetSet> = {
  Severities: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag value="Grey" />
  <baps-tag value="Primary" severity="contrast" />
  <baps-tag value="Secondary" severity="secondary" />
  <baps-tag value="Info" severity="info" />
  <baps-tag value="Warning" severity="warn" />
  <baps-tag value="Error" severity="danger" />
  <baps-tag value="Success" severity="success" />
  <baps-tag value="Disabled" [disabled]="true" />
</div>`,
    custom: `<!-- Seven severities plus disabled. "Primary" is reached through PrimeNG's
     contrast severity on the Angular side — the unqualified tag renders grey —
     which is why the class is baps-tag--primary and the input is not. -->
<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <span class="baps-tag baps-tag--grey"><span class="baps-tag__label">Grey</span></span>
  <span class="baps-tag baps-tag--primary"><span class="baps-tag__label">Primary</span></span>
  <span class="baps-tag baps-tag--secondary"><span class="baps-tag__label">Secondary</span></span>
  <span class="baps-tag baps-tag--info"><span class="baps-tag__label">Info</span></span>
  <span class="baps-tag baps-tag--warning"><span class="baps-tag__label">Warning</span></span>
  <span class="baps-tag baps-tag--error"><span class="baps-tag__label">Error</span></span>
  <span class="baps-tag baps-tag--success"><span class="baps-tag__label">Success</span></span>
  <span class="baps-tag baps-tag--disabled"><span class="baps-tag__label">Disabled</span></span>
</div>`,
    react: `${SETUP}

const SEVERITIES = ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'];

export function Severities() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {SEVERITIES.map((s) => (
        <span key={s} className={\`baps-tag baps-tag--\${s}\`}>
          {s[0].toUpperCase() + s.slice(1)}
        </span>
      ))}
      <span className="baps-tag baps-tag--disabled">Disabled</span>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const SEVERITIES = ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'];

export default function Severities() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {SEVERITIES.map((s) => (
        <span key={s} className={\`baps-tag baps-tag--\${s}\`}>
          {s[0].toUpperCase() + s.slice(1)}
        </span>
      ))}
      <span className="baps-tag baps-tag--disabled">Disabled</span>
    </div>
  );
}`,
  },

  Sizes: {
    primeng: `<!-- 18 / 22 / 26 / 32px. "s" is the default and has no size input. -->
<div style="display:flex; gap: 12px; align-items: center;">
  <baps-tag value="Extra small" size="xs" />
  <baps-tag value="Small" />
  <baps-tag value="Medium" size="m" />
  <baps-tag value="Large" size="l" />
</div>`,
    custom: `<!-- 18 / 22 / 26 / 32px tall. "s" is the default and carries NO class —
     the component's host binds only xs, m and l. -->
<div style="display:flex; gap: 12px; align-items: center;">
  <span class="baps-tag baps-tag--xs"><span class="baps-tag__label">Extra small</span></span>
  <span class="baps-tag"><span class="baps-tag__label">Small</span></span>
  <span class="baps-tag baps-tag--m"><span class="baps-tag__label">Medium</span></span>
  <span class="baps-tag baps-tag--l"><span class="baps-tag__label">Large</span></span>
</div>`,
    react: `${SETUP}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="baps-tag baps-tag--xs">Extra small</span>
      <span className="baps-tag">Small</span>
      <span className="baps-tag baps-tag--m">Medium</span>
      <span className="baps-tag baps-tag--l">Large</span>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="baps-tag baps-tag--xs">Extra small</span>
      <span className="baps-tag">Small</span>
      <span className="baps-tag baps-tag--m">Medium</span>
      <span className="baps-tag baps-tag--l">Large</span>
    </div>
  );
}`,
  },

  WithIcon: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center;">
  <baps-tag value="Verified" severity="success" icon="pi pi-check" size="m" />
  <baps-tag value="Pending" severity="warn" icon="pi pi-clock" size="m" />
  <baps-tag value="Rejected" severity="danger" icon="pi pi-times" size="m" />
</div>`,
    custom: `<!-- The icon inherits the label's colour AND its font-size, so it needs
     neither of its own. aria-hidden because the label already says what the
     tag means — announcing "check Verified" is worse, not better. -->
<div style="display:flex; gap: 12px; align-items: center;">
  <span class="baps-tag baps-tag--success baps-tag--m"><span class="baps-tag__icon pi pi-check" aria-hidden="true"></span><span class="baps-tag__label">Verified</span></span>
  <span class="baps-tag baps-tag--warning baps-tag--m"><span class="baps-tag__icon pi pi-clock" aria-hidden="true"></span><span class="baps-tag__label">Pending</span></span>
  <span class="baps-tag baps-tag--error baps-tag--m"><span class="baps-tag__icon pi pi-times" aria-hidden="true"></span><span class="baps-tag__label">Rejected</span></span>
</div>`,
    react: `${SETUP}

export function WithIcon() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="baps-tag baps-tag--success baps-tag--m"><i className="baps-tag__icon pi pi-check" aria-hidden="true" />Verified</span>
      <span className="baps-tag baps-tag--warning baps-tag--m"><i className="baps-tag__icon pi pi-clock" aria-hidden="true" />Pending</span>
      <span className="baps-tag baps-tag--error baps-tag--m"><i className="baps-tag__icon pi pi-times" aria-hidden="true" />Rejected</span>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

export default function WithIcon() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="baps-tag baps-tag--success baps-tag--m"><i className="baps-tag__icon pi pi-check" aria-hidden="true" />Verified</span>
      <span className="baps-tag baps-tag--warning baps-tag--m"><i className="baps-tag__icon pi pi-clock" aria-hidden="true" />Pending</span>
      <span className="baps-tag baps-tag--error baps-tag--m"><i className="baps-tag__icon pi pi-times" aria-hidden="true" />Rejected</span>
    </div>
  );
}`,
  },
};
