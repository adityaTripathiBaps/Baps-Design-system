/**
 * Framework snippets for the Alert docs page, keyed by story export name.
 *
 * The Custom tab is not in here — it renders Storybook's own source for the
 * story, so the Angular markup on that tab is always the live one.
 *
 * ## Why these are not fiction
 *
 * `baps-alert` is not a PrimeNG wrapper: no `primeng` import, no `p-*` element
 * or class anywhere in the component, and the close button is a plain
 * `<button>`. Its CSS now lives in styles/components/alert/_alert.scss, so the
 * same rules reach markup Angular never rendered.
 *
 * Measured on a bare HTML page with no Angular and no Storybook, against the
 * Angular render of the same stories — every property matched:
 *
 *   box      flex · relative · flex-start · gap 12px · padding 12px 16px 12px 20px
 *            · radius 8px · font 14px/21px Inter Variable
 *   bar      absolute · 4px wide · inset top/left/bottom 0
 *   icon     flex · 18px · margin-top 1px
 *   text     14px · 400 · 21px · #181b1d
 *   close    flex · 24x24 · transparent · radius 4px · cursor pointer
 *
 *   severity   background            bar                 icon
 *   info       rgb(216, 231, 253)    rgb(82, 141, 224)   rgb(34, 101, 195)
 *   success    rgb(216, 253, 235)    rgb(64, 191, 132)   rgb(42, 156, 104)
 *   warning    rgb(253, 237, 216)    rgb(224, 166, 82)   rgb(195, 130, 34)
 *   error      rgba(224, 82, 85, .12) rgb(224, 82, 85)   rgb(195, 34, 38)
 *
 * With the alert partial disabled on that same page the markup went back to
 * transparent with 0 padding — so the partial, not something else on the page,
 * is what styles it.
 *
 * ## Inputs become classes
 *
 * Angular builds the inner structure from its inputs; outside Angular you write
 * that structure yourself. The mapping is one-to-one:
 *
 *   severity="info|success|warning|error" -> class "baps-alert--<severity>"
 *                                            + icon pi-info-circle /
 *                                              pi-check-circle /
 *                                              pi-exclamation-triangle /
 *                                              pi-times-circle
 *   [closable]="true"                     -> class "baps-alert--closable"
 *                                            + the .baps-alert__close button
 *   title="…"                             -> a .baps-alert__title span before
 *                                            .baps-alert__text
 *   brand="sampark"                       -> class "baps-sampark" on <baps-alert>
 *
 * `(closed)` has no markup equivalent — it is an event. The component only
 * emits it and never removes itself, so the consumer owns the dismissal state
 * in every framework; the Dismissible snippet below shows that with useState.
 *
 * ## What a non-Angular page has to load (four, measured)
 *
 * 1. `@org/tokens/css` — the palette and type scale.
 * 2. `@org/ui-kit/styles/alert`, compiled from
 *    `libs/ui-kit/src/lib/styles/components/alert/_alert.scss` — that partial
 *    imports no other; the Angular component loads the same source file via
 *    `styleUrls`, which is what stops the two from drifting.
 * 3. `styles/layout/fonts` + `styles/layout/common`, plus the app's own
 *    `html { font-size: 16px; font-family: var(--font-family) }` rule — nothing
 *    in ui-kit applies a base font; without it the page falls back to a serif.
 * 4. **PrimeIcons** — `primeicons/primeicons.css` and the `fonts/` directory
 *    next to it. The icons here are `<i class="pi pi-…">` glyphs from that
 *    font, and this is the one dependency card did not have. PrimeIcons is the
 *    icon font, not PrimeNG: no component code comes with it.
 *
 * ## Packaging — the gap this file used to record is closed
 *
 * These styles no longer need a relative path. `libs/ui-kit/package.json` now
 * declares `exports` for `./styles` and `./styles/*`, and
 * `libs/ui-kit/scripts/build-styles.mjs` compiles the partials to
 * `dist/libs/ui-kit/styles/*.css` as part of the library build, so a React or
 * Next app in another repo imports `@org/ui-kit/styles`. What each path does
 * and does not carry is measured in `libs/ui-kit/src/lib/docs/snippet-setup.ts`,
 * which is also where the setup block below comes from.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

/** Re-exported so the .mdx and the docs blocks keep importing it from here. */
export type { SnippetSet };

const SETUP = setupFor('alert', true);

