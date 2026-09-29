/**
 * AI "Copy prompt" — shared by every surface that offers one:
 *
 *   - every Canvas on every docs page, through Storybook's own
 *     `parameters.docs.canvas.additionalActions` (wired in preview.ts), so
 *     each example — Playground, Sizes, Shapes, Group… — copies a prompt
 *     carrying THAT example's code;
 *   - each card on Components › Overview (CopyPrompt, used by showcase.tsx).
 *
 * The example's code comes from, in order:
 *   1. the snippet Storybook's Angular sourceDecorator emits when the story
 *      renders (SNIPPET_RENDERED) — the exact text "Show code" displays, run
 *      through the same paste-ready transform preview.ts gives Show code;
 *   2. the story's authored `parameters.docs.source.code`;
 *   3. the story's own render output, for a story that has not rendered yet
 *      (a gallery card nobody has hovered).
 * React / Next.js / Custom markup comes from the page's SnippetSet, which
 * DemoCard registers per story.
 *
 * Kept free of the Foundations blocks and their token JSON so preview.ts can
 * import it without pulling those into the main bundle. It also avoids
 * react-dom: that is not a direct dependency of this workspace, so the one
 * floating menu (opened from a Canvas strip) is built with plain DOM.
 */
import React, { useEffect, useRef, useState } from 'react';
// Same generated file preview.ts hands to setCompodocJson, so webpack bundles
// it once. It gives each component's real selector and inputs, which keeps the
// prompt honest (`baps-toggleswitch`, not a guessed `baps-toggle-switch`).
import docJson from '../../../../documentation.json';

/* ── Compodoc lookup ───────────────────────────────────────────────────────
   Story ids are pinned per component (`components-toggleswitch`), and class
   names follow `Baps<Name>`, so the two meet once both are reduced to bare
   lowercase letters. The aliases cover the few pages named after the concept
   rather than the class. */
