import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Timeline } from 'primeng/timeline';
import { BapsTimeline } from './timeline.directive';
import { BapsCard } from '../card/card.component';

const meta: Meta = {
  title: 'Components/Molecules/Timeline',
  id: 'components-timeline',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [Timeline, BapsTimeline, BapsCard] })],
};
export default meta;
type Story = StoryObj;

const EVENTS = [
  { status: 'Project created', date: '12 Nov 2026', icon: 'pi pi-plus' },
  { status: 'Families assigned', date: '15 Nov 2026', icon: 'pi pi-users' },
  { status: 'Visits started', date: '18 Nov 2026', icon: 'pi pi-home' },
  { status: 'Report submitted', date: '26 Nov 2026', icon: 'pi pi-check' },
];
const content = `<ng-template #content let-e>{{ e.status }}</ng-template>`;

/** PrimeNG "Alignment": content on the left, the right or alternating. */
export const Alignment: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-6)">
      <p-timeline bapsTimeline [value]="events">${content}</p-timeline>
      <p-timeline bapsTimeline [value]="events" align="right">${content}</p-timeline>
      <p-timeline bapsTimeline [value]="events" align="alternate">${content}</p-timeline>
    </div>`,
  }),
};

/** PrimeNG "Opposite": a second column on the other side of the line. */
export const Opposite: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<p-timeline bapsTimeline [value]="events">
      <ng-template #opposite let-e><span style="color:var(--p-text-muted-color)">{{ e.date }}</span></ng-template>
      ${content}
    </p-timeline>`,
  }),
};

/** PrimeNG "Template": custom markers and a card per event. */
export const Template: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<p-timeline bapsTimeline [value]="events" align="alternate">
      <ng-template #marker let-e>
        <span style="display:flex;width:2rem;height:2rem;align-items:center;justify-content:center;border-radius:50%;background:var(--p-primary-color);color:var(--p-primary-contrast-color)">
          <i [class]="e.icon"></i>
        </span>
      </ng-template>
      <ng-template #content let-e>
        <baps-card>
          <div style="font-weight:600">{{ e.status }}</div>
          <div style="color:var(--p-text-muted-color);font-size:0.875rem">{{ e.date }}</div>
          <p style="margin:var(--space-2) 0 0">Logged by the Robbinsville centre.</p>
        </baps-card>
      </ng-template>
    </p-timeline>`,
  }),
};

/** PrimeNG "Horizontal". */
export const Horizontal: Story = {
  render: () => ({
    props: { events: EVENTS },
    template: `<div style="display:grid;gap:var(--space-8)">
      <p-timeline bapsTimeline [value]="events" layout="horizontal" align="top">${content}</p-timeline>
      <p-timeline bapsTimeline [value]="events" layout="horizontal" align="bottom">${content}</p-timeline>
      <p-timeline bapsTimeline [value]="events" layout="horizontal" align="alternate">
        <ng-template #opposite>&nbsp;</ng-template>
        ${content}
      </p-timeline>
    </div>`,
  }),
};
