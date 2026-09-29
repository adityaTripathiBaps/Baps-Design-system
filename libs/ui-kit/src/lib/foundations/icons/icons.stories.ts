import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsIcon } from '../../components/icon/icon.component';
import { BapsButton } from '../../components/button/button.component';
import { BapsIconField } from '../../components/form-field/icon-field.component';
import { BapsInputIcon } from '../../components/form-field/input-icon.component';
import { BapsInputText } from '../../components/form-field/directives/input-text.directive';

/**
 * Icons in context — the usage examples for the Foundations/Icons page.
 *
 * The gallery, sizes and colour stories live with the component
 * (components/icon/icon.stories.ts) and the page renders those directly; this
 * file holds only what the component page does not: an icon inside other
 * components. Colours come from the brand's own semantic tokens so the row
 * follows the toolbar.
 */
const meta: Meta = {
  title: 'Foundations/Icons',
  id: 'foundations-icons',
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/%F0%9F%9F%A2-Sampark-Portal?node-id=13193-56731' },
  },
  decorators: [moduleMetadata({ imports: [BapsIcon, BapsButton, BapsIconField, BapsInputIcon, BapsInputText] })],
};
export default meta;

type Story = StoryObj;

const cell = 'display:flex; flex-direction:column; gap:.5rem; align-items:flex-start; min-width:0;';
const caption = 'font-size:12px; color:var(--baps-docs-muted);';

export const InContext: Story = {
  render: () => ({
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 200px), 1fr)); gap:1.5rem;">
        <div style="${cell}">
          <button type="button" aria-label="Delete row" style="display:inline-flex; padding:.5rem; border:1px solid var(--baps-docs-control); border-radius:6px; background:none; color:inherit; cursor:pointer;">
            <baps-icon name="trash" size="sm" />
          </button>
          <span style="${caption}">Icon only — the button carries the label</span>
        </div>

        <div style="${cell}">
          <span style="display:inline-flex; align-items:center; gap:var(--space-2);">
            <baps-icon name="calendar" size="sm" /> 24 September 2026
          </span>
          <span style="${caption}">Icon + text — decorative, hidden from screen readers</span>
        </div>

        <div style="${cell}">
          <baps-button label="Add filter" icon="add-to-filter" severity="primary" />
          <span style="${caption}">Button icon — the icon input takes a BAPS icon name</span>
        </div>

        <div style="${cell}">
          <baps-iconfield style="display:block; width:100%;">
            <baps-inputicon styleClass="pi pi-search" />
            <input bapsInputText placeholder="Search members" aria-label="Search members" />
          </baps-iconfield>
          <span style="${caption}">Input icon — PrimeIcons class via baps-inputicon</span>
        </div>

        <div style="${cell}">
          <nav aria-label="Example navigation" style="display:flex; flex-direction:column; gap:var(--space-1);">
            <a href="#" (click)="$event.preventDefault()" style="display:inline-flex; align-items:center; gap:var(--space-2); color:var(--baps-docs-link); font-weight:600; text-decoration:none;" aria-current="page">
              <baps-icon name="home" size="md" /> Dashboard
            </a>
            <a href="#" (click)="$event.preventDefault()" style="display:inline-flex; align-items:center; gap:var(--space-2); color:var(--baps-docs-muted); text-decoration:none;">
              <baps-icon name="user" size="md" /> Members
            </a>
          </nav>
          <span style="${caption}">Navigation — 20px, accent when active</span>
        </div>

        <div style="${cell}">
          <span style="display:inline-flex; align-items:center; gap:var(--space-2);">
            <baps-icon name="check-circle" size="sm" label="Success" style="color:var(--baps-docs-status-passed);" /> Saved
          </span>
          <span style="display:inline-flex; align-items:center; gap:var(--space-2);">
            <baps-icon name="alert-triangle" size="sm" label="Warning" style="color:var(--baps-docs-status-warning);" /> Unsaved changes
          </span>
          <span style="${caption}">Status — icon AND word, never colour alone</span>
        </div>

        <div style="${cell}">
          <button type="button" disabled aria-label="Download (unavailable)" style="display:inline-flex; padding:.5rem; border:1px solid var(--baps-docs-divider); border-radius:6px; background:none; color:inherit; opacity:.4; cursor:not-allowed;">
            <baps-icon name="download" size="sm" />
          </button>
          <span style="${caption}">Disabled — inherits the control's 40% opacity</span>
        </div>
      </div>
    `,
  }),
};
