/**
 * Framework snippets for the Toast docs page.
 *
 * ## Route B: no Custom tab
 *
 * A toast has no markup until something pushes one. The container lives at a
 * document corner and its children appear and leave on a timer, so there is
 * no static DOM to write — only the call that creates one.
 *
 * The skin ships: `toast.css` styles the container and the severities.
 *
 * ## A toast is for something that already happened
 *
 * It cannot be relied on to be read: it leaves on its own, it may appear
 * while the reader is looking elsewhere, and on a small screen it covers
 * content. So it reports an outcome, never asks a question and never carries
 * the only copy of something.
 *
 * The container is a live region. That is what makes a toast announced at
 * all, and it is also why pushing two identical messages says the same thing
 * twice — the NoDuplicates example is about the reader, not the pixels.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('toast');

export const toastSnippets: Record<string, SnippetSet> = {
  // One container, pushed from anywhere.
  Default: {
    primeng: `<baps-toast />

<!-- On the component:
     this.messageService.add({
       severity: 'success',
       summary: 'Saved',
       detail: 'Project updated.',
     }); -->`,
    react: `${SETUP}

export function App({ children }) {
  // One container for the app, mounted once. Mount it twice and every
  // message is announced twice.
  return (
    <BapsToastProvider>
      {children}
      <BapsToast />
    </BapsToastProvider>
  );
}

export function SaveButton() {
  const toast = useBapsToast();

  return (
    <BapsButton
      onClick={() => toast.add({ severity: 'success', summary: 'Saved', detail: 'Project updated.' })}
    >
      Save
    </BapsButton>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client' for the provider: the queue is state and the timers are
   browser timers. Mount it in the root layout so one container serves every
   route. */
export default function ToastRoot({ children }) {
  return (
    <BapsToastProvider>
      {children}
      <BapsToast />
    </BapsToastProvider>
  );
}`,
  },

  // Bottom centre. Placement is the container's, not the message's — a
  // message that could land anywhere is a message nobody learns to look for.
  BottomCenter: {
    primeng: `<baps-toast position="bottom-center" />`,
    react: `${SETUP}

export function App({ children }) {
  return (
    <BapsToastProvider>
      {children}
      <BapsToast position="bottom-center" />
    </BapsToastProvider>
  );
}`,
    next: `'use client';

${SETUP}

export default function ToastRoot({ children }) {
  return (
    <BapsToastProvider>
      {children}
      <BapsToast position="bottom-center" />
    </BapsToastProvider>
  );
}`,
  },

  // Collapsing duplicates. Worth doing because the container is a live
  // region: two identical toasts are read out twice, which is noise rather
  // than emphasis.
  NoDuplicates: {
    primeng: `<baps-toast [preventDuplicates]="true" />`,
    react: `${SETUP}

export function SyncButton({ onSync }) {
  const toast = useBapsToast();

  const notify = () =>
    // A key is what makes two pushes the same message rather than two
    // messages. Without it, a retry loop announces the same failure on every
    // attempt.
    toast.add({
      key: 'sync-failed',
      severity: 'error',
      summary: 'Sync failed',
      detail: 'Retrying in the background.',
    });

  return <BapsButton onClick={() => onSync().catch(notify)}>Sync</BapsButton>;
}`,
    next: `'use client';

${SETUP}

export default function SyncButton({ onSync }) {
  const toast = useBapsToast();

  return (
    <BapsButton
      onClick={() =>
        onSync().catch(() =>
          toast.add({
            key: 'sync-failed',
            severity: 'error',
            summary: 'Sync failed',
            detail: 'Retrying in the background.',
          }),
        )
      }
    >
      Sync
    </BapsButton>
  );
}`,
  },
};
