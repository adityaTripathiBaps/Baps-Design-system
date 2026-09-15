import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Draggable, Droppable } from 'primeng/dragdrop';
import { BapsDrawer } from '../drawer/drawer.component';
import { BapsButton } from '../button/button.component';
import { BapsToggleSwitch } from '../toggle-switch/toggle-switch.component';
import { BapsInputText } from '../form-field/directives/input-text.directive';
import { BapsIconField } from '../form-field/icon-field.component';
import { BapsInputIcon } from '../form-field/input-icon.component';

/**
 * A single toggleable/reorderable column, as passed to `baps-table-column-config`.
 *
 * `locked` columns (e.g. a table's lead/name column) are always visible, never
 * draggable, never pinnable — `end` anchors a locked column after the regular
 * group instead of before it (e.g. a trailing actions column). `frozen`
 * columns are user-pinned: still always visible, but movable back to regular.
 */
export interface BapsTableColumnConfigColumn {
  key: string;
  label: string;
  visible?: boolean;
  locked?: boolean;
  end?: boolean;
  frozen?: boolean;
  group?: string;
}

/**
 * baps-table-column-config — the "Fields" panel: search, an active-column
 * count, and a reorderable/pinnable column list, wrapping `baps-drawer`.
 *
 * Mirrors Sampark's `app-common-table-column` (Figma node 17512:83441):
 * three buckets — locked (always on, no drag, no pin), pinned (frozen, always
 * on, unpin to send back to regular), regular (draggable, toggleable,
 * pinnable) — plus locked columns anchored at the end via `end: true` (e.g. a
 * trailing actions column).
 *
 * Edits are staged locally and only reach the consumer on Apply — dismissing
 * the drawer (mask click, Esc, the X) discards them, matching the reference
 * panel's own semantics. `defaultColumns`, if given, is what "Reset Default"
 * reseeds from; without it, reset just unpins and shows everything.
 *
 * Usage:
 *
 *   <baps-table-column-config
 *     [(visible)]="showColumnConfig"
 *     [columns]="columns"
 *     (columnsChange)="columns = $event"
 *   />
 *
 * Sampark-only — this is `app-common-table-column`, a Sampark-specific
 * panel with no MyBKY equivalent in the spec, so unlike `baps-table` there
 * is no `brand` input; every sub-component below is pinned to
 * `brand="sampark"` and `styleClass="baps-ds-sampark"` forces the Sampark
 * skin onto the search input/switches too, regardless of the page-wide
 * design-system toggle — needed because `appendTo="body"` portals the
 * panel out of this component's own DOM, so it can never inherit a
 * `.baps-ds-sampark` ancestor class the normal way.
 */