export const alertSnippets: Record<string, SnippetSet> = {
  // The same card with pieces removed, which is the point of the example: the
  // parts are independent and the card reflows around whatever is left.
  CardParts: {
    // Every button here needs a handler. The markup alone renders a card whose
    // close and actions do nothing.
    primeng: `<div style="display:flex; flex-direction:column; gap:20px; padding:8px;">
  <baps-alert
    appearance="card"
    severity="success"
    title="Saved"
    timestamp="1 min ago"
    text="No progress bar and no actions — just the header."
    [closable]="true"
  />

  <baps-alert
    appearance="card"
    severity="info"
    text="Text only: no title, no timestamp, no close."
  />

  <baps-alert
    appearance="card"
    severity="info"
    title="Syncing"
    text="Progress bar without a caption or actions."
    [progress]="40"
  />
</div>`,
    custom: `<!-- Every part is optional and the card reflows: drop the progress bar, the
     actions, the timestamp or the close button. The minimum is a leading icon
     plus text. The progress fill's width is inline because the width IS the
     datum — an arbitrary percentage has no static-CSS expression. -->
<div style="display:flex; flex-direction:column; gap:20px; padding:8px;">
  <baps-alert>
    <div class="baps-alert-card baps-alert-card--success" role="status">
      <span class="baps-alert-card__leading">
      <i class="baps-alert-card__icon pi pi-check-circle" aria-hidden="true"></i>
      </span>
      <div class="baps-alert-card__body">
        <div class="baps-alert-card__header">
        <div class="baps-alert-card__title-row">
          <span class="baps-alert-card__title">Saved</span>
          <span class="baps-alert-card__time">1 min ago</span>
        </div>
        <button type="button" class="baps-alert-card__close" aria-label="Close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
        <span class="baps-alert-card__text">No progress bar and no actions — just the header.</span>
        </div>
      </div>
    </div>
  </baps-alert>

  <baps-alert>
    <div class="baps-alert-card baps-alert-card--info" role="status">
      <span class="baps-alert-card__leading">
      <i class="baps-alert-card__icon pi pi-info-circle" aria-hidden="true"></i>
      </span>
      <div class="baps-alert-card__body">
        <div class="baps-alert-card__header">
        <span class="baps-alert-card__text">Text only: no title, no timestamp, no close.</span>
        </div>
      </div>
    </div>
  </baps-alert>

  <baps-alert>
    <div class="baps-alert-card baps-alert-card--info" role="status">
      <span class="baps-alert-card__leading">
      <i class="baps-alert-card__icon pi pi-info-circle" aria-hidden="true"></i>
      </span>
      <div class="baps-alert-card__body">
        <div class="baps-alert-card__header">
        <div class="baps-alert-card__title-row">
          <span class="baps-alert-card__title">Syncing</span>
        </div>
        <span class="baps-alert-card__text">Progress bar without a caption or actions.</span>
        </div>
      <div class="baps-alert-card__progress">
        <div
          class="baps-alert-card__progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="40"
          aria-label="Progress"
        >
          <span class="baps-alert-card__progress-fill" style="width: 40%"></span>
        </div>
      </div>
      </div>
    </div>
  </baps-alert>
</div>`,
    react: `${SETUP}

const ICONS = {
  info: 'pi-info-circle',
  success: 'pi-check-circle',
  warning: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
};

/* One component, every part optional — the same shape the Angular template
   has. Severity picks both the colour class and the glyph; avatarLabel
   replaces the glyph but NOT the severity class, because the Angular input
   defaults to 'info' and the class is bound to that default either way. */
function AlertCard({
  severity = 'info',
  avatarLabel,
  title,
  timestamp,
  text,
  closable,
  onClose,
  progress,
  progressLabel,
  primaryAction,
  onPrimary,
  secondaryAction,
  onSecondary,
}) {
  return (
    <baps-alert>
      <div className={\`baps-alert-card baps-alert-card--\${severity}\`} role="status">
        <span className="baps-alert-card__leading">
          {avatarLabel ? (
            <span className="baps-alert-card__avatar" aria-hidden="true">
              {avatarLabel}
            </span>
          ) : (
            <i className={\`baps-alert-card__icon pi \${ICONS[severity]}\`} aria-hidden="true" />
          )}
        </span>

        <div className="baps-alert-card__body">
          <div className="baps-alert-card__header">
            {(title || timestamp) && (
              <div className="baps-alert-card__title-row">
                {title && <span className="baps-alert-card__title">{title}</span>}
                {timestamp && <span className="baps-alert-card__time">{timestamp}</span>}
              </div>
            )}
            {closable && (
              <button
                type="button"
                className="baps-alert-card__close"
                aria-label="Close"
                onClick={onClose}
              >
                <i className="pi pi-times" aria-hidden="true" />
              </button>
            )}
            {text && <span className="baps-alert-card__text">{text}</span>}
          </div>

          {progress !== undefined && (
            <div className="baps-alert-card__progress">
              <div
                className="baps-alert-card__progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label={progressLabel || 'Progress'}
              >
                {/* The width IS the datum, so it is inline. Nothing else here is. */}
                <span
                  className="baps-alert-card__progress-fill"
                  style={{ width: progress + '%' }}
                />
              </div>
              {progressLabel && (
                <span className="baps-alert-card__progress-label">{progressLabel}</span>
              )}
            </div>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="baps-alert-card__actions">
              {primaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--primary"
                  onClick={onPrimary}
                >
                  {primaryAction}
                </button>
              )}
              {secondaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--secondary"
                  onClick={onSecondary}
                >
                  {secondaryAction}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </baps-alert>
  );
}

export function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 8 }}>
      <AlertCard
        severity="success"
        title="Saved"
        timestamp="1 min ago"
        text="No progress bar and no actions — just the header."
        closable
      />
      <AlertCard
        severity="info"
        text="Text only: no title, no timestamp, no close."
      />
      <AlertCard
        severity="info"
        title="Syncing"
        text="Progress bar without a caption or actions."
        progress={40}
      />
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const ICONS = {
  info: 'pi-info-circle',
  success: 'pi-check-circle',
  warning: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
};

/* One component, every part optional — the same shape the Angular template
   has. Severity picks both the colour class and the glyph; avatarLabel
   replaces the glyph but NOT the severity class, because the Angular input
   defaults to 'info' and the class is bound to that default either way. */
function AlertCard({
  severity = 'info',
  avatarLabel,
  title,
  timestamp,
  text,
  closable,
  onClose,
  progress,
  progressLabel,
  primaryAction,
  onPrimary,
  secondaryAction,
  onSecondary,
}) {
  return (
    <baps-alert>
      <div className={\`baps-alert-card baps-alert-card--\${severity}\`} role="status">
        <span className="baps-alert-card__leading">
          {avatarLabel ? (
            <span className="baps-alert-card__avatar" aria-hidden="true">
              {avatarLabel}
            </span>
          ) : (
            <i className={\`baps-alert-card__icon pi \${ICONS[severity]}\`} aria-hidden="true" />
          )}
        </span>

        <div className="baps-alert-card__body">
          <div className="baps-alert-card__header">
            {(title || timestamp) && (
              <div className="baps-alert-card__title-row">
                {title && <span className="baps-alert-card__title">{title}</span>}
                {timestamp && <span className="baps-alert-card__time">{timestamp}</span>}
              </div>
            )}
            {closable && (
              <button
                type="button"
                className="baps-alert-card__close"
                aria-label="Close"
                onClick={onClose}
              >
                <i className="pi pi-times" aria-hidden="true" />
              </button>
            )}
            {text && <span className="baps-alert-card__text">{text}</span>}
          </div>

          {progress !== undefined && (
            <div className="baps-alert-card__progress">
              <div
                className="baps-alert-card__progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label={progressLabel || 'Progress'}
              >
                {/* The width IS the datum, so it is inline. Nothing else here is. */}
                <span
                  className="baps-alert-card__progress-fill"
                  style={{ width: progress + '%' }}
                />
              </div>
              {progressLabel && (
                <span className="baps-alert-card__progress-label">{progressLabel}</span>
              )}
            </div>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="baps-alert-card__actions">
              {primaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--primary"
                  onClick={onPrimary}
                >
                  {primaryAction}
                </button>
              )}
              {secondaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--secondary"
                  onClick={onSecondary}
                >
                  {secondaryAction}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </baps-alert>
  );
}

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 8 }}>
      <AlertCard
        severity="success"
        title="Saved"
        timestamp="1 min ago"
        text="No progress bar and no actions — just the header."
        closable
      />
      <AlertCard
        severity="info"
        text="Text only: no title, no timestamp, no close."
      />
      <AlertCard
        severity="info"
        title="Syncing"
        text="Progress bar without a caption or actions."
        progress={40}
      />
    </div>
  );
}`,
  },

  // The card appearance is a different template branch, not a modifier on the
  // inline alert: no accent bar, a leading slot that takes an icon OR an
  // avatar, and a body that can carry a title row, a close button, text, a
  // progress bar and two actions. role="status" rather than role="alert" —
  // a card reports progress, it does not interrupt.
  Card: {
    // Every button here needs a handler. The markup alone renders a card whose
    // close and actions do nothing.
    primeng: `<div style="display:flex; flex-direction:column; gap:20px; padding:8px;">
  <baps-alert
    appearance="card"
    severity="info"
    title="New feature released"
    timestamp="2 mins ago"
    text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur."
    [closable]="true"
    [progress]="60"
    progressLabel="60% uploaded..."
    primaryAction="Cancel"
    secondaryAction="Upload Other"
  />

  <baps-alert
    appearance="card"
    severity="success"
    title="Upload complete"
    timestamp="just now"
    text="All 12 files were processed without errors."
    [closable]="true"
    [progress]="100"
    progressLabel="100% uploaded"
    primaryAction="Dismiss"
    secondaryAction="View files"
  />

  <baps-alert
    appearance="card"
    severity="error"
    title="Upload failed"
    timestamp="5 mins ago"
    text="3 of 12 files could not be processed. Check the file format and retry."
    [closable]="true"
    [progress]="25"
    progressLabel="25% uploaded..."
    primaryAction="Retry"
    secondaryAction="Upload Other"
  />

  <baps-alert
    appearance="card"
    avatarLabel="GP"
    title="Ghanshyam Pandey"
    timestamp="2 mins ago"
    text="Shared the Regional Leadership Seminar 2024 roster with you."
    [closable]="true"
    primaryAction="Open"
    secondaryAction="Ignore"
  />
</div>`,
    custom: `<!-- Every part is optional and the card reflows: drop the progress bar, the
     actions, the timestamp or the close button. The minimum is a leading icon
     plus text. The progress fill's width is inline because the width IS the
     datum — an arbitrary percentage has no static-CSS expression. -->
<div style="display:flex; flex-direction:column; gap:20px; padding:8px;">
  <baps-alert>
    <div class="baps-alert-card baps-alert-card--info" role="status">
      <span class="baps-alert-card__leading">
      <i class="baps-alert-card__icon pi pi-info-circle" aria-hidden="true"></i>
      </span>
      <div class="baps-alert-card__body">
        <div class="baps-alert-card__header">
        <div class="baps-alert-card__title-row">
          <span class="baps-alert-card__title">New feature released</span>
          <span class="baps-alert-card__time">2 mins ago</span>
        </div>
        <button type="button" class="baps-alert-card__close" aria-label="Close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
        <span class="baps-alert-card__text">Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur.</span>
        </div>
      <div class="baps-alert-card__progress">
        <div
          class="baps-alert-card__progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="60"
          aria-label="60% uploaded..."
        >
          <span class="baps-alert-card__progress-fill" style="width: 60%"></span>
        </div>
        <span class="baps-alert-card__progress-label">60% uploaded...</span>
      </div>
      <div class="baps-alert-card__actions">
        <button type="button" class="baps-alert-card__action baps-alert-card__action--primary">Cancel</button>
        <button type="button" class="baps-alert-card__action baps-alert-card__action--secondary">Upload Other</button>
      </div>
      </div>
    </div>
  </baps-alert>

  <baps-alert>
    <div class="baps-alert-card baps-alert-card--success" role="status">
      <span class="baps-alert-card__leading">
      <i class="baps-alert-card__icon pi pi-check-circle" aria-hidden="true"></i>
      </span>
      <div class="baps-alert-card__body">
        <div class="baps-alert-card__header">
        <div class="baps-alert-card__title-row">
          <span class="baps-alert-card__title">Upload complete</span>
          <span class="baps-alert-card__time">just now</span>
        </div>
        <button type="button" class="baps-alert-card__close" aria-label="Close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
        <span class="baps-alert-card__text">All 12 files were processed without errors.</span>
        </div>
      <div class="baps-alert-card__progress">
        <div
          class="baps-alert-card__progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="100"
          aria-label="100% uploaded"
        >
          <span class="baps-alert-card__progress-fill" style="width: 100%"></span>
        </div>
        <span class="baps-alert-card__progress-label">100% uploaded</span>
      </div>
      <div class="baps-alert-card__actions">
        <button type="button" class="baps-alert-card__action baps-alert-card__action--primary">Dismiss</button>
        <button type="button" class="baps-alert-card__action baps-alert-card__action--secondary">View files</button>
      </div>
      </div>
    </div>
  </baps-alert>

  <baps-alert>
    <div class="baps-alert-card baps-alert-card--error" role="status">
      <span class="baps-alert-card__leading">
      <i class="baps-alert-card__icon pi pi-times-circle" aria-hidden="true"></i>
      </span>
      <div class="baps-alert-card__body">
        <div class="baps-alert-card__header">
        <div class="baps-alert-card__title-row">
          <span class="baps-alert-card__title">Upload failed</span>
          <span class="baps-alert-card__time">5 mins ago</span>
        </div>
        <button type="button" class="baps-alert-card__close" aria-label="Close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
        <span class="baps-alert-card__text">3 of 12 files could not be processed. Check the file format and retry.</span>
        </div>
      <div class="baps-alert-card__progress">
        <div
          class="baps-alert-card__progress-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="25"
          aria-label="25% uploaded..."
        >
          <span class="baps-alert-card__progress-fill" style="width: 25%"></span>
        </div>
        <span class="baps-alert-card__progress-label">25% uploaded...</span>
      </div>
      <div class="baps-alert-card__actions">
        <button type="button" class="baps-alert-card__action baps-alert-card__action--primary">Retry</button>
        <button type="button" class="baps-alert-card__action baps-alert-card__action--secondary">Upload Other</button>
      </div>
      </div>
    </div>
  </baps-alert>

  <baps-alert>
    <div class="baps-alert-card baps-alert-card--info" role="status">
      <span class="baps-alert-card__leading">
      <span class="baps-alert-card__avatar" aria-hidden="true">GP</span>
      </span>
      <div class="baps-alert-card__body">
        <div class="baps-alert-card__header">
        <div class="baps-alert-card__title-row">
          <span class="baps-alert-card__title">Ghanshyam Pandey</span>
          <span class="baps-alert-card__time">2 mins ago</span>
        </div>
        <button type="button" class="baps-alert-card__close" aria-label="Close">
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
        <span class="baps-alert-card__text">Shared the Regional Leadership Seminar 2024 roster with you.</span>
        </div>
      <div class="baps-alert-card__actions">
        <button type="button" class="baps-alert-card__action baps-alert-card__action--primary">Open</button>
        <button type="button" class="baps-alert-card__action baps-alert-card__action--secondary">Ignore</button>
      </div>
      </div>
    </div>
  </baps-alert>
</div>`,
    react: `${SETUP}

const ICONS = {
  info: 'pi-info-circle',
  success: 'pi-check-circle',
  warning: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
};

/* One component, every part optional — the same shape the Angular template
   has. Severity picks both the colour class and the glyph; avatarLabel
   replaces the glyph but NOT the severity class, because the Angular input
   defaults to 'info' and the class is bound to that default either way. */
function AlertCard({
  severity = 'info',
  avatarLabel,
  title,
  timestamp,
  text,
  closable,
  onClose,
  progress,
  progressLabel,
  primaryAction,
  onPrimary,
  secondaryAction,
  onSecondary,
}) {
  return (
    <baps-alert>
      <div className={\`baps-alert-card baps-alert-card--\${severity}\`} role="status">
        <span className="baps-alert-card__leading">
          {avatarLabel ? (
            <span className="baps-alert-card__avatar" aria-hidden="true">
              {avatarLabel}
            </span>
          ) : (
            <i className={\`baps-alert-card__icon pi \${ICONS[severity]}\`} aria-hidden="true" />
          )}
        </span>

        <div className="baps-alert-card__body">
          <div className="baps-alert-card__header">
            {(title || timestamp) && (
              <div className="baps-alert-card__title-row">
                {title && <span className="baps-alert-card__title">{title}</span>}
                {timestamp && <span className="baps-alert-card__time">{timestamp}</span>}
              </div>
            )}
            {closable && (
              <button
                type="button"
                className="baps-alert-card__close"
                aria-label="Close"
                onClick={onClose}
              >
                <i className="pi pi-times" aria-hidden="true" />
              </button>
            )}
            {text && <span className="baps-alert-card__text">{text}</span>}
          </div>

          {progress !== undefined && (
            <div className="baps-alert-card__progress">
              <div
                className="baps-alert-card__progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label={progressLabel || 'Progress'}
              >
                {/* The width IS the datum, so it is inline. Nothing else here is. */}
                <span
                  className="baps-alert-card__progress-fill"
                  style={{ width: progress + '%' }}
                />
              </div>
              {progressLabel && (
                <span className="baps-alert-card__progress-label">{progressLabel}</span>
              )}
            </div>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="baps-alert-card__actions">
              {primaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--primary"
                  onClick={onPrimary}
                >
                  {primaryAction}
                </button>
              )}
              {secondaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--secondary"
                  onClick={onSecondary}
                >
                  {secondaryAction}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </baps-alert>
  );
}

export function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 8 }}>
      <AlertCard
        severity="info"
        title="New feature released"
        timestamp="2 mins ago"
        text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur."
        closable
        progress={60}
        progressLabel="60% uploaded..."
        primaryAction="Cancel"
        secondaryAction="Upload Other"
      />
      <AlertCard
        severity="success"
        title="Upload complete"
        timestamp="just now"
        text="All 12 files were processed without errors."
        closable
        progress={100}
        progressLabel="100% uploaded"
        primaryAction="Dismiss"
        secondaryAction="View files"
      />
      <AlertCard
        severity="error"
        title="Upload failed"
        timestamp="5 mins ago"
        text="3 of 12 files could not be processed. Check the file format and retry."
        closable
        progress={25}
        progressLabel="25% uploaded..."
        primaryAction="Retry"
        secondaryAction="Upload Other"
      />
      <AlertCard
        avatarLabel="GP"
        title="Ghanshyam Pandey"
        timestamp="2 mins ago"
        text="Shared the Regional Leadership Seminar 2024 roster with you."
        closable
        primaryAction="Open"
        secondaryAction="Ignore"
      />
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const ICONS = {
  info: 'pi-info-circle',
  success: 'pi-check-circle',
  warning: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
};

/* One component, every part optional — the same shape the Angular template
   has. Severity picks both the colour class and the glyph; avatarLabel
   replaces the glyph but NOT the severity class, because the Angular input
   defaults to 'info' and the class is bound to that default either way. */
function AlertCard({
  severity = 'info',
  avatarLabel,
  title,
  timestamp,
  text,
  closable,
  onClose,
  progress,
  progressLabel,
  primaryAction,
  onPrimary,
  secondaryAction,
  onSecondary,
}) {
  return (
    <baps-alert>
      <div className={\`baps-alert-card baps-alert-card--\${severity}\`} role="status">
        <span className="baps-alert-card__leading">
          {avatarLabel ? (
            <span className="baps-alert-card__avatar" aria-hidden="true">
              {avatarLabel}
            </span>
          ) : (
            <i className={\`baps-alert-card__icon pi \${ICONS[severity]}\`} aria-hidden="true" />
          )}
        </span>

        <div className="baps-alert-card__body">
          <div className="baps-alert-card__header">
            {(title || timestamp) && (
              <div className="baps-alert-card__title-row">
                {title && <span className="baps-alert-card__title">{title}</span>}
                {timestamp && <span className="baps-alert-card__time">{timestamp}</span>}
              </div>
            )}
            {closable && (
              <button
                type="button"
                className="baps-alert-card__close"
                aria-label="Close"
                onClick={onClose}
              >
                <i className="pi pi-times" aria-hidden="true" />
              </button>
            )}
            {text && <span className="baps-alert-card__text">{text}</span>}
          </div>

          {progress !== undefined && (
            <div className="baps-alert-card__progress">
              <div
                className="baps-alert-card__progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label={progressLabel || 'Progress'}
              >
                {/* The width IS the datum, so it is inline. Nothing else here is. */}
                <span
                  className="baps-alert-card__progress-fill"
                  style={{ width: progress + '%' }}
                />
              </div>
              {progressLabel && (
                <span className="baps-alert-card__progress-label">{progressLabel}</span>
              )}
            </div>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="baps-alert-card__actions">
              {primaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--primary"
                  onClick={onPrimary}
                >
                  {primaryAction}
                </button>
              )}
              {secondaryAction && (
                <button
                  type="button"
                  className="baps-alert-card__action baps-alert-card__action--secondary"
                  onClick={onSecondary}
                >
                  {secondaryAction}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </baps-alert>
  );
}

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 8 }}>
      <AlertCard
        severity="info"
        title="New feature released"
        timestamp="2 mins ago"
        text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid pariatur."
        closable
        progress={60}
        progressLabel="60% uploaded..."
        primaryAction="Cancel"
        secondaryAction="Upload Other"
      />
      <AlertCard
        severity="success"
        title="Upload complete"
        timestamp="just now"
        text="All 12 files were processed without errors."
        closable
        progress={100}
        progressLabel="100% uploaded"
        primaryAction="Dismiss"
        secondaryAction="View files"
      />
      <AlertCard
        severity="error"
        title="Upload failed"
        timestamp="5 mins ago"
        text="3 of 12 files could not be processed. Check the file format and retry."
        closable
        progress={25}
        progressLabel="25% uploaded..."
        primaryAction="Retry"
        secondaryAction="Upload Other"
      />
      <AlertCard
        avatarLabel="GP"
        title="Ghanshyam Pandey"
        timestamp="2 mins ago"
        text="Shared the Regional Leadership Seminar 2024 roster with you."
        closable
        primaryAction="Open"
        secondaryAction="Ignore"
      />
    </div>
  );
}`,
  },

  // The meta's own args: one inline info alert with a title and a close button.
  // Severity picks the icon as well as the colour — pi-info-circle here, and
  // pi-check-circle / pi-exclamation-triangle / pi-times-circle for the other
  // three — so outside Angular you write the glyph the severity implies.
  Default: {
    // The close button needs React state, same as Dismissible: the markup
    // alone renders an alert whose X does nothing.
    primeng: `<baps-alert
  severity="info"
  appearance="inline"
  [closable]="true"
  title="Document Update"
  text="A new file has been uploaded to your center."
  (closed)="dismissed = true"
/>`,
    custom: `<baps-alert>
  <div class="baps-alert baps-alert--info baps-alert--closable" role="alert">
    <span class="baps-alert__bar" aria-hidden="true"></span>
    <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-info-circle"></i></span>
    <span class="baps-alert__content">
      <span class="baps-alert__title">Document Update</span>
      <span class="baps-alert__text">A new file has been uploaded to your center.</span>
    </span>
    <button type="button" class="baps-alert__close" aria-label="Close">
      <i class="pi pi-times"></i>
    </button>
  </div>
</baps-alert>`,
    react: `${SETUP}

import { useState } from 'react';

export function Example() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <baps-alert>
      <div className="baps-alert baps-alert--info baps-alert--closable" role="alert">
        <span className="baps-alert__bar" aria-hidden="true" />
        <span className="baps-alert__icon" aria-hidden="true">
          <i className="pi pi-info-circle" />
        </span>
        <span className="baps-alert__content">
          <span className="baps-alert__title">Document Update</span>
          <span className="baps-alert__text">A new file has been uploaded to your center.</span>
        </span>
        <button
          type="button"
          className="baps-alert__close"
          aria-label="Close"
          onClick={() => setDismissed(true)}
        >
          <i className="pi pi-times" />
        </button>
      </div>
    </baps-alert>
  );
}`,
    next: `'use client';

${SETUP}

import { useState } from 'react';

export default function Example() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <baps-alert>
      <div className="baps-alert baps-alert--info baps-alert--closable" role="alert">
        <span className="baps-alert__bar" aria-hidden="true" />
        <span className="baps-alert__icon" aria-hidden="true">
          <i className="pi pi-info-circle" />
        </span>
        <span className="baps-alert__content">
          <span className="baps-alert__title">Document Update</span>
          <span className="baps-alert__text">A new file has been uploaded to your center.</span>
        </span>
        <button
          type="button"
          className="baps-alert__close"
          aria-label="Close"
          onClick={() => setDismissed(true)}
        >
          <i className="pi pi-times" />
        </button>
      </div>
    </baps-alert>
  );
}`,
  },

  // The same four severities under the second brand. Nothing about the markup
  // changes except the scope: brand="sampark" on one instance becomes
  // class="baps-sampark" on that element, and a whole page switches by putting
  // .baps-ds-sampark on an ancestor instead. Neither is a different component.
  Sampark: {
    primeng: `<div style="display:flex; flex-direction:column; gap:12px;">
  <baps-alert severity="info" brand="sampark">This is an info alert.</baps-alert>
  <baps-alert severity="success" brand="sampark">This is a success alert.</baps-alert>
  <baps-alert severity="warning" brand="sampark">This is a warning alert.</baps-alert>
  <baps-alert severity="error" brand="sampark">This is an error alert.</baps-alert>
</div>`,
    custom: `<!-- Per instance. For a whole page put .baps-ds-sampark on a wrapper and drop
     .baps-sampark from each alert — the stylesheet carries both selectors. -->
<div style="display:flex; flex-direction:column; gap:12px;">
  <baps-alert>
    <div class="baps-alert baps-sampark baps-alert--info" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-info-circle"></i></span>
      <span class="baps-alert__content"><span class="baps-alert__text">This is an info alert.</span></span>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-sampark baps-alert--success" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-check-circle"></i></span>
      <span class="baps-alert__content"><span class="baps-alert__text">This is a success alert.</span></span>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-sampark baps-alert--warning" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-exclamation-triangle"></i></span>
      <span class="baps-alert__content"><span class="baps-alert__text">This is a warning alert.</span></span>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-sampark baps-alert--error" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-times-circle"></i></span>
      <span class="baps-alert__content"><span class="baps-alert__text">This is an error alert.</span></span>
    </div>
  </baps-alert>
</div>`,
    react: `${SETUP}

const SEVERITIES = [
  ['info', 'pi-info-circle', 'This is an info alert.'],
  ['success', 'pi-check-circle', 'This is a success alert.'],
  ['warning', 'pi-exclamation-triangle', 'This is a warning alert.'],
  ['error', 'pi-times-circle', 'This is an error alert.'],
];

export function SamparkAlerts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {SEVERITIES.map(([severity, icon, message]) => (
        <baps-alert key={severity}>
          <div className={\`baps-alert baps-sampark baps-alert--\${severity}\`} role="alert">
            <span className="baps-alert__bar" aria-hidden="true" />
            <span className="baps-alert__icon" aria-hidden="true">
              <i className={\`pi \${icon}\`} />
            </span>
            <span className="baps-alert__content">
              <span className="baps-alert__text">{message}</span>
            </span>
          </div>
        </baps-alert>
      ))}
    </div>
  );
}`,
    next: `${SETUP}

/* No 'use client': nothing here has state or a handler, so this renders as a
   Server Component. The brand is a class, which is why it costs nothing. */
const SEVERITIES = [
  ['info', 'pi-info-circle', 'This is an info alert.'],
  ['success', 'pi-check-circle', 'This is a success alert.'],
  ['warning', 'pi-exclamation-triangle', 'This is a warning alert.'],
  ['error', 'pi-times-circle', 'This is an error alert.'],
];

export default function SamparkAlerts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {SEVERITIES.map(([severity, icon, message]) => (
        <baps-alert key={severity}>
          <div className={\`baps-alert baps-sampark baps-alert--\${severity}\`} role="alert">
            <span className="baps-alert__bar" aria-hidden="true" />
            <span className="baps-alert__icon" aria-hidden="true">
              <i className={\`pi \${icon}\`} />
            </span>
            <span className="baps-alert__content">
              <span className="baps-alert__text">{message}</span>
            </span>
          </div>
        </baps-alert>
      ))}
    </div>
  );
}`,
  },

  Severities: {
    primeng: `<div style="display:flex; flex-direction:column; gap:12px;">
  <baps-alert severity="info">This is an info alert.</baps-alert>
  <baps-alert severity="success">This is a success alert.</baps-alert>
  <baps-alert severity="warning">This is a warning alert.</baps-alert>
  <baps-alert severity="error">This is an error alert.</baps-alert>
</div>`,
    custom: `<!-- The classes each input produces. baps-alert stays as the outer element:
     every selector in _alert.scss is anchored to it, so a bare <div> would be
     unstyled. It is an unregistered custom element here - no Angular needed. -->
<div style="display:flex; flex-direction:column; gap:12px;">
  <baps-alert>
    <div class="baps-alert baps-alert--info" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-info-circle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__text">This is an info alert.</span>
      </span>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-alert--success" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-check-circle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__text">This is a success alert.</span>
      </span>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-alert--warning" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-exclamation-triangle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__text">This is a warning alert.</span>
      </span>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-alert--error" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-times-circle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__text">This is an error alert.</span>
      </span>
    </div>
  </baps-alert>
</div>`,
    react: `${SETUP}

const ICON = {
  info: 'pi-info-circle',
  success: 'pi-check-circle',
  warning: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
};

function Alert({ severity = 'info', children }) {
  return (
    <baps-alert>
      <div role="alert" className={\`baps-alert baps-alert--\${severity}\`}>
        <span aria-hidden="true" className="baps-alert__bar" />
        <span aria-hidden="true" className="baps-alert__icon">
          <i className={\`pi \${ICON[severity]}\`} />
        </span>
        <span className="baps-alert__content">
          <span className="baps-alert__text">{children}</span>
        </span>
      </div>
    </baps-alert>
  );
}

export function Severities() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert severity="info">This is an info alert.</Alert>
      <Alert severity="success">This is a success alert.</Alert>
      <Alert severity="warning">This is a warning alert.</Alert>
      <Alert severity="error">This is an error alert.</Alert>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const ICON = {
  info: 'pi-info-circle',
  success: 'pi-check-circle',
  warning: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
};

function Alert({ severity = 'info', children }) {
  return (
    <baps-alert>
      <div role="alert" className={\`baps-alert baps-alert--\${severity}\`}>
        <span aria-hidden="true" className="baps-alert__bar" />
        <span aria-hidden="true" className="baps-alert__icon">
          <i className={\`pi \${ICON[severity]}\`} />
        </span>
        <span className="baps-alert__content">
          <span className="baps-alert__text">{children}</span>
        </span>
      </div>
    </baps-alert>
  );
}

export default function Severities() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Alert severity="info">This is an info alert.</Alert>
      <Alert severity="success">This is a success alert.</Alert>
      <Alert severity="warning">This is a warning alert.</Alert>
      <Alert severity="error">This is an error alert.</Alert>
    </div>
  );
}`,
  },

  WithTitle: {
    primeng: `<div style="display:flex; flex-direction:column; gap:12px;">
  <baps-alert severity="warning" title="Session expiring">
    You will be signed out in 5 minutes. Save your work.
  </baps-alert>
  <baps-alert severity="error" title="Upload failed" [closable]="true">
    3 of 12 files could not be processed. Check the file format and retry.
  </baps-alert>
</div>`,
    custom: `<div style="display:flex; flex-direction:column; gap:12px;">
  <baps-alert>
    <div class="baps-alert baps-alert--warning" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-exclamation-triangle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__title">Session expiring</span>
        <span class="baps-alert__text">You will be signed out in 5 minutes. Save your work.</span>
      </span>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-alert--error baps-alert--closable" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-times-circle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__title">Upload failed</span>
        <span class="baps-alert__text">3 of 12 files could not be processed. Check the file format and retry.</span>
      </span>
      <button type="button" class="baps-alert__close" aria-label="Close">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </baps-alert>
</div>`,
    react: `export function WithTitle() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--warning">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-exclamation-triangle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__title">Session expiring</span>
            <span className="baps-alert__text">
              You will be signed out in 5 minutes. Save your work.
            </span>
          </span>
        </div>
      </baps-alert>

      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--error baps-alert--closable">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-times-circle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__title">Upload failed</span>
            <span className="baps-alert__text">
              3 of 12 files could not be processed. Check the file format and retry.
            </span>
          </span>
          <button aria-label="Close" type="button" className="baps-alert__close">
            <i className="pi pi-times" />
          </button>
        </div>
      </baps-alert>
    </div>
  );
}`,
    next: `'use client';

export default function WithTitle() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--warning">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-exclamation-triangle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__title">Session expiring</span>
            <span className="baps-alert__text">
              You will be signed out in 5 minutes. Save your work.
            </span>
          </span>
        </div>
      </baps-alert>

      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--error baps-alert--closable">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-times-circle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__title">Upload failed</span>
            <span className="baps-alert__text">
              3 of 12 files could not be processed. Check the file format and retry.
            </span>
          </span>
          <button aria-label="Close" type="button" className="baps-alert__close">
            <i className="pi pi-times" />
          </button>
        </div>
      </baps-alert>
    </div>
  );
}`,
  },

  // The Angular component emits `closed` and never removes itself, so the
  // dismissal state belongs to the consumer. That is the whole point of the
  // story, and it survives the translation unchanged.
  Dismissible: {
    // The close button needs React state; the markup alone renders an alert
    // that cannot be dismissed, so the shared note belongs on this example.
    primeng: `<!-- The parent owns the state. baps-alert only emits (closed) - it never
     removes itself, so a dismissal you need to remember stays yours to store. -->
<div style="display:flex; flex-direction:column; gap:12px;">
  @if (!dismissed) {
    <baps-alert severity="info" [closable]="true" (closed)="dismissed = true">
      Dismiss me — the parent owns the state, not the alert.
    </baps-alert>
  }
  <baps-alert severity="warning">
    Persistent — no close button, cannot be dismissed.
  </baps-alert>
</div>`,
    custom: `<!-- Without Angular the close button needs its own handler; the markup below
     is the rendered result, and removing the node is the caller's job. -->
<div style="display:flex; flex-direction:column; gap:12px;">
  <baps-alert>
    <div class="baps-alert baps-alert--info baps-alert--closable" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-info-circle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__text">Dismiss me — the parent owns the state, not the alert.</span>
      </span>
      <button type="button" class="baps-alert__close" aria-label="Close">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </baps-alert>
  <baps-alert>
    <div class="baps-alert baps-alert--warning" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-exclamation-triangle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__text">Persistent — no close button, cannot be dismissed.</span>
      </span>
    </div>
  </baps-alert>
</div>`,
    react: `import { useState } from 'react';

export function Dismissible() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {dismissed ? (
        <button type="button" onClick={() => setDismissed(false)}>Restore alert</button>
      ) : (
        <baps-alert>
          <div role="alert" className="baps-alert baps-alert--info baps-alert--closable">
            <span aria-hidden="true" className="baps-alert__bar" />
            <span aria-hidden="true" className="baps-alert__icon">
              <i className="pi pi-info-circle" />
            </span>
            <span className="baps-alert__content">
              <span className="baps-alert__text">
                Dismiss me — the parent owns the state, not the alert.
              </span>
            </span>
            <button
              aria-label="Close"
              type="button"
              className="baps-alert__close"
              onClick={() => setDismissed(true)}
            >
              <i className="pi pi-times" />
            </button>
          </div>
        </baps-alert>
      )}

      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--warning">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-exclamation-triangle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__text">
              Persistent — no close button, cannot be dismissed.
            </span>
          </span>
        </div>
      </baps-alert>
    </div>
  );
}`,
    next: `'use client';

import { useState } from 'react';

export default function Dismissible() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {dismissed ? (
        <button type="button" onClick={() => setDismissed(false)}>Restore alert</button>
      ) : (
        <baps-alert>
          <div role="alert" className="baps-alert baps-alert--info baps-alert--closable">
            <span aria-hidden="true" className="baps-alert__bar" />
            <span aria-hidden="true" className="baps-alert__icon">
              <i className="pi pi-info-circle" />
            </span>
            <span className="baps-alert__content">
              <span className="baps-alert__text">
                Dismiss me — the parent owns the state, not the alert.
              </span>
            </span>
            <button
              aria-label="Close"
              type="button"
              className="baps-alert__close"
              onClick={() => setDismissed(true)}
            >
              <i className="pi pi-times" />
            </button>
          </div>
        </baps-alert>
      )}

      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--warning">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-exclamation-triangle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__text">
              Persistent — no close button, cannot be dismissed.
            </span>
          </span>
        </div>
      </baps-alert>
    </div>
  );
}`,
  },

  FormValidation: {
    primeng: `<div style="max-width: 26rem;">
  <baps-alert severity="error" title="Could not save this karyakar">
    Name is required. Email is not a valid address.
  </baps-alert>
</div>`,
    custom: `<div style="max-width: 26rem;">
  <baps-alert>
    <div class="baps-alert baps-alert--error" role="alert">
      <span class="baps-alert__bar" aria-hidden="true"></span>
      <span class="baps-alert__icon" aria-hidden="true"><i class="pi pi-times-circle"></i></span>
      <span class="baps-alert__content">
        <span class="baps-alert__title">Could not save this karyakar</span>
        <span class="baps-alert__text">Name is required. Email is not a valid address.</span>
      </span>
    </div>
  </baps-alert>
</div>`,
    react: `export function FormValidation() {
  return (
    <div style={{ maxWidth: '26rem' }}>
      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--error">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-times-circle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__title">Could not save this karyakar</span>
            <span className="baps-alert__text">
              Name is required. Email is not a valid address.
            </span>
          </span>
        </div>
      </baps-alert>
    </div>
  );
}`,
    next: `'use client';

export default function FormValidation() {
  return (
    <div style={{ maxWidth: '26rem' }}>
      <baps-alert>
        <div role="alert" className="baps-alert baps-alert--error">
          <span aria-hidden="true" className="baps-alert__bar" />
          <span aria-hidden="true" className="baps-alert__icon">
            <i className="pi pi-times-circle" />
          </span>
          <span className="baps-alert__content">
            <span className="baps-alert__title">Could not save this karyakar</span>
            <span className="baps-alert__text">
              Name is required. Email is not a valid address.
            </span>
          </span>
        </div>
      </baps-alert>
    </div>
  );
}`,
  },
};
