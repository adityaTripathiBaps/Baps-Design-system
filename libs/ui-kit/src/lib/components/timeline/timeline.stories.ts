import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SharedModule } from 'primeng/api';
import { BapsTimeline } from './timeline.component';
import { BapsCard } from '../card/card.component';

const meta: Meta = {
  title: 'Components/Molecules/Timeline',
  id: 'components-timeline',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [BapsTimeline, BapsCard, SharedModule] })],
};
export default meta;
type Story = StoryObj;

const EVENTS = [
  { status: 'Project created', date: '12 Nov 2026', icon: 'pi pi-plus' },
  { status: 'Families assigned', date: '15 Nov 2026', icon: 'pi pi-users' },
  { status: 'Visits started', date: '18 Nov 2026', icon: 'pi pi-home' },
  { status: 'Report submitted', date: '26 Nov 2026', icon: 'pi pi-check' },
];
const content = `<ng-template pTemplate="content" let-e>{{ e.status }}</ng-template>`;

/** PrimeNG "Alignment": content on the left, the right or alternating. */
export const Alignment: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-6)">
      <baps-timeline [value]="events">${content}</baps-timeline>
      <baps-timeline [value]="events" align="right">${content}</baps-timeline>
      <baps-timeline [value]="events" align="alternate">${content}</baps-timeline>
    </div>`,
  }),
};

/** PrimeNG "Opposite": a second column on the other side of the line. */
export const Opposite: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<baps-timeline [value]="events">
      <ng-template pTemplate="opposite" let-e><span style="color:var(--p-text-muted-color)">{{ e.date }}</span></ng-template>
      ${content}
    </baps-timeline>`,
  }),
};

/** PrimeNG "Template": custom markers and a card per event. */
export const Template: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<baps-timeline [value]="events" align="alternate">
      <ng-template pTemplate="marker" let-e>
        <span style="display:flex;width:2rem;height:2rem;align-items:center;justify-content:center;border-radius:50%;background:var(--p-primary-color);color:var(--p-primary-contrast-color)">
          <i [class]="e.icon"></i>
        </span>
      </ng-template>
      <ng-template pTemplate="content" let-e>
        <baps-card>
          <div style="font-weight:600">{{ e.status }}</div>
          <div style="color:var(--p-text-muted-color);font-size:0.875rem">{{ e.date }}</div>
          <p style="margin:var(--space-2) 0 0">Logged by the Robbinsville centre.</p>
        </baps-card>
      </ng-template>
    </baps-timeline>`,
  }),
};

/** PrimeNG "Horizontal". */
export const Horizontal: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<div style="display:grid;gap:var(--space-8)">
      <baps-timeline [value]="events" layout="horizontal" align="top">${content}</baps-timeline>
      <baps-timeline [value]="events" layout="horizontal" align="bottom">${content}</baps-timeline>
      <baps-timeline [value]="events" layout="horizontal" align="alternate">
        <ng-template pTemplate="opposite">&nbsp;</ng-template>
        ${content}
      </baps-timeline>
    </div>`,
  }),
};
