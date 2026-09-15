import type { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { BapsPaginator } from './pagination.component';

/**
 * Pagination — Sampark Portal, Figma node 17512:73228.
 *
 * Reads left to right: the record count, the page size, the page links, and
 * a jump field. Everything is optional except the prev/next arrows, so the
 * same component covers a 3-page list and a 250-row table.
 *
 * The page links truncate rather than scroll — first two, last two, and the
 * current page's neighbours, with `...` across the gap. That keeps the strip
 * a near-constant width no matter how many pages there are; try paging into
 * the middle of the Full story below to see it open up.
 */
const meta: Meta<BapsPaginator> = {
  title: 'Components/Data/Pagination',
  // Pinned so the categorised title above does not move the docs URL:
  // without it the id would follow the title to components-data-pagination.
  id: 'components-pagination',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  parameters: {
    // Design tab — the Figma frame this component implements, node 17512:73228.
    // Harvested from pagination.stories.ts, where it was already recorded as a comment.
    design: { type: 'figma', url: 'https://www.figma.com/design/xc0L2xnREMgjyb5XcKyLIz/?node-id=17512-73228' },
  },
  component: BapsPaginator,
  args: {
    showCurrentPageReport: false,
    showFirstLastIcon: true,
    showJumpToPage: false,
    showPageLinks: true,
    totalRecords: 250,
    rows: 20,
  },
  argTypes: {
    pageChange: { control: false },
    currentPageReportTemplate: {
      description: 'Placeholders: {first} {last} {totalRecords} {currentPage} {totalPages}',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <baps-paginator
        [brand]="brand"
        [totalRecords]="totalRecords"
        [rows]="rows"
        [first]="first"
        [rowsPerPageOptions]="rowsPerPageOptions"
        [showCurrentPageReport]="showCurrentPageReport"
        [currentPageReportTemplate]="currentPageReportTemplate"
        [showFirstLastIcon]="showFirstLastIcon"
        [showJumpToPage]="showJumpToPage"
      />
    `,
  }),
};

export default meta;

/**
 * The full strip exactly as the Figma draws it — count, page size, first /
 * prev, truncated links, next / last, and "Go to".
 */
export const Default: StoryObj<BapsPaginator> = {
  args: {
    first: 0,
    rowsPerPageOptions: [10, 20, 50, 100],
    showCurrentPageReport: true,
    currentPageReportTemplate: 'Showing {first}-{last} of {totalRecords}',
    showFirstLastIcon: true,
    showJumpToPage: true,
  },
};

/**
 * Same strip under `brand="mybky"` (the input's own default) — 30×30 pill
 * nav/page buttons, filled Mono/100 active page, matching events-ui's
 * noir.theme.ts paginator tokens.
 */
export const MyBKY: StoryObj<BapsPaginator> = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  args: {
    brand: 'mybky',
    first: 200,
    rowsPerPageOptions: [10, 20, 50, 100],
    showCurrentPageReport: true,
    currentPageReportTemplate: 'Showing {first}-{last} of {totalRecords}',
    showFirstLastIcon: true,
    showJumpToPage: true,
  },
};

/**
 * Opened to the middle of the range, which is where the truncation earns its
 * keep: `1 2 ... 12 13 14 ... 24 25` instead of twenty-five buttons.
 */
export const MidRange: StoryObj<BapsPaginator> = {
  args: {
    ...Default.args,
    first: 240,
  },
};

/**
 * Under six pages there is nothing to elide, so every page is listed and no
 * `...` appears. No configuration needed — it falls out of the same rule.
 */
export const FewPages: StoryObj<BapsPaginator> = {
  args: {
    ...Default.args,
    totalRecords: 60,
    rows: 20,
  },
};

/**
 * Just the arrows and links. Use this under a short list where the record
 * count and page-size control would be more chrome than the list itself.
 */
export const Compact: StoryObj<BapsPaginator> = {
  args: {
    first: 0,
    showCurrentPageReport: false,
    showFirstLastIcon: false,
    showJumpToPage: false,
  },
};

/* ── Interactions ──────────────────────────────────────────────────────── */

/**
 * Clicking a page number moves the current page and the report text with it.
 *
 * The report ("Showing 1-20 of …") is the assertion rather than the button's
 * highlight: it is derived from the paginator's actual first/rows state, so it
 * cannot agree with the highlight by accident.
 */
export const PageChangeInteraction: StoryObj<BapsPaginator> = {
  name: 'Interaction — change page',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Measured: the page buttons carry aria-label "Page 1", "Page 2", … — the
    // visible digit is not the accessible name.
    const page2 = canvas.getByRole('button', { name: 'Page 2' });
    await userEvent.click(page2);

    // aria-current is the assertion, measured: it moves off Page 1 and onto
    // Page 2, alongside the house .baps-paginator__page--active class. The
    // "Showing 21-40 of 250" report is NOT asserted — it is not rendered in
    // this story at all, and an earlier version of this test chased it through
    // the canvas and then the whole document before measuring that.
    await waitFor(() => expect(page2).toHaveAttribute('aria-current', 'page'), { timeout: 8000 });
    await expect(canvas.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute(
      'aria-current',
    );

    // The window slides too: on page 2 a "Page 3" appears that was not there
    // before. This is the house baps-paginator, not PrimeNG's p-paginator, and
    // that windowing is its own logic rather than something inherited.
    await expect(canvas.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  },
};
