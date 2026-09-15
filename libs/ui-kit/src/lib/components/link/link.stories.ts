import type { Meta, StoryObj } from '@storybook/angular';
import { BapsLink } from './link.component';

const meta: Meta<BapsLink> = {
  title: 'Components/Utility/Link',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-misc-link.
  id: 'components-link',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    disabled: false,
  },
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    variant: { control: 'inline-radio', options: [undefined, 'primary', 'secondary'] },
    size: { control: 'inline-radio', options: [undefined, 'small', 'large', 'xlarge'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
    disabled: { control: 'boolean' },
    href: { control: 'text' },
    target: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:91800.
    // Harvested from link.component.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-91800' },
  },
  component: BapsLink,
  render: (args) => ({
    props: args,
    template: `
      <baps-link [href]="href" [target]="target" [brand]="brand">
        Click here to view more details
      </baps-link>
    `,
  }),
};

export default meta;

export const Default: StoryObj<BapsLink> = {
  args: {
    href: 'https://example.com',
    target: '_blank'
  },
};

/**
 * Primary rides the brand ramp (maroon for Sampark, blue for MyBKY);
 * Secondary is the shared mono ramp — #595656 at rest, #151414 + underline
 * on hover. Hover each to see the underline appear.
 */
export const Variants: StoryObj<BapsLink> = {
  args: { href: 'https://example.com' },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; gap:32px;">
        <baps-link [href]="href" [brand]="brand" variant="primary">Primary link</baps-link>
        <baps-link [href]="href" [brand]="brand" variant="secondary">Secondary link</baps-link>
      </div>
    `,
  }),
};

/**
 * Disabled, in both variants and both brands.
 *
 * There was no story for this state, which is why a real bug lived here
 * undetected: every variant colour rule out-specified the disabled rule, so a
 * disabled link kept rendering in the brand colour instead of the muted grey.
 * The variant rules now exclude the disabled state — see the component's own
 * comment on that rule for the specificity numbers.
 */
export const Disabled: StoryObj<BapsLink> = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  // This story used to carry `brand: 'sampark'` here too. It was dropped by the
  // brand-migration pass that unpinned the other link stories — not deliberately,
  // since a comparison story keeps its pins. It is left dropped because the arg
  // was dead: the template below hardcodes `brand` on every link and never binds
  // the arg, so removing it changed nothing. Verified both ways — computed style
  // is identical under either toolbar brand, and this story did not move in the
  // baseline run that moved the other three.
  args: { href: 'https://example.com' },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start;">
        <div style="display:flex; gap:32px;">
          <baps-link [href]="href" brand="sampark" variant="primary" [disabled]="true">Sampark primary</baps-link>
          <baps-link [href]="href" brand="sampark" variant="secondary" [disabled]="true">Sampark secondary</baps-link>
        </div>
        <div style="display:flex; gap:32px;">
          <baps-link [href]="href" brand="mybky" variant="primary" [disabled]="true">MyBKY primary</baps-link>
          <baps-link [href]="href" brand="mybky" variant="secondary" [disabled]="true">MyBKY secondary</baps-link>
        </div>
      </div>
    `,
  }),
};

/**
 * S / L / XL are named after the rendered box height (16 / 18 / 20px); the
 * type inside is 12 / 14 / 16px at 1.3 line-height. With no `size` the anchor
 * inherits its font-size from the surrounding text, as it always has — the
 * fourth row below.
 */
export const Sizes: StoryObj<BapsLink> = {
  args: { href: 'https://example.com' },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; align-items:flex-start; font-size:20px;">
        <baps-link [href]="href" [brand]="brand" size="small">Small — 12px</baps-link>
        <baps-link [href]="href" [brand]="brand" size="large">Large — 14px</baps-link>
        <baps-link [href]="href" [brand]="brand" size="xlarge">XLarge — 16px</baps-link>
        <baps-link [href]="href" [brand]="brand">Unsized — inherits 20px</baps-link>
      </div>
    `,
  }),
};
