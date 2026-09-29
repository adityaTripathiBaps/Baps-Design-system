import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { expect, userEvent, within } from '@storybook/test';
import { BapsToggleSwitch } from './toggle-switch.component';

/**
 * ToggleSwitch — an instant on/off control (no Save step). ToggleSwitch uses
 * the `BapsToggleSwitch` wrapper component.
 */
const meta: Meta<BapsToggleSwitch> = {
  title: 'Components/Atoms/Toggle Switch',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-toggleswitch.
  id: 'components-toggleswitch',
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:89115.
    // Harvested from toggle-switch.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-89115' },
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsToggleSwitch,
  decorators: [moduleMetadata({ imports: [BapsToggleSwitch, FormsModule] })],
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
  },
  args: {
    label: 'Placeholder Text',
    disabled: false,
    readonly: false,
    size: 'md',
  },
  render: (args) => ({
    props: { ...args, checked: true },
    template: `<baps-toggleswitch
      [(ngModel)]="checked"
      [disabled]="disabled"
      [readonly]="readonly"
      [size]="size"
      [brand]="brand"
      [label]="label"
    />`,
  }),
};

export default meta;
type Story = StoryObj<BapsToggleSwitch>;

export const Playground: Story = {};

/**
 * The four resting states (events-ui --switch-*): off-track #8D9BA5, on-track
 * full-strength blue.600 — the thumb stays white in every state, so on/off is
 * carried by the track alone. Disabled tracks go pale (mono.300 / blue.200)
 * at full opacity.
 */
export const States: Story = {
  render: () => ({
    props: { off: false, on: true, offDisabled: false, onDisabled: true },
    template: `
      <div style="display:flex; gap: 24px; align-items: center;">
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          Off<baps-toggleswitch [(ngModel)]="off" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          On<baps-toggleswitch [(ngModel)]="on" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          Off · disabled<baps-toggleswitch [(ngModel)]="offDisabled" [disabled]="true" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          On · disabled<baps-toggleswitch [(ngModel)]="onDisabled" [disabled]="true" />
        </label>
      </div>
    `,
  }),
};

/**
 * MyBKY sizes (events-ui --switch-*): sm 28×16 / md 36×20 (default) / lg 40×24
 * with 13/17/21px thumbs at a 1.5px inset. The pill radius is constant.
 */
export const Sizes: Story = {
  render: () => ({
    props: { a: true, b: true, c: true },
    template: `
      <div style="display:flex; gap: 24px; align-items: center;">
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          sm<baps-toggleswitch size="sm" [(ngModel)]="a" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          md<baps-toggleswitch [(ngModel)]="b" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          lg<baps-toggleswitch size="lg" [(ngModel)]="c" />
        </label>
      </div>
    `,
  }),
};

/**
 * Sampark (spm-ui _switch.scss): SQUARE 3–4px track, inset shadow, maroon
 * on-track (Primary/60), Primary/20 when checked+disabled. Applied
 * per-instance via `brand="sampark"` or page-wide via the toolbar.
 */
export const SamparkStates: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    props: { off: false, on: true, offDisabled: false, onDisabled: true },
    template: `
      <div style="display:flex; gap: 24px; align-items: center;">
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          Off<baps-toggleswitch brand="sampark" [(ngModel)]="off" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          On<baps-toggleswitch brand="sampark" [(ngModel)]="on" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          Off · disabled<baps-toggleswitch brand="sampark" [(ngModel)]="offDisabled" [disabled]="true" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          On · disabled<baps-toggleswitch brand="sampark" [(ngModel)]="onDisabled" [disabled]="true" />
        </label>
      </div>
    `,
  }),
};

/**
 * Sampark sizes (spm-ui switchsize): xs 28×16 / sm 32×20 / md 36×22 (default)
 * / lg 40×24. The thumb keeps a 2px inset and 2px radius at every size.
 */
export const SamparkSizes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    props: { a: true, b: true, c: true, d: true },
    template: `
      <div style="display:flex; gap: 24px; align-items: center;">
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          xs<baps-toggleswitch brand="sampark" size="xs" [(ngModel)]="a" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          sm<baps-toggleswitch brand="sampark" size="sm" [(ngModel)]="b" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          md<baps-toggleswitch brand="sampark" [(ngModel)]="c" />
        </label>
        <label style="display:flex; flex-direction:column; gap:8px; align-items:center; font: 12px/1 sans-serif;">
          lg<baps-toggleswitch brand="sampark" size="lg" [(ngModel)]="d" />
        </label>
      </div>
    `,
  }),
};

/**
 * The `label` input — every variant in Figma node 13197:89115 "Switch" is
 * `track + "Placeholder Text"`, so this, not the bare track, is the normal
 * shape. The component renders a real `<label [for]>` against its own
 * `inputId`, so the text is clickable and the switch has an accessible name;
 * the disabled row greys to the same Mono/40 `baps-checkbox` uses.
 */
export const WithLabel: Story = {
  render: () => ({
    props: { notifications: true, sms: false, locked: true },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
        <baps-toggleswitch [(ngModel)]="notifications" label="Email notifications" />
        <baps-toggleswitch [(ngModel)]="sms" label="SMS notifications" />
        <baps-toggleswitch [(ngModel)]="locked" label="Managed by your admin" [disabled]="true" />
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/** Toggling flips the control and its aria-checked, which is what AT reads. */
export const ToggleInteraction: Story = {
  name: 'Interaction — toggle',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');

    // The story's model starts true.
    await expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};

/**
 * `readonly` looks identical to enabled and must not CHANGE THE MODEL.
 *
 * The distinction matters and cost a wrong test to learn: a readonly switch
 * still contains a native checkbox, and a click toggles that input's own
 * `checked` property the way any checkbox does. PrimeNG guards the MODEL —
 * onClick returns early on `readonly` — so `aria-checked` and the wrapper's
 * data-p-checked stay put and the switch keeps drawing its real state. Only the
 * visually hidden input drifts, which nothing reads.
 *
 * So assert the model-facing state. Asserting `.checked` fails on a component
 * that is behaving correctly.
 */
export const ReadonlyAndDisabledInteraction: Story = {
  name: 'Interaction — readonly and disabled do not change the model',
  render: () => ({
    props: { a: true, b: true },
    template: `
      <div style="display:flex; gap:24px; align-items:center;">
        <baps-toggleswitch label="Readonly" [readonly]="true" [(ngModel)]="a"></baps-toggleswitch>
        <baps-toggleswitch label="Disabled" [disabled]="true" [(ngModel)]="b"></baps-toggleswitch>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [readonly, disabled] = canvas.getAllByRole('switch');

    await expect(readonly).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(readonly);
    await expect(readonly).toHaveAttribute('aria-checked', 'true');

    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveAttribute('aria-checked', 'true');
  },
};

/** Keyboard: Tab focuses, Space toggles. */
export const KeyboardInteraction: Story = {
  name: 'Interaction — keyboard',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');

    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{ }');
    await expect(toggle).not.toBeChecked();
  },
};
