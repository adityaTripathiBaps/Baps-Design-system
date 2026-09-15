import type { Meta, StoryObj } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import { expect, fireEvent, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { BapsDrawer } from './drawer.component';
import { BapsButton } from '../button/button.component';
import { BapsIcon } from '../icon/icon.component';
import { BapsAccordionWrapper } from '../accordion/accordion-wrapper.component';
import { BapsAccordionPanel } from '../accordion/accordion-panel.component';
import { BapsMultiSelect } from '../multi-select/multi-select.component';
import { BapsRadio } from '../radio/radio.component';
import { BapsDatepicker } from '../datepicker/datepicker.component';
import { BapsSlider } from '../slider/slider.component';
import { BapsInputGroup } from '../input-group/input-group.component';

/** The component's inputs plus the output spies these stories bind. */
type Args = BapsDrawer & Record<'onShown', (event?: unknown) => void>;

const meta: Meta<Args> = {
  title: 'Components/Overlay/Drawer',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-overlay-drawer.
  id: 'components-drawer',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsDrawer,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        InputText,
        BapsDrawer,
        BapsButton,
        BapsIcon,
        BapsAccordionWrapper,
        BapsAccordionPanel,
        BapsMultiSelect,
        BapsRadio,
        BapsDatepicker,
        BapsSlider,
        BapsInputGroup,
      ],
    }),
  ],
  argTypes: {
    hidden: { control: false },
    shown: { control: false },
    visibleChange: { control: false },
    position: { control: 'inline-radio', options: ['left', 'right', 'top', 'bottom'] },
    brand: { control: 'inline-radio', options: ['mybky', 'sampark'] },
    appendTo: { control: 'inline-radio', options: ['self', 'body'] },
  },
  args: {
    styleClass: '',
    blockScroll: false,
    header: 'Filters',
    position: 'right',
    modal: true,
    dismissible: true,
    closable: true,
    closeOnEscape: true,
    fullScreen: false,
    visible: false,
    // PrimeNG's own default is 'self' (renders inline, wherever the
    // component sits in the DOM) — inside this docs canvas box, that means
    // the panel stays trapped in the little preview box instead of docking
    // to the real viewport edge. 'body' is the realistic usage (matches
    // PrimeNG's own reference demos) and what every real consumer wants:
    // a drawer escaping any `overflow`/`transform` ancestor.
    appendTo: 'body',
  },
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:72588.
    // Harvested from drawer.component.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-72588' },
    // The panel is fixed-position and fills the viewport height, so the
    // default padded docs frame clips it. Stories open it in place instead.
    layout: 'fullscreen',
    // KNOWN ISSUE, accepted deliberately: PrimeNG's drawer mask is
    // `position: fixed`, always appended to `document.body` (regardless of
    // `appendTo`, see baps-drawer's own doc comment), and is not a DOM
    // descendant of the docs canvas box, so no CSS containment trick can
    // confine it there. Opening any example on this merged Docs page (one
    // shared document) dims the whole page, ArgsTable included, not just
    // that example's canvas.
    //
    // The real fix, `docs.story.inline: false` (each example gets its own
    // iframe), was tried and reverted: it means 4 separate full Angular
    // bootstraps on one Docs page instead of one shared app, each
    // lazy-loading the PrimeNG vendor chunk in parallel, and on this
    // machine (already flagged for Storybook OOM/resource limits) that
    // blows the chunk-load timeout and the canvases go blank instead — a
    // functional break traded for a cosmetic one. Reload after opening a
    // drawer here to clear the dim.
  },
  render: (args) => ({
    props: { ...args, onShown: action('shown') },
    template: `
      <div style="padding: 1.5rem">
        <baps-button label="Open drawer" [brand]="brand" (click)="visible = true" />
      </div>

      <baps-drawer
        [(visible)]="visible"
        [header]="header"
        [position]="position"
        [modal]="modal"
        [dismissible]="dismissible"
        [closable]="closable"
        [closeOnEscape]="closeOnEscape"
        [fullScreen]="fullScreen"
        [appendTo]="appendTo"
        [brand]="brand"
      
        (shown)="onShown($event)">
        <p style="margin: 0">A slide-in panel from the edge of the screen for contextual content.</p>
      </baps-drawer>
    `,
  }),
};

export default meta;
type Story = StoryObj<Args>;

/** Click "Open drawer" to slide the panel in. */
export const Playground: Story = {};

/**
 * Click "Open drawer" to see the Sampark geometry. Not open by default —
 * autodocs mounts every story of this component on one shared page, and
 * PrimeNG's drawer mask is a fixed full-viewport div appended to
 * `<body>`, not scoped to this story's canvas. A story that defaults to
 * `visible: true` leaves that mask permanently in the DOM, and multiple
 * such stories stack their masks into one page-wide dark overlay that
 * never clears (see git history for the pre-fix version if reproducing).
 */
