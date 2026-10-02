/**
 * Framework snippets for the Icon docs page.
 *
 * ## Proven standalone, not assumed
 *
 * `tools/check-standalone.mjs` renders the live story, strips Angular's own
 * attributes from the result, puts that markup on a bare file:// page with
 * only tokens.css and the partials, and compares computed styles element by
 * element. Icon passes on all five elements, every property.
 *
 * That works because `_icon.scss` is anchored to the ELEMENT name — every
 * selector reads `baps-icon`, not a class — so markup Angular never rendered
 * picks up the same rules. It carries no `.p-*` selector at all.
 *
 * ## Two things that are not classes
 *
 * **Size** is a custom property, not a modifier. The Angular component sets it
 * with a host binding (`[style.--baps-icon-size.px]`), so outside Angular you
 * write it yourself:
 *
 *     <baps-icon style="--baps-icon-size: 20px">
 *
 * The fallback is 24px, the size the artwork is drawn at, so omitting it is
 * safe rather than broken. The named steps are xs 12, sm 16, md 20, lg 24,
 * xl 32.
 *
 * **The glyph** is data, not CSS. It comes from a generated registry, and
 * `@org/ui-kit/icons` exports it Angular-free — measured, zero occurrences of
 * "@angular" in the built file, 545 glyphs, 2.29 MB bundled. The component
 * wraps the path body in exactly this, and so do the snippets below:
 *
 *     <svg viewBox="0 0 24 24" fill="none" focusable="false">{body}</svg>
 *
 * ## Accessibility is the input, not an afterthought
 *
 * One input decides it. An icon with no `label` is decorative and is hidden
 * from assistive technology; an icon WITH a label is content and is announced.
 * Getting it wrong in either direction is the usual bug: a decorative glyph
 * that gets read out, or an icon-only button that announces nothing.
 *
 *     label set     role="img" + aria-label
 *     label unset   aria-hidden="true"
 *
 * ## The Library example has no snippet
 *
 * `components-icon--library` renders `<baps-icon-gallery />`, a docs-only
 * component that lists the registry. There is no app markup for it, and
 * inventing some would document something that does not exist.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('icon');

export const iconSnippets: Record<string, SnippetSet> = {
  // The accessibility axis, and the only input that decides it.
  //
  //   label SET    role="img" + aria-label — the icon IS the content
  //   label UNSET  aria-hidden="true"      — it sits beside its own text
  //
  // Both are wrong in the other's place. A decorative glyph with a label gets
  // read out twice; an icon-only button without one announces nothing.
  Labelled: {
    primeng: `<div style="display:flex; gap:1.5rem; align-items:center;">
  <!-- The icon IS the button's name. -->
  <button type="button" aria-label="Delete" class="baps-button baps-button--secondary baps-button--icon-only">
    <baps-icon name="trash" size="md" label="Delete" />
  </button>

  <!-- Decorative: the text beside it already says what it is. -->
  <span style="display:inline-flex; align-items:center; gap:.4rem;">
    <baps-icon name="user" size="md" /> Decorative, beside its own label
  </span>
</div>`,
    custom: `<div style="display:flex; gap:1.5rem; align-items:center;">
  <button type="button" aria-label="Delete" class="baps-button baps-button--secondary baps-button--icon-only">
    <baps-icon style="--baps-icon-size: 20px">
      <span class="baps-icon__glyph" role="img" aria-label="Delete"><!-- BAPS_ICONS['trash'] --></span>
    </baps-icon>
  </button>

  <span style="display:inline-flex; align-items:center; gap:.4rem;">
    <baps-icon style="--baps-icon-size: 20px">
      <span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['user'] --></span>
    </baps-icon>
    Decorative, beside its own label
  </span>
</div>`,
    react: `${SETUP}

export function Labelled() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      {/* The glyph is the button's name, so it is announced. The aria-label on
          the button and the one on the icon say the same thing — keep both,
          because the button's is what a screen reader reaches first and the
          icon's is what survives if the markup is reused elsewhere. */}
      <button
        type="button"
        aria-label="Delete"
        className="baps-button baps-button--secondary baps-button--icon-only"
      >
        <Glyph name="trash" label="Delete" />
      </button>

      {/* Decorative: no label, so it is hidden rather than read twice. */}
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <Glyph name="user" />
        Decorative, beside its own label
      </span>
    </div>
  );
}`,
    next: `${SETUP}

export default function Labelled() {
  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <button
        type="button"
        aria-label="Delete"
        className="baps-button baps-button--secondary baps-button--icon-only"
      >
        <Glyph name="trash" label="Delete" />
      </button>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <Glyph name="user" />
        Decorative, beside its own label
      </span>
    </div>
  );
}`,
  },

  // The five named steps. Size is a custom property, not a modifier class —
  // 24 is the size the artwork is drawn at, so every other step is that
  // artwork scaled, which is why the stroke thins visibly below sm.
  Sizes: {
    primeng: `<div style="display:flex; align-items:flex-end; gap:1.5rem;">
  <baps-icon name="notification" size="xs" />
  <baps-icon name="notification" size="sm" />
  <baps-icon name="notification" size="md" />
  <baps-icon name="notification" size="lg" />
  <baps-icon name="notification" size="xl" />
