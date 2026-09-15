import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { SharedModule } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { BapsButton } from '../button/button.component';

/** Edge the panel slides in from. Mirrors PrimeNG's own `position`. */
export type BapsDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * baps-drawer — a slide-in panel anchored to an edge of the screen.
 *
 * Wraps PrimeNG v21 `p-drawer`, so the positions and behaviour are the PrimeNG
 * ones (mask, focus trap, Esc to close, scroll blocking). What this
 * adds is the Sampark skin from the Portal Figma (node 17512:72588): the
 * 16px radius on the two inner corners, the deep `0 0 40px` float shadow, the
 * 420px panel width, 24/32px padding, and a header row laid out as
 * `title · actions · close`.
 *
 * ## Anatomy
 *
 *   <baps-drawer [(visible)]="open" header="Filters" brand="sampark">
 *     <div drawer-actions>
 *       <baps-button label="Clear All" severity="secondary" [outlined]="true" size="small" brand="sampark" />
 *       <baps-button label="Apply" size="small" brand="sampark" />
 *     </div>
 *
 *     …scrollable body content…
 *
 *     <div drawer-footer>Showing 24 of 180 results</div>
 *   </baps-drawer>
 *
 * `drawer-actions` and `drawer-footer` are bare attribute slots — the same
 * convention `baps-card` and `baps-navbar` use, so there are no extra marker
 * directives to import. Both are optional; the footer row is not rendered at
 * all when nothing is projected into it.
 *
 * ## Header ordering
 *
 * PrimeNG renders its header as `[header template] → [title] → [close]`, so a
 * projected actions block would land to the LEFT of the title. The Figma has
 * `title → actions → close`. Rather than replace the whole header, the skin
 * reorders the existing flex children with `order`.
 *
 * ## The close button is a baps-button
 *
 * PrimeNG's own close is a raw `p-button` — the only control in the drawer
 * that would not go through the design system. `showCloseIcon` is therefore
 * off and this wrapper renders its own `baps-button` into the header template.
 *
 * What that had to preserve, and does: the `ariaCloseLabel`, the autofocus on
 * open, and a single `visibleChange` however the drawer is dismissed. What it
 * deliberately does NOT touch: `closable` still reaches PrimeNG for its
 * dismiss semantics, and Escape is bound on `closeOnEscape` independently of
 * the button — verified in the Drawer source rather than assumed.
 *
 * The one thing genuinely given up is `closeButtonProps`, which passed
 * arbitrary attributes to PrimeNG's button. Nothing in this workspace used it.
 *
 * ## Why wrapping is safe here
 *
 * `libs/ui-kit`'s "When NOT to wrap" rule (see CLAUDE.md) applies to PrimeNG
 * families whose children resolve a parent with `inject(forwardRef(...))` —
 * Tabs is the cautionary case. Drawer has no such children: it is a single
 * component whose body is a plain `<ng-content>`, and its own
 * `inject(DRAWER_INSTANCE, { optional: true, skipSelf: true })` is optional.
 * Projected content needs to inject nothing, so the extra boundary is inert.
 *
 * The header/footer templates DO cross that boundary — PrimeNG queries them
 * with `@ContentChild`, which resolves against the declaration tree, so a
 * consumer's `<ng-template pTemplate="footer">` written inside `<baps-drawer>`
 * would never be found. That is why this wrapper declares those two templates
 * itself and projects into them, rather than asking consumers to pass them.
 */
@Component({
  selector: 'baps-drawer',
  imports: [Drawer, SharedModule, BapsButton],
  template: `
    <p-drawer
      [visible]="visible"
      (visibleChange)="onVisibleChange($event)"
      [position]="position"
      [header]="header"
      [modal]="modal"
      [dismissible]="dismissible"
      [closable]="closable"
      [showCloseIcon]="false"
      [blockScroll]="blockScroll"
      [closeOnEscape]="closeOnEscape"
      [fullScreen]="fullScreen"
      [appendTo]="appendTo"
      [ariaCloseLabel]="ariaCloseLabel"
      [styleClass]="panelClass"
      [maskStyle]="maskStyle"
      (onShow)="shown.emit()"
      (onHide)="hidden.emit()"
    >
      <!-- Rendered into .p-drawer-header, before the title; the skin's
           CSS order rules put it back on the right, where the design has it.

           The close button is OURS, not PrimeNG's. showCloseIcon is off above
           so PrimeNG draws none: its own is a raw p-button, which is the one
           control in the drawer that would not go through baps-button. Only
           the BUTTON is replaced — closable still reaches PrimeNG for the
           dismiss semantics, and Escape is bound on closeOnEscape, which this
           does not touch (checked in the Drawer source, not assumed).

           autofocus keeps the behaviour PrimeNG had: the drawer opens with the
           close button focused, so keyboard users land somewhere useful. -->
      <ng-template pTemplate="header">
        <div class="baps-drawer__actions">
          <ng-content select="[drawer-actions]"></ng-content>
        </div>

        @if (closable) {
          <baps-button
            class="baps-drawer__close"
            icon="pi pi-times"
            severity="secondary"
            [text]="true"
            [rounded]="true"
            [autofocus]="true"
            [ariaLabel]="ariaCloseLabel"
            [brand]="brand"
            (click)="close()"
          />
        }
      </ng-template>

      <ng-content></ng-content>

      <!-- Always declared, so PrimeNG's *ngIf="footerTemplate" is always true
           and .p-drawer-footer always exists. It collapses via :empty in the
           skin when nothing is projected — cheaper than a ContentChild query
           for a slot whose only job is to disappear. -->
      <ng-template pTemplate="footer">
        <ng-content select="[drawer-footer]"></ng-content>
      </ng-template>
    </p-drawer>
  `,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
})
export class BapsDrawer {
  /** Whether the panel is open. Two-way bindable: `[(visible)]`. */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /**
   * Fired after the open / close transition finishes — PrimeNG's `onShow` and
   * `onHide`. Renamed to drop the `on` prefix, matching how every other
   * wrapper here surfaces PrimeNG events (`rowSelect`, `pageEvent`, `closed`)
   * and keeping angular-eslint's `no-output-on-prefix` happy.
   */
  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  /** Edge the panel slides in from. */
  @Input() position: BapsDrawerPosition = 'right';

