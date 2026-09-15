import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsDialog } from './dialog.component';
import { BapsButton } from '../button/button.component';
import { BapsCheckbox } from '../checkbox/checkbox.component';
import { BapsToggleSwitch } from '../toggle-switch/toggle-switch.component';
import { BapsDivider } from '../divider/divider.component';

/**
 * Story-only presentation, kept out of the component: these classes describe
 * the *example content* projected into the dialog, not the dialog shell. The
 * shell's own geometry is all in dialog.component.ts and its [dt] tokens.
 */
const STORY_STYLES = `
  .story-pad { padding: 2rem; }
  .story-dialog-glyph { font-size: 3rem; color: var(--color-sampark-mono-40, #bcb9b9); }
  .story-dialog-body { margin: 0; }
  .story-dialog-question { margin: 1.5rem 0 0; }
  .story-dialog-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-top: 1.5rem;
    text-align: start;
  }
  .story-dialog-option {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--color-sampark-border-default, #e1e0e0);
    border-radius: var(--radius-sampark-default, 0.25rem);
  }
  .story-dialog-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
    text-align: start;
  }
`;

/**
 * A centred, masked modal that stops the page until the decision in it is
 * resolved — the component `patterns/delete-confirmation.mdx` was written
 * around the absence of, and that `alert.mdx` and `drawer.mdx` both point at
 * from their "When Not to Use" tables.
 *
 * Wraps PrimeNG `p-dialog`. Figma: Sampark Portal 17512:84190 / 83559 / 83546
 * (three instances of one 500px shell) and 17512:83001 / 84005 (the same shell
 * at 600px with a form body).
 */
const meta: Meta<BapsDialog> = {
  title: 'Components/Overlay/Dialog',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-overlay-dialog.
  id: 'components-dialog',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsDialog,
  decorators: [
    moduleMetadata({
      imports: [FormsModule, BapsDialog, BapsButton, BapsCheckbox, BapsToggleSwitch, BapsDivider],
    }),
  ],
  argTypes: {
    hidden: { control: false },
    shown: { control: false },
    visibleChange: { control: false },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    align: { control: 'inline-radio', options: ['center', 'start'] },
    actionsAlign: { control: 'inline-radio', options: ['center', 'end'] },
    role: { control: 'inline-radio', options: ['dialog', 'alertdialog'] },
    appendTo: { control: 'inline-radio', options: ['self', 'body'] },
  },
  args: {
    styleClass: '',
    header: 'Cancel Document Upload',
    width: '31.25rem',
    align: 'center',
    actionsAlign: 'center',
    role: 'dialog',
    modal: true,
    closable: false,
    closeOnEscape: true,
    dismissableMask: false,
    blockScroll: true,
    appendTo: 'body',
    visible: false,
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:84190.
    // Harvested from dialog.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-84190' },
    // The panel is fixed-position and its mask fills the viewport, so the
    // default padded docs frame clips it. Stories open it in place instead.
    layout: 'fullscreen',
    // KNOWN ISSUE, same one baps-drawer records and accepted for the same
    // reason: PrimeNG's mask is `position: fixed`, appended to document.body,
    // and is not a DOM descendant of the docs canvas box, so no CSS
    // containment trick can confine it there. Opening any example on this
    // merged Docs page dims the whole page, ArgsTable included. The real fix
    // (`docs.story.inline: false`, one iframe per example) was tried on
    // drawer and reverted — it means a separate Angular bootstrap per
    // canvas, which blows the chunk-load timeout on this machine. Reload
    // after opening a dialog here to clear the dim.
    docs: { story: { inline: true } },
  },
};

export default meta;
type Story = StoryObj<BapsDialog>;

/**
 * The Figma confirm shell verbatim (17512:84190): 500px wide, 32px padding, a
 * 100x100 illustration over a 20px/600 centred title, 14px body copy, and a
 * centred pair of equal-width 150px buttons.
 *
 * Note what the defaults already do without being asked: the mask does not
 * dismiss, Escape does, the page behind cannot scroll, and closing hands
 * focus back to the button that opened it.
 */
