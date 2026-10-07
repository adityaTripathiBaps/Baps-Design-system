import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('tag', false, '@org/ui-kit-react/styles')}

import { BapsTag } from '@org/ui-kit-react';`;

const layout = (
  content: string,
  wrap = true,
) => `<div style={{ display: 'flex', gap: 12, alignItems: 'center'${
  wrap ? ", flexWrap: 'wrap'" : ''
} }}>
${content}
</div>`;

const frameworkExamples = (
  name: string,
  jsx: string,
  client = false,
): Pick<SnippetSet, 'react' | 'next'> => ({
  react: `${client ? "'use client';\n\n" : ''}${SETUP}

export function ${name}() {
  return (
    ${jsx}
  );
}`,
  next: `${client ? "'use client';\n\n" : ''}${SETUP}

export default function ${name}() {
  return (
    ${jsx}
  );
}`,
});

const chevronTags = layout(`  <BapsTag value="Extra small" size="xs" chevron />
  <BapsTag value="Small" chevron />
  <BapsTag value="Large" size="l" chevron />
  <BapsTag value="With icon" severity="info" icon="user" chevron />
  <BapsTag value="Disabled" chevron disabled />`);

const iconOnlyTags =
  layout(`  <BapsTag icon="user" aria-label="User" size="xs" />
  <BapsTag icon="user" aria-label="User" />
  <BapsTag icon="user" aria-label="User" size="l" />
  <BapsTag icon="user" aria-label="User options" chevron />`);

const severityTags = layout(`  <BapsTag value="Grey" />
  <BapsTag value="Primary" severity="contrast" />
  <BapsTag value="Secondary" severity="secondary" />
  <BapsTag value="Info" severity="info" />
  <BapsTag value="Warning" severity="warn" />
  <BapsTag value="Error" severity="danger" />
  <BapsTag value="Success" severity="success" />
  <BapsTag value="Disabled" disabled />`);

const sizeTags = layout(
  `  <BapsTag value="Extra small" size="xs" />
  <BapsTag value="Small" />
  <BapsTag value="Medium" size="m" />
  <BapsTag value="Large" size="l" />`,
  false,
);

export const tagSnippets: Record<string, SnippetSet> = {
  TrailingAction: {
    interactive: true,
    primeng: `<div style="display:flex; gap: 12px; align-items: center; flex-wrap: wrap;">
  <baps-tag value="Extra small" size="xs" [action]="true" actionLabel="Open Extra small" (actionClick)="onAction($event)" />
  <baps-tag value="Small" [action]="true" actionLabel="Open Small" (actionClick)="onAction($event)" />
  <baps-tag value="Large" size="l" [action]="true" actionLabel="Open Large" (actionClick)="onAction($event)" />
  <baps-tag value="Filter" severity="contrast" icon="pi pi-filter" [action]="true" actionLabel="Remove filter" />
  <baps-tag value="Disabled" [action]="true" actionLabel="Open Disabled" [disabled]="true" />
</div>`,
    react: `'use client';

${SETUP}

export function TrailingAction({ onAction }) {
  return (
    ${layout(`  <BapsTag value="Extra small" size="xs" action actionLabel="Open Extra small" onAction={onAction} />
  <BapsTag value="Small" action actionLabel="Open Small" onAction={onAction} />
  <BapsTag value="Large" size="l" action actionLabel="Open Large" onAction={onAction} />
  <BapsTag value="Filter" severity="contrast" icon="filter" action actionLabel="Remove filter" onAction={onAction} />
  <BapsTag value="Disabled" action actionLabel="Open Disabled" disabled />
  <BapsTag value="Sampark" brand="sampark" severity="danger" action actionLabel="Open Sampark" onAction={onAction} />`)}
  );
}`,
    next: `'use client';

${SETUP}

export default function TrailingAction({ onAction }) {
  return (
    ${layout(`  <BapsTag value="Extra small" size="xs" action actionLabel="Open Extra small" onAction={onAction} />
  <BapsTag value="Small" action actionLabel="Open Small" onAction={onAction} />
  <BapsTag value="Large" size="l" action actionLabel="Open Large" onAction={onAction} />
  <BapsTag value="Filter" severity="contrast" icon="filter" action actionLabel="Remove filter" onAction={onAction} />
  <BapsTag value="Disabled" action actionLabel="Open Disabled" disabled />`)}
  );
}`,
  },

  TrailingActionAxis: {
    interactive: true,
    primeng: `<baps-tag value="Filter" [action]="true" actionLabel="Remove filter" (actionClick)="onAction($event)" />`,
    react: `'use client';

${SETUP}

export function TrailingActionAxis({ onAction }) {
  return <BapsTag value="Filter" icon="filter" action actionLabel="Remove filter" onAction={onAction} />;
}`,
    next: `'use client';

${SETUP}

