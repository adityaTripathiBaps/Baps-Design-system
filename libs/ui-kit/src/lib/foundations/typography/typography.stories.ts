import type { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';
import * as tokens from '@org/tokens/generated/tokens';

@Component({
  selector: 'baps-typography-showcase',
  template: `
    <div style="font-family: var(--font-family); color: var(--color-mybky-text-primary, #181b1d); padding: 24px; display: flex; flex-direction: column; gap: 48px;">
      
      <!-- 1. Heading Scale -->
      <div>
        <h2 style="border-bottom: 1px solid var(--baps-doc-rule, #eaeff3); padding-bottom: 8px; margin-bottom: 24px; font-weight: 600;">1. Heading Scale</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); font-family: monospace; display: block; margin-bottom: 4px;">H1 - 1.75rem (28px) · SemiBold (600)</span>
            <h1 style="margin: 0; font-size: 1.75rem; font-weight: 600; line-height: 1.2; letter-spacing: -0.02em;">The quick brown fox jumps over the lazy dog</h1>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); font-family: monospace; display: block; margin-bottom: 4px;">H2 - 1.5rem (24px) · SemiBold (600)</span>
            <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; line-height: 1.2;">The quick brown fox jumps over the lazy dog</h2>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); font-family: monospace; display: block; margin-bottom: 4px;">H3 - 1.25rem (20px) · SemiBold (600)</span>
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; line-height: 1.2;">The quick brown fox jumps over the lazy dog</h3>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); font-family: monospace; display: block; margin-bottom: 4px;">H4 - 1.125rem (18px) · SemiBold (600)</span>
            <h4 style="margin: 0; font-size: 1.125rem; font-weight: 600; line-height: 1.2;">The quick brown fox jumps over the lazy dog</h4>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); font-family: monospace; display: block; margin-bottom: 4px;">H5 - 1rem (16px) · SemiBold (600)</span>
            <h5 style="margin: 0; font-size: 1rem; font-weight: 600; line-height: 1.2;">The quick brown fox jumps over the lazy dog</h5>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); font-family: monospace; display: block; margin-bottom: 4px;">H6 - 0.875rem (14px) · SemiBold (600)</span>
            <h6 style="margin: 0; font-size: 0.875rem; font-weight: 600; line-height: 1.2;">The quick brown fox jumps over the lazy dog</h6>
          </div>
        </div>
      </div>

      <!-- 2. Font Size Scale -->
      <div>
        <h2 style="border-bottom: 1px solid var(--baps-doc-rule, #eaeff3); padding-bottom: 8px; margin-bottom: 24px; font-weight: 600;">2. Font Size Scale</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid var(--baps-doc-rule, #eaeff3); color: var(--color-mybky-text-muted, #6f777d); font-size: 12px;">
              <th style="padding: 8px 0;">Token / Size</th>
              <th style="padding: 8px 0;">Pixel Equiv (16px base)</th>
              <th style="padding: 8px 0;">Example Usage</th>
              <th style="padding: 8px 0; width: 50%;">Preview</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #eff1f3;">
              <td style="padding: 12px 0; font-family: monospace;">0.75rem</td>
              <td style="padding: 12px 0;">12px</td>
              <td style="padding: 12px 0; font-size: 12px; color: var(--color-mybky-text-muted, #6f777d);">Badges, hint text, captions</td>
              <td style="padding: 12px 0; font-size: 0.75rem;">Micro-copy text size (12px)</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff1f3;">
              <td style="padding: 12px 0; font-family: monospace;">0.875rem</td>
              <td style="padding: 12px 0;">14px (default)</td>
              <td style="padding: 12px 0; font-size: 12px; color: var(--color-mybky-text-muted, #6f777d);">Body text, form inputs, buttons, tables</td>
              <td style="padding: 12px 0; font-size: 0.875rem;">Standard interface text size (14px)</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff1f3;">
              <td style="padding: 12px 0; font-family: monospace;">1rem</td>
              <td style="padding: 12px 0;">16px</td>
              <td style="padding: 12px 0; font-size: 12px; color: var(--color-mybky-text-muted, #6f777d);">Large body, large button/badge</td>
              <td style="padding: 12px 0; font-size: 1rem;">Large UI text size (16px)</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff1f3;">
              <td style="padding: 12px 0; font-family: monospace;">1.125rem</td>
              <td style="padding: 12px 0;">18px</td>
              <td style="padding: 12px 0; font-size: 12px; color: var(--color-mybky-text-muted, #6f777d);">H4 headings, subheadings</td>
              <td style="padding: 12px 0; font-size: 1.125rem;">Sub-section title size (18px)</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff1f3;">
              <td style="padding: 12px 0; font-family: monospace;">1.25rem</td>
              <td style="padding: 12px 0;">20px</td>
              <td style="padding: 12px 0; font-size: 12px; color: var(--color-mybky-text-muted, #6f777d);">H3 headings, page titles, drawers</td>
              <td style="padding: 12px 0; font-size: 1.25rem;">Main page/drawer title size (20px)</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff1f3;">
              <td style="padding: 12px 0; font-family: monospace;">1.5rem</td>
              <td style="padding: 12px 0;">24px</td>
              <td style="padding: 12px 0; font-size: 12px; color: var(--color-mybky-text-muted, #6f777d);">H2 headings</td>
              <td style="padding: 12px 0; font-size: 1.5rem;">Section title size (24px)</td>
            </tr>
            <tr style="border-bottom: 1px solid #eff1f3;">
              <td style="padding: 12px 0; font-family: monospace;">1.75rem</td>
              <td style="padding: 12px 0;">28px</td>
              <td style="padding: 12px 0; font-size: 12px; color: var(--color-mybky-text-muted, #6f777d);">H1 prominent page title</td>
              <td style="padding: 12px 0; font-size: 1.75rem;">Major page title size (28px)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. Inter Variable Weight Axis -->
      <div>
        <h2 style="border-bottom: 1px solid var(--baps-doc-rule, #eaeff3); padding-bottom: 8px; margin-bottom: 24px; font-weight: 600;">3. Inter Variable Weight Axis</h2>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="font-weight: 100; font-size: 24px;">Weight 100 (Thin): Active UI typography at 100</div>
          <div style="font-weight: 200; font-size: 24px;">Weight 200 (Extra Light): Active UI typography at 200</div>
          <div style="font-weight: 300; font-size: 24px;">Weight 300 (Light): Active UI typography at 300</div>
          <div style="font-weight: 400; font-size: 24px;">Weight 400 (Regular): Active UI typography at 400 (Body)</div>
          <div style="font-weight: 500; font-size: 24px;">Weight 500 (Medium): Active UI typography at 500 (Labels/Badges)</div>
          <div style="font-weight: 600; font-size: 24px;">Weight 600 (SemiBold): Active UI typography at 600 (Headings/Buttons)</div>
          <div style="font-weight: 700; font-size: 24px;">Weight 700 (Bold): Active UI typography at 700 (Prominent titles)</div>
          <div style="font-weight: 800; font-size: 24px;">Weight 800 (Extra Bold): Active UI typography at 800</div>
          <div style="font-weight: 900; font-size: 24px;">Weight 900 (Black): Active UI typography at 900</div>
        </div>
      </div>

      <!-- 4. OpenType Font Features -->
      <div>
        <h2 style="border-bottom: 1px solid var(--baps-doc-rule, #eaeff3); padding-bottom: 8px; margin-bottom: 24px; font-weight: 600;">4. OpenType Font Features (17 Enabled Features)</h2>
        <p style="color: var(--baps-doc-ink-soft, #565652); font-size: 14px; margin-bottom: 24px;">
          To match Figma exactly, BAPS activates 17 Inter OpenType features globally. Below is a comparison of common features:
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Feature: case -->
          <div style="border: 1px solid var(--baps-doc-rule, #eaeff3); padding: 16px; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 8px;">Case-sensitive Forms ('case')</strong>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); display: block; margin-bottom: 12px;">Punctuation is centered vertically relative to uppercase letters.</span>
            <div style="font-size: 20px; display: flex; flex-direction: column; gap: 8px;">
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Disabled:</span> <span style="font-feature-settings: 'case' off;">NEW: (VALUE) - [TEST]?</span></div>
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Enabled:</span> <span style="font-feature-settings: 'case' on;">NEW: (VALUE) - [TEST]?</span></div>
            </div>
          </div>

          <!-- Feature: cv05 -->
          <div style="border: 1px solid var(--baps-doc-rule, #eaeff3); padding: 16px; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 8px;">Disambiguation Lowercase L ('cv05')</strong>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); display: block; margin-bottom: 12px;">Adds a tail to lowercase 'l' to distinguish it from uppercase 'I' and digit '1'.</span>
            <div style="font-size: 20px; display: flex; flex-direction: column; gap: 8px;">
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Disabled:</span> <span style="font-feature-settings: 'cv05' off;">Illustrate 1lI</span></div>
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Enabled:</span> <span style="font-feature-settings: 'cv05' on;">Illustrate 1lI</span></div>
            </div>
          </div>

          <!-- Feature: salt / ss01 -->
          <div style="border: 1px solid var(--baps-doc-rule, #eaeff3); padding: 16px; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 8px;">Stylistic Alternates / Sets ('ss01', 'ss03')</strong>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); display: block; margin-bottom: 12px;">Single-story alternates for lowercase 'a' and 'g' for cleaner geometric styling.</span>
            <div style="font-size: 20px; display: flex; flex-direction: column; gap: 8px;">
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Disabled:</span> <span style="font-feature-settings: 'ss01' off, 'ss03' off;">galaxy and age</span></div>
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Enabled:</span> <span style="font-feature-settings: 'ss01' on, 'ss03' on;">galaxy and age</span></div>
            </div>
          </div>

          <!-- Feature: cpsp -->
          <div style="border: 1px solid var(--baps-doc-rule, #eaeff3); padding: 16px; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 8px;">Capital Spacing ('cpsp')</strong>
            <span style="font-size: 12px; color: var(--color-mybky-text-muted, #6f777d); display: block; margin-bottom: 12px;">Adjusts spacing between capital letters for all-caps strings.</span>
            <div style="font-size: 20px; display: flex; flex-direction: column; gap: 8px;">
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Disabled:</span> <span style="font-feature-settings: 'cpsp' off; letter-spacing: 0.05em;">METADATA</span></div>
              <div><span style="color: var(--color-mybky-text-muted, #6f777d); font-size: 12px; display: block;">Enabled:</span> <span style="font-feature-settings: 'cpsp' on; letter-spacing: 0.05em;">METADATA</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class BapsTypographyShowcase {}

const meta: Meta<BapsTypographyShowcase> = {
  title: 'Foundations/Typography',
  // Design-system availability — drives the sidebar filter in .storybook/manager.tsx.
  tags: ['ds:mybky', 'ds:sampark'],
  component: BapsTypographyShowcase,
};

export default meta;
type Story = StoryObj<BapsTypographyShowcase>;

export const Foundations: Story = {};

/* ─────────────────────────────────────────────────────────────────────────────
   Token-driven stories.

   The showcase above hard-codes every size inline, which is how a foundations
   page drifts from the tokens the components actually consume. These render
   FROM the token module instead, so a change in libs/tokens shows up here on
   the next build.

   Source: Figma "Typography", node 13193:58310.
   ───────────────────────────────────────────────────────────────────────────── */

const SIZE_STEPS: { token: string; value: string; px: number }[] = Object.entries(
  tokens as Record<string, string>,
)
  .filter(([k]) => /^FontSize/.test(k))
  .map(([token, value]) => ({ token, value, px: parseFloat(value) * 16 }))
  .sort((a, b) => a.px - b.px);

const WEIGHTS = [
  { token: 'FontWeightRegular', value: tokens.FontWeightRegular, label: 'Regular' },
  { token: 'FontWeightMedium', value: tokens.FontWeightMedium, label: 'Medium' },
  { token: 'FontWeightSemibold', value: tokens.FontWeightSemibold, label: 'Semi Bold' },
  { token: 'FontWeightBold', value: tokens.FontWeightBold, label: 'Bold' },
];

export const TypeScale: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        @for (s of steps; track s.token) {
          <div style="display:flex; align-items:baseline; gap:1.5rem;">
            <code style="min-width:190px; font-size:11px; color:var(--color-mybky-text-muted, #6f777d);">{{ s.token }} · {{ s.px }}px</code>
            <span [style.font-size]="s.value" style="line-height:1.3;">The quick brown fox</span>
          </div>
        }
      </div>
    `,
    props: { steps: SIZE_STEPS },
  }),
};

