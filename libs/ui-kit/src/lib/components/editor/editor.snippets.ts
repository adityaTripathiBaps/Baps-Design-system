/**
 * Framework snippets for the Editor docs page, keyed by story export name.
 *
 * Angular only: baps-editor wraps PrimeNG Editor, which needs Quill at
 * runtime, and there is no React port yet.
 */
import type { SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

export const editorSnippets: Record<string, SnippetSet> = {
  Playground: {
    primeng: `<label id="notes-label">Notes</label>
<baps-editor ariaLabelledBy="notes-label" [(ngModel)]="html" [maxLength]="200" (attach)="pickFile()" />`,
  },
  SamparkStates: {
    primeng: `<div class="baps-ds-sampark">
  <div class="field">
    <label id="notes-label">Notes</label>
    <baps-editor ariaLabelledBy="notes-label" toolbar="compact" [(ngModel)]="html" [maxLength]="200" [invalid]="tooLong" />
    <small class="input-hint">This is a hint text to help user.</small>
  </div>
</div>`,
  },
};
