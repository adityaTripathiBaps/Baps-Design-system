import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { BapsButton } from '../button/button.component';
import { BapsDialog } from '../dialog/dialog.component';
import {
  BapsConfirmation,
  BapsConfirmationService,
  subscribeToBapsConfirmations,
} from './confirmation.service';

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
      [style]="style"
      [baseZIndex]="baseZIndex"
      (visibleChange)="onDialogVisibleChange($event)"
      (hidden)="onDialogHide()"
    >
      @if (activeIcon) {
        <div dialog-media class="baps-confirm-dialog__icon-wrapper">
          <i
            [class]="activeIcon"
            class="baps-confirm-dialog__icon"
            aria-hidden="true"
          ></i>
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
    </baps-dialog>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../styles/components/confirm-dialog/_confirm-dialog.scss'],
})
export class BapsConfirmDialog implements OnDestroy {
  private readonly confirmationService = inject(BapsConfirmationService);
  private readonly unsubscribe = subscribeToBapsConfirmations(
    this.confirmationService,
    (confirmation) => {
      if (confirmation) {
        this.handleConfirmation(confirmation);
      } else {
        this.close();
      }
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
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  @Output() hide = new EventEmitter<void>();

  visible = false;
  confirmation?: BapsConfirmation;

  ngOnDestroy(): void {
    this.unsubscribe();
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
    return this.confirmation?.acceptSeverity ?? 'danger';
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