export const Default: Story = {
  render: (args) => ({
    props: { args, ui: { open: args.visible } },
    template: `
      <div class="story-pad">
        <baps-button
          [brand]="args.brand"
          severity="secondary"
          [outlined]="true"
          label="Cancel upload"
          (click)="ui.open = true"
        />

        <baps-dialog
          [(visible)]="ui.open"
          [header]="args.header"
          [brand]="args.brand"
          [width]="args.width"
          [align]="args.align"
          [actionsAlign]="args.actionsAlign"
          [role]="args.role"
          [modal]="args.modal"
          [closable]="args.closable"
          [closeOnEscape]="args.closeOnEscape"
          [dismissableMask]="args.dismissableMask"
          [blockScroll]="args.blockScroll"
          [appendTo]="args.appendTo"
        >
          <i dialog-media class="pi pi-exclamation-triangle story-dialog-glyph"></i>

          <p class="story-dialog-body">
            You are about to cancel the current upload. Any in-progress uploads will be discarded.
          </p>
          <p class="story-dialog-question">Are you sure you want to cancel?</p>

          <div dialog-footer>
            <baps-button
              [brand]="args.brand"
              severity="secondary"
              [outlined]="true"
              size="small"
              label="Continue Upload"
              (click)="ui.open = false"
            />
            <baps-button
              [brand]="args.brand"
              severity="danger"
              size="small"
              label="Yes, Cancel"
              (click)="ui.open = false"
            />
          </div>
        </baps-dialog>
      </div>
    `,
    styles: [STORY_STYLES],
  }),
};

/**
 * Press "Cancel upload" to open the shell.
 *
 * NOT open on load, though the open shell is what it demonstrates. Autodocs
 * mounts every story of a component on ONE page, and a dialog's mask is a
 * fixed full-viewport div appended to `<body>` — not scoped to a story's
 * canvas. Four stories defaulting to open stacked four masks and four modals
 * over the docs page permanently, and the page read as broken. The drawer and
 * the two table-config panels carry the same note for the same reason.
 */
export const Open: Story = {
  ...Default,
  args: { visible: false },
};

/**
 * The same shell on the MyBKY ramp.
 *
 * Worth its own story because `delete-confirmation.mdx` records that
 * `baps-drawer` gives `brand="mybky"` *nothing* — a MyBKY drawer renders as
 * unskinned PrimeNG, which is why every story on that page is forced to
 * Sampark. Dialog ships a MyBKY token block too, so the shell is the shell on
 * both brands and only the ramp moves.
 */
export const MyBky: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  ...Default,
  args: { brand: 'mybky', visible: false },
};

/**
 * The larger form modal (Figma 17512:83001 "Auto Assign Families"): the same
 * 32px shell at 600px with `align="start"`, because a column of checkboxes,
 * switches and helper text has to read as a left-aligned form. The button pair
 * below stays centred and equal-width — that part of the shell does not change
 * between the two sizes.
 *
 * This is the story that proves the API is not confirm-only.
 */
export const FormModal: Story = {
  args: {
    header: 'Auto Assign Families',
    width: '37.5rem',
    align: 'start',
    visible: false,
  },
  render: (args) => ({
    props: {
      args,
      ui: { open: args.visible, mode: 'equal', regularFirst: true, previousLinkage: false },
    },
    template: `
      <div class="story-pad">
        <baps-button [brand]="args.brand" label="Auto assign" (click)="ui.open = true" />

        <baps-dialog
          [(visible)]="ui.open"
          [header]="args.header"
          [brand]="args.brand"
          [width]="args.width"
          [align]="args.align"
          [actionsAlign]="args.actionsAlign"
          [closable]="args.closable"
          [appendTo]="args.appendTo"
        >
          <p class="story-dialog-body">Distribute 709 families among 100 karyakars.</p>

          <div class="story-dialog-grid">
            <div class="story-dialog-option">
              <baps-checkbox
                [brand]="args.brand"
                [binary]="true"
                [(ngModel)]="ui.regularFirst"
                label="Equally Assign"
              />
              <baps-divider [brand]="args.brand" />
              <small>The system will equally distribute families across all Karyakars.</small>
            </div>
            <div class="story-dialog-option">
              <baps-checkbox
                [brand]="args.brand"
                [binary]="true"
                [(ngModel)]="ui.previousLinkage"
                label="Fixed Assign"
              />
              <small>5 Min &ndash; 15 Max</small>
            </div>
          </div>

          <div class="story-dialog-row">
            <baps-toggleswitch [brand]="args.brand" [(ngModel)]="ui.regularFirst" />
            <span>Assign all regular families to their regular karyakars first.</span>
          </div>
          <div class="story-dialog-row">
            <baps-toggleswitch [brand]="args.brand" [(ngModel)]="ui.previousLinkage" />
            <span>Assign families to karyakars based on previous project linkage.</span>
          </div>

          <div dialog-footer>
            <baps-button
              [brand]="args.brand"
              severity="secondary"
              [outlined]="true"
              size="small"
              label="Cancel"
              (click)="ui.open = false"
            />
            <baps-button
              [brand]="args.brand"
              size="small"
              label="Auto Assign"
              (click)="ui.open = false"
            />
          </div>
        </baps-dialog>
      </div>
    `,
    styles: [STORY_STYLES],
  }),
};