type DocInput = { name: string; type?: string };
type DocDeclaration = {
  name: string;
  selector?: string;
  inputsClass?: DocInput[];
  rawdescription?: string;
  description?: string;
};
const ALIASES: Record<string, string> = {
  pagination: 'paginator',
  accordion: 'accordionwrapper',
  stepper: 'stepperwrapper',
};
const bare = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const doc = docJson as {
  components?: DocDeclaration[];
  directives?: DocDeclaration[];
};
const components = (doc.components ?? []).map((c) => ({
  key: bare(c.name.replace(/^Baps/, '')),
  className: c.name,
  selector: c.selector,
  inputs: (c.inputsClass ?? []).map((i) => i.name),
  api: (c.inputsClass ?? []).map(
    (i) => `${i.name}: ${(i.type ?? 'unknown').replace(/\s+/g, ' ')}`,
  ),
  // The class's own doc comment, first paragraph only — the text compodoc
  // shows for it.
  about: (c.rawdescription ?? c.description ?? '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .split(/\n\s*\n/)[0]
    ?.replace(/\s+/g, ' ')
    .slice(0, 400),
}));
export const lookup = (idOrName: string) => {
  const key = bare(idOrName.replace(/^components-/, ''));
  return components.find((c) => c.key === (ALIASES[key] ?? key));
};

/* Which classes a piece of markup needs in its `imports` array: every
   <baps-*> element by its component selector, and every attribute directive
   (bapsInputText, bapsTooltip…) by the attribute its selector names. */
const byElement = new Map(
  components.filter((c) => c.selector).map((c) => [c.selector!, c.className]),
);
const byAttribute = new Map(
  (doc.directives ?? []).flatMap((d) =>
    [...(d.selector ?? '').matchAll(/\[([\w-]+)\]/g)].map(
      (m) => [m[1].toLowerCase(), d.name] as [string, string],
    ),
  ),
);
export const importsFor = (code: string) => {
  const found = new Set<string>();
  for (const m of code.matchAll(/<(baps-[\w-]+)/g)) {
    const cls = byElement.get(m[1]);
    if (cls) found.add(cls);
  }
  for (const [attr, cls] of byAttribute) {
    if (new RegExp(`\\s${attr}(\\s|=|>|/)`, 'i').test(code)) found.add(cls);
  }
  return [...found].sort();
};

/* ── Prompt ────────────────────────────────────────────────────────────────
   Follows this Storybook's own component page, in the same order and words:
   the component's description, Setup (Getting Started › Installation), Usage
   (this example's code, as a standalone component), API (the inputs table),
   then the page's own Accessibility and When Not to Use sections, the rules,
   and what to ask before coding. The React / Next.js / Custom prompts follow
   the FrameworkTabs and *.snippets.ts approach: inputs become classes.

   SELF-CONTAINED ON PURPOSE. The prompt is pasted into an AI tool that cannot
   open this Storybook (localhost is the reader's own machine) or read this
   repository, so everything it needs travels inside the prompt. A docs link
   is added only when the Storybook is served from a real host.

   One prompt per framework, named exactly as FrameworkTabs names its tabs. */
export type PromptFramework = 'primeng' | 'custom' | 'react' | 'next';
export const PROMPT_FRAMEWORKS: Array<[PromptFramework, string]> = [
  ['primeng', 'PrimeNG-Angular'],
  ['custom', 'Custom'],
  ['react', 'React'],
  ['next', 'Next.js'],
];
const FRAMEWORK_LABEL = Object.fromEntries(PROMPT_FRAMEWORKS) as Record<
  PromptFramework,
  string
>;

/** Same shape as SnippetSet in index.tsx, restated to avoid an import cycle. */
export type PromptSnippets = {
  react?: string;
  next?: string;
  primeng?: string;
  custom?: string;
};

export const storybookUrl = (path: string) => {
  // The docs page lives in the preview iframe; links should point at the
  // manager so they open with the sidebar.
  const origin = window.top?.location.origin ?? window.location.origin;
  return `${origin}/?path=${path}`;
};

/** A link an AI tool (or a teammate) could actually open: not this machine. */
const publicDocsUrl = (path?: string) => {
  if (!path) return undefined;
  const host = (
    window.top?.location.hostname ?? window.location.hostname
  ).toLowerCase();
  const local =
    host === 'localhost' ||
    host === '::1' ||
    host.endsWith('.local') ||
    /^127\.|^0\.0\.0\.0$|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(
      host,
    );
  return local ? undefined : storybookUrl(path);
};

const fence = (lang: string, code: string) => [
  '```' + lang,
  code.trim(),
  '```',
];
const words = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
const pascal = (s: string) =>
  words(s)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join('');
const kebab = (s: string) =>
  words(s)
    .map((w) => w.toLowerCase())
    .join('-');
const indent = (code: string, pad: string) =>
  code
    .trim()
    .split('\n')
    .map((l) => (l ? pad + l : l))
    .join('\n');

/* Template properties the example binds but does not define, e.g.
   [(ngModel)]="checked" — the generated component must declare them. */
const boundNames = (code: string) => {
  const names = new Set<string>();
  for (const m of code.matchAll(/\[\(?[\w.-]+\)?\]="([^"]*)"/g)) {
    // Identifiers in the binding expression, ignoring string literals and
    // member access (`user.name` needs `user`, not `name`).
    const expr = m[1].replace(/'[^']*'|`[^`]*`/g, ' ');
    for (const id of expr.matchAll(/(?<![.\w$])[A-Za-z_$][\w$]*/g))
      names.add(id[0]);
  }
  return [...names].filter(
    (n) =>
      !['true', 'false', 'null', 'undefined', 'this', '$event'].includes(n),
  );
};

/* A section of the docs page the example sits on, as plain text — the page's
   own Accessibility and When Not to Use sections, so the prompt says what the
   page says. Tables become "cell — cell" lines; canvases and code are skipped.
   Only read when the example belongs to the page being viewed. */
