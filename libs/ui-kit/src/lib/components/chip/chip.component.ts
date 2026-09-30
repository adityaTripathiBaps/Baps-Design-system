import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Chip } from 'primeng/chip';

/**
 * baps-chip — a compact label for a selected value, a filter, or an entity.
 *
 * Wraps PrimeNG Chip. This is the SAME visual object the multiselect renders
 * for each selected option, so both take their colours from the grey (no
 * severity) tag tokens rather than a second near-identical set of greys:
 *
 *   MyBKY   Mono/80 @ 2% fill · #e4ecf1 border · 99px pill · 12px/500
 *   Sampark #f3f2f2 fill      · #e1e0e0 border · 4px radius · 13px/400
 *
 * The multiselect's own chips are styled in styles/components/select, scoped
 * under `.p-multiselect`, so nothing here reaches them and nothing there
 * reaches a standalone chip.
 *
 * Severity ramps, size ramps, count badges and chevrons belong to baps-tag,
 * not baps-chip.
 */
@Component({
  selector: 'baps-chip',
  imports: [Chip],
  template: `

    <p-chip
      [label]="label"
      [icon]="icon"
      [image]="image"
      [alt]="alt"
      [removable]="removable"
      [removeIcon]="removeIcon"
      [styleClass]="resolvedClass"
      (onRemove)="remove.emit($event)"
      (onImageError)="imageError.emit($event)"
    >
      <ng-content></ng-content>
    </p-chip>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    /* MyBKY is the default brand and holds the base values; the Sampark block
       re-points the ramp. Both read from the tag's grey tokens. */
    baps-chip {
      --baps-chip-bg: var(--tag-mybky-grey-background, #2b2f3205);
      --baps-chip-text: var(--tag-mybky-grey-text, #2b2f32);
      --baps-chip-border: var(--tag-mybky-grey-border, #e4ecf1);
      --baps-chip-border-hover: var(--tag-mybky-grey-border-hover, #9f9c9c);
      --baps-chip-radius: 99px;
      --baps-chip-height: 1.375rem;
      --baps-chip-padding: 0.25rem 0.375rem;
      --baps-chip-font-size: 0.75rem;
      --baps-chip-font-weight: 500;
    }

    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip) {
      --baps-chip-bg: var(--tag-sampark-grey-background, #1514140a);
      --baps-chip-text: var(--color-sampark-text-secondary, #595656);
      --baps-chip-border: var(--tag-sampark-grey-border, #e1e0e0);
      --baps-chip-border-hover: var(--tag-sampark-grey-border-hover, #9f9c9c);
      --baps-chip-radius: var(--radius-sampark-default, 0.25rem);
      --baps-chip-height: 1.5rem;
      --baps-chip-padding: 0.0625rem 0.5rem;
      --baps-chip-font-size: 0.8125rem;
      --baps-chip-font-weight: 400;
    }

    baps-chip .p-chip {
      /* Anchor for the remove control, which is taken out of flow below. */
      position: relative;
      height: var(--baps-chip-height);
      padding: var(--baps-chip-padding);
      gap: var(--baps-chip-gap, 0.25rem);
      border-radius: var(--baps-chip-radius);
      background: var(--baps-chip-bg);
      color: var(--baps-chip-text);
      border: 1px solid var(--baps-chip-border);
      font-size: var(--baps-chip-font-size);
      font-weight: var(--baps-chip-font-weight);
      line-height: 1.3;
      white-space: nowrap;
      cursor: default;
      transition: border-color 150ms ease;
    }

    baps-chip .p-chip:hover {
      border-color: var(--baps-chip-border-hover);
    }

    baps-chip .p-chip .p-chip-label {
      font-size: var(--baps-chip-font-size);
      font-weight: var(--baps-chip-font-weight);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Remove control — revealed on hover, OUT OF FLOW so a resting chip
       reserves no room for it and does not resize when it appears. */
    baps-chip .p-chip .p-chip-remove-icon {
      position: absolute;
      inset-inline-end: 0.375rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.875rem;
      height: 0.875rem;
      color: var(--baps-chip-text);
      margin: 0;
      z-index: 1;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease;
    }

    /* Plate behind the remove glyph so it covers the label tail cleanly. */
    baps-chip .p-chip:has(.p-chip-remove-icon)::after {
      content: '';
      position: absolute;
      inset-inline-end: 0;
      top: 0;
      bottom: 0;
      width: 1.75rem;
      border-start-end-radius: inherit;
      border-end-end-radius: inherit;
      background-color: var(--baps-chip-remove-plate, var(--color-mybky-mono-50, #f8fafb));
      background-image: linear-gradient(var(--baps-chip-bg), var(--baps-chip-bg));
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease;
    }

    baps-chip .p-chip:hover::after {
      opacity: 1;
    }

    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip) {
      --baps-chip-remove-plate: var(--color-sampark-mono-10, #f8f7f7);
    }

    baps-chip .p-chip:hover .p-chip-remove-icon {
      visibility: visible;
      opacity: 1;
      pointer-events: all;
      cursor: pointer;
    }

    /* ── Disabled ── */
    baps-chip[data-disabled='true'] {
      --baps-chip-bg: var(--tag-mybky-disabled-background, #2b2f320a);
      --baps-chip-text: var(--tag-mybky-disabled-text, #8d9ba5);
      --baps-chip-border: var(--color-mybky-border-default, #e4ecf1);
      --baps-chip-border-hover: var(--color-mybky-border-default, #e4ecf1);
    }
    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip)[data-disabled='true'] {
      --baps-chip-bg: var(--tag-sampark-disabled-background, #1514140a);
      --baps-chip-text: var(--tag-sampark-disabled-text, #bcb9b9);
      --baps-chip-border: var(--color-sampark-border-default, #e1e0e0);
      --baps-chip-border-hover: var(--color-sampark-border-default, #e1e0e0);
    }
    baps-chip[data-disabled='true'] .p-chip {
      cursor: not-allowed;
    }
    baps-chip[data-disabled='true'] .p-chip:hover .p-chip-remove-icon {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }

    /* ── Order — icon before label ── */
    baps-chip .p-chip .p-chip-icon,
    baps-chip .p-chip img {
      order: 0;
    }
    baps-chip .p-chip .p-chip-label {
      order: 1;
    }
    baps-chip .p-chip > baps-icon {
      order: 0;
      flex: none;
    }

    /* Leading icon and image sizing */
    baps-chip .p-chip .p-chip-icon,
    baps-chip .p-chip img {
      width: var(--baps-chip-icon-size, 1rem);
      height: var(--baps-chip-icon-size, 1rem);
      font-size: var(--baps-chip-icon-size, 1rem);
    }

    /* ── Dark ── */
    .baps-dark baps-chip {
      --baps-chip-bg: var(--color-mybky-dark-surface-hover, #2b2f32);
      --baps-chip-text: var(--color-mybky-dark-text-primary, #f8fafb);
      --baps-chip-border: var(--color-mybky-dark-border-divider, #3d4144);
      --baps-chip-border-hover: var(--color-mybky-dark-text-muted, #6f777d);
    }
    .baps-dark :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip) {
      --baps-chip-bg: var(--color-sampark-dark-surface-hover, #2c2c2a);
      --baps-chip-text: var(--color-sampark-dark-text-primary, #f8f7f7);
      --baps-chip-border: var(--color-sampark-dark-border-divider, #4a4947);
      --baps-chip-border-hover: var(--color-sampark-dark-text-muted, #b7b6b3);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[attr.data-disabled]': 'disabled ? true : null',
  },
})
export class BapsChip {
  /** Text shown inside the chip. */
  @Input() label?: string;
  /** Leading icon class, e.g. 'pi pi-user'. */
  @Input() icon?: string;
  /** Leading image URL; takes the place of `icon` when both are set. */
  @Input() image?: string;
  /** Alt text for `image` — required for a chip whose image carries meaning. */
  @Input() alt?: string;
  /**
   * Shows the remove control. It stays hidden until the chip is hovered, so
   * a read-only list of chips is not littered with crosses.
   */
  @Input() removable = false;
  /** Override the remove glyph. PrimeNG's default is a times-circle. */
  @Input() removeIcon?: string;
  /** Additional CSS class(es) forwarded to the PrimeNG root. */
  @Input() styleClass?: string;
  /** Visual skin: 'mybky' (default) or 'sampark'. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /** Dims the chip and suppresses the remove control. */
  @Input() disabled = false;

  /**
   * styleClass plus nothing else today. Kept as a getter so the template binds
   * one expression and future state classes have a single place to land.
   */
  protected get resolvedClass(): string | undefined {
    return this.styleClass;
  }

  /** Fired when the remove control is activated. */
  @Output() remove = new EventEmitter<MouseEvent>();
  /** Fired when `image` fails to load. */
  @Output() imageError = new EventEmitter<Event>();
}
