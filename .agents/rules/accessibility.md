# Accessibility Rules

Target **WCAG 2.2 AA**, treated as a property of the system rather than a
per-component checkbox. `@storybook/addon-a11y` runs axe-core on every story
and docs page.

The user-facing write-up — current state, the disabled rule, open findings —
lives in `Guidelines/Accessibility`
(`libs/ui-kit/src/lib/docs/accessibility.mdx`). **Keep that page current**; this
file is the rule set, that page is the record.

## The panel badge is not a violation count

It mixes violations with *incomplete* results. `Button/Playground` shows
`Accessibility1` while reporting **0 violations, 5 passes, 1 incomplete**. Open
the tab and read the three numbers. Never gate on the badge.

## Audit before fixing

```bash
node tools/a11y-audit.mjs             # one story per component (51 stories)
node tools/a11y-audit.mjs <story-id>  # a narrower set
```

One story per component is deliberate: a component's stories share their markup
and tokens, so a rule that fires on one fires on all of them. Scanning all 309
adds runtime, not information.

The tool injects axe directly rather than reading the panel, so it still reports
`color-contrast` even though the panel has that rule off. That is correct for an
audit.

## Classify every finding before touching anything

| Class | Who fixes it | Example |
| --- | --- | --- |
| **Story-side** | you, now | a story never passed `ariaLabel` to a control that forwards it |
| **Component-level** | needs a component change — record it, ask first | a wrapper exposes no way to name an icon-only button |
| **Token-level** | design decision — never silently change | colour contrast |

The most common real violation in this library was **story-side**: the wrapper
already forwarded `ariaLabel`, and the story simply never passed one. PrimeNG
renders a visually hidden `role="combobox"` input (multiselect) and a
`role="slider"` span (slider); with no name passed, both are nameless to a
screen reader while looking perfectly labelled on screen.

**If a control takes `ariaLabel`, a story that omits it is publishing an example
that fails axe.** Pass it.

## The one disabled rule

`color-contrast` is off globally in `.storybook/preview.ts`. 107 nodes across 19
of 51 components — placeholders, muted helper text, disabled controls — all
resolving to the same handful of neutral tokens. That is **one decision about
the palette**, not nineteen mistakes, and no story can fix it.

It is disabled globally rather than per story on purpose: a per-story override
would imply each case is a local exception under review, when none can be
resolved without changing tokens.

**Do not re-enable it without a token change, and do not change tokens to
satisfy it without asking.**

## Never change component CSS to make axe pass

Same rule as the visual baseline: the existing appearance is the baseline. If a
fix requires a component or token change, record it as an open finding with the
suggested fix and ask.

## What every interactive component must have

Asserted in its `Interaction — keyboard` story, and verified by
`node tools/check-interactions.mjs`:

- reachable by <kbd>Tab</kbd>, focus lands where expected
- **one tab stop per composite widget** — a radio group and a tablist are one
  stop each, with arrows moving inside. If each child became its own tab stop
  the widget would look identical and be tedious to operate.
- activation by <kbd>Enter</kbd> / <kbd>Space</kbd>
- `aria-expanded` / `aria-selected` / `aria-checked` / `aria-current` move with
  the state — that is what assistive tech reads, not the highlight class
- disabled controls genuinely inert, asserted against the **real** blocking
  mechanism (see `storybook.md` — it differs per component)
- <kbd>Esc</kbd> closes overlays

## Known gaps to be aware of

- **`baps-dialog` does not close on Escape**, even with `closeOnEscape` (its
  default). Measured in a real browser; the same test on `baps-drawer` closes
  correctly. A keyboard user has no way out except finding the close button.
  `Dialog / Interaction — Escape does not close (known gap)` pins the current
  behaviour so it fails the day it is fixed.
- **`baps-drawer`'s panel is `role="complementary"` with no `aria-modal`.** It
  traps focus and dims the page but reads to assistive tech as a sidebar. That
  is PrimeNG's markup.
- **Tooltips do not show on focus** with the default `tooltipEvent`. Pass
  `tooltipEvent="both"` on anything a keyboard user must operate.
- `label` / `for` wiring: a bare `<label>` beside a bare `<input>` looks
  labelled and is not. Sixteen fields in the form-field stories were like this,
  and that story is the one people copy — so the example was teaching the
  mistake as well as failing the check.

## Skeletons and loading regions

`baps-skeleton` is `aria-hidden` — announcing a dozen empty boxes tells a
screen-reader user nothing. Announce at the **region** level instead:

```html
<section [attr.aria-busy]="loading" aria-live="polite">
  @if (loading) { <baps-skeleton width="100%" height="1rem" /> }
  @else { <p>{{ content }}</p> }
</section>
```

Without that pair, the user gets silence during the wait and no notification at
the end.
