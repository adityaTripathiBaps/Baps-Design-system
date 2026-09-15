import {
  Component,
  DOCUMENT,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { SharedModule } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
// Imported directly from the generated file (not the '@org/tokens' barrel) for
// the same AOT re-export elision issue documented in baps.theme.ts, and the
// same way sampark.theme.ts reaches for it.
// eslint-disable-next-line @nx/enforce-module-boundaries
import * as tokens from '@org/tokens/generated/tokens';

/**
 * Which way the shell aligns its title and body text.
 *
 * `'center'` is the Figma default (17512:84190 / 83559 / 83546 — every small
 * confirm centres illustration, title and body). `'start'` is what the larger
 * form modals need (17512:83001 "Auto Assign Families", 17512:84005), where
 * the body is a column of checkboxes, switches and inputs that must read as a
 * left-aligned form even though the button pair below stays centred.
 */
export type BapsDialogAlign = 'center' | 'start';

/**
 * Sampark shell, as PrimeNG design tokens rather than component CSS.
 *
 * Values are read off the Figma variables (get_variable_defs on 17512:84190),
 * NOT off the Tailwind fallbacks in the generated reference code — those
 * fallbacks say `#0e0d0d` / `#4a4848` / `#e6e5e5`, while the bound variables
 * resolve to Mono/100 `#151414`, Mono/80 `#595656`, Mono/Borders `#e1e0e0`,
 * which is exactly this repo's sampark ramp.
 *
 * `shadow` is a straight hit: Figma's `0px 0px 40px rgba(0,0,0,0.25)` is
 * character-for-character `shadow.sampark.drawer`, already in the token file
 * for the filter drawer. Both are "a surface floating over the whole page".
 *
 * `borderRadius` is the one value with NO token: Figma renders the shell at
 * 16px, and `radius.sampark.md` (8px) is the largest step on the ramp —
 * despite its comment claiming it covers "cards, dialogs, toast". Same gap
 * `drawer.sampark.radius` had to be added for. Left as a literal here rather
 * than editing the token file, which is out of scope for this component.
 */
const SAMPARK_DIALOG_TOKENS = {
  root: {
    background: tokens.ColorSamparkSurfaceCard,
    // Figma draws no stroke on the shell, only the 40px shadow. PrimeNG's
    // stock preset paints one, so it has to be actively removed.
    borderColor: 'transparent',
    // Body copy colour — Mono/80. The title overrides to Mono/100 in CSS
    // because the dialog token surface has no `title.color`.
    color: tokens.ColorSamparkTextSecondary,
    borderRadius: '1rem',
    shadow: tokens.ShadowSamparkDrawer,
  },
  header: { padding: `${tokens.Space8} ${tokens.Space8} 0`, gap: tokens.Space2 },
  title: { fontSize: '1.25rem', fontWeight: '600' },
  content: { padding: `${tokens.Space6} ${tokens.Space8} 0` },
  footer: { padding: `${tokens.Space6} ${tokens.Space8} ${tokens.Space8}`, gap: tokens.Space2 },
};

/**
 * The same shell on the MyBKY ramp.
 *
 * There is no MyBKY dialog in Figma, so the geometry is carried over verbatim
 * and only the ramp changes. That is deliberate: `delete-confirmation.mdx`
 * records that `baps-drawer` gives `brand="mybky"` *nothing* — every story on
 * that page is forced to `brand="sampark"` for want of a MyBKY skin — and
 * repeating that here would ship the same hole twice.
 */
const MYBKY_DIALOG_TOKENS = {
  root: {
    background: tokens.ColorMybkySurfaceCard,
    borderColor: 'transparent',
    color: tokens.ColorMybkyTextSecondary,
    borderRadius: tokens.RadiusMybkyMd,
    shadow: tokens.ShadowMybkyCard,
  },
  header: SAMPARK_DIALOG_TOKENS.header,
  title: SAMPARK_DIALOG_TOKENS.title,
  content: SAMPARK_DIALOG_TOKENS.content,
  footer: SAMPARK_DIALOG_TOKENS.footer,
};

/**
 * baps-dialog — a centred, masked modal that stops the page until it is
 * resolved. The component `patterns/delete-confirmation.mdx` was written
 * around the absence of.
 *
 * Wraps PrimeNG v21 `p-dialog`, so the mask, the focus trap, Escape handling,
 * scroll blocking and `role`/`aria-modal`/`aria-labelledby` are PrimeNG's.
 * What this adds is the Sampark Portal shell (Figma 17512:84190 and its two
 * siblings 17512:83559 / 17512:83546 — three instances of one 500px box) and
 * the two things PrimeNG does not do: focus restoration, and a centred
 * equal-width action pair.
 *
 * ## Anatomy
 *
 *   <baps-dialog [(visible)]="open" header="Cancel Document Upload" brand="sampark">
 *     <img dialog-media src="…" alt="" width="100" height="100" />
 *
 *     <p>You are about to cancel the current upload.</p>
 *
 *     <div dialog-footer>
 *       <baps-button label="Continue Upload" severity="secondary" [outlined]="true" />
 *       <baps-button label="Yes, Cancel" severity="danger" />
 *     </div>
 *   </baps-dialog>
 *
 * `dialog-media`, `dialog-title` and `dialog-footer` are bare attribute slots,
 * the convention `baps-drawer` / `baps-card` / `baps-navbar` already use, so
 * there are no marker directives to import. Both header slots are optional —
 * `header` alone covers the common case.
 *
 * ## Two sizes, one shell
 *
 * `width` defaults to the 500px confirm (17512:84190). The larger form modals
 * (17512:83001 at 600px) are the same shell with a richer body, so they are
 * `width="37.5rem"` plus `align="start"`, not a different component.
 *
 * ## Accessibility: what is PrimeNG's and what is not
 *
 * PrimeNG ships `role` (default `dialog`), `aria-modal="true"`,
 * `aria-labelledby` pointing at the title element, a `pFocusTrap` around the
 * panel, initial focus on show (`focusOnShow`), Escape-to-close
 * (`closeOnEscape`) and `blockScroll`.
 *
 * PrimeNG does NOT restore focus to the element that opened the dialog — it
 * captures nothing on open and calls nothing on close, so after a close the
 * caret lands on `<body>` and the next Tab starts from the top of the page.
 * The `visible` setter below captures `document.activeElement` on the
 * false→true edge and puts it back on the true→false edge.
 *
 * The other correction is `aria-labelledby`: PrimeNG only stamps the label id
 * onto its *own* title span, and drops it the moment a header template is
 * supplied. This wrapper always supplies one (the shell stacks an
 * illustration above the title, which PrimeNG's header cannot express), so it
 * takes the id back off the template context and puts it on its own title
 * element. Miss that and every dialog here would be an unlabelled one.
 *
 * ## Defaults that differ from PrimeNG's, on purpose
 *
 * - `closable = false`. None of the five Figma modals has a header close
 *   button; the footer's Cancel is the dismiss affordance, and it is a full
 *   150px target rather than the drawer's 32px one that `drawer.mdx` flags.
 * - `dismissableMask = false`. A modal exists because the decision must be
 *   resolved; a stray mask click under a mouse that just travelled to a
 *   destructive button must not resolve it. Escape still works.
 * - `blockScroll = true`. The page behind a blocking decision should not
 *   scroll away from it.
 * - `appendTo = 'body'`. A dialog is usually opened from a table cell, and
 *   `.baps-table-surface` has `overflow` — a `'self'`-attached panel is
 *   clipped by it.
 * - `draggable` / `resizable` / `maximizable` are not exposed at all. A
 *   blocking decision that the user can drag out from under their own cursor
 *   is a worse decision surface, and none of the Figma shells offer it.
 */
@Component({
  selector: 'baps-dialog',
  imports: [Dialog, SharedModule],
  template: `
    <p-dialog
      [visible]="visible"
      (visibleChange)="onVisibleChange($event)"
      [modal]="modal"
      [role]="role"
      [closable]="closable"
      [closeOnEscape]="closeOnEscape"
      [dismissableMask]="dismissableMask"
      [blockScroll]="blockScroll"
      [appendTo]="appendTo"
      [draggable]="false"
      [resizable]="false"
      [closeAriaLabel]="closeAriaLabel"
      [style]="panelStyle"
      [styleClass]="resolvedPanelStyleClass"
      [maskStyle]="maskStyle"
      [dt]="dt"
      (onShow)="shown.emit()"
      (onHide)="hidden.emit()"
    >
      <!-- Replaces PrimeNG's title span outright, because the shell stacks a
           100x100 illustration above the title and PrimeNG's header has no
           slot for that. The ariaLabelledBy id comes back out of PrimeNG own
           template context so the id it already wrote into aria-labelledby
           still resolves to a real element. -->
      <ng-template pTemplate="header" let-labelId="ariaLabelledBy">
        <div class="baps-dialog__heading">
          <ng-content select="[dialog-media]"></ng-content>
          <div class="baps-dialog__title" [id]="labelId">
            @if (header) {
              {{ header }}
            }
            <ng-content select="[dialog-title]"></ng-content>
          </div>
        </div>
      </ng-template>

      <ng-content></ng-content>

      <!-- Always declared, so PrimeNG's *ngIf="footerTemplate" is always true
           and .p-dialog-footer always exists. It collapses via :empty in the
           styles below when nothing is projected — same trade baps-drawer
           makes, and cheaper than a ContentChild query for a slot whose only
           job is to disappear. -->
      <ng-template pTemplate="footer">
        <ng-content select="[dialog-footer]"></ng-content>
      </ng-template>
    </p-dialog>
  `,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
  },
  styles: `
    /* Everything below is what the PrimeNG dialog token surface
       (@primeuix/themes/types/dialog) cannot express. It exposes exactly
       root.background / borderColor / color / borderRadius / shadow,
       header.padding / gap, title.fontSize / fontWeight, content.padding and
       footer.padding / gap — all of which are set through [dt] instead, and
       none of which are repeated here. What is missing has its gap named at
       the rule that works around it. */

    /* Width is per-instance, so it rides [style] on the panel; this only caps
       it so a 500px shell does not overflow a 360px phone. No token: the
       dialog surface has no root.width or root.maxWidth. */
    .baps-dialog-panel {
      max-width: calc(100vw - 2rem);
      font-family: inherit;
    }

    /* MISSING TOKEN: content.fontSize / content.lineHeight. Figma body copy is
       Inter/H3/(14)/Regular at line-height 1.3. */
    .baps-dialog-panel .p-dialog-content {
      font-size: 0.875rem;
      line-height: 1.3;
    }

    /* The header is a plain flex row in PrimeNG (title, then the actions
       block). The shell needs a centred COLUMN of illustration-over-title, so
       the projected heading takes the full row and stacks itself. 8px gap is
       Figma 17512:84191. */
    .baps-dialog-panel .p-dialog-header {
      position: relative;
    }
    .baps-dialog-panel .baps-dialog__heading {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* MISSING TOKEN: title.color and title.lineHeight. root.color is the body
       colour (Mono/80); the title is Mono/100, one step darker, and there is
       no title.color to say so. Brand-split because it is the only rule in
       this file that differs between the two ramps — everything else brand
       specific goes through [dt]. */
    .baps-dialog-panel .baps-dialog__title {
      line-height: 1.3;
      color: var(--color-mybky-text-primary, #181b1d);
    }
    .baps-dialog-panel.baps-ds-sampark .baps-dialog__title {
      color: var(--color-sampark-text-primary, #151414);
    }

    /* MISSING TOKEN: nothing in the dialog surface addresses alignment.
       Centred is the Figma default; align="start" is the larger form modal. */
    .baps-dialog-panel .baps-dialog__heading,
    .baps-dialog-panel .p-dialog-content {
      text-align: center;
    }
    .baps-dialog-panel .baps-dialog__heading {
      align-items: center;
    }
    .baps-dialog-panel.baps-dialog-align-start .baps-dialog__heading,
    .baps-dialog-panel.baps-dialog-align-start .p-dialog-content {
      text-align: start;
    }
    .baps-dialog-panel.baps-dialog-align-start .baps-dialog__heading {
      align-items: flex-start;
    }

    /* closable is off by default, but when it is on the close button must not
       shove a centred title off centre — so it leaves the flex flow. */
    .baps-dialog-panel .p-dialog-header-actions {
      position: absolute;
      top: 1rem;
      inset-inline-end: 1rem;
    }

    /* MISSING TOKEN: footer.justifyContent, and nothing at all for the width
       of an action. PrimeNG's stock footer is right-aligned with intrinsic
       widths; Figma 17512:84200 is a centred pair of 150px buttons, 8px apart
       (the gap IS a token, footer.gap, set via [dt]). */
    .baps-dialog-panel .p-dialog-footer {
      display: flex;
      justify-content: center;
    }
    /* The documented slot usage wraps the actions in ONE element (see the
       example on the class above: a div carrying the dialog-footer attribute),
       so the footer has a single child and the rules below were sizing that
       wrapper to 150px instead of the buttons. The buttons inside it are
       block-level, so they stacked vertically in a 150px column — two 36px
       buttons in a 112px footer, which is what shipped.

       display: contents drops the wrapper's own box out of the layout tree so
       its children become the footer's flex items directly. Selector matching
       still walks the DOM, not the layout tree, so the sizing rules need the
       extra level spelled out; both shapes are listed so actions passed as
       direct children keep working too. */
    .baps-dialog-panel .p-dialog-footer > [dialog-footer] {
      display: contents;
    }
    .baps-dialog-panel .p-dialog-footer > *,
    .baps-dialog-panel .p-dialog-footer > [dialog-footer] > * {
      flex: 0 0 9.375rem;
    }
    .baps-dialog-panel .p-dialog-footer > * .p-button,
    .baps-dialog-panel .p-dialog-footer > [dialog-footer] > * .p-button {
      width: 100%;
    }
    .baps-dialog-panel.baps-dialog-actions-end .p-dialog-footer {
      justify-content: flex-end;
    }
    .baps-dialog-panel.baps-dialog-actions-end .p-dialog-footer > *,
    .baps-dialog-panel.baps-dialog-actions-end .p-dialog-footer > [dialog-footer] > * {
      flex: 0 0 auto;
    }
    .baps-dialog-panel.baps-dialog-actions-end .p-dialog-footer > * .p-button,
    .baps-dialog-panel.baps-dialog-actions-end .p-dialog-footer > [dialog-footer] > * .p-button {
      width: auto;
    }

    /* The footer template is declared unconditionally so PrimeNG always
       renders the region; this is what makes an action-less dialog not show
       a 56px empty strip. The comment node ng-content leaves behind does not
       defeat :empty. */
    .baps-dialog-panel .p-dialog-footer:empty {
      display: none;
    }
    .baps-dialog-panel .p-dialog-content:has(+ .p-dialog-footer:empty) {
      padding-bottom: 2rem;
    }
  `,
})
export class BapsDialog {
  private readonly document = inject(DOCUMENT);

