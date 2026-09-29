import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { addons } from 'storybook/internal/preview-api';
import { UPDATE_GLOBALS } from 'storybook/internal/core-events';

import { BapsButton } from '../components/button/button.component';
import { BapsTag } from '../components/tag/tag.component';
import { BapsCheckbox } from '../components/checkbox/checkbox.component';
import { BapsCard } from '../components/card/card.component';
import { BapsBadge } from '../components/badge/badge.component';

/**
 * Writing globals from inside the preview.
 *
 * The preview iframe cannot set globals directly — they live in the manager —
 * but the two share a channel, and this file is not the first to use it:
 * `.storybook/preview.ts` already listens on it for the dark-mode event. This
 * emits on the same channel, which is how the toolbar and this page stay in
 * agreement instead of becoming two competing sources of truth.
 */
const setGlobals = (globals: Record<string, unknown>): void => {
  addons.getChannel().emit(UPDATE_GLOBALS, { globals });
};

/** `initialGlobals` from .storybook/preview.ts — what Reset returns to. */
const DEFAULTS = {
  designSystem: 'mybky',
  accent: 'brand',
  surface: 'default',
  ripple: true,
  direction: 'ltr',
} as const;

const SWATCHES = [
  { key: 'brand', label: 'Brand' },
  { key: 'rose', label: 'Rose' },
  { key: 'emerald', label: 'Emerald' },
  { key: 'violet', label: 'Violet' },
  { key: 'amber', label: 'Amber' },
  { key: 'sky', label: 'Sky' },
];

