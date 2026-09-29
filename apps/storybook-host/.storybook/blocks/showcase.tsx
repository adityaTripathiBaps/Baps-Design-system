/**
 * Showcase blocks — two pieces borrowed from 21st.dev's component site and
 * rebuilt on this Storybook's own rules rather than copied:
 *
 *   ComponentGallery — every component on one page, one row per component
 *                      (21st.dev's category rows): name, "View all", and its
 *                      examples as cards. A card shows a still, plays the live
 *                      story on hover, and has its own Copy prompt for that
 *                      example (CopyPrompt, from ./prompt).
 *   ThemePreview     — the Pattern screens stacked on one page so a brand or
 *                      mode switch can be judged end to end, with a
 *                      side-by-side view behind "Show brand comparisons".
 *
 * Nothing here is a panel or a tab (storybook.md: "never hand-build a panel").
 * They are MDX blocks, like DemoCard.
 *
 * Previews are real stories in same-origin iframes (`iframe.html?id=…`), the
 * same URL the visual suite uses. 21st.dev plays a muted video per card; an
 * Angular story has no video, so the equivalent here is to boot the story only
 * when its card nears the viewport, a few at a time.
 *
 * Every colour is a `--baps-docs-*` property and every motion value a
 * `--motion-*` token, so these follow the brand and dark toggles for free. The
 * class names are styled in ../../src/_docs-shell.scss, scoped to
 * `.sbdocs-wrapper` like everything else there, so nothing can match inside a
 * story iframe (the visual baselines).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addons } from 'storybook/internal/preview-api';
import { UPDATE_GLOBALS } from 'storybook/internal/core-events';
import { UPDATE_DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
// The same exports the toolbar's Primary picker mirrors, so the cards cannot
// drift from what the toolbar offers.
import { PRIMARY_COLORS, rampFor } from '@org/ui-kit';
import { useTheme } from './foundations';
import { CopyPrompt, rememberSource, storybookUrl } from './prompt';

type Brand = 'mybky' | 'sampark';

/* ── index.json ────────────────────────────────────────────────────────────
   The live story index. Reading it (instead of a hand-kept list) means a new
   component appears in the gallery with no edit here. */
type IndexEntry = {
  id: string;
  title: string;
  name: string;
  type: 'story' | 'docs';
  tags?: string[];
};
let indexPromise: Promise<IndexEntry[]> | undefined;
const loadIndex = () =>
  (indexPromise ??= fetch('index.json')
    .then((r) => r.json())
    .then((j: { entries: Record<string, IndexEntry> }) =>
      Object.values(j.entries),
    ));

/* ── Preview frames ────────────────────────────────────────────────────────
   Two hard-won constraints, both measured on the first version of this file,
   which mounted every card's story as it scrolled into view and froze the tab:

   1. Same-origin iframes share the page's main thread, and every preview boots
      a full Angular + PrimeNG app plus the 7.5 MB compodoc JSON. A page of
      them is a page of blocking parses. So frames boot one at a time, and the
      gallery boots a card only when it is hovered or focused — 21st.dev's own
      pattern, where a still image sits in the card and the video plays on
      hover. Our still image is the story's Playwright baseline.

   2. Storybook 8.6's preview channel accepts any postMessage carrying its key,
      with no check on who sent it (PostMessageTransport.handleEvent). A nested
      story posts its lifecycle events to `window.parent` — which here is this
      docs page, not the manager — and the docs preview acts on them: a Sampark
      frame's `setGlobals` switched the whole docs page to Sampark, and the
      resulting docs re-render closed the theme sheet. The guard below blanks
      channel messages whose source is one of our frames. */