  /**
   * The element that had focus when the dialog opened, so it can be handed
   * focus back on close. PrimeNG tracks nothing of the sort.
   */
  private trigger: HTMLElement | null = null;

  private _visible = false;

  /**
   * Whether the dialog is open. Two-way bindable: `[(visible)]`.
   *
   * An accessor rather than a plain field because the false→true edge is the
   * only moment the opening element is still focused, and the true→false edge
   * is where it has to be given focus back. Both consumer-driven changes and
   * PrimeNG's own close (which routes through `onVisibleChange`) pass through
   * here, so there is one place that gets it right rather than two.
   */
  @Input()
  get visible(): boolean {
    return this._visible;
  }
  set visible(next: boolean) {
    if (next === this._visible) return;
    if (next) {
      const active = this.document.activeElement;
      this.trigger = active instanceof HTMLElement && active !== this.document.body ? active : null;
    } else {
      this.restoreFocus();
    }
    this._visible = next;
  }
  @Output() visibleChange = new EventEmitter<boolean>();

  /**
   * Fired after the open / close transition finishes — PrimeNG's `onShow` and
   * `onHide`, renamed to drop the `on` prefix the way every other wrapper here
   * does (`rowSelect`, `pageEvent`, `closed`), which also keeps
   * angular-eslint's `no-output-on-prefix` happy.
   */
  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  /** Title text. Carries the id that `aria-labelledby` points at. */
  @Input() header?: string;

