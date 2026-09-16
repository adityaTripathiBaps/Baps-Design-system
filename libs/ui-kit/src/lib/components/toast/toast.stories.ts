import { Component, Input, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata, applicationConfig } from '@storybook/angular';
import { MessageService } from 'primeng/api';
import { BapsToast } from './toast.component';
import { BapsButton } from '../button/button.component';

/**
 * A host that INJECTS MessageService, because a story template cannot.
 *
 * This is not story scaffolding for its own sake — it mirrors the only way the
 * component is usable in a real app: something has to hold the service and
 * call `add()`. A template-only story would have nothing to push messages
 * with, which is exactly the mistake the component's own doc warns about.
 */
@Component({
  selector: 'baps-toast-demo',
  imports: [BapsToast, BapsButton],
  template: `
    <div style="padding:1.5rem; display:flex; gap:0.5rem; flex-wrap:wrap">
      <baps-button label="Success" severity="success" [brand]="brand" (click)="push('success', 'Saved', 'Template updated.')" />
      <baps-button label="Info" [brand]="brand" (click)="push('info', 'Heads up', 'Sync runs at 6:30 PM.')" />
      <baps-button label="Warning" severity="warn" [brand]="brand" (click)="push('warn', 'Check this', 'Two rows have no department.')" />
      <baps-button label="Error" severity="danger" [brand]="brand" (click)="push('error', 'Could not save', 'The server rejected the change.')" />
    </div>
    <baps-toast
      [position]="position"
      [life]="life"
      [preventOpenDuplicates]="preventOpenDuplicates"
      [brand]="brand"
    />
  `,
})
class ToastDemo {
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | 'center' = 'top-right';
  @Input() life = 4000;
  @Input() preventOpenDuplicates = false;
  @Input() brand: 'mybky' | 'sampark' = 'mybky';

  private readonly messages = inject(MessageService);

  push(severity: string, summary: string, detail: string): void {
    this.messages.add({ severity, summary, detail });
  }
}

/**
 * Toast — transient notifications, rendered once near the app root.
 *
 * This wrapper takes no content. Messages arrive through PrimeNG's
 * `MessageService`, which the APPLICATION provides — these stories provide it
 * through `applicationConfig`, the same place a real app would.
 *
 * The usual way this silently does nothing: providing MessageService on a
 * COMPONENT rather than the root. The instance the caller injects is then a
 * different one from the instance the toast subscribes to, the message goes
 * nowhere, and nothing errors.
 *
 * Severity is carried by a 4px leading bar, not a tinted panel — a fully
 * coloured toast over live content is hard to read and harder to ignore.
 */
const meta: Meta<ToastDemo> = {
  title: 'Components/Molecules/Toast',
  // Pinned so the categorised title above does not move the docs URL.
  id: 'components-toast',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: ToastDemo,
  decorators: [
    applicationConfig({ providers: [MessageService] }),
    moduleMetadata({ imports: [ToastDemo] }),
  ],
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
        'center',
      ],
    },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
  },
  args: {
    position: 'top-right', life: 4000,
  },
};

export default meta;
type Story = StoryObj<ToastDemo>;

/** Click a button to push a message of that severity. */
export const Default: Story = {};

/** Bottom-centre, for a screen where the top-right corner is already busy. */
export const BottomCenter: Story = {
  args: { position: 'bottom-center' },
};

/**
 * `preventOpenDuplicates` drops a message identical to one already on screen —
 * useful when a retry loop would otherwise stack the same failure five deep.
 * Click Error twice to compare against the default story.
 */
export const NoDuplicates: Story = {
  args: { preventOpenDuplicates: true },
};
