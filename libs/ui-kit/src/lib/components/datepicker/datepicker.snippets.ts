/**
 * Framework snippets for the DatePicker docs page.
 *
 * ## How it maps
 *
 * The Angular `baps-datepicker` component wraps PrimeNG's `p-datepicker`.
 *
 * In React, building a full datepicker calendar from scratch matching the design system
 * is a large task. However, the styling applies to standard `.p-datepicker` classes.
 * You should use a native `<input type="date">` styled with `.p-inputtext`
 * as a functional equivalent that does not require PrimeReact.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('datepicker', true);

export const datepickerSnippets: Record<string, SnippetSet> = {
  Default: {
    react: `${SETUP}

export function Default() {
  return (
    <div className="field" style={{ width: '250px' }}>
      <input type="date" className="p-inputtext" aria-label="Start date" />
    </div>
  );
}`,
  },
  Range: {
    react: `${SETUP}

export function Range() {
  return (
    <div className="field" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input type="date" className="p-inputtext" aria-label="Start date" />
      <span>-</span>
      <input type="date" className="p-inputtext" aria-label="End date" />
    </div>
  );
}`,
  },
  RangeMyBKY: {
    react: `${SETUP}

export function RangeMyBKY() {
  return (
    <div className="field" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input type="date" className="p-inputtext" aria-label="Start date" />
      <span>-</span>
      <input type="date" className="p-inputtext" aria-label="End date" />
    </div>
  );
}`,
  },
  Overlay: {
    react: `${SETUP}

export function Overlay() {
  return (
    <div style={{ height: '380px' }}>
      <div className="field" style={{ width: '250px' }}>
        <input type="date" className="p-inputtext" aria-label="Start date" />
      </div>
    </div>
  );
}`,
  },
  Constrained: {
    react: `${SETUP}

export function Constrained() {
  return (
    <div className="field" style={{ width: '250px' }}>
      <input type="date" className="p-inputtext" min="2026-01-01" max="2026-12-31" aria-label="Start date" />
    </div>
  );
}`,
  },
};
