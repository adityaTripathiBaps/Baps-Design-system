import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BapsInputText } from '../components/form-field/directives/input-text.directive';
import { BapsCheckbox } from '../components/checkbox/checkbox.component';
import { BapsButton } from '../components/button/button.component';
import { BapsAlert } from '../components/alert/alert.component';
import { BapsCard } from '../components/card/card.component';
import { BapsLink } from '../components/link/link.component';

/**
 * Sign-in screen — the one page every user of this system sees before any
 * other. Nothing here is a new component: it is `FormBuilder` +
 * `bapsInputText` + `baps-checkbox` + `baps-button` inside a `baps-card`,
 * with a single `baps-alert` carrying the auth failure.
 *
 * The reason this needs a pattern page of its own rather than being covered
 * by the individual component docs is the *failure* half. A login form's
 * hard parts are all cross-component: field-level validation must be kept
 * separate from a server-level "wrong credentials" message, the submit
 * button has to lock while the request is in flight, and the error banner
 * must survive a re-render without wiping what the user typed. No single
 * component's docs page can show any of that.
 *
 * Demo credentials for the interactive story: `karyakar@baps.dev` /
 * `satsang123`. Anything else produces the auth-failure alert.
 */
const meta: Meta = {
  title: 'Patterns/Login',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        BapsInputText,
        BapsCheckbox,
        BapsButton,
        BapsAlert,
        BapsCard,
        BapsLink,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

const VALID_EMAIL = 'karyakar@baps.dev';
const VALID_PASSWORD = 'satsang123';

interface LoginUiState {
  /** Set once Sign in has been pressed — turns on eager field errors. */
  submitted: boolean;
  /** Request in flight; drives `baps-button`'s `loading` input. */
  loading: boolean;
  /** Server-level failure text, or `null`. Distinct from field errors. */
  error: string | null;
  /** Success acknowledgement, standing in for a route change. */
  signedIn: boolean;
}

/**
 * One render factory for all three stories — they differ only in the
 * starting form values and `ui` flags, so the template lives in exactly one
 * place and the static states are guaranteed to be the real screen rather
 * than a hand-drawn approximation of it.
 *
 * `ui` is an object, not four loose booleans, for the reason crud-form's own
 * `ui` object documents: Storybook copies `props` by value into its wrapper
 * component, so a captured local `let loading` mutated from a handler never
 * reaches the template. A mutable object read as `ui.loading` does.
 */
function loginScreen(
  initial: Partial<LoginUiState> = {},
  values: { email?: string; password?: string; remember?: boolean } = {},
) {
  const fb = new FormBuilder();
  const form = fb.group({
    email: fb.control(values.email ?? '', [Validators.required, Validators.email]),
    password: fb.control(values.password ?? '', [Validators.required, Validators.minLength(8)]),
    remember: fb.control(values.remember ?? false),
  });

  const ui: LoginUiState = {
    submitted: false,
    loading: false,
    error: null,
    signedIn: false,
    ...initial,
  };

  if (ui.loading) form.disable();

  return {
    props: {
      form,
      ui,
      errorFor: (control: string) => {
        const c = form.get(control);
        return !!c && c.invalid && (c.dirty || c.touched || ui.submitted);
      },
      // `baps-button` has no `type` input, so `<form (ngSubmit)>` never
      // fires — the submit lives here and does the two things ngSubmit would
      // have done itself: check validity, then light up every field.
      onSignIn: () => {
        ui.submitted = true;
        ui.error = null;
        ui.signedIn = false;
        if (form.invalid) {
          form.markAllAsTouched();
          return;
        }
        const { email, password } = form.getRawValue();
        if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
          // Deliberately does NOT say which of the two was wrong — naming the
          // field turns the form into an account-enumeration oracle.
          ui.error = 'Email or password is incorrect. Please try again.';
          return;
        }
        ui.signedIn = true;
      },
    },
    template: `
      <div style="display:flex; justify-content:center; padding:2rem 1rem;">
        <baps-card style="width:100%; max-width:24rem;">
          <h1 card-title style="margin:0; font-size:1.375rem; font-weight:600;">Sign in</h1>
          <p card-subtitle style="margin:0; font-size:0.875rem; opacity:0.7;">
            Use your BAPS account to continue to MyBKY.
          </p>

          <form [formGroup]="form" style="display:flex; flex-direction:column; gap:1rem;">
            @if (ui.error) {
              <baps-alert
                severity="error"
                title="Sign-in failed"
                [text]="ui.error"
                [closable]="true"
                (closed)="ui.error = null"
              />
            }
            @if (ui.signedIn) {
              <baps-alert severity="success" text="Signed in. Redirecting to your dashboard…" />
            }

            <div style="display:flex; flex-direction:column; gap:0.375rem;">
              <label for="login-email">Email</label>
              <input
                id="login-email"
                bapsInputText
                type="email"
                autocomplete="username"
                formControlName="email"
                [invalid]="errorFor('email')"
                placeholder="you@baps.dev"
              />
              @if (errorFor('email')) {
                <small class="input-hint p-error">
                  {{ form.get('email')?.errors?.['required'] ? 'Email is required' : 'Enter a valid email address' }}
                </small>
              }
            </div>

            <div style="display:flex; flex-direction:column; gap:0.375rem;">
              <label for="login-password">Password</label>
              <input
                id="login-password"
                bapsInputText
                type="password"
                autocomplete="current-password"
                formControlName="password"
                [invalid]="errorFor('password')"
                placeholder="••••••••"
              />
              @if (errorFor('password')) {
                <small class="input-hint p-error">
                  {{ form.get('password')?.errors?.['required'] ? 'Password is required' : 'Password must be at least 8 characters' }}
                </small>
              }
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
              <baps-checkbox label="Remember me" formControlName="remember" />
              <baps-link href="#">Forgot password?</baps-link>
            </div>

            <baps-button
              label="Sign in"
              [loading]="ui.loading"
              [fluid]="true"
              (click)="onSignIn()"
            />
          </form>
        </baps-card>
      </div>
    `,
  };
}