const pageSection = (
  storyId: string,
  id: string,
  max = 1500,
): string | undefined => {
  const pageId = new URLSearchParams(window.location.search).get('id') ?? '';
  if (pageId.split('--')[0] !== storyId.split('--')[0]) return undefined;
  const heading = document.getElementById(id);
  if (!heading || heading.tagName !== 'H2') return undefined;
  const out: string[] = [];
  for (
    let n = heading.nextElementSibling;
    n && n.tagName !== 'H2';
    n = n.nextElementSibling
  ) {
    const nodes = [n, ...Array.from(n.querySelectorAll('*'))].filter((el) =>
      el.matches('h3, h4, p, li, tr'),
    );
    for (const el of nodes) {
      if (el.closest('.docs-story, pre')) continue;
      if (el.matches('p') && el.closest('li')) continue;
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      if (el.matches('h3, h4')) out.push(`${text}:`);
      else if (el.matches('li')) out.push(`- ${text}`);
      else if (el.matches('tr')) {
        // The header row once, as a legend for the rows under it.
        if (el.querySelector('th')) {
          out.push(
            `(${Array.from(el.children)
              .map((c) => (c.textContent ?? '').trim())
              .join(' — ')})`,
          );
          continue;
        }
        out.push(
          `- ${Array.from(el.children)
            .map((c) => (c.textContent ?? '').trim())
            .join(' — ')}`,
        );
      } else out.push(text);
    }
  }
  const text = out.join('\n').trim();
  return text
    ? text.length > max
      ? `${text.slice(0, max).trim()}…`
      : text
    : undefined;
};

/* Rules every prompt carries — the non-negotiables from AGENTS.md and the
   design-language / content-voice rules the docs pages repeat. */
const RULES = [
  '## Rules',
  '- Design tokens only (the --color-*, --space-*, --radius-* CSS variables). No hard-coded colour, spacing, radius, shadow or font value.',
  '- MyBKY is the default brand. A Sampark app sets class="baps-ds-sampark" on <body> once; do not re-style per page.',
  '- Keep the native elements and ARIA the docs show: a button stays a <button>, disabled uses the disabled attribute, labels stay attached.',
  '- Icons are Lucide, stroke-width 1.75.',
  '- Copy is sentence case, with no exclamation marks and no emoji.',
];

const ASK = [
  '## Before writing code, ask me',
  '- What data or inputs will this receive?',
  '- Which brand does the screen run under: MyBKY (the default) or Sampark?',
  '- Which loading, empty and error states are needed?',
  '- Where in the app does it belong?',
];

const ANGULAR_SETUP = [
  '## Setup (once per app — skip what is already there)',
  'From the design system docs, Getting Started › Installation.',
  '- Angular 21 (standalone components), PrimeNG 21.1.3, @primeuix/themes 2.0.3, primeicons 7.',
  '- @org/ui-kit gives the <baps-*> components and the MyBky / Sampark presets; @org/tokens gives tokens.css. Check how this app resolves @org/ui-kit (an npm dependency, or a path alias to the design system build). If it does not resolve, stop and ask me — do not recreate the components.',
  '```ts',
  '// app.config.ts',
  "import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';",
  "import { providePrimeNG } from 'primeng/config';",
  "import { MyBky } from '@org/ui-kit'; // a Sampark app uses Sampark",
  '',
  'providers: [',
  '  provideAnimationsAsync(), // not provideAnimations()',
  '  providePrimeNG({',
  '    ripple: true,',
  '    theme: {',
  '      preset: MyBky,',
  "      options: { darkModeSelector: '.baps-dark', cssLayer: { name: 'primeng', order: 'theme, base, components, primeng, utilities, app-styles' } },",
  '    },',
  '  }),',
  ']',
  '```',
  '- Global styles: load tokens.css (from the @org/tokens build) and primeicons/primeicons.css, and set the rem baseline. Both rules are required; without the unlayered one everything renders at 87.5%:',
  '```scss',
  'html { font-size: 16px; }',
  '@layer app-styles { html { font-size: 14px; } }',
  '```',
];

