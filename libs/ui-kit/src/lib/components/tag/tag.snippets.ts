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
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

/** Stated once; the same loads sit behind every snippet on this page. */
const SETUP = setupFor('tag', true);

export const tagSnippets: Record<string, SnippetSet> = {
  // Route B: React, Next and PrimeNG-Angular, no Custom tab.
  //
  // The trailing action is the one tag shape the standalone partial cannot
  // render. Measured: _tag.scss contains the string "action" zero times, and
  // tokens.css has no --tag-*-action-* of any kind. Everything the action
  // needs lives in tag.component.ts's own styles block as component-local
  // custom properties — --baps-tag-action-size: 1.25rem base, 1rem at xs,
  // 1.5rem at l — together with the hover plate Figma keeps at opacity 0 until
  // hover. Those are literals in a component, not design tokens, so authoring
  // a partial from them would mean writing design values this system has not
  // declared.
  //
  // So the React and Next blocks below show the SHAPE and the semantics — a
  // real <button> with its own accessible name, not a glyph — and say plainly
  // that the styling for it is not published yet. hideCustom on the strip
  // keeps the Custom tab from falling back to the live Angular source, which
  // outside Angular is an empty <baps-tag> element.
  //
  // This unblocks the day --tag-*-action-* tokens exist; nothing else has to
  // change.
  TrailingAction: {
    interactive: true,
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag value="Extra small" size="xs" [action]="true" actionLabel="Open Extra small" (actionClick)="onAction($event)" />
  <baps-tag value="Small" [action]="true" actionLabel="Open Small" (actionClick)="onAction($event)" />
  <baps-tag value="Large" size="l" [action]="true" actionLabel="Open Large" (actionClick)="onAction($event)" />
  <baps-tag value="Filter" severity="contrast" icon="pi pi-filter" [action]="true" actionIcon="pi pi-times" actionLabel="Remove filter" />
  <baps-tag value="Disabled" [action]="true" actionLabel="Open Disabled" [disabled]="true" />
  <baps-tag brand="sampark" value="Sampark" severity="danger" [action]="true" actionLabel="Open Sampark" />
</div>`,
    react: `\${SETUP}

/* The action is a real <button> with its own accessible name — never a
   decorative glyph, and never the tag itself made clickable. The tag stays a
   <span>; only the trailing control takes the press.

   The className below is deliberately incomplete: baps-tag-action has no
   published rule yet (see the note above the snippet), so this renders an
   unstyled button inside a correctly styled tag. The SEMANTICS are the part
   worth copying. */
const TAGS = [
  ['Extra small', 'baps-tag--xs', 'Open Extra small'],
  ['Small', '', 'Open Small'],
  ['Large', 'baps-tag--l', 'Open Large'],
];

function TagWithAction({ label, size, actionLabel, onAction }) {
  return (
    <span className={\`baps-tag baps-tag--grey \${size}\`}>
      <span className="baps-tag__label">{label}</span>
      <button type="button" className="baps-tag-action" aria-label={actionLabel} onClick={onAction}>
        <span className="pi pi-times" aria-hidden="true" />
      </button>
    </span>
  );
}

export function TrailingAction({ onAction }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {TAGS.map(([label, size, actionLabel]) => (
        <TagWithAction
          key={label}
          label={label}
          size={size}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      ))}
    </div>
  );
}`,
    next: `'use client';

\${SETUP}

/* The action is a real <button> with its own accessible name — never a
   decorative glyph, and never the tag itself made clickable. The tag stays a
   <span>; only the trailing control takes the press.

   The className below is deliberately incomplete: baps-tag-action has no
   published rule yet (see the note above the snippet), so this renders an
   unstyled button inside a correctly styled tag. The SEMANTICS are the part
   worth copying. */
const TAGS = [
  ['Extra small', 'baps-tag--xs', 'Open Extra small'],
  ['Small', '', 'Open Small'],
  ['Large', 'baps-tag--l', 'Open Large'],
];

function TagWithAction({ label, size, actionLabel, onAction }) {
  return (
    <span className={\`baps-tag baps-tag--grey \${size}\`}>
      <span className="baps-tag__label">{label}</span>
      <button type="button" className="baps-tag-action" aria-label={actionLabel} onClick={onAction}>
        <span className="pi pi-times" aria-hidden="true" />
      </button>
    </span>
  );
}

export default function TrailingAction({ onAction }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {TAGS.map(([label, size, actionLabel]) => (
        <TagWithAction
          key={label}
          label={label}
          size={size}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      ))}
    </div>
  );
}`,
  },

  // Route B: React, Next and PrimeNG-Angular, no Custom tab.
  //
  // The trailing action is the one tag shape the standalone partial cannot
  // render. Measured: _tag.scss contains the string "action" zero times, and
  // tokens.css has no --tag-*-action-* of any kind. Everything the action
  // needs lives in tag.component.ts's own styles block as component-local
  // custom properties — --baps-tag-action-size: 1.25rem base, 1rem at xs,
  // 1.5rem at l — together with the hover plate Figma keeps at opacity 0 until
  // hover. Those are literals in a component, not design tokens, so authoring
  // a partial from them would mean writing design values this system has not
  // declared.
  //
  // So the React and Next blocks below show the SHAPE and the semantics — a
  // real <button> with its own accessible name, not a glyph — and say plainly
  // that the styling for it is not published yet. hideCustom on the strip
  // keeps the Custom tab from falling back to the live Angular source, which
  // outside Angular is an empty <baps-tag> element.
  //
  // This unblocks the day --tag-*-action-* tokens exist; nothing else has to
  // change.
  TrailingActionAxis: {
    interactive: true,
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag value="Extra small" size="xs" [action]="true" actionLabel="Open Extra small" (actionClick)="onAction($event)" />
  <baps-tag value="Small" [action]="true" actionLabel="Open Small" (actionClick)="onAction($event)" />
  <baps-tag value="Large" size="l" [action]="true" actionLabel="Open Large" (actionClick)="onAction($event)" />
  <baps-tag value="Filter" severity="contrast" icon="pi pi-filter" [action]="true" actionIcon="pi pi-times" actionLabel="Remove filter" />
  <baps-tag value="Disabled" [action]="true" actionLabel="Open Disabled" [disabled]="true" />
</div>`,
    react: `\${SETUP}

/* The action is a real <button> with its own accessible name — never a
   decorative glyph, and never the tag itself made clickable. The tag stays a
   <span>; only the trailing control takes the press.

   The className below is deliberately incomplete: baps-tag-action has no
   published rule yet (see the note above the snippet), so this renders an
   unstyled button inside a correctly styled tag. The SEMANTICS are the part
   worth copying. */
const TAGS = [
  ['Extra small', 'baps-tag--xs', 'Open Extra small'],
  ['Small', '', 'Open Small'],
  ['Large', 'baps-tag--l', 'Open Large'],
];

function TagWithAction({ label, size, actionLabel, onAction }) {
  return (
    <span className={\`baps-tag baps-tag--grey \${size}\`}>
      <span className="baps-tag__label">{label}</span>
      <button type="button" className="baps-tag-action" aria-label={actionLabel} onClick={onAction}>
        <span className="pi pi-times" aria-hidden="true" />
      </button>
    </span>
  );
}

export function TrailingActionAxis({ onAction }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {TAGS.map(([label, size, actionLabel]) => (
        <TagWithAction
          key={label}
          label={label}
          size={size}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      ))}
    </div>
  );
}`,
    next: `'use client';

\${SETUP}

/* The action is a real <button> with its own accessible name — never a
   decorative glyph, and never the tag itself made clickable. The tag stays a
   <span>; only the trailing control takes the press.

   The className below is deliberately incomplete: baps-tag-action has no
   published rule yet (see the note above the snippet), so this renders an
   unstyled button inside a correctly styled tag. The SEMANTICS are the part
   worth copying. */
const TAGS = [
  ['Extra small', 'baps-tag--xs', 'Open Extra small'],
  ['Small', '', 'Open Small'],
  ['Large', 'baps-tag--l', 'Open Large'],
];

function TagWithAction({ label, size, actionLabel, onAction }) {
  return (
    <span className={\`baps-tag baps-tag--grey \${size}\`}>
      <span className="baps-tag__label">{label}</span>
      <button type="button" className="baps-tag-action" aria-label={actionLabel} onClick={onAction}>
        <span className="pi pi-times" aria-hidden="true" />
      </button>
    </span>
  );
}

export default function TrailingActionAxis({ onAction }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {TAGS.map(([label, size, actionLabel]) => (
        <TagWithAction
          key={label}
          label={label}
          size={size}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      ))}
    </div>
  );
}`,
  },

  // Route B, and the reason is the content rather than the CSS.
  //
  // This story crosses every severity with every size and four content shapes,
  // one of which is label + trailing action — the shape with no standalone
  // rule (see TrailingAction above). A Custom tab could render three quarters
  // of the matrix and would be a tab that quietly stops being true a quarter
  // of the way across. The focused stories above each show one shape with a
  // verified Custom tab; this one is the overview.
  //
  // React and Next keep the story's own loops rather than 112 tags written
  // longhand, which is the same call the story itself makes.
  FullMatrix: {
    primeng: `<!-- The story builds this with @for over the two arrays; the Angular you
     would write in an app is the same loop. -->
<div style="display:grid; gap: 16px;">
  @for (severity of severities; track severity) {
    <div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
      @for (size of sizes; track size) {
        <baps-tag [value]="severity ?? 'Grey'" [severity]="severity" [size]="size" [chevron]="true" />
      }
    </div>
  }
</div>`,
    react: `\${SETUP}

/* Severity "grey" is the unqualified tag; the Angular side reaches Figma's
   navy "Primary" chip through PrimeNG's contrast slot, which is why the class
   is baps-tag--primary while the input is severity="contrast". */
const SEVERITIES = ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'];
const SIZES = ['baps-tag--xs', '', 'baps-tag--m', 'baps-tag--l'];

export function FullMatrix() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {SEVERITIES.map((severity) => (
        <div key={severity} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {SIZES.map((size) => (
            <span key={size} className={\`baps-tag baps-tag--\${severity} \${size}\`}>
              <span className="baps-tag__label">{severity}</span>
              <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}`,
    next: `\${SETUP}

const SEVERITIES = ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'];
const SIZES = ['baps-tag--xs', '', 'baps-tag--m', 'baps-tag--l'];

export default function FullMatrix() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {SEVERITIES.map((severity) => (
        <div key={severity} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {SIZES.map((size) => (
            <span key={size} className={\`baps-tag baps-tag--\${severity} \${size}\`}>
              <span className="baps-tag__label">{severity}</span>
              <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}`,
  },

  // ChevronAxis plus one Sampark sample on the end, which is why this story is
  // tagged ds:comparison — the sample is LABELLED "Sampark", so unpinning it
  // would render a tag saying Sampark in the MyBKY skin.
  //
  // In raw markup the pin is the same class the Angular host adds:
  // brand="sampark" -> baps-sampark on that one element, with the rest of the
  // row left to follow whatever scope the page is in.
  Chevron: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag value="Extra small" size="xs" [chevron]="true" />
  <baps-tag value="Small" [chevron]="true" />
  <baps-tag value="Large" size="l" [chevron]="true" />
  <baps-tag value="With icon" severity="info" icon="pi pi-user" [chevron]="true" />
  <baps-tag value="Disabled" [chevron]="true" [disabled]="true" />
  <baps-tag brand="sampark" value="Sampark" severity="success" [chevron]="true" />
</div>`,
    custom: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <span class="baps-tag baps-tag--grey baps-tag--xs"><span class="baps-tag__label">Extra small</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey"><span class="baps-tag__label">Small</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--l"><span class="baps-tag__label">Large</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--info"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span><span class="baps-tag__label">With icon</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--disabled"><span class="baps-tag__label">Disabled</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-sampark baps-tag--success"><span class="baps-tag__label">Sampark</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
</div>`,
    react: `\${SETUP}

export function Chevron() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--xs">
        <span className="baps-tag__label">Extra small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey">
        <span className="baps-tag__label">Small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--l">
        <span className="baps-tag__label">Large</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--info">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag__label">With icon</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--disabled">
        <span className="baps-tag__label">Disabled</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-sampark baps-tag--success">
        <span className="baps-tag__label">Sampark</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
    </div>
  );
}`,
    next: `\${SETUP}

export default function Chevron() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--xs">
        <span className="baps-tag__label">Extra small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey">
        <span className="baps-tag__label">Small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--l">
        <span className="baps-tag__label">Large</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--info">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag__label">With icon</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--disabled">
        <span className="baps-tag__label">Disabled</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-sampark baps-tag--success">
        <span className="baps-tag__label">Sampark</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
    </div>
  );
}`,
  },

  // IconOnlyAxis plus two Sampark samples. Same pinning as Chevron.
  //
  // Each of these still needs an accessible name in a real page — the glyph is
  // aria-hidden and there is no label to fall back on. They are sample markup
  // for the shape, not a pattern to paste with the name left off.
  IconOnly: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag icon="pi pi-user" size="xs" />
  <baps-tag icon="pi pi-user" />
  <baps-tag icon="pi pi-user" size="l" />
  <baps-tag icon="pi pi-user" [chevron]="true" />
  <baps-tag brand="sampark" icon="pi pi-user" />
  <baps-tag brand="sampark" icon="pi pi-user" size="l" />
</div>`,
    custom: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <span class="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--xs"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--icon-only"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--l"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--icon-only"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-sampark baps-tag--grey baps-tag--icon-only"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
  <span class="baps-tag baps-sampark baps-tag--grey baps-tag--icon-only baps-tag--l"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
</div>`,
    react: `\${SETUP}

export function IconOnly() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--xs">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--l">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-sampark baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-sampark baps-tag--grey baps-tag--icon-only baps-tag--l">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
    </div>
  );
}`,
    next: `\${SETUP}

export default function IconOnly() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--xs">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--l">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-sampark baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-sampark baps-tag--grey baps-tag--icon-only baps-tag--l">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
    </div>
  );
}`,
  },

  // The chevron is decorative: a caret after the label, aria-hidden, not a
  // button and not announced. [chevron]="true" renders
  // <span class="baps-tag-chevron pi pi-chevron-down">, which is what the raw
  // markup writes out.
  //
  // This story and the brand-pinned Chevron below render the same five tags;
  // Chevron adds one Sampark sample on the end.
  ChevronAxis: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag value="Extra small" size="xs" [chevron]="true" />
  <baps-tag value="Small" [chevron]="true" />
  <baps-tag value="Large" size="l" [chevron]="true" />
  <baps-tag value="With icon" severity="info" icon="pi pi-user" [chevron]="true" />
  <baps-tag value="Disabled" [chevron]="true" [disabled]="true" />
</div>`,
    custom: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <span class="baps-tag baps-tag--grey baps-tag--xs"><span class="baps-tag__label">Extra small</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey"><span class="baps-tag__label">Small</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--l"><span class="baps-tag__label">Large</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--info"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span><span class="baps-tag__label">With icon</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--disabled"><span class="baps-tag__label">Disabled</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
</div>`,
    react: `\${SETUP}

export function ChevronAxis() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--xs">
        <span className="baps-tag__label">Extra small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey">
        <span className="baps-tag__label">Small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--l">
        <span className="baps-tag__label">Large</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--info">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag__label">With icon</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--disabled">
        <span className="baps-tag__label">Disabled</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
    </div>
  );
}`,
    next: `\${SETUP}

export default function ChevronAxis() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--xs">
        <span className="baps-tag__label">Extra small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey">
        <span className="baps-tag__label">Small</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--l">
        <span className="baps-tag__label">Large</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--info">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag__label">With icon</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--disabled">
        <span className="baps-tag__label">Disabled</span>
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
    </div>
  );
}`,
  },

  // An icon with no label. The component derives the icon-only state from the
  // ABSENCE of a value — host binding '[class.baps-tag-icon-only]': '!value' —
  // so outside Angular you state it: baps-tag--icon-only, which is the
  // standalone partial's spelling of that same host class.
  //
  // Each one still needs an accessible name in a real page. These are sample
  // markup for the shape, not a pattern to paste with the name left off.
  IconOnlyAxis: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag icon="pi pi-user" size="xs" />
  <baps-tag icon="pi pi-user" />
  <baps-tag icon="pi pi-user" size="l" />
  <baps-tag icon="pi pi-user" [chevron]="true" />
</div>`,
    custom: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <span class="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--xs"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--icon-only"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--l"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>
  <span class="baps-tag baps-tag--grey baps-tag--icon-only"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>
</div>`,
    react: `\${SETUP}

export function IconOnlyAxis() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--xs">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--l">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
    </div>
  );
}`,
    next: `\${SETUP}

export default function IconOnlyAxis() {
  return (
    <div style={ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--xs">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only baps-tag--l">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
      </span>
      <span className="baps-tag baps-tag--grey baps-tag--icon-only">
        <span className="baps-tag__icon pi pi-user" aria-hidden="true" />
        <span className="baps-tag-chevron pi pi-chevron-down" aria-hidden="true" />
      </span>
    </div>
  );
}`,
  },

  // The meta's own args: one grey tag at the default size. Grey is what an
  // unqualified tag renders, which is why the class is spelled out here while
  // the Angular side leaves severity unset.
  Playground: {
    primeng: `<baps-tag value="Registered" />`,
    custom: `<span class="baps-tag baps-tag--grey"><span class="baps-tag__label">Registered</span></span>`,
    react: `\${SETUP}

export function Example() {
  return (
    <span className="baps-tag baps-tag--grey">
      <span className="baps-tag__label">Registered</span>
    </span>
  );
}`,
    next: `\${SETUP}

/* No 'use client': a tag is markup. */
export default function Example() {
  return (
    <span className="baps-tag baps-tag--grey">
      <span className="baps-tag__label">Registered</span>
    </span>
  );
}`,
  },

  // The same seven severities plus disabled, under the second brand. The only
  // difference from Severities is the scope class: brand="sampark" on one
  // instance becomes baps-sampark on that element. A whole page switches by
  // putting baps-ds-sampark on an ancestor and dropping the per-tag class —
  // the stylesheet carries both selectors.
  SamparkSeverities: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag brand="sampark" value="Grey" />
  <baps-tag brand="sampark" value="Primary" severity="contrast" />
  <baps-tag brand="sampark" value="Secondary" severity="secondary" />
  <baps-tag brand="sampark" value="Info" severity="info" />
  <baps-tag brand="sampark" value="Warning" severity="warn" />
  <baps-tag brand="sampark" value="Error" severity="danger" />
  <baps-tag brand="sampark" value="Success" severity="success" />
  <baps-tag brand="sampark" value="Disabled" [disabled]="true" />
</div>`,
    custom: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <span class="baps-tag baps-sampark baps-tag--grey"><span class="baps-tag__label">Grey</span></span>
  <span class="baps-tag baps-sampark baps-tag--primary"><span class="baps-tag__label">Primary</span></span>
  <span class="baps-tag baps-sampark baps-tag--secondary"><span class="baps-tag__label">Secondary</span></span>
  <span class="baps-tag baps-sampark baps-tag--info"><span class="baps-tag__label">Info</span></span>
  <span class="baps-tag baps-sampark baps-tag--warning"><span class="baps-tag__label">Warning</span></span>
  <span class="baps-tag baps-sampark baps-tag--error"><span class="baps-tag__label">Error</span></span>
  <span class="baps-tag baps-sampark baps-tag--success"><span class="baps-tag__label">Success</span></span>
  <span class="baps-tag baps-sampark baps-tag--disabled"><span class="baps-tag__label">Disabled</span></span>
</div>`,
    react: `\${SETUP}

const SEVERITIES = ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'];

export function SamparkSeverities() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {SEVERITIES.map((s) => (
        <span key={s} className={\`baps-tag baps-sampark baps-tag--\${s}\`}>
          <span className="baps-tag__label">{s[0].toUpperCase() + s.slice(1)}</span>
        </span>
      ))}
      <span className="baps-tag baps-sampark baps-tag--disabled">
        <span className="baps-tag__label">Disabled</span>
      </span>
    </div>
  );
}`,
    next: `\${SETUP}

const SEVERITIES = ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'];

export default function SamparkSeverities() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {SEVERITIES.map((s) => (
        <span key={s} className={\`baps-tag baps-sampark baps-tag--\${s}\`}>
          <span className="baps-tag__label">{s[0].toUpperCase() + s.slice(1)}</span>
        </span>
      ))}
      <span className="baps-tag baps-sampark baps-tag--disabled">
        <span className="baps-tag__label">Disabled</span>
      </span>
    </div>
  );
}`,
  },

  // Sampark boxes. "s" is the default and carries no class; the component's
  // host binds only xs, m and l. The large one also carries an icon, which
  // inherits the label's colour and font-size and so needs neither of its own.
  SamparkSizes: {
    primeng: `<div style="display:flex; gap: 12px; align-items: center;">
  <baps-tag brand="sampark" value="Extra small" size="xs" />
  <baps-tag brand="sampark" value="Small" />
  <baps-tag brand="sampark" value="Medium" size="m" />
  <baps-tag brand="sampark" value="Large" size="l" icon="pi pi-clock" />
</div>`,
    custom: `<div style="display:flex; gap: 12px; align-items: center;">
  <span class="baps-tag baps-sampark baps-tag--xs"><span class="baps-tag__label">Extra small</span></span>
  <span class="baps-tag baps-sampark"><span class="baps-tag__label">Small</span></span>
  <span class="baps-tag baps-sampark baps-tag--m"><span class="baps-tag__label">Medium</span></span>
  <span class="baps-tag baps-sampark baps-tag--l"><span class="baps-tag__icon pi pi-clock" aria-hidden="true"></span><span class="baps-tag__label">Large</span></span>
</div>`,
    react: `\${SETUP}

export function SamparkSizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="baps-tag baps-sampark baps-tag--xs">
        <span className="baps-tag__label">Extra small</span>
      </span>
      <span className="baps-tag baps-sampark">
        <span className="baps-tag__label">Small</span>
      </span>
      <span className="baps-tag baps-sampark baps-tag--m">
        <span className="baps-tag__label">Medium</span>
      </span>
      <span className="baps-tag baps-sampark baps-tag--l">
        <span className="baps-tag__icon pi pi-clock" aria-hidden="true" />
        <span className="baps-tag__label">Large</span>
      </span>
    </div>
  );
}`,
    next: `\${SETUP}

export default function SamparkSizes() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <span className="baps-tag baps-sampark baps-tag--xs">
        <span className="baps-tag__label">Extra small</span>
      </span>
      <span className="baps-tag baps-sampark">
        <span className="baps-tag__label">Small</span>
      </span>
      <span className="baps-tag baps-sampark baps-tag--m">
        <span className="baps-tag__label">Medium</span>
      </span>
      <span className="baps-tag baps-sampark baps-tag--l">
        <span className="baps-tag__icon pi pi-clock" aria-hidden="true" />
        <span className="baps-tag__label">Large</span>
      </span>
    </div>
  );
}`,
  },

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
