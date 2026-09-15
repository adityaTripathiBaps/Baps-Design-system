import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from '@storybook/test';
import { BapsButton } from './button.component';

/**
 * Pilot component for the BAPS authoring pattern — copy this file's shape
 * (Meta argTypes, Playground, AllVariants, AllSizes) for every subsequent
 * component. Button uses the `BapsButton` wrapper component.
 */
const meta: Meta<BapsButton> = {
  title: 'Components/Button/Button',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-button-button.
  id: 'components-button',
  parameters: {
    // Design tab — the Figma frame this component implements.
    // Harvested from button.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/🟢-Sampark-Portal?node-id=13197-91897' },
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsButton,
  argTypes: {
    label: { control: 'text' },
    severity: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'info', 'warn', 'help', 'danger', 'contrast', undefined],
    },
    size: { control: 'select', options: [undefined, 'small', 'large', 'xlarge'] },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    outlined: { control: 'boolean' },
    text: { control: 'boolean' },
    rounded: { control: 'boolean' },
    raised: { control: 'boolean' },
    link: { control: 'boolean' },
    icon: { control: 'text' },
  },
  args: {
    autofocus: false,
    fluid: false,
    plain: false,
    label: 'Button',
    severity: 'primary',
    disabled: false,
    loading: false,
    outlined: false,
    text: false,
    rounded: false,
    raised: false,
    link: false,
  },
  render: (args) => ({
    props: args,
    template: `<baps-button
      [brand]="brand"
      [label]="label"
      [severity]="severity"
      [size]="size"
      [disabled]="disabled"
      [loading]="loading"
      [outlined]="outlined"
      [text]="text"
      [rounded]="rounded"
      [raised]="raised"
      [link]="link"
      [icon]="icon"
    />`,
  }),
};

export default meta;
type Story = StoryObj<BapsButton>;

/**
 * For interaction stories that add `fn()` spies to args. The default
 * StoryObj<BapsButton> types args as the component's inputs only, so a spy key
 * fails to compile — and putting the spy in render() props instead hides it
 * from `play`, which is the trap the disabled story hit first.
 */
type SpyStory = StoryObj<BapsButton & Record<'onClick' | 'onDisabled' | 'onLoading' | 'onActivate', () => void>>;

export const Playground: Story = {};

/**
 * The 6 variants defined in Figma node 22465:93605 (MyBKY Component
 * Library, Button component set): Primary, Secondary, Danger, Warning,
 * Primary Ghost, Secondary Ghost. PrimeNG has no "warning" severity name —
 * it maps to `severity="warn"`. Ghost maps to PrimeNG's `[text]="true"`.
 */
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <baps-button label="Primary" severity="primary" />
        <baps-button label="Secondary" severity="secondary" />
        <baps-button label="Danger" severity="danger" />
        <baps-button label="Warning" severity="warn" />
        <baps-button label="Primary Ghost" severity="primary" [text]="true" />
        <baps-button label="Secondary Ghost" severity="secondary" [text]="true" />
      </div>
    `,
  }),
};

/**
 * Figma defines 4 sizes: S (32px/14px font), M (36px/14px font, default),
 * L (36px/16px font — mobile variant), XL (42px/16px font — mobile variant).
 * PrimeNG's Button `size` input only exposes 3 steps (small/undefined/large)
 * — there is no built-in XL, so `size="xlarge"` is a wrapper host class that
 * sets the explicit 42px height from `--button-mybky-height-xl`
 * (button.component.ts), the same mechanism the Sampark skin uses.
 */
export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-button label="S (32px)" size="small" />
        <baps-button label="M (36px, default)" />
        <baps-button label="L (36px, larger font)" size="large" />
        <baps-button label="XL (42px)" size="xlarge" />
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-button label="Default" />
        <baps-button label="Disabled" [disabled]="true" />
        <baps-button label="Loading" [loading]="true" />
      </div>
    `,
  }),
};

/**
 * Sampark Portal button set — Figma node 13197:91897
 * (https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/🟢-Sampark-Portal?node-id=13197-91897).
 * Flat visual language: 4px radius, flat #c96868 primary fill (no gradient),
 * outlined secondary, maroon ghost/text, and a link variant that MyBKY
 * doesn't have. Applied per-instance via `brand="sampark"` scoped tokens —
 * the global preset stays MyBKY.
 */
export const SamparkVariants: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <baps-button brand="sampark" label="Primary" severity="primary" />
        <baps-button brand="sampark" label="Secondary" severity="secondary" [outlined]="true" />
        <baps-button brand="sampark" label="Primary Ghost" severity="primary" [text]="true" />
        <baps-button brand="sampark" label="Link" [link]="true" />
      </div>
    `,
  }),
};

/**
 * Sampark sizes are explicit heights — sm 28 · default 32 · lg 36 · xl 40 —
 * unlike MyBKY where height falls out of paddingY. XL has no PrimeNG `size`
 * step; the wrapper maps size="xlarge" to a host class.
 */
export const SamparkSizes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-button brand="sampark" label="SM (28px)" size="small" />
        <baps-button brand="sampark" label="Default (32px)" />
        <baps-button brand="sampark" label="LG (36px)" size="large" />
        <baps-button brand="sampark" label="XL (40px)" size="xlarge" />
      </div>
    `,
  }),
};

