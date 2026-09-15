import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { StepperModule } from 'primeng/stepper';
import { BapsIcon } from '../icon/icon.component';
import { BapsOverlayBadge } from '../badge/overlay-badge.component';
import { BapsStep } from './step.component';

/**
 * baps-stepper — a multi-step flow, in the house shape.
 *
 * ## Why this can be a wrapper when the earlier attempt could not
 *
 * A `baps-stepper` existed before that rendered `<p-stepper>` around an
 * `<ng-content>`, and every story it appeared in threw `NG0201: No provider
 * found for Stepper`. `Step`, `StepList`, `StepPanel` and `StepPanels` all
 * resolve their parent with `inject(Stepper)`, and element injectors resolve
 * up the DECLARATION tree — so PrimeNG markup written by the consumer and
 * projected in looks for its stepper through the consumer, past the
 * `p-stepper` living in the wrapper's own view, and falls through to the
 * module injector.
 *
 * This shape moves the PrimeNG markup instead of the lookup. Consumers write
 * `baps-step`, which renders nothing and hands its content over as a
 * `TemplateRef`; every `p-step` and `p-step-panel` is then created HERE, in
 * the same view as the `p-stepper` that provides `Stepper`. The DI question
 * disappears rather than being worked around, and the consumer never types a
 * `p-` element. Same trick, same reason, as `baps-accordion`.
 *
 * ## What it removes from the call site
 *
 * The rail's anatomy — two connectors, the icon wrap, the overlay badge, the
 * button with its five ARIA attributes, the label — is structural. Every step
 * has it, spelled identically, and the events wizard repeated all of it eight
 * times. Here it is one element with a few attributes:
 *
 *     <baps-stepper [(value)]="current" brand="mybky" [linear]="true">
 *       <baps-step [value]="1" label="Basic Info" icon="info-circle" status="completed">
 *         …panel content…
 *       </baps-step>
 *       <baps-step [value]="2" label="Eligibility" icon="checklist" required>…</baps-step>
 *     </baps-stepper>
 *
 * Three things that were easy to get wrong at the call site are now impossible
 * to get wrong: `st.id()` is a signal and was silently interpolated uncalled;
 * the two connectors are SIBLINGS of `.baps-step`, not children; and the lift
 * is on `.baps-step__icon-wrap` while the scale is on the button, because one
 * element gets one `transform`.
 *
 * ## Both shapes, one component
 *
 * A `baps-step` WITH an icon renders the icon rail. Without one it renders a
 * plain `p-step`, letting PrimeNG draw its own number and title — the Sampark
 * shape. Mixing them in one stepper is not a supported state.
 *
 * `bapsStepper` (the directive on a raw `p-stepper`) is still there and still
 * supported — reach for it when a consumer needs PrimeNG's own step API, such
 * as a custom header template. This is the shorter road for the ordinary case.
 */
