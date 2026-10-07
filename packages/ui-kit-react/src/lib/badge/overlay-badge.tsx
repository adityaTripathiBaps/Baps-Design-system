import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  BapsBadge,
  type BapsBadgeBrand,
  type BapsBadgeSeverity,
  type BapsBadgeSize,
  type BapsBadgeType,
} from './badge.js';

export interface BapsOverlayBadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  children: ReactNode;
  value?: string | number;
  severity?: BapsBadgeSeverity;
  badgeSize?: BapsBadgeSize;
  badgeDisabled?: boolean;
  badgeAriaLabel?: string;
  brand?: BapsBadgeBrand;
  type?: BapsBadgeType;
  ref?: Ref<HTMLSpanElement>;
}

/** Anchors a real BapsBadge to arbitrary React content. */
export function BapsOverlayBadge({
  children,
  value,
  severity,
  badgeSize,
  badgeDisabled = false,
  badgeAriaLabel,
  brand = 'mybky',
  type,
  className,
  ref,
  ...nativeProps
}: BapsOverlayBadgeProps): ReactElement {
  const badgeAppearance = {
    ...(severity ? { severity } : {}),
    ...(badgeSize ? { badgeSize } : {}),
    ...(type ? { type } : {}),
    badgeDisabled,
    brand,
  };
  const badge =
    value !== undefined ? (
      <BapsBadge
        {...badgeAppearance}
        value={value}
        {...(badgeAriaLabel
          ? { 'aria-label': badgeAriaLabel }
          : { 'aria-hidden': true as const })}
      />
    ) : badgeAriaLabel ? (
      <BapsBadge {...badgeAppearance} aria-label={badgeAriaLabel} />
    ) : (
      <BapsBadge {...badgeAppearance} aria-hidden={true} />
    );

  return (
    <span
      {...nativeProps}
      ref={ref}
      className={['p-overlay-badge', className].filter(Boolean).join(' ')}
    >
      {children}
      {badge}
    </span>
  );
}

BapsOverlayBadge.displayName = 'BapsOverlayBadge';