export const Open: Story = {};

/**
 * The Sampark Portal filter panel this component was built from: title,
 * `Clear All` / `Apply` actions and the close button on one header row, over a
 * scrolling body of collapsible sections.
 *
 * The body is a `baps-accordion`, not hand-built sections. That is what
 * produces the shaded header bar, the count badge and the chevron on every
 * row — this story used to draw those itself with a `baps-tag` and a bold
 * span, which looked close but had no chevron, no shared bar and no collapse.
 * Anything a real filter panel needs is already an input on
 * `baps-accordion-panel`.
 *
 * Each section is also a different FIELD type on purpose, because that is what
 * the frame specifies and what makes this a useful reference:
 *
 * - Location — `baps-multi-select` in `display="chip"`
 * - Duration — radios two-per-row, then a `baps-datepicker` pair
 * - Sampark Progress — a two-handle `baps-slider` over `baps-input-group`
 *   fields whose `%` sits inside the same ring as the number
 *
 * No footer here: the frame has none. The `drawer-footer` slot is still
 * covered by the component spec and by drawer.mdx.
 */
export const FilterPanel: Story = {
  args: { header: 'Filters' },
  render: (args) => ({
    props: {
      ...args,
      open: ['location', 'duration', 'progress'],
      locations: [{ name: 'Robbinsvile' }, { name: 'Edison' }, { name: 'Parsippany' }],
      location: [{ name: 'Robbinsvile' }],
      period: 'custom',
      from: new Date(2025, 5, 5),
      to: new Date(2025, 10, 30),
      progress: [25, 75],
    },
    template: `
      <div style="padding: 1.5rem">
        <baps-button label="Open filters" [brand]="brand" (click)="visible = true">
          <baps-icon name="filter" size="sm" />
        </baps-button>
      </div>

      <baps-drawer [(visible)]="visible" [header]="header" [position]="position" [appendTo]="appendTo" [brand]="brand">
        <div drawer-actions>
          <baps-button label="Clear All" severity="secondary" [outlined]="true" size="small" [brand]="brand" />
          <baps-button label="Apply" size="small" [brand]="brand" />
        </div>

        <baps-accordion [brand]="brand" [multiple]="true" [value]="open">

          <baps-accordion-panel value="location" label="Location" [count]="1" [divider]="false">
            <baps-multi-select
              [brand]="brand" display="chip" optionLabel="name" appendTo="body"
              placeholder="Select location" [options]="locations" [(ngModel)]="location"
            ></baps-multi-select>
          </baps-accordion-panel>

          <baps-accordion-panel value="duration" label="Duration" [count]="1">
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-radio [brand]="brand" name="duration" radioValue="week" label="Last Week" [(ngModel)]="period" /></div>
              <div class="baps-accordion-cell"><baps-radio [brand]="brand" name="duration" radioValue="month" label="Last Month" [(ngModel)]="period" /></div>
            </div>
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-radio [brand]="brand" name="duration" radioValue="quarter" label="Last Quarter" [(ngModel)]="period" /></div>
              <div class="baps-accordion-cell"><baps-radio [brand]="brand" name="duration" radioValue="6month" label="Last 6 Month" [(ngModel)]="period" /></div>
            </div>
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-radio [brand]="brand" name="duration" radioValue="custom" label="Custom Date Range" [(ngModel)]="period" /></div>
            </div>
            <div class="baps-accordion-daterange">
              <baps-datepicker [brand]="brand" appendTo="body" dateFormat="dd M, yy" [showIcon]="true" iconDisplay="input" ariaLabel="From date" [(ngModel)]="from"></baps-datepicker>
              <span aria-hidden="true">-</span>
              <baps-datepicker [brand]="brand" appendTo="body" dateFormat="dd M, yy" [showIcon]="true" iconDisplay="input" ariaLabel="To date" [(ngModel)]="to"></baps-datepicker>
            </div>
          </baps-accordion-panel>

          <baps-accordion-panel value="progress" label="Sampark Progress" [count]="1">
            <div class="baps-accordion-slider">
              <baps-slider [brand]="brand" [range]="true" [(ngModel)]="progress" ariaLabel="Sampark progress range" />
            </div>
            <div class="baps-accordion-range">
              <baps-input-group [brand]="brand" suffix="%">
                <input pInputText type="number" aria-label="Minimum progress" [(ngModel)]="progress[0]" />
              </baps-input-group>
              <span>To</span>
              <baps-input-group [brand]="brand" suffix="%">
                <input pInputText type="number" aria-label="Maximum progress" [(ngModel)]="progress[1]" />
              </baps-input-group>
            </div>
          </baps-accordion-panel>

        </baps-accordion>
      </baps-drawer>
    `,
  }),
};