const FRAME_ATTR = 'data-baps-showcase';
const SNIPPET_RENDERED = 'storybook/docs/snippet-rendered';
const snippetFrom = (data: unknown) => {
  try {
    const msg = typeof data === 'string' ? JSON.parse(data) : data;
    const event = (msg as { event?: { type?: string; args?: unknown[] } })
      ?.event;
    if (event?.type !== SNIPPET_RENDERED) return;
    const payload = event.args?.[0] as
      | { id?: string; source?: string; args?: Record<string, unknown> }
      | undefined;
    if (payload?.id && payload.source)
      rememberSource(payload.id, payload.source, payload.args);
  } catch {
    /* not a channel message we can read */
  }
};
let guarded = false;
const guardChannel = () => {
  if (guarded) return;
  guarded = true;
  window.addEventListener(
    'message',
    (e) => {
      const source = e.source as Window | null;
      if (!source || source === window.parent) return;
      for (const f of Array.from(
        document.querySelectorAll<HTMLIFrameElement>(`iframe[${FRAME_ATTR}]`),
      )) {
        if (f.contentWindow === source) {
          // Before dropping it, keep the one message worth keeping: the
          // example's rendered snippet, so the card's Copy prompt can carry
          // the exact code "Show code" would show.
          snippetFrom(e.data);
          // Then blank the message for every listener after this one.
          // stopImmediatePropagation alone is NOT enough — measured in this
          // Chromium, a capture listener that stops immediate propagation at
          // the window still lets the window's bubble listeners run, and the
          // channel's transport is one of those. Shadowing `data` with an own
          // property means the transport reads `undefined`, finds no channel
          // key, and ignores the message.
          Object.defineProperty(e, 'data', {
            value: undefined,
            configurable: true,
          });
          e.stopImmediatePropagation();
          return;
        }
      }
    },
    true,
  );
};

/* One boot at a time. `bootedAt` is a watchdog: module state outlives a docs
   page (Storybook keeps the preview iframe between pages), so a slot that was
   never handed back would otherwise stall every preview on every later page.
   A boot that has held the slot for 12s is treated as finished. */
let booting = false;
let bootedAt = 0;
const bootQueue: Array<() => void> = [];
const BOOT_WATCHDOG_MS = 12000;
const acquire = () =>
  new Promise<void>((resolve) => {
    if (!booting || Date.now() - bootedAt > BOOT_WATCHDOG_MS) {
      booting = true;
      bootedAt = Date.now();
      resolve();
    } else bootQueue.push(resolve);
  });
const release = () => {
  const next = bootQueue.shift();
  if (next) {
    bootedAt = Date.now();
    next();
  } else booting = false;
};

const frameSrc = (id: string, brand: Brand, accent?: string) =>
  // The brand (and a primary-colour accent) travel in the same `globals` param
  // the toolbar writes, which preview-head.html reads before first paint.
  `iframe.html?id=${id}&viewMode=story&globals=designSystem:${brand}${accent ? `;accent:${accent}` : ''}`;

/* Dark mode is not a global: storybook-dark-mode owns it and preview.ts
   mirrors its class onto <html>/<body>. A framed story reads the addon's
   persisted choice on boot, so a frame that must show a SPECIFIC mode sets the
   same two classes itself once loaded — the frame is same-origin, and its
   channel is cut off from the toolbar (guardChannel), so nothing flips it back. */
const applyMode = (
  frame: HTMLIFrameElement | null,
  mode?: 'light' | 'dark',
): (() => void) | undefined => {
  const doc = frame?.contentDocument;
  if (!doc || !mode) return undefined;
  const set = () => {
    for (const el of [doc.documentElement, doc.body]) {
      if (!el) continue;
      if (el.classList.contains('baps-dark') !== (mode === 'dark'))
        el.classList.toggle('baps-dark', mode === 'dark');
      if (el.classList.contains('baps-light') !== (mode === 'light'))
        el.classList.toggle('baps-light', mode === 'light');
    }
  };
  set();
  // The framed preview applies ITS persisted mode when its first story
  // renders, which is after the frame's load event — so hold the mode rather
  // than setting it once. `set` only writes on a mismatch, so it cannot loop.
  const mo = new MutationObserver(set);
  for (const el of [doc.documentElement, doc.body])
    if (el) mo.observe(el, { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
};

/** Mounts the story once `active` is true, waiting its turn in the boot queue. */
const PreviewFrame = ({
  id,
  brand,
  title,
  active,
  fit,
  accent,
  mode,
  onReady,
}: {
  id: string;
  brand: Brand;
  title: string;
  active: boolean;
  fit?: boolean;
  accent?: string;
  mode?: 'light' | 'dark';
  onReady?: () => void;
}) => {
  const frame = useRef<HTMLIFrameElement>(null);
  // Frees the boot slot exactly once: on load, on timeout, or on unmount.
  const freeSlot = useRef<() => void>(() => undefined);
  // Disconnects the observer that holds a forced light/dark mode (applyMode).
  const holdMode = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => holdMode.current?.(), []);
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!active) return undefined;
    guardChannel();
    let mounted = true;
    let holding = false;
    // Each run frees ITS OWN slot. An earlier version freed through the
    // shared ref, so when this effect re-ran (a card retired and woken again)
    // the first run's slot was released by the second run's closure, which
    // held nothing — and the queue stalled for good.
    const free = () => {
      if (holding) {
        holding = false;
        release();
      }
    };
    freeSlot.current = free;
    acquire().then(() => {
      holding = true;
      if (mounted) setAllowed(true);
      else free();
    });
    // A story that never fires load must not stall the queue.
    const timeout = window.setTimeout(free, 10000);
    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      free();
      setAllowed(false);
      setReady(false);
    };
  }, [active]);

  useEffect(() => {
    if (!fit || !ready) return;
    // Same origin, so the story's height can be read and followed.
    const doc = frame.current?.contentDocument;
    if (!doc?.body) return;
    const measure = () => setHeight(doc.documentElement.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(doc.body);
    return () => ro.disconnect();
  }, [fit, ready]);

  if (!allowed) return null;
  return (
    <iframe
      ref={frame}
      {...{ [FRAME_ATTR]: '' }}
      title={title}
      src={frameSrc(id, brand, accent)}
      tabIndex={fit ? 0 : -1}
      style={fit && height ? { height } : undefined}
      onLoad={() => {
        holdMode.current?.();
        holdMode.current = applyMode(frame.current, mode);
        setReady(true);
        freeSlot.current();
        onReady?.();
      }}
      className={ready ? 'is-ready' : undefined}
    />
  );
};

