/**
 * Framework snippets for the Listbox docs page.
 *
 * ## How it maps
 *
 * The Angular `baps-listbox` component wraps PrimeNG's `p-listbox` and uses
 * `baps-menu-item` to render each row.
 *
 * In React, without PrimeReact, you can render a native `<select multiple>`
 * or a custom styled `<ul>`/`<li>` list for rich templates.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('listbox', true);

export const listboxSnippets: Record<string, SnippetSet> = {
  ListboxPlayground: {
    react: `${SETUP}

export function ListboxPlayground() {
  return (
    <div className="field" style={{ width: '250px' }}>
      <select className="p-inputtext" size={5} aria-label="Select City">
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
  MultiSelectWithCheckboxes: {
    react: `${SETUP}

export function MultiSelectWithCheckboxes() {
  return (
    <div className="field" style={{ width: '250px' }}>
      <select className="p-inputtext" multiple size={5} aria-label="Select Cities">
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
  WithFiltering: {
    react: `${SETUP}

export function WithFiltering() {
  return (
    <div className="field" style={{ width: '250px' }}>
      <div className="p-listbox p-component">
        <div className="p-listbox-header">
          <div className="p-iconfield">
            <span className="p-inputicon pi pi-search"></span>
            <input className="p-inputtext p-listbox-filter" type="text" placeholder="Search..." />
          </div>
        </div>
        <div className="p-listbox-list-wrapper">
          <ul className="p-listbox-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>New York</li>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>Rome</li>
          </ul>
        </div>
      </div>
    </div>
  );
}`,
  },
  Grouped: {
    react: `${SETUP}

export function Grouped() {
  return (
    <div className="field" style={{ width: '250px' }}>
      <div className="p-listbox p-component">
        <div className="p-listbox-list-wrapper">
          <ul className="p-listbox-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li className="p-listbox-item-group" style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>Germany</li>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>Berlin</li>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>Frankfurt</li>
            <li className="p-listbox-item-group" style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>USA</li>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>Chicago</li>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>Los Angeles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}`,
  },
  RichTemplatePanelList: {
    react: `${SETUP}

export function RichTemplatePanelList() {
  return (
    <div className="field" style={{ width: '320px' }}>
      <div className="p-listbox p-component">
        <div className="p-listbox-list-wrapper">
          <ul className="p-listbox-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Design System</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-mybky-text-muted)' }}>UI Kit</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}`,
  },
  CustomTemplatesUsingPTemplate: {
    react: `${SETUP}

export function CustomTemplatesUsingPTemplate() {
  return (
    <div className="field" style={{ width: '320px' }}>
      <div className="p-listbox p-component">
        <div className="p-listbox-list-wrapper">
          <ul className="p-listbox-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            <li className="p-listbox-item" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="pi pi-flag"></i>
                <span>Custom Template Row</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}`,
  },
  DisabledAndInvalid: {
    react: `${SETUP}

export function DisabledAndInvalid() {
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div className="field" style={{ width: '250px' }}>
        <select className="p-inputtext p-invalid" size={5} aria-label="Invalid">
          <option value="NY">New York</option>
        </select>
      </div>
      <div className="field" style={{ width: '250px' }}>
        <select className="p-inputtext" size={5} disabled aria-label="Disabled">
          <option value="NY">New York</option>
        </select>
      </div>
    </div>
  );
}`,
  },
};
