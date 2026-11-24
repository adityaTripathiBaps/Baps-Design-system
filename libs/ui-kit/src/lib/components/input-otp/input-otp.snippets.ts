/**
 * Framework snippets for the Input OTP docs page, keyed by story export name.
 *
 * Angular only for now. `baps-input-otp` is a PrimeNG wrapper whose look comes
 * from the brand input skin applied to each cell, and there is no React port
 * of it yet, so a React or Custom tab would hand a reader markup with no
 * behaviour behind it. Add them with the React component, not before.
 */
import type { SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

export const inputOtpSnippets: Record<string, SnippetSet> = {
  Playground: {
    primeng: `<label for="otp">Verification code</label>
<baps-input-otp inputId="otp" [(ngModel)]="code" [length]="6" />`,
  },
  SamparkStates: {
    primeng: `<div class="baps-ds-sampark">
  <div class="field">
    <label for="otp">Verification code</label>
    <baps-input-otp inputId="otp" [(ngModel)]="code" [length]="4" [invalid]="codeRejected" />
    <small class="input-hint">This is a hint text to help user.</small>
  </div>
</div>`,
  },
};
