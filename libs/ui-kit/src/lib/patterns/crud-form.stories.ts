import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BapsInputText } from '../components/form-field/directives/input-text.directive';
import { BapsTextarea } from '../components/form-field/directives/textarea.directive';
import { BapsMessage } from '../components/form-field/message.component';
import { BapsSelect } from '../components/select/select.component';
import { BapsCheckbox } from '../components/checkbox/checkbox.component';
import { BapsButton } from '../components/button/button.component';

/**
 * Create/Edit record — the shape every admin CRUD screen in this system
 * reduces to: labelled fields, a `FormGroup`, inline per-field errors, and a
 * Save/Cancel row. Nothing here is a new component; it is `FormBuilder` +
 * existing form controls (`bapsInputText`, `baps-select`, `baps-checkbox`)
 * wired the way a real screen wires them, since no single component's own
 * docs page can show multi-field validation or a submit flow.
 */
const meta: Meta = {
  title: 'Patterns/CRUD form',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        BapsInputText,
        BapsTextarea,
        BapsMessage,
        BapsSelect,
        BapsCheckbox,
        BapsButton,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

const ROLES = [
  { label: 'Karyakar', value: 'karyakar' },
  { label: 'G-Sampark', value: 'gsampark' },
  { label: 'Coordinator', value: 'coordinator' },
];

/**
 * The full pattern: required Name/Email/Role, optional Notes, a boolean
 * flag, and a submit that either saves or — on an invalid form — surfaces a
 * `baps-message` banner and marks every control touched so its errors show.
 *
 * `baps-button` doesn't forward `type="submit"` to its inner `<button>` (see
 * the pattern's own mdx doc), so Save is wired via `(click)`, not
 * `(ngSubmit)` on the `<form>` — the `<form>` here just groups the fields
 * semantically, submission is handled entirely in the click handler.
 */
export const Default: Story = {
  render: () => {
    const fb = new FormBuilder();
    const form = fb.group({
      name: fb.control('', [Validators.required]),
      email: fb.control('', [Validators.required, Validators.email]),
      role: fb.control<string | null>(null, [Validators.required]),
      notes: fb.control(''),
      active: fb.control(true),
    });
    // Plain booleans on `props` are copied by value into the story wrapper
    // component at render time — mutating them later never reaches the
    // template. Nest them in one object instead, same fix `WithPagination`
    // (table.stories.ts) already uses for its page state, so the template's
    // `ui.submitted`/`ui.saved` reads keep seeing live updates.
    const ui = { submitted: false, saved: false };
    const props = {
      form,
      roles: ROLES,
      ui,
      errorFor: (control: string) => {
        const c = form.get(control);
        return !!c && c.invalid && (c.dirty || c.touched || ui.submitted);
      },
      onSave: () => {
        ui.submitted = true;
        if (form.invalid) {
          form.markAllAsTouched();
          ui.saved = false;
          return;
        }
        ui.saved = true;
      },
      onCancel: () => {
        form.reset({ active: true });
        ui.submitted = false;
        ui.saved = false;
      },
    };
    return {
      props,
      template: `
        <form style="display:flex; flex-direction:column; gap:16px; max-width:420px;" [formGroup]="form">
          @if (ui.submitted && form.invalid) {
            <baps-message severity="error" text="Fix the highlighted fields before saving." />
          }
          @if (ui.saved) {
            <baps-message severity="success" text="Record saved." />
          }

          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="crud-name">Name <span class="p-error">*</span></label>
            <input id="crud-name" bapsInputText formControlName="name" [invalid]="errorFor('name')" placeholder="Full name" />
            @if (errorFor('name')) {
              <small class="input-hint p-error">Name is required</small>
            }
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="crud-email">Email <span class="p-error">*</span></label>
            <input id="crud-email" bapsInputText formControlName="email" [invalid]="errorFor('email')" placeholder="you@baps.dev" />
            @if (errorFor('email')) {
              <small class="input-hint p-error">
                {{ form.get('email')?.errors?.['required'] ? 'Email is required' : 'Enter a valid email' }}
              </small>
            }
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="crud-role">Role <span class="p-error">*</span></label>
            <baps-select
              inputId="crud-role"
              formControlName="role"
              [options]="roles"
              optionLabel="label"
              optionValue="value"
              placeholder="Select role"
            />
            @if (errorFor('role')) {
              <small class="input-hint p-error">Role is required</small>
            }
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
            <label for="crud-notes">Notes</label>
            <textarea id="crud-notes" bapsTextarea formControlName="notes" rows="3" placeholder="Optional"></textarea>
          </div>

          <baps-checkbox label="Active" formControlName="active" />

          <div style="display:flex; gap:8px; margin-top:8px;">
            <baps-button label="Save" (click)="onSave()" />
            <baps-button label="Cancel" severity="secondary" (click)="onCancel()" />
          </div>
        </form>
      `,
    };
  },
};
