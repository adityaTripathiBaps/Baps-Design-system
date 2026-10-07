import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';

export type BapsSkeletonShape = 'rectangle' | 'circle';
export type BapsSkeletonAnimation = 'wave' | 'none';
export type BapsSkeletonBrand = 'mybky' | 'sampark';

export interface BapsSkeletonProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  shape?: BapsSkeletonShape;
  size?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  animation?: BapsSkeletonAnimation;
  skeletonClassName?: string;
  brand?: BapsSkeletonBrand;
  ref?: Ref<HTMLElement>;
}

/** Decorative loading placeholder; mark the owning region aria-busy. */
export function BapsSkeleton({
  shape = 'rectangle',
  size,
  width = '100%',
  height = '1rem',
  borderRadius,
  animation = 'wave',
  skeletonClassName,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsSkeletonProps): ReactElement {
  const skeletonStyle: CSSProperties = {
    width: size ?? width,
    height: size ?? height,
    borderRadius,
  };
  const skeleton = (
    <span
      className={[
        'p-skeleton',
        'p-component',
        shape === 'circle' && 'p-skeleton-circle',
        animation === 'none' && 'p-skeleton-animation-none',
        skeletonClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      style={skeletonStyle}
    />
  );

  return createElement(
    'baps-skeleton',
    {
      ...nativeProps,
      ref,
      'aria-hidden': true,
      className:
        [brand === 'sampark' && 'baps-sampark', className]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    skeleton,
  );
}

BapsSkeleton.displayName = 'BapsSkeleton';
