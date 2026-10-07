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

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export function Accordion() {
  const sections = [
    { value: 'region', label: 'Region', count: 3, content: 'Ahmedabad, London, Nairobi' },
    { value: 'sabha', label: 'Sabha', count: 2, content: 'Yuva Sabha, Bal Sabha' },
    { value: 'status', label: 'Status', count: 4, content: 'Complete, Pending, Draft, Archived' },
  ];

  return (
    <div style={{ width: 452 }}>
      <BapsAccordion defaultValue="region">
        {sections.map(s => (
          <BapsAccordionPanel key={s.value} value={s.value} label={s.label} count={s.count}>
            <div style={{ padding: '0 0.5rem' }}>{s.content}</div>
          </BapsAccordionPanel>
        ))}
      </BapsAccordion>
    </div>
  );
}`,
  },
  Multiple: {
    react: `${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export function AccordionMultiple() {
  return (
    <div style={{ width: 452 }}>
      <BapsAccordion multiple defaultValue={['region', 'status']}>
        {[
          { value: 'region', label: 'Region', count: 2 },
          { value: 'status', label: 'Status', count: 2 },
        ].map(s => (
          <BapsAccordionPanel key={s.value} value={s.value} label={s.label} count={s.count}>
            <div style={{ padding: '0 0.5rem' }}>Content for {s.label}</div>
          </BapsAccordionPanel>
        ))}
      </BapsAccordion>
    </div>
  );
}`,
  },
  WithoutCount: {
    react: `${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export function AccordionWithoutCount() {
  return (
    <div style={{ width: 452 }}>
      <BapsAccordion defaultValue="about">
        <BapsAccordionPanel value="about" label="About this project">
          <div style={{ padding: '0 0.5rem' }}>Without the count badge the label shifts left.</div>
        </BapsAccordionPanel>
      </BapsAccordion>
    </div>
  );
}`,
  },
  Disabled: {
    react: `${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export function AccordionDisabled() {
  return (
    <div style={{ width: 452 }}>
      <BapsAccordion>
        <BapsAccordionPanel value="locked" label="Locked section" count="0" disabled>
          <div style={{ padding: '0 0.5rem' }}>This is locked.</div>
        </BapsAccordionPanel>
      </BapsAccordion>
    </div>
  );
}`,
  },
  Brands: {
    react: `${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export function AccordionBrands() {
  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* MyBKY */}
      <div style={{ width: 452 }}>
        <h4>MyBKY</h4>
        <BapsAccordion brand="mybky" defaultValue="a">
          <BapsAccordionPanel value="a" label="Region" count="3">
            <div style={{ padding: '0 0.5rem' }}>Content</div>
          </BapsAccordionPanel>
        </BapsAccordion>
      </div>
      {/* Sampark */}
      <div className="baps-ds-sampark" style={{ width: 452 }}>
        <h4>Sampark</h4>
        <BapsAccordion brand="sampark" defaultValue="a">
          <BapsAccordionPanel value="a" label="Region" count="3">
            <div style={{ padding: '0 0.5rem' }}>Content</div>
          </BapsAccordionPanel>
        </BapsAccordion>
      </div>
    </div>
  );
}`,
  },
};
