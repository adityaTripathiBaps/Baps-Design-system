'use client';

import {
  createElement,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { BapsIcon } from '../icon/icon.js';
import {
  BapsSelect,
  type BapsSelectProps,
} from '../select/select.js';

export type BapsPaginationBrand = 'mybky' | 'sampark';

/** Mirrors PrimeNG's PageEvent so Angular and React consumers share handlers. */
export interface BapsPageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

type NativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'children' | 'defaultValue' | 'onChange'
>;

export type BapsPaginationProps = NativeProps & {
  rows?: number;
  defaultRows?: number;
  totalRecords?: number;
  first?: number;
  defaultFirst?: number;
  rowsPerPageOptions?: readonly number[];
  showFirstLastIcon?: boolean;
  showCurrentPageReport?: boolean;
  currentPageReportTemplate?: string;
  showPageLinks?: boolean;
  showJumpToPage?: boolean;
  ariaLabel?: string;
  brand?: BapsPaginationBrand;
  appendTo?: BapsSelectProps<number>['appendTo'];
  onPageChange?: (
    pageEvent: BapsPageEvent,
    event: SyntheticEvent<HTMLElement>,
  ) => void;
  ref?: Ref<HTMLElement>;
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

const positiveRows = (rows: number): number =>
  Number.isFinite(rows) && rows > 0 ? Math.floor(rows) : 1;

/** First two, last two and current neighbours, with null marking an ellipsis. */
export function getPaginationPages(
  currentPage: number,
  pageCount: number,
): readonly (number | null)[] {
  const total = Math.max(1, Math.floor(pageCount));
  const current = Math.min(total, Math.max(1, Math.floor(currentPage)));
  const keep = new Set<number>([
    1,
    2,
    total - 1,
    total,
    current - 1,
    current,
    current + 1,
  ]);
  const sorted = [...keep]
    .filter((page) => page >= 1 && page <= total)
    .sort((left, right) => left - right);
  const pages: Array<number | null> = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous > 0 && page - previous > 1) pages.push(null);
    pages.push(page);
    previous = page;
  }
  return pages;
}

/** Expands the same report placeholders exposed by the Angular component. */
export function formatPaginationReport(
  template: string,
  event: BapsPageEvent,
  totalRecords: number,
): string {
  const first = totalRecords === 0 ? 0 : event.first + 1;
  const last = Math.min(event.first + event.rows, totalRecords);
  return template
    .replace('{first}', String(first))
    .replace('{last}', String(last))
    .replace('{totalRecords}', String(totalRecords))
    .replace('{currentPage}', String(event.page + 1))
    .replace('{totalPages}', String(event.pageCount));
}

