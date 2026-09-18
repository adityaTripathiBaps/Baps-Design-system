/**
 * Framework snippets for the Spinner docs page, keyed by story export name.
 *
 * `baps-spinner` is not a PrimeNG wrapper — it draws its own two-circle SVG and
 * its CSS has no `.p-*` selector — so this is the card/alert shape: the Custom
 * tab is the SAME markup the Angular component renders, and
 * `styles/components/spinner/_spinner.scss` (moved out of the component, byte
 * for byte) styles it when Angular is not there.
 *
 * ## Inputs become classes
 *
 *   size="small"        -> class="baps-spinner-small"
 *   brand="sampark"     -> class="baps-sampark"
 *   no `value` (or null) -> class="baps-spinner-indeterminate", and the CSS
 *                           supplies the rotation
 *
 * ## The one thing a snippet has to resolve: the arc maths
 *
 * The component computes `stroke-dasharray` and `stroke-dashoffset` from the
 * circle's circumference —
 *
 *     const CIRCUMFERENCE = 2 * Math.PI * 14;          // r=14 -> 87.96459430051421
 *     dashArray  = determinate ? C : `${C / 4} ${C}`
 *     dashOffset = determinate ? C * (100 - value) / 100 : 0
 *
 * — so raw markup cannot say `[attr.stroke-dasharray]="dashArray"`. Every value
 * below is the resolved number, computed from that same formula rather than
 * eyeballed:
 *
 *     indeterminate   dasharray "21.991148575128552 87.96459430051421", offset 0
 *     value=0         offset 87.96459430051421      (full ring hidden)
 *     value=25        offset 65.97344572538566
 *     value=50        offset 43.982297150257104
 *     value=75        offset 21.99114857512855
 *     value=90        offset 8.796459430051414
 *     value=100       offset 0                      (full ring shown)
 *
 * A consumer driving this from real data computes the offset the same way; the
 * literals here are what the documented examples render, not a suggestion to
 * hardcode progress.
 *
 * ## Accessibility is not decoration here
 *
 * The component swaps role and ARIA by mode: `role="status"` while
 * indeterminate, `role="progressbar"` with aria-valuenow/min/max once it has a
 * value. Copy whichever matches — a progressbar with no value announces
 * nothing useful, and a status with a value announces a number that never
 * changes.
 */
export type SnippetSet = { react?: string; next?: string; primeng?: string; custom?: string };

/** Stated once; the same loads sit behind every snippet on this page. */
const SETUP = `/* Once, at your app's entry. Paths are relative because no package export
   exists yet — see card.snippets.ts for the packaging note.

     import '<repo>/libs/tokens/build/css/tokens.css';

   in your global stylesheet:

     @use '<repo>/libs/ui-kit/src/lib/styles/layout/fonts';
     @use '<repo>/libs/ui-kit/src/lib/styles/layout/common';
     @use '<repo>/libs/ui-kit/src/lib/styles/components/spinner/spinner';
*/`;

/** The circle pair, identical in every example bar the dash attributes. */
const svg = (arr: string, off: string) =>
  `      <svg class="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle class="baps-spinner-track" cx="16" cy="16" r="14"></circle>
        <circle class="baps-spinner-arc" cx="16" cy="16" r="14" stroke-dasharray="${arr}" stroke-dashoffset="${off}"></circle>
      </svg>`;

const C = '87.96459430051421';
const QUARTER = '21.991148575128552';

const determinate = (value: number, offset: string, cls = '') =>
  `  <baps-spinner class="${cls}" role="progressbar" aria-label="Loading" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100">
${svg(C, offset)}
  </baps-spinner>`;

