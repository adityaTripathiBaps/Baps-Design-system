import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Tag } from 'primeng/tag';

/**
 * MyBKY tag/chip — Figma "Badge" component set (node 22465:95582), rendered
 * with PrimeNG's p-tag. Severity backgrounds/text come from the `MyBky` preset
 * (baps.theme.ts `tag` section); everything the PrimeNG tag tokens can't
 * express — the 1px border, hover ring, per-size heights and the disabled
 * state — is styled here against the --tag-mybky-* CSS variables
 * (libs/tokens build/css).
 *
 * Severity mapping mirrors events-ui's _badge.scss: no severity = Figma's
 * GREY chip; Figma's navy "Primary" chip is severity="contrast".
 */
@Component({
  selector: 'baps-tag',
  imports: [Tag],
  template: `
    <p-tag
      [value]="value"
      [severity]="severity"
      [rounded]="rounded"
      [icon]="icon"
      [style]="style"
      [styleClass]="styleClass"
    >
      <ng-content></ng-content>
      @if (chevron) {
        <span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span>
      }
      @if (action) {
        <button
          type="button"
          class="baps-tag-action"
          [attr.aria-label]="actionLabel"
          [disabled]="disabled"
          (click)="actionClick.emit($event)"
        >
          <span [class]="actionIcon" aria-hidden="true"></span>
        </button>
      }
    </p-tag>
  `,
  // Encapsulation is off so the rules below can reach the projected .p-tag
  // element; every selector is anchored to the baps-tag host tag, so nothing
  // leaks to raw p-tag usage.
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* Base = Figma S (22px). Height is explicit — PrimeNG derives it from
       padding, which drifts once the border is added. */
    baps-tag .p-tag {
      box-sizing: border-box;
      /* Height goes through a custom property because the icon-only box
         (Figma Text=False) is a square of exactly this height. */
      --baps-tag-height: var(--tag-mybky-height-s, 1.375rem);
      --baps-tag-chevron-size: 0.625rem;
      --baps-tag-action-size: 1.25rem;
      height: var(--baps-tag-height);
      line-height: 1;
      white-space: nowrap;
      /* nowrap alone made a long value grow the chip without limit — no wrap
         (height is fixed, so wrapping would overflow) and no truncation
         either, so the tag pushed its container sideways. Truncation is the
         only option left once the height is pinned. max-width is a ceiling,
         not a fixed width: short tags still size to content. Override the
         --tag-max-width custom property per call site if a wider chip is
         genuinely wanted. */
      max-width: var(--tag-max-width, 16rem);
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
      border: 1px solid var(--tag-mybky-grey-border, #e4ecf1);
      --baps-tag-border-hover: var(--tag-mybky-grey-border-hover, #9f9c9c);
      transition: border-color 150ms ease;
    }

    /* Border + hover ring per severity — bg/text come from the preset. */
    baps-tag .p-tag-contrast {
      border-color: var(--tag-mybky-primary-border, #9fadd933);
      --baps-tag-border-hover: var(--tag-mybky-primary-border-hover, #384871);
    }
    baps-tag .p-tag-secondary {
      border-color: var(--tag-mybky-secondary-border, #6f777d33);
      --baps-tag-border-hover: var(--tag-mybky-secondary-border-hover, #2b2f32);
    }
    baps-tag .p-tag-info {
      border-color: var(--tag-mybky-info-border, #528de033);
      --baps-tag-border-hover: var(--tag-mybky-info-border-hover, #2265c3);
    }
    baps-tag .p-tag-warn {
      border-color: var(--tag-mybky-warning-border, #e0a65233);
      --baps-tag-border-hover: var(--tag-mybky-warning-border-hover, #c38222);
    }
    baps-tag .p-tag-danger {
      border-color: var(--tag-mybky-error-border, #b8474a33);
      --baps-tag-border-hover: var(--tag-mybky-error-border-hover, #c32226);
    }
    baps-tag .p-tag-success {
      border-color: var(--tag-mybky-success-border, #40bf8433);
      --baps-tag-border-hover: var(--tag-mybky-success-border-hover, #178251);
    }

    baps-tag:not(.baps-tag-disabled) .p-tag:hover {
      border-color: var(--baps-tag-border-hover);
    }

    /* Sizes — only height, padding and font change; radius stays pill. */
    baps-tag.baps-tag-xs .p-tag {
      --baps-tag-height: var(--tag-mybky-height-xs, 1.125rem);
      /* Figma chevron: 8px at XS, 10px at S, 12px at L (Mob). */
      --baps-tag-chevron-size: 0.5rem;
      --baps-tag-action-size: 1rem;
      padding: var(--tag-mybky-padding-xs, 0.25rem 0.25rem);
      font-size: var(--tag-mybky-font-size-xs, 0.75rem);
    }
    baps-tag.baps-tag-m .p-tag {
      --baps-tag-height: var(--tag-mybky-height-m, 1.625rem);
      padding: var(--tag-mybky-padding-m, 0.25rem 0.375rem);
      font-size: var(--tag-mybky-font-size-m, 0.875rem);
    }
    baps-tag.baps-tag-l .p-tag {
      --baps-tag-height: var(--tag-mybky-height-l, 2rem);
      --baps-tag-chevron-size: 0.75rem;
      --baps-tag-action-size: 1.5rem;
      padding: var(--tag-mybky-padding-l, 0.25rem 0.5rem);
      font-size: var(--tag-mybky-font-size-l, 1rem);
    }

    /* Figma Text=False is a SQUARE icon box (20/22/28), not a chip that has
       shrunk to its icon — min-width, so an icon + chevron can still grow. */
    baps-tag.baps-tag-icon-only .p-tag {
      min-width: var(--baps-tag-height);
      justify-content: center;
    }

    /* Chevron (decorative) and trailing action both sit AFTER the label.
       PrimeNG projects ng-content before its own icon and label spans, so
       order is the only way to place them last. */
    baps-tag .baps-tag-chevron,
    baps-tag .baps-tag-action {
      order: 1;
      flex: none;
      color: inherit;
    }

    baps-tag .baps-tag-chevron {
      font-size: var(--baps-tag-chevron-size);
      line-height: 1;
    }

    /* The trailing glyph, sized on the same scale as the chevron.
       Without this it stays at PrimeIcons' own .pi { font-size: 1rem }: the
       BUTTON was sized per step but the icon inside it was not, so a 16px
       arrow sat in a 21px-tall extra-small pill and dwarfed the 12px leading
       icon beside it. Inheritance does not fix it — .pi sets font-size itself,
       so it has to be overridden explicitly. */
    baps-tag .baps-tag-action > span {
      font-size: var(--baps-tag-chevron-size);
      line-height: 1;
    }

    /* Trailing action — a real button, so the reset is on us. Square hit
       area sized per step; the glyph keeps the label font size. */
    baps-tag .baps-tag-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--baps-tag-action-size);
      height: var(--baps-tag-action-size);
      padding: 0;
      border: 0;
      border-radius: var(--baps-tag-action-radius, 50%);
      background: transparent;
      font: inherit;
      cursor: pointer;
      transition: background-color 150ms ease;
    }

    /* Figma shows the action plate only on hover (the frame is opacity 0 at
       rest). Mono/80 at 4% is the MyBKY stand-in for Sampark's Mono/20. */
    baps-tag:not(.baps-tag-disabled) .baps-tag-action:hover {
      background: var(--tag-mybky-action-hover-background, #2b2f320a);
    }

    baps-tag .baps-tag-action:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -2px;
    }

    /* Label carries 4px of its own inset (container 6px + label 4px = Figma's
       10px), and icons track the label's font size, per events-ui. */
    baps-tag .p-tag .p-tag-label {
      line-height: 1;
      font-size: inherit;
      font-weight: inherit;
      padding: 0 0.25rem;
    }
    baps-tag .p-tag .p-tag-label:empty {
      display: none;
      padding: 0;
    }
    baps-tag .p-tag .p-tag-icon {
      font-size: inherit;
      line-height: 1;
      color: inherit;
      /* PrimeNG sizes this box from its own tag.icon.size token — a flat 12px
         at every step — while the font-size above follows the chip's step. At
         Sampark L that is a 16px glyph drawn inside a 12px box, which is what
         made the large chip's icon look cramped against its label. Tying the
         box to the font size keeps the two in step at every size and in both
         brands, instead of overriding the width per step. */
      width: 1em;
      height: 1em;
    }

    /* Disabled — a distinct fill, not an opacity dim; hover ring suppressed
       via the :not() guard above. */
    baps-tag.baps-tag-disabled .p-tag {
      background: var(--tag-mybky-disabled-background, #2b2f320a);
      border-color: var(--tag-mybky-disabled-border, #e4ecf1);
      color: var(--tag-mybky-disabled-text, #8d9ba5);
      cursor: not-allowed;
      pointer-events: none;
    }
  `,
  host: {
    '[class.baps-tag-xs]': "size === 'xs'",
    '[class.baps-tag-m]': "size === 'm'",
    '[class.baps-tag-l]': "size === 'l'",
    '[class.baps-tag-disabled]': 'disabled',
    '[class.baps-tag-icon-only]': '!value',
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsTag {
  @Input() value?: string;
  /** No severity renders Figma's grey chip; Figma's navy "Primary" is `contrast`. */
  @Input() severity?: 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  @Input() rounded = false;
  @Input() icon?: string;
  /** Figma "Chevron=True" — decorative disclosure caret after the label. */
  @Input() chevron = false;
  /**
   * Figma "Trailing Action=True" — a real button after the label, revealed on
   * hover. Off by default; the chip stays non-interactive without it.
   *
   * Named `action`, not `removable`, deliberately. Figma calls the frame
   * "Badge Hover Action" and its glyph is a diagonal arrow (open / go to),
   * NOT a cross — so this is a generic trailing action, and modelling it as
   * a dismiss button would bake the wrong meaning into the API and into
   * every consumer's accessible name.
   */
  @Input() action = false;
  /** Figma's glyph: a diagonal "open" arrow. Override for other actions. */
  @Input() actionIcon = 'pi pi-arrow-up-right';
  /**
   * Accessible name for the trailing action — it has no text of its own, so
   * there is no sensible default. Set it to what the action actually does
   * ("Open Satsang Network", "Remove filter"); without it the button is
   * announced as nothing.
   */
  @Input() actionLabel?: string;
  @Output() actionClick = new EventEmitter<MouseEvent>();
  /** Figma sizes: xs 18px / s 22px (default) / m 26px / l 32px. */
  @Input() size: 'xs' | 's' | 'm' | 'l' = 's';
  @Input() disabled = false;
  /**
   * Sampark renders spm-ui's "Badge" spec (_tag-sampark.scss): 4px radius,
   * 20/22/28px boxes. Also applied page-wide by the .baps-ds-sampark scope.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;
}
