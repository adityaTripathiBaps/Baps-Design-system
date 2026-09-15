import React from 'react';
import {
  addons,
  types,
  useChannel,
  useGlobals,
  useStorybookApi,
} from 'storybook/internal/manager-api';
import { DOCS_RENDERED, STORY_RENDERED } from 'storybook/internal/core-events';
import { IconButton, WithTooltip, Separator } from 'storybook/internal/components';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { CHROME_THEMES, CHROME_ACCENT, type ChromeBrand } from './chrome-theme';

/**
 * Dark mode (Theme mode action) — handled by storybook-dark-mode. It owns the
 * sun/moon toolbar button and toggles `.baps-dark` on the MANAGER chrome here.
 * The class it sets does NOT reach the preview iframe, so preview.ts listens to
 * the addon's DARK_MODE channel event and mirrors `.baps-dark` onto the iframe
 * body — that class is PrimeNG's darkModeSelector, and it drives both the
 * component re-skin and the docs/canvas dark CSS. Keep the class name in sync
 * with the darkModeSelector in preview.ts and baps.theme.ts.
 */

// The boot theme is set further down, once the brand has been read off the URL
// — see seedDarkStore/brandFromUrl. It cannot be set here because it depends on
// them.
//
// NOTE: storybook-dark-mode's settings do NOT belong in setConfig. v4 reads
// them with useParameter('darkMode', …), so they live in preview.ts's
// parameters. A darkMode block in a setConfig call is silently ignored.

// Lucide-style stroke icons (stroke-width 1.75, currentColor) — inlined so the
// toolbar buttons carry no icon-package dependency. See CLAUDE.md iconography.
const svg = (paths: React.ReactNode) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths}
  </svg>
);
const SearchIcon = () =>
  svg(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  );
const CogIcon = () =>
  svg(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10.6 3V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </>
  );

// 1. Search — focuses Storybook's built-in sidebar search (its results dropdown
// is the "search modal"); reused rather than rebuilt.
const SearchTool = () => (
  <IconButton
    key="baps-search"
    title="Search stories (press /)"
    onClick={() =>
      (document.getElementById('storybook-explorer-searchfield') as HTMLInputElement | null)?.focus()
    }
  >
    <SearchIcon />
  </IconButton>
);

// 2. Theme mode — provided by storybook-dark-mode (see addons.setConfig above).

// 3. Theme settings — popover grouping the theme options, laid out like the
// PrimeNG reference (section labels + a preset selector + toggles). Each control
// writes a global that the preview decorator reacts to.
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      opacity: 0.6,
      margin: '14px 0 8px',
    }}
  >
    {children}
  </div>
);

const Switch: React.FC<{ on: boolean; onToggle: () => void; accent: string }> = ({
  on,
  onToggle,
  accent,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onToggle}
    style={{
      width: 34,
      height: 20,
      padding: 2,
      border: 'none',
      borderRadius: 20,
      cursor: 'pointer',
      background: on ? accent : 'rgba(128,128,128,0.4)',
      transition: 'background 120ms ease-out',
      display: 'inline-flex',
      justifyContent: on ? 'flex-end' : 'flex-start',
    }}
  >
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
      }}
    />
  </button>
);

const ToggleRow: React.FC<{
  label: string;
  on: boolean;
  onToggle: () => void;
  accent: string;
}> = ({ label, on, onToggle, accent }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      padding: '5px 0',
    }}
  >
    <span>{label}</span>
    <Switch on={on} onToggle={onToggle} accent={accent} />
  </div>
);

// `awaiting: true` = in the switcher, no palette yet. Listed rather than hidden
// so the intended set is visible; selecting one leaves the preview on the MyBKY
// base and says so (see AWAITING_PALETTE in preview.ts) instead of borrowing
// another brand's skin.
const DS_OPTIONS = [
  { value: 'mybky', label: 'MyBKY' },
  { value: 'sampark', label: 'Sampark' },
  { value: 'baps', label: 'BAPS', awaiting: true },
  { value: 'appsell', label: 'App Sell', awaiting: true },
];

// Chrome brand, not design system: the two scaffolds have no chrome palette
// either, so they coerce to mybky and the manager keeps its default look.
const asBrand = (v: unknown): ChromeBrand => (v === 'sampark' ? 'sampark' : 'mybky');

