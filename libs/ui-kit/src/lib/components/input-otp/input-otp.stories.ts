import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { expect, userEvent, within } from '@storybook/test';
import { BapsInputOtp } from './input-otp.component';

const meta: Meta<BapsInputOtp> = {
  title: 'Components/Molecules/Input OTP',
  id: 'components-inputotp',
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/PKHWEQTVUKl6FAeQSIkXMW/?node-id=754-4740',
    },
  },
  decorators: [moduleMetadata({ imports: [BapsInputOtp, FormsModule] })],
  component: BapsInputOtp,
  args: {
    length: 6,
    integerOnly: true,
    disabled: false,
    readonly: false,
    invalid: false,
  },
  argTypes: {
    length: { control: 'inline-radio', options: [4, 6] },
    separator: { control: 'boolean' },
    brand: { control: 'inline-radio', options: [undefined, 'mybky', 'sampark'] },
  },
  render: (args) => ({
    props: { ...args, code: '' },
    template: `
      <baps-input-otp
        [(ngModel)]="code"
        [length]="length"
        [separator]="separator"
        [integerOnly]="integerOnly"
        [disabled]="disabled"
        [readonly]="readonly"
        [invalid]="invalid"
        [brand]="brand"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<BapsInputOtp>;

export const Playground: Story = {};

/**
 * Every Figma state, 4 and 6 digits, with the label and hint composed around
 * the field the way a Sampark form does it. Hover and focus are live: point at
 * or tab into a box.
 */
export const SamparkStates: Story = {
  tags: ['!ds:mybky'],
  name: 'Sampark States',
  render: () => ({
    props: { empty4: '', empty6: '', full4: '1234', full6: '123456' },
    template: `
      <div class="baps-ds-sampark" style="display:grid; grid-template-columns:auto auto; gap:24px 32px; justify-content:start;">
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-p4">Verification code</label>
          <baps-input-otp inputId="otp-p4" [length]="4" [(ngModel)]="empty4" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-p6">Verification code</label>
          <baps-input-otp inputId="otp-p6" [length]="6" [(ngModel)]="empty6" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>

        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-f4">Filled</label>
          <baps-input-otp inputId="otp-f4" [length]="4" [(ngModel)]="full4" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-f6">Filled</label>
          <baps-input-otp inputId="otp-f6" [length]="6" [(ngModel)]="full6" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>

        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-e4">Error <span class="p-error">*</span></label>
          <baps-input-otp inputId="otp-e4" [length]="4" [invalid]="true" [ngModel]="''" />
          <small class="input-hint p-error">Enter the code we sent you.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-e6">Error filled <span class="p-error">*</span></label>
          <baps-input-otp inputId="otp-e6" [length]="6" [invalid]="true" [ngModel]="'123456'" />
          <small class="input-hint p-error">That code did not match.</small>
        </div>

        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-d4">Disabled</label>
          <baps-input-otp inputId="otp-d4" [length]="4" [disabled]="true" [ngModel]="''" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="otp-d6">Disabled</label>
          <baps-input-otp inputId="otp-d6" [length]="6" [disabled]="true" [ngModel]="''" />
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
      </div>
    `,
  }),
};

/**
 * Typing fills one box at a time and moves on; a letter is refused because
 * the field is digits-only, and the separator does not stop the caret.
 * Backspace walks back across it.
 */
export const TypeInteraction: Story = {
  tags: ['!ds:mybky'],
  render: () => ({
    props: { code: '' },
    template: `
      <div class="baps-ds-sampark">
        <baps-input-otp [length]="6" [(ngModel)]="code" />
        <p data-testid="value">{{ code }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvasElement.querySelectorAll<HTMLInputElement>('input.p-inputotp-input');
    await expect(boxes.length).toBe(6);
    await userEvent.click(boxes[0]);
    await userEvent.keyboard('1a23456');
    await expect(await canvas.findByText('123456')).toBeInTheDocument();
    await expect(document.activeElement).toBe(boxes[5]);
    // Each Backspace clears the box and steps back one, across the separator.
    await userEvent.keyboard('{Backspace}{Backspace}{Backspace}{Backspace}');
    await expect(await canvas.findByText('12')).toBeInTheDocument();
    await expect(document.activeElement).toBe(boxes[1]);
  },
};