/* Card still image: the Playwright baseline for the same story, served by the
   `/visual-baselines` static dir in main.ts. Baselines are captured in MyBKY
   light, so they are shown only there; another brand or dark mode gets a
   neutral plate, since a MyBKY picture on a Sampark page would misstate the
   component. The platform suffix follows whichever OS last wrote the
   baselines, so both are tried. */
const POSTER_SUFFIXES = ['-chromium-win32.png', '-chromium-linux.png'];
const Poster = ({
  storyId,
  name,
  show,
}: {
  storyId: string;
  name: string;
  show: boolean;
}) => {
  const [attempt, setAttempt] = useState(0);
  if (!show || attempt >= POSTER_SUFFIXES.length) {
    return (
      <span className="baps-docs-frame__plate" aria-hidden="true">
        {name}
      </span>
    );
  }
  return (
    <img
      className="baps-docs-frame__poster"
      src={`visual-baselines/${storyId}${POSTER_SUFFIXES[attempt]}`}
      alt=""
      loading="lazy"
      onError={() => setAttempt((a) => a + 1)}
    />
  );
};

/* At most four cards stay live; hovering a fifth retires the oldest. Each live
   card is a running Angular app, so an unbounded set would grow with every
   card the pointer crosses. */
const MAX_LIVE = 4;
const liveCards: Array<() => void> = [];
const claimLive = (retire: () => void) => {
  liveCards.push(retire);
  while (liveCards.length > MAX_LIVE) liveCards.shift()?.();
};
const dropLive = (retire: () => void) => {
  const i = liveCards.indexOf(retire);
  if (i !== -1) liveCards.splice(i, 1);
};

/* ── ComponentGallery ──────────────────────────────────────────────────────
   21st.dev's category rows, one per component: a header with the component's
   name and "View all", then its examples as a horizontal row of cards with a
   next / previous arrow. Every card and "View all" open the component page.

   Which examples appear follows the sidebar filter in manager.tsx: no
   comparison stories, no stories pinned to the other brand, and no
   `Interaction — …` stories (they exist for tools/check-interactions.mjs).
   A story tagged `preview` is moved to the front of its row. */
type Example = { id: string; name: string };
type Row = {
  componentId: string;
  name: string;
  group: string;
  examples: Example[];
};

const usableFor = (brand: Brand) => (s: IndexEntry) => {
  const tags = s.tags ?? [];
  if (/^interaction/i.test(s.name)) return false;
  if (tags.includes('ds:comparison')) return false;
  const ds = tags.filter((t) => t.startsWith('ds:'));
  return ds.length === 0 || ds.includes(`ds:${brand}`);
};

