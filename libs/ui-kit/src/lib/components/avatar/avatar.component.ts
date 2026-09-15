import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Avatar } from 'primeng/avatar';
// Sampark avatar skin lives in the theme layer so the same token block drives
// both the whole-preview Sampark preset and this per-instance dt scoping.
import { SAMPARK_AVATAR_TOKENS } from '../../theme/sampark.theme';

/** Figma steps (xs…2xl) plus PrimeNG's own size names, kept for compatibility. */
export type BapsAvatarSize = 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | 'normal' | 'large' | 'xlarge';

/**
 * Avatar — initials, icon, or image. MyBKY renders full circles on the
 * MyBky preset; Sampark (Portal Figma node 13197:90187, mirrored in spm-ui's
 * _avatar.scss) renders bordered squares with three type variants
 * (primary / secondary / warning), hover border darkening, a status dot and
 * an icon badge — reached per-instance via `brand="sampark"` or page-wide
 * via the Storybook "Design system" toolbar.
 *
 * Figma defines 6 sizes (xs 24 / s 32 / m 36 / l 48 / xl 60 / 2xl 80px);
 * PrimeNG's size input stops at normal/large/xlarge, so m/l/xl flow through
 * the preset and xs/s/2xl are host-class CSS rules below.
 *
 * ## Icon content
 * The icon slot takes projected content, not a string. PrimeNG's own `icon`
 * input only applies a CSS class to a `<span>` — built for icon-font glyphs
 * (PrimeIcons), not inline SVG. CLAUDE.md's iconography rule is Lucide
 * stroke icons (`stroke-width: 1.75`) everywhere in product UI, so a
 * PrimeIcons class string can't satisfy it: project an SVG instead —
 *
 *   <baps-avatar variant="secondary">
 *     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
 *          stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
 *       <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
 *     </svg>
 *   </baps-avatar>
 *
 * The projected element is boxed and sized identically to the old
 * `.p-avatar-icon` glyph slot (see the CSS below) — same per-size scale,
 * same `.p-avatar-icon` class, only the rendering technology changed.
 *
 * BREAKING vs the prior `@Input() icon: string` (a `pi pi-*` class name):
 * every call site must switch to projected SVG. Known call sites already
 * migrated: `avatar.stories.ts`, `table.stories.ts`, `menu-item.component.ts`.
 */
