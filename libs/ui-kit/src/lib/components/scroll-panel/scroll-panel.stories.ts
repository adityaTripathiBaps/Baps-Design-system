import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { BapsScrollPanel } from './scroll-panel.component';
import { BapsButton } from '../button/button.component';

const meta: Meta = {
  title: 'Components/Molecules/ScrollPanel',
  id: 'components-scrollpanel',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsScrollPanel, BapsButton] })],
};
export default meta;
type Story = StoryObj;

const LINES = Array.from({ length: 14 }, (_, i) => `Visit ${i + 1}: the family was at home; sabha attendance and seva interests noted for follow-up.`);
const body = `@for (l of lines; track l) { <p style="margin:0 0 var(--space-3)">{{ l }}</p> }`;
const box = 'style="width:100%;max-width:28rem;height:12rem;border:1px solid var(--p-content-border-color);border-radius:var(--p-content-border-radius);padding:var(--space-3)"';

/** PrimeNG "Basic": a fixed-height area with the thin scrollbar. */
export const Basic: Story = {
  render: () => ({ props: { lines: LINES }, template: `<baps-scrollpanel ${box}>${body}</baps-scrollpanel>` }),
};

/** Scroll from code: `scrollTop(y)`; `refresh()` after the content changes size. */
export const Methods: Story = {
  render: () => ({
    props: { lines: LINES },
    template: `<div style="display:grid;gap:var(--space-3);justify-items:start">
      <div style="display:flex;gap:var(--space-2)">
        <baps-button label="Top" severity="secondary" [outlined]="true" (click)="sp.scrollTop(0)" />
        <baps-button label="Middle" severity="secondary" [outlined]="true" (click)="sp.scrollTop(220)" />
      </div>
      <baps-scrollpanel #sp ${box}>${body}</baps-scrollpanel>
    </div>`,
  }),
};
