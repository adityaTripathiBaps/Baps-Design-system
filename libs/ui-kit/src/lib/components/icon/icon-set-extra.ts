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
  'dash',
  'double-down',
  'double-left',
  'double-right',
  'double-up',
  'down',
  'left',
  'right',
  'switch',
  'up',
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
  // Figma "🟢 Component Library" Icon page, "Chevron" set (5098:23753): the
  // 10px disclosure marks used in dropdowns, badges and table headers. Paths
  // are Figma's own, drawn on a 10x10 box and scaled 2.4x onto the 24x24
  // viewBox, so at the intended 10-12px they keep Figma's 1.5px stroke.
  // They are heavier than the 1px sheet glyphs on purpose: at 10px a 1px
  // stroke disappears.
  'down': '<g transform="scale(2.4)"><path d="M8.33341 3.66699L5.00008 6.33366L1.66675 3.66699" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'up': '<g transform="scale(2.4)"><path d="M8.33341 6.33366L5.00008 3.66699L1.66675 6.33366" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'left': '<g transform="scale(2.4)"><path d="M6.33341 1.66699L3.66675 5.00033L6.33341 8.33366" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'right': '<g transform="scale(2.4)"><path d="M3.66675 1.66699L6.33341 5.00033L3.66675 8.33366" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'double-down': '<g transform="scale(2.4)"><path d="M8.33341 2L5.00008 4.66667L1.66675 2M8.33341 5.33333L5.00008 8L1.66675 5.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'double-up': '<g transform="scale(2.4)"><path d="M8.33341 7.99967L5.00008 5.33301L1.66675 7.99967M8.33341 4.66667L5.00008 2L1.66675 4.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'double-left': '<g transform="scale(2.4)"><path d="M8.00008 1.66699L5.33341 5.00033L8.00008 8.33366M4.66667 1.66699L2 5.00033L4.66667 8.33366" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'double-right': '<g transform="scale(2.4)"><path d="M2 1.66699L4.66667 5.00033L2 8.33366M5.33325 1.66699L7.99992 5.00033L5.33325 8.33366" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'switch': '<g transform="scale(2.4)"><path d="M8.32927 6.33333L4.99593 9L1.6626 6.33333M8.32927 3.66667L4.99593 1L1.6626 3.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
  'dash': '<g transform="scale(2.4)"><path d="M2 5L8 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g>',
};

/**
 * Figma names that the sheet extractor stored under a different name. The
 * glyph is the same; only the name differs, because the older sheet had two
 * icons called "mail", "like" and so on. A Figma name resolves to the kit
 * name in baps-icon, so either can be passed.
 */
export const BAPS_ICON_ALIASES = {
  'like': 'like-2',
  'list': 'list-2',
  'mail': 'icon-mail',
  'mail-opened': 'icon-mail-opened',
  'mail-unread': 'icon-mail-unread',
  'mailbox': 'icon-mailbox',
  'search': 'search-2',
  'users': 'users-2',
} as const;

export type BapsIconAlias = keyof typeof BAPS_ICON_ALIASES;
