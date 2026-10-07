/**
 * Framework snippets for the Accordion docs page.
 *
 * ## How it maps
 *
 * Angular uses PrimeNG element tags (`p-accordion`, `p-accordion-panel`,
 * `p-accordion-header`, `p-accordion-content`) with the `bapsAccordion`
 * directive. The BAPS SCSS in `_accordion.scss` keys off PrimeNG's rendered
 * CSS classes: `.p-accordionpanel`, `.p-accordionheader`,
 * `.p-accordioncontent`, etc.
 *
 * In React, replicate the same class structure using `<details>` / `<summary>`
 * or custom `<div>` elements. The design-system CSS classes
 * (`.baps-accordion-count`, `.baps-accordion-label`, `.baps-accordion-body`,
 * `.baps-accordion-divider`, `.baps-accordion-row`, `.baps-accordion-cell`)
 * are framework-agnostic and work in React as-is.
 *
 * ### Sampark scope
 *
 *   The `.baps-ds-sampark` class on a parent or the `baps-sampark` class on
 *   the accordion itself activates the Sampark skin.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('accordion', true);

export const accordionSnippets: Record<string, SnippetSet> = {
  Default: {
    react: `${SETUP}

import { useState } from 'react';

export function Accordion() {
  const [open, setOpen] = useState('region');

  const sections = [
    { value: 'region', label: 'Region', count: 3, content: 'Ahmedabad, London, Nairobi' },
    { value: 'sabha', label: 'Sabha', count: 2, content: 'Yuva Sabha, Bal Sabha' },
    { value: 'status', label: 'Status', count: 4, content: 'Complete, Pending, Draft, Archived' },
  ];

  return (
    <div style={{ width: 452 }}>
      {sections.map(s => (
        <div key={s.value} className="p-accordionpanel" data-p-active={open === s.value}>
          <button
            type="button"
            className="p-accordionheader"
            aria-expanded={open === s.value}
            onClick={() => setOpen(open === s.value ? '' : s.value)}
          >
            <span className="baps-accordion-count" aria-hidden="true">{s.count}</span>
            <span className="baps-accordion-label">{s.label}</span>
            <i className={'pi ' + (open === s.value ? 'pi-chevron-down' : 'pi-chevron-right')} aria-hidden="true" />
          </button>
          {open === s.value && (
            <div className="p-accordioncontent">
              <div className="p-accordioncontent-content">
                <div className="baps-accordion-body">
                  <span className="baps-accordion-divider" />
                  <div style={{ padding: '0 0.5rem' }}>{s.content}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}`,
  },
  Multiple: {
    react: `${SETUP}

import { useState } from 'react';

export function AccordionMultiple() {
  const [open, setOpen] = useState(['region', 'status']);

  const toggle = (value) => {
    setOpen(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div style={{ width: 452 }}>
      {[
        { value: 'region', label: 'Region', count: 2 },
        { value: 'status', label: 'Status', count: 2 },
      ].map(s => (
        <div key={s.value} className="p-accordionpanel" data-p-active={open.includes(s.value)}>
          <button
            type="button"
            className="p-accordionheader"
            aria-expanded={open.includes(s.value)}
            onClick={() => toggle(s.value)}
          >
            <span className="baps-accordion-count" aria-hidden="true">{s.count}</span>
            <span className="baps-accordion-label">{s.label}</span>
            <i className={'pi ' + (open.includes(s.value) ? 'pi-chevron-down' : 'pi-chevron-right')} aria-hidden="true" />
          </button>
          {open.includes(s.value) && (
            <div className="p-accordioncontent">
              <div className="p-accordioncontent-content">
                <div className="baps-accordion-body">
                  <span className="baps-accordion-divider" />
                  <div style={{ padding: '0 0.5rem' }}>Content for {s.label}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}`,
  },
  WithoutCount: {
    react: `${SETUP}

import { useState } from 'react';

export function AccordionWithoutCount() {
  const [open, setOpen] = useState('about');
  return (
    <div style={{ width: 452 }}>
      <div className="p-accordionpanel" data-p-active={open === 'about'}>
        <button
          type="button"
          className="p-accordionheader"
          aria-expanded={open === 'about'}
          onClick={() => setOpen(open === 'about' ? '' : 'about')}
        >
          <span className="baps-accordion-label">About this project</span>
          <i className={'pi ' + (open === 'about' ? 'pi-chevron-down' : 'pi-chevron-right')} aria-hidden="true" />
        </button>
        {open === 'about' && (
          <div className="p-accordioncontent">
            <div className="p-accordioncontent-content">
              <div className="baps-accordion-body">
                <span className="baps-accordion-divider" />
                <div style={{ padding: '0 0.5rem' }}>Without the count badge the label shifts left.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`,
  },
  Disabled: {
    react: `${SETUP}

export function AccordionDisabled() {
  return (
    <div style={{ width: 452 }}>
      <div className="p-accordionpanel p-disabled">
        <button
          type="button"
          className="p-accordionheader"
          aria-expanded={false}
          disabled
        >
          <span className="baps-accordion-count" aria-hidden="true">0</span>
          <span className="baps-accordion-label">Locked section</span>
          <i className="pi pi-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}`,
  },
  Brands: {
    react: `${SETUP}

import { useState } from 'react';

export function AccordionBrands() {
  const [openMy, setOpenMy] = useState('a');
  const [openSp, setOpenSp] = useState('a');
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* MyBKY */}
      <div style={{ width: 452 }}>
        <h4>MyBKY</h4>
        <div className="p-accordionpanel" data-p-active={openMy === 'a'}>
          <button type="button" className="p-accordionheader" onClick={() => setOpenMy(openMy === 'a' ? '' : 'a')}>
            <span className="baps-accordion-count">3</span>
            <span className="baps-accordion-label">Region</span>
            <i className={'pi ' + (openMy === 'a' ? 'pi-chevron-down' : 'pi-chevron-right')} />
          </button>
          {openMy === 'a' && (
            <div className="p-accordioncontent"><div className="p-accordioncontent-content">
              <div className="baps-accordion-body"><span className="baps-accordion-divider" /><div style={{ padding: '0 0.5rem' }}>Content</div></div>
            </div></div>
          )}
        </div>
      </div>
      {/* Sampark */}
      <div className="baps-ds-sampark" style={{ width: 452 }}>
        <h4>Sampark</h4>
        <div className="p-accordionpanel" data-p-active={openSp === 'a'}>
          <button type="button" className="p-accordionheader" onClick={() => setOpenSp(openSp === 'a' ? '' : 'a')}>
            <span className="baps-accordion-count">3</span>
            <span className="baps-accordion-label">Region</span>
            <i className={'pi ' + (openSp === 'a' ? 'pi-chevron-down' : 'pi-chevron-right')} />
          </button>
          {openSp === 'a' && (
            <div className="p-accordioncontent"><div className="p-accordioncontent-content">
              <div className="baps-accordion-body"><span className="baps-accordion-divider" /><div style={{ padding: '0 0.5rem' }}>Content</div></div>
            </div></div>
          )}
        </div>
      </div>
    </div>
  );
}`,
  },
};