@Component({
  selector: 'baps-theme-builder',
  imports: [FormsModule, BapsButton, BapsTag, BapsCheckbox, BapsCard, BapsBadge],
  template: `
    <div class="tb">
      <section class="tb__panel">
        <h3 class="tb__h">Brand</h3>
        <div class="tb__row">
          @for (b of brands; track b.key) {
            <button
              type="button"
              class="tb__chip"
              [class.tb__chip--on]="designSystem === b.key"
              (click)="set({ designSystem: b.key })"
            >
              {{ b.label }}
            </button>
          }
        </div>

        <h3 class="tb__h">Primary</h3>
        <div class="tb__row">
          @for (s of swatches; track s.key) {
            <button
              type="button"
              class="tb__chip"
              [class.tb__chip--on]="accent === s.key"
              (click)="set({ accent: s.key })"
            >
              {{ s.label }}
            </button>
          }
        </div>

        <div class="tb__row tb__row--colour">
          <!-- Native picker and a text field over ONE global. Typing and
               picking are the same action; neither is a second source. -->
          <input
            type="color"
            class="tb__colour"
            [ngModel]="hexValue"
            (ngModelChange)="onHex($event)"
            aria-label="Pick a primary colour"
          />
          <input
            type="text"
            class="tb__hex"
            [ngModel]="hexText"
            (ngModelChange)="onHexText($event)"
            placeholder="#c96868"
            spellcheck="false"
            aria-label="Primary colour hex"
          />
          <button type="button" class="tb__reset" (click)="reset()">Reset</button>
        </div>

        <p class="tb__note">
          Current: <code>{{ designSystem }}</code> · <code>{{ accent }}</code> ·
          <code>{{ surface }}</code>. The URL carries this — copy it to share the
          theme, or reload to keep it.
        </p>
      </section>

      <section class="tb__panel">
        <h3 class="tb__h">Live preview</h3>
        <div class="tb__preview">
          <div class="tb__row">
            <baps-button label="Primary" />
            <baps-button label="Secondary" severity="secondary" />
            <baps-button label="Outlined" [outlined]="true" />
            <baps-button label="Disabled" [disabled]="true" />
          </div>
          <div class="tb__row">
            <baps-tag value="Contrast" severity="contrast" />
            <baps-tag value="Success" severity="success" />
            <baps-badge value="8" />
          </div>
          <div class="tb__row">
            <baps-checkbox label="Checked" [(ngModel)]="checked" />
            <baps-checkbox label="Unchecked" [(ngModel)]="unchecked" />
          </div>
          <!-- Content-projected, not a header input: baps-card takes only
               padding / divided / raised / interactive / brand. -->
          <baps-card>
            <strong>Surface</strong>
            <p style="margin:0.25rem 0 0">
              A card, so a surface change is visible against the controls above.
            </p>
          </baps-card>
        </div>
      </section>

      <section class="tb__panel tb__panel--note">
        <h3 class="tb__h">What a colour change does not reach</h3>
        <p>
          Changing the primary re-themes PrimeNG's semantics and the whole design
          system layer. It does <strong>not</strong> move the preset's
          per-component overrides — the button gradient, a primary tag's fill and
          text, the avatar chip, the toggle track, and the checkbox and radio
          ticks keep their designed colour.
        </p>
        <p>
          That is deliberate and the full list of 17 tokens is on
          <a href="?path=/docs/guidelines-known-gaps--docs">Guidelines → Known gaps</a>
          under the third-sink entry. It is the first thing people notice here, so
          it is written down rather than left to be rediscovered.
        </p>
      </section>
    </div>
  `,
  styles: `
    .tb { display: flex; flex-direction: column; gap: 1.5rem; max-width: 52rem; }
    .tb__panel {
      border: 1px solid var(--color-mybky-mono-300, #e4ecf1);
      border-radius: 8px;
      padding: 1rem 1.25rem 1.25rem;
    }
    .tb__panel--note { font-size: 0.875rem; line-height: 1.55; }
    .tb__panel--note p { margin: 0 0 0.5rem; }
    .tb__h {
      font: 600 12px/1.3 Inter, system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      opacity: 0.6;
      margin: 0.75rem 0 0.5rem;
    }
    .tb__h:first-child { margin-top: 0; }
    .tb__row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
    .tb__row--colour { margin-top: 0.75rem; }
    .tb__chip {
      padding: 5px 10px;
      border: 1px solid var(--color-mybky-mono-300, #e4ecf1);
      border-radius: 6px;
      background: transparent;
      font: 400 12px/1.3 Inter, system-ui, sans-serif;
      cursor: pointer;
    }
    .tb__chip--on {
      border-color: transparent;
      background: var(--color-mybky-primary-default, #5f78b8);
      color: #fff;
      font-weight: 600;
    }
    .tb__colour { width: 42px; height: 32px; padding: 0; border: 1px solid var(--color-mybky-mono-300, #e4ecf1); border-radius: 6px; background: none; cursor: pointer; }
    .tb__hex {
      width: 9rem; height: 32px; padding: 0 8px;
      border: 1px solid var(--color-mybky-mono-300, #e4ecf1);
      border-radius: 6px;
      font: 400 13px/1 ui-monospace, SFMono-Regular, monospace;
    }
    .tb__reset {
      height: 32px; padding: 0 12px; margin-left: auto;
      border: 1px solid var(--color-mybky-mono-300, #e4ecf1);
      border-radius: 6px; background: transparent;
      font: 500 12px/1 Inter, system-ui, sans-serif; cursor: pointer;
    }
    .tb__note { font-size: 12px; opacity: 0.7; margin: 0.75rem 0 0; }
    .tb__preview { display: flex; flex-direction: column; gap: 1rem; }

    /* Dark. The selected chip is white on the LIGHT accent (#5f78b8), which
       measures 4.32:1 — under AA for its 12px label. In dark the accent steps
       one lighter and the ink inverts, the same swap every other filled accent
       makes here (7.79:1). Borders move off the light mono step for the same
       reason they do everywhere else.

       :host-context, not a plain .baps-dark descendant rule: this component
       keeps Angular's EMULATED encapsulation (chip and avatar set
       ViewEncapsulation.None, this one does not), so every compound in the
       selector gets the _ngcontent attribute — including the ancestor, which
       html/body never carries, and the rule would match nothing. */
    :host-context(.baps-dark) .tb__chip--on {
      background: var(--color-mybky-dark-primary-default, #9fadd9);
      color: var(--color-mybky-dark-text-inverse, #181b1d);
    }
    :host-context(.baps-dark) :is(.tb__chip, .tb__colour, .tb__hex, .tb__reset) {
      border-color: var(--color-mybky-dark-border-divider, #3d4144);
    }
  `,
})
class ThemeBuilder {
  @Input() designSystem = DEFAULTS.designSystem as string;
  @Input() accent = DEFAULTS.accent as string;
  @Input() surface = DEFAULTS.surface as string;