/**
 * The working screen. Submit with the fields empty to see both inline field
 * errors at once (`markAllAsTouched`); submit with anything other than
 * `karyakar@baps.dev` / `satsang123` to see the auth-failure alert; submit
 * the demo pair to see the success state.
 *
 * Note what does NOT happen on a failed sign-in: the typed email stays in the
 * field. The alert is separate state, so re-rendering it never touches the
 * `FormGroup`.
 */
export const Default: Story = {
  render: () => loginScreen(),
};

/**
 * Server rejected the credentials. Both fields are individually *valid* — a
 * well-formed email, a long-enough password — which is exactly why this
 * message cannot live in a field's own `<small class="input-hint p-error">`:
 * there is no invalid field to attach it to. It belongs above the form, in
 * `baps-alert`.
 *
 * The message names neither field. "Unknown email" versus "wrong password"
 * tells an attacker which addresses have accounts.
 */
export const AuthFailure: Story = {
  render: () =>
    loginScreen(
      { submitted: true, error: 'Email or password is incorrect. Please try again.' },
      { email: 'wrong.person@baps.dev', password: 'not-the-password' },
    ),
};

/**
 * Request in flight. `[loading]="ui.loading"` swaps the label for PrimeNG's
 * spinner and disables the button, so the form cannot be double-submitted by
 * an impatient second click.
 *
 * The button alone is not enough, though — the *fields* also have to lock, or
 * the user can keep typing into a request that has already been sent with the
 * old values. That is `form.disable()` on the `FormGroup`, not a per-input
 * flag; `bapsInputText` has no `disabled` input of its own, it inherits the
 * state from the control.
 */
export const Submitting: Story = {
  render: () =>
    loginScreen(
      { submitted: true, loading: true },
      { email: VALID_EMAIL, password: VALID_PASSWORD, remember: true },
    ),
};
