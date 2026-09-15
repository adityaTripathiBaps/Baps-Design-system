import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsCard } from './card.component';
import { BapsButton } from '../button/button.component';
import { BapsTag } from '../tag/tag.component';
import { BapsAvatar } from '../avatar/avatar.component';
import { BapsAvatarGroup } from '../avatar/avatar-group.component';
import { BapsProgressBar } from '../progress-bar/progress-bar.component';

const meta: Meta<BapsCard> = {
  title: 'Components/Layout/Card',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-panel-card.
  id: 'components-card',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsCard,
  decorators: [
    moduleMetadata({
      imports: [BapsCard, BapsButton, BapsTag, BapsAvatar, BapsAvatarGroup, BapsProgressBar],
    }),
  ],
  argTypes: {
    padding: { control: 'inline-radio', options: ['default', 'compact', 'none'] },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    divided: { control: 'boolean' },
    raised: { control: 'boolean' },
    interactive: { control: 'boolean' },
  },
  args: {
    padding: 'default',
    divided: false,
    raised: false,
    interactive: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 420px">
        <baps-card
          [padding]="padding"
          [divided]="divided"
          [raised]="raised"
          [interactive]="interactive"
          [brand]="brand"
        >
          <span card-title>Registrations this week</span>
          <span card-subtitle>Yuva Sabha — 3 May</span>
          <div card-actions>
            <baps-button label="Export" severity="secondary" [text]="true" [brand]="brand" />
          </div>

          <p style="margin: 0">
            128 members have registered so far. Capacity closes on 1 May.
          </p>

          <div card-footer>Updated 12 April 2026</div>
        </baps-card>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<BapsCard>;

/** All four slots filled, at rest: hairline border, 8px radius, no shadow. */
export const Playground: Story = {};

/**
 * The common dashboard case — a bare card with only body content. No header
 * row is rendered at all, so there is no leading gap above the content.
 */
export const BodyOnly: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 420px">
        <baps-card [brand]="brand" [padding]="padding">
          <span class="eyebrow" style="display:block; margin-bottom: 0.5rem">Donations this month</span>
          <div style="font-size: 1.75rem; font-weight: 700">₹ 3,42,600</div>
        </baps-card>
      </div>
    `,
  }),
};

/** Header and footer separated by hairlines rather than whitespace alone. */
export const Divided: Story = {
  args: { divided: true },
};

/**
 * The three padding steps. `none` is for cards whose body is a full-bleed
 * table or list that supplies its own gutters.
 */
export const PaddingSteps: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 1rem; max-width: 420px">
        <baps-card [brand]="brand" padding="default">
          <span card-title>default</span>
          24px — the standard content card.
        </baps-card>
        <baps-card [brand]="brand" padding="compact">
          <span card-title>compact</span>
          16px — dense or table-adjacent.
        </baps-card>
        <baps-card [brand]="brand" padding="none" [divided]="true">
          <span card-title style="padding: 1rem 1rem 0">none</span>
          <div style="padding: 1rem">0 — the body supplies its own gutters.</div>
        </baps-card>
      </div>
    `,
  }),
};

/**
 * A card at rest has no shadow — `raised` is the exception, for cards that
 * genuinely float above the page. Shown side by side so the difference from
 * the default is visible.
 */
export const RestVsRaised: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 640px">
        <baps-card [brand]="brand">
          <span card-title>At rest</span>
          <span card-subtitle>Hairline border, no shadow</span>
          This is what almost every card should be.
        </baps-card>
        <baps-card [brand]="brand" [raised]="true">
          <span card-title>Raised</span>
          <span card-subtitle>Brand shadow</span>
          Only for cards that float above the page.
        </baps-card>
      </div>
    `,
  }),
};

/**
 * `interactive` makes the whole card one click target — it adds
 * `role="button"`, `tabindex="0"`, a hover border-darken and a focus ring.
 * Tab to it to see the ring. Bind your own `(click)` on the host.
 */
export const Interactive: Story = {
  args: { interactive: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 1rem; max-width: 420px">
        <baps-card [brand]="brand" [interactive]="true">
          <span card-title>Yuva Sabha</span>
          <span card-subtitle>3 May, 4:00 PM</span>
          <div card-actions><baps-tag value="Open" severity="success" [brand]="brand" /></div>
        </baps-card>
        <baps-card [brand]="brand" [interactive]="true">
          <span card-title>Annadan Seva</span>
          <span card-subtitle>Ongoing</span>
          <div card-actions><baps-tag value="Full" [brand]="brand" /></div>
        </baps-card>
      </div>
    `,
  }),
};

/**
 * The dashboard summary row this component was added for — previously three
 * hand-rolled `<div class="panel">` blocks in every consuming app.
 */
export const DashboardTiles: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem">
        <baps-card [brand]="brand">
          <span class="eyebrow" style="display:block; margin-bottom:0.5rem">Registrations this week</span>
          <div style="font-size:1.75rem; font-weight:700; margin-bottom:0.75rem">128</div>
          <baps-progressbar [value]="72" severity="success" [brand]="brand" />
          <p style="margin:0.5rem 0 0; font-size:0.875rem; color:var(--card-sampark-subtitle-color)">
            72% of the Yuva Sabha capacity
          </p>
        </baps-card>

        <baps-card [brand]="brand">
          <span class="eyebrow" style="display:block; margin-bottom:0.5rem">Donations this month</span>
          <div style="font-size:1.75rem; font-weight:700; margin-bottom:0.75rem">₹ 3,42,600</div>
          <div style="display:flex; gap:0.5rem">
            <baps-tag value="Annadan Seva" severity="contrast" [brand]="brand" />
            <baps-tag value="General Fund" [brand]="brand" />
          </div>
        </baps-card>

        <baps-card [brand]="brand">
          <span class="eyebrow" style="display:block; margin-bottom:0.5rem">Seva volunteers</span>
          <baps-avatargroup>
            <baps-avatar label="NP" size="s" [brand]="brand" />
            <baps-avatar label="PS" size="s" [brand]="brand" />
            <baps-avatar label="RT" size="s" [brand]="brand" />
            <baps-avatar label="+9" size="s" [brand]="brand" />
          </baps-avatargroup>
          <p style="margin:0.5rem 0 0; font-size:0.875rem; color:var(--card-sampark-subtitle-color)">
            12 volunteers active today
          </p>
        </baps-card>
      </div>
    `,
  }),
};
