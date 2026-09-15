import { Component, Input, ViewEncapsulation } from '@angular/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';

/**
 * The addon skin, through PrimeNG's own tokens. Six properties is the whole
 * inputgroup token surface and all six are used here; everything the
 * component still styles in CSS has no token at all.
 *
 * Held as a module constant, not built in the getter: [dt] is re-read every
 * change detection, and a fresh object each time makes PrimeNG regenerate the
 * scoped stylesheet on every cycle.
 *
 * Not brand-conditional either. The values are geometry plus two variables
 * that each brand block re-points, so one object serves both skins.
 */
const ADDON_TOKENS = {
  addon: {
    background: 'var(--color-sampark-mono-alpha2, rgba(21, 20, 20, 0.02))',
    borderColor: 'var(--baps-ig-border)',
    color: 'var(--baps-ig-text)',
    borderRadius: '4px',
    padding: '0.5rem 0.625rem',
    minWidth: '2rem',
  },
};

/**
 * baps-input-group — one bordered field split into segments by TEXT addons.
 *
 * Renders as [ min | 15 | day/s ]: a leading addon, the field, a trailing
 * addon, sharing a single 1px ring with hairline dividers between them.
 * Figma instances Min / Max / Day / Week / Time in nodes 17512:77924,
 * 17512:82910, 17512:82727, 17512:78163, 17512:78134.
 *
 * ## Not baps-iconfield
 * baps-iconfield / baps-inputicon overlay an ICON on top of the field —
 * absolute-positioned, no divider, no reserved column. This reserves real
 * width for label text and rules it off. The API is kept in the same shape:
 * the field is projected, the wrapper only decorates it.
 *
 *   <baps-input-group prefix="min" suffix="day/s" brand="sampark">
 *     <input pInputText type="number" [(ngModel)]="days" />
 *   </baps-input-group>
 *
 * ## Figma values (17512:82916 "Min", 168x32)
 * Container: Mono/0 fill, 1px Mono/Borders (#e1e0e0), 4px radius, 32px tall.
 * Addons: 32px min-width, 8px/10px padding, 14px Inter Regular, Mono/100
 * label, one hairline divider on the inner edge only. Leading fills with
 * Mono/20% Black (4%), trailing with Mono/10% Black (which is really 2% —
 * read the value, not the name). Field is chromeless and centred; every one
 * of the five audited instances centres its value.
 *
 * ## Accessibility
 * PrimeNG's addon renders as a plain element with no role, no tabindex and no
 * handlers, so it is never announced as interactive — the requirement is met
 * by the markup as it stands and nothing had to be added or hidden. The text
 * is deliberately NOT aria-hidden: "min" and "day/s" are the unit and the
 * bound, not decoration, and a screen reader reaching the field in DOM order
 * gets them. Give the projected control its own label as usual; the addons
 * do not supply one.
 */