export const buildPrompt = ({
  storyId,
  name,
  example,
  selector,
  api,
  about,
  code,
  snippets,
  docsPath,
  framework = 'primeng',
}: {
  storyId?: string;
  /** The component, e.g. "Avatar". */
  name: string;
  /** The example the reader copied from, e.g. "Sizes". */
  example?: string;
  selector?: string;
  /** Inputs with their types, from compodoc — the page's API table. */
  api?: string[];
  /** The component's own doc comment, first paragraph. */
  about?: string;
  /** That example's Angular markup, paste-ready. */
  code?: string;
  snippets?: PromptSnippets;
  docsPath?: string;
  framework?: PromptFramework;
}) => {
  const docs = publicDocsUrl(docsPath);
  const title = example ? `${name} — ${example}` : name;
  const slug = kebab(
    example && !/^(playground|default|basic)$/i.test(example)
      ? `${name} ${example}`
      : name,
  );
  const accessibility = storyId
    ? pageSection(storyId, 'accessibility')
    : undefined;
  const notFor = storyId
    ? pageSection(storyId, 'when-not-to-use', 900)
    : undefined;
  const pageNotes = [
    ...(accessibility ? ['', '## Accessibility', accessibility] : []),
    ...(notFor ? ['', '## When not to use', notFor] : []),
  ];
  const head = [
    `# ${title}`,
    `BAPS Design System · ${FRAMEWORK_LABEL[framework]}`,
    ...(about ? ['', about] : []),
  ];
  let lines: string[];

  if (framework === 'primeng') {
    const markup = (
      snippets?.primeng ??
      code ??
      (selector ? `<${selector} />` : '')
    ).trim();
    const imports = importsFor(markup);
    const usesNgModel = /ngModel/.test(markup);
    const bound = boundNames(markup);
    const file = [
      "import { Component } from '@angular/core';",
      ...(usesNgModel ? ["import { FormsModule } from '@angular/forms';"] : []),
      `import { ${imports.length ? imports.join(', ') : 'BapsButton'} } from '@org/ui-kit';`,
      '',
      '@Component({',
      `  selector: 'app-${slug}',`,
      `  imports: [${[...(usesNgModel ? ['FormsModule'] : []), ...imports].join(', ')}],`,
      '  template: `',
      indent(markup, '    '),
      '  `,',
      '})',
      ...(bound.length
        ? [
            `export class ${pascal(slug)} {`,
            '  // The template binds these; replace with real values and types from your data.',
            ...bound.map((n) => `  ${n}: any;`),
            '}',
          ]
        : [`export class ${pascal(slug)} {}`]),
    ].join('\n');

    lines = [
      ...head,
      '',
      'Task: add this example to the Angular app, using the design system component — not a copy of it.',
      '',
      ...ANGULAR_SETUP,
      '',
      `## Usage — ${example ?? name}`,
      `A standalone component (for example src/app/components/${slug}/${slug}.component.ts). Every <baps-*> element and baps* directive the template uses is in its imports array.`,
      ...fence('ts', file),
      ...(api?.length
        ? [
            '',
            '## API',
            `${name} inputs, from the component source:`,
            ...api.map((x) => `- ${x}`),
          ]
        : []),
      ...pageNotes,
      '',
      ...RULES,
      '- Never import PrimeNG components directly; use the <baps-*> wrappers.',
      "- Replace example image paths with the app's own assets.",
      '',
      ...ASK,
      ...(docs ? ['', `Docs: ${docs}`] : []),
    ];
  } else if (framework === 'custom') {
    const markup = snippets?.custom;
    lines = [
      ...head,
      '',
      'Task: add this example to a page that does not use Angular (plain HTML and CSS).',
      '',
      '## Setup (once per page)',
      `- Load tokens.css (from the @org/tokens build), the layout fonts and the component stylesheet from @org/ui-kit (styles/components/${kebab(name)}). There is no published package for these stylesheets yet: if they are not in the project, ask me for them — do not rewrite them.`,
      '- Sampark page: class="baps-ds-sampark" on <body>.',
      '',
      ...(markup
        ? [
            `## Usage — ${example ?? name} (the docs page's Custom tab)`,
            ...fence('html', markup),
            '',
            'Inputs become classes: each Angular input is written as the class it would have added (for example severity="primary" → class="baps-button--primary"). Keep the classes exactly as written.',
          ]
        : [
            `## Usage — ${example ?? name}`,
            `This example has no Custom (plain HTML) tab on its docs page: ${name} wraps PrimeNG and needs Angular. Tell me that and suggest the Angular version — do not recreate it.`,
            ...(code
              ? [
                  '',
                  'The Angular markup, for reference only:',
                  ...fence('html', code),
                ]
              : []),
          ]),
      ...pageNotes,
      '',
      ...RULES,
      '',
      ...ASK,
      ...(docs ? ['', `Docs: ${docs}`] : []),
    ];
  } else {
    const next = framework === 'next';
    const own = next ? snippets?.next : snippets?.react;
    const stack = next ? 'Next.js (App Router)' : 'React';
    lines = [
      ...head,
      '',
      `Task: add this example to a ${stack} app.`,
      '',
      "There is no React build of this design system. The docs page's " +
        `${FRAMEWORK_LABEL[framework]} tab is the intended markup: plain elements with the design system's own classes, styled by its stylesheet and tokens. Do not add Tailwind or another UI library's classes to it.`,
      '',
      '## Setup (once per app)',
      `- Load tokens.css (from the @org/tokens build), the layout fonts and the component stylesheet from @org/ui-kit (styles/components/${kebab(name)}) in ${next ? 'app/layout.tsx' : 'the app entry (for example src/main.tsx)'}. There is no published package for these yet: if they are not in the project, ask me for them.`,
      `- Sampark app: className="baps-ds-sampark" on <body>${next ? ' in app/layout.tsx' : ''}.`,
      ...(next
        ? [
            "- Add 'use client' only to components that use state, effects or event handlers.",
          ]
        : []),
      '',
      ...(own
        ? [
            `## Usage — ${example ?? name} (the docs page's ${FRAMEWORK_LABEL[framework]} tab)`,
            ...fence('tsx', own),
            '',
            'Inputs become classes (for example severity="primary" → className="baps-button--primary"). Keep every className exactly as written.',
          ]
        : [
            `## Usage — ${example ?? name}`,
            `This example has no ${FRAMEWORK_LABEL[framework]} tab on its docs page yet: ${name} currently needs Angular. Tell me that before building anything, and do not recreate it with another UI library.`,
            ...(code
              ? [
                  '',
                  'The Angular markup, for reference only:',
                  ...fence('html', code),
                ]
              : []),
          ]),
      ...pageNotes,
      '',
      ...RULES,
      '',
      ...ASK,
      ...(docs ? ['', `Docs: ${docs}`] : []),
    ];
  }

  // Drop the empty optional lines without leaving double blank lines.
  return lines
    .filter((l, i) => l !== '' || (i > 0 && lines[i - 1] !== ''))
    .join('\n')
    .trim();
};

