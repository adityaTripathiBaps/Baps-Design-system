import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
});

/**
 * jsdom implements no ResizeObserver, and PrimeNG's TabList constructs one in
 * ngAfterViewInit to decide whether the strip needs its scroll buttons. So a
 * `p-tabs` cannot be rendered in a test at all without this — it throws
 * "ResizeObserver is not defined" before any assertion runs.
 *
 * This is a gap in the environment rather than in any component, which is why
 * it lives here and nowhere near production code. It is deliberately inert:
 * nothing in jsdom lays anything out, so a real implementation would have no
 * sizes to report. A test that needs to observe a resize should drive the
 * component's own handler instead of waiting on this.
 *
 * Same reasoning as the <dialog> methods the React harness supplies in
 * packages/ui-kit-react/tests/dom.mjs.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {
      /* no layout in jsdom, so nothing to report */
    }
    unobserve(): void {
      /* no-op */
    }
    disconnect(): void {
      /* no-op */
    }
  };
}
