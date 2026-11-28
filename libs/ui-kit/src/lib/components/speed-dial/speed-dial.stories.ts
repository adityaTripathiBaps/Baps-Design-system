import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MenuItem, SharedModule } from 'primeng/api';
import { BapsSpeedDial } from './speed-dial.component';

const meta: Meta<BapsSpeedDial> = {
  title: 'Components/Molecules/SpeedDial',
  id: 'components-speeddial',
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsSpeedDial,
  decorators: [moduleMetadata({ imports: [BapsSpeedDial, SharedModule] })],
};
export default meta;
type Story = StoryObj<BapsSpeedDial>;

const ITEMS: MenuItem[] = [
  { label: 'Add', icon: 'pi pi-pencil' },
  { label: 'Update', icon: 'pi pi-refresh' },
  { label: 'Delete', icon: 'pi pi-trash' },
  { label: 'Upload', icon: 'pi pi-upload' },
  { label: 'Website', icon: 'pi pi-external-link' },
];

/** A box with the dial pinned where the demo puts it. */
const box = (inner: string, height = '28rem') =>
  `<div style="position:relative;height:${height};border:1px dashed var(--p-content-border-color);border-radius:var(--p-content-border-radius)">${inner}</div>`;
const at = (css: string, attrs: string) => `<baps-speed-dial [model]="items" ${attrs} [style]="{ position: 'absolute', ${css} }" />`;

/** PrimeNG "Linear": one direction per corner. */
export const Linear: Story = {
  render: () => ({
    props: { items: ITEMS },
    template: box(
      at("left: 'calc(50% - 2rem)', bottom: 0", 'direction="up"') +
        at("left: 0, top: 'calc(50% - 2rem)'", 'direction="right"') +
        at("left: 'calc(50% - 2rem)', top: 0", 'direction="down"') +
        at("right: 0, top: 'calc(50% - 2rem)'", 'direction="left"'),
    ),
  }),
};

/** PrimeNG "Circle". */
export const Circle: Story = {
  render: () => ({
    props: { items: ITEMS },
    template: box(at("top: 'calc(50% - 2rem)', left: 'calc(50% - 2rem)'", 'type="circle" [radius]="80" buttonClassName="p-button-warn"')),
  }),
};

/** PrimeNG "Semi Circle". */
export const SemiCircle: Story = {
  render: () => ({
    props: { items: ITEMS },
    template: box(
      at("left: 'calc(50% - 2rem)', bottom: 0", 'direction="up" type="semi-circle" [radius]="80"') +
        at("left: 0, top: 'calc(50% - 2rem)'", 'direction="right" type="semi-circle" [radius]="80"') +
        at("left: 'calc(50% - 2rem)', top: 0", 'direction="down" type="semi-circle" [radius]="80"') +
        at("right: 0, top: 'calc(50% - 2rem)'", 'direction="left" type="semi-circle" [radius]="80"'),
    ),
  }),
};

/** PrimeNG "Quarter Circle". */
export const QuarterCircle: Story = {
  render: () => ({
    props: { items: ITEMS },
    template: box(
      at('right: 0, bottom: 0', 'direction="up-left" type="quarter-circle" [radius]="120"') +
        at('left: 0, bottom: 0', 'direction="up-right" type="quarter-circle" [radius]="120"') +
        at('left: 0, top: 0', 'direction="down-right" type="quarter-circle" [radius]="120"') +
        at('right: 0, top: 0', 'direction="down-left" type="quarter-circle" [radius]="120"'),
    ),
  }),
};

/** PrimeNG "Tooltip": each action names itself. */
export const Tooltip: Story = {
  render: () => ({
    props: { items: ITEMS.map((i) => ({ ...i, tooltipOptions: { tooltipLabel: i.label, tooltipPosition: 'left' } })) },
    template: box(at("right: 0, bottom: 0", 'direction="up" ariaLabel="Actions"'), '22rem'),
  }),
};

/** PrimeNG "Mask": dim the page while the actions are out. */
export const Mask: Story = {
  render: () => ({
    props: { items: ITEMS },
    template: box(at('right: 0, bottom: 0', 'direction="up" [mask]="true" ariaLabel="Actions"'), '22rem'),
  }),
};

/** PrimeNG "Template": custom main button and action rows. */
export const Template: Story = {
  render: () => ({
    props: { items: ITEMS },
    template: box(
      `<baps-speed-dial [model]="items" direction="up" [style]="{ position: 'absolute', left: 'calc(50% - 2rem)', bottom: 0 }">
        <ng-template pTemplate="button" let-toggleCallback="toggleCallback">
          <button type="button" (click)="toggleCallback($event)" style="display:flex;flex-direction:column;align-items:center;gap:var(--space-1);padding:var(--space-2) var(--space-3);border:1px solid var(--p-content-border-color);border-radius:var(--p-content-border-radius);background:var(--p-content-background);cursor:pointer">
            <i class="pi pi-bolt"></i><span>Actions</span>
          </button>
        </ng-template>
        <ng-template pTemplate="item" let-item let-toggleCallback="toggleCallback">
          <button type="button" (click)="toggleCallback($event, item)" style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--p-content-border-color);border-radius:var(--p-content-border-radius);background:var(--p-content-background);cursor:pointer;white-space:nowrap">
            <i [class]="item.icon"></i><span>{{ item.label }}</span>
          </button>
        </ng-template>
      </baps-speed-dial>`,
      '24rem',
    ),
  }),
};
