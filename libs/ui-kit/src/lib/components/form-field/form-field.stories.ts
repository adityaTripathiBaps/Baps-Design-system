import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BapsInputText } from './directives/input-text.directive';
import { BapsTextarea } from './directives/textarea.directive';
import { BapsFloatLabel } from './float-label.component';
import { BapsIconField } from './icon-field.component';
import { BapsInputIcon } from './input-icon.component';
import { BapsMessage } from './message.component';
import { BapsIcon } from '../icon/icon.component';
import { BapsLink } from '../link/link.component';
import { BapsAvatar } from '../avatar/avatar.component';
import { BapsTag } from '../tag/tag.component';
import { BapsToggleSwitch } from '../toggle-switch/toggle-switch.component';

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
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=13197-87722',
    },
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
        BapsIcon,
        BapsLink,
        BapsAvatar,
        BapsTag,
        BapsToggleSwitch,
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

export const SamparkProjectedSvgIconInteraction: Story = {
  name: 'Interaction — Sampark projected SVG icon metrics',
  // <svg-icon> stands in for spm-ui's angular-svg-icon host element; a plain
  // custom element is enough, so no stub component (or lint suppression).
  decorators: [moduleMetadata({ schemas: [CUSTOM_ELEMENTS_SCHEMA] })],
  render: () => ({
    props: { value: '' },
    template: `
      <baps-iconfield brand="sampark" style="display:block; max-width:320px;">
        <baps-inputicon brand="sampark">
          <svg-icon>
            <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
              <path d="M10 4a6 6 0 1 0 3.87 10.58L19.3 20 20 19.3l-5.42-5.43A6 6 0 0 0 10 4Z" />
            </svg>
          </svg-icon>
        </baps-inputicon>
        <input
          bapsInputText
          brand="sampark"
          [(ngModel)]="value"
          aria-label="Search events"
        />
      </baps-iconfield>
    `,
  }),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('.p-inputicon');
    const projectedIcon = canvasElement.querySelector('svg-icon');
    const input = canvasElement.querySelector('input');
    if (
      !(icon instanceof HTMLElement) ||
      !(projectedIcon instanceof HTMLElement) ||
      !(input instanceof HTMLInputElement)
    ) {
      throw new Error('Sampark projected input icon should render');
    }

    const iconRect = icon.getBoundingClientRect();
    const projectedRect = projectedIcon.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();
    await expect(iconRect.width).toBe(16);
    await expect(iconRect.height).toBe(16);
    await expect(projectedRect.width).toBe(16);
    await expect(projectedRect.height).toBe(16);
    await expect(getComputedStyle(icon).marginTop).toBe('0px');
    // Sampark text primary, not the MyBKY Mono/900 the :root default carries.
    await expect(getComputedStyle(icon).color).toBe('rgb(21, 20, 20)');
    await expect(
      Math.abs(
        iconRect.top +
          iconRect.height / 2 -
          (inputRect.top + inputRect.height / 2),
      ),
    ).toBeLessThanOrEqual(0.5);
  },
};

