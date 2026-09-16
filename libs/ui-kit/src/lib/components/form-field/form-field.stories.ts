import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { BapsInputText } from './directives/input-text.directive';
import { BapsTextarea } from './directives/textarea.directive';
import { BapsFloatLabel } from './float-label.component';
import { BapsIconField } from './icon-field.component';
import { BapsInputIcon } from './input-icon.component';
import { BapsMessage } from './message.component';
import { BapsListbox, BapsListboxOption } from '../listbox/listbox.component';
import { BapsMenuItem } from '../menu-item/menu-item.component';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';

/**
 * Form Controls — the merged catalogue of the three selection/input primitives:
 *
 *   1. FormField — label + control + helper/error (bapsInputText, textarea, dropdowns)
 *   2. Listbox   — `baps-listbox` wrapper around p-listbox (single/multi select panels)
 *   3. Menu Item — `baps-menu-item`, the base selectable row used inside menus/listboxes
 *
 * All panels live under this single Storybook component entry. Listbox stories are
 * prefixed "Listbox —" and menu-item stories "Menu Item —" in the sidebar.
 */
const meta: Meta = {
  title: 'Components/Molecules/Input',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-form-form-controls.
  id: 'components-form-controls',
  parameters: {
    // Design tab — the Figma frame this component implements, node 13197:87722.
    // Harvested from form-field.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-87722' },
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts
  tags: ['ds:mybky', 'ds:sampark'],
  decorators: [
    moduleMetadata({
      imports: [
        BapsInputText,
        BapsTextarea,
        BapsFloatLabel,
        BapsIconField,
        BapsInputIcon,
        BapsMessage,
        BapsListbox,
        BapsMenuItem,
        FormsModule,
        SelectModule,
        MultiSelectModule,
        DatePickerModule,
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj;

/* ═══════════════════════════════════════════════════════════════════════
   1. FORM FIELD
   The text-input field pattern (label + control + helper/error) using the
   BAPS wrapper components and directives (e.g. bapsInputText).
   ═══════════════════════════════════════════════════════════════════════ */

export const Playground: Story = {
  argTypes: {
    pSize: { control: 'select', options: [undefined, 'small', 'large'] },
    variant: { control: 'radio', options: ['outlined', 'filled'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fluid: { control: 'boolean' },
  },
  args: {
    pSize: undefined,
    variant: 'outlined',
    invalid: false,
    disabled: false,
    fluid: false,
  },
  render: (args) => ({
    props: { ...args, value: '' },
    template: `
      <div style="display:flex; flex-direction:column; gap:6px; max-width:320px; font:14px/1.4 sans-serif;">
        <label for="pg" style="color:var(--label-color, #2b2f32); font-weight:500;">Email</label>
        <input
          id="pg"
          bapsInputText
          [(ngModel)]="value"
          [pSize]="pSize"
          [variant]="variant"
          [invalid]="invalid"
          [disabled]="disabled"
          [fluid]="fluid"
          placeholder="you@baps.dev"
        />
        <small style="color:var(--input-hint-color, #6f777d);">We'll never share your address.</small>
      </div>
    `,
  }),
};

/**
 * All field states from the MyBKY 1.5 Figma spec (Web Input Text — LIGHT),
 * styled by `libs/ui-kit/src/lib/styles/components/input/_input.scss`:
 * default/placeholder, filled, warning (`.p-inputtext-warning`), error
 * (`[invalid]` / ng-invalid ng-dirty), ghost (`.p-inputtext-ghost`) and
 * disabled. Hover and focus each field to see the 1.5px #9FADD9 border and
 * the 3px focus ring.
 */
export const States: Story = {
  render: () => ({
    props: {
      email: '',
      filledEmail: 'aditya@baps.dev',
      requiredEmail: '',
      updatedName: 'Changed value',
      ghostSearch: '',
      lockedId: 'locked value',
    },
    template: `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:560px;">
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f2-default">Default</label>
          <input id="f2-default" bapsInputText [(ngModel)]="email" placeholder="Placeholder" />
          <small class="input-hint">Hint text</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f2-filled">Filled</label>
          <input id="f2-filled" bapsInputText [(ngModel)]="filledEmail" />
          <small class="input-hint">Hint text</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f2-warning-updated">Warning / updated</label>
          <input id="f2-warning-updated" bapsInputText class="p-inputtext-warning" [(ngModel)]="updatedName" />
          <small class="input-hint">This value was changed</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f2-error">Error <span class="p-error">*</span></label>
          <input id="f2-error" bapsInputText [(ngModel)]="requiredEmail" [invalid]="true" placeholder="Required" />
          <small class="input-hint">Email is required</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f2-ghost">Ghost</label>
          <input id="f2-ghost" bapsInputText class="p-inputtext-ghost" [(ngModel)]="ghostSearch" placeholder="Hover me" />
          <small class="input-hint">Borderless until hover</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f2-disabled">Disabled</label>
          <input id="f2-disabled" bapsInputText [(ngModel)]="lockedId" [disabled]="true" />
          <small class="input-hint">Hint text</small>
        </div>
      </div>
    `,
  }),
};

/**
 * Two size steps beyond the default. Height is a function of the field's padding
 * (`formField.paddingY`) plus font line-height — MyBKY's default lands on ~36px.
 */
export const Sizes: Story = {
  render: () => ({
    props: { small: '', medium: '', large: '' },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; max-width:320px;">
        <input bapsInputText pSize="small" [(ngModel)]="small" placeholder="Small" />
        <input bapsInputText [(ngModel)]="medium" placeholder="Default" />
        <input bapsInputText pSize="large" [(ngModel)]="large" placeholder="Large" />
      </div>
    `,
  }),
};

/** Float label — the label sits as placeholder and floats up on focus/value. */
export const FloatLabelExample: Story = {
  name: 'Float Label',
  render: () => ({
    props: { value: '' },
    template: `
      <baps-floatlabel style="display:block; max-width:320px;">
        <input id="fl" bapsInputText [(ngModel)]="value" />
        <label for="fl">Full name</label>
      </baps-floatlabel>
    `,
  }),
};

/** Icon inside the field — leading search icon via `baps-iconfield`. */
export const WithIcon: Story = {
  render: () => ({
    props: { value: '' },
    template: `
      <baps-iconfield style="display:block; max-width:320px;">
        <baps-inputicon styleClass="pi pi-search" />
        <input bapsInputText [(ngModel)]="value" placeholder="Search events" />
      </baps-iconfield>
    `,
  }),
};

/* ═══════════════════════════════════════════════════════════════════════
   SAMPARK VARIANTS
   ═══════════════════════════════════════════════════════════════════════
   Sampark Portal input field skin — Figma "Web Input Text" component spec
   (LIGHT). Ported from spm-ui src/styles/_input.scss to PrimeNG v21 in
   `libs/ui-kit/src/lib/styles/components/input/_input-sampark.scss`.

   Key differences from the MyBKY states above:
   - 4px border-radius (NOT pill)
   - 32px default height (28px sm, 40px lg)
   - Border stays 1px in EVERY state (MyBKY thickens to 1.5px on hover/focus)
   - Focus ring is SOLID pale (#F2F1F0), not semi-transparent
   - Warm grey/brown tones instead of cool blue

   Wrapped in a `<div class="baps-ds-sampark">` so the Sampark CSS overrides
   activate without needing to switch the toolbar. This mirrors the per-instance
   `brand="sampark"` pattern used in the Avatar stories.
   ═══════════════════════════════════════════════════════════════════════ */

/**
 * Sampark Portal input states — default/placeholder, filled, warning, error,
 * ghost and disabled. Identical controls to the MyBKY "States" story above,
 * but rendered under the `.baps-ds-sampark` scope, which re-points the
 * `--input-*` CSS variables to the Sampark token set.
 *
 * Hover and focus each field to see the 1px #94928F border (stays 1px —
 * never thickens) and the solid #F2F1F0 focus ring.
 */
export const SamparkStates: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark States',
  render: () => ({
    props: {
      email: '',
      filledEmail: 'aditya@baps.dev',
      requiredEmail: '',
      updatedName: 'Changed value',
      ghostSearch: '',
      lockedId: 'locked value',
    },
    template: `
      <div class="baps-ds-sampark">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:560px;">
          <div class="field" style="display:flex; flex-direction:column;">
            <label for="f6-default">Default</label>
            <input id="f6-default" bapsInputText [(ngModel)]="email" placeholder="Placeholder" />
            <small class="input-hint">Hint text</small>
          </div>
          <div class="field" style="display:flex; flex-direction:column;">
            <label for="f6-filled">Filled</label>
            <input id="f6-filled" bapsInputText [(ngModel)]="filledEmail" />
            <small class="input-hint">Hint text</small>
          </div>
          <div class="field" style="display:flex; flex-direction:column;">
            <label for="f6-warning-updated">Warning / updated</label>
            <input id="f6-warning-updated" bapsInputText class="p-inputtext-warning" [(ngModel)]="updatedName" />
            <small class="input-hint">This value was changed</small>
          </div>
          <div class="field" style="display:flex; flex-direction:column;">
            <label for="f6-error">Error <span class="p-error">*</span></label>
            <input id="f6-error" bapsInputText [(ngModel)]="requiredEmail" [invalid]="true" placeholder="Required" />
            <small class="input-hint">Email is required</small>
          </div>
          <div class="field" style="display:flex; flex-direction:column;">
            <label for="f6-ghost">Ghost</label>
            <input id="f6-ghost" bapsInputText class="p-inputtext-ghost" [(ngModel)]="ghostSearch" placeholder="Hover me" />
            <small class="input-hint">Borderless until hover</small>
          </div>
          <div class="field" style="display:flex; flex-direction:column;">
            <label for="f6-disabled">Disabled</label>
            <input id="f6-disabled" bapsInputText [(ngModel)]="lockedId" [disabled]="true" />
            <small class="input-hint">Hint text</small>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Sampark size scale — sm 28px, default 32px, lg 40px. All three use the
 * 4px radius and 1px-only border. Height is driven by the
 * `--form-field-sampark-height-*` CSS variables set in _input-sampark.scss.
 */
export const SamparkSizes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark Sizes',
  render: () => ({
    props: { small: '', medium: '', large: '' },
    template: `
      <div class="baps-ds-sampark" style="display:flex; flex-direction:column; gap:12px; max-width:320px;">
        <input bapsInputText pSize="small" [(ngModel)]="small" placeholder="Small (28px)" />
        <input bapsInputText [(ngModel)]="medium" placeholder="Default (32px)" />
        <input bapsInputText pSize="large" [(ngModel)]="large" placeholder="Large (40px)" />
      </div>
    `,
  }),
};

/**
 * Sampark float label — same floating-label mechanic, rendered in the
 * Sampark skin (4px radius, 32px height, warm grey border).
 */
export const SamparkFloatLabel: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark Float Label',
  render: () => ({
    props: { value: '' },
    template: `
      <div class="baps-ds-sampark" style="display:block; max-width:320px;">
        <baps-floatlabel>
          <input id="fl-spm" bapsInputText [(ngModel)]="value" />
          <label for="fl-spm">Full name</label>
        </baps-floatlabel>
      </div>
    `,
  }),
};

/**
 * Sampark icon field — leading search icon inside the Sampark-skinned input
 * (4px radius, 32px height). Left padding for the icon is adjusted to 8px
 * by _input-sampark.scss.
 */
export const SamparkWithIcon: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark With Icon',
  render: () => ({
    props: { value: '' },
    template: `
      <div class="baps-ds-sampark" style="display:block; max-width:320px;">
        <baps-iconfield>
          <baps-inputicon styleClass="pi pi-search" />
          <input bapsInputText [(ngModel)]="value" placeholder="Search events" />
        </baps-iconfield>
      </div>
    `,
  }),
};

/** Multi-line text entry via the `bapsTextarea` directive (PrimeNG Textarea). */
export const TextareaExample: Story = {
  name: 'Textarea',
  render: () => ({
    props: { value: '' },
    template: `
      <div style="display:flex; flex-direction:column; gap:6px; max-width:420px;">
        <label for="ta">Message</label>
        <textarea id="ta" bapsTextarea [(ngModel)]="value" rows="5" placeholder="Write your message"></textarea>
        <small class="input-hint">Hint text</small>
      </div>
    `,
  }),
};

/**
 * Sampark Portal textarea states — Figma "Web Input Text Area"
 * (node 13197:87722): placeholder, filled, error and disabled. Skinned by
 * the TEXTAREA block of _input-sampark.scss (4px radius, 1px-only border,
 * solid focus rings), same `--input-*` token flow as the inputs above.
 */
export const SamparkTextarea: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark Textarea',
  render: () => ({
    props: {
      message: '',
      filledMessage: 'Jai Swaminarayan. Requesting an update to my mandal record.',
      requiredMessage: '',
      lockedMessage: 'locked value',
    },
    template: `
      <div class="baps-ds-sampark" style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:900px;">
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f11-default">Default</label>
          <textarea id="f11-default" bapsTextarea [(ngModel)]="message" rows="5" placeholder="Placeholder"></textarea>
          <small class="input-hint">Hint text</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f11-filled">Filled</label>
          <textarea id="f11-filled" bapsTextarea [(ngModel)]="filledMessage" rows="5"></textarea>
          <small class="input-hint">Hint text</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f11-error">Error <span class="p-error">*</span></label>
          <textarea id="f11-error" bapsTextarea [(ngModel)]="requiredMessage" rows="5" [invalid]="true" placeholder="Required"></textarea>
          <small class="input-hint">Message is required</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="f11-disabled">Disabled</label>
          <textarea id="f11-disabled" bapsTextarea [(ngModel)]="lockedMessage" rows="5" [disabled]="true"></textarea>
          <small class="input-hint">Hint text</small>
        </div>
      </div>
    `,
  }),
};

/**
 * Dropdowns in the default MyBKY design system skin.
 */
export const Dropdowns: Story = {
  name: 'Dropdowns (MyBKY)',
  render: () => ({
    props: {
      cities: [
        { label: 'New York', value: 'NY' },
        { label: 'Rome', value: 'RM' },
        { label: 'London', value: 'LDN' },
        { label: 'Istanbul', value: 'IST' },
        { label: 'Paris', value: 'PRS' },
      ],
      selectedCity: null,
      selectedCities: [],
      selectedDate: null,
      disabledCity: 'NY',
    },
    template: `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:560px;">
        <div class="field" style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:500;">Default Dropdown</label>
          <p-select appendTo="body" [checkmark]="true" [options]="cities" [(ngModel)]="selectedCity" optionLabel="label" optionValue="value" placeholder="Select City"></p-select>
        </div>
        <div class="field" style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:500;">MultiSelect</label>
          <p-multiselect appendTo="body" [options]="cities" [(ngModel)]="selectedCities" optionLabel="label" optionValue="value" placeholder="Select Cities" display="chip"></p-multiselect>
        </div>
        <div class="field" style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:500;">DatePicker</label>
          <p-datepicker appendTo="body" [(ngModel)]="selectedDate" [showIcon]="true" placeholder="Select Date"></p-datepicker>
        </div>
        <div class="field" style="display:flex; flex-direction:column; gap:6px;">
          <label style="font-weight:500;">Disabled Dropdown</label>
          <p-select appendTo="body" [checkmark]="true" [options]="cities" [(ngModel)]="disabledCity" optionLabel="label" optionValue="value" [disabled]="true"></p-select>
        </div>
      </div>
    `,
  }),
};

/**
 * Dropdowns in the Sampark Portal design system skin (4px radius, 32px height, warm grey palette).
 */
export const SamparkDropdowns: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark Dropdowns',
  render: () => ({
    props: {
      cities: [
        { label: 'New York', value: 'NY' },
        { label: 'Rome', value: 'RM' },
        { label: 'London', value: 'LDN' },
        { label: 'Istanbul', value: 'IST' },
        { label: 'Paris', value: 'PRS' },
      ],
      selectedCity: null,
      selectedCities: [],
      selectedDate: null,
      disabledCity: 'NY',
      warningCity: 'RM',
      invalidCity: null,
    },
    template: `
      <div class="baps-ds-sampark">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:560px;">
          <div class="field" style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-weight:500;">Default Dropdown</label>
            <p-select appendTo="body" [checkmark]="true" [options]="cities" [(ngModel)]="selectedCity" optionLabel="label" optionValue="value" placeholder="Select City"></p-select>
          </div>
          <div class="field" style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-weight:500;">MultiSelect</label>
            <p-multiselect appendTo="body" [options]="cities" [(ngModel)]="selectedCities" optionLabel="label" optionValue="value" placeholder="Select Cities" display="chip"></p-multiselect>
          </div>
          <div class="field" style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-weight:500;">DatePicker</label>
            <p-datepicker appendTo="body" [(ngModel)]="selectedDate" [showIcon]="true" placeholder="Select Date"></p-datepicker>
          </div>
          <div class="field" style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-weight:500;">Disabled Dropdown</label>
            <p-select appendTo="body" [checkmark]="true" [options]="cities" [(ngModel)]="disabledCity" optionLabel="label" optionValue="value" [disabled]="true"></p-select>
          </div>
          <div class="field" style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-weight:500;">Warning Dropdown</label>
            <p-select appendTo="body" class="p-inputtext-warning" [checkmark]="true" [options]="cities" [(ngModel)]="warningCity" optionLabel="label" optionValue="value"></p-select>
          </div>
          <div class="field" style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-weight:500;">Invalid Dropdown</label>
            <p-select appendTo="body" [invalid]="true" [options]="cities" [(ngModel)]="invalidCity" optionLabel="label" optionValue="value" placeholder="Required"></p-select>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Sampark dropdown size scale (28px small, 32px default, 40px large).
 */
export const SamparkDropdownSizes: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  name: 'Sampark Dropdown Sizes',
  render: () => ({
    props: {
      cities: [
        { label: 'New York', value: 'NY' },
        { label: 'Rome', value: 'RM' },
        { label: 'London', value: 'LDN' },
      ],
      small: null,
      medium: null,
      large: null,
    },
    template: `
      <div class="baps-ds-sampark" style="display:flex; flex-direction:column; gap:12px; max-width:320px;">
        <p-select appendTo="body" class="p-select-sm" [checkmark]="true" [options]="cities" [(ngModel)]="small" optionLabel="label" optionValue="value" placeholder="Small (28px)"></p-select>
        <p-select appendTo="body" [checkmark]="true" [options]="cities" [(ngModel)]="medium" optionLabel="label" optionValue="value" placeholder="Default (32px)"></p-select>
        <p-select appendTo="body" class="p-select-lg" [checkmark]="true" [options]="cities" [(ngModel)]="large" optionLabel="label" optionValue="value" placeholder="Large (40px)"></p-select>
      </div>
    `,
  }),
};

/* ═══════════════════════════════════════════════════════════════════════
   2. LISTBOX
   `baps-listbox` — standalone wrapper around p-listbox. Single/multi
   selection panels, filtering, groups, rich menu-item templates.
   ═══════════════════════════════════════════════════════════════════════ */

const listboxArgTypes = {
  brand: { control: 'select' as const, options: ['mybky', 'sampark'] },
  multiple: { control: 'boolean' as const },
  checkbox: { control: 'boolean' as const },
  filter: { control: 'boolean' as const },
  disabled: { control: 'boolean' as const },
  readonly: { control: 'boolean' as const },
};

const listboxBaseArgs = {
  brand: 'mybky',
  multiple: false,
  checkbox: false,
  filter: false,
  disabled: false,
  readonly: false,
};

const basicOptions: BapsListboxOption[] = [
  { label: 'John F. Kennedy', value: 'JFK' },
  { label: 'Heathrow', value: 'LHR' },
  { label: 'Charles de Gaulle', value: 'CDG' },
  { label: 'Frankfurt', value: 'FRA' },
  { label: 'Schiphol', value: 'AMS' },
  { label: 'Istanbul', value: 'IST' },
  { label: 'Dubai', value: 'DXB' },
  { label: 'Changi', value: 'SIN' },
  { label: 'Haneda', value: 'HND' },
];

export const ListboxPlayground: Story = {
  name: 'Listbox — Playground',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [filter]="filter"
          [disabled]="disabled"
          [readonly]="readonly"
          [brand]="brand"
          [(ngModel)]="value"
        ></baps-listbox>
        <div style="margin-top: 16px; font-size: 13px; color: var(--color-sampark-text-secondary, #595656)">
          Selected Value: {{ value | json }}
        </div>
      </div>
    `,
  }),
};

export const MultiSelectWithCheckboxes: Story = {
  name: 'Listbox — Multi Select With Checkboxes',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
    multiple: true,
    checkbox: true,
  },
  render: (args) => ({
    props: {
      ...args,
      value: ['JFK', 'LHR'],
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [filter]="filter"
          [disabled]="disabled"
          [readonly]="readonly"
          [brand]="brand"
          [(ngModel)]="value"
        ></baps-listbox>
        <div style="margin-top: 16px; font-size: 13px; color: var(--color-sampark-text-secondary, #595656)">
          Selected Values: {{ value | json }}
        </div>
      </div>
    `,
  }),
};

export const WithFiltering: Story = {
  name: 'Listbox — With Filtering',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
    filter: true,
    filterPlaceholder: 'Search airports...',
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [filter]="filter"
          [filterPlaceholder]="filterPlaceholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [brand]="brand"
          [(ngModel)]="value"
        ></baps-listbox>
      </div>
    `,
  }),
};

export const Grouped: Story = {
  name: 'Listbox — Grouped',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    group: true,
    optionGroupLabel: 'label',
    optionGroupChildren: 'items',
    options: [
      {
        label: 'USA',
        code: 'US',
        items: [
          { label: 'Chicago', value: 'ORD' },
          { label: 'Los Angeles', value: 'LAX' },
          { label: 'New York', value: 'JFK' },
          { label: 'San Francisco', value: 'SFO' },
        ],
      },
      {
        label: 'Japan',
        code: 'JP',
        items: [
          { label: 'Tokyo Haneda', value: 'HND' },
          { label: 'Tokyo Narita', value: 'NRT' },
          { label: 'Osaka', value: 'KIX' },
        ],
      },
    ],
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [options]="options"
          [group]="group"
          [optionGroupLabel]="optionGroupLabel"
          [optionGroupChildren]="optionGroupChildren"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [disabled]="disabled"
          [readonly]="readonly"
          [brand]="brand"
          [(ngModel)]="value"
        ></baps-listbox>
      </div>
    `,
  }),
};

export const RichTemplatePanelList: Story = {
  name: 'Listbox — Rich Template Panel List',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: [
      {
        title: 'Ghanshyam Pandey',
        subtitle: 'Nation Leader',
        avatarLabel: 'GP',
        value: 'user1',
      },
      {
        title: 'Nilesh Patel',
        subtitle: 'Regional Admin',
        avatarLabel: 'NP',
        value: 'user2',
      },
      {
        title: 'Vimal Shah',
        subtitle: 'Satsang Coordinator',
        avatarLabel: 'VS',
        value: 'user3',
        disabled: true,
      },
      {
        title: 'Sanjay Sharma',
        subtitle: 'Donation Auditor',
        avatarLabel: 'SS',
        value: 'user4',
      },
      {
        title: 'Anish Mehta',
        subtitle: 'Event Volunteer',
        avatarIcon: 'pi-user',
        value: 'user5',
      },
    ],
  },
  render: (args) => ({
    props: {
      ...args,
      value: 'user1',
    },
    template: `
      <div style="max-width: 340px;">
        <h4 style="margin: 0 0 12px 0; font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: var(--color-sampark-text-primary, #151414);">Select User Role</h4>
        <baps-listbox
          [options]="options"
          [multiple]="multiple"
          [checkbox]="checkbox"
          [disabled]="disabled"
          [readonly]="readonly"
          [brand]="brand"
          [(ngModel)]="value"
        ></baps-listbox>
        <div style="margin-top: 16px; font-size: 13px; color: var(--color-sampark-text-secondary, #595656)">
          Selected User: {{ value }}
        </div>
      </div>
    `,
  }),
};

export const CustomTemplatesUsingPTemplate: Story = {
  name: 'Listbox — Custom Templates Using P Template',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    options: basicOptions,
    optionLabel: 'label',
    optionValue: 'value',
  },
  render: (args) => ({
    props: {
      ...args,
      value: undefined,
    },
    template: `
      <div style="max-width: 320px;">
        <baps-listbox
          [options]="options"
          [optionLabel]="optionLabel"
          [optionValue]="optionValue"
          [brand]="brand"
          [(ngModel)]="value"
        >
          <ng-template pTemplate="item" let-option>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="pi pi-compass" style="color: var(--color-sampark-primary-default, #c96868);"></i>
              <span style="font-weight: 500;">{{ option.label }}</span>
              <span style="font-size: 12px; color: var(--color-sampark-text-muted, #9f9c9c);">({{ option.value }})</span>
            </div>
          </ng-template>
        </baps-listbox>
      </div>
    `,
  }),
};

export const DisabledAndInvalid: Story = {
  name: 'Listbox — Disabled And Invalid',
  argTypes: listboxArgTypes,
  args: {
    ...listboxBaseArgs,
    // Four options with the DISABLED one in the middle, so "some disabled
    // options" reads as a mixed list rather than a two-row edge case — the
    // disabled row has to sit between enabled ones to show it is skipped.
    // Restored from the pre-existing visual baseline, which renders A/B/C/D.
    options: [
      { label: 'Active Option A', value: 'A' },
      { label: 'Active Option B', value: 'B' },
      { label: 'Disabled Option C', value: 'C', disabled: true },
      { label: 'Active Option D', value: 'D' },
    ],
    optionLabel: 'label',
    optionValue: 'value',
    optionDisabled: 'disabled',
  },
  render: (args) => ({
    props: {
      ...args,
      value: 'A',
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 320px;">
        <div>
          <h4 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: var(--color-sampark-text-secondary, #595656);">Some Disabled Options</h4>
          <baps-listbox
            [options]="options"
            [optionLabel]="optionLabel"
            [optionValue]="optionValue"
            [optionDisabled]="optionDisabled"
            [brand]="brand"
            [(ngModel)]="value"
          ></baps-listbox>
        </div>

        <div>
          <h4 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: var(--color-sampark-text-secondary, #595656);">Entire Listbox Disabled</h4>
          <baps-listbox
            [options]="options"
            [optionLabel]="optionLabel"
            [optionValue]="optionValue"
            [disabled]="true"
            [brand]="brand"
            [(ngModel)]="value"
          ></baps-listbox>
        </div>

        <div>
          <h4 style="margin: 0 0 8px 0; font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: var(--color-sampark-text-secondary, #595656);">Readonly Listbox</h4>
          <baps-listbox
            [options]="options"
            [optionLabel]="optionLabel"
            [optionValue]="optionValue"
            [readonly]="true"
            [brand]="brand"
            [(ngModel)]="value"
          ></baps-listbox>
        </div>
      </div>
    `,
  }),
};

/* ═══════════════════════════════════════════════════════════════════════
   3. MENU ITEM
   Base Menu Item — Sampark Portal (Figma nodes 13197-87952 / 13197-88988).
   A selectable list/menu row: optional control (checkbox/radio) + optional
   media (glyph icon or avatar box) + one- or two-line label, with a left
   accent bar on the selected row and a danger (red) variant.
   ═══════════════════════════════════════════════════════════════════════ */

export const MenuItemPlayground: Story = {
  name: 'Menu Item — Playground',
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    control: {
      control: 'inline-radio',
      options: ['none', 'checkbox', 'radio'],
    },
    media: { control: 'inline-radio', options: ['none', 'icon', 'avatar'] },
    icon: { control: 'text' },
    avatarLabel: { control: 'text' },
    avatarIcon: { control: 'text' },
    severity: { control: 'inline-radio', options: ['default', 'danger'] },
    checked: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    title: 'Option',
    control: 'none',
    media: 'none',
    severity: 'default',
    checked: false,
    selected: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:300px; border:1px solid var(--color-sampark-border-default,#e1e0e0); border-radius:8px; overflow:hidden;">
        <baps-menu-item
          [title]="title" [subtitle]="subtitle"
          [control]="control" [checked]="checked"
          [media]="media" [icon]="icon" [avatarLabel]="avatarLabel" [avatarIcon]="avatarIcon"
          [severity]="severity" [selected]="selected" [disabled]="disabled"
        ></baps-menu-item>
      </div>
    `,
  }),
};

/**
 * All menu views on one page — the complete Base Menu Item catalogue:
 *   1. Simple rows: leading none / alert icon / checkbox / radio × states.
 *   2. User rows: avatar (initials / icon) + two-line label, optional control.
 *   3. Selection: checkbox / radio checked states.
 */
const menuItemMatrix = (brand: 'mybky' | 'sampark') => ({
  props: {
    brand,
    simpleCols: [
      { control: 'none', media: 'none' },
      { control: 'none', media: 'icon' },
      { control: 'checkbox', media: 'none' },
      { control: 'radio', media: 'none' },
    ],
    simpleRows: [
      { severity: 'default', selected: false, disabled: false },
      { severity: 'default', selected: true, disabled: false },
      { severity: 'danger', selected: false, disabled: false },
      { severity: 'danger', selected: true, disabled: false },
      { severity: 'default', selected: false, disabled: true },
    ],
    userCols: [
      { control: 'none' },
      { control: 'checkbox' },
      { control: 'radio' },
    ],
    userMedias: [
      { avatarLabel: 'GP', avatarIcon: undefined },
      { avatarLabel: undefined, avatarIcon: 'pi-envelope' },
    ],
    userRows: [
      { selected: false, disabled: false },
      { selected: true, disabled: false },
      { selected: false, disabled: true },
    ],
  },
  template: `
      <style>
        .mi-section { margin-bottom: 40px; }
        .mi-heading { font: 600 13px/1.3 Inter, sans-serif; letter-spacing: .06em; text-transform: uppercase;
          opacity: .6; margin: 0 0 16px; }
      </style>

      <section class="mi-section">
        <p class="mi-heading">Simple — icon / checkbox / radio</p>
        <div style="display:grid; grid-template-columns:repeat(4, 240px); gap:24px;">
          @for (col of simpleCols; track $index) {
            <div style="display:flex; flex-direction:column; gap:16px;">
              @for (row of simpleRows; track $index) {
                <baps-menu-item title="Option" [brand]="brand"
                  [control]="col.control" [media]="col.media"
                  [severity]="row.severity" [selected]="row.selected" [disabled]="row.disabled"
                ></baps-menu-item>
              }
            </div>
          }
        </div>
      </section>

      <section class="mi-section">
        <p class="mi-heading">User — avatar + name / role</p>
        <div style="display:grid; grid-template-columns:repeat(3, 300px); gap:24px;">
          @for (col of userCols; track $index) {
            <div style="display:flex; flex-direction:column; gap:8px;">
              @for (media of userMedias; track $index) {
                @for (row of userRows; track $index) {
                  <baps-menu-item [brand]="brand"
                    media="avatar" [avatarLabel]="media.avatarLabel" [avatarIcon]="media.avatarIcon"
                    title="Ghanshyam Pandey" subtitle="Nation Leader"
                    [control]="col.control" [selected]="row.selected" [disabled]="row.disabled"
                  ></baps-menu-item>
                }
              }
            </div>
          }
        </div>
      </section>

      <section class="mi-section">
        <p class="mi-heading">Selection — checked states</p>
        <div style="display:flex; flex-direction:column; gap:8px; width:300px;">
          <baps-menu-item [brand]="brand" control="checkbox" title="Unchecked option"></baps-menu-item>
          <baps-menu-item [brand]="brand" control="checkbox" title="Checked option" [checked]="true" [selected]="true"></baps-menu-item>
          <baps-menu-item [brand]="brand" control="radio" title="Unselected option"></baps-menu-item>
          <baps-menu-item [brand]="brand" control="radio" title="Selected option" [checked]="true" [selected]="true"></baps-menu-item>
        </div>
      </section>
    `,
});

export const AllVariants: Story = {
  // Sampark-only, and not obviously so: the brand is an ARGUMENT to
  // menuItemMatrix, not a `brand=` attribute or a story arg, so neither the
  // pin scans nor the docs scan saw it. The name does not say Sampark either.
  // Tagged so the sidebar hides it under MyBKY, the same as every other
  // single-brand story.
  tags: ['!ds:mybky'],
  name: 'Menu Item — All Variants',
  parameters: { controls: { disable: true } },
  render: () => menuItemMatrix('sampark'),
};

/** The same catalogue under the MyBKY (BKY events) palette. */
export const AllVariantsMyBKY: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  name: 'Menu Item — All Variants (MyBKY)',
  parameters: { controls: { disable: true } },
  render: () => menuItemMatrix('mybky'),
};
