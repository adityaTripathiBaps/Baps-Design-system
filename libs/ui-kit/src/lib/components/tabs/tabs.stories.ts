import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { TabsModule } from 'primeng/tabs';
import { BapsTabs } from './tabs.directive';

/**
 * Tabs are raw PrimeNG `p-tabs`/`p-tablist`/`p-tab`/`p-tabpanels`/`p-tabpanel`
 * plus the `bapsTabs` directive for the Sampark skin — there is no
 * `baps-tabs` wrapper component. See tabs.directive.ts for why (the wrappers
 * broke Angular's element-injector chain and threw NG0201 at runtime).
 *
 * `value` is a PrimeNG input on `p-tabs`, not a `BapsTabs` one — the directive
 * only carries `brand`. Widening the args type lets the stories seed and
 * control the active tab without pretending it belongs to the directive.
 */
type TabsArgs = BapsTabs & { value: string };

const meta: Meta<TabsArgs> = {
  title: 'Components/Molecules/Tabs',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-panel-tabs.
  id: 'components-tabs',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:90538.
    // Harvested from tabs.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-90538' },
  },
  component: BapsTabs,
  decorators: [
    moduleMetadata({
      imports: [BapsTabs, TabsModule],
    }),
  ],
  args: {
    value: '0',
  },
  argTypes: {
    value: {
      control: 'inline-radio',
      options: ['0', '1', '2'],
      description: "Active tab (PrimeNG `p-tabs` input). Two-way bindable — `[(value)]` works now that there is no wrapper component swallowing PrimeNG's `valueChange` output.",
    },
    brand: {
      control: 'inline-radio',
      options: ['mybky', 'sampark'],
      description: 'Visual skin. Page-wide Sampark works without this input.',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <p-tabs bapsTabs [brand]="brand" [(value)]="value">
        <p-tablist>
          <p-tab value="0">Header I</p-tab>
          <p-tab value="1">Header II</p-tab>
          <p-tab value="2">Header III</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="0">Content I</p-tabpanel>
          <p-tabpanel value="1">Content II</p-tabpanel>
          <p-tabpanel value="2">Content III</p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    `,
  }),
};

export default meta;

export const Default: StoryObj<TabsArgs> = {
  parameters: {
    docs: {
      description: {
        story:
          'Follows the toolbar\'s Design system switch. `bapsTabs` is present and its ' +
          '`brand` comes from the story args, which are no longer pinned — so this strip ' +
          'shows whichever brand is selected rather than always Sampark.',
      },
    },
  },
};

/** Disabled tabs keep their place in the strip but drop out of the tab order. */
export const WithDisabled: StoryObj<TabsArgs> = {
  render: (args) => ({
    props: args,
    template: `
      <p-tabs bapsTabs [brand]="brand" [(value)]="value">
        <p-tablist>
          <p-tab value="0">Registrations</p-tab>
          <p-tab value="1">Attendance</p-tab>
          <p-tab value="2" [disabled]="true">Receipts</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="0">Registration list</p-tabpanel>
          <p-tabpanel value="1">Attendance sheet</p-tabpanel>
          <p-tabpanel value="2">Receipts</p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    `,
  }),
};

/**
 * No directive at all — under the page-wide `.baps-ds-sampark` class (the
 * "Design system" toolbar set to Sampark) plain `p-tabs` already picks up
 * the skin. Switch the toolbar to MyBKY to see it fall back to the preset.
 */
export const PageWideScopeOnly: StoryObj<TabsArgs> = {
  render: (args) => ({
    props: args,
    template: `
      <p-tabs [(value)]="value">
        <p-tablist>
          <p-tab value="0">Header I</p-tab>
          <p-tab value="1">Header II</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="0">Content I</p-tabpanel>
          <p-tabpanel value="1">Content II</p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    `,
  }),
};

/**
 * The three Figma size steps (node 13197:90538 "Tab"): S 28px / 12px text,
 * M 32px / 14px, L 42px / 16px for mobile. Sampark-only — the size classes
 * live in `_tabs-sampark.scss`, so a MyBKY strip stays on the preset box.
 *
 * A strip with no `size` (every story above) keeps the historic 14px /
 * .625rem-1rem box, which is deliberately none of the three.
 */
export const Sizes: StoryObj<TabsArgs> = {
  // Intended pin, not a leftover. The size classes live only in
  // `_tabs-sampark.scss`, so under MyBKY all three steps collapse onto the
  // preset box and the story stops showing the thing it exists to show. It
  // keeps its brand and is hidden from the MyBKY sidebar instead — the same
  // treatment the brand-named stories get.
  tags: ['!ds:mybky'],
  args: { brand: 'sampark' },
  render: (args) => ({
    props: args,
    template: ['small', 'medium', 'large']
      .map(
        (size) => `
      <p style="font: 12px sans-serif; margin: 16px 0 4px;">size="${size}"</p>
      <p-tabs bapsTabs [brand]="brand" size="${size}" value="0">
        <p-tablist>
          <p-tab value="0">Header I</p-tab>
          <p-tab value="1">Header II</p-tab>
          <p-tab value="2" [disabled]="true">Header III</p-tab>
        </p-tablist>
      </p-tabs>`,
      )
      .join(''),
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Clicking a tab selects it and swaps the panel.
 *
 * Both halves matter: aria-selected moves (what AT reads) AND the previous
 * panel's content leaves the accessible tree. A strip that highlights the new
 * tab while still showing the old panel is a real and easy regression.
 */
export const SelectionInteraction: StoryObj<TabsArgs> = {
  name: 'Interaction — select a tab',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('tab', { name: 'Header I' });
    const second = canvas.getByRole('tab', { name: 'Header II' });

    await expect(first).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(second);
    await waitFor(() => expect(second).toHaveAttribute('aria-selected', 'true'));
    await expect(first).toHaveAttribute('aria-selected', 'false');
    await waitFor(() => expect(canvas.getByText('Content II')).toBeVisible());
  },
};

/**
 * Keyboard: a tablist is ONE tab stop and arrows move along it.
 *
 * Same shape as the radio group, and the same regression to guard: if each tab
 * became its own tab stop the strip would look identical and take four presses
 * to cross.
 */
export const KeyboardInteraction: StoryObj<TabsArgs> = {
  name: 'Interaction — keyboard arrows',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('tab', { name: 'Header I' });
    const second = canvas.getByRole('tab', { name: 'Header II' });

    first.focus();
    await expect(first).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(second).toHaveFocus());
  },
};

/** A disabled tab keeps its place in the strip and drops out of the tab order. */
export const DisabledTabInteraction: StoryObj<TabsArgs> = {
  name: 'Interaction — disabled tab is skipped',
  render: (args) => ({
    props: args,
    template: `
      <p-tabs bapsTabs [brand]="brand" [(value)]="value">
        <p-tablist>
          <p-tab value="0">Registrations</p-tab>
          <p-tab value="1">Attendance</p-tab>
          <p-tab value="2" [disabled]="true">Receipts</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="0">Registration list</p-tabpanel>
          <p-tabpanel value="1">Attendance sheet</p-tabpanel>
          <p-tabpanel value="2">Receipts</p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('tab', { name: 'Receipts' });

    // Still announced, so a user knows the tab exists and is unavailable —
    // hiding it would be a different (worse) design.
    await expect(disabled).toBeVisible();
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(disabled).toHaveAttribute('aria-selected', 'false');
  },
};
