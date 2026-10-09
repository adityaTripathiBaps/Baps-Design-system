/**
 * A DOM for the components that cannot render without one.
 *
 * Dialog, Drawer, Popover, Toast and Tooltip all call `createPortal` into
 * `document.body`, and three more — split-button, table-column-config and
 * table-sort-config — render through them. `renderToStaticMarkup` throws
 * "document is not defined" on every one, which is why nine components had no
 * test at all while the other 39 did.
 *
 * This installs jsdom's globals once, before any component is imported, so a
 * test can mount into a real document and read back what a browser would see:
 * where the portal landed, which element has focus, what Escape does.
 *
 * Import it FIRST in any test file that needs it. React reads `document` when
 * its DOM renderer is loaded, so a late import leaves the renderer bound to a
 * window that does not exist yet.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

// Only what the components and React actually reach for. A blanket copy of
// every jsdom global overwrites Node's own and breaks the test runner.
for (const key of [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'SVGElement',
  'Element',
  'Node',
  'Event',
  'KeyboardEvent',
  'MouseEvent',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
]) {
  const value = dom.window[key];
  if (value !== undefined && globalThis[key] === undefined) {
    Object.defineProperty(globalThis, key, {
      value: typeof value === 'function' ? value.bind(dom.window) : value,
      writable: true,
      configurable: true,
    });
  }
}

// jsdom implements <dialog> as an element but not its methods: showModal,
// show and close are all missing, and BapsDialog calls showModal on open.
// This is a gap in the environment rather than in the component, so the two
// methods are supplied here and nowhere near production code. They do what
// the spec says in the only respects a test can observe: the open attribute
// and the close event.
const Dialog = dom.window.HTMLDialogElement;
if (Dialog && typeof Dialog.prototype.showModal !== 'function') {
  Dialog.prototype.showModal = function showModal() {
    this.open = true;
    this.setAttribute('open', '');
  };
  Dialog.prototype.show = Dialog.prototype.showModal;
  Dialog.prototype.close = function close(returnValue) {
    this.open = false;
    this.removeAttribute('open');
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new dom.window.Event('close'));
  };
}
/** Fresh mount point per test, so one test's DOM never leaks into the next. */
export function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  return host;
}

/** Remove everything a test added, portals included. */
export function cleanup() {
  document.body.innerHTML = '';
}

export { dom };
