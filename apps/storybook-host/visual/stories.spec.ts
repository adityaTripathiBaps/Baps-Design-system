import { test, expect, type Page } from '@playwright/test';

/**
 * One screenshot per Storybook story, discovered from Storybook's own
 * index.json rather than a hand-maintained list. That matters: a hardcoded
 * list silently stops covering new components the moment someone adds one,
 * which is exactly when a baseline is most useful. Adding a story
 * automatically adds its snapshot; the first run for a new story writes a
 * baseline and passes.
 *
 * Docs entries are skipped. They render prose and re-render the same story
 * canvases already covered individually, so they would double the snapshot
 * count while duplicating coverage — and MDX text reflows on any wording
 * edit, producing diffs that are never about component appearance.
 */
interface StorybookIndex {
  entries: Record<string, { id: string; title: string; name: string; type: string }>;
}

async function loadStoryIds(page: Page): Promise<{ id: string; title: string; name: string }[]> {
  const res = await page.request.get('/index.json');
  if (!res.ok()) {
    throw new Error(
      `Could not read Storybook index.json (HTTP ${res.status()}). Is Storybook running on the ` +
        `configured baseURL? Start it with: npx nx run storybook-host:storybook --port=4400`,
    );
  }
  const body = await res.text();
  let index: StorybookIndex;
  try {
    index = JSON.parse(body);
  } catch {
    // Storybook serves a plain-text error here instead of JSON when the
    // indexer rejects a file — most often an .mdx docs page whose CSF file is
    // ALSO tagged 'autodocs'. Surfacing the body is what makes that
    // diagnosable; otherwise it reads as an unrelated JSON parse failure.
    throw new Error(`Storybook index.json is not valid JSON. Server said:\n${body.slice(0, 600)}`);
  }
  return Object.values(index.entries)
    .filter((e) => e.type === 'story')
    // Interaction stories are excluded from the visual baseline, and this is a
    // deliberate split rather than an omission. Their whole point is a `play`
    // function that drives the component MID-FLIGHT: a dialog opening, a
    // tooltip fading in, a panel animating out. Screenshotting that captures
    // whichever frame the run happened to land on, so a baseline for one is
    // flaky by construction and would fail for reasons that have nothing to do
    // with a design change.
    //
    // They are not untested — every one asserts its own behaviour and is
    // verified by tools/check-interactions.mjs, which reads the Interactions
    // panel's verdict. Two suites, two questions: this one pins pixels, that
    // one pins behaviour.
    .filter((e) => !/^Interaction( |—|$)/.test(e.name) && !/-interaction$/.test(e.id))
    // The Theme builder is excluded for a different reason: it is a TOOL, not a
    // component. It renders a native `<input type="color">`, whose appearance is
    // a platform widget rather than anything the design system controls, and a
    // screenshot of it at the default globals pins the least interesting state
    // it has — the one where nothing has been changed. It would be a baseline
    // that fails on a Playwright or OS update and never on a design change.
    //
    // Named explicitly rather than pattern-matched, so adding a second
    // Guidelines page does not silently opt out too.
    .filter((e) => e.id !== 'guidelines-theme-builder--builder')
    // VISUAL_ONLY=tag narrows the sweep to the ids containing that substring.
    // The suite is ONE test over every story, so verifying a single component
    // otherwise means sitting through all of them — and the 25-minute cap has
    // killed runs before reaching the component that was actually changed
    // (pagination hung on networkidle, tag never ran). Unset in CI, where the
    // full sweep is the point.
    .filter((e) => !process.env['VISUAL_ONLY'] || e.id.includes(process.env['VISUAL_ONLY']))
    .map(({ id, title, name }) => ({ id, title, name }));
}