@Component({
  selector: 'baps-table-column-config',
  imports: [
    NgTemplateOutlet,
    FormsModule,
    Draggable,
    Droppable,
    BapsDrawer,
    BapsButton,
    BapsToggleSwitch,
    BapsInputText,
    BapsIconField,
    BapsInputIcon,
  ],
  template: `
    <!-- Icon glyphs, defined once and stamped with ngTemplateOutlet.
         These used to be JS template-literal interpolations of two module
         consts. That compiles (Angular statically evaluates the literal),
         but @angular-eslint's template parser reads the RAW source, hits the
         bare brace that opens a dollar-brace interpolation, and fails the
         whole file with 'Unexpected character EOF' — one red error that masks
         every other lint result in it. (Spelling that sequence out here
         instead of showing it, because writing it literally in this comment
         would re-trigger the very parse error.) Literal markup in an
         ng-template keeps the exact Figma path data, avoids repeating it four
         times, and parses.

         Drag handle: dot grid, Figma node 17512:83441 ("Arrange") — not a
         Lucide/PrimeIcons stand-in; pi-bars is three lines, a different
         shape. Unpin: crossed pin from the same node, fill-based in the
         source (hence fill="currentColor", unlike the stroke icons here).
         There is no uncrossed "Pin" asset in that frame — it is hover-gated
         and was not in the static export — so the pin action falls back to
         PrimeIcons' pi-thumbtack. -->
    <ng-template #dragHandleIcon>
      <svg width="17" height="18" viewBox="0 0 17 18" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5.75 4.125C5.33579 4.125 5 3.78921 5 3.375C5 2.96079 5.33579 2.625 5.75 2.625C6.16421 2.625 6.5 2.96079 6.5 3.375C6.5 3.78921 6.16421 4.125 5.75 4.125Z"/>
        <path d="M5.75 7.875C5.33579 7.875 5 7.53921 5 7.125C5 6.71079 5.33579 6.375 5.75 6.375C6.16421 6.375 6.5 6.71079 6.5 7.125C6.5 7.53921 6.16421 7.875 5.75 7.875Z"/>
        <path d="M5.75 11.625C5.33579 11.625 5 11.2892 5 10.875C5 10.4608 5.33579 10.125 5.75 10.125C6.16421 10.125 6.5 10.4608 6.5 10.875C6.5 11.2892 6.16421 11.625 5.75 11.625Z"/>
        <path d="M5.75 15.375C5.33579 15.375 5 15.0392 5 14.625C5 14.2108 5.33579 13.875 5.75 13.875C6.16421 13.875 6.5 14.2108 6.5 14.625C6.5 15.0392 6.16421 15.375 5.75 15.375Z"/>
        <path d="M10.25 4.125C9.83579 4.125 9.5 3.78921 9.5 3.375C9.5 2.96079 9.83579 2.625 10.25 2.625C10.6642 2.625 11 2.96079 11 3.375C11 3.78921 10.6642 4.125 10.25 4.125Z"/>
        <path d="M10.25 7.875C9.83579 7.875 9.5 7.53921 9.5 7.125C9.5 6.71079 9.83579 6.375 10.25 6.375C10.6642 6.375 11 6.71079 11 7.125C11 7.53921 10.6642 7.875 10.25 7.875Z"/>
        <path d="M10.25 11.625C9.83579 11.625 9.5 11.2892 9.5 10.875C9.5 10.4608 9.83579 10.125 10.25 10.125C10.6642 10.125 11 10.4608 11 10.875C11 11.2892 10.6642 11.625 10.25 11.625Z"/>
        <path d="M10.25 15.375C9.83579 15.375 9.5 15.0392 9.5 14.625C9.5 14.2108 9.83579 13.875 10.25 13.875C10.6642 13.875 11 14.2108 11 14.625C11 15.0392 10.6642 15.375 10.25 15.375Z"/>
      </svg>
    </ng-template>
    <ng-template #unpinIcon>
      <svg width="16" height="16" viewBox="0 0 16.0003 16.0003" fill="currentColor" aria-hidden="true">
        <path d="M10.992 2.71292L11.3457 2.35955V2.35955L10.992 2.71292ZM13.3037 5.02699L12.95 5.38036V5.38036L13.3037 5.02699ZM5.55378 13.572L5.20005 13.9254V13.9254L5.55378 13.572ZM2.46627 10.4814L2.82 10.128H2.82L2.46627 10.4814ZM3.38378 7.00537L3.51667 7.48738L3.51667 7.48738L3.38378 7.00537ZM4.47625 6.60162L4.18411 6.19584L4.18411 6.19584L4.47625 6.60162ZM5.13742 6.66737C5.31653 6.45719 5.29135 6.14161 5.08118 5.9625C4.871 5.78339 4.55542 5.80857 4.37631 6.01874L4.75687 6.34305L5.13742 6.66737ZM9.03543 12.6511L9.51752 12.7838V12.7838L9.03543 12.6511ZM9.43768 11.5602L9.03143 11.2687L9.03143 11.2687L9.43768 11.5602ZM10.0156 11.6636C10.2243 11.4828 10.247 11.1671 10.0662 10.9583C9.88546 10.7496 9.56969 10.7269 9.36094 10.9077L9.68825 11.2856L10.0156 11.6636ZM1.03885 8.56669L0.538856 8.56984L0.538856 8.56984L1.03885 8.56669ZM1.19784 7.96433L0.76456 7.71479L0.76456 7.7148L1.19784 7.96433ZM7.47893 15.0076L7.47968 14.5076H7.47968L7.47893 15.0076ZM8.06995 14.8513L7.82213 14.417L7.82213 14.417L8.06995 14.8513ZM15.4739 8.22896L15.9626 8.33464V8.33464L15.4739 8.22896ZM11.9993 9.77794C11.7408 9.87507 11.61 10.1634 11.7072 10.4219C11.8043 10.6804 12.0926 10.8112 12.3511 10.714L12.1752 10.246L11.9993 9.77794ZM7.77294 0.527315L7.88066 1.01557V1.01557L7.77294 0.527315ZM5.30051 3.69303C5.20551 3.95232 5.33869 4.23952 5.59798 4.33452C5.85726 4.42952 6.14447 4.29634 6.23947 4.03705L5.76999 3.86504L5.30051 3.69303ZM0.146267 15.1469C-0.048896 15.3423 -0.0487349 15.6588 0.146627 15.854C0.341988 16.0492 0.658571 16.049 0.853733 15.8536L0.5 15.5003L0.146267 15.1469ZM4.34365 12.3602C4.53882 12.1648 4.53865 11.8482 4.34329 11.6531C4.14793 11.4579 3.83135 11.4581 3.63619 11.6534L3.98992 12.0068L4.34365 12.3602ZM1.38388 1.64672C1.18862 1.45145 0.872039 1.45145 0.676777 1.64672C0.481515 1.84198 0.481515 2.15856 0.676777 2.35382L1.03033 2.00027L1.38388 1.64672ZM13.6464 15.3235C13.8417 15.5188 14.1583 15.5188 14.3536 15.3235C14.5488 15.1282 14.5488 14.8116 14.3536 14.6164L14 14.9699L13.6464 15.3235ZM10.992 2.71292L10.6383 3.06629L12.95 5.38036L13.3037 5.02699L13.6575 4.67361L11.3457 2.35955L10.992 2.71292ZM5.55378 13.572L5.90751 13.2186L2.82 10.128L2.46627 10.4814L2.11253 10.8347L5.20005 13.9254L5.55378 13.572ZM3.38378 7.00537L3.51667 7.48738C4.05478 7.33903 4.44761 7.23833 4.76839 7.00739L4.47625 6.60162L4.18411 6.19584C4.04317 6.29731 3.86157 6.35499 3.25089 6.52335L3.38378 7.00537ZM4.47625 6.60162L4.76839 7.00739C4.90462 6.90931 5.02853 6.79514 5.13742 6.66737L4.75687 6.34305L4.37631 6.01874C4.31958 6.08531 4.25505 6.14477 4.18411 6.19584L4.47625 6.60162ZM9.03543 12.6511L9.51752 12.7838C9.68523 12.1742 9.74273 11.9927 9.84392 11.8517L9.43768 11.5602L9.03143 11.2687C8.80146 11.5892 8.70117 11.9812 8.55334 12.5185L9.03543 12.6511ZM9.68825 11.2856L9.36094 10.9077C9.23734 11.0147 9.12675 11.1359 9.03143 11.2687L9.43768 11.5602L9.84392 11.8517C9.89359 11.7825 9.9512 11.7194 10.0156 11.6636L9.68825 11.2856ZM2.46627 10.4814L2.82 10.128C2.33649 9.64399 2.00482 9.31089 1.78884 9.03954C1.57222 8.76737 1.5393 8.63713 1.53884 8.56353L1.03885 8.56669L0.538856 8.56984C0.541479 8.98513 0.747499 9.33698 1.00642 9.66229C1.266 9.98842 1.64649 10.3682 2.11253 10.8347L2.46627 10.4814ZM3.38378 7.00537L3.25089 6.52335C2.61548 6.69853 2.09719 6.84063 1.71051 6.99586C1.32479 7.15071 0.971863 7.35485 0.76456 7.71479L1.19784 7.96433L1.63112 8.21387C1.66775 8.15026 1.76046 8.05338 2.08306 7.92387C2.4047 7.79475 2.85741 7.66914 3.51667 7.48738L3.38378 7.00537ZM1.03885 8.56669L1.53884 8.56353C1.53806 8.44081 1.56993 8.32012 1.63112 8.21387L1.19784 7.96433L0.76456 7.7148C0.614848 7.97475 0.536961 8.26986 0.538856 8.56984L1.03885 8.56669ZM5.55378 13.572L5.20005 13.9254C5.66905 14.3949 6.05087 14.7782 6.37879 15.0394C6.70586 15.2999 7.06004 15.507 7.47818 15.5076L7.47893 15.0076L7.47968 14.5076C7.40606 14.5075 7.27545 14.4751 7.0018 14.2571C6.72898 14.0399 6.39411 13.7057 5.90751 13.2186L5.55378 13.572ZM9.03543 12.6511L8.55334 12.5185C8.37063 13.1826 8.24432 13.6387 8.11432 13.9626C7.9839 14.2875 7.88625 14.3804 7.82213 14.417L8.06995 14.8513L8.31778 15.2855C8.68087 15.0783 8.88653 14.7233 9.04235 14.3351C9.19857 13.9459 9.34139 13.4239 9.51752 12.7838L9.03543 12.6511ZM7.47893 15.0076L7.47818 15.5076C7.77262 15.508 8.06204 15.4315 8.31778 15.2855L8.06995 14.8513L7.82213 14.417C7.71778 14.4766 7.59974 14.5078 7.47968 14.5076L7.47893 15.0076ZM13.3037 5.02699L12.95 5.38036C13.7461 6.17729 14.302 6.7356 14.644 7.19715C14.9807 7.65157 15.0315 7.90925 14.9852 8.12329L15.4739 8.22896L15.9626 8.33464C16.0993 7.70226 15.8493 7.14414 15.4475 6.60178C15.0508 6.06653 14.4301 5.44705 13.6575 4.67361L13.3037 5.02699ZM12.1752 10.246L12.3511 10.714C13.3741 10.3297 14.1952 10.0226 14.7775 9.69941C15.3675 9.3719 15.8258 8.9671 15.9626 8.33464L15.4739 8.22896L14.9852 8.12329C14.9389 8.33724 14.7864 8.55075 14.2922 8.82505C13.7902 9.10368 13.0534 9.38189 11.9993 9.77794L12.1752 10.246ZM10.992 2.71292L11.3457 2.35955C10.5674 1.58037 9.94418 0.954674 9.40617 0.55524C8.86133 0.150741 8.30023 -0.101044 7.66522 0.0390571L7.77294 0.527315L7.88066 1.01557C8.0943 0.968439 8.35259 1.01851 8.81006 1.35815C9.27436 1.70285 9.83638 2.26357 10.6383 3.06629L10.992 2.71292ZM5.76999 3.86504L6.23947 4.03705C6.62996 2.97128 6.90444 2.22595 7.18098 1.71776C7.45349 1.21697 7.66694 1.06273 7.88066 1.01557L7.77294 0.527315L7.66522 0.0390571C7.03029 0.179139 6.62703 0.643595 6.30261 1.23978C5.98222 1.82856 5.67956 2.65848 5.30051 3.69303L5.76999 3.86504ZM0.5 15.5003L0.853733 15.8536L4.34365 12.3602L3.98992 12.0068L3.63619 11.6534L0.146267 15.1469L0.5 15.5003ZM1.03033 2.00027L0.676777 2.35382L13.6464 15.3235L14 14.9699L14.3536 14.6164L1.38388 1.64672L1.03033 2.00027Z"/>
      </svg>
    </ng-template>

    <baps-drawer
      [visible]="visible"
      (visibleChange)="onVisibleChange($event)"
      [header]="header"
      position="right"
      brand="sampark"
      styleClass="baps-ds-sampark"
      [appendTo]="appendTo"
    >
      <div drawer-actions class="ct-cfg-actions">
        <baps-button
          label="Reset Default"
          severity="secondary"
          [outlined]="true"
          size="small"
          brand="sampark"
          (click)="resetDefault()"
        />
        <baps-button label="Apply" size="small" brand="sampark" (click)="apply()" />
        <span class="ct-cfg-divider"></span>
      </div>

      <div class="ct-cfg">
        <baps-iconfield>
          <baps-inputicon styleClass="pi pi-search" />
          <input
            bapsInputText
            [(ngModel)]="searchQuery"
            [placeholder]="searchPlaceholder"
            aria-label="Search fields"
            [fluid]="true"
          />
        </baps-iconfield>

        <div class="ct-cfg-section">
          <span class="ct-cfg-section-label">{{ sectionLabel }}</span>
          <button type="button" class="ct-cfg-active-toggle" [attr.aria-expanded]="showActiveOnly" (click)="toggleActiveView()">
            {{ showActiveOnly ? 'View More' : activeCount + ' Active Columns' }}
            <i class="pi" [class.pi-angle-right]="!showActiveOnly" [class.pi-angle-down]="showActiveOnly" aria-hidden="true"></i>
          </button>
        </div>

        <div class="ct-cfg-list">
          @for (col of visibleLockedStart; track col.key) {
            <div class="ct-cfg-item ct-cfg-item--locked">
              <span class="ct-cfg-drag-handle ct-cfg-drag-handle--static"><ng-container [ngTemplateOutlet]="dragHandleIcon" /></span>
              <span class="ct-cfg-item-title">{{ col.label }}</span>
              <baps-toggleswitch size="xs" brand="sampark" [ngModel]="true" [disabled]="true" />
            </div>
          }

          @for (col of visiblePinned; track col.key) {
            <div class="ct-cfg-item ct-cfg-item--pinned">
              <span class="ct-cfg-drag-handle ct-cfg-drag-handle--static"><ng-container [ngTemplateOutlet]="dragHandleIcon" /></span>
              <span class="ct-cfg-item-title">{{ col.label }}</span>
              @if (allowPin) {
                <button
                  type="button"
                  class="ct-cfg-pin-btn ct-cfg-pin-btn--active"
                  title="Unpin column"
                  (click)="togglePin(col, true)"
                ><ng-container [ngTemplateOutlet]="unpinIcon" /></button>
              }
              <baps-toggleswitch size="xs" brand="sampark" [ngModel]="true" [disabled]="true" />
            </div>
          }

          @for (col of visibleRegular; track col.key; let i = $index) {
            @if (isNewGroup(i)) {
              <div class="ct-cfg-group-label">{{ col.group }}</div>
            }
            <div
              class="ct-cfg-item"
              pDraggable="baps-ct-cfg-col"
              pDroppable="baps-ct-cfg-col"
              (onDragStart)="onDragStart(col)"
              (onDragEnd)="onDragEnd()"
              (onDrop)="onDrop(col)"
            >
              <button
                type="button"
                class="ct-cfg-drag-handle"
                [attr.aria-label]="'Reorder ' + col.label + '. Use arrow up or down to move.'"
                (keydown.arrowup)="moveRegular(col, -1); $event.preventDefault()"
                (keydown.arrowdown)="moveRegular(col, 1); $event.preventDefault()"
              ><ng-container [ngTemplateOutlet]="dragHandleIcon" /></button>
              <span class="ct-cfg-item-title">{{ col.label }}</span>
              @if (allowPin) {
                <button type="button" class="ct-cfg-pin-btn" title="Pin column" (click)="togglePin(col, false)">
                  <i class="pi pi-thumbtack" aria-hidden="true"></i>
                </button>
              }
              <baps-toggleswitch
                size="xs"
                brand="sampark"
                [ngModel]="isVisible(col)"
                (ngModelChange)="toggleColumn(col)"
              />
            </div>
          }

          @for (col of visibleLockedEnd; track col.key) {
            <div class="ct-cfg-item ct-cfg-item--locked">
              <span class="ct-cfg-drag-handle ct-cfg-drag-handle--static"><ng-container [ngTemplateOutlet]="dragHandleIcon" /></span>
              <span class="ct-cfg-item-title">{{ col.label }}</span>
              <baps-toggleswitch size="xs" brand="sampark" [ngModel]="true" [disabled]="true" />
            </div>
          }
        </div>
      </div>
    </baps-drawer>
  `,
  encapsulation: ViewEncapsulation.None,
  styles: `
    .ct-cfg-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .ct-cfg {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      height: 100%;
      min-height: 0;
    }
    .ct-cfg-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ct-cfg-section-label {
      font-weight: 600;
      font-size: 0.875rem;
    }
    .ct-cfg-active-toggle {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: none;
      border: none;
      padding: 0;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      color: var(--color-sampark-primary-default, #c96868);
    }
    .ct-cfg-list {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      min-height: 0;
    }
    .ct-cfg-group-label {
      padding: 0.5rem 0 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-sampark-text-muted, #9f9c9c);
    }
    .ct-cfg-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--color-sampark-border-default, #e1e0e0);
      cursor: move;
    }
    .ct-cfg-list .ct-cfg-item:last-child {
      border-bottom: none;
    }
    .ct-cfg-item--locked,
    .ct-cfg-item--pinned {
      cursor: default;
      opacity: 0.85;
    }
    .ct-cfg-drag-handle {
      display: inline-flex;
      width: 1.0625rem;
      height: 1.125rem;
      color: var(--color-sampark-text-muted, #9f9c9c);
      cursor: grab;
      /* Resets for the reorderable-row variant, which is a <button> (keyboard
         reorder via ArrowUp/ArrowDown) — the locked/pinned rows above stay
         plain <span>s since they're not reorderable. */
      background: none;
      border: none;
      padding: 0;
      font: inherit;
    }
    /* Locked and pinned rows show the drag glyph but cannot be reordered, so
       it is dimmed to read as inert. Was an inline style="opacity: 0.4" on
       three separate spans; moved here per the no-inline-styling rule — it is
       static design-system styling, not a runtime value. */
    .ct-cfg-drag-handle--static {
      opacity: 0.4;
    }
    .ct-cfg-drag-handle:focus-visible {
      outline: 2px solid var(--color-sampark-primary-default, #c96868);
      outline-offset: 2px;
      border-radius: 2px;
    }
    .ct-cfg-drag-handle svg {
      width: 100%;
      height: 100%;
    }
    .ct-cfg-item-title {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.875rem;
      color: var(--color-sampark-text-primary, #151414);
    }
    .ct-cfg-divider {
      display: inline-block;
      width: 1px;
      height: 1rem;
      background: var(--color-sampark-border-default, #e1e0e0);
    }
    .ct-cfg-pin-btn {
      display: inline-flex;
      visibility: hidden;
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      color: var(--color-sampark-text-muted, #9f9c9c);
    }
    .ct-cfg-pin-btn svg,
    .ct-cfg-pin-btn i {
      width: 1.125rem;
      height: 1.125rem;
      font-size: 1.125rem;
    }
    .ct-cfg-item:hover .ct-cfg-pin-btn,
    .ct-cfg-pin-btn--active {
      visibility: visible;
    }
    .ct-cfg-pin-btn--active {
      color: var(--color-sampark-primary-default, #c96868);
    }
  `,
  host: {
    class: 'baps-sampark',
  },
})
export class BapsTableColumnConfig implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() columns: BapsTableColumnConfigColumn[] = [];
  /** Reseed source for "Reset Default". Without it, reset just unpins + shows all. */
  @Input() defaultColumns?: BapsTableColumnConfigColumn[];
  /** Hides every pin/unpin control when false. */
  @Input() allowPin = true;
  @Input() header = 'Fields';
  @Input() sectionLabel = 'Column Fields';
  @Input() searchPlaceholder = 'Search fields';
  @Input() appendTo: 'self' | 'body' = 'body';

  /** Emits the final column order/visibility on Apply only. */
  @Output() columnsChange = new EventEmitter<BapsTableColumnConfigColumn[]>();
  @Output() closed = new EventEmitter<void>();

  searchQuery = '';
  showActiveOnly = false;

  protected lockedStart: BapsTableColumnConfigColumn[] = [];
  protected lockedEnd: BapsTableColumnConfigColumn[] = [];
  protected pinned: BapsTableColumnConfigColumn[] = [];
  protected regular: BapsTableColumnConfigColumn[] = [];

  private draggedColumn: BapsTableColumnConfigColumn | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.partition(this.columns);
      this.searchQuery = '';
      this.showActiveOnly = false;
    }
  }

  private partition(source: BapsTableColumnConfigColumn[]): void {
    const clone = (c: BapsTableColumnConfigColumn) => ({ ...c });
    this.lockedStart = source.filter((c) => c.locked && !c.end).map(clone);
    this.lockedEnd = source.filter((c) => c.locked && c.end).map(clone);
    this.pinned = source.filter((c) => !c.locked && c.frozen).map(clone);
    this.regular = source.filter((c) => !c.locked && !c.frozen).map(clone);
  }

  protected isVisible(col: BapsTableColumnConfigColumn): boolean {
    return col.visible !== false;
  }

  private matchesSearch = (col: BapsTableColumnConfigColumn): boolean => {
    const q = this.searchQuery.trim().toLowerCase();
    return !q || col.label.toLowerCase().includes(q);
  };

  private matchesActive = (col: BapsTableColumnConfigColumn): boolean => {
    return !this.showActiveOnly || this.isVisible(col);
  };

  private visibleOf(bucket: BapsTableColumnConfigColumn[]): BapsTableColumnConfigColumn[] {
    return bucket.filter((c) => this.matchesSearch(c) && this.matchesActive(c));
  }

  get visibleLockedStart(): BapsTableColumnConfigColumn[] {
    return this.visibleOf(this.lockedStart);
  }
  get visibleLockedEnd(): BapsTableColumnConfigColumn[] {
    return this.visibleOf(this.lockedEnd);
  }
  get visiblePinned(): BapsTableColumnConfigColumn[] {
    return this.visibleOf(this.pinned);
  }
  get visibleRegular(): BapsTableColumnConfigColumn[] {
    return this.visibleOf(this.regular);
  }

  protected isNewGroup(index: number): boolean {
    const list = this.visibleRegular;
    const col = list[index];
    if (!col?.group) return false;
    return index === 0 || list[index - 1].group !== col.group;
  }

  get activeCount(): number {
    const visibleCount = (bucket: BapsTableColumnConfigColumn[]) => bucket.filter((c) => this.isVisible(c)).length;
    return this.lockedStart.length + this.lockedEnd.length + visibleCount(this.pinned) + visibleCount(this.regular);
  }

  toggleActiveView(): void {
    this.showActiveOnly = !this.showActiveOnly;
  }

  toggleColumn(col: BapsTableColumnConfigColumn): void {
    if (col.locked) return;
    col.visible = !this.isVisible(col);
  }

  togglePin(col: BapsTableColumnConfigColumn, fromPinned: boolean): void {
    if (!this.allowPin || col.locked) return;
    if (fromPinned) {
      this.pinned = this.pinned.filter((c) => c !== col);
      col.frozen = false;
      this.regular = [...this.regular, col];
    } else {
      this.regular = this.regular.filter((c) => c !== col);
      col.frozen = true;
      col.visible = true;
      this.pinned = [...this.pinned, col];
    }
  }

  onDragStart(col: BapsTableColumnConfigColumn): void {
    this.draggedColumn = col;
  }

  onDragEnd(): void {
    this.draggedColumn = null;
  }

  onDrop(target: BapsTableColumnConfigColumn): void {
    const dragged = this.draggedColumn;
    this.draggedColumn = null;
    if (!dragged || dragged === target || dragged.group !== target.group) return;
    const from = this.regular.indexOf(dragged);
    const to = this.regular.indexOf(target);
    if (from === -1 || to === -1) return;
    const next = [...this.regular];
    next.splice(from, 1);
    next.splice(to, 0, dragged);
    this.regular = next;
  }

  /**
   * Keyboard alternative to drag-and-drop reordering (ArrowUp/ArrowDown on
   * the drag handle button) — pDraggable/pDroppable is pointer-only, so
   * without this the regular column list had no accessible way to reorder.
   * Operates on the real `regular` array (not the search/active-filtered
   * `visibleRegular`), matching `onDrop`'s own indexing, and stays within
   * the same `group` like drag-and-drop already does.
   */
  moveRegular(col: BapsTableColumnConfigColumn, direction: -1 | 1): void {
    const from = this.regular.indexOf(col);
    if (from === -1) return;
    const to = from + direction;
    if (to < 0 || to >= this.regular.length) return;
    if (this.regular[to].group !== col.group) return;
    const next = [...this.regular];
    [next[from], next[to]] = [next[to], next[from]];
    this.regular = next;
  }

  resetDefault(): void {
    if (this.defaultColumns) {
      this.partition(this.defaultColumns);
      return;
    }
    const unpinned = [...this.lockedStart, ...this.pinned, ...this.regular, ...this.lockedEnd].map((c) => ({
      ...c,
      visible: true,
      frozen: false,
    }));
    this.partition(unpinned);
  }

  apply(): void {
    const ordered = [...this.lockedStart, ...this.pinned, ...this.regular, ...this.lockedEnd];
    this.columnsChange.emit(ordered);
    this.setVisible(false);
  }

  protected onVisibleChange(next: boolean): void {
    this.setVisible(next);
  }

  private setVisible(next: boolean): void {
    this.visible = next;
    this.visibleChange.emit(next);
    if (!next) this.closed.emit();
  }
}