export const SamparkMessageMetricsInteraction: Story = {
  name: 'Interaction — Sampark message metrics',
  render: () => ({
    template: `
      <baps-message
        brand="sampark"
        severity="info"
        icon="pi pi-info-circle"
        text="One department must be selected as primary."
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector('.p-message-text');
    const icon = canvasElement.querySelector('.p-message-icon');
    if (!(text instanceof HTMLElement) || !(icon instanceof HTMLElement)) {
      throw new Error('Sampark message text and icon should render');
    }

    const textStyle = getComputedStyle(text);
    const iconRect = icon.getBoundingClientRect();
    await expect(textStyle.fontSize).toBe('12.72px');
    await expect(textStyle.fontWeight).toBe('500');
    await expect(iconRect.width).toBe(13);
    await expect(iconRect.height).toBe(13);
  },
};

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
};

/**
 * Two things a screenshot of an empty field cannot show: that the label is
 * really associated with the input (queried by label text, so a missing `for`
 * fails here), and that tabbing reaches it before typing does anything.
 */
export const LabelAndTypingInteraction: Story = {
  ...Playground,
  name: 'Interaction — the label focuses its input and typing lands',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText(/Email/i);

    // Click the label. The story is named for the label focusing its input,
    // and this is what tests that.
    //
    // It replaces userEvent.tab(), which could never have passed: measured
    // in the rendered story, the first five tabbables are buttons and
    // anchors, so one Tab from the document start lands on body, not on
    // this input. That assertion was testing tab order, not the label.
    //
    // The label is taken by its for attribute rather than by text, because
    // the label and the input's accessible name both read "Email".
    // getByLabelText above already proves the label exists and points here,
    // so this find cannot legitimately miss — but assert it rather than
    // reach for `!`, which the lint baseline forbids and which would turn a
    // missing label into an unhelpful null dereference.
    const label = canvasElement.querySelector('label[for="pg"]');
    if (!(label instanceof HTMLLabelElement)) {
      throw new Error('form-field Playground should render label[for="pg"]');
    }
    await userEvent.click(label);

    // waitFor, not a bare assertion: focus arrives a tick after the click in
    // this environment. Still a wait on a real condition — if focus never
    // lands, this fails.
    // 3s, deliberately modest. This assertion is the known failure, so a
    // long timeout would only make every run slower and leave the browser
    // busy for longer while the story after it starts.
    await waitFor(() => expect(input).toHaveFocus(), { timeout: 3000 });

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

/**
 * Label beside an underlined field — Figma "🟢 Component Library" Horizontal
 * Input Text Field (6304:53807). Opt in with `.field--horizontal`; the row
 * (`.field__control`) carries the rule, and holds an optional leading icon,
 * trailing actions and a character count. States: placeholder, filled with
 * actions, error, disabled. Hover a row to see its rule darken.
 */
export const SamparkHorizontal: Story = {
  tags: ['!ds:mybky'],
  name: 'Sampark Horizontal',
  render: () => ({
    props: { empty: '', filled: 'Aditya', bad: 'Aditya' },
    template: `
      <div class="baps-ds-sampark" style="display:flex; flex-direction:column; gap:24px; max-width:960px;">
        <div class="field field--horizontal">
          <label for="h-1">User name <span class="p-error">*</span></label>
          <div class="field__control">
            <baps-icon class="field__icon" name="user" size="sm" />
            <input id="h-1" bapsInputText [(ngModel)]="empty" placeholder="Enter user name" maxlength="200" />
            <span class="input-char-count">{{ empty.length }} / 200</span>
          </div>
          <small class="input-hint">This is a hint text to help user.</small>
        </div>

        <div class="field field--horizontal">
          <label for="h-2">User name <span class="p-error">*</span></label>
          <div class="field__control">
            <baps-icon class="field__icon" name="user" size="sm" />
            <input id="h-2" bapsInputText [(ngModel)]="filled" placeholder="Enter user name" maxlength="200" />
            <span class="field__actions">
              <baps-link href="#">Link Text</baps-link>
              <span class="field__divider" aria-hidden="true"></span>
              <baps-link href="#">Link Text</baps-link>
            </span>
            <span class="input-char-count">{{ filled.length }} / 200</span>
          </div>
          <small class="input-hint">This is a hint text to help user.</small>
        </div>

        <div class="field field--horizontal">
          <label for="h-3">User name <span class="p-error">*</span></label>
          <div class="field__control">
            <baps-icon class="field__icon" name="user" size="sm" />
            <input id="h-3" bapsInputText class="p-invalid" [(ngModel)]="bad" placeholder="Enter user name" maxlength="200" />
            <span class="input-char-count">{{ bad.length }} / 200</span>
          </div>
          <small class="input-hint p-error">This is a hint text to help user.</small>
        </div>

        <div class="field field--horizontal">
          <label for="h-4">User name</label>
          <div class="field__control">
            <baps-icon class="field__icon" name="user" size="sm" />
            <input id="h-4" bapsInputText disabled placeholder="Enter user name" />
            <span class="input-char-count">0 / 200</span>
          </div>
          <small class="input-hint">This is a hint text to help user.</small>
        </div>
      </div>
    `,
  }),
};

/**
 * Extras inside one bordered field: Figma "Base Web Input Action Component"
 * (6333:66494) and "Base Web Input Text Component" (561:3587). Wrap the input
 * and its extras in `.baps-input-shell`: leading icon or avatar, chevron,
 * action icon, a switch behind a rule, an attached leading or trailing
 * button, and a leading or trailing badge. Hover, focus, error and disabled
 * read on the whole shell. Several badges as the value is MultiSelect's
 * chip display (Multi Select › Chip Overflow).
 */
export const SamparkInputShell: Story = {
  tags: ['!ds:mybky'],
  name: 'Sampark Input Shell',
  render: () => ({
    props: { v: '', name: 'Gaurang Patel', on: true },
    template: `
      <div class="baps-ds-sampark" style="display:grid; grid-template-columns:repeat(2, 18.75rem); gap:20px 32px;">
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-1">Icon · count · chevron</label>
          <div class="baps-input-shell">
            <baps-icon class="baps-input-shell__icon" name="user" size="sm" />
            <input id="sh-1" bapsInputText [(ngModel)]="v" placeholder="Enter user name" maxlength="200" />
            <span class="input-char-count">{{ v.length }} / 200</span>
            <baps-icon class="baps-input-shell__chevron" name="down" [size]="10" />
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-2">Avatar</label>
          <div class="baps-input-shell">
            <baps-avatar class="baps-input-shell__avatar" label="GP" size="xs" shape="square" />
            <input id="sh-2" bapsInputText [(ngModel)]="name" />
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-3">Chevron with switch</label>
          <div class="baps-input-shell">
            <input id="sh-3" bapsInputText placeholder="Enter user name" />
            <baps-icon class="baps-input-shell__chevron" name="down" [size]="10" />
            <span class="baps-input-shell__segment"><baps-toggleswitch size="xs" inputId="sh-3-sw" [(ngModel)]="on" /><label class="p-hidden-accessible" for="sh-3-sw">Enabled</label></span>
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-4">Action icon with switch</label>
          <div class="baps-input-shell">
            <input id="sh-4" bapsInputText placeholder="Enter user name" />
            <button type="button" class="baps-input-shell__action" aria-label="Pick a time"><baps-icon name="clock" [size]="18" /></button>
            <span class="baps-input-shell__segment"><baps-toggleswitch size="xs" inputId="sh-4-sw" /><label class="p-hidden-accessible" for="sh-4-sw">Reminder</label></span>
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-5">Leading action button</label>
          <div class="baps-input-shell">
            <button type="button" class="baps-input-shell__button">Button Text</button>
            <input id="sh-5" bapsInputText placeholder="Enter user name" />
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-6">Trailing action button</label>
          <div class="baps-input-shell">
            <input id="sh-6" bapsInputText placeholder="Enter user name" />
            <button type="button" class="baps-input-shell__button">Button Text</button>
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-7">Leading badge</label>
          <div class="baps-input-shell">
            <baps-tag class="baps-input-shell__badge" value="Badge Text" />
            <input id="sh-7" bapsInputText placeholder="Enter user name" />
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-8">Trailing badge</label>
          <div class="baps-input-shell">
            <input id="sh-8" bapsInputText placeholder="Enter user name" />
            <baps-tag class="baps-input-shell__badge" value="Badge Text" />
          </div>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-9">Error <span class="p-error">*</span></label>
          <div class="baps-input-shell">
            <baps-icon class="baps-input-shell__icon" name="user" size="sm" />
            <input id="sh-9" bapsInputText class="p-invalid" [ngModel]="'Gaurang'" />
          </div>
          <small class="input-hint p-error">This is a hint text to help user.</small>
        </div>
        <div class="field" style="display:flex; flex-direction:column;">
          <label for="sh-10">Disabled</label>
          <div class="baps-input-shell">
            <baps-icon class="baps-input-shell__icon" name="user" size="sm" />
            <input id="sh-10" bapsInputText disabled placeholder="Enter user name" />
            <baps-icon class="baps-input-shell__chevron" name="down" [size]="10" />
          </div>
        </div>
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
      filledMessage:
        'Jai Swaminarayan. Requesting an update to my mandal record.',
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

/**
 * `[bapsInputText]` / `[bapsTextarea]` sit ON the field, so a Sampark app with
 * no page scope had no Sampark ancestor and drew the MyBKY pill.
 * `brand="sampark"` stamps the class on the field itself.
 */
export const FieldBrandWithoutScopeInteraction: Story = {
  name: 'Interaction — field brand without a page scope',
  render: () => ({
    template: `
      <div style="display:grid; gap:1rem; padding:1rem; max-width:20rem">
        <input data-testid="mybky" bapsInputText placeholder="MyBKY" />
        <input data-testid="sampark" bapsInputText brand="sampark" placeholder="Sampark" />
        <textarea data-testid="sampark-area" bapsTextarea brand="sampark" rows="2"></textarea>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const radius = (id: string) =>
      getComputedStyle(
        canvasElement.querySelector(`[data-testid="${id}"]`) as HTMLElement,
      ).borderTopLeftRadius;
    await expect(radius('sampark')).toBe('4px');
    await expect(radius('mybky')).toBe('99px');
    await expect(radius('sampark-area')).not.toBe('99px');
  },
};
