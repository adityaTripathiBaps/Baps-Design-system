import { Directive, Input, OnChanges, inject } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';

/**
 * bapsTooltip — informational tooltip on hover/focus.
 *
 * Host directive wrapping PrimeNG Tooltip. Two content modes:
 * - Plain text: `[bapsTooltip]="'Save changes'"` — same as bare pTooltip.
 * - Rich card (Sampark Portal "Tooltips", Figma node 13197:90046): set
 *   `tooltipTitle` (+ optionally `tooltipLinkLabel`) alongside `bapsTooltip`,
 *   which then renders as the card's supporting text. Title/body are
 *   HTML-escaped before insertion; only the fixed link-arrow markup is raw.
 *
 * Tooltip's `content`/`escape`/`tooltipStyleClass` inputs are pushed onto
 * the injected host-directive instance via its public `setOption()` rather
 * than forwarded via `hostDirectives.inputs` — content here is a *computed*
 * string (title + text + link markup), not a passthrough of a single
 * bapsTooltip value, so there is no single source input to alias.
 * setOption() (not a plain property write) matters: Tooltip's `content`
 * field is only ever read inside its own `ngOnChanges`, which copies it
 * into an internal `_tooltipOptions.tooltipLabel` that `show()` actually
 * checks — that copy only runs when Angular's change-detection fires
 * Tooltip's *own* ngOnChanges (i.e. a real template binding on `[pTooltip]`
 * changed). Setting `tooltip.content = …` directly never triggers that, so
 * `tooltipLabel` stays null and `show()` silently no-ops on every hover.
 *
 * Usage:
 *   <button bapsTooltip="Save changes" tooltipPosition="top">Save</button>
 *
 *   <button
 *     bapsTooltip="Supporting text explaining the action."
 *     tooltipTitle="Tooltip title"
 *     tooltipLinkLabel="Learn more"
 *     brand="sampark"
 *   >Info</button>
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Directive({
  selector: '[bapsTooltip]',
  hostDirectives: [
    {
      directive: Tooltip,
      // `autoHide` is forwarded specifically to make tooltips usable on touch.
      // PrimeNG does bind touchstart/touchend, but with the default
      // autoHide: true both the touchend handler and the click listener call
      // deactivate() — so a tap shows the tooltip and tears it down twice in
      // the same gesture, making it unreadable on a phone. `[autoHide]="false"`
      // is the documented escape hatch and was previously unreachable through
      // this wrapper.
      inputs: ['tooltipPosition', 'tooltipEvent', 'showDelay', 'hideDelay', 'life', 'autoHide'],
    },
  ],
})
export class BapsTooltip implements OnChanges {
  private readonly tooltip = inject(Tooltip, { self: true });

  /** Plain tooltip text, or the card's supporting text when tooltipTitle is set. */
  @Input() bapsTooltip?: string;
  /** Card title — presence of this input switches to the rich card layout. */
  @Input() tooltipTitle?: string;
  /** Optional trailing link text (rendered with a "→" arrow, Sampark clay color). */
  @Input() tooltipLinkLabel?: string;
  @Input() tooltipStyleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  private get isRich(): boolean {
    return !!this.tooltipTitle;
  }

  ngOnChanges(): void {
    this.tooltip.setOption({
      tooltipLabel: this.computedContent,
      escape: !this.isRich,
      tooltipStyleClass: this.computedStyleClass,
    });
  }

  private get computedContent(): string {
    if (!this.isRich) {
      return this.bapsTooltip ?? '';
    }
    const title = `<span class="baps-tooltip-title">${escapeHtml(this.tooltipTitle ?? '')}</span>`;
    const text = this.bapsTooltip
      ? `<span class="baps-tooltip-text">${escapeHtml(this.bapsTooltip)}</span>`
      : '';
    const link = this.tooltipLinkLabel
      ? `<span class="baps-tooltip-link">${escapeHtml(this.tooltipLinkLabel)} <span class="baps-tooltip-link-arrow">&#8594;</span></span>`
      : '';
    return `${title}${text}${link}`;
  }

  private get computedStyleClass(): string {
    // Rich-card layout only has a Sampark spec today (Figma node
    // 13197:90046) — no MyBKY design exists, so the class is gated on
    // both isRich and brand rather than added unconditionally.
    const classes = [this.tooltipStyleClass, this.isRich && this.brand === 'sampark' ? 'baps-tooltip-sampark' : ''];
    return classes.filter(Boolean).join(' ');
  }
}
