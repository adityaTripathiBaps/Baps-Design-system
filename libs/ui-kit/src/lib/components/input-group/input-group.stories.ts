import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { BapsInputNumber } from '../input-number/input-number.component';
import { BapsInputGroup } from './input-group.component';
import { BapsSelect } from '../select/select.component';
import { BapsDatepicker } from '../datepicker/datepicker.component';

/**
 * InputGroup — Sampark Portal. One bordered field split into segments by text
 * addons: the Min / Max / Day / Week / Time instances in nodes 17512:77924,
 * 17512:82910, 17512:82727, 17512:78163 and 17512:78134.
 *
 * Distinct from baps-iconfield, which overlays an icon INSIDE the field with
 * no reserved column and no divider.
 */
const meta: Meta<BapsInputGroup> = {
  title: 'Components/Molecules/Input Group',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-inputgroup.
  id: 'components-inputgroup',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  // Curated controls. Compodoc already infers every input's TYPE and doc
  // comment, so this block exists only to give the union-typed and boolean
  // inputs a control a reader can actually drive — a select with the real
  // option list instead of a free-text box that accepts nonsense.
  argTypes: {
    brand: {
      control: 'inline-radio',
      options: [undefined, 'mybky', 'sampark'],
    },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:77924.
    // Harvested from input-group.stories.ts, where it was already recorded as a comment.
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-77924',
    },
  },
  component: BapsInputGroup,
  decorators: [
    moduleMetadata({ imports: [FormsModule, InputText, BapsInputNumber] }),
  ],
};

export default meta;

