import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AvatarGroup } from 'primeng/avatargroup';

import type { BapsAvatarSize } from './avatar.component';

/** The overlap Figma draws at each size, in px. */
const OVERLAP: Record<'xs' | 's' | 'm' | 'l' | 'xl' | '2xl', number> = {
  xs: 6,
  s: 10,
  m: 10,
  l: 12,
  xl: 16,
  '2xl': 20,
};

/**
 * baps-avatargroup — overlapping avatars for compact multi-user contexts.
 *
 * Figma: Sampark 13197:90488, MyBKY 22465:98596. Both sheets draw the same
 * geometry: five equal boxes, each stepped left of the previous by a fixed
 * amount per size.
 *
 * The step is NOT a ratio. Measured off the sheets:
 *
 *   size   box   step   overlap
 *   xs      24     18       6
 *   s       32     22      10
 *   m       36     26      10
 *   l       48     36      12
 *   xl      60     44      16
 *   2xl     80     60      20
 *
 * 6/24 and 12/48 are a quarter, 10/32 is not, and 10/36 is not — so the design
 * chose each step rather than deriving it, and this table reproduces the
 * design rather than a formula that would be wrong at four of six sizes.
 *
 * `size` sets the overlap AND is what each child avatar should be given; the
 * group cannot set the children's size for them, because they are projected
 * content it never instantiates. Pass the same value to both:
 *
 *     <baps-avatargroup size="l" brand="sampark">
 *       <baps-avatar size="l" brand="sampark" label="RW" />
 *       …
 *     </baps-avatargroup>
 */
@Component({
  selector: 'baps-avatargroup',
  imports: [AvatarGroup],
  template: `
    <p-avatargroup [style]="style" [styleClass]="styleClass">
      <ng-content></ng-content>
    </p-avatargroup>
  `,
  // None, like every other component here: the rules below reach the projected
  // baps-avatar hosts, which a scoped stylesheet could never do.
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-avatargroup {
      display: inline-flex;
    }

    /* PrimeNG v21 renders .p-avatar-group, hyphenated — NOT the
       .p-avatargroup the component selector suggests. Both are matched: the
       class was un-hyphenated in earlier majors, and a rule that silently
       stops matching after an upgrade is exactly the failure this comment
       exists to prevent. */
    baps-avatargroup :is(.p-avatar-group, .p-avatargroup) {
      display: inline-flex;
      align-items: center;
    }

    /* PrimeNG's own group rule pulls every avatar after the first left by a
       fixed -1rem and adds a 2px white ring. Both are replaced: the ring is
       not in either sheet, and a fixed pull is wrong at five of six sizes. */
    baps-avatargroup :is(.p-avatar-group, .p-avatargroup) > baps-avatar + baps-avatar,
    baps-avatargroup :is(.p-avatar-group, .p-avatargroup) > .p-avatar + .p-avatar {
      margin-left: calc(-1 * var(--baps-avatargroup-overlap, 10px));
    }

    /* Later avatars sit ON TOP of earlier ones — the sheets stack left-over-
       right, so without this the DOM order would invert the shadowing. */
    baps-avatargroup :is(.p-avatar-group, .p-avatargroup) > baps-avatar {
      position: relative;
    }
  `,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[style.--baps-avatargroup-overlap.px]': 'overlapPx',
  },
})
export class BapsAvatarGroup {
  @Input() style?: Record<string, string | number>;
  @Input() styleClass?: string;

  /**
   * Drives the overlap. Give the projected avatars the same value — the group
   * cannot size content it does not create.
   *
   * The legacy PrimeNG names ('normal' | 'large' | 'xlarge') are accepted for
   * symmetry with baps-avatar and mapped onto the Figma steps.
   */
  @Input() size: BapsAvatarSize = 'm';

  /**
   * Host-class only. Group chrome is identical across brands — what differs is
   * the avatars inside it, which carry their own `brand`.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  protected get overlapPx(): number {
    const s = this.size;
    const figma =
      s === 'normal' ? 'm' : s === 'large' ? 'l' : s === 'xlarge' ? 'xl' : s;
    return OVERLAP[figma] ?? OVERLAP.m;
  }
}
