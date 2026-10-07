/**
 * Framework snippets for the Chip docs page.
 *
 * ## How it maps
 *
 * `baps-chip` is a custom `<baps-chip>` element in Angular, wrapping PrimeNG's
 * `p-chip`. The BAPS styling applies inline to the `<baps-chip>` host and
 * targets `.p-chip` elements inside it.
 *
 * For React/Next, you should render the `<baps-chip>` custom element wrapper.
 * Because the CSS variables and structural styling are attached to the host
 * element (`baps-chip`), the wrapper must be present.
 */
import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };
const SETUP = setupFor('chip', true);

export const chipSnippets: Record<string, SnippetSet> = {
  Default: {
    react: `${SETUP}

export function Default() {
  return (
    <baps-chip label="Value"></baps-chip>
  );
}`,
  },
  WithIcon: {
    react: `${SETUP}

export function WithIcon() {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <baps-chip label="Search" icon="pi pi-search"></baps-chip>
      <baps-chip label="Value" image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" alt="Amy"></baps-chip>
      {/* For custom icons (e.g. SVG), pass them as children: */}
      <baps-chip label="Custom Icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: '1rem', height: '1rem' }}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </baps-chip>
    </div>
  );
}`,
  },
  Removable: {
    react: `${SETUP}

export function Removable() {
  return (
    <baps-chip label="Hover to remove" removable={true} onRemove={() => console.log('Removed!')}></baps-chip>
  );
}`,
  },
  Group: {
    react: `${SETUP}

import { useState } from 'react';

export function Group() {
  const [items, setItems] = useState(['Ahmedabad', 'London', 'Nairobi']);

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map(item => (
        <baps-chip
          key={item}
          label={item}
          removable={true}
          onRemove={() => setItems(items.filter(i => i !== item))}
        ></baps-chip>
      ))}
    </div>
  );
}`,
  },
  Brands: {
    react: `${SETUP}

export function Brands() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <baps-chip label="MyBKY"></baps-chip>
        <baps-chip label="MyBKY disabled" disabled={true}></baps-chip>
      </div>

      <div className="baps-ds-sampark" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <baps-chip label="Sampark" brand="sampark"></baps-chip>
        <baps-chip label="Sampark disabled" brand="sampark" disabled={true}></baps-chip>
      </div>
    </div>
  );
}`,
  },
};
