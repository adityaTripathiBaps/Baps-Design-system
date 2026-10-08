import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { SplitButton } from 'primeng/splitbutton';
import { MenuItem, PrimeTemplate } from 'primeng/api';

/**
 * baps-split-button — primary action + dropdown of secondary actions
 * (Sampark Portal "Split Button", Figma node 13197:92206).
 *
 * Wraps PrimeNG SplitButton. The Sampark skin is CSS-only (no dt): unlike
 * baps-button, the two inner p-button instances live inside p-splitbutton,
 * so a scoped dt on the host can't reach their button tokens — the color
 * rules below restate the button.sampark.* palette instead.
 */
@Component({
  selector: 'baps-split-button',
  imports: [SplitButton, PrimeTemplate],
  template: `
    <p-splitbutton
      [label]="hasCount ? undefined : label"
      [icon]="hasCount ? undefined : icon"
      [model]="model"
      [severity]="severity"
      [size]="primeSize"
      [disabled]="disabled"
      [menuStyleClass]="menuStyleClass ?? ''"
      (onClick)="clicked.emit($event)"
    >
      @if (hasCount) {
        <ng-template pTemplate="content">
          @if (icon) {
            <span [class]="icon" aria-hidden="true"></span>
          }
          @if (label) {
            <span class="p-button-label">{{ label }}</span>
          }
          <span class="baps-splitbutton-count" [attr.aria-label]="countLabel">{{ count }}</span>
        </ng-template>
      }
    </p-splitbutton>
  `,
  encapsulation: ViewEncapsulation.None,
  // CSS lives in ../../styles/components/split-button/_split-button.scss so the same
  // rules ship to non-Angular consumers through @org/ui-kit/styles.
  styleUrls: ['../../styles/components/split-button/_split-button.scss'],
  host: {
    '[class.baps-sampark]': "brand === 'sampark'",
    '[class.baps-splitbutton-xl]': "size === 'xlarge'",
  },
})
export class BapsSplitButton {
  @Input() label?: string;
  @Input() icon?: string;
  /** Dropdown entries (PrimeNG MenuItem[]). */
  @Input() model: MenuItem[] = [];
  @Input() severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  /** 'xlarge' is a host-class step (40px Sampark) — PrimeNG stops at 'large'. */
  @Input() size?: 'small' | 'large' | 'xlarge';
  @Input() disabled = false;
  @Input() menuStyleClass?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  /**
   * Figma "Button Notification Counts" (node 13197:92212) — the tally pill
   * that sits after the label, inside the action segment.
   *
   * Setting it switches the label segment to a content template, because
   * PrimeNG renders the label input as bare text with nowhere to put a
   * sibling. Left unset, the component takes PrimeNG's own label/icon path
   * exactly as before, so no existing call site changes.
   */
  @Input() count?: number | string | null;
  /**
   * Accessible name for the tally. A bare number announces as "8" with no
   * indication of what is counted, so set it to the meaning
   * ("8 pending approvals").
   */
  @Input() countLabel?: string;

  /** 0 is a meaningful tally: only null/undefined/empty hides the pill. */
  get hasCount(): boolean {
    return this.count !== null && this.count !== undefined && this.count !== '';
  }

  /** Fires when the default (label) segment is clicked. */
  @Output() clicked = new EventEmitter<MouseEvent>();

  get primeSize(): 'small' | 'large' | undefined {
    return this.size === 'xlarge' ? undefined : this.size;
  }
}
