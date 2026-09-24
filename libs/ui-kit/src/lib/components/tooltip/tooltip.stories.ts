import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { BapsTooltip } from './tooltip.directive';
import { moduleMetadata } from '@storybook/angular';
import { BapsButton } from '../button/button.component';

/**
 * Tooltip — plain-text bubble (default) or, on Sampark, a rich card with
 * title + supporting text + "Learn more →" link (Figma node 13197:90046).
 *
 * Previous story used a bare `<button pButton>` without importing PrimeNG's
 * ButtonModule and without a `label`/content — it rendered as an empty,
 * near-invisible native button, so there was nothing to hover. It also never
 * actually connected `bapsTooltip`'s text to the underlying PrimeNG Tooltip
 * (see tooltip.directive.ts fix). Both are fixed here: a real `baps-button`
 * with visible text, and content wired through the injected Tooltip instance.
 */
type TooltipArgs = BapsTooltip & { tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' };

const meta: Meta<TooltipArgs> = {
  title: 'Components/Atoms/Tooltip',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-overlay-tooltip.
  id: 'components-tooltip',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    bapsTooltip: { control: 'text' },
    tooltipTitle: { control: 'text' },
    tooltipLinkLabel: { control: 'text' },
    tooltipPosition: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    tooltipStyleClass: { control: 'text' },
  },
  args: {
    bapsTooltip: 'This is a Sampark tooltip',
    tooltipPosition: 'top',
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:90046.
    // Harvested from tooltip.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-90046' },
  },
  component: BapsTooltip,
  decorators: [
    moduleMetadata({
      imports: [BapsTooltip, BapsButton],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 80px; display: flex; justify-content: center;">
        <baps-button
          label="Hover me"
          [brand]="brand"
          [bapsTooltip]="bapsTooltip"
          [tooltipPosition]="tooltipPosition"
          [tooltipTitle]="tooltipTitle"
          [tooltipLinkLabel]="tooltipLinkLabel"
        ></baps-button>
      </div>
    `,
  }),
};

export default meta;

export const Default: StoryObj<TooltipArgs> = {};

/**
 * Sampark Portal rich tooltip card — title, supporting text and a "Learn
 * more →" link on a white card with a soft shadow. Set `tooltipTitle` (and
 * optionally `tooltipLinkLabel`) alongside `bapsTooltip` to switch a
 * `brand="sampark"` tooltip into this layout.
 */
export const SamparkRichCard: StoryObj = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark Rich Card',
  render: () => ({
    template: `
      <div style="padding: 80px; display: flex; gap: 24px; justify-content: center;">
        <baps-button
          label="Top"
          severity="secondary"
          bapsTooltip="I'm Supporting Text"
          tooltipTitle="I'm Tooltip Title"
          tooltipLinkLabel="Learn more"
          tooltipPosition="top"
          brand="sampark"
        ></baps-button>
        <baps-button
          label="Right"
          severity="secondary"
          bapsTooltip="I'm Supporting Text"
          tooltipTitle="I'm Tooltip Title"
          tooltipLinkLabel="Learn more"
          tooltipPosition="right"
          brand="sampark"
        ></baps-button>
        <baps-button
          label="Bottom"
          severity="secondary"
          bapsTooltip="I'm Supporting Text"
          tooltipTitle="I'm Tooltip Title"
          tooltipLinkLabel="Learn more"
          tooltipPosition="bottom"
          brand="sampark"
        ></baps-button>
        <baps-button
          label="Left"
          severity="secondary"
          bapsTooltip="I'm Supporting Text"
          tooltipTitle="I'm Tooltip Title"
          tooltipLinkLabel="Learn more"
          tooltipPosition="left"
          brand="sampark"
        ></baps-button>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Hover shows it, unhover hides it again.
 *
 * The unhover half is the one that regresses: a tooltip that appears is
 * obvious in review, a tooltip that never leaves is only obvious in use.
 * Portaled to <body>, so queried on the document rather than the canvas.
 */
export const HoverInteraction: StoryObj<BapsTooltip & { tooltipText: string; tooltipPosition: string }> = {
  name: 'Interaction — hover',
  args: { tooltipText: 'This is a Sampark tooltip', tooltipPosition: 'top' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });

    await userEvent.hover(trigger);
    await waitFor(() => expect(page.getByText('This is a Sampark tooltip')).toBeVisible());

    await userEvent.unhover(trigger);
    await waitFor(() =>
      expect(page.queryByText('This is a Sampark tooltip')).not.toBeInTheDocument(),
    );
  },
};

/**
 * Focus shows it too — but ONLY with `tooltipEvent="both"`.
 *
 * Measured: with the default event the tooltip appears on hover and NOT on
 * focus, so a keyboard user never sees it. PrimeNG's default `tooltipEvent` is
 * `hover`, and this directive forwards the input, so the fix is per-instance
 * configuration rather than a component change — which is exactly what this
 * story documents. Reach for it on anything a keyboard user has to operate.
 */
export const FocusInteraction: StoryObj = {
  name: 'Interaction — focus (tooltipEvent="both")',
  render: () => ({
    template: `
      <div style="padding: 80px; display: flex; justify-content: center;">
        <baps-button
          label="Hover me"
          bapsTooltip="This is a Sampark tooltip"
          tooltipEvent="both"
          tooltipPosition="top"
        ></baps-button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    const trigger = canvas.getByRole('button', { name: 'Hover me' });
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(page.getByText('This is a Sampark tooltip')).toBeVisible());
  },
};
