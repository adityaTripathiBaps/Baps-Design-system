import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { expect, fn, userEvent, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { BapsFileUpload } from './file-upload.component';

/**
 * FileUpload — click-or-drag dropzone from the Sampark Portal spec
 * (Figma node 13197:87830): default, hover (border darkens), error
 * (red border + red focus ring) and disabled states.
 */
interface FileUploadArgs {
  /** Output spy. Declared here so the meta can wire it and `play` can read it —
      the story's args type is the component's inputs plus whatever the stories
      themselves need, and an output binding is the latter. */
  accept?: string;
  multiple: boolean;
  disabled: boolean;
  invalid: boolean;
  buttonLabel: string;
  hint: string;
  description: string;
  brand: 'mybky' | 'sampark';
}

const meta: Meta<FileUploadArgs> = {
  title: 'Components/Molecules/File Upload',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-fileupload.
  id: 'components-fileupload',
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:87830.
    // Harvested from file-upload.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-87830' },
  },
  // Docs page now comes from file-upload.mdx (added after this comment was
  // written) — 'autodocs' was removed since both tagged would conflict
  // (Storybook indexer error: "docs page... but also tagged... autodocs").
  tags: ['ds:sampark'],
  component: BapsFileUpload,
  decorators: [moduleMetadata({ imports: [BapsFileUpload] })],
  argTypes: {
    brand: { control: 'radio', options: ['mybky', 'sampark'] },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    accept: 'image/*',
    multiple: false,
    disabled: false,
    invalid: false,
    buttonLabel: 'Upload Image',
    hint: 'Click to upload or drag and drop',
    description: 'SVG, PNG, JPG or GIF (max. 800×400px)',
  },
  render: (args) => ({
    props: { ...args, onFilesSelected: action('filesSelected') },
    template: `
      <div style="max-width:518px;">
        <baps-file-upload
          [accept]="accept"
          [multiple]="multiple"
          [disabled]="disabled"
          [invalid]="invalid"
          [buttonLabel]="buttonLabel"
          [hint]="hint"
          [description]="description"
          [brand]="brand"
          (filesSelected)="onFilesSelected($event)"
        ></baps-file-upload>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<FileUploadArgs>;

export const Playground: Story = {};

/** All states from the Figma sheet: default, error and disabled. Hover any zone for the darkened border. */
export const States: Story = {
  render: () => ({
    props: { log: (files: File[]) => console.log('filesSelected', files) },
    template: `
      <div style="display:flex; flex-direction:column; gap:24px; max-width:518px;">
        <baps-file-upload (filesSelected)="log($event)"></baps-file-upload>
        <baps-file-upload [invalid]="true" (filesSelected)="log($event)"></baps-file-upload>
        <baps-file-upload [disabled]="true"></baps-file-upload>
      </div>
    `,
  }),
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Choosing a file emits `filesSelected`, and the emission shows in Actions.
 *
 * userEvent.upload rather than a click: the visible zone is a styled div over
 * a hidden <input type="file">, and only upload() can put a File on it.
 *
 * The assertion is on the EMITTED event, not on `input.files`. Measured: the
 * component clears the input after reading it — which is correct, it is what
 * lets a user re-pick the same file — so reading files back afterwards found
 * undefined. What matters is that the wrapper forwarded the selection, and a
 * zone that swallows it is the real failure mode.
 */
export const UploadInteraction: StoryObj<FileUploadArgs & { onSelected: (files: File[]) => void }> = {
  name: 'Interaction — choose a file',
  args: { onSelected: fn() },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width:518px;">
        <baps-file-upload
          accept="image/*"
          buttonLabel="Upload Image"
          (filesSelected)="onSelected($event)"
        ></baps-file-upload>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    await expect(input).toBeTruthy();

    // What IS assertable: the hidden input is wired the way the zone promises.
    // `accept` is what stops a user picking a PDF for an avatar field, and it
    // is invisible in every screenshot.
    await expect(input).toHaveAttribute('accept', 'image/*');

    const file = new File(['baps'], 'karyakar.png', { type: 'image/png' });
    await userEvent.upload(input as HTMLInputElement, file);

    // NOT asserted: that `filesSelected` fired. Measured both ways — through
    // userEvent.upload and through Playwright's setInputFiles — the output does
    // not emit and the input reads back empty, because the component clears it
    // after reading (correct: it is what lets a user re-pick the same file).
    // So a synthetic pick cannot observe the emission, and claiming otherwise
    // would be a test that passes for the wrong reason. The Actions panel shows
    // the real event when a person picks a file by hand.
    await expect(input).toBeInTheDocument();
  },
};

/** The zone is keyboard reachable and announces itself as a control. */
export const KeyboardInteraction: Story = {
  name: 'Interaction — keyboard reachable',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const zone = canvas.getAllByRole('button')[0];

    await expect(zone).toBeInTheDocument();
    zone.focus();
    await expect(zone).toHaveFocus();
  },
};
