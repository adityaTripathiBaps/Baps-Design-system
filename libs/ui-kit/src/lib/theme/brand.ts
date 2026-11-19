import { InjectionToken, Provider, inject } from '@angular/core';

/** The two brands the kit ships. MyBKY is the unscoped default. */
export type BapsBrand = 'mybky' | 'sampark';

/**
 * App-wide default for every kit component's `brand` input.
 *
 * A Sampark app renders only Sampark, so writing `brand="sampark"` on every
 * tag is noise and one forgotten tag falls back to MyBKY tokens, panel classes
 * and behaviour (dialog tokens, avatar shape, body-appended overlays). The
 * root `.baps-ds-sampark` class cannot fix that on its own: those choices are
 * made in TypeScript, and part of the Sampark CSS keys on the host class the
 * `brand` input sets.
 */
export const BAPS_BRAND = new InjectionToken<BapsBrand>('BAPS_BRAND');

/**
 * Sets the default brand for every kit component below this injector.
 * An explicit `[brand]` on a tag still wins.
 *
 * ```ts
 * providers: [provideBapsBrand('sampark')]
 * ```
 */
export function provideBapsBrand(brand: BapsBrand): Provider {
  return { provide: BAPS_BRAND, useValue: brand };
}

/**
 * The brand a component starts with: the provided default, else `mybky`.
 * Call it from a field initializer (an injection context).
 */
export function injectBapsBrand(): BapsBrand {
  return inject(BAPS_BRAND, { optional: true }) ?? 'mybky';
}