export const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // The docs iframe is not always granted clipboard-write; the textarea
    // route works without the permission.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
};

/* The chosen framework is remembered per viewer and shared by every prompt
   control on the page, so choosing React once makes every button copy a React
   prompt. localStorage can throw (private windows, blocked storage); the
   default then simply stands. */
const FRAMEWORK_KEY = 'baps-docs-prompt-framework';
const readFramework = (): PromptFramework => {
  try {
    const v = window.localStorage.getItem(FRAMEWORK_KEY);
    return PROMPT_FRAMEWORKS.some(([k]) => k === v)
      ? (v as PromptFramework)
      : 'primeng';
  } catch {
    return 'primeng';
  }
};
let currentFramework: PromptFramework | undefined;
const frameworkListeners = new Set<(f: PromptFramework) => void>();
const getFramework = () => (currentFramework ??= readFramework());
const setFramework = (f: PromptFramework) => {
  currentFramework = f;
  try {
    window.localStorage.setItem(FRAMEWORK_KEY, f);
  } catch {
    /* not persisted; still applies for this page */
  }
  frameworkListeners.forEach((l) => l(f));
};
const useFramework = () => {
  const [f, setF] = useState<PromptFramework>(getFramework);
  useEffect(() => {
    frameworkListeners.add(setF);
    return () => {
      frameworkListeners.delete(setF);
    };
  }, []);
  return f;
};

/* ── Example code registry ─────────────────────────────────────────────── */
type SourceTransform = (
  code: string,
  ctx: { args?: Record<string, unknown> },
) => string;
let transform: SourceTransform = (code) => code;
/** preview.ts hands over the same transform "Show code" uses. */
export const setSourceTransform = (fn: SourceTransform) => {
  transform = fn;
};

/* A story template written inside a template literal carries the story
   file's indentation on every line but the first. Strip the indent the later
   lines share, so the code reads as it would in an app. */
