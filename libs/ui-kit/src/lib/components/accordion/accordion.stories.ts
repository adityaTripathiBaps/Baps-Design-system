import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { BapsAccordion } from './accordion.directive';
import { BapsAccordionWrapper } from './accordion-wrapper.component';
import { BapsAccordionPanel } from './accordion-panel.component';
import { BapsCheckbox } from '../checkbox/checkbox.component';
import { BapsRadio } from '../radio/radio.component';
import { BapsMultiSelect } from '../multi-select/multi-select.component';
import { BapsDatepicker } from '../datepicker/datepicker.component';

/**
 * Accordion — collapsible sections, using PrimeNG v21 Accordion directly with
 * the `bapsAccordion` directive for the brand skin.
 *
 * Built from the Sampark filter panel (Figma node 17512:84215 — 20 variants:
 * ten sections across Default and Open). That frame's 89px open height
 * decomposes exactly as 32px header + 8px gap + 1px divider + 32px row + 16px
 * bottom padding, which the skin reproduces.
 *
 * There is deliberately no `baps-accordion` wrapper component. Wrapping
 * `p-accordion` throws `NG0201: No provider found for _Accordion` — the same
 * element-injector problem documented on `bapsTabs`. See the directive's own
 * doc comment for the full reasoning.
 */
const meta: Meta<BapsAccordion> = {
  title: 'Components/Molecules/Accordion',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-panel-accordion.
  id: 'components-accordion',
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:84215.
    // Harvested from accordion.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-84215' },
  },
  // Design-system availability — drives the sidebar filter in .storybook/manager.ts.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsAccordion,
  decorators: [
    moduleMetadata({
      imports: [
        Accordion,
        AccordionPanel,
        AccordionHeader,
        AccordionContent,
        BapsAccordion,
        BapsAccordionWrapper,
        BapsAccordionPanel,
        BapsCheckbox,
        BapsRadio,
        BapsMultiSelect,
        BapsDatepicker,
        FormsModule,
      ],
    }),
  ],
  argTypes: {
    brand: { control: 'select', options: ['mybky', 'sampark'] },
  },
};

export default meta;
type Story = StoryObj<BapsAccordion>;

/**
 * The Figma frame itself (17512:84215), at its 452px width with every section
 * open. The accordion is a shell — what makes the design read as a filter panel
 * is the content inside it, so this story uses the real controls the design
 * shows rather than placeholder text: chips (`baps-multi-select` with
 * `display="chip"`) for Category and response, checkboxes for the yes/no and
 * status sections, and radios plus a two-`baps-datepicker` range for
 * "Submitted At".
 *
 * Written with `baps-accordion` / `baps-accordion-panel`, so the header
 * badge, the label, the body wrapper and the divider are inputs rather than
 * markup repeated five times. Category and the response section pass
 * `[divider]="false"` — a section whose content is one bordered control does
 * not want a second rule above it, which is the 88px-vs-89px split in the
 * Figma frames.
 */
