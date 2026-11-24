import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsEditor } from './editor.component';

const meta: Meta<BapsEditor> = {
  title: 'Components/Molecules/Editor',
  id: 'components-editor',
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/PKHWEQTVUKl6FAeQSIkXMW/?node-id=585-4268',
    },
  },
  decorators: [moduleMetadata({ imports: [BapsEditor, FormsModule] })],
  component: BapsEditor,
  args: {
    toolbar: 'default',
    placeholder: 'Enter user name',
    maxLength: 200,
    invalid: false,
    disabled: false,
    ariaLabel: 'Notes',
  },
  argTypes: {
    toolbar: { control: 'inline-radio', options: ['default', 'compact'] },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
  },
  render: (args) => ({
    props: { ...args, html: '' },
    template: `
      <div style="max-width: 40rem">
        <baps-editor
          [(ngModel)]="html"
          [toolbar]="toolbar"
          [placeholder]="placeholder"
          [maxLength]="maxLength"
          [invalid]="invalid"
          [disabled]="disabled"
          [ariaLabel]="ariaLabel"
          [brand]="brand"
        />
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<BapsEditor>;

export const Playground: Story = {};

/**
 * Figma 585:4268 states with the label and hint composed around the field:
 * placeholder, filled, error, disabled, and the compact bar (585:5287
 * "Compect") with alignment and list as dropdowns.
 */
export const SamparkStates: Story = {
  tags: ['!ds:mybky'],
  name: 'Sampark States',
  render: () => ({
    props: { empty: '', filled: '<p>Enter user name</p>', bad: '<p>Enter user name</p>' },
    template: `
      <div class="baps-ds-sampark" style="display:grid; grid-template-columns:repeat(2, 30rem); gap:24px 32px;">
        <div class="field" style="display:flex; flex-direction:column;">
          <label id="ed-1">Placeholder</label>
          <baps-editor ariaLabelledBy="ed-1" [(ngModel)]="empty" placeholder="Enter user name" [maxLength]="200" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label id="ed-2">Filled</label>
          <baps-editor ariaLabelledBy="ed-2" [(ngModel)]="filled" [maxLength]="200" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label id="ed-3">Error <span class="p-error">*</span></label>
          <baps-editor ariaLabelledBy="ed-3" [(ngModel)]="bad" [invalid]="true" [maxLength]="200" />
          <small class="input-hint p-error">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label id="ed-4">Disabled</label>
          <baps-editor ariaLabelledBy="ed-4" [ngModel]="''" [disabled]="true" placeholder="Enter user name" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label id="ed-5">Compact bar</label>
          <baps-editor ariaLabelledBy="ed-5" toolbar="compact" [(ngModel)]="empty" placeholder="Enter user name" [maxLength]="200" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
      </div>
    `,
  }),
};
