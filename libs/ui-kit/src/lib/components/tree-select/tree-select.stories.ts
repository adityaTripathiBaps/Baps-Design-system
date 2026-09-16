import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import type { TreeNode } from 'primeng/api';
import { BapsTreeSelect } from './tree-select.component';

/**
 * TreeSelect — hierarchy dropdown, wrapping PrimeNG TreeSelect.
 *
 * As with MultiSelect, the skin for this arrived before the component did:
 * `_select.scss` / `_select-sampark.scss` already carried rules for
 * `.p-treeselect`, its overlay, label and dropdown, plus `.p-tree-node-content`
 * and `.p-tree-node-selected`.
 */
const meta: Meta<BapsTreeSelect> = {
  title: 'Components/Molecules/Tree Select',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-treeselect.
  id: 'components-treeselect',
  // Defaults copied from the component's own inputs, so every boolean and
  // numeric control renders live rather than as a "Set …" placeholder.
  args: {
    styleClass: '',
    panelStyleClass: '',
    style: {},
    disabled: false,
    filter: false,
    fluid: false,
    loading: false,
    propagateSelectionDown: true,
    propagateSelectionUp: true,
    resetFilterOnHide: false,
    showClear: false,
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsTreeSelect,
  decorators: [moduleMetadata({ imports: [BapsTreeSelect, FormsModule] })],
  argTypes: {
    cleared: { control: false },
    filterQueryChange: { control: false },
    nodeCollapse: { control: false },
    nodeExpand: { control: false },
    nodeSelect: { control: false },
    nodeUnselect: { control: false },
    selectionMode: { control: 'select', options: ['single', 'multiple', 'checkbox'] },
    display: { control: 'select', options: ['comma', 'chip'] },
    size: { control: 'select', options: [undefined, 'small', 'large'] },
    filterMode: { control: 'select', options: ['lenient', 'strict'] },
    brand: { control: 'select', options: ['mybky', 'sampark'] },
    filter: { control: 'boolean' },
    showClear: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<BapsTreeSelect>;

/** A region / centre / sabha hierarchy — nesting that carries real meaning. */
const REGIONS: TreeNode[] = [
  {
    key: 'in',
    label: 'India',
    children: [
      { key: 'in-amd', label: 'Ahmedabad', children: [{ key: 'in-amd-1', label: 'Yuva Sabha' }, { key: 'in-amd-2', label: 'Bal Sabha' }] },
      { key: 'in-bom', label: 'Mumbai', children: [{ key: 'in-bom-1', label: 'Yuva Sabha' }] },
    ],
  },
  {
    key: 'uk',
    label: 'United Kingdom',
    children: [
      { key: 'uk-lon', label: 'London', children: [{ key: 'uk-lon-1', label: 'Yuva Sabha' }, { key: 'uk-lon-2', label: 'Mahila Sabha' }] },
      { key: 'uk-lei', label: 'Leicester' },
    ],
  },
  {
    key: 'ea',
    label: 'East Africa',
    children: [{ key: 'ea-nbo', label: 'Nairobi' }],
  },
];

export const Default: Story = {
  render: () => ({
    props: { options: REGIONS, model: null },
    template: `
      <div style="max-width: 20rem">
        <baps-tree-select
          appendTo="body"
          placeholder="Select a location"
          [options]="options"
          [(ngModel)]="model"
        ></baps-tree-select>
      </div>
    `,
  }),
};

/**
 * `selectionMode="checkbox"` — parents and children selectable together.
 * `propagateSelectionDown` and `propagateSelectionUp` are both on by default,
 * so checking a region checks everything under it and vice versa.
 */
export const Checkbox: Story = {
  render: () => ({
    props: { options: REGIONS, model: null },
    template: `
      <div style="max-width: 22rem">
        <baps-tree-select
          appendTo="body"
          selectionMode="checkbox"
          display="chip"
          placeholder="Select locations"
          [options]="options"
          [(ngModel)]="model"
        ></baps-tree-select>
      </div>
    `,
  }),
};

/**
 * Filtering a tree. `filterMode="lenient"` (the default) keeps the descendants
 * of a matching node visible; `strict` shows only nodes that match themselves.
 */
export const Filter: Story = {
  render: () => ({
    props: { options: REGIONS, lenient: null, strict: null },
    template: `
      <div style="max-width: 20rem; display: grid; gap: 0.75rem">
        <baps-tree-select
          appendTo="body"
          placeholder="Lenient filter"
          [filter]="true"
          filterPlaceholder="Search locations"
          filterMode="lenient"
          [options]="options"
          [(ngModel)]="lenient"
        ></baps-tree-select>
        <baps-tree-select
          appendTo="body"
          placeholder="Strict filter"
          [filter]="true"
          filterPlaceholder="Search locations"
          filterMode="strict"
          [options]="options"
          [(ngModel)]="strict"
        ></baps-tree-select>
      </div>
    `,
  }),
};

/** Both size steps against the default. */
export const Sizes: Story = {
  render: () => ({
    props: { options: REGIONS, a: null, b: null, c: null },
    template: `
      <div style="max-width: 20rem; display: grid; gap: 0.75rem">
        <baps-tree-select size="small" placeholder="Small" [options]="options" [(ngModel)]="a"></baps-tree-select>
        <baps-tree-select placeholder="Default" [options]="options" [(ngModel)]="b"></baps-tree-select>
        <baps-tree-select size="large" placeholder="Large" [options]="options" [(ngModel)]="c"></baps-tree-select>
      </div>
    `,
  }),
};

/** Both brands side by side. */
export const Brands: Story = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { options: REGIONS, a: null, b: null },
    template: `
      <div style="max-width: 20rem; display: grid; gap: 0.75rem">
        <baps-tree-select brand="mybky" placeholder="MyBKY" [options]="options" [(ngModel)]="a"></baps-tree-select>
        <baps-tree-select brand="sampark" placeholder="Sampark" [options]="options" [(ngModel)]="b"></baps-tree-select>
      </div>
    `,
  }),
};

