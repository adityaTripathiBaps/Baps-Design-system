/*
 * Route B: no Custom tab.
 *
 * ConfirmDialog is service-driven: opening is imperative, so the Angular and
 * React snippets demonstrate the provider and service call rather than only
 * the template/JSX.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('confirm-dialog', true, '@org/ui-kit-react/styles')}

import { BapsConfirmProvider, BapsConfirmDialog, useConfirm } from '@org/ui-kit-react';`;

export const confirmDialogSnippets: Record<string, SnippetSet> = {
  Default: {
    primeng: `<!-- Once, at your app root: -->
<baps-confirm-dialog />

<!-- In a component: -->
@Component({
  template: \`<baps-button label="Confirm" (click)="open()" />\`,
})
export class MyComponent {
  private readonly confirm = inject(BapsConfirmationService);

  open(): void {
    this.confirm.confirm({
      header: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      icon: 'pi pi-question-circle',
      accept: () => console.log('Accepted'),
      reject: () => console.log('Rejected'),
    });
  }
}`,
    react: `${SETUP}

export function App() {
  return (
    <BapsConfirmProvider>
      <ConfirmExample />
    </BapsConfirmProvider>
  );
}

function ConfirmExample() {
  const confirm = useConfirm();

  const handleClick = async () => {
    const accepted = await confirm.confirm({
      header: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      icon: 'pi pi-question-circle',
    });
    console.log(accepted ? 'Accepted' : 'Rejected');
  };

  return <button onClick={handleClick}>Confirm</button>;
}`,
    next: `'use client';

${SETUP}

export default function App() {
  return (
    <BapsConfirmProvider>
      <ConfirmExample />
    </BapsConfirmProvider>
  );
}

function ConfirmExample() {
  const confirm = useConfirm();

  const handleClick = async () => {
    const accepted = await confirm.confirm({
      header: 'Confirm Action',
      message: 'Are you sure you want to proceed?',
      icon: 'pi pi-question-circle',
    });
    console.log(accepted ? 'Accepted' : 'Rejected');
  };

  return <button onClick={handleClick}>Confirm</button>;
}`,
  },

  DeleteConfirmation: {
    primeng: `this.confirm.confirm({
  header: 'Confirm Deletion',
  message: 'This will permanently remove the member. This action cannot be undone.',
  icon: 'pi pi-exclamation-triangle',
  acceptLabel: 'Delete',
  rejectLabel: 'Cancel',
  acceptSeverity: 'danger',
  rejectSeverity: 'secondary',
  accept: () => this.deleteMember(),
});`,
    react: `${SETUP}

function DeleteButton() {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const accepted = await confirm.confirm({
      header: 'Confirm Deletion',
      message: 'This will permanently remove the member. This action cannot be undone.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptSeverity: 'danger',
    });
    if (accepted) deleteMember();
  };

  return <button onClick={handleDelete}>Delete Member</button>;
}`,
  },

  KeyRouting: {
    primeng: `<!-- Two dialogs with different keys -->
<baps-confirm-dialog key="dialog-a" />
<baps-confirm-dialog key="dialog-b" />

<!-- Trigger them separately -->
<baps-button label="Open A" (click)="confirmSvc.confirm({ key: 'dialog-a', header: 'Dialog A', message: '...' })" />
<baps-button label="Open B" (click)="confirmSvc.confirm({ key: 'dialog-b', header: 'Dialog B', message: '...' })" />`,
  },

  Sampark: {
    primeng: `<baps-confirm-dialog brand="sampark" />`,
    react: `${SETUP}

export function SamparkApp() {
  return (
    <BapsConfirmProvider brand="sampark">
      <ConfirmExample />
    </BapsConfirmProvider>
  );
}`,
  },
};