const dedent = (code: string) => {
  const lines = code.replace(/^\n+|\s+$/g, '').split('\n');
  const rest = lines.slice(1).filter((l) => l.trim());
  if (!rest.length) return lines.join('\n');
  const indent = Math.min(...rest.map((l) => l.match(/^[ \t]*/)![0].length));
  return [
    lines[0].trim(),
    ...lines
      .slice(1)
      .map((l) => l.slice(Math.min(indent, l.match(/^[ \t]*/)![0].length))),
  ].join('\n');
};

const sources = new Map<string, string>();
/** Called with every SNIPPET_RENDERED — from this page's channel (preview.ts)
 *  and from gallery previews (showcase.tsx). */
export const rememberSource = (
  id: string,
  source: string,
  args?: Record<string, unknown>,
) => {
  if (!id || typeof source !== 'string' || !source.trim()) return;
  try {
    sources.set(id, dedent(transform(source, { args })));
  } catch {
    sources.set(id, dedent(source));
  }
};

const snippetsById = new Map<string, PromptSnippets>();
export const registerSnippets = (storyId: string, snippets: PromptSnippets) => {
  snippetsById.set(storyId, snippets);
};

/** The Storybook preview the docs page runs in. Typed loosely on purpose: this
 *  reads two long-stable members (loadStory, getStoryContext) and nothing
 *  else, and falls back quietly if either moves. */
type LooseStory = {
  id: string;
  name: string;
  title: string;
  component?: { ɵcmp?: { selectors?: unknown[][] } };
  parameters?: { docs?: { source?: { code?: string } } };
  unboundStoryFn?: (ctx: unknown) => {
    template?: string;
    props?: Record<string, unknown>;
  };
};
type LooseStore = {
  loadStory: (o: { storyId: string }) => Promise<LooseStory>;
  getStoryContext: (s: LooseStory) => { args?: Record<string, unknown> };
};
const store = (): LooseStore | undefined =>
  (
    window as unknown as {
      __STORYBOOK_PREVIEW__?: { storyStoreValue?: LooseStore };
    }
  ).__STORYBOOK_PREVIEW__?.storyStoreValue;

/* A component-only story (no template) as markup: literal attributes for
   strings, bindings for numbers and booleans — the same shape the paste-ready
   transform produces. Objects and functions are left out. */
const fromComponent = (
  selector: string,
  props: Record<string, unknown> = {},
) => {
  const attrs = Object.entries(props)
    .filter(
      ([k, v]) =>
        v !== undefined &&
        v !== null &&
        k !== 'brand' &&
        typeof v !== 'function' &&
        typeof v !== 'object',
    )
    .map(([k, v]) =>
      typeof v === 'string' ? `${k}="${v}"` : `[${k}]="${String(v)}"`,
    );
  return attrs.length
    ? `<${selector} ${attrs.join(' ')} />`
    : `<${selector} />`;
};

export type ResolvedExample = {
  storyId: string;
  name: string;
  example?: string;
  selector?: string;
  inputs?: string[];
  api?: string[];
  about?: string;
  code?: string;
  snippets?: PromptSnippets;
  docsPath: string;
};

export const resolveExample = async (
  storyId: string,
): Promise<ResolvedExample> => {
  let story: LooseStory | undefined;
  try {
    story = await store()?.loadStory({ storyId });
  } catch {
    story = undefined;
  }
  const title = story?.title ?? '';
  const name =
    title.split('/').pop() ||
    storyId.split('--')[0].replace(/^components-/, '');
  const meta = lookup(name) ?? lookup(storyId.split('--')[0]);
  const cmpSelector = story?.component?.ɵcmp?.selectors?.[0]?.[0];
  const selector =
    (typeof cmpSelector === 'string' ? cmpSelector : undefined) ??
    meta?.selector;

  let code = sources.get(storyId) ?? story?.parameters?.docs?.source?.code;
  if (!code && story?.unboundStoryFn) {
    try {
      const ctx = store()!.getStoryContext(story);
      const out = story.unboundStoryFn(ctx) ?? {};
      const raw =
        out.template ??
        (selector ? fromComponent(selector, out.props ?? ctx.args) : undefined);
      if (raw) code = dedent(transform(raw, { args: ctx.args }));
    } catch {
      /* a render that needs the live story context; the prompt goes without code */
    }
  }

  return {
    storyId,
    name,
    example: story?.name,
    selector,
    inputs: meta?.inputs,
    api: meta?.api,
    about: meta?.about,
    code: code?.trim(),
    snippets: snippetsById.get(storyId),
    docsPath: `/docs/${storyId.split('--')[0]}--docs`,
  };
};