  /**
   * Panel width. Figma ships two: 500px for the confirm shell and 600px for
   * the form modals (17512:83001). Any CSS length works; `max-width` keeps it
   * inside a narrow viewport.
   */
  @Input() width = '31.25rem';

  /** Title / body alignment. Actions stay centred either way — see `actionsAlign`. */
  @Input() align: BapsDialogAlign = 'center';

  /**
   * Footer layout. `'center'` is the Figma pair — centred, equal 150px
   * widths, 8px apart. `'end'` is the conventional right-aligned row with
   * intrinsic widths, for consumers whose footer is not a two-button pair.
   */
  @Input() actionsAlign: 'center' | 'end' = 'center';

  /**
   * `'alertdialog'` for a destructive or otherwise consequential confirm —
   * screen readers announce the body immediately rather than waiting to be
   * navigated into it.
   */
  @Input() role: 'dialog' | 'alertdialog' = 'dialog';

  /** Dim and block the page behind. */
  @Input() modal = true;
  /** Show a close button in the header. Off by default — see the class doc. */
  @Input() closable = false;
  /** Close on Escape. */
  @Input() closeOnEscape = true;
  /** Close when the mask is clicked. Off by default — see the class doc. */
  @Input() dismissableMask = false;
  /** Prevent the page behind from scrolling while open. */
  @Input() blockScroll = true;

