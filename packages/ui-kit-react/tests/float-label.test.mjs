import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BapsFloatLabel,
  BapsIconField,
  BapsInputIcon,
  BapsInputText,
} from '../dist/index.js';

test('BapsFloatLabel and IconField expose Prime-compatible composition DOM', () => {
  const input = BapsInputText({ id: 'member-name' });
  const label = { type: 'label', props: { htmlFor: 'member-name' } };
  const floatLabel = BapsFloatLabel({
    children: [input, label],
    variant: 'on',
    brand: 'sampark',
  });
  const iconField = BapsIconField({
    iconPosition: 'right',
    children: [input, BapsInputIcon({ icon: 'search-2' })],
  });

  assert.equal(floatLabel.type, 'baps-floatlabel');
  assert.match(floatLabel.props.className, /\bbaps-sampark\b/);
  assert.match(
    floatLabel.props.children.props.className,
    /\bp-floatlabel-on\b/,
  );
  assert.equal(iconField.type, 'baps-iconfield');
  assert.equal(iconField.props.children.type, 'p-iconfield');
  assert.match(
    iconField.props.children.props.className,
    /\bp-iconfield-right\b/,
  );
});
