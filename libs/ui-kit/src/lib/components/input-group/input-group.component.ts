import { Component, Input, ViewEncapsulation } from '@angular/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { BapsBrand, injectBapsBrand } from '../../theme/brand';

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
 * Arbitrary content can use the input-group-prefix and input-group-suffix
 * slots. A CONTROL addon (a unit baps-select, or a button such as an AM/PM
 * toggle) goes in the input-group-control slot instead: it is placed straight
 * after the field as its own segment, shares the group's ring, and loses its
 * own border, so it is not wrapped in a text-addon box (AT-080).
 *
 *   <baps-input-group brand="sampark">
 *     <baps-input-number formControlName="every" brand="sampark" />
 *     <baps-select input-group-control [options]="units" formControlName="unit" brand="sampark" />
 *   </baps-input-group>
 *
 * Projected content takes precedence over the matching string input,
 * so adding a richer addon never renders duplicate text.
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
      <p-inputgroup-addon
        class="baps-input-group__addon baps-input-group__addon--prefix"
      >
        <span class="baps-input-group__addon-content">
          <ng-content select="[input-group-prefix]"></ng-content>
        </span>
        @if (prefix) {
          <span class="baps-input-group__addon-fallback">{{ prefix }}</span>
        }
      </p-inputgroup-addon>
      <ng-content></ng-content>
      <ng-content select="[input-group-control]"></ng-content>
      <p-inputgroup-addon
        class="baps-input-group__addon baps-input-group__addon--suffix"
      >
        <span class="baps-input-group__addon-content">
          <ng-content select="[input-group-suffix]"></ng-content>
        </span>
        @if (suffix) {
          <span class="baps-input-group__addon-fallback">{{ suffix }}</span>
        }
      </p-inputgroup-addon>
    </p-inputgroup>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/input-group/_input-group.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsInputGroup {
  /**
   * Text addon rendered before the field, e.g. "min". Omit for none.
   * Content projected with input-group-prefix takes precedence when both exist.
   */
  @Input() prefix?: string;
  /**
   * Text addon rendered after the field, e.g. "day/s". Omit for none.
   * Content projected with input-group-suffix takes precedence when both exist.
   */
  @Input() suffix?: string;
  /** Visual skin. */
  @Input() brand: BapsBrand = injectBapsBrand();

  /**
   * dt on p-inputgroup emits --p-inputgroup-addon-* onto the group element
   * and both addons inherit it, so one binding skins the pair.
   */
  get dt(): object {
    return ADDON_TOKENS;
  }
}
