import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsChip } from './chip.component';

/**
 * Chip — a compact label for a selected value, a filter, or an entity.
 *
 * This is the same visual object a multiselect renders for each selection, so
 * both read from the grey (no-severity) tag tokens. Flip the toolbar's Design
 * System switch to compare: MyBKY is a 99px pill at 12px/500, Sampark a 4px
 * rounded rect at 13px/400. That shape split is deliberate — the token file
 * calls it a different philosophy, not a different number.
 */
const meta: Meta<BapsChip> = {
  title: 'Components/Atoms/Chip',
  // Pinned so the categorised title above does not move the docs URL.
  id: 'components-chip',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    // Design tab — the Figma frame this component implements, node 22465:95582.
    // Harvested from chip.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/yY5bmcEifXbcCwhauoiy6Y/?node-id=22465-95582' },
  },
  component: BapsChip,
  decorators: [moduleMetadata({ imports: [BapsChip] })],
  argTypes: {
    imageError: { control: false },
    remove: { control: false },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    severity: {
      control: 'inline-radio',
      options: ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'],
    },
    size: { control: 'inline-radio', options: [undefined, 'xs', 's', 'm', 'l'] },
    icon: { control: 'text' },
    chevron: { control: 'boolean' },
    disabled: { control: 'boolean' },
    removable: { control: 'boolean' },
    count: { control: 'number' },
  },
  args: {
    styleClass: '',
    label: 'Robbinsvile',
    chevron: false,
    disabled: false,
    removable: false,
    severity: 'grey',
    size: 'm',
  },
  render: (args) => ({
    props: args,
    template: `
      <baps-chip
        [label]="label"
        [icon]="icon"
        [image]="image"
        [removable]="removable"
        [removeIcon]="removeIcon"
        [disabled]="disabled"
        [chevron]="chevron"
        [count]="count"
        [size]="size"
        [severity]="severity"
        [brand]="brand"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<BapsChip>;

export const Default: Story = {};

/** With a leading icon. */
export const WithIcon: Story = {
  render: () => ({
    template: `
      <baps-chip icon="pi pi-users" label="Satsang Network" />
    `,
  }),
};

/**
 * `removable` adds the cross — hover a chip to see it.
 *
 * It stays hidden at rest and takes NO space while hidden: it is positioned
 * out of flow, so a chip does not resize when the cross appears and does not
 * shove its neighbours along the row. A plate behind it carries the chip's own
 * background, so the cross covers the tail of a long label cleanly instead of
 * striking through it.
 */
export const Removable: Story = {
  render: () => ({
    template: `
      <baps-chip label="Robbinsvile" [removable]="true" />
    `,
  }),
};

/** A row of them, which is how they actually appear. */
export const Group: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center">
        <baps-chip label="North America" [removable]="true" />
        <baps-chip label="Canada-007" [removable]="true" />
        <baps-chip label="Robbinsvile" [removable]="true" />
        <baps-chip label="Edison" [removable]="true" />
      </div>
    `,
  }),
};

/**
 * Both brands side by side, so the pill-vs-rect split is visible without
 * flipping the toolbar. The pinned `brand` is the per-instance override.
 */
export const Brands: Story = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    template: `
      <div style="display:flex; gap:2rem; align-items:center">
        <div style="display:flex; gap:0.5rem; align-items:center">
          <span style="font:500 12px system-ui; opacity:.6">MyBKY</span>
          <baps-chip label="Robbinsvile" [removable]="true" brand="mybky" />
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center">
          <span style="font:500 12px system-ui; opacity:.6">Sampark</span>
          <baps-chip label="Robbinsvile" [removable]="true" brand="sampark" />
        </div>
      </div>
    `,
  }),
};

/* ── Figma "Badge" — MyBKY 22465:95582, Sampark 13197:90701 ──
   The frame is a six-axis matrix: Badge (7 severities) x Status (default /
   hover / disable) x Size (XS 18, S 22, M 26, L 32) x Text x Chevron x
   Trailing Action. The stories below take one slice each rather than
   reproducing all of it — a wall of chips shows the axes and hides the
   anatomy. Matrix at the end is the wall, for when comparison is the point.

   ── Why these are written out longhand ──
   Every example spells its attributes as LITERALS and passes no brand at all.
   That is a docs-quality decision, not a style preference.

   The loop form these replaced rendered identical chips but made Show code
   emit markup like:

       <baps-chip [brand]="brand" [severity]="s" [count]="8" />

   ...where `brand` and `s` are the story's own arg and loop variables. Copied
   into an app, that does not compile: Angular reads [severity]="s" as "the
   property s on this component", finds none, and the page silently keeps
   serving its last good bundle. It caused three build failures in a row for a
   reader doing exactly what the docs invited.

   PrimeNG's own pages set the bar — every snippet there is literal and
   paste-ready. So: no [brand] (the toolbar's Design system toggle drives the
   brand through the page scope, which is also how a real app works, MyBKY
   being the unscoped default) and no bound loop variables.

   Matrix keeps its loops deliberately; see its own note. */