const useRows = (brand: Brand) => {
  const [rows, setRows] = useState<Row[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadIndex().then((entries) => {
      const byComponent = new Map<string, IndexEntry[]>();
      for (const e of entries) {
        if (
          e.type !== 'story' ||
          !e.id.startsWith('components-') ||
          !e.title.startsWith('Components/')
        )
          continue;
        const key = e.id.split('--')[0];
        byComponent.set(key, [...(byComponent.get(key) ?? []), e]);
      }
      const out: Row[] = [];
      for (const [componentId, stories] of byComponent) {
        const usable = stories.filter(usableFor(brand));
        if (!usable.length) continue;
        usable.sort(
          (a, b) =>
            Number(!!b.tags?.includes('preview')) -
            Number(!!a.tags?.includes('preview')),
        );
        const parts = usable[0].title.split('/');
        out.push({
          componentId,
          name: parts[parts.length - 1],
          group: parts[1] ?? 'Components',
          examples: usable.map((s) => ({ id: s.id, name: s.name })),
        });
      }
      if (alive) setRows(out);
    });
    return () => {
      alive = false;
    };
  }, [brand]);
  return rows;
};

const ExampleCard = ({
  example,
  componentName,
  href,
  brand,
  poster,
}: {
  example: Example;
  componentName: string;
  href: string;
  brand: Brand;
  poster: boolean;
}) => {
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const intent = useRef<number | undefined>(undefined);
  const retire = useRef(() => {
    setLive(false);
    setReady(false);
  });

  useEffect(() => () => dropLive(retire.current), []);

  // A short delay, so sweeping the pointer across a row does not queue a boot
  // for every card it crosses.
  const wake = () => {
    if (live) return;
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => {
      claimLive(retire.current);
      setLive(true);
    }, 150);
  };
  const cancel = () => window.clearTimeout(intent.current);

  return (
    <li
      className="baps-docs-card"
      onPointerEnter={wake}
      onPointerLeave={cancel}
    >
      <div className="baps-docs-card__stack">
        {/* Two siblings, not one link around everything: the card also holds
            a Copy prompt button, and a button inside a link is invalid and
            reads badly in a screen reader. The preview link is a mouse target
            only; the keyboard meets the name link and the prompt button. */}
        <a
          className="baps-docs-card__link"
          href={href}
          target="_top"
          tabIndex={-1}
          aria-hidden="true"
        >
          <div className={`baps-docs-frame${ready ? ' is-live' : ''}`}>
            <Poster storyId={example.id} name={example.name} show={poster} />
            <PreviewFrame
              id={example.id}
              brand={brand}
              title={`${componentName}, ${example.name}`}
              active={live}
              onReady={() => setReady(true)}
            />
          </div>
        </a>
        <span className="baps-docs-card__meta">
          <a
            className="baps-docs-card__name"
            href={href}
            target="_top"
            onFocus={wake}
            aria-label={`${componentName}: ${example.name}. Open the ${componentName} page`}
          >
            {example.name}
          </a>
          <CopyPrompt storyId={example.id} size="sm" />
        </span>
      </div>
    </li>
  );
};

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={dir === 'right' ? 'm9 18 6-6-6-6' : 'm15 18-6-6 6-6'} />
  </svg>
);

const ComponentRow = ({
  row,
  brand,
  poster,
}: {
  row: Row;
  brand: Brand;
  poster: boolean;
}) => {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const href = storybookUrl(`/docs/${row.componentId}--docs`);
  const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const measure = () => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 1,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    });
  };
  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One page of cards per click, like 21st.dev's arrow.
  const page = (dir: 1 | -1) =>
    track.current?.scrollBy({
      left: dir * track.current.clientWidth * 0.9,
      behavior: 'smooth',
    });

  return (
    <section className="baps-docs-row" aria-labelledby={`row-${slug}`}>
      <header className="baps-docs-row__head">
        {/* An h3 so the "On this page" panel lists each component. */}
        <h3 id={`row-${slug}`}>
          {row.name}
          <span className="baps-docs-card__count">{row.examples.length}</span>
        </h3>
        <div className="baps-docs-row__actions">
          <a className="baps-docs-row__all" href={href} target="_top">
            View all
            <Chevron dir="right" />
          </a>
        </div>
      </header>
      <div className="baps-docs-row__viewport">
        <ul ref={track} className="baps-docs-row__track" onScroll={measure}>
          {row.examples.map((ex) => (
            <ExampleCard
              key={ex.id}
              example={ex}
              componentName={row.name}
              href={href}
              brand={brand}
              poster={poster}
            />
          ))}
        </ul>
        {!edges.start ? (
          <button
            type="button"
            className="baps-docs-row__arrow baps-docs-row__arrow--prev"
            aria-label={`Previous ${row.name} examples`}
            onClick={() => page(-1)}
          >
            <Chevron dir="left" />
          </button>
        ) : null}
        {!edges.end ? (
          <button
            type="button"
            className="baps-docs-row__arrow baps-docs-row__arrow--next"
            aria-label={`More ${row.name} examples`}
            onClick={() => page(1)}
          >
            <Chevron dir="right" />
          </button>
        ) : null}
      </div>
    </section>
  );
};

