import {
  createElement,
  type AriaAttributes,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

export type BapsBadgeBrand = 'mybky' | 'sampark';
export type BapsBadgeSeverity =
  'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
export type BapsBadgeSize = 'small' | 'large' | 'xlarge';
export type BapsBadgeType = 'notification' | 'counts' | 'disable';

type NativeBadgeProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-hidden' | 'aria-label' | 'children'
>;

type ValueBadge = {
  value: string | number;
  'aria-label'?: string;
  'aria-hidden'?: AriaAttributes['aria-hidden'];
};

type AccessibleDotBadge = {
  value?: undefined;
  'aria-label': string;
  'aria-hidden'?: false | 'false';
};

type DecorativeDotBadge = {
  value?: undefined;
  'aria-label'?: never;
  'aria-hidden': true | 'true';
};

export type BapsBadgeProps = NativeBadgeProps &
  (ValueBadge | AccessibleDotBadge | DecorativeDotBadge) & {
    severity?: BapsBadgeSeverity;
    badgeSize?: BapsBadgeSize;
    badgeDisabled?: boolean;
    type?: BapsBadgeType;
    brand?: BapsBadgeBrand;
    ref?: Ref<HTMLSpanElement>;
  };

const SIZE_CLASS: Readonly<Record<BapsBadgeSize, string>> = {
  small: 'p-badge-sm',
  large: 'p-badge-lg',
  xlarge: 'p-badge-xl',
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

/** Framework-free badge using the same DOM/classes as the Angular wrapper. */
export function BapsBadge({
  value,
  severity,
  badgeSize,
  badgeDisabled = false,
  type,
  brand = 'mybky',
  className,
  ref,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...nativeProps
}: BapsBadgeProps): ReactElement {
  const badge = (
    <span
      {...nativeProps}
      ref={ref}
      className={joinClassNames(
        'p-badge',
        'p-component',
        value === undefined && 'p-badge-dot',
        severity && `p-badge-${severity}`,
        badgeSize && SIZE_CLASS[badgeSize],
        className,
      )}
      hidden={badgeDisabled}
      role={ariaLabel ? 'status' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    >
      {value}
    </span>
  );

  return createElement(
    'baps-badge',
    {
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        type && `baps-badge-${type}`,
      ),
    },
    badge,
  );
}

BapsBadge.displayName = 'BapsBadge';