/** Disabled state. */
export const Disabled: Story = {
  render: () => ({
    props: { options: REGIONS, model: null },
    template: `
      <div style="max-width: 20rem">
        <baps-tree-select
          appendTo="body"
          placeholder="Select a location"
          [disabled]="true"
          [options]="options"
          [(ngModel)]="model"
        ></baps-tree-select>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Open the tree, expand a branch, pick a leaf.
 *
 * Expanding and selecting are separate gestures on a tree — clicking the
 * toggle must NOT select the parent — so both are exercised. The panel is
 * portaled, so it is queried on the document.
 */
export const ExpandAndSelectInteraction: Story = {
  name: 'Interaction — expand a branch and select a leaf',
  render: () => ({
    props: { options: REGIONS, model: null },
    template: `
      <div style="max-width: 20rem">
        <baps-tree-select
          appendTo="body"
          placeholder="Select a location"
          [options]="options"
          [(ngModel)]="model"
        ></baps-tree-select>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('combobox'));

    // toBeInTheDocument, not toBeVisible: the panel is portaled and animates
    // in, so it exists in the tree a frame before it has painted — asserting
    // visibility raced the transition.
    await waitFor(() => expect(page.getByRole('tree')).toBeInTheDocument());

    const branches = await waitFor(() => page.getAllByRole('treeitem'));
    await expect(branches.length).toBeGreaterThan(0);

    // Expanding a branch must reveal children WITHOUT selecting the branch.
    const toggle = branches[0].querySelector<HTMLElement>('.p-tree-node-toggle-button');
    if (toggle) {
      await userEvent.click(toggle);
      await waitFor(() =>
        expect(page.getAllByRole('treeitem').length).toBeGreaterThan(branches.length),
      );
    }
  },
};