export const FilterPanel: Story = {
  render: () => ({
    props: {
      open: ['category', 'visit', 'response', 'submitted', 'status'],
      categories: [{ name: 'G-Sampark' }, { name: 'G-Focus' }, { name: 'G-Yuva' }],
      category: [{ name: 'G-Sampark' }, { name: 'G-Focus' }],
      responses: [{ name: 'Positive' }, { name: 'Neutral' }, { name: 'Negative' }],
      response: [{ name: 'Positive' }],
      visitYes: true, visitNo: false,
      complete: true, pending: true,
      period: 'custom',
      from: new Date(2025, 5, 5), to: new Date(2025, 10, 30),
    },
    template: `
      <div style="width: 452px">
        <baps-accordion [multiple]="true" [value]="open">

          <baps-accordion-panel
            value="category"
            label="Category"
            [count]="2"
            [divider]="false"
          >
            <baps-multi-select
                ariaLabel="Filter values"
              display="chip" optionLabel="name" appendTo="body"
              placeholder="Select categories" [options]="categories" [(ngModel)]="category"
            ></baps-multi-select>
          </baps-accordion-panel>

          <baps-accordion-panel
            value="visit"
            label="Was the Sampark visit completed successfully?"
            [count]="2"
          >
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-checkbox label="Yes" [(ngModel)]="visitYes" /></div>
              <div class="baps-accordion-cell"><baps-checkbox label="No" [(ngModel)]="visitNo" /></div>
            </div>
          </baps-accordion-panel>

          <baps-accordion-panel
            value="response"
            label="How was the overall response from the family?"
            [count]="1"
            [divider]="false"
          >
            <baps-multi-select
                ariaLabel="Filter values"
              display="chip" optionLabel="name" appendTo="body"
              placeholder="Select response" [options]="responses" [(ngModel)]="response"
            ></baps-multi-select>
          </baps-accordion-panel>

          <baps-accordion-panel
            value="submitted"
            label="Submitted At"
            [count]="1"
          >
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-radio name="period" radioValue="week" label="Last Week" [(ngModel)]="period" /></div>
              <div class="baps-accordion-cell"><baps-radio name="period" radioValue="month" label="Last Month" [(ngModel)]="period" /></div>
            </div>
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-radio name="period" radioValue="quarter" label="Last Quarter" [(ngModel)]="period" /></div>
              <div class="baps-accordion-cell"><baps-radio name="period" radioValue="6month" label="Last 6 Month" [(ngModel)]="period" /></div>
            </div>
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-radio name="period" radioValue="custom" label="Custom Date Range" [(ngModel)]="period" /></div>
            </div>
            <div class="baps-accordion-daterange">
              <baps-datepicker appendTo="body" ariaLabel="From date" [(ngModel)]="from"></baps-datepicker>
              <span aria-hidden="true">-</span>
              <baps-datepicker appendTo="body" ariaLabel="To date" [(ngModel)]="to"></baps-datepicker>
            </div>
          </baps-accordion-panel>

          <baps-accordion-panel
            value="status"
            label="Status"
            [count]="4"
          >
            <div class="baps-accordion-row">
              <div class="baps-accordion-cell"><baps-checkbox label="Complete" [(ngModel)]="complete" /></div>
              <div class="baps-accordion-cell"><baps-checkbox label="Pending" [(ngModel)]="pending" /></div>
            </div>
          </baps-accordion-panel>

        </baps-accordion>
      </div>
    `,
  }),
};

/**
 * Sections without the filter-panel content — the skin on its own. `multiple`
 * is off here, so opening one section closes the others.
 */
export const Default: Story = {
  render: () => ({
    props: { open: 'region' },
    template: `
      <div style="width: 452px">
        <p-accordion bapsAccordion [value]="open">
          <p-accordion-panel value="region">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">3</span>
              <span class="baps-accordion-label">Region</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Ahmedabad, London, Nairobi</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="sabha">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">2</span>
              <span class="baps-accordion-label">Sabha</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Yuva Sabha, Bal Sabha</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="status">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">4</span>
              <span class="baps-accordion-label">Status</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Complete, Pending, Draft, Archived</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    `,
  }),
};

/**
 * `multiple` — more than one section open at once, which the filter panel
 * wants. Real controls again, and note the two content shapes Figma uses: an
 * input-backed section runs the control full-bleed with no hairline (88px),
 * a list-backed one draws the divider and pads its rows to 8px (89px).
 */
export const Multiple: Story = {
  render: () => ({
    props: {
      open: ['region', 'status'],
      regions: [{ name: 'Ahmedabad' }, { name: 'London' }, { name: 'Nairobi' }],
      region: [{ name: 'Ahmedabad' }, { name: 'London' }],
      complete: true, pending: true,
    },
    template: `
      <div style="width: 452px">
        <p-accordion bapsAccordion [multiple]="true" [value]="open">
          <p-accordion-panel value="region">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">2</span>
              <span class="baps-accordion-label">Region</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <baps-multi-select
                ariaLabel="Filter values" display="chip" optionLabel="name" appendTo="body"
                  placeholder="Select regions" [options]="regions" [(ngModel)]="region"></baps-multi-select>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="status">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">2</span>
              <span class="baps-accordion-label">Status</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div class="baps-accordion-row">
                  <div class="baps-accordion-cell"><baps-checkbox label="Complete" [(ngModel)]="complete" /></div>
                  <div class="baps-accordion-cell"><baps-checkbox label="Pending" [(ngModel)]="pending" /></div>
                </div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    `,
  }),
};

/**
 * The badge is optional. Without it the label takes the badge's inset so it
 * does not sit against the rounded corner.
 */