export const Weights: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        @for (w of weights; track w.token) {
          <div style="display:flex; align-items:baseline; gap:1.5rem;">
            <code style="min-width:190px; font-size:11px; color:var(--color-mybky-text-muted, #6f777d);">{{ w.token }} · {{ w.value }}</code>
            <span [style.font-weight]="w.value" style="font-size:1.125rem; line-height:1.3;">{{ w.label }} — the quick brown fox</span>
          </div>
        }
      </div>
    `,
    props: { weights: WEIGHTS },
  }),
};

export const Caps: Story = {
  render: () => ({
    template: `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <p style="margin:0; font-size:.85rem; color:var(--color-mybky-text-muted, #6f777d);">
          The only styles on the Figma sheet with non-zero tracking. Uppercase set at body
          tracking reads cramped, which is the whole reason this tier exists.
        </p>
        @for (s of capsSteps; track s.token) {
          <div style="display:flex; align-items:baseline; gap:1.5rem;">
            <code style="min-width:190px; font-size:11px; color:var(--color-mybky-text-muted, #6f777d);">{{ s.token }} · {{ s.px }}px</code>
            <span [style.font-size]="s.value" [style.letter-spacing]="caps"
                  style="text-transform:uppercase; font-weight:600; line-height:1.3;">Section label</span>
          </div>
        }
      </div>
    `,
    props: {
      capsSteps: SIZE_STEPS.filter((s) => [10, 12, 14, 16].includes(Math.round(s.px))),
      caps: tokens.FontLetterSpacingCaps,
    },
  }),
};