/** All four edges. The two inner corners are rounded; the flush edge is square. */
export const Positions: Story = {
  render: (args) => ({
    props: { ...args, open: '' },
    template: `
      <div style="display:flex; gap:0.5rem; padding:1.5rem; flex-wrap:wrap">
        <baps-button label="Left"   severity="secondary" [outlined]="true" [brand]="brand" (click)="open = 'left'" />
        <baps-button label="Right"  severity="secondary" [outlined]="true" [brand]="brand" (click)="open = 'right'" />
        <baps-button label="Top"    severity="secondary" [outlined]="true" [brand]="brand" (click)="open = 'top'" />
        <baps-button label="Bottom" severity="secondary" [outlined]="true" [brand]="brand" (click)="open = 'bottom'" />
      </div>

      @for (p of ['left','right','top','bottom']; track p) {
        <baps-drawer
          [visible]="open === p"
          (visibleChange)="open = $event ? p : ''"
          [header]="p + ' drawer'"
          [position]="p"
          [appendTo]="appendTo"
          [brand]="brand"
        >
          <p style="margin:0">Position <code>{{ p }}</code>.</p>
        </baps-drawer>
      }
    `,
  }),
};

/**
 * `closable="false"` drops the close button, and `dismissible="false"` stops
 * the mask closing it — use both when the panel must be resolved by an action
 * in its own footer.
 */
export const NonDismissible: Story = {
  args: { header: 'Confirm selection', closable: false, dismissible: false },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding:1.5rem">
        <baps-button label="Open" [brand]="brand" (click)="visible = true" />
      </div>

      <baps-drawer
        [(visible)]="visible"
        [header]="header"
        [position]="position"
        [closable]="closable"
        [dismissible]="dismissible"
        [appendTo]="appendTo"
        [brand]="brand"
      >
        <p style="margin:0">The mask and the Escape key will not close this panel.</p>

        <div drawer-footer style="display:flex; justify-content:flex-end; gap:0.5rem">
          <baps-button label="Cancel" severity="secondary" [text]="true" size="small" [brand]="brand" (click)="visible = false" />
          <baps-button label="Save" size="small" [brand]="brand" (click)="visible = false" />
        </div>
      </baps-drawer>
    `,
  }),
};

/* ── Interactions ────────────────────────────────────────────────────────── */

/**
 * Open the panel, then close it with its own close button.
 *
 * Two measured facts shape this. The panel is appended to <body>, so it is
 * queried on the document, not the canvas. And PrimeNG gives it
 * `role="complementary"` with NO `aria-modal` — so it is found by that role,
 * not by "dialog". Worth knowing rather than hiding: a panel that traps focus
 * and dims the page behind it reads to assistive tech as a sidebar, not a
 * modal. That is PrimeNG's markup, not something this wrapper sets, so it is
 * recorded here rather than patched.
 *
 * Not open by default, for the reason the Open story records: the mask is a
 * fixed full-viewport div on <body>, and a story that mounts open leaves it
 * there for the whole autodocs page. Opening inside `play` keeps the mask's
 * lifetime inside this one story.
 */
export const OpenCloseInteraction: Story = {
  name: 'Interaction — open and close',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Open drawer/ }));
    const panel = await waitFor(() => page.getByRole('complementary'), { timeout: 8000 });
    await expect(panel).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(page.queryByRole('complementary')).not.toBeInTheDocument(), { timeout: 8000 });
  },
};

/** Escape closes it too, which is the keyboard user's only way out. */
export const EscapeInteraction: Story = {
  name: 'Interaction — Escape closes',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: /Open drawer/ }));
    await waitFor(() => expect(page.getByRole('complementary')).toBeVisible(), { timeout: 8000 });

    // A real browser Escape DOES close this panel — driven with Playwright,
    // the panel count goes 1 -> 0. userEvent.keyboard('{Escape}') does not,
    // even with focus inside the panel: its synthetic keydown carries `key`
    // and `code` but no legacy `keyCode`, and PrimeNG's handler reads that.
    // So the event is dispatched directly with all three, which is what a real
    // key press delivers.
    page.getByRole('button', { name: 'Close' }).focus();
    fireEvent.keyDown(canvasElement.ownerDocument, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
    });
    await waitFor(() => expect(page.queryByRole('complementary')).not.toBeInTheDocument());
  },
};
