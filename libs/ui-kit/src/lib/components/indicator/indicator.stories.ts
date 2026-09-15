import type { Meta, StoryObj } from '@storybook/angular';
import { BapsIndicator } from './indicator.component';

/**
 * Indicator — one primitive covering three Sampark Portal frames that are the
 * same circle at different content:
 *   Status Dot (13197:91718) · Icon Badge (13197:91759) ·
 *   Notification Counts (13197:91693)
 *
 * Shared scale: 12 / 16 / 20 / 24px, white foreground on a semantic fill.
 */
const meta: Meta<BapsIndicator> = {
  title: 'Components/Feedback/Indicator',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-misc-indicator.
  id: 'components-indicator',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:91718.
    // Harvested from indicator.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-91718' },
  },
  component: BapsIndicator,
  argTypes: {
    severity: {
      control: 'select',
      options: ['primary', 'info', 'success', 'warning', 'error', 'grey'],
    },
    size: { control: 'radio', options: ['s', 'm', 'l', 'xl'] },
    disabled: { control: 'boolean' },
    ring: { control: 'boolean' },
  },
  args: {
    severity: 'error', size: 'm', disabled: false, ring: false,
    text: false,
  },
};

export default meta;

export const Playground: StoryObj<BapsIndicator> = {
  render: (args) => ({
    props: args,
    template: `
      <baps-indicator [severity]="severity" [size]="size" [disabled]="disabled" [ring]="ring"></baps-indicator>
    `,
  }),
};

/**
 * Status Dot (13197:91718) — 5 colours x 4 sizes, no content.
 *
 * Grey is this frame's neutral; it does not appear in the Icon Badge frame.
 */
export const StatusDot: StoryObj<BapsIndicator> = {
  render: () => ({
    props: {
      sevs: ['success', 'error', 'info', 'warning', 'grey'],
      sizes: ['s', 'm', 'l', 'xl'],
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem">
        @for (sev of sevs; track sev) {
          <div style="display:flex; align-items:center; gap:1rem">
            @for (sz of sizes; track sz) {
              <baps-indicator [severity]="sev" [size]="sz"></baps-indicator>
            }
            <span style="font:400 12px/1.3 Inter, sans-serif; color:#595656">{{ sev }}</span>
          </div>
        }
      </div>
    `,
  }),
};

/**
 * Notification Counts (13197:91693) — Notification (bare dot), Counts (number)
 * and Disable, each across the four sizes.
 *
 * The count font steps with the circle: 10 / 12 / 14 / 16px Inter Semi Bold.
 * `text` widens the inner box so two digits are not clipped.
 */
export const NotificationCounts: StoryObj<BapsIndicator> = {
  render: () => ({
    props: { sizes: ['s', 'm', 'l', 'xl'] },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem">
        <div style="display:flex; align-items:center; gap:1rem">
          @for (sz of sizes; track sz) {
            <baps-indicator severity="error" [size]="sz"></baps-indicator>
          }
          <span style="font:400 12px/1.3 Inter, sans-serif; color:#595656">Notification</span>
        </div>
        <div style="display:flex; align-items:center; gap:1rem">
          @for (sz of sizes; track sz) {
            <baps-indicator severity="error" [size]="sz" [text]="true" ariaLabel="3 unread">3</baps-indicator>
          }
          <span style="font:400 12px/1.3 Inter, sans-serif; color:#595656">Counts</span>
        </div>
        <div style="display:flex; align-items:center; gap:1rem">
          @for (sz of sizes; track sz) {
            <baps-indicator [size]="sz" [text]="true" [disabled]="true">3</baps-indicator>
          }
          <span style="font:400 12px/1.3 Inter, sans-serif; color:#595656">Disable</span>
        </div>
      </div>
    `,
  }),
};

/**
 * Icon Badge (13197:91759) — 5 types x 4 sizes, white glyph inside.
 *
 * Primary (maroon) appears here but not in the Status Dot frame. Icons are
 * projected SVG, matching the convention in `baps-avatar` and
 * `baps-menu-item`.
 */
export const IconBadge: StoryObj<BapsIndicator> = {
  render: () => ({
    props: {
      sevs: ['primary', 'info', 'success', 'warning', 'error'],
      sizes: ['m', 'l', 'xl'],
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:0.75rem">
        @for (sev of sevs; track sev) {
          <div style="display:flex; align-items:center; gap:1rem">
            @for (sz of sizes; track sz) {
              <baps-indicator [severity]="sev" [size]="sz">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m5 12 5 5L20 7" />
                </svg>
              </baps-indicator>
            }
            <span style="font:400 12px/1.3 Inter, sans-serif; color:#595656">{{ sev }}</span>
          </div>
        }
      </div>
    `,
  }),
};

/**
 * The `ring` option, for a marker overlaid on an avatar or coloured surface.
 * Off by default — an inline dot should not pay for a separator it does not
 * need.
 */
export const WithRing: StoryObj<BapsIndicator> = {
  render: () => ({
    template: `
      <div style="display:flex; align-items:center; gap:1.5rem; background:#595656; padding:1rem; border-radius:0.5rem">
        <baps-indicator severity="success" size="l"></baps-indicator>
        <baps-indicator severity="success" size="l" [ring]="true"></baps-indicator>
      </div>
    `,
  }),
};
