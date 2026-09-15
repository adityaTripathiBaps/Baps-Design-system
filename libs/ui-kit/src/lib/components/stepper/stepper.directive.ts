import { Directive, Input } from '@angular/core';

/**
 * bapsStepper — BAPS skin opt-in for a PrimeNG v21 stepper.
 *
 * Applied to `p-stepper` directly rather than wrapping it, following the same
 * convention as `bapsTabs` and `bapsAccordion`. That is a deliberate,
 * load-bearing choice — see "Why not a wrapper" below.
 *
 * Usage:
 *   <p-stepper bapsStepper brand="sampark" [(value)]="step" [linear]="true">
 *     <p-step-list>
 *       <p-step [value]="1">Details</p-step>
 *       <p-step [value]="2">Review</p-step>
 *     </p-step-list>
 *     <p-step-panels>
 *       <p-step-panel [value]="1"><ng-template #content>…</ng-template></p-step-panel>
 *       <p-step-panel [value]="2"><ng-template #content>…</ng-template></p-step-panel>
 *     </p-step-panels>
 *   </p-stepper>
 *
 * The `#content` template is NOT optional. `p-step-panel` has no `ng-content`
 * of its own — it renders a template matched on the `content` reference — so
 * markup nested straight inside the tag produces an empty panel and no error.
 *
 * Page-wide Sampark (the `.baps-ds-sampark` body class the Storybook "Design
 * system" toolbar toggles) needs no directive at all — the skin in
 * `styles/components/stepper/_stepper.scss` accepts either scope, exactly like
 * the tabs/tag/table skins. Reach for `bapsStepper brand="sampark"` only to opt
 * a single stepper in on an otherwise-MyBKY page.
 *
 * ## Why not a wrapper component
 *
 * `baps-stepper` existed here as a wrapper rendering `<p-stepper>` around an
 * `<ng-content>`. Every story it appeared in threw `NG0201: No provider found
 * for Stepper` and rendered nothing.
 *
 * The cause is Angular's element-injector hierarchy, not anything fixable
 * inside the wrapper — the identical failure `bapsTabs` documents. `StepList`,
 * `Step`, `StepPanels` and `StepPanel` each resolve their parent by injecting
 * `Stepper`, and element injectors resolve up the *declaration* tree — where a
 * node is written — not the *rendered* tree it is projected into. So in
 *
 *     <baps-stepper>          <!-- template: <p-stepper><ng-content/></p-stepper> -->
 *       <p-step-list>…</p-step-list>
 *     </baps-stepper>
 *
 * `p-step-list` is declared inside `baps-stepper`, giving it the chain
 * `p-step-list → baps-stepper → (consumer) → module injector`. The `p-stepper`
 * element that actually provides `Stepper` lives inside BapsStepper's OWN view,
 * which is not on that chain. The lookup falls through and throws. Adding
 * providers to the wrapper cannot fix it either: a `Stepper` instance only
 * exists once the wrapper's view is created, which is after the projected
 * content's injectors have already been built.
 *
 * A directive on `p-stepper` sidesteps it — the stepper is genuine PrimeNG
 * markup, so every parent lookup resolves normally, and the skin arrives on a
 * host class instead of an extra DOM layer.
 *
 * BREAKING vs the previous wrapper: `<baps-stepper>` is gone. Migration is
 * mechanical — rename the tag to `p-stepper`, add `bapsStepper`, import
 * `StepperModule` from `primeng/stepper`, and move `brand` onto the same
 * element. `[(value)]` also works now: the old wrapper re-declared `value` as a
 * plain `@Input()` with its own `valueChange`, which shadowed PrimeNG's pair.
 * `styleClass` is gone too — put the class straight on `p-stepper`.
 */
@Directive({
  selector: 'p-stepper[bapsStepper]',
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsStepper {
  /**
   * Visual skin. 'mybky' (default) leaves the stepper on the global preset;
   * 'sampark' adds the `.baps-sampark` host class that `_stepper.scss` keys
   * its maroon accent off.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
