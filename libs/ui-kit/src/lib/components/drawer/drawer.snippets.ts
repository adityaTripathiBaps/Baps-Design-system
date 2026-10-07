/**
 * Framework snippets for the Drawer docs page.
 *
 * ## How it maps
 *
 * The Angular `baps-drawer` component wraps PrimeNG's `p-drawer`.
 *
 * In React, you build the raw DOM structure that the design system CSS expects.
 * No PrimeReact is used. You conditionally render the drawer and mask, and
 * apply the `.p-drawer` classes.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('drawer', true);

export const drawerSnippets: Record<string, SnippetSet> = {
  Playground: {
    react: `${SETUP}

import { useState } from 'react';

export function Playground() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <button className="baps-button baps-button--primary" onClick={() => setVisible(true)}>
        Open filters
      </button>

      {visible && (
        <div className="p-drawer-mask p-component-overlay p-component-overlay-enter" style={{ zIndex: 1100 }}>
          <div className="p-drawer p-component p-drawer-right p-drawer-enter baps-ds-sampark" role="complementary" style={{ width: '400px' }}>
            <div className="p-drawer-header">
              <span className="p-drawer-title">Filters</span>
              <div className="baps-drawer__actions">
                <button className="baps-button baps-button--ghost-secondary baps-button--s" onClick={() => setVisible(false)}>Clear All</button>
                <button className="baps-button baps-button--primary baps-button--s" onClick={() => setVisible(false)}>Apply</button>
              </div>
              <button className="p-drawer-close p-link" type="button" onClick={() => setVisible(false)}>
                <span className="p-drawer-close-icon pi pi-times"></span>
              </button>
            </div>
            <div className="p-drawer-content">
              {/* Drawer content goes here */}
              <label><input type="checkbox" /> Family</label>
            </div>
            <div className="p-drawer-footer">
              Showing 24 of 180 results
            </div>
          </div>
        </div>
      )}
    </>
  );
}`,
  },
  Open: {
    react: `${SETUP}

export function Open() {
  return (
    <div className="p-drawer p-component p-drawer-right baps-ds-sampark" style={{ position: 'relative', transform: 'none', width: '400px', height: '400px' }}>
      <div className="p-drawer-header">
        <span className="p-drawer-title">Header</span>
      </div>
      <div className="p-drawer-content">Content</div>
    </div>
  );
}`,
  },
  FilterPanel: {
    react: `${SETUP}

export function FilterPanel() {
  return (
    <div className="p-drawer p-component p-drawer-right baps-ds-sampark" style={{ position: 'relative', transform: 'none', width: '450px', height: '400px' }}>
      <div className="p-drawer-header">
        <span className="p-drawer-title">Filters</span>
      </div>
      <div className="p-drawer-content">
        <label><input type="checkbox" /> Filter Option</label>
      </div>
    </div>
  );
}`,
  },
  Positions: {
    react: `${SETUP}

export function Positions() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div className="p-drawer p-component p-drawer-left" style={{ position: 'relative', transform: 'none', width: '200px', height: '200px' }}>
        <div className="p-drawer-header"><span className="p-drawer-title">Left</span></div>
      </div>
      <div className="p-drawer p-component p-drawer-top" style={{ position: 'relative', transform: 'none', width: '200px', height: '200px' }}>
        <div className="p-drawer-header"><span className="p-drawer-title">Top</span></div>
      </div>
    </div>
  );
}`,
  },
  NonDismissible: {
    react: `${SETUP}

export function NonDismissible() {
  return (
    <div className="p-drawer p-component p-drawer-right baps-ds-sampark" style={{ position: 'relative', transform: 'none', width: '400px', height: '200px' }}>
      <div className="p-drawer-header">
        <span className="p-drawer-title">Required Action</span>
        {/* No close button rendered */}
      </div>
      <div className="p-drawer-content">You must click accept or decline.</div>
    </div>
  );
}`,
  },
};
