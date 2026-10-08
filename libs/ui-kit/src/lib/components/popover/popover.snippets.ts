/**
 * Framework snippets for the Popover docs page.
 *
 * ## Route B: no Custom tab
 *
 * The panel is positioned against its trigger at open time and appended
 * elsewhere in the document — PrimeNG's overlay in Angular, a portal in
 * `@org/ui-kit-react`. Static markup cannot reproduce a position that is
 * computed, so no Custom block is written.
 *
 * The skin ships: `popover.css` styles `.p-popover` and its arrow and
 * placement classes.
 *
 * ## A popover is not a dialog
 *
 * It does not trap focus and it does not block the page. Reach for a dialog
 * when the task must be finished before anything else; reach for a popover
 * when the content is a detail the reader can walk away from. Getting this
 * backwards is the most common misuse: a popover holding a required form
 * leaves a keyboard user able to tab straight out of it.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('popover');

export const popoverSnippets: Record<string, SnippetSet> = {
  // Trigger plus panel. The trigger owns the open state in both frameworks.
  Default: {
    primeng: `<baps-button label="Details" (onClick)="op.toggle($event)" />
<baps-popover #op>
  <p>Last synced 4 minutes ago.</p>
</baps-popover>`,
    react: `${SETUP}

export function SyncDetails() {
  const [open, setOpen] = useState(false);

  return (
    <BapsPopover
      visible={open}
      onVisibleChange={setOpen}
      trigger={
        // aria-expanded and aria-haspopup belong on the trigger, not the
        // panel: they describe what the button does.
        <BapsButton severity="secondary" size="small" onClick={() => setOpen((v) => !v)}>
          Details
        </BapsButton>
      }
    >
      <p>Last synced 4 minutes ago.</p>
    </BapsPopover>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client': the panel is positioned at open time and portals. */
export default function SyncDetails() {
  const [open, setOpen] = useState(false);

  return (
    <BapsPopover
      visible={open}
      onVisibleChange={setOpen}
      trigger={
        <BapsButton severity="secondary" size="small" onClick={() => setOpen((v) => !v)}>
          Details
        </BapsButton>
      }
    >
      <p>Last synced 4 minutes ago.</p>
    </BapsPopover>
  );
}`,
  },

  // With actions. The buttons close the panel themselves — a popover that
  // stays open after its own action looks broken.
  WithActions: {
    primeng: `<baps-popover #op>
  <p>Remove this karyakar from the assignment?</p>
  <baps-button label="Cancel" severity="secondary" (onClick)="op.hide()" />
  <baps-button label="Remove" severity="danger" (onClick)="remove(); op.hide()" />
</baps-popover>`,
    react: `${SETUP}

export function RemoveConfirm({ onRemove }) {
  const [open, setOpen] = useState(false);

  // A confirmation that can be dismissed by clicking away is fine here
  // BECAUSE walking away is the safe outcome. If the destructive path were
  // the default, this would have to be a dialog.
  return (
    <BapsPopover
      visible={open}
      onVisibleChange={setOpen}
      trigger={<BapsButton severity="secondary" size="small" onClick={() => setOpen(true)}>Remove</BapsButton>}
    >
      <p>Remove this karyakar from the assignment?</p>
      <BapsButton severity="secondary" size="small" onClick={() => setOpen(false)}>
        Cancel
      </BapsButton>
      <BapsButton severity="danger" size="small" onClick={() => { onRemove(); setOpen(false); }}>
        Remove
      </BapsButton>
    </BapsPopover>
  );
}`,
    next: `'use client';

${SETUP}

export default function RemoveConfirm({ onRemove }) {
  const [open, setOpen] = useState(false);

  return (
    <BapsPopover
      visible={open}
      onVisibleChange={setOpen}
      trigger={<BapsButton severity="secondary" size="small" onClick={() => setOpen(true)}>Remove</BapsButton>}
    >
      <p>Remove this karyakar from the assignment?</p>
      <BapsButton severity="secondary" size="small" onClick={() => setOpen(false)}>Cancel</BapsButton>
      <BapsButton severity="danger" size="small" onClick={() => { onRemove(); setOpen(false); }}>
        Remove
      </BapsButton>
    </BapsPopover>
  );
}`,
  },

  // Placement. The component flips the panel when the chosen side has no
  // room, so a preference is a preference and not a promise.
  Anchoring: {
    primeng: `<baps-popover #op appendTo="body" />`,
    react: `${SETUP}

export function AnchoredPopover({ placement = 'bottom' }) {
  const [open, setOpen] = useState(false);

  return (
    <BapsPopover
      visible={open}
      onVisibleChange={setOpen}
      placement={placement}
      trigger={<BapsButton severity="secondary" size="small" onClick={() => setOpen((v) => !v)}>Open</BapsButton>}
    >
      <p>Anchored to its trigger, flipped if the side runs out of room.</p>
    </BapsPopover>
  );
}`,
    next: `'use client';

${SETUP}

export default function AnchoredPopover({ placement = 'bottom' }) {
  const [open, setOpen] = useState(false);

  return (
    <BapsPopover
      visible={open}
      onVisibleChange={setOpen}
      placement={placement}
      trigger={<BapsButton severity="secondary" size="small" onClick={() => setOpen((v) => !v)}>Open</BapsButton>}
    >
      <p>Anchored to its trigger, flipped if the side runs out of room.</p>
    </BapsPopover>
  );
}`,
  },
};
