/**
 * Framework snippets for the Dialog docs page.
 *
 * ## Route B: no Custom tab
 *
 * The dialog is appended to the document at open time — PrimeNG's overlay in
 * Angular, a portal in `@org/ui-kit-react` — and is not in the DOM at all
 * while closed. Static markup cannot reproduce that, so none is written.
 *
 * The skin ships: `dialog.css` styles `.p-dialog`, its header, content,
 * footer and mask.
 *
 * ## What a dialog owes a keyboard user
 *
 * Three things, all from the component rather than the caller: focus moves in
 * on open and returns to the trigger on close, Escape dismisses it, and focus
 * cannot leave while it is open. A hand-rolled dialog usually gets the first
 * and misses the third, stranding a keyboard user behind a modal they can tab
 * out of but not see.
 *
 * It also needs a name. `header` supplies one; without it the dialog is
 * announced as nothing, which is the `aria-dialog-name` finding the a11y
 * audit still reports elsewhere in this library.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('dialog');

export const dialogSnippets: Record<string, SnippetSet> = {
  // A form inside. The submit button sits in the footer and the form is in
  // the body, so it carries form="..." — otherwise Enter in a field does
  // nothing and the button submits nothing.
  FormModal: {
    primeng: `<baps-dialog [(visible)]="visible" header="Rename project">
  <input pInputText [(ngModel)]="name" />
  <ng-template pTemplate="footer">
    <baps-button label="Cancel" severity="secondary" (onClick)="visible = false" />
    <baps-button label="Save" (onClick)="save()" />
  </ng-template>
</baps-dialog>`,
    react: `${SETUP}

export function RenameDialog({ open, onOpenChange, onSave }) {
  const [name, setName] = useState('');

  return (
    <BapsDialog
      visible={open}
      onVisibleChange={onOpenChange}
      header="Rename project"
      footer={
        <>
          <BapsButton severity="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </BapsButton>
          {/* type="submit" plus form="rename-form": the button is outside the
              form element, and this is what still connects them. */}
          <BapsButton type="submit" form="rename-form">
            Save
          </BapsButton>
        </>
      }
    >
      <form
        id="rename-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(name);
        }}
      >
        <BapsInputText
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Project name"
        />
      </form>
    </BapsDialog>
  );
}`,
    next: `'use client';

${SETUP}

export default function RenameDialog({ open, onOpenChange, onSave }) {
  const [name, setName] = useState('');

  return (
    <BapsDialog
      visible={open}
      onVisibleChange={onOpenChange}
      header="Rename project"
      footer={
        <>
          <BapsButton severity="secondary" onClick={() => onOpenChange(false)}>Cancel</BapsButton>
          <BapsButton type="submit" form="rename-form">Save</BapsButton>
        </>
      }
    >
      <form id="rename-form" onSubmit={(e) => { e.preventDefault(); onSave(name); }}>
        <BapsInputText value={name} onChange={(e) => setName(e.target.value)} aria-label="Project name" />
      </form>
    </BapsDialog>
  );
}`,
  },

  // Footer actions pushed to the end, with Cancel first in source order.
  ActionsEnd: {
    primeng: `<baps-dialog [(visible)]="visible" header="Delete project">
  <ng-template pTemplate="footer">
    <baps-button label="Cancel" severity="secondary" (onClick)="visible = false" />
    <baps-button label="Delete" severity="danger" (onClick)="remove()" />
  </ng-template>
</baps-dialog>`,
    react: `${SETUP}

export function DeleteDialog({ open, onOpenChange, onDelete }) {
  return (
    <BapsDialog
      visible={open}
      onVisibleChange={onOpenChange}
      header="Delete project"
      footer={
        <>
          {/* Cancel first in SOURCE order. Where they sit visually is the
              footer's job; tab reaching the safe action before the
              destructive one is not a style choice. */}
          <BapsButton severity="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </BapsButton>
          <BapsButton severity="danger" onClick={onDelete}>
            Delete
          </BapsButton>
        </>
      }
    >
      <p>This cannot be undone.</p>
    </BapsDialog>
  );
}`,
    next: `'use client';

${SETUP}

export default function DeleteDialog({ open, onOpenChange, onDelete }) {
  return (
    <BapsDialog
      visible={open}
      onVisibleChange={onOpenChange}
      header="Delete project"
      footer={
        <>
          <BapsButton severity="secondary" onClick={() => onOpenChange(false)}>Cancel</BapsButton>
          <BapsButton severity="danger" onClick={onDelete}>Delete</BapsButton>
        </>
      }
    >
      <p>This cannot be undone.</p>
    </BapsDialog>
  );
}`,
  },

  // Trigger plus dialog, closed to begin with.
  Default: {
    primeng: `<baps-button label="Open" (onClick)="visible = true" />
<baps-dialog [(visible)]="visible" header="Project details">
  <p>Created 4 March by J. Patel.</p>
</baps-dialog>`,
    react: `${SETUP}

export function ProjectDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BapsButton onClick={() => setOpen(true)}>Open</BapsButton>
      {/* header is the accessible name. Without it the dialog is announced
          as nothing at all. */}
      <BapsDialog visible={open} onVisibleChange={setOpen} header="Project details">
        <p>Created 4 March by J. Patel.</p>
      </BapsDialog>
    </>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client': the dialog portals and owns focus while open. */
export default function ProjectDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BapsButton onClick={() => setOpen(true)}>Open</BapsButton>
      <BapsDialog visible={open} onVisibleChange={setOpen} header="Project details">
        <p>Created 4 March by J. Patel.</p>
      </BapsDialog>
    </>
  );
}`,
  },

  // Open on mount, for a docs page or a route that IS the dialog.
  Open: {
    primeng: `<baps-dialog [visible]="true" header="Project details" />`,
    react: `${SETUP}

export function AlwaysOpenDialog() {
  // Still controlled: visible is a prop even when it never changes, so the
  // component never disagrees with the caller about what is on screen.
  return (
    <BapsDialog visible header="Project details" onVisibleChange={() => {}}>
      <p>Created 4 March by J. Patel.</p>
    </BapsDialog>
  );
}`,
    next: `'use client';

${SETUP}

export default function AlwaysOpenDialog() {
  return (
    <BapsDialog visible header="Project details" onVisibleChange={() => {}}>
      <p>Created 4 March by J. Patel.</p>
    </BapsDialog>
  );
}`,
  },

  // MyBKY. Identical markup — the brand is the one prop that changes, and it
  // is the default, so passing it is documentation rather than configuration.
  MyBky: {
    primeng: `<baps-dialog [(visible)]="visible" brand="mybky" header="Project details" />`,
    react: `${SETUP}

export function MyBkyDialog({ open, onOpenChange }) {
  return (
    <BapsDialog visible={open} onVisibleChange={onOpenChange} header="Project details">
      <p>Created 4 March by J. Patel.</p>
    </BapsDialog>
  );
}`,
    next: `'use client';

${SETUP}

export default function MyBkyDialog({ open, onOpenChange }) {
  return (
    <BapsDialog visible={open} onVisibleChange={onOpenChange} header="Project details">
      <p>Created 4 March by J. Patel.</p>
    </BapsDialog>
  );
}`,
  },
};
