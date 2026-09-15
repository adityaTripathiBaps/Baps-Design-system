import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { BapsPopover } from './popover.component';
import { BapsButton } from '../button/button.component';

/**
 * Popover — a small floating panel anchored to whatever opened it.
 *
 * This wrapper is IMPERATIVE, unlike most in this library. There is no
 * `visible` input to bind, because PrimeNG positions the panel against the
 * originating event's target:
 *
 *   <baps-button label="Options" (click)="pop.toggle($event)" />
 *   <baps-popover #pop>…</baps-popover>
 *
 * Passing the event is not optional. Without it there is no anchor and the
 * panel lands in the corner of the viewport.
 *
 * The panel is portalled to `<body>`, so its brand cannot ride on a host class
 * the way every other wrapper does — it is put on the panel's own class list
 * instead. That is why the styles for it are page-scoped rather than
 * host-scoped.
 */
const meta: Meta<BapsPopover> = {
  title: 'Components/Overlay/Popover',
  // Pinned so the categorised title above does not move the docs URL.
  id: 'components-popover',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsPopover,
  decorators: [moduleMetadata({ imports: [BapsPopover, BapsButton] })],
  argTypes: {
    hide: { control: false },
    show: { control: false },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
  },
  args: {
    styleClass: '',
    dismissable: true,
    autoZIndex: true,
    baseZIndex: 0,
    focusOnShow: true,
  },
};

export default meta;
type Story = StoryObj<BapsPopover>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:3rem">
        <baps-button label="Show details" [brand]="brand" (click)="pop.toggle($event)" />
        <baps-popover #pop [brand]="brand" [dismissable]="dismissable">
          <div style="min-width:14rem; display:flex; flex-direction:column; gap:0.5rem">
            <strong style="font-size:0.875rem">Robbinsvile</strong>
            <span style="font-size:0.8125rem; opacity:.75">220 karyakars · 820 families</span>
          </div>
        </baps-popover>
      </div>
    `,
  }),
};

/**
 * A popover holding actions rather than prose. Note the panel closes on
 * click-outside and on Escape — v21's Popover has no close-button input, so
 * an explicit close affordance has to be part of the content.
 */
export const WithActions: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:3rem">
        <baps-button label="Row actions" severity="secondary" [outlined]="true" [brand]="brand" (click)="pop.toggle($event)" />
        <baps-popover #pop [brand]="brand">
          <div style="display:flex; flex-direction:column; gap:0.25rem; min-width:10rem">
            <baps-button label="Edit" severity="secondary" [text]="true" size="small" [brand]="brand" />
            <baps-button label="Duplicate" severity="secondary" [text]="true" size="small" [brand]="brand" />
            <baps-button label="Delete" severity="danger" [text]="true" size="small" [brand]="brand" />
          </div>
        </baps-popover>
      </div>
    `,
  }),
};

/**
 * Two triggers, one panel each — the panel follows whichever button opened it,
 * which is the whole reason the API takes the event rather than a boolean.
 */
export const Anchoring: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:3rem; display:flex; justify-content:space-between; width:32rem">
        <baps-button label="Left" severity="secondary" [outlined]="true" [brand]="brand" (click)="a.toggle($event)" />
        <baps-button label="Right" severity="secondary" [outlined]="true" [brand]="brand" (click)="b.toggle($event)" />
        <baps-popover #a [brand]="brand"><span style="font-size:0.8125rem">Anchored left</span></baps-popover>
        <baps-popover #b [brand]="brand"><span style="font-size:0.8125rem">Anchored right</span></baps-popover>
      </div>
    `,
  }),
};

/* ── Interactions ────────────────────────────────────────────────────────── */

/**
 * Toggle open, then dismiss with Escape.
 *
 * Portaled to <body>, so the panel is queried on the document. The dismissal
 * paths ARE the contract here: v21's Popover has no close-button input, so
 * click-outside and Escape are the only ways out, and a regression in either
 * leaves a panel the user cannot close.
 */
export const OpenCloseInteraction: Story = {
  name: 'Interaction — open and dismiss',
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:3rem">
        <baps-button label="Show details" [brand]="brand" (click)="pop.toggle($event)" />
        <baps-popover #pop [brand]="brand" [dismissable]="dismissable">
          <div style="min-width:14rem">
            <strong style="font-size:0.875rem">Robbinsvile</strong>
          </div>
        </baps-popover>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Show details' }));
    await waitFor(() => expect(page.getByText('Robbinsvile')).toBeVisible(), { timeout: 8000 });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByText('Robbinsvile')).not.toBeInTheDocument(), { timeout: 8000 });
  },
};