export default function TrailingActionAxis({ onAction }) {
  return <BapsTag value="Filter" icon="filter" action actionLabel="Remove filter" onAction={onAction} />;
}`,
  },

  FullMatrix: {
    primeng: `<div>
  @for (severity of severities; track severity) {
    @for (size of sizes; track size) {
      <baps-tag [value]="severity ?? 'Grey'" [severity]="severity" [size]="size" [chevron]="true" />
    }
  }
</div>`,
    ...frameworkExamples(
      'FullMatrix',
      `<div style={{ display: 'grid', gap: 16 }}>
      {(['secondary', 'success', 'info', 'warn', 'danger', 'contrast']).map((severity) => (
        <div key={severity} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['xs', 's', 'm', 'l']).map((size) => (
            <BapsTag key={size} value={severity} severity={severity} size={size} chevron />
          ))}
        </div>
      ))}
    </div>`,
    ),
  },

  Chevron: {
    primeng: `<baps-tag value="With icon" severity="info" icon="pi pi-user" [chevron]="true" />`,
    custom: `<span class="baps-tag baps-tag--info"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span><span class="baps-tag__label">With icon</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>`,
    ...frameworkExamples(
      'Chevron',
      chevronTags.replace(
        '</div>',
        '  <BapsTag value="Sampark" brand="sampark" severity="success" chevron />\n</div>',
      ),
    ),
  },

  IconOnly: {
    primeng: `<baps-tag icon="pi pi-user" aria-label="User" />`,
    custom: `<span class="baps-tag baps-tag--grey baps-tag--icon-only" aria-label="User"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>`,
    ...frameworkExamples(
      'IconOnly',
      iconOnlyTags.replace(
        '</div>',
        '  <BapsTag brand="sampark" icon="user" aria-label="Sampark user" />\n</div>',
      ),
    ),
  },

  ChevronAxis: {
    primeng: `<baps-tag value="Registered" [chevron]="true" />`,
    custom: `<span class="baps-tag baps-tag--grey"><span class="baps-tag__label">Registered</span><span class="baps-tag-chevron pi pi-chevron-down" aria-hidden="true"></span></span>`,
    ...frameworkExamples('ChevronAxis', chevronTags),
  },

  IconOnlyAxis: {
    primeng: `<baps-tag icon="pi pi-user" aria-label="User" />`,
    custom: `<span class="baps-tag baps-tag--grey baps-tag--icon-only" aria-label="User"><span class="baps-tag__icon pi pi-user" aria-hidden="true"></span></span>`,
    ...frameworkExamples('IconOnlyAxis', iconOnlyTags),
  },

  Playground: {
    primeng: `<baps-tag value="Registered" />`,
    custom: `<span class="baps-tag baps-tag--grey"><span class="baps-tag__label">Registered</span></span>`,
    ...frameworkExamples('Playground', '<BapsTag value="Registered" />'),
  },

  SamparkSeverities: {
    primeng: `<baps-tag brand="sampark" value="Success" severity="success" />`,
    custom: `<span class="baps-tag baps-sampark baps-tag--success"><span class="baps-tag__label">Success</span></span>`,
    ...frameworkExamples(
      'SamparkSeverities',
      severityTags.replaceAll('<BapsTag ', '<BapsTag brand="sampark" '),
    ),
  },

  SamparkSizes: {
    primeng: `<baps-tag brand="sampark" value="Large" size="l" icon="pi pi-clock" />`,
    custom: `<span class="baps-tag baps-sampark baps-tag--l"><span class="baps-tag__icon pi pi-clock" aria-hidden="true"></span><span class="baps-tag__label">Large</span></span>`,
    ...frameworkExamples(
      'SamparkSizes',
      sizeTags
        .replaceAll('<BapsTag ', '<BapsTag brand="sampark" ')
        .replace(
          'value="Large" size="l"',
          'value="Large" size="l" icon="clock"',
        ),
    ),
  },

  Severities: {
    primeng: `<baps-tag value="Success" severity="success" />`,
    custom: `<span class="baps-tag baps-tag--success"><span class="baps-tag__label">Success</span></span>`,
    ...frameworkExamples('Severities', severityTags),
  },

  Sizes: {
    primeng: `<baps-tag value="Large" size="l" />`,
    custom: `<span class="baps-tag baps-tag--l"><span class="baps-tag__label">Large</span></span>`,
    ...frameworkExamples('Sizes', sizeTags),
  },

  WithIcon: {
    primeng: `<baps-tag value="Verified" severity="success" icon="pi pi-check" size="m" />`,
    custom: `<span class="baps-tag baps-tag--success baps-tag--m"><span class="baps-tag__icon pi pi-check" aria-hidden="true"></span><span class="baps-tag__label">Verified</span></span>`,
    ...frameworkExamples(
      'WithIcon',
      layout(
        `  <BapsTag value="Verified" severity="success" icon="check" size="m" />
  <BapsTag value="Pending" severity="warn" icon="clock" size="m" />
  <BapsTag value="Rejected" severity="danger" icon="user-cross" size="m" />`,
        false,
      ),
    ),
  },
};
