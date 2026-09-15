import { Directive, Input } from '@angular/core';

/**
 * bapsAccordion — Sampark skin opt-in for a PrimeNG v21 accordion.
 *
 * Applied to `p-accordion` directly rather than wrapping it, for exactly the
 * reason `bapsTabs` is — see "Why not a wrapper" below. Built for the Sampark
 * filter panel (Figma node 17512:84215 — 20 variants: ten sections across
 * Default and Open).
 *
 * Usage:
 *   <p-accordion bapsAccordion brand="sampark" [multiple]="true" [(value)]="open">
 *     <p-accordion-panel value="status">
 *       <p-accordion-header>
 *         <span class="baps-accordion-count" aria-hidden="true">4</span>
 *         <span class="baps-accordion-label">Status</span>
 *       </p-accordion-header>
 *       <p-accordion-content>
 *         <div class="baps-accordion-body">
 *           <span class="baps-accordion-divider"></span>
 *           <baps-checkbox brand="sampark" label="Complete" [(ngModel)]="complete" />
 *         </div>
 *       </p-accordion-content>
 *     </p-accordion-panel>
 *   </p-accordion>
 *
 * The `baps-accordion-*` classes are the design system's, defined in
 * `styles/components/accordion/_accordion.scss`. They are plain classes rather
 * than components for the same DI reason as the directive itself.
 *
 * Page-wide Sampark (the `.baps-ds-sampark` body class) needs no directive at
 * all — the skin accepts either scope, exactly like the tag/table/tabs skins.
 * Reach for `bapsAccordion brand="sampark"` only to opt a single accordion in
 * on an otherwise-MyBKY page.
 *
 * There is deliberately no `accordion` entry on the Sampark preset. The skin
 * has to exist regardless — the header height, the count badge and the chevron
 * box have no token, and per-instance brand cannot reach `dt` (see below) — so
 * a partial token layer for the colours alone would just be a second place to
 * edit them. The SCSS re-points custom properties that resolve to the same
 * `--color-sampark-*` values, so there is one source of truth. Same call the
 * tag, table, tabs, drawer and tooltip skins make.
 *
 * ## Why not a wrapper component
 *
 * `baps-accordion` / `baps-accordion-panel` wrapper components were written
 * first and both threw `NG0201: No provider found for _Accordion` the moment a
 * test rendered — the identical failure documented on `bapsTabs`.
 *
 * The cause is Angular's element-injector hierarchy. `AccordionPanel` resolves
 * its parent with `inject(Accordion)`, and element injectors resolve up the
 * *declaration* tree, not the *rendered* tree a node is projected into. So in
 *
 *     <baps-accordion>            <!-- template: <p-accordion><ng-content/></p-accordion> -->
 *       <baps-accordion-panel>…   <!-- template: <p-accordion-panel>…      -->
 *     </baps-accordion>
 *
 * the `p-accordion-panel` is declared inside `BapsAccordionPanel`'s view, whose
 * injector chain runs through the *consumer's* component, never through the
 * `p-accordion` element that provides `Accordion` — that element lives inside
 * `BapsAccordion`'s own view, which is not on the chain. The lookup falls
 * through to the module injector and throws. Adding providers to the wrapper
 * cannot fix it: an `Accordion` instance only exists once the wrapper's view is
 * created, which is after the projected content's injectors are already built.
 *
 * A ROOT-ONLY wrapper does not help either, and that is worth stating because
 * it is the obvious next idea: keep PrimeNG's panels and wrap only the
 * accordion, so the panels are the consumer's own markup rather than another
 * wrapper's view. Re-measured — it throws the same error:
 *
 *     NG0201: No provider found for `Accordion`.
 *     Source: Standalone[StorybookWrapperComponent]
 *
 * because a projected `p-accordion-panel` still resolves up the DECLARATION
 * tree — panel, then `baps-accordion`, then the consumer — and the
 * `p-accordion` element that provides `Accordion` sits inside
 * `baps-accordion`'s own view, which is not on that chain.
 *
 * This is also why `baps-alert` and `baps-avatar` can be wrappers and this
 * cannot: those have no child components that inject their parent. The
 * dividing line is not house style, it is whether the component is compound.
 *
 * A directive on `p-accordion` sidesteps it — the accordion is genuine PrimeNG
 * markup, so every parent lookup resolves normally.
 *
 * ## Why the brand is a class and not `dt`
 *
 * Every other brand-switchable component here passes `SAMPARK_*_TOKENS` through
 * PrimeNG's per-instance `dt` input. That is not reachable from a directive:
 * PrimeNG v21 declares `dt` as a signal input (`dt = input(...)` in
 * `primeng-basecomponent.mjs`), and signal inputs are read-only from outside,
 * so there is no way to set it on the host component. The host class plus the
 * SCSS skin is the same fallback `bapsTabs` uses.
 */
@Directive({
  selector: 'p-accordion[bapsAccordion]',
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsAccordion {
  /**
   * Visual skin. 'mybky' (default) leaves the accordion on the global preset;
   * 'sampark' adds the `.baps-sampark` host class that `_accordion.scss` keys
   * its Mono/10 header and Primary/10% count badge off.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
}