export const promptFor = async (
  storyId: string,
  framework: PromptFramework,
) => {
  const ex = await resolveExample(storyId);
  return buildPrompt({ ...ex, framework });
};

/* ── Status (Copied / Copy failed), per story ─────────────────────────── */
const statusListeners = new Map<string, Set<(s: string) => void>>();
const flash = (storyId: string, text: string) => {
  statusListeners.get(storyId)?.forEach((l) => l(text));
  window.setTimeout(
    () => statusListeners.get(storyId)?.forEach((l) => l('')),
    1600,
  );
};
const useStatus = (storyId: string | undefined) => {
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!storyId) return undefined;
    const set = statusListeners.get(storyId) ?? new Set();
    set.add(setStatus);
    statusListeners.set(storyId, set);
    return () => {
      set.delete(setStatus);
    };
  }, [storyId]);
  return status;
};

const copyFor = async (storyId: string, what: PromptFramework | 'code') => {
  let text: string;
  if (what === 'code') {
    text = (await resolveExample(storyId)).code ?? '';
  } else {
    setFramework(what);
    text = await promptFor(storyId, what);
  }
  const ok = text ? await copy(text) : false;
  flash(storyId, ok ? 'Copied' : 'Copy failed');
};

const Check = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const ChevronDown = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/** The menu body, shared by CopyPrompt and the Canvas action. */
const PromptMenu = ({
  storyId,
  framework,
  onDone,
  style,
  floating,
}: {
  storyId: string;
  framework: PromptFramework;
  onDone: () => void;
  style?: React.CSSProperties;
  floating?: boolean;
}) => {
  const pick = (e: React.MouseEvent, what: PromptFramework | 'code') => {
    e.preventDefault();
    e.stopPropagation();
    onDone();
    void copyFor(storyId, what);
  };
  return (
    <div
      className={`baps-docs-prompt__menu${floating ? ' baps-docs-prompt__menu--floating' : ''}`}
      role="menu"
      style={style}
    >
      <span className="baps-docs-prompt__label">Copy prompt for</span>
      {PROMPT_FRAMEWORKS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="menuitemradio"
          aria-checked={framework === key}
          onClick={(e) => pick(e, key)}
        >
          <span>{label}</span>
          {framework === key ? <Check /> : null}
        </button>
      ))}
      <span className="baps-docs-prompt__divider" role="separator" />
      <button type="button" role="menuitem" onClick={(e) => pick(e, 'code')}>
        Copy code only
      </button>
    </div>
  );
};

