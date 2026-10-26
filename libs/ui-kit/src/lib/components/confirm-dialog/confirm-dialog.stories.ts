import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { BapsConfirmDialog } from './confirm-dialog.component';
import { BapsButton } from '../button/button.component';
import { BapsConfirmationService } from './confirmation.service';

/**
 * A host that INJECTS BapsConfirmationService, because a story template cannot.
 *
 * This mirrors the only way the component is usable in a real app: something
 * has to hold the service and call `confirm()`. A template-only story would
 * have nothing to push confirmations with.
 */
@Component({
  selector: 'baps-confirm-dialog-demo',
  imports: [BapsConfirmDialog, BapsButton],
  template: `
    <div style="padding:3rem; display:flex; gap:1rem; flex-wrap:wrap">
      <ng-content />
    </div>
    <baps-confirm-dialog
      [key]="key"
      [brand]="brand"
      [closable]="closable"
      [baseZIndex]="baseZIndex"
      [acceptButtonStyleClass]="acceptButtonStyleClass"
      [rejectButtonStyleClass]="rejectButtonStyleClass"
      [styleClass]="styleClass"
      [style]="style"
      (hide)="hide.emit()"
    />
  `,
})
class ConfirmDialogDemo {
  @Input() key?: string;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';
  @Input() closable = false;
  @Input() baseZIndex = 0;
  @Input() acceptButtonStyleClass?: string;
  @Input() rejectButtonStyleClass?: string;
  @Input() styleClass?: string;
  @Input() style?: Record<string, string | number>;
  @Output() hide = new EventEmitter<void>();

  readonly svc = inject(BapsConfirmationService);
}

type ConfirmDialogStoryArgs = ConfirmDialogDemo & Record<'onHide', () => void>;

/**
 * ConfirmDialog — a modal confirmation prompt driven by an imperative service.
 *
 * Wraps `baps-dialog` so it inherits the shell geometry, backdrop mask, focus
 * trapping and brand tokens. Drop `<baps-confirm-dialog />` once in your root
 * and call `BapsConfirmationService.confirm()` to open it.
 */
const meta: Meta<ConfirmDialogStoryArgs> = {
  title: 'Components/Molecules/Confirm Dialog',
  id: 'components-confirm-dialog',
  tags: ['ds:mybky', 'ds:sampark'],
  component: ConfirmDialogDemo,
  decorators: [
    applicationConfig({ providers: [BapsConfirmationService] }),
    moduleMetadata({ imports: [ConfirmDialogDemo, BapsButton] }),
  ],
  argTypes: {
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    closable: { control: 'boolean' },
    baseZIndex: { control: 'number' },
    acceptButtonStyleClass: { control: 'text' },
    rejectButtonStyleClass: { control: 'text' },
    styleClass: { control: 'text' },
    style: { control: 'object' },
    hide: { control: false },
    onHide: { control: false },
  },
  args: {
    brand: 'mybky',
    closable: false,
    baseZIndex: 0,
  },
};

export default meta;
type Story = StoryObj<ConfirmDialogStoryArgs>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      onHide: action('hide'),
      open(svc: BapsConfirmationService) {
        svc.confirm({
          header: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          icon: 'pi pi-question-circle',
        });
      },
    },
    template: `
      <baps-confirm-dialog-demo
        #demo
        [brand]="brand"
        [closable]="closable"
        [baseZIndex]="baseZIndex"
        [acceptButtonStyleClass]="acceptButtonStyleClass"
        [rejectButtonStyleClass]="rejectButtonStyleClass"
        [styleClass]="styleClass"
        [style]="style"
        (hide)="onHide()"
      >
        <baps-button label="Confirm" [brand]="brand" (click)="open(demo.svc)" />
      </baps-confirm-dialog-demo>
    `,
  }),
};

export const DeleteConfirmation: Story = {
  name: 'Delete confirmation',
  render: (args) => ({
    props: {
      ...args,
      onHide: action('hide'),
      open(svc: BapsConfirmationService) {
        svc.confirm({
          header: 'Confirm Deletion',
          message:
            'This will permanently remove the member and all related records. This action cannot be undone.',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Delete',
          rejectLabel: 'Cancel',
          acceptSeverity: 'danger',
          rejectSeverity: 'secondary',
        });
      },
    },
    template: `
      <baps-confirm-dialog-demo #demo [brand]="brand" (hide)="onHide()">
        <baps-button label="Delete Member" severity="danger" [brand]="brand" (click)="open(demo.svc)" />
      </baps-confirm-dialog-demo>
    `,
  }),
};

export const KeyRouting: Story = {
  name: 'Key routing',
  render: (args) => ({
    props: {
      ...args,
      onHide: action('hide'),
      openA(svc: BapsConfirmationService) {
        svc.confirm({
          key: 'dialog-a',
          header: 'Dialog A',
          message: 'This targets key "dialog-a".',
        });
      },
      openB(svc: BapsConfirmationService) {
        svc.confirm({
          key: 'dialog-b',
          header: 'Dialog B',
          message: 'This targets key "dialog-b".',
        });
      },
    },
    template: `
      <div style="padding:var(--space-6); display:flex; gap:var(--space-4);">
        <baps-button label="Open A" [brand]="brand" (click)="openA(svcA.svc)" />
        <baps-button label="Open B" [brand]="brand" (click)="openB(svcB.svc)" />
        <baps-confirm-dialog-demo #svcA key="dialog-a" [brand]="brand" (hide)="onHide()" />
        <baps-confirm-dialog-demo #svcB key="dialog-b" [brand]="brand" (hide)="onHide()" />
      </div>
    `,
  }),
};

export const Sampark: Story = {
  args: {
    brand: 'sampark',
  },
  render: (args) => ({
    props: {
      ...args,
      onHide: action('hide'),
      open(svc: BapsConfirmationService) {
        svc.confirm({
          header: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          icon: 'pi pi-question-circle',
        });
      },
    },
    template: `
      <div class="baps-ds-sampark">
        <baps-confirm-dialog-demo #demo brand="sampark" (hide)="onHide()">
          <baps-button label="Confirm (Sampark)" brand="sampark" (click)="open(demo.svc)" />
        </baps-confirm-dialog-demo>
      </div>
    `,
  }),
};

/* ── Interactions ────────────────────────────────────────────────────────── */

export const OpenCloseInteraction: Story = {
  name: 'Interaction — open and dismiss',
  render: (args) => ({
    props: {
      ...args,
      onHide: action('hide'),
      open(svc: BapsConfirmationService) {
        svc.confirm({
          header: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          icon: 'pi pi-question-circle',
        });
      },
    },
    template: `
      <baps-confirm-dialog-demo #demo [brand]="brand" (hide)="onHide()">
        <baps-button label="Open Dialog" [brand]="brand" (click)="open(demo.svc)" />
      </baps-confirm-dialog-demo>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    await waitFor(
      () =>
        expect(
          page.getByText('Are you sure you want to proceed?'),
        ).toBeVisible(),
      { timeout: 8000 },
    );

    // Reject (press No) should close the dialog
    await userEvent.click(page.getByRole('button', { name: 'No' }));
    await waitFor(
      () =>
        expect(
          page.queryByText('Are you sure you want to proceed?'),
        ).not.toBeInTheDocument(),
      { timeout: 8000 },
    );
  },
};
