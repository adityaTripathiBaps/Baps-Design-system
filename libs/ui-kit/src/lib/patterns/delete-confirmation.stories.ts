import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsDialog } from '../components/dialog/dialog.component';
import { BapsButton } from '../components/button/button.component';
import { BapsAlert } from '../components/alert/alert.component';
import { BapsCheckbox } from '../components/checkbox/checkbox.component';
import { BapsInputText } from '../components/form-field/directives/input-text.directive';

/**
 * Destructive-action confirmation — the interstitial between "user clicked
 * Delete" and "row is gone".
 *
 * This page used to open a `baps-drawer` hardened into a confirm, because a
 * right-edge slide-in was the only masked, focus-trapping surface the library
 * shipped. `baps-dialog` now exists, so the pattern is a centred modal: the
 * affordance matches the stakes, `role="alertdialog"` announces the blast
 * radius on open, both brands are skinned, and closing hands focus back to the
 * Delete button that opened it. The state handling, the gate and the footer
 * are unchanged from the drawer version — as `delete-confirmation.mdx`
 * predicted, only the outer element moved.
 */
const meta: Meta = {
  title: 'Patterns/Delete confirmation',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [FormsModule, BapsDialog, BapsButton, BapsAlert, BapsCheckbox, BapsInputText],
    }),
  ],
};

export default meta;
type Story = StoryObj;

/** The thing being deleted. Named in the header, the alert AND the summary. */
const RECORD = {
  name: 'Diwali New Year Prasad - 2025',
  meta: 'Sampark template · Created 01 Jan 2025 by Rajesh Haripara',
  karyakars: 128,
  responses: 1_842,
};

/**
 * Shared render factory. `gate` picks how the user proves intent:
 * `'ack'` = a checkbox, `'type'` = retyping the record's exact name.
 *
 * All mutable state hangs off one `ui` object, per the trap crud-form's own
 * `ui` object documents — Storybook copies `props` by value into its wrapper
 * component, so a captured `let confirmed` mutated from a handler would never
 * reach the template.
 */
function deleteConfirmation(gate: 'ack' | 'type', open: boolean) {
  const ui = { open, ack: false, typed: '', deleted: false };

  return {
    props: {
      ui,
      record: RECORD,
      gate,
      canDelete: () => (gate === 'ack' ? ui.ack : ui.typed.trim() === RECORD.name),
      openConfirm: () => {
        // Every open starts from a clean slate — a previously ticked
        // acknowledgement must never carry over into the next deletion.
        ui.ack = false;
        ui.typed = '';
        ui.deleted = false;
        ui.open = true;
      },
      cancel: () => {
        ui.open = false;
      },
      confirmDelete: () => {
        ui.open = false;
        ui.deleted = true;
      },
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; max-width:36rem;">
        @if (ui.deleted) {
          <baps-alert
            brand="sampark"
            severity="success"
            [text]="'“' + record.name + '” was deleted.'"
            [closable]="true"
            (closed)="ui.deleted = false"
          />
        }

        <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.75rem 1rem; border:1px solid var(--color-sampark-border-default, #e1e0e0); border-radius:0.5rem;">
          <span style="display:flex; flex-direction:column; gap:0.125rem;">
            <strong style="font-size:0.9375rem;">{{ record.name }}</strong>
            <small style="opacity:0.7;">{{ record.meta }}</small>
          </span>
          <baps-button
            brand="sampark"
            severity="danger"
            label="Delete"
            icon="pi pi-trash"
            size="small"
            [disabled]="ui.deleted"
            (click)="openConfirm()"
          />
        </div>

        <baps-dialog
          [(visible)]="ui.open"
          brand="sampark"
          appendTo="body"
          header="Delete this template?"
          role="alertdialog"
          align="start"
          [dismissableMask]="false"
          [blockScroll]="true"
          [closeOnEscape]="true"
        >
          <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:start;">
            <baps-alert
              brand="sampark"
              severity="error"
              title="This cannot be undone"
              [text]="'Deleting “' + record.name + '” also removes ' + record.responses + ' recorded responses and unassigns ' + record.karyakars + ' karyakars.'"
            />

            <!-- Name the record again, in full, next to the numbers it takes
                 with it. The header truncates on narrow panels; this does not. -->
            <dl style="display:grid; grid-template-columns:auto 1fr; gap:0.5rem 1rem; margin:0; font-size:0.875rem;">
              <dt style="opacity:0.7;">Template</dt>
              <dd style="margin:0; font-weight:600;">{{ record.name }}</dd>
              <dt style="opacity:0.7;">Karyakars assigned</dt>
              <dd style="margin:0;">{{ record.karyakars }}</dd>
              <dt style="opacity:0.7;">Responses recorded</dt>
              <dd style="margin:0;">{{ record.responses }}</dd>
            </dl>

            @if (gate === 'ack') {
              <baps-checkbox
                brand="sampark"
                [(ngModel)]="ui.ack"
                label="I understand this permanently deletes the template and its responses."
              />
            } @else {
              <div style="display:flex; flex-direction:column; gap:0.375rem;">
                <label for="delete-confirm-name" style="font-size:0.875rem;">
                  Type <strong>{{ record.name }}</strong> to confirm
                </label>
                <input
                  id="delete-confirm-name"
                  bapsInputText
                  [(ngModel)]="ui.typed"
                  autocomplete="off"
                  placeholder="Template name"
                />
              </div>
            }
          </div>

          <div dialog-footer>
            <baps-button
              brand="sampark"
              label="Cancel"
              severity="secondary"
              [outlined]="true"
              [autofocus]="true"
              (click)="cancel()"
            />
            <baps-button
              brand="sampark"
              label="Delete template"
              severity="danger"
              icon="pi pi-trash"
              [disabled]="!canDelete()"
              (click)="confirmDelete()"
            />
          </div>
        </baps-dialog>
      </div>
    `,
  };
}

/**
 * The everyday case: a checkbox acknowledgement. Delete stays disabled until
 * it is ticked, so the destructive button is never one stray click away from
 * the trigger that opened the panel.
 *
 * Cancel is the safe default in two ways that both matter: it is focused on
 * open (`[autofocus]`), and Escape closes the panel without deleting
 * anything, because closing *is* cancelling. Nothing destructive is ever the
 * outcome of the user disengaging. Mask clicks are the one dismissal route
 * removed, and here it is the default rather than an opt-in
 * (`baps-dialog` ships `dismissableMask = false`) — see the mdx.
 */
export const Default: Story = {
  render: () => deleteConfirmation('ack', false),
};

/**
 * Already open, so the panel itself is what the docs page shows rather than
 * the trigger row. Same story as `Default` otherwise.
 */
export const Open: Story = {
  render: () => deleteConfirmation('ack', true),
};

/**
 * High-stakes variant: retype the record's exact name. Use it when the
 * deletion is unrecoverable *and* wide-blast (a whole project, a center's
 * data) — a checkbox is muscle memory after the third time, a 29-character
 * name is not.
 *
 * Do not use it for ordinary row deletes. Friction spent where it is not
 * warranted trains users to route around it.
 */
export const TypeToConfirm: Story = {
  render: () => deleteConfirmation('type', true),
};
