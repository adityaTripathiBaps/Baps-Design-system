import { Sampark } from './sampark.theme';
import { MyBky } from './baps.theme';
import {
  withPrimaryRamp,
  applyThemeToDesignSystem,
  applyNavTheme,
  rampFor,
  PRIMARY_RAMPS,
} from './accent.theme';

describe('One Ramp, Two Sinks Theme Architecture', () => {
  const testColors = [
    { name: 'Indigo (App Shell Default)', hex: '#4f46e5' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Amber', hex: '#f59e0b' },
  ];

  afterEach(() => {
    // Reset any DOM writes
    applyThemeToDesignSystem('sampark', 'brand');
    applyThemeToDesignSystem('mybky', 'brand');
  });

  describe('Single Source of Truth & Ramp Generation (rampFor)', () => {
    it('returns undefined for "brand" to guard baseline no-op', () => {
      expect(rampFor('brand')).toBeUndefined();
    });

    it('generates the complete 50–950 ramp for a hex color', () => {
      const ramp = rampFor('#4f46e5') as Record<number, string>;
      expect(ramp).toBeDefined();
      const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      for (const s of steps) {
        expect(ramp[s]).toBeDefined();
        expect(typeof ramp[s]).toBe('string');
      }
    });

    it('resolves named swatches correctly from PRIMARY_RAMPS', () => {
      const ramp = rampFor('rose');
      expect(ramp).toBeDefined();
      expect(ramp).toEqual(PRIMARY_RAMPS['rose']);
    });

    it('resolves standard named colors (red, black, white, blue, emerald, navy)', () => {
      for (const name of ['red', 'black', 'white', 'blue', 'emerald', 'amber', 'navy', 'gray']) {
        const ramp = rampFor(name);
        expect(ramp).toBeDefined();
        expect(ramp![500]).toBeDefined();
        expect(ramp![950]).toBeDefined();
      }
    });
  });

  describe('Sink 1 — PrimeNG Presets with withPrimaryRamp', () => {
    testColors.forEach(({ name, hex }) => {
      it(`correctly updates semantic and component tokens for ${name}`, () => {
        const ramp = rampFor(hex)! as Record<number, string>;
        const preset = withPrimaryRamp(Sampark, ramp) as any;

        // 1. Semantic primary tokens
        expect(preset.semantic?.primary).toBeDefined();
        expect(preset.semantic.primary[500]).toBe(ramp[500]);
        expect(preset.semantic.primary[600]).toBe(ramp[600]);
        expect(preset.semantic.primary[700]).toBe(ramp[700]);

        // 2. Component-level primary-derived tokens
        const comp = preset.components as any;
        expect(comp).toBeDefined();

        // Button: primary background, hover, active, ghost text, link
        expect(comp.button?.colorScheme?.light?.root?.primary?.background).toBe(ramp[600]);
        expect(comp.button?.colorScheme?.light?.root?.primary?.hoverBackground).toBe(ramp[700]);
        expect(comp.button?.colorScheme?.light?.root?.primary?.activeBackground).toBe(ramp[800]);
        expect(comp.button?.colorScheme?.light?.text?.primary?.color).toBe(ramp[600]);
        expect(comp.button?.colorScheme?.light?.text?.primary?.hoverBackground).toBe(ramp[50]);
        expect(comp.button?.colorScheme?.light?.link?.color).toBe(ramp[600]);

        // Dark mode button
        expect(comp.button?.colorScheme?.dark?.root?.primary?.background).toBe(ramp[600]);
        expect(comp.button?.colorScheme?.dark?.text?.primary?.color).toBe(ramp[600]);

        // Checkbox: checked border, hover border, tick
        expect(comp.checkbox?.colorScheme?.light?.root?.checkedBorderColor).toBe(ramp[600]);
        expect(comp.checkbox?.colorScheme?.light?.root?.hoverBorderColor).toBe(ramp[700]);
        expect(comp.checkbox?.colorScheme?.light?.icon?.checkedColor).toBe(ramp[600]);

        // RadioButton: checked border, hover border, hover background, dot
        expect(comp.radiobutton?.colorScheme?.light?.root?.checkedBorderColor).toBe(ramp[600]);
        expect(comp.radiobutton?.colorScheme?.light?.root?.hoverBorderColor).toBe(ramp[700]);
        expect(comp.radiobutton?.colorScheme?.light?.root?.checkedHoverBackground).toBe(ramp[700]);
        expect(comp.radiobutton?.colorScheme?.light?.icon?.checkedColor).toBe(ramp[600]);

        // ToggleSwitch
        expect(comp.toggleswitch?.colorScheme?.light?.root?.checkedBackground).toBe(ramp[600]);

        // Tabs — the active indicator. Light mode is masked by
        // _tabs-sampark.scss's !important rules, so only the preset proves the
        // dark scheme and the active bar actually move.
        expect(comp.tabs?.colorScheme?.light?.activeBar?.background).toBe(ramp[600]);
        expect(comp.tabs?.colorScheme?.light?.tab?.activeColor).toBe(ramp[600]);
        expect(comp.tabs?.colorScheme?.dark?.activeBar?.background).toBe(ramp[400]);

        // ProgressBar
        expect(comp.progressbar?.value?.background).toBe(ramp[600]);

        // Slider
        expect(comp.slider?.range?.background).toBe(ramp[600]);
        expect(comp.slider?.handle?.background).toBe(ramp[600]);
        expect(comp.slider?.handle?.hoverBackground).toBe(ramp[700]);

        // Avatar
        expect(comp.avatar?.root?.background).toBe(ramp[50]);

        // DataTable selected row
        expect(comp.datatable?.colorScheme?.light?.row?.selectedBackground).toBe(ramp[50]);
      });
    });

    it('remaps MyBky derived components when passed MyBky preset', () => {
      const ramp = rampFor('#4f46e5')! as Record<number, string>;
      const preset = withPrimaryRamp(MyBky, ramp) as any;
      const comp = preset.components as any;
      expect(comp.button?.colorScheme?.light?.root?.primary?.background).toContain(ramp[600]);
      expect(comp.button?.colorScheme?.light?.root?.primary?.background).toContain(ramp[800]);

      // Checkbox
      expect(comp.checkbox?.colorScheme?.light?.root?.checkedBorderColor).toBe(ramp[600]);
      expect(comp.checkbox?.colorScheme?.light?.icon?.checkedColor).toBe(ramp[600]);
      expect(comp.checkbox?.colorScheme?.dark?.root?.checkedBorderColor).toBe(ramp[400]);

      // Radiobutton
      expect(comp.radiobutton?.colorScheme?.light?.root?.checkedBorderColor).toBe(ramp[600]);

      // ToggleSwitch
      expect(comp.toggleswitch?.colorScheme?.light?.root?.checkedBackground).toBe(ramp[600]);

      // ProgressBar
      expect(comp.progressbar?.value?.background).toBe(ramp[600]);

      // Avatar
      expect(comp.avatar?.colorScheme?.light?.root?.background).toBe(ramp[50]);
    });
  });

  describe('Sink 2 — Design System CSS Custom Properties (applyThemeToDesignSystem)', () => {
    testColors.forEach(({ name, hex }) => {
      it(`writes the complete mapped token tier to documentElement for ${name}`, () => {
        const ramp = rampFor(hex)!;
        applyThemeToDesignSystem('sampark', ramp);
        const root = document.documentElement;

        expect(root.style.getPropertyValue('--color-sampark-primary-0')).toBe(ramp[50]);
        expect(root.style.getPropertyValue('--color-sampark-primary-10')).toBe(ramp[100]);
        expect(root.style.getPropertyValue('--color-sampark-primary-20')).toBe(ramp[200]);
        expect(root.style.getPropertyValue('--color-sampark-primary-40')).toBe(ramp[400]);
        expect(root.style.getPropertyValue('--color-sampark-primary-60')).toBe(ramp[600]);
        expect(root.style.getPropertyValue('--color-sampark-primary-80')).toBe(ramp[700]);
        expect(root.style.getPropertyValue('--color-sampark-primary-100')).toBe(ramp[800]);

        const alpha10 = root.style.getPropertyValue('--color-sampark-primary-alpha10');
        expect(alpha10).toContain(ramp[800]);
      });
    });

    it('cleans up previously written properties when re-theming or returning to brand', () => {
      applyThemeToDesignSystem('sampark', '#4f46e5');
      expect(document.documentElement.style.getPropertyValue('--color-sampark-primary-60')).not.toBe('');

      applyThemeToDesignSystem('sampark', 'brand');
      expect(document.documentElement.style.getPropertyValue('--color-sampark-primary-60')).toBe('');
      expect(document.documentElement.style.getPropertyValue('--color-sampark-primary-alpha10')).toBe('');
    });
  });

  describe('Sink 3 — Navigation / chrome colour (applyNavTheme)', () => {
    afterEach(() => applyNavTheme());

    it('writes the three secondary chrome steps for a hex', () => {
      applyNavTheme('#1e1b4b');
      const s = document.documentElement.style;
      expect(s.getPropertyValue('--color-sampark-secondary-100')).toBe('#1e1b4b');
      expect(s.getPropertyValue('--color-sampark-secondary-80')).toContain('color-mix');
      expect(s.getPropertyValue('--color-sampark-secondary-60')).toContain('#1e1b4b');
    });

    it('removes the overrides for brand/empty rather than writing a literal', () => {
      applyNavTheme('#1e1b4b');
      applyNavTheme('brand');
      const s = document.documentElement.style;
      for (const step of [100, 80, 60]) {
        expect(s.getPropertyValue(`--color-sampark-secondary-${step}`)).toBe('');
      }
      applyNavTheme('#1e1b4b');
      applyNavTheme();
      expect(s.getPropertyValue('--color-sampark-secondary-100')).toBe('');
    });

    it('leaves the primary sink untouched — the two channels are independent', () => {
      applyThemeToDesignSystem('sampark', '#4f46e5');
      applyNavTheme('#1e1b4b');
      const s = document.documentElement.style;
      expect(s.getPropertyValue('--color-sampark-primary-60')).not.toBe('');
      applyNavTheme();
      expect(s.getPropertyValue('--color-sampark-primary-60')).not.toBe('');
    });

    it('handles named colors for navigation chrome (black, white, emerald, red)', () => {
      const s = document.documentElement.style;

      applyNavTheme('black');
      expect(s.getPropertyValue('--color-sampark-secondary-100')).toBe('#000000');

      applyNavTheme('white');
      expect(s.getPropertyValue('--color-sampark-secondary-100')).toBe('#ffffff');

      applyNavTheme('emerald');
      // Should pick ramp[950] for dark chrome
      expect(s.getPropertyValue('--color-sampark-secondary-100')).toBe(rampFor('emerald')![950]);

      applyNavTheme('red');
      // Should pick ramp[950] for dark crimson chrome
      expect(s.getPropertyValue('--color-sampark-secondary-100')).toBe(rampFor('red')![950]);
    });
  });
});