  protected checked = true;
  protected unchecked = false;

  protected readonly swatches = SWATCHES;
  protected readonly brands = [
    { key: 'mybky', label: 'MyBKY' },
    { key: 'sampark', label: 'Sampark' },
    { key: 'baps', label: 'BAPS (awaiting palette)' },
    { key: 'appsell', label: 'App Sell (awaiting palette)' },
  ];

  /** The picker needs a real colour even when the accent is a swatch key. */
  protected get hexValue(): string {
    return this.accent.startsWith('#') ? this.accent : '#5f78b8';
  }

  /** The text field shows the key when there is one, so it is never a lie. */
  protected get hexText(): string {
    return this.accent;
  }

  protected set(globals: Record<string, unknown>): void {
    setGlobals(globals);
  }

  protected onHex(value: string): void {
    setGlobals({ accent: value });
  }

  /**
   * Only commits a complete `#rrggbb`. Committing on every keystroke would
   * rebuild the preset for `#`, `#c`, `#c9` … — each one a colour, none of them
   * the one being typed.
   */
  protected onHexText(value: string): void {
    const v = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v) || v === 'brand') setGlobals({ accent: v });
  }

  protected reset(): void {
    setGlobals({ ...DEFAULTS });
  }
}

/**
 * Theme builder — change the brand and the primary colour, and watch both halves
 * of the system move together.
 *
 * ## Where the settings live
 *
 * In Storybook's **globals**, the same ones the toolbar drives. Nothing is kept
 * in `localStorage`: globals already are the config that `withAccent` and the
 * preview's design-system write both read, and Storybook serialises them into
 * the URL — so a reload keeps the theme and a link carries it to someone else.
 * A separate store would be a second source of truth for one thing, and it would
 * not cross the manager/preview boundary that globals already cross.
 *
 * Export and import therefore need almost nothing: the URL *is* the export.
 *
 * ## The accent global holds either form
 *
 * A swatch key (`brand`, `rose`, …) or a raw `#rrggbb`. One value, so there is
 * one thing in the URL and one thing to export — rather than a key and a hex
 * that can disagree about which of them is in charge.
 *
 * ## Not in the visual baseline
 *
 * Deliberately excluded in `stories.spec.ts`. The native `<input type="color">`
 * is a platform widget whose appearance is not guaranteed stable across a
 * Playwright or OS change, and a screenshot of this page at default globals pins
 * the least interesting state it has. It would be a baseline that fails for
 * reasons no one cares about.
 */
const meta: Meta<ThemeBuilder> = {
  title: 'Guidelines/Theme builder',
  id: 'guidelines-theme-builder',
  component: ThemeBuilder,
  decorators: [moduleMetadata({ imports: [ThemeBuilder] })],
  parameters: {
    layout: 'padded',
    // No controls panel: every setting here is a global, and a second set of
    // knobs that wrote args instead would drift from the toolbar.
    controls: { disable: true },
  },
};

export default meta;

/** The builder. Reads the live globals; every control writes them back. */
export const Builder: StoryObj<ThemeBuilder> = {
  render: (_args, context) => ({
    props: {
      designSystem: String(context.globals['designSystem'] ?? DEFAULTS.designSystem),
      accent: String(context.globals['accent'] ?? DEFAULTS.accent),
      surface: String(context.globals['surface'] ?? DEFAULTS.surface),
    },
  }),
};
