import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Chip } from 'primeng/chip';

/** Colour ramp. Mirrors Figma's "Badge" property. */
export type BapsChipSeverity =
  | 'grey'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'warning'
  | 'error'
  | 'success';

/** Height ramp: 18 / 22 / 26 / 32px. L is the mobile size. */
export type BapsChipSize = 'xs' | 's' | 'm' | 'l';

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
 * The 99px-vs-4px split is not a stray number — the token file calls the two
 * shapes a different philosophy, so a chip that pilled in Sampark would read
 * as the wrong brand even with the right colours.
 *
 * The multiselect's own chips are styled in styles/components/select, scoped
 * under `.p-multiselect`, so nothing here reaches them and nothing there
 * reaches a standalone chip.
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

      <!-- Count and chevron are projected AFTER the label, which is where the
           Figma frame puts them. Both sit in normal flow; only the remove
           control is taken out of it, so a chip that gains a count grows and a
           chip that gains a remove does not. That asymmetry is the design's:
           the count is content, the remove is an affordance. -->
      @if (count !== undefined && count !== null) {
        <span class="baps-chip__count">{{ count }}</span>
      }
      @if (chevron) {
        <!-- 10x10, LAST child — after the count, per Figma "Badge Chevron"
             (22465:95774). Inline rather than baps-icon: the chip's content is
             projected into PrimeNG's template, and importing the icon component
             here would pull the whole 545-glyph registry into every chip. Same
             path as the angle-down icon, so the two cannot drift. -->
        <!-- Geometry lifted VERBATIM from the exported Figma asset for "Badge
             Chevron" — viewBox, path and stroke width all as the frame draws
             them. Only the stroke colour changes, to currentColor, so the
             chevron follows the chip's ink in both brands.

             The path spans x 1.67 to 8.33 of a 10-unit box: the glyph fills 67%
             of its square. An earlier version reused the icon set's 24-unit
             viewBox with a path spanning only 8 to 16 — 33% — so the chevron
             drew at HALF the width, with a 2/24 stroke that resolved to 0.83px
             at a 10px box instead of 1px. That is the size mismatch. -->
        <svg
          class="baps-chip__chevron"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M8.33341 3.66699L5.00008 6.33366L1.66675 3.66699"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
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
      /* #1514140a — Mono/20% Black, per BOTH the Sampark badge guide and the
         Figma variable set. mono-20 (#f3f2f2) is the opaque disable ground and
         reads a step too heavy for a chip fill. */
      --baps-chip-bg: var(--tag-sampark-grey-background, #1514140a);
      /* Mono/80, not Mono/100. Both badge guides put grey text at #595656 and
         that IS Sampark Mono/80; #151414 is the heading ink and made a resting
         grey chip read as strongly as the row it sits in. */
      --baps-chip-text: var(--color-sampark-text-secondary, #595656);
      --baps-chip-border: var(--tag-sampark-grey-border, #e1e0e0);
      --baps-chip-border-hover: var(--tag-sampark-grey-border-hover, #9f9c9c);
      --baps-chip-radius: var(--radius-sampark-default, 0.25rem);
      --baps-chip-height: 1.5rem;
      --baps-chip-padding: 0.0625rem 0.5rem;
      --baps-chip-font-size: 0.8125rem;
      --baps-chip-font-weight: 400;
    }

    /* ── Hover border, every severity ──
       The badge guides give a border-hover per variant, and in BOTH brands that
       column is identical to the Text+Icon column for all six non-grey rows:
       primary #384871/#b44141, info #2265c3/#0661e0, warning #c38222/#e08705,
       error #c32226/#cc0005, success #178251/#089152, secondary #2b2f32/#2c2c2a.

       So this is one rule, not twelve: a chip with a severity hovers to its own
       ink. --baps-chip-text is already brand-correct by the time this reads it,
       which is why no Sampark twin is needed.

       Grey is deliberately NOT matched — it has no data-severity attribute and
       keeps Mono/60 (#9f9c9c) from the base block, per the guide. Disabled
       re-points border-hover to its resting border further down, so it still
       does not move. Without this rule every severity hovered to grey's
       #9f9c9c, which is what the warning and success chips showed. */
    baps-chip[data-severity] {
      --baps-chip-border-hover: var(--baps-chip-text);
    }

    /* ── Severity ramps — Figma "Badge", MyBKY 22465:95582 / Sampark 13197:90701
       Seven severities, three values each: a 20%-tinted fill, a 100/80-weight
       ink, and a 20%-alpha edge. Grey is the default and is NOT listed here —
       it is the base block above, so an unmarked chip renders exactly as it did
       before these ramps existed.
       ───────────────────────────────────────────────────────────────────── */
    baps-chip[data-severity='primary'] {
      --baps-chip-bg: var(--color-mybky-blue-50, #eef0f8);
      --baps-chip-text: var(--color-mybky-primary-80, #384871);
      /* #9fadd933 per the MyBKY badge guide, not primary-alpha20 (#5f78b833).
         The ramp step differs: the guide takes the 400 tint at 20%, not the 600. */
      --baps-chip-border: var(--tag-mybky-primary-border, #9fadd933);
    }
    baps-chip[data-severity='secondary'] {
      --baps-chip-bg: var(--color-mybky-mono-50, #f8fafb);
      --baps-chip-text: var(--color-mybky-secondary-80, #2b2f32);
      --baps-chip-border: var(--color-mybky-secondary-alpha20, #6f777d33);
    }
    baps-chip[data-severity='info'] {
      --baps-chip-bg: var(--color-mybky-info-20, #d8e7fd);
      --baps-chip-text: var(--color-mybky-info-100, #2265c3);
      --baps-chip-border: var(--color-mybky-info-alpha20, #528de033);
    }
    baps-chip[data-severity='warning'] {
      --baps-chip-bg: var(--color-mybky-warning-20, #fdedd8);
      --baps-chip-text: var(--color-mybky-warning-100, #c38222);
      --baps-chip-border: var(--color-mybky-warning-alpha20, #e0a65233);
    }
    baps-chip[data-severity='error'] {
      --baps-chip-bg: var(--color-mybky-error-20, #fdd8d8);
      --baps-chip-text: var(--color-mybky-error-100, #c32226);
      --baps-chip-border: var(--color-mybky-error-alpha20, #b8474a33);
    }
    baps-chip[data-severity='success'] {
      --baps-chip-bg: var(--color-mybky-success-20, #d8fdeb);
      --baps-chip-text: var(--color-mybky-success-100, #178251);
      --baps-chip-border: var(--color-mybky-success-alpha20, #40bf8433);
    }

    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip)[data-severity='primary'] {
      /* Primary/10% — rgba(135,48,48,.1), per the Sampark token table. An
         earlier guide in the same thread gave the OPAQUE #f8ecec for this cell;
         the token table is the more specific source and is what shipped in
         spm-ui, so it wins. Flagged rather than silently picked. */
      --baps-chip-bg: var(--color-sampark-primary-alpha10, rgba(135, 48, 48, 0.1));
      --baps-chip-text: var(--color-sampark-primary-80, #b44141);
      --baps-chip-border: var(--color-sampark-primary-alpha20, #87303033);
    }
    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip)[data-severity='secondary'] {
      --baps-chip-bg: var(--color-sampark-secondary-10, #e6e6e5);
      --baps-chip-text: var(--color-sampark-secondary-80, #2c2c2a);
      --baps-chip-border: var(--color-sampark-secondary-alpha20, #4a494733);
    }
    /* info / warning / success take the -10 step, NOT -20, and error takes -20.
       That is not a typo: the Sampark code ramp is offset one step from the
       Figma names for three of the four. Figma "Info/20" is #e6f0fe, which is
       --color-sampark-info-10; "Error/20" is #fde8e8, which really is
       --color-sampark-error-20. Measured, after the -20 tokens rendered
       #b4d3fd / #fddfb4 / #bcf5cf against the frame's pale tints. The table
       and tag skins record the same drift. Values below follow the FRAME. */
    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip)[data-severity='info'] {
      --baps-chip-bg: var(--color-sampark-info-10, #e6f0fe);
      --baps-chip-text: var(--color-sampark-info-100, #0661e0);
      --baps-chip-border: var(--color-sampark-info-alpha20, #3889fa33);
    }
    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip)[data-severity='warning'] {
      --baps-chip-bg: var(--color-sampark-warning-10, #fef4e6);
      --baps-chip-text: var(--color-sampark-warning-100, #e08705);
      --baps-chip-border: var(--color-sampark-warning-alpha20, #faab3833);
    }
    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip)[data-severity='error'] {
      --baps-chip-bg: var(--color-sampark-error-20, #fde8e8);
      --baps-chip-text: var(--color-sampark-error-100, #cc0005);
      --baps-chip-border: var(--color-sampark-error-alpha20, #ea151a33);
    }
    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip)[data-severity='success'] {
      --baps-chip-bg: var(--color-sampark-success-10, #e8fcf0);
      --baps-chip-text: var(--color-sampark-success-100, #089152);
      --baps-chip-border: var(--color-sampark-success-alpha20, #17b56c33);
    }

    /* ── Sizes — XS 18 / S 22 / M 26 / L 32, measured off the Figma symbols
       Applied only when the size input is SET. Left unset the chip keeps the
       height, padding and type it has always had, so every existing usage
       (and the multiselect's own chips) renders unchanged.
       ───────────────────────────────────────────────────────────────────── */
    baps-chip[data-size='xs'] {
      --baps-chip-height: 1.125rem;      /* 18 */
      --baps-chip-padding: 0.25rem;      /* 4 all round */
      --baps-chip-gap: 0.25rem;          /* 4 — Figma has gap 0 plus 4px label padding */
      --baps-chip-font-size: 0.75rem;    /* 12 */
      --baps-chip-font-weight: 500;
      --baps-chip-icon-size: 0.75rem;    /* 12 */
      --baps-chip-count-size: 1rem;      /* 16 */
      --baps-chip-count-font: 0.75rem;   /* 12 */
      --baps-chip-chevron-size: 0.5rem;  /* 8 */
    }
    baps-chip[data-size='s'] {
      --baps-chip-height: 1.375rem;      /* 22 */
      --baps-chip-padding: 0.25rem 0.375rem; /* 4 6 */
      --baps-chip-gap: 0.25rem;
      --baps-chip-font-size: 0.875rem;   /* 14 — see the size note below */
      --baps-chip-font-weight: 500;
      --baps-chip-icon-size: 0.875rem;   /* 14 */
      --baps-chip-count-size: 1rem;      /* 16 */
      --baps-chip-count-font: 0.75rem;   /* 12 */
      --baps-chip-chevron-size: 0.5rem;  /* 8 */
    }
    baps-chip[data-size='m'] {
      --baps-chip-height: 1.625rem;      /* 26 */
      --baps-chip-padding: 0.25rem 0.375rem; /* 4 6 */
      --baps-chip-gap: 0.25rem;
      --baps-chip-font-size: 0.875rem;   /* 14 */
      --baps-chip-font-weight: 500;
      --baps-chip-icon-size: 1rem;       /* 16 */
      --baps-chip-count-size: 1rem;      /* 16 */
      --baps-chip-count-font: 0.75rem;   /* 12 */
      --baps-chip-chevron-size: 0.625rem; /* 10 */
    }
    baps-chip[data-size='l'] {
      --baps-chip-height: 2rem;          /* 32 */
      --baps-chip-padding: 0.25rem 0.5rem; /* 4 8 */
      --baps-chip-gap: 0.375rem;         /* 6 — Figma gap 2 plus 4px label padding */
      --baps-chip-font-size: 1rem;       /* 16 */
      --baps-chip-font-weight: 500;
      --baps-chip-icon-size: 1.25rem;    /* 20 */
      /* L shrinks its count to 12px with 10px type — smaller than M. Counter-
         intuitive, and it is what the frame says (22465:96087). */
      --baps-chip-count-size: 0.75rem;   /* 12 */
      --baps-chip-count-font: 0.625rem;  /* 10 */
      --baps-chip-chevron-size: 0.75rem; /* 12 */
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
      /* 1.3, per every Figma text node in the frame — NOT 1.

         .p-chip-label carries overflow: hidden, so a 1.0 line box is exactly
         the font size and the descenders of g, y, p are cut off inside it.
         Measured on a 12px label: box 12px, the text needs 20px, scrollHeight
         13 against clientHeight 12. That is the "text cut" — vertical, not
         horizontal, which is why checking scrollWidth found nothing. */
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

    /* Remove control — revealed on hover, and OUT OF FLOW so a resting chip
       reserves no room for it and does not resize when it appears. The disc
       carries the chip's own background so the cross sits over the tail of the
       label rather than beside it; layered on an opaque base because
       --baps-chip-bg is only 2% opaque in MyBKY and a translucent disc would
       let the label read straight through the cross.

       Same treatment as the multiselect's chips, deliberately: they are the
       same object and must not drift apart. */
    baps-chip .p-chip .p-chip-remove-icon {
      position: absolute;
      /* Flush to the edge and FULL HEIGHT — Figma "Badge Hover Action" is a
         plate pinned at right:-1px, not a glyph floating over the label.

         The old version was a 14px disc inset 4px from the edge, which landed
         in the middle of the label's last word and read as a struck-through
         chip: "Badge Te(x)". Measured on the docs page. A plate that spans the
         full height and reaches the border instead covers the tail cleanly, so
         what is underneath reads as hidden rather than defaced. */
      inset-inline-end: 0.375rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0.875rem;
      height: 0.875rem;
      color: var(--baps-chip-text);
      margin: 0;
      /* Above the plate that .p-chip::after draws. */
      z-index: 1;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease;
    }

    /* The plate the glyph sits on. A separate layer because
       .p-chip-remove-icon IS the svg — PrimeNG puts the class on the element
       itself, not a wrapper — so making it the plate stretched the cross to
       28x16 inside a 22px chip. Measured.

       Without a plate the cross lands mid-word and the chip reads as struck
       through: "Badge Te(x)". This covers the label's tail with the chip's own
       fill so what is underneath reads as hidden rather than defaced.

       Opaque, layered on the panel surface: --baps-chip-bg is only 2% opaque in
       MyBKY and a translucent plate lets the label read straight through. */
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

    /* ── Count badge ──
       Figma "Badge Notification Counts": a 16px disc on the PANEL surface, not
       on the chip's own fill — it has to read as a separate object sitting on
       the chip, which a tint of the same fill would not. Square by min/max
       width so a two-digit count widens into a stadium rather than an oval. */
    baps-chip .baps-chip__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      box-sizing: border-box;
      min-width: var(--baps-chip-count-size, 1rem);
      height: var(--baps-chip-count-size, 1rem);
      padding: 0 0.25rem;
      border: 1px solid var(--baps-chip-border);
      border-radius: 100px;
      background: var(--baps-chip-count-bg, var(--color-mybky-mono-0, #ffffff));
      color: var(--baps-chip-count-text, var(--color-mybky-mono-900, #181b1d));
      /* Its own var, not the chip font minus 2px. The frame does not derive it:
         xs/s/m all carry 12px type on a 16px disc while the chip font goes
         12 -> 14 -> 14, and L drops to 10px on a 12px disc. A calc() cannot
         express that. */
      font-size: var(--baps-chip-count-font, 0.75rem);
      font-weight: 600;
      /* 1, NOT the label's 1.3. The disc is a fixed-size circle and the digit
         is flex-centred in it, so there is no descender to protect — and a 1.3
         box is 15.6px on 12px type, which overflows the disc's 14px content
         box. Measured: 92 of the 124 matrix chips flagged after the label was
         moved to 1.3. Digits have no descenders; only the label needed the
         taller line box. */
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    :is(baps-chip.baps-sampark, .baps-ds-sampark baps-chip) {
      --baps-chip-count-bg: var(--color-sampark-mono-0, #ffffff);
      --baps-chip-count-text: var(--color-sampark-text-primary, #151414);
    }

    /* ── Chevron ──
       10x10 flat, per the frame. An earlier pass drew it with rotated borders
       at 8px: wrong size, and the rotate plus a compensating translate put its
       optical centre off the row. An SVG needs neither. */
    baps-chip .baps-chip__chevron {
      flex: none;
      width: var(--baps-chip-chevron-size, 0.625rem);
      height: var(--baps-chip-chevron-size, 0.625rem);
      /* No margin: the frame lets the chip's own gap do the spacing. */
      color: currentColor;
    }

    /* ── Disabled ──
       Not a blanket opacity on the whole chip: that would dim the count badge's white
       disc to grey and let the chip's fill show through it. Every value is
       re-pointed instead, so each part stays opaque at its own disabled tone. */
    /* Both brands read the SAME three Figma variables here — Mono/20% Black for
       the fill, Mono/40 (Disable Item) for the ink, Mono/Borders for the ring —
       so this is one shape with two palettes, not two designs. Checked against
       both disabled nodes: MyBKY 22465:95659 and Sampark 13197:90751. */
    baps-chip[data-disabled='true'] {
      /* Mono/80 @ 4%, NOT mono-50 (#f8fafb). Alpha matters: a chip sits on
         table rows and cards, and the flat fill went invisible on the striped
         row that uses the same #f8fafb. */
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
    /* The count disc is deliberately NOT muted. Both disabled nodes still bind
       it to Mono/0 (white disc) over Mono/100 (dark text) — the number is data,
       and a greyed-out 8 next to greyed-out text stops reading as a number at
       all. Only the chip's own label and chevron mute. */
    baps-chip[data-disabled='true'] .p-chip {
      cursor: not-allowed;
    }
    /* A disabled chip must not reveal a remove it cannot run. */
    baps-chip[data-disabled='true'] .p-chip:hover .p-chip-remove-icon {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    }

    /* ── Order ──
       Figma reads: leading icon, label, count, chevron.

       The DOM does not. PrimeNG renders its own ng-content slot BEFORE
       .p-chip-label, so the count and chevron this wrapper projects land to the
       LEFT of the text — measured as "8 v Badge Text" against the frame's
       "Badge Text 8 v". Nothing can be reordered in the template because the
       label is PrimeNG's to place.

       .p-chip is already a flex row, so the order property fixes it without touching the
       DOM or giving up the label input. Explicit on all four rather than
       relying on two: a flex item with no order defaults to 0 and would jump
       ahead of anything given a positive one. */
    baps-chip .p-chip .p-chip-icon,
    baps-chip .p-chip img {
      order: 0;
    }
    baps-chip .p-chip .p-chip-label {
      order: 1;
    }
    baps-chip .p-chip .baps-chip__count {
      order: 2;
    }
    baps-chip .p-chip .baps-chip__chevron {
      order: 3;
    }
    /* A projected leading icon sits in the same slot as p-chip-icon.
       The icon input takes a CSS CLASS (PrimeIcons: 'pi pi-plus-circle'), so a
       design-system glyph has to come through the content slot instead:

           <baps-chip severity="success" label="Badge Text" [count]="8">
             <baps-icon name="add-circle" [size]="14" />
           </baps-chip>

       Explicit rather than left to the initial value. An item with no order
       already computes to 0, so this reads as redundant — but every sibling
       here is numbered on purpose, and a projected icon that leans on the
       default is the one child whose position is an accident. Number it and the
       supported pattern above is guaranteed instead of coincidental. */
    baps-chip .p-chip > baps-icon {
      order: 0;
      flex: none;
    }

    /* Leading icon and image follow the size ramp when one is set. */
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
    /* Attributes, not classes: the SCSS above keys off them and an attribute
       selector reads as a value rather than a flag, which matters when the
       axis has seven of them. Bound to null when unset so the attribute is
       ABSENT rather than empty — [data-size] must not match a chip with no
       size, or the legacy geometry would be overridden by the xs block. */
    '[attr.data-severity]': "severity === 'grey' ? null : severity",
    '[attr.data-size]': 'size ?? null',
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

  /**
   * Colour ramp — Figma's "Badge" property.
   *
   * 'grey' is the default and renders exactly what this component rendered
   * before the ramps existed, so no existing usage moves.
   */
  @Input() severity: BapsChipSeverity = 'grey';

  /**
   * Height ramp: xs 18px, s 22px, m 26px, l 32px (l is the mobile size).
   *
   * Left UNSET the chip keeps its historical geometry rather than snapping to
   * one of the four. That is deliberate: the multiselect's chips and every
   * page already using baps-chip were authored against those values, and
   * defaulting to a Figma size here would silently resize all of them.
   */
  @Input() size?: BapsChipSize;

  /**
   * A count on the trailing edge, as its own disc. Pass a number or a
   * pre-formatted string; 0 renders (it is a real count), undefined does not.
   */
  @Input() count?: number | string;

  /** Trailing chevron, for a chip that opens a menu. */
  @Input() chevron = false;

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
