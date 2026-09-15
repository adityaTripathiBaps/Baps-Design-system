/**
 * Hand-authored icons — the ONE file in this folder that is safe to edit.
 *
 * `icon-set.ts` is generated from the Figma sheet by
 * `tools/icons/extract-baps-icons.mjs`; anything added there is lost on the
 * next regeneration. Icons that do not exist in the sheet live here instead
 * and are merged into the public registry by `icon-set.ts` (two lines at its
 * public surface, marked with a pointer back to this file).
 *
 * ## Authoring rules
 *
 * The generated glyphs carry a baked `transform` because they are cut out of a
 * 1210x14041 export sheet. Icons written here are drawn directly on the 24x24
 * viewBox, so they need no transform at all — do not copy one in from a
 * generated entry.
 *
 * Match the sheet on everything else, or a hand-authored icon reads as bolder
 * than the one beside it:
 *
 *   · stroke `currentColor`, so it inherits text colour in either brand
 *   · effective stroke-width 1 on the 24x24 box. The generated entries reach
 *     the same weight the long way round — 0.291717 x scale(3.427979) = 1.0
 *   · `stroke-linecap="round"`, `stroke-linejoin="round"`
 *   · no `fill` on stroked paths
 *
 * ## What is here and why
 *
 * The four chevrons. The sheet ships `arrow-up/down/left/right`, which are
 * line-plus-head arrows — right for "move" and "navigate to", too heavy for
 * the small disclosure marks a select trigger, an accordion header or a
 * region chip needs. These are the bare chevrons, matching PrimeIcons'
 * `pi-angle-*` family in role.
 */

/** Names added by hand. `as const` so they widen `BapsIconName`. */
export const BAPS_EXTRA_ICON_NAMES = [
  'angle-down',
  'angle-left',
  'angle-right',
  'angle-up',
] as const;

export type BapsExtraIconName = (typeof BAPS_EXTRA_ICON_NAMES)[number];

/**
 * Chevrons on a 24x24 box, apex centred, 8px of horizontal reach either side
 * of centre and 4px of vertical travel — so the four read as one rotated glyph
 * rather than four separately drawn ones.
 */
export const BAPS_EXTRA_ICONS: Record<BapsExtraIconName, string> = {
  'angle-down':
    '<path d="M8 10L12 14L16 10" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
  'angle-up':
    '<path d="M8 14L12 10L16 14" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
  'angle-left':
    '<path d="M14 8L10 12L14 16" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
  'angle-right':
    '<path d="M10 8L14 12L10 16" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>',
};