  /**
   * Where the panel is attached in the DOM. PrimeNG defaults to `'self'`;
   * `'body'` escapes any `overflow`/`transform` ancestor that would otherwise
   * clip it, which is the realistic case for a dialog opened from a table.
   */
  @Input() appendTo: 'self' | 'body' | HTMLElement = 'body';

  @Input() closeAriaLabel = 'Close';

  /** Extra classes for the panel element. */
  @Input() styleClass?: string;

  /** Visual skin. 'sampark' also arrives page-wide via `.baps-ds-sampark`. */
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  /**
   * Mirrors PrimeNG's close back onto `visible` and re-emits it. Written out
   * in TypeScript rather than as `[(visible)]` plus a second
   * `(visibleChange)` listener on the same element for the reason
   * `baps-drawer` gives: that form puts two listeners on one element and is
   * easy to break by editing only one half.
   */
  protected onVisibleChange(next: boolean): void {
    this.visible = next;
    this.visibleChange.emit(next);
  }

  /**
   * Hand focus back to whatever opened the dialog.
   *
   * Runs on the `visible` true→false edge rather than in `onHide`, which
   * fires only after the leave motion finishes: the row that opened the
   * dialog can be re-rendered or removed by the same click that closed it,
   * and a caret parked on `<body>` for the length of an animation is a real
   * gap for keyboard users. PrimeNG's focus trap only intercepts Tab, so it
   * does not fight a focus move made while the panel is still leaving.
   */
  private restoreFocus(): void {
    const trigger = this.trigger;
    this.trigger = null;
    if (trigger?.isConnected) trigger.focus();
  }