/**
 * Per-story screenshot options. Named exceptions only — the global settings in
 * playwright.config.ts stay as they are for all 268 stories.
 *
 * `icon--library` needs TIME, not tolerance. Its failure is
 *
 *     toHaveScreenshot(expected) failed  Locator: locator('#storybook-root')
 *     Timeout: 5000ms
 *
 * — a timeout, not a pixel difference. `toHaveScreenshot` re-captures until two
 * consecutive shots match, and on this canvas (1248x6154, 7.68M pixels, 545
 * inline SVG glyphs) capture-and-compare does not finish inside the default 5s
 * expect timeout when the machine is busy. Hence the symptoms: it passed on
 * chromium's first attempt in one run and failed on it in the next with
 * identical code, chromium-mobile passed throughout, the diff image renders
 * blank, and both PNGs are byte-for-byte the same size.
 *
 * Tolerance is deliberately NOT touched. An earlier attempt at this raised
 * `threshold`, on the theory that anti-aliasing jitter across 545 glyphs was
 * accumulating past `maxDiffPixelRatio` — plausible, and wrong; the run failed
 * again in exactly the same way. Loosening a comparison to fix a timeout only
 * hides the next real regression. (`maxDiffPixelRatio` would be worse still
 * here: one tile is ~19k pixels, 0.0025 of the canvas, so a whole icon changing
 * shape barely clears the 0.002 global as it is.)
 */
const PER_STORY_SCREENSHOT_OPTIONS: Record<
  string,
  { timeout?: number; threshold?: number; maxDiffPixelRatio?: number }
> = {
  'components-icon--library': { timeout: 30_000 },

  // ── Brand-migration batches: threshold 0 ────────────────────────────────
  // These stories had a hardcoded brand="sampark" removed so they follow the
  // toolbar. The flip is real — 45,182 of 195,936 pixels changed on
  // components-accordion--default — but every changed pixel is a pale tint
  // moving to another pale tint: the largest pixelmatch YIQ delta across the
  // whole image is 0.0026, against the 0.2 default `threshold`. So the suite
  // scored it as zero different pixels and PASSED on a change plainly visible
  // in the browser. threshold: 0 is what makes these stories able to fail.
  //
  // maxDiffPixelRatio: 0 as well, and that half is not redundant. threshold
  // decides whether a pixel COUNTS as different; maxDiffPixelRatio decides how
  // many counted pixels are tolerated. On components-divider--toolbar-separator
  // the brand flip repaints three 1x16px rules — 48 pixels of 102,336, a ratio
  // of 0.00047 against the global 0.002. Every pixel was counted and the story
  // still PASSED, because a small component cannot fill enough of the canvas to
  // clear a ratio written for large ones. Both gates have to be zero.
  //
  // Only these stories; the globals stay as they are so the other baselines
  // keep their existing anti-aliasing tolerance. See guidelines/known-gaps.
  'components-accordion--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-accordion--without-count': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-accordion--multiple': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-accordion--disabled': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-accordion--filter-panel': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-divider--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-divider--toolbar-separator': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-link--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-link--variants': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-link--sizes': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-multiselect--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-multiselect--chips': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-multiselect--filter-and-select-all': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-multiselect--grouped': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-multiselect--sizes': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-multiselect--disabled': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-treeselect--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-treeselect--checkbox': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-treeselect--filter': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-treeselect--sizes': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-treeselect--disabled': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-segmented--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-segmented--two-up': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-segmented--multiple': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-segmented--object-options': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-segmented--disabled': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-inputgroup--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-inputgroup--suffix-only': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-inputgroup--min-max-row': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-slider--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-slider--range': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-slider--value-tooltip': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-slider--disabled': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-toolbar--playground': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-toolbar--search-only': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-select--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-tabs--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-tabs--with-disabled': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--compact': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--with-column-config': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--with-pagination': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--full-listing-page': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--sortable-sticky-paginated': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--grouped-projects': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--tree-levels': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--karyakar-assignments': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--loading': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-table--empty': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-form-controls--rich-template-panel-list': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-avatar--group-sizes': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-breadcrumb--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-tablesortconfig--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-tablesortconfig--default-only': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-tablesortconfig--empty': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-tablesortconfig--from-trigger': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-spinner--indeterminate': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-spinner--determinate': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-spinner--determinate-steps': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-toggleswitch--with-label': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-progressbar--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-progressbar--severities': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-progressbar--table-cell-progress': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-fileupload--playground': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-fileupload--states': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-internalnavbar--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-internalnavbar--nested': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-datepicker--overlay': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-checkbox--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-stepper--wrapper-numbered': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-navbar--playground': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-splitbutton--playground': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-splitbutton--matrix': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-card--body-only': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-card--dashboard-tiles': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-card--divided': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-card--interactive': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-card--padding-steps': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-card--playground': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-card--rest-vs-raised': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-drawer--filter-panel': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-drawer--non-dismissible': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-drawer--open': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-drawer--playground': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-drawer--positions': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-dialog--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-dialog--open': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-dialog--form-modal': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-dialog--actions-end': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-pagination--default': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-pagination--mid-range': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-pagination--few-pages': { threshold: 0, maxDiffPixelRatio: 0 },
  'components-pagination--compact': { threshold: 0, maxDiffPixelRatio: 0 },
};

