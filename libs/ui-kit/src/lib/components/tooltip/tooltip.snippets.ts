/**
 * Framework snippets for the Tooltip docs page.
 *
 * ## Route B: no Custom tab
 *
 * Angular's is a DIRECTIVE, not a component — `[bapsTooltip]` on an existing
 * element — and the bubble itself is built by PrimeNG at hover time, appended
 * somewhere else in the document. The React one portals for the same reason.
 * There is no static markup that reproduces it, so none is written.
 *
 * The skin ships: `tooltip.css` styles `.p-tooltip`, `.p-tooltip-text`,
 * `.p-tooltip-arrow` and the four placement classes, plus the rich-card
 * classes `.baps-tooltip-title`, `.baps-tooltip-text` and
 * `.baps-tooltip-link`.
 *
 * ## A tooltip is not a description, and the difference matters
 *
 * A tooltip repeats or labels the trigger; it is not a place to hide content
 * a reader needs. If it carries something they must read, it belongs in the
 * page. If it labels an icon-only control, `aria-label` on the control is
 * what a screen reader actually uses — the tooltip is the sighted equivalent,
 * not a replacement.
 *
 * The rich card variant takes a title and a link. A link inside a tooltip is
 * only reachable if the bubble stays open while the pointer travels to it,
 * which PrimeNG handles and a hand-rolled one usually does not.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('tooltip');

export const tooltipSnippets: Record<string, SnippetSet> = {
  // The plain bubble: one string on an existing element.
  Default: {
    primeng: `<button bapsTooltip="Archive this project" type="button">
  Archive
</button>`,
    react: `${SETUP}

export function ArchiveButton({ onArchive }) {
  // The tooltip wraps the trigger rather than being an attribute on it,
  // because React has no directives.
  return (
    <BapsTooltip content="Archive this project">
      <button type="button" className="baps-button baps-button--secondary" onClick={onArchive}>
        <span className="baps-button__label">Archive</span>
      </button>
    </BapsTooltip>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client': the bubble is shown on hover and focus, and it portals. */
export default function ArchiveButton({ onArchive }) {
  return (
    <BapsTooltip content="Archive this project">
      <button type="button" className="baps-button baps-button--secondary" onClick={onArchive}>
        <span className="baps-button__label">Archive</span>
      </button>
    </BapsTooltip>
  );
}`,
  },

  // The rich card: a title, a line of text and a link. Sampark only.
  SamparkRichCard: {
    primeng: `<button
  type="button"
  brand="sampark"
  bapsTooltip="Only a regional admin can change this."
  tooltipTitle="Locked field"
  tooltipLinkLabel="Learn more"
>
  Centre
</button>`,
    react: `${SETUP}

export function LockedFieldHint({ onLearnMore }) {
  return (
    <BapsTooltip
      brand="sampark"
      title="Locked field"
      content="Only a regional admin can change this."
      linkLabel="Learn more"
      onLinkClick={onLearnMore}
    >
      {/* aria-describedby is what carries the explanation to a screen reader.
          The visible bubble is the sighted equivalent, not the accessible
          one — so the control still needs its own name. */}
      <button type="button" aria-label="Centre, locked">
        Centre
      </button>
    </BapsTooltip>
  );
}`,
    next: `'use client';

${SETUP}

/* A link inside the bubble only works if it stays open while the pointer
   travels to it. That is the component's job, not the caller's — but it is
   why a hand-rolled tooltip usually cannot carry a link at all. */
export default function LockedFieldHint({ onLearnMore }) {
  return (
    <BapsTooltip
      brand="sampark"
      title="Locked field"
      content="Only a regional admin can change this."
      linkLabel="Learn more"
      onLinkClick={onLearnMore}
    >
      <button type="button" aria-label="Centre, locked">
        Centre
      </button>
    </BapsTooltip>
  );
}`,
  },
};
