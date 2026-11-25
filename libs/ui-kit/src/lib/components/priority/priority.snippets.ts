/**
 * Framework snippets for the Priority docs page, keyed by story export name.
 * Angular only: there is no React port of baps-priority yet.
 */
import type { SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

export const prioritySnippets: Record<string, SnippetSet> = {
  Playground: {
    primeng: `<baps-priority level="high" />`,
  },
  Levels: {
    primeng: `<baps-priority level="medium" [interactive]="true" (click)="openPriorityPicker()" />`,
  },
};