@Component({
  selector: 'baps-stepper',
  imports: [NgTemplateOutlet, StepperModule, BapsIcon, BapsOverlayBadge],
  template: `
    <p-stepper
      #st
      [value]="value"
      (valueChange)="onValueChange($event)"
      [linear]="linear"
      [class.baps-sampark]="brand === 'sampark'"
    >
      @if (railPosition === 'bottom') {
        <p-step-panels>
          @for (s of steps; track s.value) {
            <p-step-panel [value]="s.value">
              <ng-template #content>
                <ng-container *ngTemplateOutlet="s.contentTemplate" />
              </ng-template>
            </p-step-panel>
          }
        </p-step-panels>
      }

      <div [class]="railClass">
      <p-step-list>
        @for (s of steps; track s.value) {
          <p-step [value]="s.value">
            @if (s.icon) {
              <ng-template #content let-activate="activateCallback">
                <span class="baps-step__connector"></span>

                <span class="baps-step">
                  <!-- The wrap carries the LIFT; the button carries the scale.
                       One element gets one transform, so they cannot share. -->
                  <span class="baps-step__icon-wrap">
                    <baps-overlaybadge
                      severity="danger"
                      badgeSize="small"
                      [badgeDisabled]="!s.required"
                    >
                      <!-- The disabled ATTRIBUTE is real here, not only the
                           locked class: pointer-events alone still leaves the
                           slot reachable by keyboard. -->
                      <button
                        type="button"
                        role="tab"
                        [class]="classesFor(s)"
                        [disabled]="s.locked"
                        [attr.id]="st.id() + '_step_' + s.value"
                        [attr.aria-controls]="st.id() + '_steppanel_' + s.value"
                        [attr.aria-selected]="isActive(s)"
                        [attr.aria-label]="s.label"
                        [attr.aria-current]="isActive(s) ? 'step' : null"
                        (click)="activate()"
                      >
                        <baps-icon
                          class="baps-step__icon"
                          [name]="s.icon"
                          [size]="iconSize(s)"
                        />
                      </button>
                    </baps-overlaybadge>
                  </span>

                  <span class="baps-step__label">{{ s.label }}</span>
                </span>

                <span class="baps-step__connector"></span>
              </ng-template>
            } @else {
              {{ s.label }}
            }
          </p-step>
        }
      </p-step-list>
      </div>

      <!-- The panels block is written out in BOTH branches rather than
           declared once in an <ng-template> and stamped with ngTemplateOutlet.
           That was tried and rendered zero panels: an ng-template's contents
           belong to its DECLARATION site, so a p-step-panels declared outside
           <p-stepper> never has the stepper on its element-injector chain,
           whatever position it is stamped into. It is the same trap that makes
           the whole wrapper necessary — measured, 0 panels against 5 steps.
           Only one branch is ever live, so there is no duplicate in the DOM. -->
      @if (railPosition === 'top') {
        <p-step-panels>
          @for (s of steps; track s.value) {
            <p-step-panel [value]="s.value">
              <!-- p-step-panel has NO ng-content: it renders a #content
                   template only. Markup written straight inside the tag gives
                   an EMPTY panel and no error. -->
              <ng-template #content>
                <ng-container *ngTemplateOutlet="s.contentTemplate" />
              </ng-template>
            </p-step-panel>
          }
        </p-step-panels>
      }
    </p-stepper>
  `,
  // None: the skin lives in a global partial and would never reach a scoped view.
  encapsulation: ViewEncapsulation.None,
  styles: `
    baps-stepper {
      display: block;
    }
  `,
})
export class BapsStepperWrapper {
  /** Which step is open. Two-way bindable: `[(value)]`. */
  @Input() value = 1;
  @Output() valueChange = new EventEmitter<number>();

  /**
   * Blocks jumping ahead: only the current step and the ones already completed
   * are clickable. Use it when a later step needs data the earlier ones
   * collect; leave it off when the steps are independent.
   */
  @Input() linear = false;

  /**
   * Visual skin. 'sampark' adds the host class `_stepper.scss` keys its maroon
   * accent off.
   *
   * A class rather than PrimeNG's `dt`, for the reason the directive spells
   * out: v21 declares `dt` as a signal input, which is read-only from outside.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /**
   * Which side of the panels the rail sits on.
   *
   * `'bottom'` is the MyBKY event wizard: the rail is pinned under the step's
   * content, not above it. The panels are stamped from a single `ng-template`
   * on whichever side this asks for — rendering the block twice would create
   * two sets of `p-step-panel`, and PrimeNG resolves a panel by value, so the
   * second set would shadow the first.
   */
  @Input() railPosition: 'top' | 'bottom' = 'top';

  /**
   * Class for the element wrapping the rail. The rail's own geometry is the
   * skin's; this is for where the app puts it — a sticky footer, a bordered
   * band, a max-width.
   */
  @Input() railClass = '';

  @ContentChildren(BapsStep) steps!: QueryList<BapsStep>;

  protected onValueChange(next: unknown): void {
    this.value = next as number;
    this.valueChange.emit(this.value);
  }

  /**
   * The precedence list, in code rather than in stylesheet order:
   *
   *     active > completed > in-progress > invalid > default
   *
   * `locked` is not in that list — it is a wash that rides along with whatever
   * the slot already is, so a locked-and-finished step still reads as finished.
   *
   * ACTIVE WINS over completed on purpose. The step you are standing on should
   * look like the step you are standing on; having finished it earlier matters
   * less than being here now.
   */
  protected classesFor(s: BapsStep): string {
    const parts = ['baps-step__btn'];
    if (this.isActive(s)) parts.push('baps-step__btn--active');
    else if (s.status) parts.push('baps-step__btn--' + s.status);
    if (s.locked) parts.push('baps-step__btn--locked');
    return parts.join(' ');
  }

  protected isActive(s: BapsStep): boolean {
    return s.value === this.value && !s.locked;
  }

  /** 32px on the open slot, 24px everywhere else — the design system's sizes. */
  protected iconSize(s: BapsStep): number {
    return this.isActive(s) ? 32 : 24;
  }
}