/**
 * spm-ui defines a dedicated icon-only variant with its own square size
 * scale — 28/32/36/40 (button.mapping.mdx). sm/default/lg widths flow
 * through PrimeNG's iconOnlyWidth tokens; xl is a wrapper host-class rule.
 * `ariaLabel` is required on icon-only buttons.
 */
export const SamparkIconOnly: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" size="small" />
        <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" />
        <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" size="large" />
        <baps-button brand="sampark" icon="pi pi-check" ariaLabel="Confirm" size="xlarge" />
        <baps-button brand="sampark" icon="pi pi-pencil" ariaLabel="Edit" severity="secondary" [outlined]="true" />
        <baps-button brand="sampark" icon="pi pi-trash" ariaLabel="Delete" severity="primary" [text]="true" />
      </div>
    `,
  }),
};

/**
 * Sampark's disabled state is a distinct fill (bg #f3eaea, border #e1e0e0,
 * text #bcb9b9), not PrimeNG's generic opacity dim — see button.mapping.mdx.
 */
export const SamparkStates: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: `
      <div style="display:flex; gap: 12px; align-items: center;">
        <baps-button brand="sampark" label="Default" />
        <baps-button brand="sampark" label="Disabled" [disabled]="true" />
        <baps-button brand="sampark" label="Loading" [loading]="true" />
      </div>
    `,
  }),
};

/* ── Interactions ─────────────────────────────────────────────────────────
   Stories with a `play` function run in the Interactions panel: each step is
   replayed with pause/step/rerun, and a failed assertion names itself there
   rather than in the browser console.

   These assert BEHAVIOUR, not appearance. A visual regression is the VR
   suite's job; what a play function is uniquely good at is the thing a
   screenshot cannot see — that a click reached a handler, that a disabled
   control is genuinely inert, that focus lands where the keyboard put it. */

/** A click reaches the host's own output, and the label is the accessible name. */
export const ClickInteraction: SpyStory = {
  name: 'Interaction — click',
  args: { label: 'Save', severity: 'primary', onClick: fn() },
  render: (args) => ({
    props: args,
    template: `<baps-button
      [label]="label"
      [severity]="severity"
      [brand]="brand"
      (click)="onClick($event)"
    />`,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // getByRole, not a class selector: the wrapper must expose a real button to
    // the accessibility tree, and querying by role is what proves it.
    const button = canvas.getByRole('button', { name: 'Save' });

    await userEvent.click(button);
    await expect(button).toBeEnabled();
  },
};

/**
 * A disabled button does not fire, and a LOADING one does not either.
 *
 * The second half is the one worth a test: `loading` renders a spinner and
 * PrimeNG also sets `disabled` from it, so the button looks busy AND is inert.
 * Nothing about the rendered markup makes that obvious, and a regression that
 * left it clickable would submit a form twice.
 */
export const DisabledInteraction: SpyStory = {
  name: 'Interaction — disabled and loading are inert',
  // The spies live in ARGS, not only in render props. `play` receives args, so
  // a spy created inside render() is invisible there — asserting on it read
  // "undefined is not a spy". Declaring them here also makes both calls show up
  // in the Actions panel, which is where a reader looks first.
  args: { onDisabled: fn(), onLoading: fn() },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:12px; align-items:center;">
        <baps-button label="Disabled" [disabled]="true" (click)="onDisabled($event)" />
        <baps-button label="Loading" [loading]="true" (click)="onLoading($event)" />
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('button', { name: 'Disabled' });
    const loading = canvas.getByRole('button', { name: /Loading/ });

    await expect(disabled).toBeDisabled();
    await expect(loading).toBeDisabled();

    // The blocking mechanism here is the NATIVE disabled attribute, and that is
    // all it needs to be: the browser does not dispatch a click to a disabled
    // <button>, so no handler can run. Measured: a disabled baps-button
    // computes pointer-events: auto and opacity 0.38 — the dimming is visual
    // only, and asserting pointer-events: none here failed on a component that
    // was behaving correctly. baps-checkbox is the opposite case and does need
    // pointer-events, because its real control is a hidden input.
    //
    // Not clicked on purpose. userEvent refuses a disabled control and throws,
    // which fails the step rather than asserting anything, and fireEvent would
    // force a path no user can take. The spies staying empty through render is
    // the actual claim.
    await expect(args.onDisabled).not.toHaveBeenCalled();
    await expect(args.onLoading).not.toHaveBeenCalled();
  },
};

/** Keyboard: Tab reaches the button, Enter activates it. */
export const KeyboardInteraction: SpyStory = {
  name: 'Interaction — keyboard',
  args: { onActivate: fn() },
  render: (args) => ({
    props: args,
    template: `<baps-button label="Submit" (click)="onActivate($event)" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Submit' });

    await userEvent.tab();
    await expect(button).toHaveFocus();

    // A native <button> turns Enter and Space into a click event. Asserting it
    // here is what catches a wrapper that ever swaps the element for a <div>.
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveFocus();
  },
};
