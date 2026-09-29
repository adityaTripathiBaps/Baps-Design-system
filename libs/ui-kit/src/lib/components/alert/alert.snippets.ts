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
 * 1. `libs/tokens/build/css/tokens.css` — the palette and type scale.
 * 2. `libs/ui-kit/src/lib/styles/components/alert/_alert.scss` — compiles on
 *    its own; the Angular component loads the same file via `styleUrls`, which
 *    is what stops the two from drifting.
 * 3. `styles/layout/fonts` + `styles/layout/common`, plus the app's own
 *    `html { font-size: 16px; font-family: var(--font-family) }` rule — nothing
 *    in ui-kit applies a base font; without it the page falls back to a serif.
 * 4. **PrimeIcons** — `primeicons/primeicons.css` and the `fonts/` directory
 *    next to it. The icons here are `<i class="pi pi-…">` glyphs from that
 *    font, and this is the one dependency card did not have. PrimeIcons is the
 *    icon font, not PrimeNG: no component code comes with it.
 *
 * ## Known gap
 *
 * Same as card: `libs/ui-kit/package.json` declares no `exports` and
 * `@org/ui-kit` resolves through a tsconfig path alias, not a node_modules
 * link, so there is no package path for the stylesheet yet. Inside this repo
 * the partial is reachable by relative path, the way
 * `apps/storybook-host/src/styles.scss` loads it.
 */
export type SnippetSet = { react?: string; next?: string; primeng?: string; custom?: string };

const SETUP = `/* Once, at your app's entry. Paths are relative because no package export
   exists yet — see alert.snippets.ts.

     import '<repo>/libs/tokens/build/css/tokens.css';
     import 'primeicons/primeicons.css';        // the pi-* glyphs below

   in your global stylesheet:

     @use '<repo>/libs/ui-kit/src/lib/styles/layout/fonts';
     @use '<repo>/libs/ui-kit/src/lib/styles/layout/common';
     @use '<repo>/libs/ui-kit/src/lib/styles/components/alert/alert';

   and the base rule, which is the app's own — no ui-kit partial applies it:

     html { font-size: 16px; font-family: var(--font-family); }
*/`;

export const alertSnippets: Record<string, SnippetSet> = {
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
