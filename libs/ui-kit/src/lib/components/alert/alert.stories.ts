import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { BapsAlert } from './alert.component';

/** The component's inputs plus the output spies these stories bind. */
type Args = BapsAlert & Record<'onClosed' | 'onPrimaryActionClick' | 'onSecondaryActionClick', (event?: unknown) => void>;

const meta: Meta<Args> = {
  title: 'Components/Molecules/Alert',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-messages-alert.
  id: 'components-alert',
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:89157.
    // Harvested from alert.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-89157' },
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts.
  // No 'autodocs': the docs page comes from alert.mdx, and tagging both makes the
  // Storybook indexer reject the entry outright ("created a component docs page
  // ... but also tagged ... autodocs"), which silently drops it from index.json.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsAlert,
  argTypes: {
    closed: { control: false },
    primaryActionClick: { control: false },
    secondaryActionClick: { control: false },
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
    closable: { control: 'boolean' },
  },
  args: {
    severity: 'info',
    closable: true,
  },
  render: (args) => ({
    props: { ...args, onClosed: action('closed'), onPrimaryActionClick: action('primaryActionClick'), onSecondaryActionClick: action('secondaryActionClick') },
    template: `
      <baps-alert [severity]="severity" [brand]="brand" [closable]="closable" [icon]="icon"
        (closed)="onClosed($event)"
        (primaryActionClick)="onPrimaryActionClick($event)"
        (secondaryActionClick)="onSecondaryActionClick($event)">
        This is an alert message!
      </baps-alert>
    `,
  }),
};

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

/** All four severities, MyBKY (default brand). */
export const Severities: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <baps-alert severity="info">This is an info alert.</baps-alert>
        <baps-alert severity="success">This is a success alert.</baps-alert>
        <baps-alert severity="warning">This is a warning alert.</baps-alert>
        <baps-alert severity="error">This is an error alert.</baps-alert>
      </div>
    `,
  }),
};

/**
 * A bold title above the body text, for alerts that need a headline before
 * the explanation. Without `title` the alert is a single text line.
 */
export const WithTitle: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <baps-alert severity="warning" title="Session expiring">
          You will be signed out in 5 minutes. Save your work.
        </baps-alert>
        <baps-alert severity="error" title="Upload failed" [closable]="true">
          3 of 12 files could not be processed. Check the file format and retry.
        </baps-alert>
      </div>
    `,
  }),
};

/**
 * Dismissible vs persistent. `closable` only renders the button and emits
 * `closed` — the component does NOT remove itself, so the consumer owns the
 * dismissal state. That's deliberate: an alert that hid itself couldn't be
 * re-shown, re-rendered from state, or animated out by its parent.
 */
export const Dismissible: Story = {
  render: () => ({
    props: { dismissed: false },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        @if (!dismissed) {
          <baps-alert severity="info" [closable]="true" (closed)="dismissed = true">
            Dismiss me — the parent owns the state, not the alert.
          </baps-alert>
        } @else {
          <button type="button" (click)="dismissed = false">Restore alert</button>
        }
        <baps-alert severity="warning">
          Persistent — no close button, cannot be dismissed.
        </baps-alert>
      </div>
    `,
  }),
};

/**
 * Form validation summary — a page/section-level error listing what failed,
 * placed above the form. This complements per-field inline messages
 * (`baps-message`), it does not replace them; see the Do's and Don'ts table.
 */
export const FormValidation: Story = {
  render: () => ({
    template: `
      <div style="max-width: 26rem;">
        <baps-alert severity="error" title="Could not save this karyakar">
          Name is required. Email is not a valid address.
        </baps-alert>
      </div>
    `,
  }),
};

/**
 * `appearance="card"` — the Sampark Portal "Alert & Notification" card
 * (Figma 13197:89157). Same component, different skin: it reuses `severity`,
 * `icon`, `closable` and `closed`, and adds `timestamp`, `progress`,
 * `progressLabel`, `primaryAction` and `secondaryAction` on top.
 *
 * Deliberately NO accent bar — the Figma card drops it. Severity tints only
 * the leading icon; the progress bar stays green in every variant because it
 * reports upload progress, not severity. Figma's four variants map to
 * severity info (neutral glyph) / success / error, plus `avatarLabel` for the
 * Avatar variant.
 */
export const Card: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:20px; padding:8px;">
        <baps-alert
          appearance="card"
          severity="info"
          title="New feature released"
          timestamp="2 mins ago"
          text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur."
          [closable]="true"
          [progress]="60"
          progressLabel="60% uploaded..."
          primaryAction="Cancel"
          secondaryAction="Upload Other"
        ></baps-alert>

        <baps-alert
          appearance="card"
          severity="success"
          title="Upload complete"
          timestamp="just now"
          text="All 12 files were processed without errors."
          [closable]="true"
          [progress]="100"
          progressLabel="100% uploaded"
          primaryAction="Dismiss"
          secondaryAction="View files"
        ></baps-alert>

        <baps-alert
          appearance="card"
          severity="error"
          title="Upload failed"
          timestamp="5 mins ago"
          text="3 of 12 files could not be processed. Check the file format and retry."
          [closable]="true"
          [progress]="25"
          progressLabel="25% uploaded..."
          primaryAction="Retry"
          secondaryAction="Upload Other"
        ></baps-alert>

        <baps-alert
          appearance="card"
          avatarLabel="GP"
          title="Ghanshyam Pandey"
          timestamp="2 mins ago"
          text="Shared the Regional Leadership Seminar 2024 roster with you."
          [closable]="true"
          primaryAction="Open"
          secondaryAction="Ignore"
        ></baps-alert>
      </div>
    `,
  }),
};

/**
 * Every card part is optional. Drop the progress bar, the actions, the
 * timestamp or the close button and the card reflows — the minimum is a
 * leading icon plus text.
 */
export const CardParts: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:20px; padding:8px;">
        <baps-alert
          appearance="card"
          severity="success"
          title="Saved"
          timestamp="1 min ago"
          text="No progress bar and no actions — just the header."
          [closable]="true"
        ></baps-alert>

        <baps-alert
          appearance="card"
          severity="info"
          text="Text only: no title, no timestamp, no close."
        ></baps-alert>

        <baps-alert
          appearance="card"
          severity="info"
          title="Syncing"
          text="Progress bar without a caption or actions."
          [progress]="40"
        ></baps-alert>
      </div>
    `,
  }),
};

/** Same four severities under the Sampark skin, via `brand="sampark"` (scoped, no page-wide toggle needed). */
export const Sampark: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <baps-alert severity="info" brand="sampark">This is an info alert.</baps-alert>
        <baps-alert severity="success" brand="sampark">This is a success alert.</baps-alert>
        <baps-alert severity="warning" brand="sampark">This is a warning alert.</baps-alert>
        <baps-alert severity="error" brand="sampark">This is an error alert.</baps-alert>
      </div>
    `,
  }),
};