/**
 * A footer that is not a two-button pair. `actionsAlign="end"` drops the equal
 * 150px widths and right-aligns at intrinsic width — the conventional dialog
 * footer, for when three actions or a wide label would not survive the Figma
 * pair's geometry.
 */
export const ActionsEnd: Story = {
  ...Default,
  args: { actionsAlign: 'end', visible: false },
};

/* ── Interactions ──────────────────────────────────────────────────────────
   Each of these renders its OWN template with a trigger button. The meta for
   this component supplies no render, so a play story that relied on it mounted
   a closed dialog and nothing to open it — "Unable to find an accessible
   element with the role button". */

/** The trigger + panel pair every interaction story here needs. */
const dialogHarness = (args: Record<string, unknown>) => ({
  props: { args, ui: { open: false } },
  template: `
    <div class="story-pad">
      <baps-button
        [brand]="args.brand"
        severity="secondary"
        [outlined]="true"
        label="Cancel upload"
        (click)="ui.open = true"
      />
      <baps-dialog
        [(visible)]="ui.open"
        [header]="args.header"
        [brand]="args.brand"
        [closeOnEscape]="true"
        [modal]="true"
        [closable]="true"
      >
        <p class="story-dialog-body">Any in-progress uploads will be discarded.</p>
      </baps-dialog>
    </div>
  `,
});

/**
 * Open, then close with the close button.
 *
 * The harness passes `[closable]="true"` on purpose: measured without it, the
 * panel renders no buttons whatsoever, so combined with the Escape gap below it
 * would be a dialog a user cannot leave.
 *
 * KNOWN GAP, measured rather than assumed: **Escape does not close this
 * dialog**, even though `closeOnEscape` defaults to true and the story passes
 * it explicitly. Driven in a real browser — open the panel, press Escape — the
 * panel count stays at 1. The same test against `baps-drawer` goes 1 -> 0, so
 * this is specific to the dialog rather than something about the harness.
 *
 * That leaves a keyboard user with no way out except finding the close button,
 * which is a real accessibility problem. It is recorded here instead of being
 * patched: fixing it changes component behaviour, which is out of scope for a
 * Storybook pass. This story therefore asserts the path that DOES work, and
 * EscapeGapInteraction below pins the current behaviour so the day it is fixed,
 * that story fails and tells someone to update this note.
 */
export const OpenCloseInteraction: Story = {
  name: 'Interaction — open and close',
  render: dialogHarness,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Cancel upload/ }));
    await waitFor(() => expect(page.getByRole('dialog')).toBeVisible());

    await userEvent.click(page.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(page.queryByRole('dialog')).not.toBeInTheDocument());
  },
};

/**
 * Pins the Escape gap described above. This story PASSING means Escape is
 * still broken; when someone fixes `closeOnEscape`, this story starts failing
 * — which is the point. Delete it and the note above at that time.
 */
export const EscapeGapInteraction: Story = {
  name: 'Interaction — Escape does not close (known gap)',
  render: dialogHarness,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Cancel upload/ }));
    await waitFor(() => expect(page.getByRole('dialog')).toBeVisible());

    await userEvent.keyboard('{Escape}');
    await expect(page.getByRole('dialog')).toBeVisible();
  },
};

/** The panel is a real modal dialog — role and aria-modal, not a styled div. */
export const ModalSemanticsInteraction: Story = {
  name: 'Interaction — modal semantics',
  render: dialogHarness,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Cancel upload/ }));
    const dialogEl = await waitFor(() => page.getByRole('dialog'));

    // Without aria-modal a screen reader keeps reading the page behind the
    // panel — the difference between a dialog and a floating card.
    await expect(dialogEl).toHaveAttribute('aria-modal', 'true');
  },
};
