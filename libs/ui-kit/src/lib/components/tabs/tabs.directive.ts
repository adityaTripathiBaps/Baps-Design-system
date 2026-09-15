import { Directive, Input } from '@angular/core';

/**
 * bapsTabs — Sampark skin opt-in for a PrimeNG v21 tab strip.
 *
 * Applied to `p-tabs` directly rather than wrapping it, following the same
 * convention as `bapsInputText` / `bapsTextarea` (a directive on the real
 * element) instead of the `baps-*` wrapper-component pattern used elsewhere.
 * That is a deliberate, load-bearing choice — see "Why not a wrapper" below.
 *
 * Usage:
 *   <p-tabs bapsTabs brand="sampark" [(value)]="activeTab">
 *     <p-tablist>
 *       <p-tab value="0">General</p-tab>
 *       <p-tab value="1">Members</p-tab>
 *     </p-tablist>
 *     <p-tabpanels>
 *       <p-tabpanel value="0">General content</p-tabpanel>
 *       <p-tabpanel value="1">Members content</p-tabpanel>
 *     </p-tabpanels>
 *   </p-tabs>
 *
 * Page-wide Sampark (the `.baps-ds-sampark` body class the Storybook
 * "Design system" toolbar toggles) needs no directive at all — the skin in
 * `styles/components/tabs/_tabs-sampark.scss` accepts either scope, exactly
 * like the tag/table/tooltip skins. Reach for `bapsTabs brand="sampark"`
 * only to opt a single strip in on an otherwise-MyBKY page.
 *
 * ## Why not a wrapper component
 *
 * `baps-tabs` / `baps-tab-list` / `baps-tab` / `baps-tab-panels` /
 * `baps-tab-panel` used to exist here as wrapper components, each rendering
 * its PrimeNG counterpart around an `<ng-content>`. Every one of them threw
 * `NG0201: No provider found for Tabs` the moment a story rendered.
 *
 * The cause is Angular's element-injector hierarchy, not anything fixable
 * inside the wrappers. `Tabs` publishes itself with
 * `providers: [{ provide: TABS_INSTANCE, useExisting: Tabs }, …]`, and
 * `TabList`/`Tab`/`TabPanel` each resolve their parent with
 * `inject(forwardRef(() => Tabs))`. Element injectors resolve up the
 * *declaration* tree — where a node is written — not the *rendered* tree it
 * gets projected into. So in
 *
 *     <baps-tabs>            <!-- BapsTabs template: <p-tabs><ng-content/></p-tabs> -->
 *       <p-tablist>…</p-tablist>
 *     </baps-tabs>
 *
 * `p-tablist` is declared inside `baps-tabs`, so its injector chain is
 * `p-tablist → baps-tabs → (consumer) → module injector`. The `p-tabs`
 * element that actually provides `Tabs` lives inside *BapsTabs' own view*,
 * which is not on that chain at all. The lookup falls through to the module
 * injector and throws. Adding providers to `BapsTabs` cannot fix it either:
 * a `Tabs` instance only exists once BapsTabs' view is created, which is
 * after the projected content's injectors have already been built.
 *
 * A directive on `p-tabs` sidesteps the whole problem — the tab strip is
 * genuine PrimeNG markup, so every parent lookup resolves normally, and the
 * skin is applied by a host class instead of an extra DOM layer.
 *
 * BREAKING vs the previous wrapper components: `<baps-tabs>` and friends are
 * gone. Migration is mechanical — drop the `baps-` prefix from all five tags
 * (`baps-tabs` → `p-tabs`, `baps-tab-list` → `p-tablist`, `baps-tab` →
 * `p-tab`, `baps-tab-panels` → `p-tabpanels`, `baps-tab-panel` →
 * `p-tabpanel`), import `TabsModule` from `primeng/tabs`, and move
 * `brand="sampark"` onto the `p-tabs` element alongside `bapsTabs`. Nothing
 * else changes; the rendered DOM loses one redundant wrapper element per
 * part. `[(value)]` also works now — the old `BapsTabs` re-declared `value`
 * as a plain `@Input()`, which silently dropped PrimeNG's `valueChange`
 * output and made two-way binding an NG8007 compile error.
 */
@Directive({
  selector: 'p-tabs[bapsTabs]',
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-tabs-sm]': "size === 'small'",
    '[class.baps-tabs-md]': "size === 'medium'",
    '[class.baps-tabs-lg]': "size === 'large'",
  },
})
export class BapsTabs {
  /**
   * Visual skin. 'mybky' (default) leaves the tab strip on the global preset;
   * 'sampark' adds the `.baps-sampark` host class that
   * `_tabs-sampark.scss` keys its maroon underline / 14px Inter rules off.
   */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  /**
   * Figma defines three steps (node 13197:90538 "Tab"): S 28px / 12px text,
   * M 32px / 14px, L 42px / 16px (mobile). Left undefined the strip keeps the
   * pre-existing 14px / .625rem-1rem box, which matches none of the three
   * exactly — hence opt-in rather than a defaulted `size`, so no existing
   * strip shifts.
   *
   * The size is only a host CLASS (`.baps-tabs-sm|-md|-lg`), never a
   * directive-only hook: page-wide `.baps-ds-sampark` strips carry no
   * directive at all, so they set the class on `p-tabs` by hand.
   */
  @Input() size?: 'small' | 'medium' | 'large';
}