export const spinnerSnippets: Record<string, SnippetSet> = {
  Indeterminate: {
    primeng: `<baps-spinner size="small" />`,
    custom: `<!-- No value means indeterminate: role="status", a quarter-circle arc, and
     the rotation comes from the stylesheet rather than from an attribute. -->
<baps-spinner class="baps-spinner-small baps-spinner-indeterminate" role="status" aria-label="Loading">
${svg(`${QUARTER} ${C}`, '0')}
</baps-spinner>`,
    react: `${SETUP}

export function Indeterminate() {
  return (
    <baps-spinner class="baps-spinner-small baps-spinner-indeterminate" role="status" aria-label="Loading">
      <svg className="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle className="baps-spinner-track" cx="16" cy="16" r="14" />
        <circle className="baps-spinner-arc" cx="16" cy="16" r="14" strokeDasharray="${QUARTER} ${C}" strokeDashoffset="0" />
      </svg>
    </baps-spinner>
  );
}`,
    next: `'use client';

${SETUP}

export default function Indeterminate() {
  return (
    <baps-spinner class="baps-spinner-small baps-spinner-indeterminate" role="status" aria-label="Loading">
      <svg className="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle className="baps-spinner-track" cx="16" cy="16" r="14" />
        <circle className="baps-spinner-arc" cx="16" cy="16" r="14" strokeDasharray="${QUARTER} ${C}" strokeDashoffset="0" />
      </svg>
    </baps-spinner>
  );
}`,
  },

  DeterminateSteps: {
    primeng: `<!-- The dark ground is the story's own, not the component's — the arc is
     drawn in the brand colour and the track is translucent. -->
<div style="display: flex; gap: 1.25rem; align-items: center; background: #333; padding: 1.25rem">
  <baps-spinner [value]="0" />
  <baps-spinner [value]="25" />
  <baps-spinner [value]="50" />
  <baps-spinner [value]="75" />
  <baps-spinner [value]="90" />
  <baps-spinner [value]="100" />
</div>`,
    custom: `<!-- stroke-dashoffset is the progress. offset = C * (100 - value) / 100,
     with C = 2 * PI * 14 = 87.96459430051421. Driving this from real data
     means computing the offset, not copying these numbers. -->
<div style="display: flex; gap: 1.25rem; align-items: center; background: #333; padding: 1.25rem">
${determinate(0, C)}
${determinate(25, '65.97344572538566')}
${determinate(50, '43.982297150257104')}
${determinate(75, '21.99114857512855')}
${determinate(90, '8.796459430051414')}
${determinate(100, '0')}
</div>`,
    react: `${SETUP}

const C = 2 * Math.PI * 14;
const offsetFor = (value) => (C * (100 - value)) / 100;

export function DeterminateSteps() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#333', padding: '1.25rem' }}>
      {[0, 25, 50, 75, 90, 100].map((value) => (
        <baps-spinner key={value} role="progressbar" aria-label="Loading" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
          <svg className="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <circle className="baps-spinner-track" cx="16" cy="16" r="14" />
            <circle className="baps-spinner-arc" cx="16" cy="16" r="14" strokeDasharray={C} strokeDashoffset={offsetFor(value)} />
          </svg>
        </baps-spinner>
      ))}
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const C = 2 * Math.PI * 14;
const offsetFor = (value) => (C * (100 - value)) / 100;

export default function DeterminateSteps() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#333', padding: '1.25rem' }}>
      {[0, 25, 50, 75, 90, 100].map((value) => (
        <baps-spinner key={value} role="progressbar" aria-label="Loading" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
          <svg className="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <circle className="baps-spinner-track" cx="16" cy="16" r="14" />
            <circle className="baps-spinner-arc" cx="16" cy="16" r="14" strokeDasharray={C} strokeDashoffset={offsetFor(value)} />
          </svg>
        </baps-spinner>
      ))}
    </div>
  );
}`,
  },

  Sizes: {
    primeng: `<div style="display: flex; gap: 1.25rem; align-items: center; background: #333; padding: 1.25rem">
  <baps-spinner size="small" brand="mybky" />
  <baps-spinner size="large" brand="mybky" />
  <baps-spinner size="small" brand="sampark" />
  <baps-spinner size="large" brand="sampark" />
</div>`,
    custom: `<!-- "large" is the default: there is no baps-spinner-large class, only the
     small modifier. brand="sampark" becomes .baps-sampark. All four are
     indeterminate, so all four carry role="status". -->
<div style="display: flex; gap: 1.25rem; align-items: center; background: #333; padding: 1.25rem">
  <baps-spinner class="baps-spinner-small baps-spinner-indeterminate" role="status" aria-label="Loading">
${svg(`${QUARTER} ${C}`, '0')}
  </baps-spinner>
  <baps-spinner class="baps-spinner-indeterminate" role="status" aria-label="Loading">
${svg(`${QUARTER} ${C}`, '0')}
  </baps-spinner>
  <baps-spinner class="baps-sampark baps-spinner-small baps-spinner-indeterminate" role="status" aria-label="Loading">
${svg(`${QUARTER} ${C}`, '0')}
  </baps-spinner>
  <baps-spinner class="baps-sampark baps-spinner-indeterminate" role="status" aria-label="Loading">
${svg(`${QUARTER} ${C}`, '0')}
  </baps-spinner>
</div>`,
    react: `${SETUP}

const Spinner = ({ className = '' }) => (
  <baps-spinner class={\`\${className} baps-spinner-indeterminate\`.trim()} role="status" aria-label="Loading">
    <svg className="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle className="baps-spinner-track" cx="16" cy="16" r="14" />
      <circle className="baps-spinner-arc" cx="16" cy="16" r="14" strokeDasharray="${QUARTER} ${C}" strokeDashoffset="0" />
    </svg>
  </baps-spinner>
);

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#333', padding: '1.25rem' }}>
      <Spinner className="baps-spinner-small" />
      <Spinner />
      <Spinner className="baps-sampark baps-spinner-small" />
      <Spinner className="baps-sampark" />
    </div>
  );
}`,
    next: `'use client';

${SETUP}

const Spinner = ({ className = '' }) => (
  <baps-spinner class={\`\${className} baps-spinner-indeterminate\`.trim()} role="status" aria-label="Loading">
    <svg className="baps-spinner-svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle className="baps-spinner-track" cx="16" cy="16" r="14" />
      <circle className="baps-spinner-arc" cx="16" cy="16" r="14" strokeDasharray="${QUARTER} ${C}" strokeDashoffset="0" />
    </svg>
  </baps-spinner>
);

export default function Sizes() {
  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: '#333', padding: '1.25rem' }}>
      <Spinner className="baps-spinner-small" />
      <Spinner />
      <Spinner className="baps-sampark baps-spinner-small" />
      <Spinner className="baps-sampark" />
    </div>
  );
}`,
  },
};
