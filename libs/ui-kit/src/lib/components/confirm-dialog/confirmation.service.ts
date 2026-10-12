import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface BapsConfirmation {
  message?: string;
  key?: string;
  icon?: string;
  header?: string;
  accept?: () => void;
  reject?: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptIcon?: string;
  rejectIcon?: string;
  acceptVisible?: boolean;
  rejectVisible?: boolean;
  acceptSeverity?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warn'
    | 'info';
  rejectSeverity?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warn'
    | 'info';
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  closable?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  defaultFocus?: 'accept' | 'reject' | 'none';
  styleClass?: string;
}

/**
 * Service to trigger confirmation dialogs across an Angular application.
 */
@Injectable({
  providedIn: 'root',
})
export class BapsConfirmationService {
  private readonly requireConfirmationSource = new Subject<BapsConfirmation>();
  private readonly closeSource = new Subject<void>();

  readonly requireConfirmation$ = this.requireConfirmationSource.asObservable();
  readonly close$ = this.closeSource.asObservable();

  confirm(confirmation: BapsConfirmation): this {
    this.requireConfirmationSource.next(confirmation);
    return this;
  }

  close(): this {
    this.closeSource.next();
    return this;
  }
}
