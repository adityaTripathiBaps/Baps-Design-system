import {
  type AriaAttributes,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsAvatarBrand = 'mybky' | 'sampark';
export type BapsAvatarSize =
  'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | 'normal' | 'large' | 'xlarge';
export type BapsAvatarShape = 'square' | 'circle';
export type BapsAvatarVariant =
  'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info';

type NativeAvatarProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  'aria-hidden' | 'aria-label' | 'children'
>;

type NamedAvatarContent = {
  label: string;
  image?: never;
  imageAlt?: never;
  imageProps?: never;
  children?: never;
  'aria-label'?: string;
  'aria-hidden'?: AriaAttributes['aria-hidden'];
};

type ImageAvatarContent = {
  image: string;
  imageAlt: string;
  imageProps?: Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'alt' | 'children' | 'src'
  >;
  label?: never;
  children?: never;
  'aria-label'?: string;
  'aria-hidden'?: AriaAttributes['aria-hidden'];
};

type AccessibleIconAvatarContent = {
  children: ReactNode;
  label?: never;
  image?: never;
  imageAlt?: never;
  imageProps?: never;
  'aria-label': string;
  'aria-hidden'?: false | 'false';
};

type DecorativeIconAvatarContent = {
  children: ReactNode;
  label?: never;
  image?: never;
  imageAlt?: never;
  imageProps?: never;
  'aria-label'?: never;
  'aria-hidden': true | 'true';
};

export type BapsAvatarProps = NativeAvatarProps &
  (
    | NamedAvatarContent
    | ImageAvatarContent
    | AccessibleIconAvatarContent
    | DecorativeIconAvatarContent
  ) & {
    brand?: BapsAvatarBrand;
    shape?: BapsAvatarShape;
    size?: BapsAvatarSize;
    variant?: BapsAvatarVariant;
    statusDot?: boolean;
    iconBadge?: boolean;
    ref?: Ref<HTMLSpanElement>;
  };

const normalizeSize = (
  size: BapsAvatarSize,
): 'xs' | 's' | 'm' | 'l' | 'xl' | '2xl' => {
  if (size === 'normal') return 'm';
  if (size === 'large') return 'l';
  if (size === 'xlarge') return 'xl';
  return size;
};

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

/** Framework-free avatar backed by the canonical shared BAPS avatar CSS. */
export function BapsAvatar({
  brand = 'mybky',
  shape,
  size = 'm',
  variant = 'primary',
  statusDot = false,
  iconBadge = false,
  label,
  image,
  imageAlt,
  imageProps,
  children,
  className,
  ref,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...nativeProps
}: BapsAvatarProps): ReactElement {
  const normalizedSize = normalizeSize(size);
  const computedShape = shape ?? (brand === 'sampark' ? 'square' : 'circle');
  return (
    <span
      {...nativeProps}
      ref={ref}
      className={joinClassNames(
        'baps-avatar-wrap',
        `baps-avatar-wrap--${normalizedSize}`,
        statusDot && 'baps-avatar-wrap--dot',
        iconBadge && 'baps-avatar-wrap--icon-badge',
        className,
      )}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    >
      <span
        className={joinClassNames(
          'baps-avatar-html',
          `baps-avatar-html--${normalizedSize}`,
          `baps-avatar-html--${variant}`,
          computedShape === 'circle' && 'baps-avatar-html--circle',
          brand === 'sampark' && 'baps-sampark',
        )}
      >
        {image !== undefined ? (
          <img {...imageProps} src={image} alt={imageAlt} />
        ) : label !== undefined ? (
          label
        ) : (
          <span className="baps-avatar-html__icon" aria-hidden={true}>
            {children}
          </span>
        )}
      </span>
      {(statusDot || iconBadge) && (
        <span className="baps-avatar-wrap__markers" aria-hidden={true}>
          {statusDot && <span className="baps-avatar-wrap__status-dot" />}
          {iconBadge && <span className="baps-avatar-wrap__icon-badge" />}
        </span>
      )}
    </span>
  );
}

BapsAvatar.displayName = 'BapsAvatar';
