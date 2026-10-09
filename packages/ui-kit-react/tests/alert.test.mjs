import assert from 'node:assert/strict';
import test from 'node:test';
import { BapsAlert } from '../dist/index.js';

test('BapsAlert renders an assertive inline alert with native close behavior', () => {
  const onClose = () => undefined;
  const ref = { current: null };
  const element = BapsAlert({
    title: 'Session expiring',
    children: 'Save your changes.',
    severity: 'warning',
    brand: 'sampark',
    closable: true,
    closeLabel: 'Dismiss warning',
    onClose,
    ref,
  });
  const alert = element.props.children;
  const close = alert.props.children[3];

  assert.equal(element.type, 'baps-alert');
  assert.equal(element.props.ref, ref);
  assert.match(element.props.className, /\bbaps-sampark\b/);
  assert.equal(alert.props.role, 'alert');
  assert.match(alert.props.className, /\bbaps-alert--warning\b/);
  assert.match(alert.props.className, /\bbaps-alert--closable\b/);
  assert.equal(close.type, 'button');
  assert.equal(close.props.type, 'button');
  assert.equal(close.props['aria-label'], 'Dismiss warning');
  assert.equal(close.props.onClick, onClose);
});

test('BapsAlert card clamps progress and forwards native action events', () => {
  const onPrimaryAction = () => undefined;
  const onSecondaryAction = () => undefined;
  const element = BapsAlert({
    appearance: 'card',
    severity: 'success',
    title: 'Upload complete',
    text: 'All records were saved.',
    progress: 140,
    progressLabel: 'Complete',
    primaryAction: 'View',
    secondaryAction: 'Dismiss',
    onPrimaryAction,
    onSecondaryAction,
  });
  const card = element.props.children;
  const body = card.props.children[1];
  const track = body.props.children[1].props.children[0];
  const actions = body.props.children[2].props.children;

  assert.equal(card.props.role, 'status');
  assert.match(card.props.className, /\bbaps-alert-card--success\b/);
  assert.equal(track.props.role, 'progressbar');
  assert.equal(track.props['aria-valuenow'], 100);
  assert.equal(track.props['aria-label'], 'Complete');
  assert.equal(track.props.children.props.style.width, '100%');
  assert.equal(actions[0].props.onClick, onPrimaryAction);
  assert.equal(actions[1].props.onClick, onSecondaryAction);
});
