import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { BapsAvatarBrand, BapsAvatarSize } from './avatar.js';

export interface BapsAvatarGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  children: ReactNode;
  size?: BapsAvatarSize;
  brand?: BapsAvatarBrand;
  ref?: Ref<HTMLDivElement>;
}

const normalizeSize = (
  size: BapsAvatarSize,
): 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' => {
  if (size === 'normal') return 'm';
  if (size === 'large') return 'l';
  if (size === 'xlarge') return 'xl';
  return size;
};

/** Overlapping avatar collection with native group semantics. */
export function BapsAvatarGroup({
  children,
  size = 'm',
  brand = 'mybky',
  className,
  role = 'group',
  ref,
  ...nativeProps
}: BapsAvatarGroupProps): ReactElement {
  return (
    <div
      {...nativeProps}
      ref={ref}
      role={role}
      className={[
        'baps-avatar-group',
        `baps-avatar-group--${normalizeSize(size)}`,
        brand === 'sampark' && 'baps-sampark',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

BapsAvatarGroup.displayName = 'BapsAvatarGroup';