/* ── CopyPrompt — the split button, for a gallery card ──────────────────── */
export const CopyPrompt = ({
  storyId,
  size = 'md',
}: {
  storyId: string;
  size?: 'sm' | 'md';
}) => {
  const framework = useFramework();
  const status = useStatus(storyId);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node))
        setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={root} className={`baps-docs-prompt baps-docs-prompt--${size}`}>
      <button
        type="button"
        className="baps-docs-prompt__main"
        title={`Copy an AI prompt for this example (${FRAMEWORK_LABEL[framework]})`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void copyFor(storyId, framework);
        }}
      >
        <span aria-live="polite">{status || 'Copy prompt'}</span>
        {!status ? (
          <span className="baps-docs-prompt__fw">
            {FRAMEWORK_LABEL[framework]}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        className="baps-docs-prompt__more"
        aria-label="Choose the framework for the prompt"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <ChevronDown />
      </button>
      {open ? (
        <PromptMenu
          storyId={storyId}
          framework={framework}
          onDone={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
};

/* ── The Canvas action — one per example on every docs page ────────────────
   Registered in preview.ts as `parameters.docs.canvas.additionalActions`,
   which Storybook's Canvas renders in the strip beside "Show code". The
   action object is shared by every Canvas, so it finds its own story from the
   DOM: the inline story root is `#story--<id>` (blocks' storyBlockIdFromId). */
const storyIdFrom = (el: Element | null): string | undefined => {
  const root = el?.closest('.docs-story')?.querySelector('[id^="story--"]');
  return root?.id
    .replace(/^story--/, '')
    .replace(/-inner$/, '')
    .replace(/--primary$/, '');
};

let menuEl: HTMLDivElement | undefined;
const closeMenu = () => {
  menuEl?.remove();
  menuEl = undefined;
  document.removeEventListener('mousedown', onOutside, true);
  document.removeEventListener('keydown', onEsc, true);
};
const onOutside = (e: MouseEvent) => {
  if (menuEl && !menuEl.contains(e.target as Node)) closeMenu();
};
const onEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeMenu();
};
const CHECK_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/* Same markup and classes as <PromptMenu>, built with the DOM because it
   lives outside any React tree (the strip button cannot contain it). */
const openMenu = (anchor: HTMLElement, storyId: string) => {
  closeMenu();
  const current = getFramework();
  const el = document.createElement('div');
  el.className = 'baps-docs-prompt__menu baps-docs-prompt__menu--floating';
  el.setAttribute('role', 'menu');
  const label = document.createElement('span');
  label.className = 'baps-docs-prompt__label';
  label.textContent = 'Copy prompt for';
  el.appendChild(label);
  const item = (
    text: string,
    what: PromptFramework | 'code',
    role: string,
    checked?: boolean,
  ) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', role);
    if (role === 'menuitemradio')
      b.setAttribute('aria-checked', String(!!checked));
    const t = document.createElement('span');
    t.textContent = text;
    b.appendChild(t);
    if (checked) b.insertAdjacentHTML('beforeend', CHECK_SVG);
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
      void copyFor(storyId, what);
    });
    el.appendChild(b);
  };
  PROMPT_FRAMEWORKS.forEach(([key, text]) =>
    item(text, key, 'menuitemradio', key === current),
  );
  const sep = document.createElement('span');
  sep.className = 'baps-docs-prompt__divider';
  sep.setAttribute('role', 'separator');
  el.appendChild(sep);
  item('Copy code only', 'code', 'menuitem');

  const r = anchor.getBoundingClientRect();
  el.style.top = `${r.bottom + 6}px`;
  el.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
  // Inside .sbdocs-wrapper, so the docs-shell rules (all scoped there) apply.
  (document.querySelector('.sbdocs-wrapper') ?? document.body).appendChild(el);
  menuEl = el;
  (el.querySelector('[aria-checked="true"]') as HTMLElement | null)?.focus();
  // Next tick, so the click that opened it does not close it.
  window.setTimeout(() => {
    document.addEventListener('mousedown', onOutside, true);
    document.addEventListener('keydown', onEsc, true);
  });
};

const CanvasPromptLabel = () => {
  const framework = useFramework();
  const ref = useRef<HTMLSpanElement>(null);
  const [storyId, setStoryId] = useState<string | undefined>(undefined);
  useEffect(() => setStoryId(storyIdFrom(ref.current)), []);
  const status = useStatus(storyId);
  return (
    <span ref={ref} className="baps-docs-canvas-prompt__inner">
      <span aria-live="polite">{status || 'Copy prompt'}</span>
      {!status ? (
        <span className="baps-docs-canvas-prompt__fw">
          {FRAMEWORK_LABEL[framework]}
        </span>
      ) : null}
      <span
        className="baps-docs-canvas-prompt__chevron"
        title="Choose the framework"
      >
        <ChevronDown />
      </span>
    </span>
  );
};

export const canvasPromptAction = {
  title: <CanvasPromptLabel />,
  className: 'baps-docs-canvas-prompt',
  onClick: (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget as HTMLElement;
    const storyId = storyIdFrom(button);
    if (!storyId) return;
    // The chevron opens the framework menu; anywhere else copies straight
    // away with the remembered framework, like 21st.dev's split button.
    if ((e.target as Element).closest('.baps-docs-canvas-prompt__chevron'))
      openMenu(button, storyId);
    else void copyFor(storyId, getFramework());
  },
};

/* DemoCard renders this when it has snippets, so a React / Next.js / Custom
   prompt for that example carries the page's authored markup. */
export const useRegisterSnippets = (
  storyId: string | undefined,
  snippets: PromptSnippets | undefined,
) => {
  useEffect(() => {
    if (storyId && snippets) registerSnippets(storyId, snippets);
  }, [storyId, snippets]);
};
