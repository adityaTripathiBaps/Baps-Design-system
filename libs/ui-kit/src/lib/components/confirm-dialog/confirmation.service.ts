import { Injectable } from '@angular/core';

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
    'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info';
  rejectSeverity?:
    'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info';
  acceptButtonStyleClass?: string;
  rejectButtonStyleClass?: string;
  closable?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  styleClass?: string;
}

type ConfirmationListener = (confirmation: BapsConfirmation | null) => void;

const listenersByService = new WeakMap<
  BapsConfirmationService,
  Set<ConfirmationListener>
>();

function listenersFor(
  service: BapsConfirmationService,
): Set<ConfirmationListener> {
  const existing = listenersByService.get(service);
  if (existing) {
    return existing;
  }

  const listeners = new Set<ConfirmationListener>();
  listenersByService.set(service, listeners);
  return listeners;
}

/** @internal Connects the dialog host without adding a public observable API. */
export function subscribeToBapsConfirmations(
  service: BapsConfirmationService,
  listener: ConfirmationListener,
): () => void {
  const listeners = listenersFor(service);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Service to trigger confirmation dialogs across an Angular application.
 */
@Injectable({
  providedIn: 'root',
})
export class BapsConfirmationService {
  confirm(confirmation: BapsConfirmation): this {
    listenersFor(this).forEach((listener) => listener(confirmation));
    return this;
  }

  close(): this {
    listenersFor(this).forEach((listener) => listener(null));
    return this;
  }
}
