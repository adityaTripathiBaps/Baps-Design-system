import type { Meta, StoryObj } from '@storybook/angular';
import * as tokens from '@org/tokens/generated/tokens';

/**
 * The colour foundations, rendered FROM the token module rather than from a
 * hand-written list. A ramp that changes in libs/tokens changes here on the
 * next build, so this page cannot drift away from what the components consume —
 * which is the failure mode of every hand-maintained swatch sheet.
 */
type Swatch = { name: string; value: string };

/**
 * Every PRIMITIVE step under the given prefix.
 *
 * The suffix test matters: a bare `startsWith` also pulls in the semantic
 * aliases that share the prefix — ColorSamparkPrimaryDefault, …Hover, …Tint —
 * and those belong to the semantic tier, not on a primitives sheet. A primitive
 * step is a number, an Alpha step, or Borders.
 */
const ramp = (prefix: string): Swatch[] =>
  Object.entries(tokens as Record<string, string>)
    .filter(
      ([k, v]) =>
        k.startsWith(prefix) &&
        /^(\d+|Alpha\w*|Borders)$/.test(k.slice(prefix.length)) &&
        typeof v === 'string' &&
        /^(#|rgb)/.test(v),
    )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      // Numeric steps ascend; named steps (Borders, Alpha…) fall to the end.
      const na = Number(a.name.slice(prefix.length));
      const nb = Number(b.name.slice(prefix.length));
      if (Number.isNaN(na) && Number.isNaN(nb)) return a.name.localeCompare(b.name);
      if (Number.isNaN(na)) return 1;
      if (Number.isNaN(nb)) return -1;
      return na - nb;
    });

const label = (prefix: string, name: string) => name.slice(prefix.length) || name;

const GRID = `
  <div style="display:flex; flex-direction:column; gap:2rem;">
    @for (g of groups; track g.title) {
      <section>
        <h3 style="margin:0 0 .25rem; font-size:.95rem;">{{ g.title }}</h3>
        <p style="margin:0 0 .75rem; font-size:.82rem; color:#6f777d;">{{ g.note }}</p>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:.75rem;">
          @for (s of g.swatches; track s.name) {
            <div style="border:1px solid #e4ecf1; border-radius:8px; overflow:hidden;">
              <div [style.background]="s.value" style="height:56px; background-image:linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%),linear-gradient(45deg,#eee 25%,transparent 25%,transparent 75%,#eee 75%); background-size:12px 12px; background-position:0 0,6px 6px;"></div>
              <div style="padding:.5rem .625rem; font-family:ui-monospace,monospace; font-size:11px; line-height:1.5;">
                <strong style="display:block;">{{ s.step }}</strong>
                <span style="color:#6f777d;">{{ s.value }}</span>
              </div>
            </div>
          }
        </div>
      </section>
    }
  </div>
`;

const group = (title: string, prefix: string, note: string) => ({
  title,
  note,
  swatches: ramp(prefix).map((s) => ({ ...s, step: label(prefix, s.name) })),
});

const meta: Meta = {
  title: 'Foundations/Colour',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const SamparkBrand: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: GRID,
    props: {
      groups: [
        group('Primary', 'ColorSamparkPrimary', 'The Sampark maroon. primary.60 is the core brand colour.'),
        group('Secondary', 'ColorSamparkSecondary', 'A full warm neutral scale — read in reverse it is also the dark-mode palette.'),
        group('Tertiary', 'ColorSamparkTertiary', 'The supporting blue.'),
      ],
    },
  }),
};

export const SamparkNeutrals: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: GRID,
    props: {
      groups: [
        group('Mono', 'ColorSamparkMono', 'Surfaces, text and borders. The alpha steps are scrims — they keep whatever sits behind them.'),
      ],
    },
  }),
};

export const SamparkStatus: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:mybky'],
  render: () => ({
    template: GRID,
    props: {
      groups: [
        group('Error', 'ColorSamparkError', 'Runs 10 to 100, matching the Figma scale.'),
        group('Info', 'ColorSamparkInfo', 'Runs 5 to 80 — one label below the Figma scale. Same colours, different step names.'),
        group('Success', 'ColorSamparkSuccess', 'Runs 5 to 80 — same label offset as Info.'),
        group('Warning', 'ColorSamparkWarning', 'Runs 5 to 80 — same label offset as Info.'),
      ],
    },
  }),
};

export const MyBky: Story = {
  // Pinned to one brand — hidden from the other brand's sidebar.
  tags: ['!ds:sampark'],
  render: () => ({
    template: GRID,
    props: {
      groups: [
        group('Blue', 'ColorMybkyBlue', 'The MyBKY brand ramp, 50 to 950.'),
        group('Mono', 'ColorMybkyMono', 'Surfaces and text, 0 to 950. The dark end drives dark mode for both brands today.'),
      ],
    },
  }),
};
