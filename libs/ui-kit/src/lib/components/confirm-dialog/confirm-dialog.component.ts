import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { BapsButton } from '../button/button.component';
import { BapsDialog } from '../dialog/dialog.component';
import {
  BapsConfirmation,
  BapsConfirmationService,
} from './confirmation.service';

/**
 * baps-confirm-dialog — modal confirmation dialog triggered imperatively.
 *
 * Built on `baps-dialog`, ensuring consistent modal shell layout, focus
 * trapping, focus restoration, backdrop masking, and brand token theming.
 *
 * Listens to `BapsConfirmationService` (and optionally PrimeNG's `ConfirmationService`).
 */
@Component({
  selector: 'baps-confirm-dialog',
  imports: [BapsDialog, BapsButton],
  template: `
    <baps-dialog
      [visible]="visible"
      [header]="activeHeader"
      [ariaLabel]="activeAriaLabel"
      [brand]="brand"
      [closable]="activeClosable"
      [closeOnEscape]="activeCloseOnEscape"
      [dismissableMask]="activeDismissableMask"
      [blockScroll]="blockScroll"
      [appendTo]="appendTo"
      [styleClass]="panelClass"
      (visibleChange)="onDialogVisibleChange($event)"
      (hidden)="onDialogHide()"
    >
      @if (activeIcon) {
        <div dialog-media class="baps-confirm-dialog__icon-wrapper">
          <i [class]="activeIcon" class="baps-confirm-dialog__icon" aria-hidden="true"></i>
        </div>
      }

      @if (activeMessage) {
        <p class="baps-confirm-dialog__message">
          {{ activeMessage }}
        </p>
      }

      <div dialog-footer class="baps-confirm-dialog__actions">
        @if (activeRejectVisible) {
          <baps-button
            [label]="activeRejectLabel"
            [icon]="activeRejectIcon"
            [severity]="activeRejectSeverity"
            [outlined]="true"
            [brand]="brand"
            [class]="rejectBtnClass"
            (onClick)="reject()"
          />
        }
        @if (activeAcceptVisible) {
          <baps-button
            [label]="activeAcceptLabel"
            [icon]="activeAcceptIcon"
            [severity]="activeAcceptSeverity"
            [brand]="brand"
            [class]="acceptBtnClass"
            (onClick)="accept()"
          />
        }
      </div>
    </baps-dialog>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/confirm-dialog/_confirm-dialog.scss'],
})
export class BapsConfirmDialog implements OnInit, OnDestroy {
  private readonly bapsConfirmationService = inject(BapsConfirmationService);
  private readonly primeConfirmationService = inject(ConfirmationService, {
    optional: true,
  });
  private readonly subscription = new Subscription();

  /** Dialog key matching confirmation.key. */
  @Input() key?: string;
  @Input() header?: string;
  @Input() message?: string;
  @Input() icon?: string;
  @Input() acceptLabel = 'Yes';
  @Input() rejectLabel = 'No';
  @Input() acceptIcon?: string;
  @Input() rejectIcon?: string;
  @Input() acceptVisible = true;
  @Input() rejectVisible = true;
  @Input() acceptSeverity:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warn'
    | 'info' = 'danger';
  @Input() rejectSeverity:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warn'
    | 'info' = 'secondary';
  @Input() acceptButtonStyleClass?: string;
  @Input() rejectButtonStyleClass?: string;
  @Input() styleClass?: string;
  @Input() closable = false;
  @Input() closeOnEscape = true;
  @Input() dismissableMask = false;
  @Input() blockScroll = true;
  @Input() appendTo: 'self' | 'body' | HTMLElement = 'body';
  @Input() autoZIndex = true;
  @Input() baseZIndex = 0;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Input() ariaLabel?: string;

  @Output() hide = new EventEmitter<void>();
  @Output() acceptEvent = new EventEmitter<void>();
  @Output() rejectEvent = new EventEmitter<void>();

  visible = false;
  confirmation?: BapsConfirmation;

  ngOnInit(): void {
    this.subscription.add(
      this.bapsConfirmationService.requireConfirmation$.subscribe(
        (confirmation) => this.handleConfirmation(confirmation),
      ),
    );
    this.subscription.add(
      this.bapsConfirmationService.close$.subscribe(() => this.close()),
    );

    if (this.primeConfirmationService) {
      this.subscription.add(
        this.primeConfirmationService.requireConfirmation$.subscribe(
          (confirmation) =>
            this.handleConfirmation(confirmation as BapsConfirmation),
        ),
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
    this.acceptEvent.emit();
    this.close();
  }

  reject(): void {
    if (this.confirmation?.reject) {
      this.confirmation.reject();
    }
    this.rejectEvent.emit();
    this.close();
  }

  close(): void {
    this.visible = false;
    this.confirmation = undefined;
    this.hide.emit();
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
    return this.confirmation?.header ?? this.header;
  }

  protected get activeAriaLabel(): string {
    return (
      this.ariaLabel ??
      this.activeHeader ??
      'Confirmation'
    );
  }

  protected get activeMessage(): string | undefined {
    return this.confirmation?.message ?? this.message;
  }

  protected get activeIcon(): string | undefined {
    return this.confirmation?.icon ?? this.icon;
  }

  protected get activeAcceptLabel(): string {
    return this.confirmation?.acceptLabel ?? this.acceptLabel;
  }

  protected get activeRejectLabel(): string {
    return this.confirmation?.rejectLabel ?? this.rejectLabel;
  }

  protected get activeAcceptIcon(): string | undefined {
    return this.confirmation?.acceptIcon ?? this.acceptIcon;
  }

  protected get activeRejectIcon(): string | undefined {
    return this.confirmation?.rejectIcon ?? this.rejectIcon;
  }

  protected get activeAcceptVisible(): boolean {
    return this.confirmation?.acceptVisible ?? this.acceptVisible;
  }

  protected get activeRejectVisible(): boolean {
    return this.confirmation?.rejectVisible ?? this.rejectVisible;
  }

  protected get activeAcceptSeverity():
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warn'
    | 'info' {
    return this.confirmation?.acceptSeverity ?? this.acceptSeverity;
  }

  protected get activeRejectSeverity():
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warn'
    | 'info' {
    return this.confirmation?.rejectSeverity ?? this.rejectSeverity;
  }

  protected get activeClosable(): boolean {
    return this.confirmation?.closable ?? this.closable;
  }

  protected get activeCloseOnEscape(): boolean {
    return this.confirmation?.closeOnEscape ?? this.closeOnEscape;
  }

  protected get activeDismissableMask(): boolean {
    return this.confirmation?.dismissableMask ?? this.dismissableMask;
  }

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
