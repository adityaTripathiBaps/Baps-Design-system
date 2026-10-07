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

export function Wrapper() {
  return (
    <div className="p-stepper p-component">
        <ul className="p-stepper-nav" role="tablist">
          <li className="p-stepper-action p-highlight" role="presentation">
            <button className="p-stepper-action" role="tab" aria-selected={true}>
              <span className="p-stepper-title">Wrapper</span>
            </button>
          </li>
        </ul>
    </div>
  );
}`,
  },
  WrapperNumbered: {
    react: `${SETUP}

export function WrapperNumbered() {
  return (
    <div className="p-stepper p-component">
        <ul className="p-stepper-nav" role="tablist">
          <li className="p-stepper-action p-highlight" role="presentation">
            <button className="p-stepper-action" role="tab" aria-selected={true}>
              <span className="p-stepper-number">1</span>
              <span className="p-stepper-title">Numbered Wrapper</span>
            </button>
          </li>
        </ul>
    </div>
  );
}`,
  },
};
