import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor('chip', false, '@org/ui-kit-react/styles')}

import { BapsChip } from '@org/ui-kit-react';`;

const next = (source: string) =>
  `'use client';\n\n${source.replace(
    'export function Example()',
    'export default function Example()',
  )}`;

const example = (body: string) => `${SETUP}

export function Example() {
  return ${body};
}`;

export const chipSnippets: Record<string, SnippetSet> = {
  Default: {
    react: example('<BapsChip label="Value" />'),
    next: next(example('<BapsChip label="Value" />')),
    primeng: `<baps-chip label="Value" />`,
  },
  WithIcon: {
    react: example('<BapsChip label="Search" icon="search-2" />'),
    next: next(example('<BapsChip label="Search" icon="search-2" />')),
    primeng: `<baps-chip label="Search" icon="pi pi-search" />`,
  },
  Removable: {
    react: example(
      '<BapsChip label="Hover or focus to remove" removable onRemove={() => undefined} />',
    ),
    next: next(
      example(
        '<BapsChip label="Hover or focus to remove" removable onRemove={() => undefined} />',
      ),
    ),
    primeng: `<baps-chip label="Hover or focus to remove" [removable]="true" (remove)="remove()" />`,
  },
  Group: {
    react: `${SETUP}

import { useState } from 'react';

export function Example() {
  const [items, setItems] = useState(['Ahmedabad', 'London', 'Nairobi']);
  return (
    <>
      {items.map((item) => (
        <BapsChip
          key={item}
          label={item}
          removable
          onRemove={() => setItems((current) => current.filter((value) => value !== item))}
        />
      ))}
    </>
  );
}`,
    next: next(`${SETUP}

import { useState } from 'react';

export function Example() {
  const [items, setItems] = useState(['Ahmedabad', 'London', 'Nairobi']);
  return (
    <>
      {items.map((item) => (
        <BapsChip
          key={item}
          label={item}
          removable
          onRemove={() => setItems((current) => current.filter((value) => value !== item))}
        />
      ))}
    </>
  );
}`),
    primeng: `<baps-chip *ngFor="let item of items" [label]="item" [removable]="true" (remove)="remove(item)" />`,
  },
  Brands: {
    react: example(`(
    <>
      <BapsChip label="MyBKY" brand="mybky" />
      <BapsChip label="Sampark" brand="sampark" />
    </>
  )`),
    next: next(
      example(`(
    <>
      <BapsChip label="MyBKY" brand="mybky" />
      <BapsChip label="Sampark" brand="sampark" />
    </>
  )`),
    ),
    primeng: `<baps-chip label="MyBKY" brand="mybky" />
<baps-chip label="Sampark" brand="sampark" />`,
  },
};
