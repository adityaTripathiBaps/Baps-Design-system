import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { DataView } from 'primeng/dataview';
import { BapsDataView } from './data-view.directive';
import { BapsSegmented } from '../segmented/segmented.component';
import { BapsSelect } from '../select/select.component';
import { BapsSkeleton } from '../skeleton/skeleton.component';
import { BapsTag } from '../tag/tag.component';
import { BapsButton } from '../button/button.component';
import { BapsPaginator } from '../pagination/pagination.component';

const meta: Meta = {
  title: 'Components/Molecules/DataView',
  id: 'components-dataview',
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [moduleMetadata({ imports: [DataView, BapsDataView, BapsSegmented, BapsSelect, BapsSkeleton, BapsTag, BapsButton, BapsPaginator, FormsModule] })],
};
export default meta;
type Story = StoryObj;

const CENTERS = [
  { name: 'Robbinsville', region: 'Northeast', families: 412, status: 'Active' },
  { name: 'Edison', region: 'Northeast', families: 388, status: 'Active' },
  { name: 'Atlanta', region: 'Southeast', families: 296, status: 'Active' },
  { name: 'Chicago', region: 'Midwest', families: 341, status: 'Review' },
  { name: 'Houston', region: 'Southwest', families: 275, status: 'Active' },
  { name: 'Toronto', region: 'Canada', families: 318, status: 'Paused' },
  { name: 'Parsippany', region: 'Northeast', families: 201, status: 'Active' },
  { name: 'Lilburn', region: 'Southeast', families: 154, status: 'Review' },
  { name: 'Bartlett', region: 'Midwest', families: 233, status: 'Active' },
  { name: 'Markham', region: 'Canada', families: 187, status: 'Active' },
  { name: 'Dallas', region: 'Southwest', families: 262, status: 'Paused' },
  { name: 'Sarangpur', region: 'India', families: 509, status: 'Active' },
];
const SEV = "item.status === 'Active' ? 'success' : item.status === 'Review' ? 'warn' : 'secondary'";

const row = `
  <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4) 0" [style.border-top]="first ? 'none' : '1px solid var(--p-content-border-color)'">
    <i class="pi pi-building" style="font-size:1.5rem;color:var(--p-primary-color)"></i>
    <div style="flex:1;min-width:0">
      <div style="font-weight:600">{{ item.name }}</div>
      <div style="color:var(--p-text-muted-color);font-size:0.875rem">{{ item.region }} · {{ item.families }} families</div>
    </div>
    <baps-tag [value]="item.status" [severity]="${SEV}" />
  </div>`;
const listTpl = `<ng-template #list let-items>
  <div>@for (item of items; track item.name; let first = $first) {${row}}</div>
</ng-template>`;
const gridTpl = `<ng-template #grid let-items>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(12rem,1fr));gap:var(--space-4)">
    @for (item of items; track item.name) {
      <div style="padding:var(--space-4);border:1px solid var(--p-content-border-color);border-radius:var(--p-content-border-radius);display:grid;gap:var(--space-2)">
        <i class="pi pi-building" style="font-size:1.5rem;color:var(--p-primary-color)"></i>
        <div style="font-weight:600">{{ item.name }}</div>
        <div style="color:var(--p-text-muted-color);font-size:0.875rem">{{ item.region }} · {{ item.families }} families</div>
        <baps-tag [value]="item.status" [severity]="${SEV}" />
      </div>
    }
  </div>
</ng-template>`;

/** PrimeNG "Basic": a list template over the items. */
export const Basic: Story = {
  render: () => ({
    props: { centers: CENTERS.slice(0, 5) },
    template: `<p-dataview bapsDataView [value]="centers">${listTpl}</p-dataview>`,
  }),
};

/**
 * PrimeNG "Pagination", with the kit paginator. DataView's own `[paginator]`
 * draws PrimeNG's p-paginator, not `baps-paginator`, so page the value and put
 * `baps-paginator` under it, as the kit table does.
 */
export const Pagination: Story = {
  render: () => ({
    props: { centers: CENTERS, first: 0, rows: 5 },
    template: `<div style="display:grid;gap:var(--space-3)">
      <p-dataview bapsDataView [value]="centers.slice(first, first + rows)">${listTpl}</p-dataview>
      <baps-paginator [first]="first" [rows]="rows" [totalRecords]="centers.length" (pageChange)="first = $event.first; rows = $event.rows" />
    </div>`,
  }),
};

/** PrimeNG "Sort": the header picks the order. */
export const Sort: Story = {
  render: () => ({
    props: {
      centers: CENTERS,
      sortOptions: [
        { label: 'Most families', value: '!families' },
        { label: 'Fewest families', value: 'families' },
      ],
      sortKey: null,
      sortField: undefined,
      sortOrder: 1,
      onSort(this: any, v: string) {
        this.sortOrder = v.startsWith('!') ? -1 : 1;
        this.sortField = v.replace('!', '');
      },
    },
    template: `<p-dataview bapsDataView [value]="centers" [sortField]="sortField" [sortOrder]="sortOrder">
      <ng-template #header>
        <div style="max-width:14rem">
          <baps-select [options]="sortOptions" optionLabel="label" optionValue="value" placeholder="Sort by families" ariaLabel="Sort" [(ngModel)]="sortKey" (ngModelChange)="onSort($event)" />
        </div>
      </ng-template>
      ${listTpl}
    </p-dataview>`,
  }),
};

/** PrimeNG "Layout": list or grid, switched in the header. */
export const Layout: Story = {
  render: () => ({
    props: { centers: CENTERS.slice(0, 6), layout: 'grid', options: [{ label: 'List', value: 'list' }, { label: 'Grid', value: 'grid' }] },
    template: `<p-dataview bapsDataView [value]="centers" [layout]="layout">
      <ng-template #header>
        <div style="display:flex;justify-content:flex-end">
          <baps-segmented style="width:10rem" [options]="options" optionLabel="label" optionValue="value" [allowEmpty]="false" ariaLabel="Layout" [(ngModel)]="layout" />
        </div>
      </ng-template>
      ${listTpl}
      ${gridTpl}
    </p-dataview>`,
  }),
};

/** PrimeNG "Loading": skeleton rows while the items load. */
export const Loading: Story = {
  render: () => ({
    props: { rows: [1, 2, 3, 4] },
    template: `<p-dataview bapsDataView [value]="rows">
      <ng-template #list let-items>
        @for (r of items; track r) {
          <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4) 0">
            <baps-skeleton shape="circle" size="2rem" />
            <div style="flex:1;display:grid;gap:var(--space-2)"><baps-skeleton width="40%" /><baps-skeleton width="60%" /></div>
            <baps-skeleton width="4rem" height="1.5rem" />
          </div>
        }
      </ng-template>
    </p-dataview>`,
  }),
};

/** No items: `emptyMessage`, or an `#emptymessage` template. */
export const Empty: Story = {
  render: () => ({
    props: { centers: [] },
    template: `<p-dataview bapsDataView [value]="centers" emptyMessage="No centers match these filters.">${listTpl}</p-dataview>`,
  }),
};