</div>`,
    custom: `<div style="display:flex; align-items:flex-end; gap:1.5rem;">
  <baps-icon style="--baps-icon-size: 12px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['notification'] --></span></baps-icon>
  <baps-icon style="--baps-icon-size: 16px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['notification'] --></span></baps-icon>
  <baps-icon style="--baps-icon-size: 20px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['notification'] --></span></baps-icon>
  <baps-icon style="--baps-icon-size: 24px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['notification'] --></span></baps-icon>
  <baps-icon style="--baps-icon-size: 32px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['notification'] --></span></baps-icon>
</div>`,
    react: `${SETUP}

const SIZES = [12, 16, 20, 24, 32];

export function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
      {SIZES.map((size) => (
        <Glyph key={size} name="notification" size={size} />
      ))}
    </div>
  );
}`,
    next: `${SETUP}

const SIZES = [12, 16, 20, 24, 32];

export default function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
      {SIZES.map((size) => (
        <Glyph key={size} name="notification" size={size} />
      ))}
    </div>
  );
}`,
  },

  // The glyph has no colour of its own: every stroke is currentColor, so it
  // takes the colour of the text around it. That is why this component has no
  // brand input — put it inside something maroon and it is maroon.
  //
  // The story's own swatches are hardcoded hex, which is story chrome. These
  // use the tokens those colours came from instead.
  InheritsColour: {
    primeng: `<div style="display:flex; gap:2rem; align-items:center;">
  <span style="color: var(--color-sampark-primary-default); display:inline-flex; align-items:center; gap:.4rem;">
    <baps-icon name="trash" size="md" /> Sampark maroon
  </span>
  <span style="color: var(--color-mybky-primary-default); display:inline-flex; align-items:center; gap:.4rem;">
    <baps-icon name="info-circle" size="md" /> MyBKY blue
  </span>
</div>`,
    custom: `<!-- Nothing sets the icon's colour. The parent's colour is the icon's. -->
<div style="display:flex; gap:2rem; align-items:center;">
  <span style="color: var(--color-sampark-primary-default); display:inline-flex; align-items:center; gap:.4rem;">
    <baps-icon style="--baps-icon-size: 20px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['trash'] --></span></baps-icon>
    Sampark maroon
  </span>
  <span style="color: var(--color-mybky-primary-default); display:inline-flex; align-items:center; gap:.4rem;">
    <baps-icon style="--baps-icon-size: 20px"><span class="baps-icon__glyph" aria-hidden="true"><!-- BAPS_ICONS['info-circle'] --></span></baps-icon>
    MyBKY blue
  </span>
</div>`,
    react: `${SETUP}

const SWATCHES = [
  ['var(--color-sampark-primary-default)', 'trash', 'Sampark maroon'],
  ['var(--color-mybky-primary-default)', 'info-circle', 'MyBKY blue'],
];

export function InheritsColour() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      {SWATCHES.map(([color, icon, label]) => (
        <span
          key={label}
          style={{ color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Glyph name={icon} />
          {label}
        </span>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

const SWATCHES = [
  ['var(--color-sampark-primary-default)', 'trash', 'Sampark maroon'],
  ['var(--color-mybky-primary-default)', 'info-circle', 'MyBKY blue'],
];

export default function InheritsColour() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      {SWATCHES.map(([color, icon, label]) => (
        <span
          key={label}
          style={{ color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Glyph name={icon} />
          {label}
        </span>
      ))}
    </div>
  );
}`,
  },

  // The meta's own args: one notification glyph at the lg step. lg is 24px,
  // the size the artwork is drawn at, so this is the icon at its native scale.
  Playground: {
    primeng: `<baps-icon name="notification" size="lg" />`,
    custom: `<!-- Decorative: no label, so it is hidden from assistive technology. An
     icon that IS the content takes a label instead — see Labelled. -->
<baps-icon style="--baps-icon-size: 24px">
  <span class="baps-icon__glyph" aria-hidden="true">
    <!-- BAPS_ICONS['notification'] -->
  </span>
</baps-icon>`,
    react: `${SETUP}

import { BAPS_ICONS } from '@org/ui-kit/icons';

/* The registry is plain data — measured, zero references to Angular in the
   built file — so it is the one piece of the component library a React app
   imports directly. This wrapper is byte for byte what the Angular component
   injects. */
function Glyph({ name, size = 24, label }) {
  return (
    <baps-icon style={{ '--baps-icon-size': size + 'px' }}>
      <span
        className="baps-icon__glyph"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        dangerouslySetInnerHTML={{
          __html:
            '<svg viewBox="0 0 24 24" fill="none" focusable="false">' + BAPS_ICONS[name] + '</svg>',
        }}
      />
    </baps-icon>
  );
}

export function Example() {
  return <Glyph name="notification" />;
}`,
    next: `${SETUP}

import { BAPS_ICONS } from '@org/ui-kit/icons';

/* No 'use client': an icon is markup. The registry is 2.3 MB of path data —
   keep this component in ONE file and import it from there, or it lands in
   several chunks. */
function Glyph({ name, size = 24, label }) {
  return (
    <baps-icon style={{ '--baps-icon-size': size + 'px' }}>
      <span
        className="baps-icon__glyph"
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        dangerouslySetInnerHTML={{
          __html:
            '<svg viewBox="0 0 24 24" fill="none" focusable="false">' + BAPS_ICONS[name] + '</svg>',
        }}
      />
    </baps-icon>
  );
}

export default function Example() {
  return <Glyph name="notification" />;
}`,
  },
};
