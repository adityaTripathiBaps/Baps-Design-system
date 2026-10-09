import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BapsStep, BapsStepList, BapsStepper } from '../dist/index.js';

test('BapsStepper marks the current step with aria-current', () => {
  const html = renderToStaticMarkup(
    createElement(
      BapsStepper,
      { value: 2 },
      createElement(
        BapsStepList,
        null,
        createElement(BapsStep, { value: 1 }, 'Details'),
        createElement(BapsStep, { value: 2 }, 'Payment'),
        createElement(BapsStep, { value: 3 }, 'Review'),
      ),
    ),
  );
  // One step is where the user is. More than one would be a lie; none leaves
  // a screen reader with no position at all.
  assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1);
});