export const WithoutCount: Story = {
  render: () => ({
    props: { open: 'about' },
    template: `
      <div style="width: 452px">
        <p-accordion bapsAccordion [value]="open">
          <p-accordion-panel value="about">
            <p-accordion-header>
              <span class="baps-accordion-label">About this event</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Projected content, no tally.</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="terms">
            <p-accordion-header>
              <span class="baps-accordion-label">Terms</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">More projected content.</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    `,
  }),
};

/** A disabled section cannot be opened. */
export const Disabled: Story = {
  render: () => ({
    props: { open: 'region' },
    template: `
      <div style="width: 452px">
        <p-accordion bapsAccordion [value]="open">
          <p-accordion-panel value="region">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">3</span>
              <span class="baps-accordion-label">Region</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Ahmedabad, London, Nairobi</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="locked" [disabled]="true">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">0</span>
              <span class="baps-accordion-label">Locked section</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Unreachable.</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    `,
  }),
};

/**
 * Both brands. MyBKY takes the same geometry with Mono/10 = `#f8fafb` and a
 * Primary/0 badge; the structure never changes between brands.
 */
export const Brands: Story = {
  // Shows both brands at once — hidden unless the Comparison toolbar toggle is on.
  tags: ['ds:comparison'],
  render: () => ({
    props: { a: 'region', b: 'region' },
    template: `
      <div style="display: grid; gap: 1.5rem; width: 452px">
        <p-accordion bapsAccordion brand="mybky" [value]="a">
          <p-accordion-panel value="region">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">3</span>
              <span class="baps-accordion-label">MyBKY</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Mono/10 header, Primary/0 badge.</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
        <p-accordion bapsAccordion brand="sampark" [value]="b">
          <p-accordion-panel value="region">
            <p-accordion-header>
              <span class="baps-accordion-count" aria-hidden="true">3</span>
              <span class="baps-accordion-label">Sampark</span>
            </p-accordion-header>
            <p-accordion-content>
              <div class="baps-accordion-body">
                <span class="baps-accordion-divider"></span>
                <div style="padding: 0 0.5rem">Mono/10 header, Primary/10% badge.</div>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    `,
  }),
};



/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Open/close, and the single-open rule.
 *
 * The rule IS the component: without `multiple`, opening one panel must close
 * the previous one. aria-expanded is the assertion rather than the visible
 * body, because that attribute is what a screen reader reads and what the
 * animation is derived from — a body that is present but collapsed would still
 * fool a "is it visible" check during the transition.
 */
export const OpenCloseInteraction: Story = {
  name: 'Interaction — open, close, single-open rule',
  render: () => ({
    props: { open: 'region' },
    template: `
      <div style="width: 452px">
        <p-accordion bapsAccordion [value]="open">
          <p-accordion-panel value="region">
            <p-accordion-header><span class="baps-accordion-label">Region</span></p-accordion-header>
            <p-accordion-content><div class="baps-accordion-body">Ahmedabad, London</div></p-accordion-content>
          </p-accordion-panel>
          <p-accordion-panel value="sabha">
            <p-accordion-header><span class="baps-accordion-label">Sabha</span></p-accordion-header>
            <p-accordion-content><div class="baps-accordion-body">Yuva Sabha</div></p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('button', { name: /Region/ });
    const sabha = canvas.getByRole('button', { name: /Sabha/ });

    await expect(region).toHaveAttribute('aria-expanded', 'true');
    await expect(sabha).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(sabha);
    await waitFor(() => expect(sabha).toHaveAttribute('aria-expanded', 'true'));
    await expect(region).toHaveAttribute('aria-expanded', 'false');

    // Clicking the open one closes it — an accordion is not a radio group.
    await userEvent.click(sabha);
    await waitFor(() => expect(sabha).toHaveAttribute('aria-expanded', 'false'));
  },
};

/** Keyboard: the header is a real button, so Enter toggles it. */
export const KeyboardInteraction: Story = {
  name: 'Interaction — keyboard',
  render: () => ({
    props: { open: '' },
    template: `
      <div style="width: 452px">
        <p-accordion bapsAccordion [value]="open">
          <p-accordion-panel value="one">
            <p-accordion-header><span class="baps-accordion-label">Region</span></p-accordion-header>
            <p-accordion-content><div class="baps-accordion-body">Ahmedabad</div></p-accordion-content>
          </p-accordion-panel>
        </p-accordion>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', { name: /Region/ });

    await userEvent.tab();
    await expect(header).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(header).toHaveAttribute('aria-expanded', 'true'));
  },
};
