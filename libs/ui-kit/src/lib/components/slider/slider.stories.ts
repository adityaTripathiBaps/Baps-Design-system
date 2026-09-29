import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsSlider } from './slider.component';

/**
 * Slider — Sampark Portal, Figma node 13197:89329.
 *
 * Value is bound with `ngModel`, not `[value]`. `BapsSlider` is a
 * ControlValueAccessor: `value` is its internal CVA field, not an `@Input`,
 * so `[value]="…"` throws NG0303 at runtime ("Can't bind to 'value' since it
 * isn't a known property of 'baps-slider'"). The story used to do that and
 * the handle simply sat at 0 — the binding never applied.
 */
const meta: Meta<BapsSlider> = {
  title: 'Components/Atoms/Slider',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-slider.
  id: 'components-slider',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    styleClass: '',
    style: {},
    disabled: false,
    max: 100,
    min: 0,
    range: false,
    showValueTooltip: false,
    step: 1,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    orientation: { control: 'inline-radio', options: [undefined, 'horizontal', 'vertical'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    range: { control: 'boolean' },
    disabled: { control: 'boolean' },
    showValueTooltip: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    styleClass: { control: 'text' },
    ariaLabel: { control: 'text' },
    ariaLabelledBy: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:89329.
    // Harvested from slider.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-89329' },
  },
  component: BapsSlider,
  decorators: [moduleMetadata({ imports: [FormsModule] })],
  render: (args) => ({
    props: { ...args, model: 40 },
    template: `
      <div style="max-width: 20rem">
        <baps-slider
          ariaLabel="Value"
          [min]="min"
          [max]="max"
          [step]="step"
          [disabled]="disabled"
          [range]="range"
          [showValueTooltip]="showValueTooltip"
          [orientation]="orientation"
          [brand]="brand"
          [(ngModel)]="model">
        </baps-slider>
      </div>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsSlider> = {
  args: {
    min: 0,
    max: 100,
  },
};

/**
 * Two-handle range. Every variant in the Figma frame is a range slider, so
 * this is closer to the design's intent than the single-handle default.
 *
 * The Figma bubbles are opt-in — see ValueTooltip below.
 */
export const Range: StoryObj<BapsSlider> = {
  render: () => ({
    props: { model: [20, 70] },
    template: `
      <div style="max-width: 20rem">
        <baps-slider
          ariaLabel="Value" [range]="true" [min]="0" [max]="100" [(ngModel)]="model"></baps-slider>
      </div>
    `,
  }),
};

/**
 * `showValueTooltip` — the persistent bubble every Figma variant carries over
 * its handles (node 13197:89384: white plate, 4px radius, 12px Mono/80 text,
 * 24x8 beak). Off by default; works for one handle and for a range. The top
 * padding is the story's, not the component's — the bubble is absolutely
 * positioned and would otherwise be clipped by Storybook's canvas.
 */
export const ValueTooltip: StoryObj<BapsSlider> = {
  render: () => ({
    props: { single: 40, pair: [20, 70] },
    template: `
      <div style="max-width: 20rem; display: grid; gap: 3rem; padding-top: 3rem">
        <baps-slider
          ariaLabel="Value" [showValueTooltip]="true" [(ngModel)]="single"></baps-slider>
        <baps-slider
          ariaLabel="Value" [range]="true" [showValueTooltip]="true" [(ngModel)]="pair"></baps-slider>
      </div>
    `,
  }),
};

/** Disabled state. */
export const Disabled: StoryObj<BapsSlider> = {
  render: () => ({
    props: { model: 40 },
    template: `
      <div style="max-width: 20rem">
        <baps-slider
          ariaLabel="Value" [disabled]="true" [(ngModel)]="model"></baps-slider>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Keyboard is the slider's testable surface.
 *
 * Dragging is a pointer gesture whose result depends on the track's pixel
 * width, so asserting on it would be asserting on layout. Arrow keys move the
 * value by exactly one step, which is deterministic — and is also the path a
 * keyboard user actually has, so it is the one that must not regress.
 */
export const KeyboardInteraction: StoryObj<BapsSlider> = {
  name: 'Interaction — keyboard',
  args: { min: 0, max: 100 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('slider');

    handle.focus();
    await expect(handle).toHaveFocus();

    const start = Number(handle.getAttribute('aria-valuenow'));
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(start),
    );

    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(Number(handle.getAttribute('aria-valuenow'))).toBe(start));
  },
};

/** A disabled slider does not move, and keeps its value visible. */
export const DisabledInteraction: StoryObj<BapsSlider> = {
  name: 'Interaction — disabled is inert',
  render: () => ({
    props: { model: 40 },
    template: `<div style="width:320px">
      <baps-slider
          ariaLabel="Value" [disabled]="true" [(ngModel)]="model"></baps-slider>
    </div>`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('slider');
    const before = handle.getAttribute('aria-valuenow');

    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', before as string);
  },
};