/** BAPS-owned paginator with the canonical truncated page-link algorithm. */
export function BapsPagination({
  rows: controlledRows,
  defaultRows = 10,
  totalRecords: totalRecordsProp = 0,
  first: controlledFirst,
  defaultFirst = 0,
  rowsPerPageOptions,
  showFirstLastIcon = true,
  showCurrentPageReport = false,
  currentPageReportTemplate = 'Showing {first}-{last} of {totalRecords}',
  showPageLinks = true,
  showJumpToPage = false,
  ariaLabel = 'Pagination',
  brand = 'mybky',
  appendTo = 'body',
  onPageChange,
  className,
  ref,
  ...nativeProps
}: BapsPaginationProps): ReactElement {
  const [internalRows, setInternalRows] = useState(() =>
    positiveRows(defaultRows),
  );
  const [internalFirst, setInternalFirst] = useState(() =>
    Math.max(0, Math.floor(defaultFirst)),
  );
  const rows = positiveRows(controlledRows ?? internalRows);
  const first = Math.max(0, Math.floor(controlledFirst ?? internalFirst));
  const totalRecords = Math.max(0, Math.floor(totalRecordsProp));
  const pageCount = Math.max(1, Math.ceil(totalRecords / rows));
  const page = Math.min(Math.floor(first / rows), pageCount - 1);
  const pageEvent: BapsPageEvent = { first, rows, page, pageCount };
  const pages = getPaginationPages(page + 1, pageCount);
  const [jumpValue, setJumpValue] = useState(String(page + 1));

  useEffect(() => setJumpValue(String(page + 1)), [page]);

  const rowOptions = useMemo(
    () =>
      (rowsPerPageOptions ?? []).map((value) => ({
        label: String(value),
        value,
      })),
    [rowsPerPageOptions],
  );

  const emit = (
    nextFirst: number,
    nextRows: number,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    const safeRows = positiveRows(nextRows);
    const nextPageCount = Math.max(1, Math.ceil(totalRecords / safeRows));
    const nextPage = Math.min(
      Math.max(0, Math.floor(nextFirst / safeRows)),
      nextPageCount - 1,
    );
    const normalizedFirst = nextPage * safeRows;
    if (controlledRows === undefined) setInternalRows(safeRows);
    if (controlledFirst === undefined) setInternalFirst(normalizedFirst);
    onPageChange?.(
      {
        first: normalizedFirst,
        rows: safeRows,
        page: nextPage,
        pageCount: nextPageCount,
      },
      event,
    );
  };

  const goTo = (nextPage: number, event: SyntheticEvent<HTMLElement>) => {
    const normalizedPage = Math.min(
      Math.max(0, Math.floor(nextPage)),
      pageCount - 1,
    );
    if (normalizedPage === page) return;
    emit(normalizedPage * rows, rows, event);
  };

  const commitJump = (event: SyntheticEvent<HTMLInputElement>) => {
    const nextPage = Number.parseInt(jumpValue, 10);
    if (Number.isFinite(nextPage)) goTo(nextPage - 1, event);
    else setJumpValue(String(page + 1));
  };

  const handleJumpKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    commitJump(event);
    event.currentTarget.blur();
  };

  const navButton = (
    label: string,
    icon: 'angle-left' | 'angle-right' | 'double-alt-arrow-left' | 'double-alt-arrow-right',
    targetPage: number,
    disabled: boolean,
  ) => (
    <button
      type="button"
      className="baps-paginator__nav"
      disabled={disabled}
      aria-label={label}
      onClick={(event) => goTo(targetPage, event)}
    >
      <BapsIcon name={icon} size="inherit" aria-hidden="true" />
    </button>
  );

  return createElement(
    'baps-paginator',
    {
      ...nativeProps,
      ref,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark baps-ds-sampark',
        className,
      ),
    },
    <nav className="baps-paginator" aria-label={ariaLabel}>
      {showCurrentPageReport && (
        <span className="baps-paginator__report">
          {formatPaginationReport(
            currentPageReportTemplate,
            pageEvent,
            totalRecords,
          )}
        </span>
      )}

      {rowOptions.length > 0 && (
        <span className="baps-paginator__rpp">
          <BapsSelect<number>
            options={rowOptions}
            value={rows}
            ariaLabel="Rows per page"
            brand={brand}
            appendTo={appendTo}
            panelClassName={joinClassNames(
              'baps-paginator__rpp-panel',
              brand === 'sampark' && 'baps-ds-sampark',
            )}
            onValueChange={(nextRows, event) => {
              if (nextRows === null) return;
              const anchorFirst = Math.floor(first / nextRows) * nextRows;
              emit(anchorFirst, nextRows, event);
            }}
          />
        </span>
      )}

      {showFirstLastIcon &&
        navButton('First page', 'double-alt-arrow-left', 0, page === 0)}
      {navButton('Previous page', 'angle-left', page - 1, page === 0)}

      {showPageLinks &&
        pages.map((visiblePage, index) =>
          visiblePage === null ? (
            <span
              key={`gap-${index}`}
              className="baps-paginator__gap"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              key={visiblePage}
              type="button"
              className={joinClassNames(
                'baps-paginator__page',
                visiblePage - 1 === page &&
                  'baps-paginator__page--active',
              )}
              aria-current={visiblePage - 1 === page ? 'page' : undefined}
              aria-label={`Page ${visiblePage}`}
              onClick={(event) => goTo(visiblePage - 1, event)}
            >
              {visiblePage}
            </button>
          ),
        )}

      {navButton(
        'Next page',
        'angle-right',
        page + 1,
        page >= pageCount - 1,
      )}
      {showFirstLastIcon &&
        navButton(
          'Last page',
          'double-alt-arrow-right',
          pageCount - 1,
          page >= pageCount - 1,
        )}

      {showJumpToPage && (
        <span className="baps-paginator__jump">
          <span className="baps-paginator__jump-label">Go to</span>
          <input
            className="baps-paginator__jump-input"
            type="text"
            inputMode="numeric"
            value={jumpValue}
            aria-label="Go to page"
            onChange={(event) => setJumpValue(event.currentTarget.value)}
            onKeyDown={handleJumpKeyDown}
            onBlur={commitJump}
          />
        </span>
      )}
    </nav>,
  );
}

BapsPagination.displayName = 'BapsPagination';