const TIERS = ['Atoms', 'Molecules', 'Organisms'];

export const ComponentGallery = ({ group }: { group?: string }) => {
  const { brand, dark } = useTheme();
  const rows = useRows(brand);
  const poster = brand === 'mybky' && !dark;

  const groups = useMemo(() => {
    if (!rows) return [];
    const list = group ? rows.filter((r) => r.group === group) : rows;
    const names = [...new Set(list.map((r) => r.group))].sort(
      (a, b) =>
        (TIERS.indexOf(a) + 1 || 99) - (TIERS.indexOf(b) + 1 || 99) ||
        a.localeCompare(b),
    );
    return names.map((g) => ({
      name: g,
      rows: list
        .filter((r) => r.group === g)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [rows, group]);

  if (!rows) return <p className="baps-docs-muted">Loading components…</p>;
  if (!groups.length)
    return <p className="baps-docs-muted">No components found.</p>;

  return (
    <>
      {groups.map((g) => (
        // Keyed on brand and mode: a switch re-renders every row in it.
        <section
          key={`${g.name}-${brand}-${dark}`}
          className="baps-docs-gallery"
        >
          <h2 id={g.name.toLowerCase()}>
            {g.name}{' '}
            <span className="baps-docs-card__count">{g.rows.length}</span>
          </h2>
          {g.rows.map((r) => (
            <ComponentRow
              key={r.componentId}
              row={r}
              brand={brand}
              poster={poster}
            />
          ))}
        </section>
      ))}
    </>
  );
};

/* ── ThemePreview ──────────────────────────────────────────────────────────
   21st.dev's theme gallery, for this design system's themes.

   The grid: one card per theme — its name on its own ground colour, with a
   row of swatch dots — for each brand in each mode, plus each primary colour
   the toolbar's Theme settings offer. Brands that are listed in the toolbar
   but have no palette yet (BAPS, App Sell) show as not-ready cards rather than
   borrowing another brand's colours.

   A card opens the theme sheet (21st.dev's modal): colours, typography and
   radius drawn from the tokens, then the live Components story and real
   Pattern screens, all framed in THAT theme regardless of the toolbar. "Apply
   to Storybook" then sets the toolbar to it. */
type Mode = 'light' | 'dark';
type Roles = {
  primary: string;
  tint: string;
  text: string;
  muted: string;
  error: string;
  border: string;
  card: string;
  ground: string;
};
const v = (name: string) => `var(--${name})`;
const ROLES: Record<Brand, Record<Mode, Roles>> = {
  mybky: {
    light: {
      primary: v('color-mybky-primary-default'),
      tint: v('color-mybky-blue-50'),
      text: v('color-mybky-text-primary'),
      muted: v('color-mybky-text-muted'),
      error: v('color-mybky-error-80'),
      border: v('color-mybky-border-default'),
      card: v('color-mybky-surface-card'),
      ground: v('color-mybky-surface-ground'),
    },
    dark: {
      primary: v('color-mybky-dark-primary-default'),
      tint: v('color-mybky-dark-surface-hover'),
      text: v('color-mybky-dark-text-primary'),
      muted: v('color-mybky-dark-text-muted'),
      error: v('color-mybky-error-80'),
      border: v('color-mybky-dark-border-divider'),
      card: v('color-mybky-dark-surface-card'),
      ground: v('color-mybky-dark-surface-ground'),
    },
  },
  sampark: {
    light: {
      primary: v('color-sampark-primary-default'),
      tint: v('color-sampark-primary-tint'),
      text: v('color-sampark-text-primary'),
      muted: v('color-sampark-text-muted'),
      error: v('color-sampark-error-80'),
      border: v('color-sampark-border-default'),
      card: v('color-sampark-surface-card'),
      ground: v('color-sampark-surface-ground'),
    },
    dark: {
      primary: v('color-sampark-dark-primary-default'),
      tint: v('color-sampark-dark-surface-hover'),
      text: v('color-sampark-dark-text-primary'),
      muted: v('color-sampark-dark-text-muted'),
      error: v('color-sampark-error-80'),
      border: v('color-sampark-dark-border-divider'),
      card: v('color-sampark-dark-surface-card'),
      ground: v('color-sampark-dark-surface-ground'),
    },
  },
};
const SHAPE: Record<
  Brand,
  { font: string; fontName: string; radius: string; radii: string[] }
> = {
  mybky: {
    font: v('font-family-mybky'),
    fontName: 'Inter',
    radius: '0.5rem',
    radii: [
      'radius-mybky-sm',
      'radius-mybky-md',
      'radius-mybky-pill',
      'radius-mybky-circle',
    ].map(v),
  },
  sampark: {
    font: v('font-family-sampark'),
    fontName: 'Inter',
    radius: '0.25rem',
    radii: [
      'radius-sampark-sm',
      'radius-sampark-default',
      'radius-sampark-lg',
      'radius-sampark-circle',
    ].map(v),
  },
};
const BRAND_LABEL: Record<Brand, string> = {
  mybky: 'MyBKY',
  sampark: 'Sampark',
};

type ThemeDef = {
  key: string;
  name: string;
  brand: Brand;
  mode: Mode;
  accent?: string;
  awaiting?: boolean;
  roles: Roles;
  note: string;
};

const brandTheme = (brand: Brand, mode: Mode): ThemeDef => ({
  key: `${brand}-${mode}`,
  name: `${BRAND_LABEL[brand]} ${mode === 'dark' ? 'Dark' : 'Light'}`,
  brand,
  mode,
  roles: ROLES[brand][mode],
  note: `${mode === 'dark' ? 'Dark' : 'Light'} · ${SHAPE[brand].fontName} · radius ${SHAPE[brand].radius}`,
});

/* A primary colour re-ramps only the primary: the rest of the theme is the
   brand and mode the toolbar has selected, which is also what Apply keeps. */
const accentTheme = (
  key: string,
  label: string,
  brand: Brand,
  mode: Mode,
): ThemeDef | undefined => {
  const ramp = rampFor(key) as Record<number, string> | undefined;
  if (!ramp) return undefined;
  const base = ROLES[brand][mode];
  return {
    key: `accent-${key}`,
    name: label,
    brand,
    mode,
    accent: key,
    roles: {
      ...base,
      primary: ramp[600] ?? ramp[500] ?? base.primary,
      tint:
        mode === 'dark'
          ? (ramp[900] ?? base.tint)
          : (ramp[50] ?? ramp[100] ?? base.tint),
    },
    note: `Primary colour · on ${BRAND_LABEL[brand]} ${mode}`,
  };
};

const AWAITING: ThemeDef[] = [
  {
    key: 'baps',
    name: 'BAPS',
    brand: 'mybky',
    mode: 'light',
    awaiting: true,
    roles: ROLES.mybky.light,
    note: 'Palette not ready yet',
  },
  {
    key: 'appsell',
    name: 'App Sell',
    brand: 'mybky',
    mode: 'light',
    awaiting: true,
    roles: ROLES.mybky.light,
    note: 'Palette not ready yet',
  },
];

const setGlobals = (globals: Record<string, unknown>) =>
  addons.getChannel().emit(UPDATE_GLOBALS, { globals });
const applyToStorybook = (t: ThemeDef) => {
  setGlobals({ designSystem: t.brand, accent: t.accent ?? 'brand' });
  addons.getChannel().emit(UPDATE_DARK_MODE_EVENT_NAME, t.mode);
};

const Dots = ({ r }: { r: Roles }) => (
  <span className="baps-docs-theme__dots" aria-hidden="true">
    {[r.card, r.tint, r.border, r.text, r.primary].map((c, i) => (
      <span key={i} style={{ background: c, zIndex: i }} />
    ))}
  </span>
);

const ThemeCard = ({ t, onOpen }: { t: ThemeDef; onOpen: () => void }) => (
  <li
    className={`baps-docs-theme${t.awaiting ? ' baps-docs-theme--awaiting' : ''}`}
  >
    <button
      type="button"
      className="baps-docs-theme__card"
      style={{
        background: t.roles.ground,
        color: t.roles.text,
        fontFamily: SHAPE[t.brand].font,
      }}
      onClick={onOpen}
      disabled={t.awaiting}
      aria-haspopup="dialog"
      aria-label={
        t.awaiting
          ? `${t.name}: palette not ready yet`
          : `Open the ${t.name} theme`
      }
    >
      {t.awaiting ? null : <Dots r={t.roles} />}
      <span className="baps-docs-theme__name">{t.name}</span>
    </button>
    <span className="baps-docs-theme__note">{t.note}</span>
  </li>
);

/* The screens a theme sheet shows under its components. */
export type ThemePreviewScreen = { id: string; label: string };
export const DEFAULT_SCREENS: ThemePreviewScreen[] = [
  { id: 'patterns-login--default', label: 'Login' },
  { id: 'patterns-crud-form--default', label: 'CRUD form' },
  { id: 'components-table--full-listing-page', label: 'Data table listing' },
];

/* A full-size screen inside the sheet. It joins the boot queue as soon as the
   sheet opens — there are only a handful, and the queue already boots them
   one at a time — rather than waiting on an IntersectionObserver, which a
   backgrounded tab never fires. Then it follows the story's own height. */
const ScreenFrame = ({
  id,
  t,
  title,
}: {
  id: string;
  t: ThemeDef;
  title: string;
}) => {
  const [ready, setReady] = useState(false);
  return (
    <div
      className={`baps-docs-frame baps-docs-frame--fit${ready ? ' is-live' : ''}`}
    >
      {!ready ? (
        <div className="baps-docs-frame__skeleton" aria-hidden="true" />
      ) : null}
      <PreviewFrame
        id={id}
        brand={t.brand}
        accent={t.accent}
        mode={t.mode}
        title={title}
        active
        fit
        onReady={() => setReady(true)}
      />
    </div>
  );
};

const ThemeSheet = ({
  t,
  screens,
  onClose,
  onStep,
}: {
  t: ThemeDef;
  screens: ThemePreviewScreen[];
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) => {
  const panel = useRef<HTMLDivElement>(null);
  const r = t.roles;
  const shape = SHAPE[t.brand];

  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onStep(1);
      else if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      back?.focus();
    };
  }, [onClose, onStep]);

  const colors: Array<[string, string]> = [
    ['Primary', r.primary],
    ['Tint', r.tint],
    ['Text', r.text],
    ['Muted', r.muted],
    ['Error', r.error],
    ['Border', r.border],
    ['Card', r.card],
    ['Background', r.ground],
  ];

  return (
    <div
      className="baps-docs-sheet"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button
        type="button"
        className="baps-docs-sheet__step baps-docs-sheet__step--prev"
        aria-label="Previous theme"
        onClick={() => onStep(-1)}
      >
        <Chevron dir="left" />
      </button>
      <div
        ref={panel}
        className="baps-docs-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${t.name} theme`}
        tabIndex={-1}
        style={{ background: r.ground, color: r.text, fontFamily: shape.font }}
      >
        <div
          className="baps-docs-sheet__card"
          style={{ background: r.card, borderColor: r.border }}
        >
          <div
            className="baps-docs-sheet__head"
            style={{ borderColor: r.border }}
          >
            <span
              className="baps-docs-sheet__mark"
              style={{ background: r.primary, borderRadius: shape.radii[1] }}
            />
            <div>
              <div className="baps-docs-sheet__title">{t.name}</div>
              <div className="baps-docs-sheet__sub" style={{ color: r.muted }}>
                {shape.fontName} · radius {shape.radius} · {t.mode}
              </div>
            </div>
            <span
              className="baps-docs-sheet__badge"
              style={{ background: r.tint, color: r.text }}
            >
              PrimeNG · Angular
            </span>
          </div>

          <div
            className="baps-docs-sheet__grid"
            style={{ borderColor: r.border }}
          >
            <div
              className="baps-docs-sheet__cell"
              style={{ borderColor: r.border }}
            >
              <div
                className="baps-docs-sheet__label"
                style={{ color: r.muted }}
              >
                Colours
              </div>
              <div className="baps-docs-sheet__swatches">
                {colors.map(([name, c]) => (
                  <div key={name} className="baps-docs-sheet__swatch">
                    <span
                      style={{
                        background: c,
                        borderColor: r.border,
                        borderRadius: shape.radii[0],
                      }}
                    />
                    <span style={{ color: r.muted }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="baps-docs-sheet__cell"
              style={{ borderColor: r.border }}
            >
              <div
                className="baps-docs-sheet__label"
                style={{ color: r.muted }}
              >
                Typography
              </div>
              <div className="baps-docs-sheet__h">Heading</div>
              <div className="baps-docs-sheet__s" style={{ color: r.muted }}>
                Subtitle text
              </div>
              <div className="baps-docs-sheet__b" style={{ color: r.muted }}>
                Body copy and captions
              </div>
            </div>
            <div
              className="baps-docs-sheet__cell"
              style={{ borderColor: r.border }}
            >
              <div
                className="baps-docs-sheet__label"
                style={{ color: r.muted }}
              >
                Radius
              </div>
              <div className="baps-docs-sheet__radii">
                {shape.radii.map((rad) => (
                  <span
                    key={rad}
                    style={{ borderColor: r.primary, borderRadius: rad }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="baps-docs-sheet__label baps-docs-sheet__label--pad"
            style={{ color: r.muted }}
          >
            Components
          </div>
          <ScreenFrame
            key={`c-${t.key}`}
            id="foundations-theme-preview--components"
            t={t}
            title={`Components, ${t.name}`}
          />
        </div>

        {screens.map((s) => (
          <div key={s.id} className="baps-docs-sheet__screen">
            <div className="baps-docs-sheet__label" style={{ color: r.muted }}>
              {s.label}
            </div>
            <div
              className="baps-docs-sheet__card"
              style={{ background: r.card, borderColor: r.border }}
            >
              <ScreenFrame
                key={`${s.id}-${t.key}`}
                id={s.id}
                t={t}
                title={`${s.label}, ${t.name}`}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="baps-docs-sheet__step baps-docs-sheet__step--next"
        aria-label="Next theme"
        onClick={() => onStep(1)}
      >
        <Chevron dir="right" />
      </button>
      <div className="baps-docs-sheet__actions">
        <button
          type="button"
          className="baps-docs-sheet__btn"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="baps-docs-sheet__btn baps-docs-sheet__btn--primary"
          onClick={() => {
            applyToStorybook(t);
            onClose();
          }}
        >
          Apply to Storybook
        </button>
      </div>
    </div>
  );
};

export const ThemePreview = ({
  screens = DEFAULT_SCREENS,
}: {
  screens?: ThemePreviewScreen[];
}) => {
  const { brand, dark } = useTheme();
  const mode: Mode = dark ? 'dark' : 'light';
  const brands = useMemo(
    () => [
      brandTheme('mybky', 'light'),
      brandTheme('mybky', 'dark'),
      brandTheme('sampark', 'light'),
      brandTheme('sampark', 'dark'),
    ],
    [],
  );
  const accents = useMemo(
    () =>
      (PRIMARY_COLORS as Array<{ key: string; label: string }>)
        .filter((c) => c.key !== 'brand')
        .map((c) => accentTheme(c.key, c.label, brand, mode))
        .filter((t): t is ThemeDef => !!t),
    [brand, mode],
  );
  const openable = useMemo(() => [...brands, ...accents], [brands, accents]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const current = openable.find((t) => t.key === openKey);

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpenKey((k) => {
        const i = openable.findIndex((t) => t.key === k);
        return (
          openable[(i + dir + openable.length) % openable.length]?.key ?? k
        );
      }),
    [openable],
  );
  const close = useCallback(() => setOpenKey(null), []);

  return (
    <div className="baps-docs-themes">
      <h2 id="brands">Brands</h2>
      <p className="baps-docs-muted">
        Each brand in light and dark. Open one to see its colours, type, radius
        and real screens.
      </p>
      <ul className="baps-docs-themes__grid">
        {[...brands, ...AWAITING].map((t) => (
          <ThemeCard key={t.key} t={t} onOpen={() => setOpenKey(t.key)} />
        ))}
      </ul>

      <h2 id="primary-colours">Primary colours</h2>
      <p className="baps-docs-muted">
        The primary colours in the toolbar's Theme settings, shown on{' '}
        {BRAND_LABEL[brand]} {mode}. Change the brand or mode in the toolbar to
        see them on another base.
      </p>
      <ul className="baps-docs-themes__grid">
        {accents.map((t) => (
          <ThemeCard key={t.key} t={t} onOpen={() => setOpenKey(t.key)} />
        ))}
      </ul>

      {current ? (
        <ThemeSheet
          t={current}
          screens={screens}
          onClose={close}
          onStep={step}
        />
      ) : null}
    </div>
  );
};
