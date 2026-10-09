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
/*
 * Route B: no Custom tab.
 *
 * Measured: accordion.css is 9 rule blocks and every one of them touches a
 * PrimeNG selector. The panels also open and close through PrimeNG at
 * runtime.
 *
 *
 * The React component emits the same class names, so a consuming app that
 * loads the kit's CSS gets the full look.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('accordion', true);

export const accordionSnippets: Record<string, SnippetSet> = {
  // The reason the component exists: the Sampark filter panel, where each
  // section holds a real control rather than text.
  //
  // Two details are load-bearing and look like styling. `count` is the number
  // of filters ACTIVE in that section, not the number of options — that is
  // what lets a reader see what is filtering a closed panel. And `divider`
  // goes off on a section whose body is a single bordered control, because
  // the control's own top border already draws the rule; leaving it on is
  // the 89px-instead-of-88px row in the Figma frames.
  FilterPanel: {
    react: `${SETUP}

import { useState } from 'react';
import {
  BapsAccordion,
  BapsAccordionPanel,
  BapsMultiSelect,
  BapsCheckbox,
  BapsRadio,
  BapsDatepicker,
} from '@org/ui-kit-react';

const CATEGORIES = ['G-Sampark', 'G-Focus', 'G-Yuva'];
const RESPONSES = ['Positive', 'Neutral', 'Negative'];

export function FilterPanel() {
  const [category, setCategory] = useState(['G-Sampark', 'G-Focus']);
  const [response, setResponse] = useState(['Positive']);
  const [visit, setVisit] = useState({ yes: true, no: false });
  const [status, setStatus] = useState({ complete: true, pending: true });
  const [period, setPeriod] = useState('custom');
  const [from, setFrom] = useState(new Date(2025, 5, 5));
  const [to, setTo] = useState(new Date(2025, 10, 30));

  return (
    <div style={{ width: 452 }}>
      <BapsAccordion
        multiple
        defaultValue={['category', 'visit', 'response', 'submitted', 'status']}
      >
        {/* divider off: the multi-select draws its own top border. */}
        <BapsAccordionPanel
          value="category"
          label="Category"
          count={category.length}
          divider={false}
        >
          <BapsMultiSelect
            ariaLabel="Filter values"
            display="chip"
            appendTo="body"
            placeholder="Select categories"
            options={CATEGORIES.map(name => ({ label: name, value: name }))}
            value={category}
            onValueChange={setCategory}
          />
        </BapsAccordionPanel>

        <BapsAccordionPanel
          value="visit"
          label="Was the Sampark visit completed successfully?"
          count={Object.values(visit).filter(Boolean).length}
        >
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="Yes"
                checked={visit.yes}
                onChange={e => setVisit(v => ({ ...v, yes: e.target.checked }))}
              />
            </div>
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="No"
                checked={visit.no}
                onChange={e => setVisit(v => ({ ...v, no: e.target.checked }))}
              />
            </div>
          </div>
        </BapsAccordionPanel>

        <BapsAccordionPanel
          value="response"
          label="How was the overall response from the family?"
          count={response.length}
          divider={false}
        >
          <BapsMultiSelect
            ariaLabel="Filter values"
            display="chip"
            appendTo="body"
            placeholder="Select response"
            options={RESPONSES.map(name => ({ label: name, value: name }))}
            value={response}
            onValueChange={setResponse}
          />
        </BapsAccordionPanel>

        <BapsAccordionPanel value="submitted" label="Submitted At" count={1}>
          {/* One name across all five, so the browser groups them and the
              arrow keys move between them without any JS. */}
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsRadio
                name="period"
                label="Last Week"
                value="week"
                checked={period === 'week'}
                onChange={() => setPeriod('week')}
              />
            </div>
            <div className="baps-accordion-cell">
              <BapsRadio
                name="period"
                label="Last Month"
                value="month"
                checked={period === 'month'}
                onChange={() => setPeriod('month')}
              />
            </div>
          </div>
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsRadio
                name="period"
                label="Custom Date Range"
                value="custom"
                checked={period === 'custom'}
                onChange={() => setPeriod('custom')}
              />
            </div>
          </div>
          <div className="baps-accordion-daterange">
            <BapsDatepicker
              appendTo="body"
              ariaLabel="From date"
              value={from}
              onValueChange={setFrom}
            />
            <span aria-hidden="true">-</span>
            <BapsDatepicker
              appendTo="body"
              ariaLabel="To date"
              value={to}
              onValueChange={setTo}
            />
          </div>
        </BapsAccordionPanel>

        <BapsAccordionPanel
          value="status"
          label="Status"
          count={Object.values(status).filter(Boolean).length}
        >
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="Complete"
                checked={status.complete}
                onChange={e => setStatus(s => ({ ...s, complete: e.target.checked }))}
              />
            </div>
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="Pending"
                checked={status.pending}
                onChange={e => setStatus(s => ({ ...s, pending: e.target.checked }))}
              />
            </div>
          </div>
        </BapsAccordionPanel>
      </BapsAccordion>
    </div>
  );
}`,
    next: `'use client';