  protected get panelStyle(): Record<string, string> {
    return { width: this.width };
  }

  /**
   * Per-instance skin via PrimeNG design tokens. Unlike most wrappers here
   * MyBKY gets a block too rather than falling through to the stock preset,
   * because there is no `components.dialog` in baps.theme.ts to fall through
   * to — an unskinned MyBKY dialog would be raw PrimeNG, which is exactly the
   * hole `delete-confirmation.mdx` records against `baps-drawer`.
   */
  protected get dt(): object {
    return this.brand === 'sampark' ? SAMPARK_DIALOG_TOKENS : MYBKY_DIALOG_TOKENS;
  }

  /**
   * The panel is portaled out of this host — and out of the document subtree
   * entirely under the default `appendTo="body"` — so neither the
   * `baps-dialog.baps-sampark` host class nor a page-wide `.baps-ds-sampark`
   * ancestor can reach it. Stamping the scope class onto the panel itself is
   * the only hook that survives the portal; `baps-select` solves the same
   * problem the same way for its option panel, and
   * `baps-table-column-config` for its drawer.
   *
   * `baps-dialog-panel` is unconditional: it is what every rule in the
   * `styles` block above is anchored to.
   */
  protected get resolvedPanelStyleClass(): string {
    return [
      'baps-dialog-panel',
      this.align === 'start' ? 'baps-dialog-align-start' : null,
      this.actionsAlign === 'end' ? 'baps-dialog-actions-end' : null,
      this.brand === 'sampark' ? 'baps-ds-sampark' : null,
      this.styleClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * PrimeNG fades the mask in with filled CSS keyframes, and a filled
   * animation outranks every normal author declaration — so a `background:`
   * rule on `.p-dialog-mask` is silently ignored however specific it is.
   * Custom properties are not animated though, and the keyframes resolve
   * `var(--p-mask-background)` on each frame, so re-pointing that variable is
   * what actually lands. It has to be set on the mask element itself, which
   * PrimeNG appends outside this host, and `maskStyle` is the supported way
   * in. Whole reasoning worked out in `baps-drawer`; the scrim value is
   * shared with it because it is one scrim (Mono/100 at 45%), and there is no
   * `dialog.sampark.*` mask token to point at instead.
   */
  protected get maskStyle(): Record<string, string> | undefined {
    return this.brand === 'sampark'
      ? { '--p-mask-background': 'var(--drawer-sampark-mask-background, rgba(14, 13, 13, 0.45))' }
      : undefined;
  }
}