  /** Title shown at the start of the header row. */
  @Input() header?: string;

  /** Dim the page behind the panel. */
  @Input() modal = true;
  /** Close when the mask is clicked. Requires `modal`. */
  @Input() dismissible = true;
  /** Show the close button in the header. */
  @Input() closable = true;
  /** Close on Escape. */
  @Input() closeOnEscape = true;
  /** Prevent the page behind from scrolling while open. */
  @Input() blockScroll = false;
  /** Expand to fill the viewport. */
  @Input() fullScreen = false;
  /**
   * Where the panel is attached in the DOM. PrimeNG defaults to `'self'`;
   * `'body'` escapes any `overflow`/`transform` ancestor that would otherwise
   * clip a fixed-position panel. The skin is a global partial precisely so it
   * keeps working either way.
   */
  @Input() appendTo: 'self' | 'body' | HTMLElement = 'self';

  @Input() ariaCloseLabel = 'Close';

  /** Extra classes for the panel element. */
  @Input() styleClass?: string;

  /** Visual skin. 'sampark' also arrives page-wide via `.baps-ds-sampark`. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /**
   * Mirrors PrimeNG's close back onto `visible` and re-emits it.
   *
   * A method rather than `[(visible)]` plus a separate
   * `(visibleChange)="visibleChange.emit($event)"`: that form puts two
   * `visibleChange` listeners on one element (the banana-in-a-box already
   * generates one), which is easy to misread as a single binding and easy to
   * break by editing only one half. Writing the state update and the re-emit
   * together in TypeScript makes the order explicit.
   */
  protected onVisibleChange(next: boolean): void {
    this.visible = next;
    this.visibleChange.emit(next);
  }

  /**
   * Closes from our own close button. Routed through the same handler the
   * PrimeNG dismiss paths use, so a consumer sees one visibleChange whichever
   * way the drawer was closed.
   */
  protected close(): void {
    this.onVisibleChange(false);
  }

  /**
   * PrimeNG fades the mask in with the `p-animate-overlay-mask-enter`
   * keyframes (`animation-fill-mode: forwards`), and a filled CSS animation
   * outranks every normal author declaration — so a `background:` rule on
   * `.p-drawer-mask` is silently ignored however specific it is, and the
   * scrim stays PrimeNG's default grey.
   *
   * Custom properties are not animated, though: the keyframes resolve
   * `var(--p-mask-background)` on each frame. Re-pointing that variable makes
   * the animation itself land on the Sampark scrim. It has to be set on the
   * mask element (PrimeNG appends it to <body>, not inside this host, so no
   * descendant selector here can reach it) — `maskStyle` is the supported
   * way in. The page-wide `.baps-ds-sampark` case is handled in
   * `_drawer-sampark.scss` by setting the same variable on the scope.
   */
  protected get maskStyle(): Record<string, string> | undefined {
    if (this.brand === 'sampark') {
      return { '--p-mask-background': 'var(--drawer-sampark-mask-background, rgba(14, 13, 13, 0.45))' };
    }
    // MyBKY frosts the scrim. This cannot be done from CSS: the mask is an
    // EMPTY element and a SIBLING of the panel under <body> (measured), so
    // neither a descendant selector nor :has() can reach it from the panel's
    // brand class. The blur belongs on the scrim, never on the panel — a
    // blurred panel blurs its own content.
    return { 'backdrop-filter': 'blur(var(--drawer-mybky-backdrop-blur, 25px))' };
  }

  /**
   * The panel is portalled out of this host (and out of it entirely when
   * `appendTo="body"`), so a host class cannot reach it. The brand opt-in has
   * to ride along on PrimeNG's own `styleClass` instead.
   *
   * BOTH brands get a class, unlike everywhere else in this library where
   * MyBKY is the unscoped default. That default relies on a host-anchored
   * selector, and a portalled panel has no host to anchor to — an unscoped
   * `.p-drawer` rule would also repaint the Sampark panel. So MyBKY names
   * itself here too, and `_drawer.scss` keys off that class.
   */
  protected get panelClass(): string {
    return [this.styleClass, `baps-drawer-${this.brand}`].filter(Boolean).join(' ');
  }
}
