import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { BapsButton } from '../button/button.component';
import { BapsDialog } from '../dialog/dialog.component';
import {
  BapsConfirmation,
  BapsConfirmationService,
  subscribeToBapsConfirmations,
} from './confirmation.service';

let nextConfirmDialogId = 0;

/**
 * baps-confirm-dialog — modal confirmation dialog triggered imperatively.
 *
 * Built on `baps-dialog`, ensuring consistent modal shell layout, focus
 * trapping, focus restoration, backdrop masking, and brand token theming.
 *
 * Listens to `BapsConfirmationService` through its internal callback channel.
 */
@Component({
  selector: 'baps-confirm-dialog',
  imports: [BapsDialog, BapsButton, NgTemplateOutlet],
  template: `
    <baps-dialog
      [visible]="visible"
      [header]="tpl('header') ? undefined : activeHeader"
      [ariaLabel]="activeAriaLabel"
      [role]="'alertdialog'"
      [ariaDescribedBy]="activeMessage ? messageId : undefined"
      [brand]="brand"
      [closable]="activeClosable"
      [closeOnEscape]="activeCloseOnEscape"
      [dismissableMask]="activeDismissableMask"
      [blockScroll]="blockScroll"
      [appendTo]="appendTo"
      [styleClass]="panelClass"
      [style]="style"
      [baseZIndex]="baseZIndex"
      [showHeader]="showHeader"
      (visibleChange)="onDialogVisibleChange($event)"
      (hidden)="onDialogHide()"
    >
      <!-- pTemplate forwarding (header, message, footer), as in baps-select:
           each slot gets the active confirmation as $implicit, and the footer
           also gets accept and reject. Rendered only while a confirmation is
           active, as PrimeNG does: a template reading message.x would
           otherwise throw on every change detection, which stalls every
           PrimeNG overlay on the page (AT-064). -->
      @if (confirmation && tpl('header'); as t) {
        <div dialog-title>
          <ng-container *ngTemplateOutlet="t; context: { $implicit: confirmation }" />
        </div>
      }

      @if (activeIcon) {
        <div dialog-media class="baps-confirm-dialog__icon-wrapper">
          <i
            [class]="activeIcon"
            class="baps-confirm-dialog__icon"
            aria-hidden="true"
          ></i>
        </div>
      }

      @if (confirmation && tpl('message'); as t) {
        <div [id]="messageId">
          <ng-container *ngTemplateOutlet="t; context: { $implicit: confirmation }" />
        </div>
      } @else if (activeMessage) {
        <p class="baps-confirm-dialog__message" [id]="messageId">
          {{ activeMessage }}
        </p>
      }

      @if (confirmation && tpl('footer'); as t) {
        <div dialog-footer class="baps-confirm-dialog__actions">
          <ng-container
            *ngTemplateOutlet="t; context: { $implicit: confirmation, accept: acceptFn, reject: rejectFn }"
          />
        </div>
      } @else {
      <div dialog-footer class="baps-confirm-dialog__actions">
        @if (activeRejectVisible) {
          <baps-button
            [label]="activeRejectLabel"
            [icon]="activeRejectIcon"
            [severity]="activeRejectSeverity"
            [outlined]="true"
            [brand]="brand"
            [class]="rejectBtnClass"
            (click)="reject()"
          />
        }
        @if (activeAcceptVisible) {
          <baps-button
            [label]="activeAcceptLabel"
            [icon]="activeAcceptIcon"
            [severity]="activeAcceptSeverity"
            [brand]="brand"
            [class]="acceptBtnClass"
            (click)="accept()"
          />
        }
      </div>
      }
    </baps-dialog>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/confirm-dialog/_confirm-dialog.scss'],
})
export class BapsConfirmDialog implements OnInit, OnDestroy {
  /** Stable per instance: aria-describedby points the alertdialog here. */
  protected readonly messageId = `baps-confirm-dialog-message-${nextConfirmDialogId++}`;
  private readonly confirmationService = inject(BapsConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly unsubscribe = subscribeToBapsConfirmations(
    this.confirmationService,
    (confirmation) => {
      if (confirmation) {
        this.handleConfirmation(confirmation);
      } else {
        this.close();
      }
      // The service calls this outside any template event, so nothing else
      // schedules a render: in a zoneless host the dialog never opened.
      this.cdr.markForCheck();
    },
  );

  /** Dialog key matching confirmation.key. */
  @Input() key?: string;
  @Input() acceptButtonStyleClass?: string;
  @Input() rejectButtonStyleClass?: string;
  @Input() styleClass?: string;
  @Input() closable = false;
  @Input() style?: Record<string, string | number>;
  @Input() baseZIndex = 0;
  /**
   * Render the dialog title bar. Default true. False when a message template
   * draws its own heading, so the header is not shown twice (spm AT-098: SPM
   * dev hid it with CSS that PrimeNG 21's renamed class no longer matches).
   */
  @Input() showHeader = true;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  /**
   * Where confirmations come from. 'baps' (default): BapsConfirmationService.
   * 'primeng': PrimeNG's ConfirmationService, so an app that already calls
   * confirmationService.confirm(...) can render this dialog without changing
   * its callers. Its close() closes this dialog too.
   */
  @Input() source: 'baps' | 'primeng' = 'baps';

  @ContentChildren(PrimeTemplate) templates?: QueryList<PrimeTemplate>;

  private readonly primeConfirmations = inject(ConfirmationService, { optional: true });
  private primeSub?: { unsubscribe(): void };

  /** A consumer pTemplate of the given type (header, message, footer). */
  tpl(type: string): TemplateRef<unknown> | undefined {
    return this.templates?.find((t) => t.getType() === type)?.template;
  }

  protected readonly acceptFn = () => this.accept();
  protected readonly rejectFn = () => this.reject();

  @Output() hide = new EventEmitter<void>();

  visible = false;
  confirmation?: BapsConfirmation;

  ngOnInit(): void {
    if (this.source !== 'primeng' || !this.primeConfirmations) return;
    this.primeSub = this.primeConfirmations.requireConfirmation$.subscribe((confirmation) => {
      if (confirmation) {
        this.handleConfirmation(confirmation as BapsConfirmation);
      } else {
        this.close();
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe();
    this.primeSub?.unsubscribe();
  }

  private handleConfirmation(confirmation: BapsConfirmation): void {
    if (confirmation.key === this.key) {
      this.confirmation = confirmation;
      this.visible = true;
    }
  }

  accept(): void {
    if (this.confirmation?.accept) {
      this.confirmation.accept();
    }
    this.close();
  }

  reject(): void {
    if (this.confirmation?.reject) {
      this.confirmation.reject();
    }
    this.close();
  }

  close(): void {
    const wasVisible = this.visible;
    this.visible = false;
    this.confirmation = undefined;
    if (wasVisible) {
      this.hide.emit();
    }
  }

  protected onDialogVisibleChange(next: boolean): void {
    if (!next && this.visible) {
      this.reject();
    }
  }

  protected onDialogHide(): void {
    if (this.visible) {
      this.reject();
    }
  }

  protected get activeHeader(): string | undefined {
    return this.confirmation?.header;
  }

  protected get activeAriaLabel(): string {
    return this.activeHeader ?? 'Confirmation';
  }

  protected get activeMessage(): string | undefined {
    return this.confirmation?.message;
  }

  protected get activeIcon(): string | undefined {
    return this.confirmation?.icon;
  }

  protected get activeAcceptLabel(): string {
    return this.confirmation?.acceptLabel ?? 'Yes';
  }

  protected get activeRejectLabel(): string {
    return this.confirmation?.rejectLabel ?? 'No';
  }

  protected get activeAcceptIcon(): string | undefined {
    return this.confirmation?.acceptIcon;
  }

  protected get activeRejectIcon(): string | undefined {
    return this.confirmation?.rejectIcon;
  }

  protected get activeAcceptVisible(): boolean {
    return this.confirmation?.acceptVisible ?? true;
  }

  protected get activeRejectVisible(): boolean {
    return this.confirmation?.rejectVisible ?? true;
  }

  protected get activeAcceptSeverity():
    'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info' {
    // PrimeNG's accept button is primary; keep that look for its confirmations.
    return this.confirmation?.acceptSeverity ?? (this.source === 'primeng' ? 'primary' : 'danger');
  }

  protected get activeRejectSeverity():
    'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info' {
    return this.confirmation?.rejectSeverity ?? 'secondary';
  }

  protected get activeClosable(): boolean {
    return this.confirmation?.closable ?? this.closable;
  }

  protected get activeCloseOnEscape(): boolean {
    return this.confirmation?.closeOnEscape ?? true;
  }

  protected get activeDismissableMask(): boolean {
    return this.confirmation?.dismissableMask ?? false;
  }

  protected readonly blockScroll = true;
  protected readonly appendTo = 'body';

  protected get acceptBtnClass(): string | undefined {
    return (
      this.confirmation?.acceptButtonStyleClass ?? this.acceptButtonStyleClass
    );
  }

  protected get rejectBtnClass(): string | undefined {
    return (
      this.confirmation?.rejectButtonStyleClass ?? this.rejectButtonStyleClass
    );
  }

  protected get panelClass(): string {
    const brandClass =
      this.brand === 'sampark'
        ? 'baps-ds-sampark baps-confirm-dialog-sampark'
        : '';
    const extra = this.confirmation?.styleClass ?? this.styleClass;
    return ['p-confirmdialog', brandClass, extra].filter(Boolean).join(' ');
  }
}
