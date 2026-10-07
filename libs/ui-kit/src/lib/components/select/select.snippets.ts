/**
 * Framework snippets for the Select docs page.
 *
 * ## How it maps
 *
 * The Angular `baps-select` component wraps PrimeNG's `p-select`.
 *
 * In React, you use a native `<select>` element styled with `.p-inputtext`.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('select', true);

export const selectSnippets: Record<string, SnippetSet> = {
  Default: {
    react: `${SETUP}

export function Default() {
  return (
    <div className="field" style={{ width: '250px' }}>
      <label htmlFor="city-select">City</label>
      <select id="city-select" className="p-inputtext" aria-label="Select City" defaultValue="">
        <option value="" disabled>Select a city</option>
        <option value="NY">New York</option>
        <option value="RM">Rome</option>
        <option value="LDN">London</option>
        <option value="IST">Istanbul</option>
        <option value="PRS">Paris</option>
      </select>
    </div>
  );
}`,
  },
};
