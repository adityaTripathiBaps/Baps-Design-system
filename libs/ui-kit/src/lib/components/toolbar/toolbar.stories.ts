import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsToolbar } from './toolbar.component';
import { BapsButton } from '../button/button.component';
import { BapsInputText } from '../form-field/directives/input-text.directive';
import { BapsOverlayBadge } from '../badge/overlay-badge.component';

const meta: Meta<BapsToolbar> = {
  title: 'Components/Organisms/Toolbar',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-panel-toolbar.
  id: 'components-toolbar',
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    title: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:72483.
    // Harvested from toolbar.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-72483' },
  },
  component: BapsToolbar,
  // Sampark-only component (see toolbar.component.ts) — no 'ds:mybky' tag,
  // same convention as file-upload/split-button.
  tags: ['ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [BapsToolbar, BapsButton, BapsInputText, BapsOverlayBadge],
    }),
  ],
  args: {
    title: 'Robbinsville',
  },
};

export default meta;
type Story = StoryObj<BapsToolbar>;

/**
 * Region switcher + title left, search + primary action + filter/sort right —
 * the dev.bapsapps.dev/spm projects-list toolbar (`.page-toolbar` /
 * `.page-toolbar-section` / `.left` / `.right`), one row, two zones
 * (node 17512:72483). Region switcher and filter both carry an overlay
 * badge — reuses the same `baps-overlaybadge` pattern as the navbar's
 * notification bell, not a toolbar-specific badge.
 */
export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <baps-toolbar [title]="title">
        <baps-overlaybadge toolbar-left value="3" severity="danger">
          <baps-button ariaLabel="Region" [text]="true" severity="secondary">
            <i class="pi pi-globe"></i><i class="pi pi-chevron-down" style="font-size: 0.65rem;"></i>
          </baps-button>
        </baps-overlaybadge>

        <input toolbar-right bapsInputText class="search-input" placeholder="Search" aria-label="Search" />
        <baps-button toolbar-right label="Create Project" icon="pi pi-plus" />
        <baps-overlaybadge toolbar-right value="3" severity="danger">
          <baps-button icon="pi pi-filter" ariaLabel="Filter" [text]="true" severity="secondary" />
        </baps-overlaybadge>
        <baps-button toolbar-right icon="pi pi-sort-alt" ariaLabel="Sort" [text]="true" severity="secondary" />
      </baps-toolbar>
    `,
  }),
};

/** No title, no left cluster — just a search + save bar. `.left` collapses to nothing. */
export const SearchOnly: Story = {
  args: { title: undefined },
  render: (args) => ({
    props: args,
    template: `
      <baps-toolbar [title]="title">
        <input toolbar-right bapsInputText class="search-input" placeholder="Search karyakars" aria-label="Search karyakars" />
        <baps-button toolbar-right label="Save" />
      </baps-toolbar>
    `,
  }),
};
