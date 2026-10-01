import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { FormsModule } from '@angular/forms';
import { BapsInputText } from './directives/input-text.directive';
import { BapsTextarea } from './directives/textarea.directive';
import { BapsFloatLabel } from './float-label.component';
import { BapsIconField } from './icon-field.component';
import { BapsInputIcon } from './input-icon.component';
import { BapsMessage } from './message.component';

import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';

/**
 * Form Field — the text-input field pattern (label + control + helper/error)
 * using the BAPS wrapper components and directives (e.g. bapsInputText).
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
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
    mandatory: { control: 'boolean' },
    placeholder: { control: 'text' },
    showHint: { control: 'boolean' },
    hintText: { control: 'text' },
    pSize: { control: 'select', options: [undefined, 'small', 'large'] },
    variant: { control: 'radio', options: ['outlined', 'filled'] },
    invalid: { control: 'boolean' },
    warning: { control: 'boolean' },
    ghost: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fluid: { control: 'boolean' },
  },
  args: {
    label: 'Email',
    showLabel: true,
    mandatory: false,
    placeholder: 'you@baps.dev',
    showHint: true,
    hintText: "We'll never share your address.",
    pSize: undefined,
    variant: 'outlined',
    invalid: false,
    warning: false,
    ghost: false,
    disabled: false,
    fluid: false,
  },
  render: (args) => ({
    props: { ...args, value: '' },
    template: `
      <div style="display:flex; flex-direction:column; gap:6px; max-width:320px; font:14px/1.4 sans-serif;">
        @if (showLabel) {
          <label for="pg" style="color:var(--label-color, #2b2f32); font-weight:500;">
            {{ label }}@if (mandatory) {<span style="color:var(--red-500, #e24c4c); margin-left:2px;">*</span>}
          </label>
        }
        <input
          id="pg"
          bapsInputText
          [(ngModel)]="value"
          [pSize]="pSize"
          [variant]="variant"
          [invalid]="invalid"
          [disabled]="disabled"
          [fluid]="fluid"
          [class.p-inputtext-warning]="warning"
          [class.p-inputtext-ghost]="ghost"
          [placeholder]="placeholder"
        />
        @if (showHint) {
          <small style="color:var(--input-hint-color, #6f777d);">{{ hintText }}</small>
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find the input field by label
    const input = canvas.getByLabelText(/Email/i);
    
    // Verify keyboard focus
    await userEvent.tab();
    expect(input).toHaveFocus();
    
    // Click and change behavior
    await userEvent.type(input, 'test@baps.dev');
    expect(input).toHaveValue('test@baps.dev');
  },
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

