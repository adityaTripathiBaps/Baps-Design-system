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

/**
 * The nav strip the Custom tab documents.
 *
 * Nav only, deliberately: the component also renders the "Showing x-y of z"
 * report, a rows-per-page control and a jump-to-page input, and that control
 * is a PrimeNG p-select whose CSS is not in pagination.css. Raw markup cannot
 * reproduce it without shipping an imitation of PrimeNG's chrome, so this
 * documents the part it can render honestly. check-pagination-drift compares
 * the nav controls for that reason, and check-standalone lists pagination as
 * not-required-to-be-standalone for the same one.
 *
 * The page buttons follow the component's own elision rule, because the guard
 * compares against what the story actually renders: under six pages nothing is
 * elided and every page is listed; otherwise the active page is shown with the
 * last behind an ellipsis, and when the active page IS the last there is
 * neither a second button nor an ellipsis.
 */
const pageButton = (n: number, active: boolean) =>
  [
    '<button type="button" class="baps-paginator__page',
    active ? ' baps-paginator__page--active"' : '"',
    active ? ' aria-current="page"' : '',
    ` aria-label="Page ${n}">${n}</button>`,
  ].join('');

const pageButtons = (activePage: number, totalPages: number): string => {
  const rows =
    totalPages < 6
      ? Array.from({ length: totalPages }, (_, i) =>
          pageButton(i + 1, i + 1 === activePage),
        )
      : [
          pageButton(activePage, true),
          ...(activePage === totalPages
            ? []
            : [
                '<span class="baps-paginator__gap" aria-hidden="true">...</span>',
                pageButton(totalPages, false),
              ]),
        ];
  return rows.join('\n    ');
};

const custom = (
  activePage: number,
  totalPages: number,
  brandClass = '',
) => `<baps-paginator class="${brandClass}">
  <nav class="baps-paginator" aria-label="Pagination">
    <!-- Icon buttons, not text. The component renders a PrimeIcons chevron
         and nothing else, so the accessible name comes from aria-label —
         check-pagination-drift caught this reading "Previous" where the
         component reads nothing at all. -->
    <button type="button" class="baps-paginator__nav" aria-label="Previous page"><i class="pi pi-angle-left" aria-hidden="true"></i></button>
    ${pageButtons(activePage, totalPages)}
    <button type="button" class="baps-paginator__nav" aria-label="Next page"><i class="pi pi-angle-right" aria-hidden="true"></i></button>
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
    custom: custom(1, 13),
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
    custom: custom(13, 13),
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
