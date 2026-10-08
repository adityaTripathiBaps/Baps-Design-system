'use client';

import {
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

/**
 * Sort affordance for a table column header.
 *
 * The SVG paths and the `p-datatable-sort-*` class names are copied from the
 * Angular `baps-sort-icon`, because the canonical table stylesheet targets
 * those class names — `@org/ui-kit/styles/table` styles `.p-datatable-sort-icon`
 * and `.p-datatable-sort-badge` directly. Renaming them would render an
 * unstyled icon.
 *
 * Three states, and the neutral one draws BOTH chevrons rather than a third
 * glyph: that is what says "this column can sort" without claiming a direction.
 */
export type BapsSortOrder = 1 | -1 | 0;

type NativeProps = Omit<HTMLAttributes<SVGSVGElement>, 'children'>;

export type BapsSortIconProps = {
  /** 1 ascending, -1 descending, 0 sortable but not sorted. */
  order?: BapsSortOrder;
  /**
   * Position in a multi-sort, 1-based. 0 hides the badge — a single-sort table
   * shows no number, because there is no ordering to communicate.
   */
  index?: number;
  ref?: Ref<SVGSVGElement>;
} & NativeProps;

const UP_PATH = 'M6.99994 -0.000136375C6.91097 -0.000542799 6.82281 0.0167359 6.74064 0.0508408C6.65843 0.0849457 6.58387 0.135169 6.52133 0.198481L1.10198 5.61784C0.982318 5.74625 0.917158 5.91609 0.920256 6.09159C0.923354 6.2671 0.994471 6.43454 1.11862 6.55868C1.24276 6.68282 1.4102 6.75394 1.5857 6.75704C1.7612 6.76014 1.93104 6.69498 2.05946 6.57532L6.99994 1.63484L11.9404 6.57532C12.0688 6.69498 12.2387 6.76014 12.4142 6.75704C12.5897 6.75394 12.7571 6.68282 12.8813 6.55868C13.0054 6.43454 13.0765 6.2671 13.0796 6.09159C13.0827 5.91609 13.0176 5.74625 12.8979 5.61784L7.47855 0.198481C7.41601 0.135169 7.34145 0.0849457 7.25924 0.0508408C7.17707 0.0167359 7.08891 -0.000542799 6.99994 -0.000136375Z';

const DOWN_PATH = 'M6.99994 14C6.91097 14.0004 6.82281 13.983 6.74064 13.9489C6.65843 13.9148 6.58387 13.8646 6.52133 13.8013L1.10198 8.38193C0.982318 8.25351 0.917158 8.08367 0.920256 7.90817C0.923354 7.73267 0.994471 7.56523 1.11862 7.44109C1.24276 7.31694 1.4102 7.24582 1.5857 7.24273C1.7612 7.23963 1.93104 7.30479 2.05946 7.42445L6.99994 12.3649L11.9404 7.42445C12.0688 7.30479 12.2387 7.23963 12.4142 7.24273C12.5897 7.24582 12.7571 7.31694 12.8813 7.44109C13.0054 7.56523 13.0765 7.73267 13.0796 7.90817C13.0827 8.08367 13.0176 8.25351 12.8979 8.38193L7.47855 13.8013C7.41601 13.8646 7.34145 13.9148 7.25924 13.9489C7.17707 13.983 7.08891 14.0004 6.99994 14Z';

/** Column sort indicator. Decorative: the header button carries the label. */
export function BapsSortIcon({
  order = 0,
  index = 0,
  ref,
  ...nativeProps
}: BapsSortIconProps): ReactElement {
  // Neutral shows both arrows; a direction shows only its own.
  const paths =
    order === 1 ? [UP_PATH] : order === -1 ? [DOWN_PATH] : [DOWN_PATH, UP_PATH];

  const svg = (
    <svg
      {...nativeProps}
      ref={ref}
      className={['p-datatable-sort-icon', nativeProps.className]
        .filter(Boolean)
        .join(' ')}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path key={d.slice(0, 24)} d={d} fill="currentColor" />
      ))}
    </svg>
  );

  if (index <= 0) return svg;

  return (
    <>
      {svg}
      <span className="p-datatable-sort-badge">{index}</span>
    </>
  );
}

BapsSortIcon.displayName = 'BapsSortIcon';