export const Default: StoryObj<BapsInputGroup> = {
  args: { prefix: 'min', suffix: 'day/s' },
  render: (args) => ({
    props: { ...args, days: 15 },
    template: `
      <div style="width:168px">
        <baps-input-group [prefix]="prefix" [suffix]="suffix" [brand]="brand">
          <input pInputText type="number" aria-label="Minimum days" [(ngModel)]="days" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** Trailing addon only — the Week and Time instances (node 17512:78172). */
export const SuffixOnly: StoryObj<BapsInputGroup> = {
  render: () => ({
    props: { weeks: 2 },
    template: `
      <div style="width:168px">
        <baps-input-group suffix="week/s">
          <input pInputText type="number" aria-label="Weeks" [(ngModel)]="weeks" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** Rich content slots for icons, controls, or styled text. Slots win over strings. */
export const ProjectedAddons: StoryObj<BapsInputGroup> = {
  render: () => ({
    props: { query: '' },
    template: `
      <baps-input-group prefix="Unused fallback" suffix="Unused fallback">
        <i input-group-prefix class="pi pi-search" aria-hidden="true"></i>
        <input pInputText aria-label="Member search" [(ngModel)]="query" />
        <span input-group-suffix>name</span>
      </baps-input-group>
    `,
  }),
};

export const ProjectedPrecedenceInteraction: StoryObj<BapsInputGroup> = {
  name: 'Interaction — projected addon precedence',
  render: () => ({
    props: { query: '' },
    template: `
      <baps-input-group prefix="Unused fallback" suffix="Unused fallback">
        <i input-group-prefix class="pi pi-search" aria-hidden="true"></i>
        <input pInputText aria-label="Member search" [(ngModel)]="query" />
        <span input-group-suffix>name</span>
      </baps-input-group>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Member search' });
    const group = input.closest('baps-input-group');
    const prefix = group?.querySelector('.baps-input-group__addon--prefix');
    const suffix = group?.querySelector('.baps-input-group__addon--suffix');
    const prefixFallback = prefix?.querySelector(
      '.baps-input-group__addon-fallback',
    );
    const suffixFallback = suffix?.querySelector(
      '.baps-input-group__addon-fallback',
    );

    if (
      !(prefix instanceof HTMLElement) ||
      !(suffix instanceof HTMLElement) ||
      !(prefixFallback instanceof HTMLElement) ||
      !(suffixFallback instanceof HTMLElement)
    ) {
      throw new Error('InputGroup addon structure did not render');
    }

    await expect(prefix.querySelector('[input-group-prefix]')).toBeVisible();
    await expect(suffix.querySelector('[input-group-suffix]')).toBeVisible();
    await expect(getComputedStyle(prefixFallback).display).toBe('none');
    await expect(getComputedStyle(suffixFallback).display).toBe('none');
  },
};

/** The full Min / Max row from node 17512:82912. */
export const MinMaxRow: StoryObj<BapsInputGroup> = {
  render: () => ({
    props: { min: 1, max: 3 },
    template: `
      <div style="display:flex; gap:8px; align-items:center; width:476px">
        <span style="font:500 14px Inter; color:#595656; width:120px">For</span>
        <baps-input-group prefix="min" suffix="day/s" style="flex:1">
          <input pInputText type="number" aria-label="Minimum days" [(ngModel)]="min" />
        </baps-input-group>
        <baps-input-group prefix="max" suffix="day/s" style="flex:1">
          <input pInputText type="number" aria-label="Maximum days" [(ngModel)]="max" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** Both skins. */
export const Brands: StoryObj<BapsInputGroup> = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { a: 15, b: 15 },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; width:168px">
        <baps-input-group brand="sampark" prefix="min" suffix="day/s">
          <input pInputText type="number" aria-label="Sampark days" [(ngModel)]="a" />
        </baps-input-group>
        <baps-input-group brand="mybky" prefix="min" suffix="day/s">
          <input pInputText type="number" aria-label="MyBKY days" [(ngModel)]="b" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** Numeric stepper inside an input group (IGIN parity). Sampark only: the
 * integration rules are scoped to the Sampark brand, so MyBKY is unchanged. */
export const WithInputNumber: StoryObj<BapsInputGroup> = {
  render: () => ({
    props: { count: 10, locked: 60 },
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem; width:220px">
        <baps-input-group brand="sampark" prefix="min" suffix="days">
          <baps-input-number brand="sampark" [(ngModel)]="count" [showButtons]="true" [min]="1" [max]="100" />
        </baps-input-group>
        <baps-input-group brand="sampark" prefix="max" suffix="days">
          <baps-input-number brand="sampark" [(ngModel)]="locked" [showButtons]="false" [disabled]="true" />
        </baps-input-group>
      </div>
    `,
  }),
};

/** A bare PrimeNG p-inputgroup on a Sampark page (not baps-input-group): the
 * group draws no frame, so each input keeps its own 1px Mono/borders frame and
 * white fill, as on SPM dev (spm AT-093: Day/s, Min/Max). */
export const SamparkBarePInputGroup: StoryObj<BapsInputGroup> = {
  decorators: [moduleMetadata({ imports: [InputGroup, InputGroupAddon] })],
  render: () => ({
    props: { days: 1 },
    template: `
      <div class="baps-ds-sampark" style="width:166px">
        <p-inputgroup>
          <input pInputText type="number" aria-label="Days" [(ngModel)]="days" />
          <p-inputgroup-addon>Day/s</p-inputgroup-addon>
        </p-inputgroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Days');
    const s = getComputedStyle(input);
    await expect(s.borderTopWidth).toBe('1px');
    await expect(s.borderTopStyle).toBe('solid');
  },
};

/**
 * AT-080 control addons, as SPM dev's Template form: Set Reminder / Frequency
 * is [number | unit select] in a 166px column, At is [time | AM/PM button].
 * The control sits in the input-group-control slot: one ring, a hairline on
 * its inner edge, the addon tint and a 13px/500 label.
 */
export const SamparkControlAddons: StoryObj<BapsInputGroup> = {
  decorators: [moduleMetadata({ imports: [BapsSelect, BapsDatepicker] })],
  render: () => ({
    props: {
      every: 0,
      unit: 'd',
      units: [
        { id: 'd', name: 'Day/s' },
        { id: 'w', name: 'Week/s' },
        { id: 'm', name: 'Month/s' },
      ],
      time: null,
      period: 'AM',
    },
    template: `
      <div class="baps-ds-sampark" style="display: grid; gap: 16px; width: 166px">
        <baps-input-group brand="sampark">
          <baps-input-number [(ngModel)]="every" [showButtons]="false" [min]="0" brand="sampark"></baps-input-number>
          <baps-select input-group-control brand="sampark" [options]="units" optionLabel="name" optionValue="id" [(ngModel)]="unit" appendTo="body"></baps-select>
        </baps-input-group>
        <baps-input-group class="w-auto" brand="sampark">
          <baps-datepicker brand="sampark" [(ngModel)]="time" [timeOnly]="true" hourFormat="12" placeholder="Select time" appendTo="body"></baps-datepicker>
          <button input-group-control type="button" (click)="period = period === 'AM' ? 'PM' : 'AM'">{{ period }}</button>
        </baps-input-group>
      </div>
    `,
  }),
};