/** All seven ramps. Flip the toolbar's Design system switch to compare brands. */
export const Severities: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:.5rem; align-items:center">
        <baps-chip label="grey" [count]="8" />
        <baps-chip severity="primary" label="primary" [count]="8" />
        <baps-chip severity="secondary" label="secondary" [count]="8" />
        <baps-chip severity="info" label="info" [count]="8" />
        <baps-chip severity="warning" label="warning" [count]="8" />
        <baps-chip severity="error" label="error" [count]="8" />
        <baps-chip severity="success" label="success" [count]="8" />
      </div>
    `,
  }),
};

/**
 * The four heights, 18 / 22 / 26 / 32px.
 *
 * Leaving `size` off keeps the geometry this component always had, which is
 * why the other stories do not pass it — see the input's own note.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:.75rem; align-items:center">
        <baps-chip size="xs" label="Size xs" [count]="8" />
        <baps-chip size="s" label="Size s" [count]="8" />
        <baps-chip size="m" label="Size m" [count]="8" />
        <baps-chip size="l" label="Size l" [count]="8" />
      </div>
    `,
  }),
};

/** Default, hover (hover one to see it), and disabled. */
export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:.5rem; align-items:center">
        <baps-chip severity="primary" label="Default" [count]="8" />
        <baps-chip severity="primary" label="Removable" [count]="8" [removable]="true" />
        <baps-chip severity="primary" label="Disabled" [count]="8" [disabled]="true" />
      </div>
    `,
  }),
};

/** A chip that opens a menu: trailing chevron, with and without a label. */
export const WithChevron: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:.75rem; align-items:center">
        <baps-chip size="xs" label="Department" [count]="8" [chevron]="true" />
        <baps-chip size="s" label="Department" [count]="8" [chevron]="true" />
        <baps-chip size="m" label="Department" [count]="8" [chevron]="true" />
        <baps-chip size="l" label="Department" [count]="8" [chevron]="true" />

        <baps-chip size="xs" icon="pi pi-clock" [count]="8" [chevron]="true" />
        <baps-chip size="s" icon="pi pi-clock" [count]="8" [chevron]="true" />
        <baps-chip size="m" icon="pi pi-clock" [count]="8" [chevron]="true" />
        <baps-chip size="l" icon="pi pi-clock" [count]="8" [chevron]="true" />
      </div>
    `,
  }),
};

/** Icon only — no label, no count. The chip is square at every size. */
export const IconOnly: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:.75rem; align-items:center">
        <baps-chip size="xs" icon="pi pi-clock" />
        <baps-chip size="s" icon="pi pi-clock" />
        <baps-chip size="m" icon="pi pi-clock" />
        <baps-chip size="l" icon="pi pi-clock" />
      </div>
    `,
  }),
};

/** A count without a label — the compact form the frame calls Text=False. */
export const WithCount: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-wrap:wrap; gap:.5rem; align-items:center">
        <baps-chip icon="pi pi-clock" [count]="8" />
        <baps-chip severity="primary" icon="pi pi-clock" [count]="8" />
        <baps-chip severity="secondary" icon="pi pi-clock" [count]="8" />
        <baps-chip severity="info" icon="pi pi-clock" [count]="8" />
        <baps-chip severity="warning" icon="pi pi-clock" [count]="8" />
        <baps-chip severity="error" icon="pi pi-clock" [count]="8" />
        <baps-chip severity="success" icon="pi pi-clock" [count]="8" />
      </div>
    `,
  }),
};

const SEVERITIES = ['grey', 'primary', 'secondary', 'info', 'warning', 'error', 'success'] as const;
const SIZES = ['xs', 's', 'm', 'l'] as const;

/**
 * The frame itself: every severity down, every size across.
 *
 * This one KEEPS its loops, unlike every story above. It exists to be held
 * next to the Figma frame and compared, not to be copied — 124 chips written
 * longhand would be unreadable in the file and useless in Show code. Reach for
 * the focused stories above when you want markup to paste.
 *
 * No removable chips: Trailing Action is its own axis in Figma, not part of the
 * default view, and a hover plate over 100+ chips buries the ramp this story
 * exists to show. Removable has its own story.
 */
export const Matrix: Story = {
  render: () => ({
    props: { severities: SEVERITIES, sizes: SIZES },
    template: `
      <div style="display:flex; flex-direction:column; gap:1.25rem">
        @for (s of severities; track s) {
          <div>
            <div style="font:500 11px/1.3 var(--font-family-mono, monospace); letter-spacing:.06em;
                        text-transform:uppercase; color:#6f777d; margin-bottom:.5rem">{{ s }}</div>
            <div style="display:flex; flex-wrap:wrap; gap:.75rem; align-items:center">
              @for (z of sizes; track z) {
                <baps-chip [severity]="s" [size]="z" label="Badge Text" [count]="8" />
                <baps-chip [severity]="s" [size]="z" label="Badge Text" [count]="8" [chevron]="true" />
                <baps-chip [severity]="s" [size]="z" icon="pi pi-clock" [count]="8" [chevron]="true" />
                <baps-chip [severity]="s" [size]="z" icon="pi pi-clock" />
              }
            </div>
          </div>
        }
        <div>
          <div style="font:500 11px/1.3 var(--font-family-mono, monospace); letter-spacing:.06em;
                      text-transform:uppercase; color:#6f777d; margin-bottom:.5rem">disabled</div>
          <div style="display:flex; flex-wrap:wrap; gap:.75rem; align-items:center">
            @for (z of sizes; track z) {
              <baps-chip [size]="z" label="Badge Text" [count]="8" [disabled]="true" />
              <baps-chip [size]="z" icon="pi pi-clock" [count]="8" [chevron]="true" [disabled]="true" />
              <baps-chip [size]="z" icon="pi pi-clock" [disabled]="true" />
            }
          </div>
        </div>
      </div>
    `,
  }),
};