${SETUP}

/* 'use client': every panel's open state is React state, and the filter
   controls inside are interactive, so the whole subtree is a client
   component. The accordion renders no markup on the server. */
import { useState } from 'react';
import {
  BapsAccordion,
  BapsAccordionPanel,
  BapsMultiSelect,
  BapsCheckbox,
  BapsRadio,
  BapsDatepicker,
} from '@org/ui-kit-react';

const CATEGORIES = ['G-Sampark', 'G-Focus', 'G-Yuva'];
const RESPONSES = ['Positive', 'Neutral', 'Negative'];

export default function FilterPanel() {
  const [category, setCategory] = useState(['G-Sampark', 'G-Focus']);
  const [response, setResponse] = useState(['Positive']);
  const [visit, setVisit] = useState({ yes: true, no: false });
  const [status, setStatus] = useState({ complete: true, pending: true });
  const [period, setPeriod] = useState('custom');
  const [from, setFrom] = useState(new Date(2025, 5, 5));
  const [to, setTo] = useState(new Date(2025, 10, 30));

  return (
    <div style={{ width: 452 }}>
      <BapsAccordion
        multiple
        defaultValue={['category', 'visit', 'response', 'submitted', 'status']}
      >
        {/* divider off: the multi-select draws its own top border. */}
        <BapsAccordionPanel
          value="category"
          label="Category"
          count={category.length}
          divider={false}
        >
          <BapsMultiSelect
            ariaLabel="Filter values"
            display="chip"
            appendTo="body"
            placeholder="Select categories"
            options={CATEGORIES.map(name => ({ label: name, value: name }))}
            value={category}
            onValueChange={setCategory}
          />
        </BapsAccordionPanel>

        <BapsAccordionPanel
          value="visit"
          label="Was the Sampark visit completed successfully?"
          count={Object.values(visit).filter(Boolean).length}
        >
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="Yes"
                checked={visit.yes}
                onChange={e => setVisit(v => ({ ...v, yes: e.target.checked }))}
              />
            </div>
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="No"
                checked={visit.no}
                onChange={e => setVisit(v => ({ ...v, no: e.target.checked }))}
              />
            </div>
          </div>
        </BapsAccordionPanel>

        <BapsAccordionPanel
          value="response"
          label="How was the overall response from the family?"
          count={response.length}
          divider={false}
        >
          <BapsMultiSelect
            ariaLabel="Filter values"
            display="chip"
            appendTo="body"
            placeholder="Select response"
            options={RESPONSES.map(name => ({ label: name, value: name }))}
            value={response}
            onValueChange={setResponse}
          />
        </BapsAccordionPanel>

        <BapsAccordionPanel value="submitted" label="Submitted At" count={1}>
          {/* One name across all five, so the browser groups them and the
              arrow keys move between them without any JS. */}
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsRadio
                name="period"
                label="Last Week"
                value="week"
                checked={period === 'week'}
                onChange={() => setPeriod('week')}
              />
            </div>
            <div className="baps-accordion-cell">
              <BapsRadio
                name="period"
                label="Last Month"
                value="month"
                checked={period === 'month'}
                onChange={() => setPeriod('month')}
              />
            </div>
          </div>
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsRadio
                name="period"
                label="Custom Date Range"
                value="custom"
                checked={period === 'custom'}
                onChange={() => setPeriod('custom')}
              />
            </div>
          </div>
          <div className="baps-accordion-daterange">
            <BapsDatepicker
              appendTo="body"
              ariaLabel="From date"
              value={from}
              onValueChange={setFrom}
            />
            <span aria-hidden="true">-</span>
            <BapsDatepicker
              appendTo="body"
              ariaLabel="To date"
              value={to}
              onValueChange={setTo}
            />
          </div>
        </BapsAccordionPanel>

        <BapsAccordionPanel
          value="status"
          label="Status"
          count={Object.values(status).filter(Boolean).length}
        >
          <div className="baps-accordion-row">
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="Complete"
                checked={status.complete}
                onChange={e => setStatus(s => ({ ...s, complete: e.target.checked }))}
              />
            </div>
            <div className="baps-accordion-cell">
              <BapsCheckbox
                label="Pending"
                checked={status.pending}
                onChange={e => setStatus(s => ({ ...s, pending: e.target.checked }))}
              />
            </div>
          </div>
        </BapsAccordionPanel>
      </BapsAccordion>
    </div>
  );
}`,
  },
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
    next: `'use client';

${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export default function Accordion() {
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
    next: `'use client';

${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export default function AccordionMultiple() {
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
    next: `'use client';

${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export default function AccordionWithoutCount() {
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
    next: `'use client';

${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export default function AccordionDisabled() {
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
    next: `'use client';

${SETUP}

import { BapsAccordion, BapsAccordionPanel } from '@org/ui-kit-react';

export default function AccordionBrands() {
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
