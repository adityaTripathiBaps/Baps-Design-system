/**
 * The setup block every framework snippet opens with, written once.
 *
 * ## Why this file exists
 *
 * Each of the seven snippet files used to carry its own copy of this text, and
 * every copy said the same thing: that no package export existed, so a
 * consumer had to reach into `<repo>/libs/ui-kit/src/...` by relative path.
 * That was true when it was written. The packaging commit made it false in all
 * six copies at once and none of them noticed — which is the argument for one
 * copy rather than six.
 *
 * ## What a consumer actually imports, measured
 *
 *   @org/tokens/css          every design token as a custom property
 *   @org/ui-kit/styles       the whole kit: 26 component stylesheets, the Inter
 *                            @font-face, --font-family, the Sampark scopes and
 *                            the dark scope. 449 kB.
 *   @org/ui-kit/styles/tag   one component's rules, 26 kB.
 *
 * The per-component path is NOT the default, and the reason is measured rather
 * than assumed. Counted over the built CSS:
 *
 *   dist/libs/ui-kit/styles/index.css    1 @font-face, 1 --font-family
 *   dist/libs/ui-kit/styles/button.css   0 @font-face, 0 --font-family
 *   …the same for card, alert, link, spinner, tag, avatar
 *
 * So a page that imports only `@org/ui-kit/styles/button` loads no Inter and
 * defines no --font-family: the button's colour, border, radius and padding
 * are all correct and its type is the browser's default. That is a real
 * choice a consumer may want — their app may already own its typography — but
 * it has to be a choice, so the per-component path is documented with the
 * sentence that tells them what they are opting out of.
 *
 * ## The rules the app owns
 *
 * No ui-kit partial sets a rem baseline or applies the font to the page, and
 * none should: those are the consuming app's, and a design system that writes
 * them silently fights every app it is dropped into. They are listed in the
 * block below so a reader is not left to discover them.
 *
 * `font-feature-settings` is the one that looks optional and is not. Inter's
 * OpenType set changes glyph advance widths, so without it every label
 * measures about 1px narrower per word: the button comes out narrow while
 * every colour, border, radius and padding still matches exactly. A <button>
 * does not inherit the features from `html` on its own, which is why the
 * second rule names form elements. Found by tools/check-button-drift.mjs, not
 * by reading.
 */

/**
 * The shape every `*.snippets.ts` keys by story export name.
 *
 * Kept identical to `SnippetSet` in the docs blocks — that file is where each
 * field's behaviour is documented, and it cannot import from here because the
 * blocks live in the Storybook host, outside the library's tsconfig.
 */
export type SnippetSet = {
  react?: string;
  next?: string;
  primeng?: string;
  custom?: string;
  /** Renders the shared "markup and styles only" note under the React and Next
   *  tabs, and sends it to the Copy prompt — see INTERACTIVE_NOTE in the docs
   *  blocks. tools/check-snippets.mjs fails a set whose React markup carries
   *  behaviour without it. */
  interactive?: boolean;
};

/**
 * @param component the kebab-case style name, e.g. `button` — the subpath of
 *                  `@org/ui-kit/styles/*`, which matches the component folder.
 * @param icons     true when the snippets on that page render `pi-*` glyphs.
 */
export const setupFor = (component: string, icons = false): string =>
  `/* Once, at your app's entry:

     import '@org/tokens/css';
     import '@org/ui-kit/styles';${icons ? `\n     import 'primeicons/primeicons.css';   // the pi-* glyphs below` : ''}

   '@org/ui-kit/styles' is the whole kit. To load this component alone:

     import '@org/ui-kit/styles/${component}';

   — that path carries ${component}'s rules only: no Inter @font-face and no
   --font-family, so your app supplies the typeface. Measured, not assumed.

   Then the base rules, which are the app's own — no ui-kit partial applies
   them, and none should:

     html {
       font-size: 16px;
       font-family: var(--font-family);
       font-feature-settings: var(--font-feature-settings);
     }
     button, input, textarea, select { font-feature-settings: inherit; }

   Both feature-settings lines are load-bearing and not obviously so: Inter's
   OpenType set changes glyph advance widths, so dropping them leaves every
   colour, border, radius and padding exact while the text measures narrower.
*/`;
