/**
 * Framework snippets for the Stepper docs page.
 *
 * ## How it maps
 *
 * The Angular `bapsStepper` directive wraps PrimeNG's `p-stepper` component, and
 * `baps-step` wraps `p-step` / `p-step-panel`.
 *
 * In React, you build the DOM structure matching PrimeNG's output. The design-system
 * CSS scopes its styles to PrimeNG's `.p-stepper` and `.p-step` classes.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('stepper', true);

export const stepperSnippets: Record<string, SnippetSet> = {
  Default: {
    react: `${SETUP}

import { useState } from 'react';

export function Default() {
  const [active, setActive] = useState(1);

  return (
    <div className="p-stepper p-component">
      <ul className="p-stepper-nav" role="tablist">
        {[1, 2, 3].map(step => (
          <li key={step} className={\`p-stepper-action \${active === step ? 'p-highlight' : ''}\`} role="presentation">
            <button className="p-stepper-action" role="tab" aria-selected={active === step} onClick={() => setActive(step)}>
              <span className="p-stepper-number">{step}</span>
              <span className="p-stepper-title">Header {step}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="p-stepper-panels">
        <div className="p-stepper-panel" role="tabpanel">
          Content {active}
        </div>
      </div>
    </div>
  );
}`,
  },
  States: {
    react: `${SETUP}

export function States() {
  return (
    <div className="p-stepper p-component">
      <ul className="p-stepper-nav" role="tablist">
        <li className="p-stepper-action p-highlight" role="presentation">
          <button className="p-stepper-action" role="tab" aria-selected={true}>
            <span className="p-stepper-number">1</span>
            <span className="p-stepper-title">Active</span>
          </button>
        </li>
        <li className="p-stepper-action" role="presentation">
          <button className="p-stepper-action" role="tab" disabled>
            <span className="p-stepper-number">2</span>
            <span className="p-stepper-title">Disabled</span>
          </button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  ActiveAndCompleted: {
    react: `${SETUP}

export function ActiveAndCompleted() {
  return (
    <div className="p-stepper p-component">
      <ul className="p-stepper-nav" role="tablist">
        <li className="p-stepper-action p-stepper-completed" role="presentation">
          <button className="p-stepper-action" role="tab">
            <span className="p-stepper-number">1</span>
            <span className="p-stepper-title">Completed</span>
          </button>
        </li>
        <li className="p-stepper-action p-highlight" role="presentation">
          <button className="p-stepper-action" role="tab" aria-selected={true}>
            <span className="p-stepper-number">2</span>
            <span className="p-stepper-title">Active</span>
          </button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  RequiredSteps: {
    react: `${SETUP}

export function RequiredSteps() {
  return (
    <div className="p-stepper p-component">
      <ul className="p-stepper-nav" role="tablist">
        <li className="p-stepper-action" role="presentation">
          <button className="p-stepper-action" role="tab">
            <span className="p-stepper-number">1</span>
            <span className="p-stepper-title">
              Header
              <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  Linear: {
    react: `${SETUP}

export function Linear() {
  return (
    <div className="p-stepper p-component p-stepper-linear">
      <ul className="p-stepper-nav" role="tablist">
        <li className="p-stepper-action p-highlight" role="presentation">
          <button className="p-stepper-action" role="tab" aria-selected={true}>
            <span className="p-stepper-number">1</span>
            <span className="p-stepper-title">Linear Flow</span>
          </button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  FirstStep: {
    react: `${SETUP}

export function FirstStep() {
  return (
    <div className="p-stepper p-component">
      <ul className="p-stepper-nav" role="tablist">
        <li className="p-stepper-action p-highlight" role="presentation">
          <button className="p-stepper-action" role="tab" aria-selected={true}>
            <span className="p-stepper-number">1</span>
            <span className="p-stepper-title">First Step Active</span>
          </button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  Numbered: {
    react: `${SETUP}

export function Numbered() {
  return (
    <div className="p-stepper p-component">
      <ul className="p-stepper-nav" role="tablist">
        <li className="p-stepper-action p-highlight" role="presentation">
          <button className="p-stepper-action" role="tab" aria-selected={true}>
            <span className="p-stepper-number">1</span>
            <span className="p-stepper-title">Numbered</span>
          </button>
        </li>
      </ul>
    </div>
  );
}`,
  },
  NumberedSampark: {
    react: `${SETUP}

export function NumberedSampark() {
  return (
    <div className="baps-ds-sampark">
      <div className="p-stepper p-component">
        <ul className="p-stepper-nav" role="tablist">
          <li className="p-stepper-action p-highlight" role="presentation">
            <button className="p-stepper-action" role="tab" aria-selected={true}>
              <span className="p-stepper-number">1</span>
              <span className="p-stepper-title">Sampark Variant</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}`,
  },
  Wrapper: {
    react: `${SETUP}

import { useState } from 'react';
import { BapsStepper, BapsStepList, BapsStep, BapsStepPanels, BapsStepPanel } from '@org/ui-kit-react';

export function Wrapper() {
  const [current, setCurrent] = useState(2);
  
  return (
    <div style={{ width: '56rem', maxWidth: '100%' }}>
      <BapsStepper value={current} onValueChange={setCurrent} brand="mybky">
        <BapsStepList>
          <BapsStep value={1} label="Basic Info" icon="info-circle" status="completed" />
          <BapsStep value={2} label="Eligibility" icon="checklist" required={true} />
          <BapsStep value={3} label="Payment" icon="wallet-money" />
          <BapsStep value={4} label="Promo Code" icon="bill-list" />
          <BapsStep value={5} label="Features" icon="settings" locked={true} />
        </BapsStepList>
        <BapsStepPanels>
          <BapsStepPanel value={1}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Basic Info panel</div>
          </BapsStepPanel>
          <BapsStepPanel value={2}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Eligibility panel</div>
          </BapsStepPanel>
          <BapsStepPanel value={3}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Payment panel</div>
          </BapsStepPanel>
          <BapsStepPanel value={4}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Promo Code panel</div>
          </BapsStepPanel>
          <BapsStepPanel value={5}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Features panel</div>
          </BapsStepPanel>
        </BapsStepPanels>
      </BapsStepper>
    </div>
  );
}`,
  },
  WrapperNumbered: {
    react: `${SETUP}

import { useState } from 'react';
import { BapsStepper, BapsStepList, BapsStep, BapsStepPanels, BapsStepPanel } from '@org/ui-kit-react';

export function WrapperNumbered() {
  const [current, setCurrent] = useState(2);
  
  return (
    <div style={{ width: '40rem', maxWidth: '100%' }}>
      <BapsStepper value={current} onValueChange={setCurrent} brand="mybky">
        <BapsStepList>
          <BapsStep value={1} label="Details" />
          <BapsStep value={2} label="Departments" />
          <BapsStep value={3} label="Review" />
        </BapsStepList>
        <BapsStepPanels>
          <BapsStepPanel value={1}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Name the template and pick its type.</div>
          </BapsStepPanel>
          <BapsStepPanel value={2}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Choose which departments it applies to.</div>
          </BapsStepPanel>
          <BapsStepPanel value={3}>
            <div style={{ padding: '1.5rem 0', fontSize: '0.875rem' }}>Check everything, then publish.</div>
          </BapsStepPanel>
        </BapsStepPanels>
      </BapsStepper>
    </div>
  );
}`,
  },
};