test.describe('visual baseline', () => {
  // Discovery happens once, at collection time, so each story gets its own
  // reported test rather than one giant test that stops at the first diff.
  let stories: { id: string; title: string; name: string }[] = [];

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    stories = await loadStoryIds(page);
    await page.close();
  });

  test('every story matches its baseline', async ({ page }, testInfo) => {
    // 25 minutes, not 15. A compare-only sweep of 268 stories takes 5 to 6, so
    // this is not a budget — it is headroom. The run occasionally goes three
    // times slower (webpack compiling on demand for a freshly started server,
    // two project workers competing), and at 15 minutes that killed the run
    // four separate times. Once, it killed one that was WRITING baselines, and
    // a half-written baseline set is the expensive failure: see
    // guidelines/known-gaps. A slow run finishing late costs nothing; a slow
    // run dying costs the baseline.
    test.setTimeout(25 * 60 * 1000);
    const failures: string[] = [];

    for (const story of stories) {
      await page.goto(`/iframe.html?viewMode=story&id=${story.id}`, {
        waitUntil: 'networkidle',
      });

      // Storybook renders the story asynchronously after load; #storybook-root
      // exists immediately but is empty until then. Waiting for actual content
      // is what stops the baseline being a screenshot of a blank page.
      await page
        .waitForFunction(
          () => {
            const root = document.querySelector('#storybook-root');
            return !!root && root.children.length > 0;
          },
          { timeout: 15000 },
        )
        .catch(() => {
          failures.push(`${story.id}: never rendered any content`);
        });

      // Web fonts shift metrics after first paint; screenshotting before they
      // settle produces a baseline that can never be reproduced.
      await page.evaluate(() => document.fonts.ready);

      try {
        // Scope the shot to the story root, NOT the full page. This is a
        // correctness issue, not a tidiness one: a full-page shot measures the
        // changed pixels against the whole 1280x720 viewport, most of which is
        // empty margin. A deliberate test — recolouring the MyBKY progress bar
        // fill from blue to red — produced roughly 2,560 changed pixels out of
        // ~920,000, i.e. 0.28%, which sat close enough to the diff tolerance
        // that anti-aliasing pushed it under and the suite PASSED on a change
        // that was plainly visible in the browser. Cropping to the rendered
        // content makes the ratio describe the component instead of the
        // whitespace around it, so small components are no longer effectively
        // exempt from their own baseline.
        await expect(page.locator('#storybook-root')).toHaveScreenshot(
          `${story.id}.png`,
          PER_STORY_SCREENSHOT_OPTIONS[story.id],
        );
      } catch (err) {
        // Keep the first few lines, not just the first. Playwright puts the
        // pixel count and ratio on the lines AFTER the summary, and discarding
        // them makes a failure impossible to tune or even understand — which is
        // exactly what happened the first time icon--library went red.
        failures.push(
          `${story.id}: ${(err as Error).message.split('\n').slice(0, 4).join(' ').trim()}`,
        );
      }
    }

    testInfo.annotations.push({ type: 'stories', description: String(stories.length) });

    if (failures.length) {
      throw new Error(
        `${failures.length} of ${stories.length} stories differ from baseline:\n` +
          failures.map((f) => `  - ${f}`).join('\n'),
      );
    }
  });
});