/**
 * storybook-dark-mode's persisted store. Reaching into another addon's storage
 * is not something to do lightly, so: this key IS that addon's documented
 * persistence contract, and it is the only seam it offers. Its themes come
 * from a static story parameter, which cannot see a global, so a brand-aware
 * chrome cannot be expressed through the supported API at all.
 */
const DARK_MODE_STORE_KEY = 'sb-addon-themes-3';

const readDarkStore = (): Record<string, unknown> => {
  try {
    return JSON.parse(localStorage.getItem(DARK_MODE_STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

/** So a page load starts in the mode the user left it in. */
const readPersistedDark = (): boolean => readDarkStore()['current'] === 'dark';

/**
 * Point the addon's own store at this brand's pair, so that every time it
 * re-applies a theme — on mount, and on STORY_CHANGED / SET_STORIES /
 * DOCS_RENDERED — it applies the right brand. This is what makes the two
 * writers stop fighting: the addon remains the only thing that APPLIES a
 * theme, and this only decides which one it finds.
 */
const seedDarkStore = (brand: ChromeBrand) => {
  const store = readDarkStore();
  localStorage.setItem(
    DARK_MODE_STORE_KEY,
    JSON.stringify({
      ...store,
      light: CHROME_THEMES[brand].light,
      dark: CHROME_THEMES[brand].dark,
    }),
  );
};

// Seeded at module load, before the addon mounts and reads it, so the very
// first paint is already the right brand. The brand lives in the URL's
// `globals` param; Storybook has not parsed it into state this early, so read
// it directly rather than waiting a render and flashing the wrong palette.
const brandFromUrl = (): ChromeBrand => {
  const g = new URLSearchParams(window.location.search).get('globals') ?? '';
  return /(?:^|;)designSystem:sampark(?:;|$)/.test(g) ? 'sampark' : 'mybky';
};
const BOOT_BRAND = brandFromUrl();
seedDarkStore(BOOT_BRAND);
addons.setConfig({ theme: CHROME_THEMES[BOOT_BRAND][readPersistedDark() ? 'dark' : 'light'] });

/**
 * Brand -> chrome. Reads the `designSystem` global and the dark-mode addon's
 * channel event, and repaints the manager with the matching chrome theme.
 *
 * Why this exists rather than letting storybook-dark-mode own the theme: that
 * addon reads its two themes from the `darkMode` PARAMETER, and parameters are
 * static per story — they cannot see a global. So the brand half of the
 * brand x mode matrix can only be applied from here.
 *
 * The dark-mode addon still owns the `.baps-dark` class (PrimeNG's
 * darkModeSelector) and the sun/moon button, and it still swaps in its own
 * `darkMode.{light,dark}` themes. Those are the MyBKY pair, so on Sampark the
 * addon applies the wrong brand and ThemeSync has to write last — see the
 * ordering note on ThemeSync itself, which is subtler than it looks.
 *
 * The attributes on <html> are for CSS that emotion's theme object cannot
 * reach, and for this file's own controls below.
 */
const useBrand = () => {
  const [globals] = useGlobals();
  const brand = asBrand(globals['designSystem']);
  const [dark, setDark] = React.useState(readPersistedDark);
  useChannel({ [DARK_MODE_EVENT_NAME]: (isDark: boolean) => setDark(isDark) });
  return { brand, dark, accent: CHROME_ACCENT[brand][dark ? 'dark' : 'light'] };
};

/**
 * Renders nothing; exists only to own the repaint. Split from useBrand so the
 * several controls that just want the accent colour do not each re-run the
 * effect — setConfig is idempotent, but N copies of the same write is noise.
 */
/**
 * One brand at a time.
 *
 * The sidebar lists every story regardless of the selected design system, so a
 * MyBKY session showed Sampark-only components and Sampark-pinned examples too.
 * This hides what does not belong to the active brand.
 *
 * It reads `ds:` tags that the story files already declared — 16 of them carried
 * the tag and a comment saying it "drives the sidebar filter in manager.ts"
 * before any such filter existed. The tags are now complete and this is that
 * filter.
 *
 * Three rules, in order:
 *
 * 1. `ds:comparison` — the nine stories that render BOTH brands on one canvas.
 *    Hidden unless the toggle is on, since showing two brands at once is the
 *    thing the filter exists to prevent. They keep their ids and baselines.
 * 2. No `ds:` tag at all — shown. A safe default: a story should not vanish
 *    because someone forgot to tag it, and docs pages carry no tags.
 * 3. Otherwise — shown only if it carries the active brand's tag.
 *
 * Tags arrive already resolved: Storybook merges a story's tags into its meta's
 * and applies `!` negations at index time, so a Sampark-pinned story under a
 * both-brands meta reaches this as `['ds:sampark']`.
 *
 * This filters the SIDEBAR only. `index.json` still lists everything and every
 * story is still reachable by direct URL — which the visual suite depends on,
 * since it navigates to `/iframe.html?id=…` and never opens the sidebar.
 */
const BrandFilter: React.FC = () => {
  const [globals] = useGlobals();
  // experimental_setFilter lives on the manager API object, not on the addons
  // store (manager-api/index.d.ts:719). Calling it on `addons` throws and
  // blanks the entire manager.
  const api = useStorybookApi();
  // Scaffolded brands have no stories of their own and fall back to MyBKY,
  // matching what the preview does for them.
  const brand = asBrand(globals['designSystem']);
  const showComparison = globals['comparison'] === true;

  React.useEffect(() => {
    void api.experimental_setFilter('baps/brand-filter', (item) => {
      const tags: string[] = (item as { tags?: string[] }).tags ?? [];
      if (tags.includes('ds:comparison')) return showComparison;
      if (!tags.some((t) => t.startsWith('ds:'))) return true;
      return tags.includes(`ds:${brand}`);
    });
  }, [api, brand, showComparison]);

  return null;
};

const ThemeSync: React.FC = () => {
  const { brand, dark } = useBrand();
  const api = useStorybookApi();


  React.useEffect(() => {
    const mode = dark ? 'dark' : 'light';

    // Order matters. Seed first so the addon's next re-apply (it re-applies on
    // every story change) already finds this brand; then paint immediately so
    // the switch is not deferred until the next navigation.
    //
    // setOptions, NOT addons.setConfig: setConfig writes the boot config and
    // only reaches the chrome if something else happens to re-render, which is
    // why it appeared to work while toggling — the global change was doing the
    // re-rendering — and silently failed on first paint.
    seedDarkStore(brand);
    api.setOptions({ theme: CHROME_THEMES[brand][mode] });

    const root = document.documentElement;
    root.dataset['bapsBrand'] = brand;
    root.dataset['bapsMode'] = mode;
  }, [api, brand, dark]);

  return null;
};

// Palette pickers — the BAPS analog of the PrimeNG configurator's Primary +
// Surface swatches. Inlined (not imported from @org/ui-kit) so the manager
// bundle stays free of Angular/PrimeNG. Keys + swatch hexes mirror
// libs/ui-kit/src/lib/theme/accent.theme.ts, which owns the actual ramps
// (BAPS product accents from tokens; the rest generated via palette()).
// 'brand' / 'default' keep the preset's own palette.
const PRIMARY_OPTIONS = [
  { value: 'brand', label: 'Brand', color: '#5f78b8' },
  { value: 'slate', label: 'Slate teal', color: '#1f4a5c' },
  { value: 'clay', label: 'Clay', color: '#9a4d37' },
  { value: 'indigo', label: 'Indigo', color: '#3a4470' },
  { value: 'sage', label: 'Sage', color: '#486852' },
  { value: 'emerald', label: 'Emerald', color: '#10b981' },
  { value: 'green', label: 'Green', color: '#22c55e' },
  { value: 'lime', label: 'Lime', color: '#84cc16' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'amber', label: 'Amber', color: '#f59e0b' },
  { value: 'yellow', label: 'Yellow', color: '#eab308' },
  { value: 'teal', label: 'Teal', color: '#14b8a6' },
  { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
  { value: 'sky', label: 'Sky', color: '#0ea5e9' },
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'violet', label: 'Violet', color: '#8b5cf6' },
  { value: 'purple', label: 'Purple', color: '#a855f7' },
  { value: 'fuchsia', label: 'Fuchsia', color: '#d946ef' },
  { value: 'pink', label: 'Pink', color: '#ec4899' },
  { value: 'rose', label: 'Rose', color: '#f43f5e' },
];

const SURFACE_OPTIONS = [
  { value: 'default', label: 'Default', color: '#6f777d' },
  { value: 'slate', label: 'Slate', color: '#64748b' },
  { value: 'gray', label: 'Gray', color: '#6b7280' },
  { value: 'zinc', label: 'Zinc', color: '#71717a' },
  { value: 'neutral', label: 'Neutral', color: '#737373' },
  { value: 'stone', label: 'Stone', color: '#78716c' },
];

const Swatches: React.FC<{
  options: { value: string; label: string; color: string }[];
  selected: string;
  onSelect: (v: string) => void;
}> = ({ options, selected, onSelect }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {options.map((o) => {
      const isSel = selected === o.value;
      return (
        <button
          key={o.value}
          type="button"
          title={o.label}
          aria-label={o.label}
          aria-pressed={isSel}
          onClick={() => onSelect(o.value)}
          style={{
            width: 22,
            height: 22,
            padding: 0,
            cursor: 'pointer',
            borderRadius: '50%',
            background: o.color,
            border: '2px solid #fff',
            boxShadow: isSel ? `0 0 0 2px ${o.color}` : '0 0 0 1px rgba(128,128,128,0.4)',
          }}
        />
      );
    })}
  </div>
);

const SettingsPanel = () => {
  const [globals, updateGlobals] = useGlobals();
  // The RAW selection, not a coerced brand: a scaffold has to show as selected
  // in this row even though the preview falls back to the MyBKY base for it.
  // Coercing here made picking BAPS highlight MyBKY instead.
  const ds = String(globals['designSystem'] ?? 'mybky');
  // Two different "accents" meet here. `accent` is the Primary SWATCH global
  // the user picks below; `brandAccent` is the colour this panel's own controls
  // paint with, which follows the selected design system.
  const { accent: brandAccent } = useBrand();
  const accent = globals['accent'] ?? 'brand';
  const surface = globals['surface'] ?? 'default';
  const ripple = globals['ripple'] !== false;
  const rtl = globals['direction'] === 'rtl';
  const comparison = globals['comparison'] === true;
  return (
    <div style={{ padding: '12px 15px 15px', minWidth: 244, fontSize: 13 }}>
      <div style={{ fontWeight: 700 }}>Theme settings</div>
      <Separator />

      <SectionLabel>Design system</SectionLabel>
      {/* Wraps: four options no longer fit one row at this panel width, and a
          squeezed row truncates the labels rather than shrinking gracefully. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, border: '1px solid rgba(128,128,128,0.35)', borderRadius: 8, padding: 3 }}>
        {DS_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => updateGlobals({ designSystem: o.value })}
            title={o.awaiting ? `${o.label} has no palette yet — preview stays on the MyBKY base` : undefined}
            style={{
              flex: '1 1 40%',
              padding: '5px 8px',
              // Dashed edge on a scaffold, so "not ready" is visible in the row
              // itself and not only after selecting it.
              border: o.awaiting ? '1px dashed rgba(128,128,128,0.5)' : '1px solid transparent',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: ds === o.value ? 600 : 400,
              opacity: o.awaiting && ds !== o.value ? 0.6 : 1,
              color: ds === o.value ? '#fff' : 'inherit',
              background: ds === o.value ? brandAccent : 'transparent',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      <SectionLabel>Primary</SectionLabel>
      <Swatches
        options={PRIMARY_OPTIONS}
        selected={accent}
        onSelect={(v) => updateGlobals({ accent: v })}
      />

      <SectionLabel>Surface</SectionLabel>
      <Swatches
        options={SURFACE_OPTIONS}
        selected={surface}
        onSelect={(v) => updateGlobals({ surface: v })}
      />

      <SectionLabel>Options</SectionLabel>
      <ToggleRow
        label="Ripple"
        on={ripple}
        accent={brandAccent}
        onToggle={() => updateGlobals({ ripple: !ripple })}
      />
      <ToggleRow
        label="Right-to-left"
        on={rtl}
        accent={brandAccent}
        onToggle={() => updateGlobals({ direction: rtl ? 'ltr' : 'rtl' })}
      />
      {/* Off by default: the point of the brand filter is that one theme shows
          at a time, and these nine stories put both on one canvas. They stay
          reachable for a deliberate comparison rather than being deleted. */}
      <ToggleRow
        label="Show brand comparisons"
        on={comparison}
        accent={brandAccent}
        onToggle={() => updateGlobals({ comparison: !comparison })}
      />
    </div>
  );
};

const SettingsTool = () => (
  <WithTooltip placement="bottom" trigger="click" closeOnOutsideClick tooltip={<SettingsPanel />}>
    <IconButton key="baps-settings" title="Theme settings">
      <CogIcon />
    </IconButton>
  </WithTooltip>
);

addons.register('baps/global-actions', () => {
  // Registered as a tool purely because Storybook has no "invisible manager
  // component" slot — a TOOLEXTRA is always mounted, which is what the sync
  // needs. It renders null, so it costs no toolbar space.
  addons.add('baps/global-actions/theme-sync', {
    type: types.TOOLEXTRA,
    title: 'Theme sync',
    render: () => <ThemeSync />,
  });
  // Renders nothing; mounted here so the filter effect has somewhere to live,
  // the same arrangement ThemeSync uses for its repaint.
  addons.add('baps/global-actions/brand-filter', {
    type: types.TOOLEXTRA,
    title: 'Brand filter',
    render: () => <BrandFilter />,
  });
  addons.add('baps/global-actions/search', {
    type: types.TOOLEXTRA,
    title: 'Search',
    render: () => <SearchTool />,
  });
  addons.add('baps/global-actions/settings', {
    type: types.TOOLEXTRA,
    title: 'Theme settings',
    render: () => <SettingsTool />,
  });
});

/**
 * "On this page" — the PrimeNG reference's right-hand section outline.
 *
 * Storybook has no built-in equivalent; this is a genuinely new addon panel,
 * not a restyle. It reads the live headings straight out of the preview
 * iframe's rendered DOM (`h2`/`h3` inside addon-docs' `.sbdocs-wrapper`) —
 * whatever a docs page actually renders, not a hand-maintained list, so it
 * never drifts from the real content. A canvas-only story (no docs prose)
 * shows the empty state.
 *
 * Docked bottom by default — Storybook's addon-panel API has no supported
 * "start docked right" setting; the user drags it to the right via the
 * panel's own layout control (the ⠿ / "Change addon orientation" affordance
 * next to the panel tabs), same as PrimeNG's own doc site lets a reader do
 * nothing special to get — it's just always there. One-time manual step,
 * not a limitation of the panel itself.
 */
interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const scanTocHeadings = (): TocHeading[] => {
  const iframe = document.getElementById('storybook-preview-iframe') as HTMLIFrameElement | null;
  const doc = iframe?.contentDocument;
  if (!doc) return [];
  const nodes = Array.from(doc.querySelectorAll<HTMLElement>('.sbdocs-wrapper h2[id], .sbdocs-wrapper h3[id]'));
  return nodes.map((el) => ({
    id: el.id,
    text: el.textContent ?? '',
    level: el.tagName === 'H3' ? 3 : 2,
  }));
};

const TocPanel: React.FC = () => {
  const [headings, setHeadings] = React.useState<TocHeading[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  // The active-section rail takes the brand accent, same as the docs shell's
  // own TOC rail, so the panel does not stay navy on a Sampark page.
  const { accent } = useBrand();

  const rescan = React.useCallback(() => setHeadings(scanTocHeadings()), []);

  useChannel({
    [DOCS_RENDERED]: rescan,
    [STORY_RENDERED]: rescan,
  });

  // addon-docs streams MDX content in a tick after DOCS_RENDERED fires, so the
  // first scan can be too early on a fresh page load. One delayed retry covers
  // it without polling.
  React.useEffect(() => {
    rescan();
    const timer = setTimeout(rescan, 300);
    return () => clearTimeout(timer);
  }, [rescan]);

  const goTo = (id: string) => {
    const iframe = document.getElementById('storybook-preview-iframe') as HTMLIFrameElement | null;
    iframe?.contentDocument?.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  if (headings.length === 0) {
    return (
      <div style={{ padding: 15, fontSize: 13, opacity: 0.6 }}>
        No sections on this page.
      </div>
    );
  }

  return (
    <nav style={{ padding: '11px 0' }} aria-label="On this page">
      {headings.map((h) => (
        <button
          key={h.id}
          type="button"
          onClick={() => goTo(h.id)}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: `6px 15px 6px ${h.level === 3 ? 28 : 15}px`,
            border: 'none',
            borderLeft: activeId === h.id ? `2px solid ${accent}` : '2px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: h.level === 3 ? 12 : 13,
            color: activeId === h.id ? accent : 'inherit',
          }}
        >
          {h.text}
        </button>
      ))}
    </nav>
  );
};

addons.register('baps/toc', () => {
  addons.add('baps/toc/panel', {
    type: types.PANEL,
    title: 'On this page',
    render: ({ active }) => (active ? <TocPanel /> : null),
  });
});
