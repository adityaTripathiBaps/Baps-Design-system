import { setupFor, type SnippetSet } from '../../docs/snippet-setup';

export type { SnippetSet };

const SETUP = `${setupFor(
  'pagination',
  false,
  '@org/ui-kit-react/styles',
)}

import { BapsPagination } from '@org/ui-kit-react';`;

const next = (source: string) =>
  `'use client';\n\n${source.replace(
    'export function Example()',
    'export default function Example()',
  )}`;

const examples = (
  props: string,
  totalRecords = 250,
): Pick<SnippetSet, 'react' | 'next'> => {
  const source = `${SETUP}

export function Example() {
  return (
    <BapsPagination
      totalRecords={${totalRecords}}
      ${props}
      onPageChange={(page) => console.log(page)}
    />
  );
}`;
  return { react: source, next: next(source) };
};

const fullAngular = (brand = 'sampark', first = 0) => `<baps-paginator
  brand="${brand}"
  [totalRecords]="250"
  [rows]="20"
  [first]="${first}"
  [rowsPerPageOptions]="[10, 20, 50, 100]"
  [showCurrentPageReport]="true"
  currentPageReportTemplate="Showing {first}-{last} of {totalRecords}"
  [showFirstLastIcon]="true"
  [showJumpToPage]="true"
  (pageChange)="onPage($event)"
/>`;

const custom = (
  activePage: number,
  totalPages: number,
  brandClass = '',
) => `<baps-paginator class="${brandClass}">
  <nav class="baps-paginator" aria-label="Pagination">
    <button type="button" class="baps-paginator__nav" aria-label="Previous page">Previous</button>
    <button type="button" class="baps-paginator__page baps-paginator__page--active" aria-current="page" aria-label="Page ${activePage}">${activePage}</button>
    <span class="baps-paginator__gap" aria-hidden="true">...</span>
    <button type="button" class="baps-paginator__page" aria-label="Page ${totalPages}">${totalPages}</button>
    <button type="button" class="baps-paginator__nav" aria-label="Next page">Next</button>
  </nav>
</baps-paginator>`;

export const paginationSnippets: Record<string, SnippetSet> = {
  Default: {
    ...examples(`defaultRows={20}
      rowsPerPageOptions={[10, 20, 50, 100]}
      showCurrentPageReport
      showJumpToPage
      brand="sampark"`),
    primeng: fullAngular(),
    custom: custom(1, 13, 'baps-sampark baps-ds-sampark'),
  },
  MyBKY: {
    ...examples(`defaultRows={20}
      defaultFirst={200}
      rowsPerPageOptions={[10, 20, 50, 100]}
      showCurrentPageReport
      showJumpToPage
      brand="mybky"`),
    primeng: fullAngular('mybky', 200),
    custom: custom(11, 13),
  },
  MidRange: {
    ...examples(`defaultRows={20}
      defaultFirst={240}
      rowsPerPageOptions={[10, 20, 50, 100]}
      showCurrentPageReport
      showJumpToPage`),
    primeng: fullAngular('sampark', 240),
    custom: custom(13, 13, 'baps-sampark baps-ds-sampark'),
  },
  FewPages: {
    ...examples(`defaultRows={20}
      showCurrentPageReport
      showJumpToPage`, 60),
    primeng: `<baps-paginator
  [totalRecords]="60"
  [rows]="20"
  [showCurrentPageReport]="true"
  [showJumpToPage]="true"
  (pageChange)="onPage($event)"
/>`,
    custom: custom(1, 3),
  },
  Compact: {
    ...examples(`defaultRows={20}
      showFirstLastIcon={false}
      showCurrentPageReport={false}
      showJumpToPage={false}`),
    primeng: `<baps-paginator
  [totalRecords]="250"
  [rows]="20"
  [showCurrentPageReport]="false"
  [showFirstLastIcon]="false"
  [showJumpToPage]="false"
  (pageChange)="onPage($event)"
/>`,
    custom: custom(1, 13),
  },
};
