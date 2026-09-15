import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * baps-link — styled anchor / navigation link.
 *
 * Pure HTML component — no PrimeNG dependency. Renders an `<a>` element
 * with brand-appropriate styling: Sampark uses maroon text with underline
 * on hover; MyBKY uses blue.
 *
 * Usage:
 *   <baps-link href="/settings" brand="sampark">Settings</baps-link>
 *   <baps-link href="/docs" target="_blank">Documentation</baps-link>
 */
@Component({
  selector: 'baps-link',
  template: `
    <a
      [href]="disabled ? null : href"
      [target]="target"
      [attr.rel]="target === '_blank' ? 'noopener noreferrer' : null"
      [attr.aria-disabled]="disabled || null"
      [tabindex]="disabled ? -1 : 0"
      class="baps-link__anchor"
      [class.baps-link--disabled]="disabled"
    >
      <ng-content></ng-content>
    </a>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-link {
      display: inline;
    }

    baps-link .baps-link__anchor {
      font-family: inherit;
      font-size: inherit;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: color 120ms ease;
    }

    /* ── Sizes — Figma node 13197:91800 "Link" ──
       S / L / XL name the rendered BOX height (16 / 18 / 20px); the type
       inside is 12 / 14 / 16px Inter Medium at 1.3 line-height, which is
       what those heights are. Opt-in: with no size the anchor keeps
       font-size: inherit, so every existing link renders unchanged. */
    baps-link.baps-link-sm .baps-link__anchor {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--font-line-height-snug, 1.3);
    }
    baps-link.baps-link-lg .baps-link__anchor {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--font-line-height-snug, 1.3);
    }
    baps-link.baps-link-xl .baps-link__anchor {
      font-size: var(--font-size-md, 1rem);
      line-height: var(--font-line-height-snug, 1.3);
    }

    /* ── MyBKY (default) ── */
    baps-link.baps-link--primary:not(.baps-sampark):not(.baps-ds-sampark baps-link) .baps-link__anchor:not(.baps-link--disabled) {
      color: var(--color-mybky-primary-default, #5f78b8);
    }
    baps-link.baps-link--primary:not(.baps-sampark):not(.baps-ds-sampark baps-link) .baps-link__anchor:hover {
      color: var(--color-mybky-primary-hover, #4c6095);
      text-decoration: underline;
    }
    baps-link.baps-link--primary:not(.baps-sampark):not(.baps-ds-sampark baps-link) .baps-link__anchor:active {
      color: var(--color-mybky-primary-active, #384871);
    }

    /* ── Sampark ── */
    :is(baps-link.baps-sampark, .baps-ds-sampark baps-link).baps-link--primary .baps-link__anchor:not(.baps-link--disabled) {
      color: var(--color-sampark-primary-default, #c96868);
    }
    :is(baps-link.baps-sampark, .baps-ds-sampark baps-link).baps-link--primary .baps-link__anchor:hover {
      color: var(--color-sampark-primary-hover, #b44141);
      text-decoration: underline;
    }
    :is(baps-link.baps-sampark, .baps-ds-sampark baps-link).baps-link--primary .baps-link__anchor:active {
      color: var(--color-sampark-primary-100, #873030);
    }

    /* ── Secondary — Figma node 13197:91800, Link=Secondary ──
       Mono ramp, not the brand ramp: Mono/80 #595656 at rest, Mono/100
       #151414 + underline on hover. Figma only draws it for Sampark, but the
       mono ramp is shared, so one brand-agnostic pair covers both skins.
       No :active step is drawn — it inherits the hover colour.

       The brand blocks above are keyed on .baps-link--primary precisely so
       these two rules do not have to out-specify them. */
    baps-link.baps-link--secondary .baps-link__anchor:not(.baps-link--disabled) {
      color: var(--color-sampark-text-secondary, #595656);
    }
    baps-link.baps-link--secondary .baps-link__anchor:hover {
      color: var(--color-sampark-text-primary, #151414);
      text-decoration: underline;
    }

    /* ── Disabled ──
       This rule is (0,2,1) and every variant colour rule above out-specifies
       it: the brand blocks reach (0,3,1) and their dark-mode counterparts
       (0,4,1), so a disabled link kept rendering in the brand colour instead
       of the muted grey. Raising this rule to win would mean chasing the
       highest selector in the file forever, so the variant rules exclude the
       disabled state instead — semantically the right way round, since a
       disabled link should never take a brand colour in the first place.

       Only the REST-state rules carry the :not(). Hover and active do not
       need it: pointer-events: none below means they can never match. */
    baps-link .baps-link__anchor.baps-link--disabled {
      color: var(--color-sampark-text-disabled, #bcb9b9);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* ── Focus ring ── */
    baps-link .baps-link__anchor:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
      border-radius: 2px;
    }

    /* ── Dark mode ── */
    .baps-dark baps-link.baps-link--primary:not(.baps-sampark):not(.baps-ds-sampark baps-link) .baps-link__anchor:not(.baps-link--disabled) {
      color: var(--color-mybky-blue-200, #bdc6e4);
    }
    .baps-dark :is(baps-link.baps-sampark, .baps-ds-sampark baps-link).baps-link--primary .baps-link__anchor:not(.baps-link--disabled) {
      color: var(--color-sampark-primary-40, #d48787);
    }
    .baps-dark baps-link.baps-link--secondary .baps-link__anchor:not(.baps-link--disabled) {
      color: var(--color-mybky-mono-400, #b6b6af);
    }
    .baps-dark baps-link.baps-link--secondary .baps-link__anchor:hover {
      color: var(--color-mybky-mono-50, #f8fafb);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-link--primary]': "variant === 'primary'",
    '[class.baps-link--secondary]': "variant === 'secondary'",
    '[class.baps-link-sm]': "size === 'small'",
    '[class.baps-link-lg]': "size === 'large'",
    '[class.baps-link-xl]': "size === 'xlarge'",
  },
})
export class BapsLink {
  /** Target URL. */
  @Input() href?: string;
  /** Link target: '_blank', '_self', etc. */
  @Input() target?: string;
  /** Prevents interaction — greys out and removes pointer events. */
  @Input() disabled = false;
  /**
   * Figma node 13197:91800 draws two: Primary (the brand ramp — maroon for
   * Sampark, blue for MyBKY) and Secondary (the shared mono ramp, #595656 →
   * #151414 on hover). Primary is the default, so nothing existing moves.
   */
  @Input() variant: 'primary' | 'secondary' = 'primary';
  /**
   * S / L / XL from the same node, named after the rendered box height
   * (16 / 18 / 20px) — the type is 12 / 14 / 16px at 1.3 line-height.
   * Undefined keeps the historic `font-size: inherit`.
   */
  @Input() size?: 'small' | 'large' | 'xlarge';
  /** Visual skin. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