@Component({
  selector: 'baps-avatar',
  imports: [Avatar],
  template: `
    <p-avatar
      [label]="label"
      [image]="image"
      [shape]="shape"
      [size]="primeSize"
      [style]="style"
      [styleClass]="styleClass"
      [dt]="dt"
    >
      @if (!label && !image) {
        <span class="p-avatar-icon" aria-hidden="true">
          <ng-content></ng-content>
        </span>
      }
    </p-avatar>
  `,
  // Encapsulation is off so the size/border rules below can reach the
  // projected .p-avatar element; every selector is anchored to the
  // baps-avatar host tag (plus a Sampark scope class where applicable),
  // so nothing leaks to raw p-avatar usage.
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Anchor for the status-dot/icon-badge pseudo-elements. */
    baps-avatar {
      position: relative;
      display: inline-flex;
      /* An avatar is a fixed-size box: never let a flex row squeeze it.
         Without this, an avatar sitting in a display:flex row beside a long
         text label shrinks — the host AND the .p-avatar inside it both
         default to flex-shrink: 1 — so the box renders narrower than its
         size step and the icon looks mis-scaled. Seen in table lead cells. */
      flex: none;
    }

    /* PrimeUIX hard-codes .p-avatar-icon's box to avatar.icon.size while every
       per-size rule below only re-states font-size — a larger glyph then
       overflows the stale box and renders off-centre. Size the box from the
       glyph instead, so one rule covers every size and both brands. */
    baps-avatar .p-avatar-icon {
      width: 1em;
      height: 1em;
      line-height: 1;
    }

    /* The projected SVG fills the same box the old PrimeIcons font glyph
       filled — width/height:100% overrides any viewBox-derived intrinsic
       size the consumer's <svg> carries, so it always matches this slot,
       not its own markup. Colour rides stroke="currentColor" on the
       consumer's SVG, same convention as baps-menu-item / baps-file-upload. */
    baps-avatar .p-avatar-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Photo avatars must crop, not distort. PrimeNG's base rule is only
       width/height 100%, so without object-fit a non-square portrait is
       squashed to fit the circle. cover fills the box and crops the overflow,
       preserving the subject's aspect ratio — correct for the photographic
       avatars MyBKY uses. (Sampark deliberately uses contain further down
       instead: its avatars are pictogram/logo images sized into a fixed icon
       slot, where cropping would clip the glyph.) */
    baps-avatar .p-avatar.p-avatar-image img {
      object-fit: cover;
    }

    /* xs / s / 2xl — Figma steps beyond PrimeNG's size input. Both brands
       share the same box scale; the sampark-scoped overrides further down
       re-state them from the sampark tokens (fonts differ per brand). */
    baps-avatar.baps-avatar-xs .p-avatar {
      width: var(--avatar-mybky-size-xs, 1.5rem);
      height: var(--avatar-mybky-size-xs, 1.5rem);
      font-size: var(--avatar-mybky-font-size-xs, 0.625rem);
    }
    baps-avatar.baps-avatar-s .p-avatar {
      width: var(--avatar-mybky-size-s, 2rem);
      height: var(--avatar-mybky-size-s, 2rem);
      font-size: var(--avatar-mybky-font-size-s, 0.75rem);
    }
    baps-avatar.baps-avatar-2xl .p-avatar {
      width: var(--avatar-mybky-size-2xl, 5rem);
      height: var(--avatar-mybky-size-2xl, 5rem);
      font-size: var(--avatar-mybky-font-size-2xl, 1.75rem);
    }

    /* ── MyBKY status variants — Figma 22465:97983 ────────────────────────
       The sheet crosses six statuses with three content types and six sizes.
       Content and size were already implemented; the STATUS axis was not, so
       every MyBKY avatar rendered the same blue whatever the variant said.

       One pattern throughout: fill = <status>/10, border = <status>/60,
       content = <status>/80, and hover darkens the border only — the same
       hover rule the Sampark scope uses further down.

       These rules are unscoped on purpose. MyBKY is the default brand, so a
       .baps-mybky-style scope would have to be added to every consumer; the
       Sampark block below simply overrides what it needs. ── */

    baps-avatar .p-avatar {
      --baps-avatar-border-hover: var(--color-mybky-blue-400, #9fadd9);
      transition: border-color 150ms ease;
    }
    baps-avatar:hover .p-avatar {
      border-color: var(--baps-avatar-border-hover);
    }

    baps-avatar.baps-avatar-secondary .p-avatar {
      background: var(--color-mybky-mono-50, #f8fafb);
      border: 1px solid var(--color-mybky-mono-450, #8d9ba5);
      color: var(--color-mybky-mono-900, #181b1d);
      --baps-avatar-border-hover: var(--color-mybky-mono-500, #6f777d);
    }
    baps-avatar.baps-avatar-success .p-avatar {
      background: var(--color-mybky-success-surface, #ebfff5);
      border: 1px solid var(--color-mybky-success-tint, #93ecbb);
      color: var(--color-mybky-success-400, #40bf84);
      --baps-avatar-border-hover: var(--color-mybky-success-400, #40bf84);
    }
    baps-avatar.baps-avatar-error .p-avatar {
      background: var(--color-mybky-error-surface, #ffebeb);
      border: 1px solid var(--color-mybky-error-tint, #ec9394);
      color: var(--color-mybky-error-80, #e05255);
      --baps-avatar-border-hover: var(--color-mybky-error-80, #e05255);
    }
    baps-avatar.baps-avatar-warning .p-avatar {
      background: var(--color-mybky-warning-surface, #fff6eb);
      border: 1px solid var(--color-mybky-warning-tint, #ecc893);
      /* warning-60 is the sheet's Warning/80 — the repo ramp is one step
         offset from the Figma labels, see the tint tokens' own comments. */
      color: var(--color-mybky-warning-60, #e0a652);
      --baps-avatar-border-hover: var(--color-mybky-warning-60, #e0a652);
    }
    baps-avatar.baps-avatar-info .p-avatar {
      background: var(--color-mybky-info-surface, #ebf3ff);
      border: 1px solid var(--color-mybky-info-tint, #93b7ec);
      /* info-60 is the sheet's Info/80 — same one-step offset as warning. */
      color: var(--color-mybky-info-60, #528de0);
      --baps-avatar-border-hover: var(--color-mybky-info-60, #528de0);
    }

    /* ── Sampark scope — single instance opted in via brand="sampark" (host
       .baps-sampark class) or the whole page via .baps-ds-sampark. Spec:
       spm-ui _avatar.scss + variables.css --avatar-* (Figma 13197:90187). ── */

    /* Base (type=primary, size=m): 1px border, hover darkens the border only,
       Inter 500 initials. bg/text/radius/box flow from SAMPARK_AVATAR_TOKENS. */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar {
      box-sizing: border-box;
      border: var(--avatar-sampark-border-width, 1px) solid var(--avatar-sampark-border, #e9c3c3);
      --baps-avatar-border-hover: var(--avatar-sampark-border-hover, #d48787);
      font-weight: var(--avatar-sampark-font-weight, 500);
      /* Restated here, not left to the preset: the MyBKY status rules above
         set a color, and a CSS declaration beats a dt token, so without this
         a Sampark avatar picked up MyBKY's mono-900 text. Sampark keeps one
         text colour across every variant — the border and fill carry the
         status, the initials never do. */
      color: var(--avatar-sampark-text, #595656);
      transition: border-color 150ms ease;
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar):hover .p-avatar {
      border-color: var(--baps-avatar-border-hover);
    }

    /* Type variants — border + fill change; text stays mono.80 everywhere. */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-secondary .p-avatar {
      background: var(--avatar-sampark-secondary-background, #f8f7f7);
      border-color: var(--avatar-sampark-secondary-border, #bcb9b9);
      --baps-avatar-border-hover: var(--avatar-sampark-secondary-border-hover, #9f9c9c);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-warning .p-avatar {
      background: var(--avatar-sampark-warning-background, #fef4e6);
      border-color: var(--avatar-sampark-warning-border, #fcca83);
      --baps-avatar-border-hover: var(--avatar-sampark-warning-border-hover, #e08705);
    }
    /* Icon Success / Icon Error — Figma node 13197:90187 rows 5 and 6. Both
       were missing entirely; only primary, secondary and warning existed.
       (Warning itself does NOT appear in that frame — see the variant doc.) */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-success .p-avatar {
      background: var(--avatar-sampark-success-background, #e8fcf0);
      border-color: var(--avatar-sampark-success-border, #82e3af);
      --baps-avatar-border-hover: var(--avatar-sampark-success-border-hover, #17b56c);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-error .p-avatar {
      background: var(--avatar-sampark-error-background, #fde8e8);
      border-color: var(--avatar-sampark-error-border, #f27376);
      --baps-avatar-border-hover: var(--avatar-sampark-error-border-hover, #ea151a);
    }
    /* Info has no row in the Sampark avatar frame, but the variant exists on
       the component because MyBKY defines it. Rendered from Sampark's own info
       ramp rather than inheriting MyBKY blue, and rather than falling back to
       primary — a maroon "info" avatar would be silently wrong. The steps
       (10 / 40 / 60) are chosen for the same lightness relationship the
       success and error rows above use, not the same step numbers: the
       Sampark info ramp starts at 5, so its 20 is mid-blue where success's 20
       is near-white. */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-info .p-avatar {
      background: var(--avatar-sampark-info-background, #e6f0fe);
      border-color: var(--avatar-sampark-info-border, #83b5fc);
      --baps-avatar-border-hover: var(--avatar-sampark-info-border-hover, #3889fa);
    }

    /* Icon / image slot — fixed per-size (18/20/24/32/36/48), image contained
       to the slot like spm-ui's pictogram avatars, not stretched to the box. */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar .p-avatar-icon {
      font-size: var(--avatar-sampark-icon-size-m, 1.5rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-image img {
      width: var(--avatar-sampark-icon-size-m, 1.5rem);
      height: var(--avatar-sampark-icon-size-m, 1.5rem);
      object-fit: contain;
      border-radius: 0;
    }

    /* Sizes. m/l/xl boxes+fonts flow from the dt tokens; the border weight
       step (1.5px from l up), the xl/2xl radius bumps and the icon slots are
       CSS-only. Circle avatars keep PrimeNG's 50% radius. */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-xs .p-avatar {
      width: var(--avatar-sampark-size-xs, 1.5rem);
      height: var(--avatar-sampark-size-xs, 1.5rem);
      font-size: var(--avatar-sampark-font-size-xs, 0.75rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-xs .p-avatar .p-avatar-icon {
      font-size: var(--avatar-sampark-icon-size-xs, 1.125rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-xs .p-avatar.p-avatar-image img {
      width: var(--avatar-sampark-icon-size-xs, 1.125rem);
      height: var(--avatar-sampark-icon-size-xs, 1.125rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-s .p-avatar {
      width: var(--avatar-sampark-size-s, 2rem);
      height: var(--avatar-sampark-size-s, 2rem);
      font-size: var(--avatar-sampark-font-size-s, 0.875rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-s .p-avatar .p-avatar-icon {
      font-size: var(--avatar-sampark-icon-size-s, 1.25rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-s .p-avatar.p-avatar-image img {
      width: var(--avatar-sampark-icon-size-s, 1.25rem);
      height: var(--avatar-sampark-icon-size-s, 1.25rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-lg {
      border-width: var(--avatar-sampark-border-width-l, 1.5px);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-lg .p-avatar-icon {
      font-size: var(--avatar-sampark-icon-size-l, 2rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-lg.p-avatar-image img {
      width: var(--avatar-sampark-icon-size-l, 2rem);
      height: var(--avatar-sampark-icon-size-l, 2rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-xl {
      border-width: var(--avatar-sampark-border-width-l, 1.5px);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-xl:not(.p-avatar-circle) {
      border-radius: var(--avatar-sampark-radius-xl, 0.375rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-xl .p-avatar-icon {
      font-size: var(--avatar-sampark-icon-size-xl, 2.25rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar) .p-avatar.p-avatar-xl.p-avatar-image img {
      width: var(--avatar-sampark-icon-size-xl, 2.25rem);
      height: var(--avatar-sampark-icon-size-xl, 2.25rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-2xl .p-avatar {
      width: var(--avatar-sampark-size-2xl, 5rem);
      height: var(--avatar-sampark-size-2xl, 5rem);
      font-size: var(--avatar-sampark-font-size-2xl, 2.25rem);
      font-weight: var(--avatar-sampark-font-weight2xl, 400);
      border-width: var(--avatar-sampark-border-width-l, 1.5px);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-2xl .p-avatar:not(.p-avatar-circle) {
      border-radius: var(--avatar-sampark-radius2xl, 0.5rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-2xl .p-avatar .p-avatar-icon {
      font-size: var(--avatar-sampark-icon-size-2xl, 3rem);
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-2xl .p-avatar.p-avatar-image img {
      width: var(--avatar-sampark-icon-size-2xl, 3rem);
      height: var(--avatar-sampark-icon-size-2xl, 3rem);
    }

    /* Status dot — green presence dot, top-right, white ring. 6px on xs,
       8px on s/m/l, 10px on xl/2xl (spm-ui statusdot attribute). */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-dot::after {
      content: '';
      position: absolute;
      top: -3px;
      right: -3px;
      width: var(--avatar-sampark-status-dot-size, 0.5rem);
      height: var(--avatar-sampark-status-dot-size, 0.5rem);
      border-radius: 50%;
      background: var(--avatar-sampark-status-dot-color, #22c55e);
      border: 1.5px solid var(--color-sampark-mono-0, #ffffff);
      z-index: 2;
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-dot.baps-avatar-xs::after {
      width: var(--avatar-sampark-status-dot-size-xs, 0.375rem);
      height: var(--avatar-sampark-status-dot-size-xs, 0.375rem);
      top: -2px;
      right: -2px;
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-dot:is(.baps-avatar-xl, .baps-avatar-2xl)::after {
      width: var(--avatar-sampark-status-dot-size-xl, 0.625rem);
      height: var(--avatar-sampark-status-dot-size-xl, 0.625rem);
      top: -4px;
      right: -4px;
      border-width: 2px;
    }

    /* Icon badge — blue circle, bottom-right, white ring. 10px on xs,
       14px on s/m/l, 18px on xl/2xl (spm-ui iconbadge attribute). */
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-icon-badge::before {
      content: '';
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: var(--avatar-sampark-icon-badge-size, 0.875rem);
      height: var(--avatar-sampark-icon-badge-size, 0.875rem);
      border-radius: 50%;
      background: var(--avatar-sampark-icon-badge-background, #3b82f6);
      border: 1.5px solid var(--color-sampark-mono-0, #ffffff);
      z-index: 2;
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-icon-badge.baps-avatar-xs::before {
      width: var(--avatar-sampark-icon-badge-size-xs, 0.625rem);
      height: var(--avatar-sampark-icon-badge-size-xs, 0.625rem);
      bottom: -3px;
      right: -3px;
    }
    :is(baps-avatar.baps-sampark, .baps-ds-sampark baps-avatar).baps-avatar-icon-badge:is(.baps-avatar-xl, .baps-avatar-2xl)::before {
      width: var(--avatar-sampark-icon-badge-size-xl, 1.125rem);
      height: var(--avatar-sampark-icon-badge-size-xl, 1.125rem);
      bottom: -6px;
      right: -6px;
      border-width: 2px;
    }
  `,
  host: {
    '[class.baps-avatar-xs]': "figmaSize === 'xs'",
    '[class.baps-avatar-s]': "figmaSize === 's'",
    '[class.baps-avatar-xl]': "figmaSize === 'xl'",
    '[class.baps-avatar-2xl]': "figmaSize === '2xl'",
    '[class.baps-avatar-secondary]': "variant === 'secondary'",
    '[class.baps-avatar-warning]': "variant === 'warning'",
    '[class.baps-avatar-success]': "variant === 'success'",
    '[class.baps-avatar-error]': "variant === 'error'",
    '[class.baps-avatar-info]': "variant === 'info'",
    '[class.baps-avatar-dot]': 'statusDot',
    '[class.baps-avatar-icon-badge]': 'iconBadge',
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsAvatar {
  @Input() label?: string;
  @Input() image?: string;
  /** Under either preset the brand radius wins for `square`; `circle` forces 50%. */
  @Input() shape: 'square' | 'circle' = 'square';
  /**
   * Figma sizes: xs 24 / s 32 / m 36 (default) / l 48 / xl 60 / 2xl 80px.
   * PrimeNG's `normal`/`large`/`xlarge` still work and alias to m/l/xl.
   */
  @Input() size: BapsAvatarSize = 'm';
  /**
   * Status colour. Orthogonal to what the avatar CONTAINS — initials, a
   * projected icon, or an image all take the same set.
   *
   * Both brands define this axis, and they do not define the same members:
   *
   *   Sampark (13197:90187)  primary, secondary, success, error
   *   MyBKY   (22465:97983)  primary, secondary, success, error, warning, info
   *
   * `secondary` is the neutral/mono treatment — it is what MyBKY's sheet calls
   * "Status=Default" and what Sampark's calls "Secondary". One name for one
   * treatment rather than two, since the two are the same mono fill + border
   * pattern in both palettes.
   *
   * `warning` and `info` have no Sampark counterpart. They render there as the
   * MyBKY-derived amber/blue rather than silently falling back to primary,
   * which would be worse: a consumer asking for a warning avatar and getting a
   * maroon one has no way to notice.
   */
  @Input() variant: 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info' =
    'primary';
  /** Green presence dot, top-right (Sampark; spm-ui `statusdot`). MyBKY uses baps-overlaybadge. */
  @Input() statusDot = false;
  /** Blue icon badge, bottom-right (Sampark; spm-ui `iconbadge`). */
  @Input() iconBadge = false;
  /**
   * Visual skin: 'mybky' (default) renders the global MyBky preset — full
   * circle, blue.50 fill. 'sampark' applies spm-ui's bordered square with
   * the primary.0 fill via scoped design tokens.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;

  get figmaSize(): 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' {
    const aliases = { normal: 'm', large: 'l', xlarge: 'xl' } as const;
    return aliases[this.size as keyof typeof aliases] ?? (this.size as 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl');
  }

  /** l/xl ride PrimeNG's size steps (preset-driven); everything else is host CSS. */
  get primeSize(): 'normal' | 'large' | 'xlarge' {
    const f = this.figmaSize;
    return f === 'l' ? 'large' : f === 'xl' ? 'xlarge' : 'normal';
  }

  get dt(): object | undefined {
    return this.brand === 'sampark' ? SAMPARK_AVATAR_TOKENS : undefined;
  }
}