@Component({
  selector: 'baps-input-group',
  imports: [InputGroup, InputGroupAddon],
  template: `
    <p-inputgroup [dt]="dt">
      @if (prefix) {
        <p-inputgroup-addon>{{ prefix }}</p-inputgroup-addon>
      }
      <ng-content></ng-content>
      @if (suffix) {
        <p-inputgroup-addon>{{ suffix }}</p-inputgroup-addon>
      }
    </p-inputgroup>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-input-group {
      display: block;
      --baps-ig-surface: var(--color-mybky-mono-0, #ffffff);
      --baps-ig-border: var(--color-mybky-border-default, #e4ecf1);
      --baps-ig-text: var(--color-mybky-text-primary, #181b1d);
      --baps-ig-border-hover: var(--color-mybky-blue-400, #9fadd9);
      --baps-ig-ring: 0 0 0 3px var(--input-shadow-focused, rgba(95, 120, 184, 0.35));
    }

    :is(baps-input-group.baps-sampark, .baps-ds-sampark baps-input-group) {
      --baps-ig-surface: var(--color-sampark-mono-0, #ffffff);
      --baps-ig-border: var(--color-sampark-mono-borders, #e1e0e0);
      --baps-ig-text: var(--color-sampark-mono-100, #151414);
      --baps-ig-border-hover: var(--color-sampark-border-hover, #94928f);
      --baps-ig-ring: var(--shadow-sampark-input-focus, 0 0 0 3px #f2f1f0);
    }

    /* ── Container ──
       PrimeNG's inputgroup token surface is six addon.* properties and
       nothing for the root, so the group's own ring, radius, fill and height
       have no token and can only be CSS.

       The !important is not a preference: styles/components/input/_input.scss
       pins .p-inputgroup to height 2.25rem !important, and Figma's box is
       32px. That file is out of scope here, so this rule outranks it on
       specificity instead. overflow clips the addon fills to the radius so no
       hairline shows through the corner. */
    baps-input-group .p-inputgroup {
      box-sizing: border-box;
      height: 2rem !important;
      border: 1px solid var(--baps-ig-border);
      border-radius: 4px;
      background: var(--baps-ig-surface);
      overflow: hidden;
    }

    /* Hover and focus live on the container because the projected control is
       chromeless. Both read the per-brand variables above rather than the
       shared sheet, whose --input-* pair is only re-pointed under
       .baps-ds-sampark and so painted MyBKY blue on a brand="sampark"
       instance. Sampark rings are solid Mono/20, MyBKY is a translucent
       primary, matching the standalone input in each brand. */
    baps-input-group .p-inputgroup:hover {
      border-color: var(--baps-ig-border-hover);
    }

    baps-input-group .p-inputgroup:focus-within {
      border-color: var(--baps-ig-border-hover);
      box-shadow: var(--baps-ig-ring);
    }

    /* The projected control is chromeless — the container owns the ring.
       _input.scss already says this for .p-inputgroup .p-inputtext, but only
       when that global sheet is loaded; restated so the component stands up
       on its own. Centring matches all five audited Figma instances. */
    baps-input-group .p-inputgroup .p-inputtext {
      height: 100%;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      outline: none;
      text-align: center;
      min-width: 0;
    }

    /* ── Addons ──
       background, color, borderColor, borderRadius, padding and minWidth all
       come from the six inputgroup.addon.* tokens via the dt input below.
       Only what has no token is here.

       Borders: PrimeNG gives every addon a block-start, a block-end and an
       outer inline edge, which would double up against the container ring.
       Figma draws exactly one hairline, on the inner edge. The token still
       supplies the colour; only which edges exist is restated. */
    baps-input-group .p-inputgroup > .p-inputgroupaddon {
      box-sizing: border-box;
      border: 0;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.3;
      white-space: nowrap;
      /* NO vertical padding. PrimeNG's addon token ships 8px of it, and the
         addon is only 30px tall inside a 32px group — 8 + 18.2 + 8 is 34.2,
         so the label was being squeezed against a box that could not hold it.
         The addon is already a flex row, so align-items centres the text and
         the same rule holds for the 28px .ig-sm variant without a second
         value. Horizontal padding is the token's, restated. */
      padding: 0 0.625rem;
      display: flex;
      align-items: center;
    }

    /* Leading addon sits a step darker than the trailing one (Mono/20% Black
       against Mono/10% Black). inputgroup.addon.background is a single token
       with no leading/trailing split, so it carries the trailing value and
       the leading override is here. */
    baps-input-group .p-inputgroup > .p-inputgroupaddon:first-child {
      border-inline-end: 1px solid var(--baps-ig-border);
      background: var(--color-sampark-mono-alpha4, rgba(21, 20, 20, 0.04));
    }

    baps-input-group .p-inputgroup > .p-inputgroupaddon:last-child {
      border-inline-start: 1px solid var(--baps-ig-border);
    }

    /* ── Dark mode ── */
    .baps-dark baps-input-group {
      --baps-ig-surface: var(--color-mybky-mono-800, #2b2f32);
      --baps-ig-border: var(--color-mybky-mono-600, #565652);
      --baps-ig-text: var(--color-mybky-mono-50, #f8fafb);
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsInputGroup {
  /** Text addon rendered before the field, e.g. "min". Omit for none. */
  @Input() prefix?: string;
  /** Text addon rendered after the field, e.g. "day/s". Omit for none. */
  @Input() suffix?: string;
  /** Visual skin. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /**
   * dt on p-inputgroup emits --p-inputgroup-addon-* onto the group element
   * and both addons inherit it, so one binding skins the pair.
   */
  get dt(): object {
    return ADDON_TOKENS;
  }
}
