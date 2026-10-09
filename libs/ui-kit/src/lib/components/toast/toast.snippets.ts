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
  // The provider IS the container — it portals one to document.body itself,
  // so there is nothing to render beside it. Mount it twice and every
  // message is announced twice.
  return <BapsToastProvider>{children}</BapsToastProvider>;
}

export function SaveButton() {
  const toast = useToast();

  return (
    <BapsButton
      onClick={() => toast.show({ severity: 'success', summary: 'Saved', detail: 'Project updated.' })}
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
  return <BapsToastProvider>{children}</BapsToastProvider>;
}`,
  },

  // Bottom centre. Placement is the container's, not the message's — a
  // message that could land anywhere is a message nobody learns to look for.
  BottomCenter: {
    primeng: `<baps-toast position="bottom-center" />`,
    react: `${SETUP}

export function App({ children }) {
  // Placement is a prop on the provider, because the provider owns the
  // container the messages land in.
  return (
    <BapsToastProvider position="bottom-center">{children}</BapsToastProvider>
  );
}`,
    next: `'use client';

${SETUP}

export default function ToastRoot({ children }) {
  return (
    <BapsToastProvider position="bottom-center">{children}</BapsToastProvider>
  );
}`,
  },

  // Collapsing duplicates. Worth doing because the container is a live
  // region: two identical toasts are read out twice, which is noise rather
  // than emphasis.
  NoDuplicates: {
    primeng: `<baps-toast [preventDuplicates]="true" />`,
    react: `${SETUP}

/* The React provider has no preventDuplicates: show() appends whatever it is
   given, so a retry loop announces the same failure on every attempt. Until
   it gains one, the guard belongs at the call site — and it has to be a ref,
   because state would re-render the button mid-retry. */
export function SyncButton({ onSync }) {
  const toast = useToast();
  const announced = useRef(false);

  const notify = () => {
    if (announced.current) return;
    announced.current = true;
    toast.show({
      severity: 'error',
      summary: 'Sync failed',
      detail: 'Retrying in the background.',
      life: 4000,
    });
    // Let it be announced again once the first one has left the screen.
    setTimeout(() => { announced.current = false; }, 4000);
  };

  return <BapsButton onClick={() => onSync().catch(notify)}>Sync</BapsButton>;
}`,
    next: `'use client';

${SETUP}

/* Same guard as the React example, and the same reason: the provider does
   not collapse duplicates, so the caller does. */
export default function SyncButton({ onSync }) {
  const toast = useToast();
  const announced = useRef(false);

  const notify = () => {
    if (announced.current) return;
    announced.current = true;
    toast.show({
      severity: 'error',
      summary: 'Sync failed',
      detail: 'Retrying in the background.',
      life: 4000,
    });
    setTimeout(() => { announced.current = false; }, 4000);
  };

  return <BapsButton onClick={() => onSync().catch(notify)}>Sync</BapsButton>;
}`,
  },
};
