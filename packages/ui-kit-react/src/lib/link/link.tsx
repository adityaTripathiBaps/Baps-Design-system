import {
  createElement,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsLinkBrand = 'mybky' | 'sampark';
export type BapsLinkVariant = 'primary' | 'secondary';
export type BapsLinkSize = 'small' | 'large' | 'xlarge';

export interface BapsLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'children'
> {
  children: ReactNode;
  brand?: BapsLinkBrand;
  variant?: BapsLinkVariant;
  size?: BapsLinkSize;
  disabled?: boolean;
  ref?: Ref<HTMLAnchorElement>;
}

const SIZE_CLASS: Readonly<Record<BapsLinkSize, string>> = {
  small: 'baps-link-sm',
  large: 'baps-link-lg',
  xlarge: 'baps-link-xl',
};

const secureBlankRel = (
  target: string | undefined,
  rel: string | undefined,
) => {
  if (target !== '_blank') return rel;
  const values = new Set((rel ?? '').split(/\s+/).filter(Boolean));
  values.add('noopener');
  values.add('noreferrer');
  return [...values].join(' ');
};

/** Native anchor implementation using the shared BAPS Link structure. */
export function BapsLink({
  children,
  brand = 'mybky',
  variant = 'primary',
  size,
  disabled = false,
  href,
  target,
  rel,
  tabIndex,
  className,
  onClick,
  ref,
  ...nativeProps
}: BapsLinkProps): ReactElement {
  const hostClassName = [
    brand === 'sampark' && 'baps-sampark',
    `baps-link--${variant}`,
    size && SIZE_CLASS[size],
  ]
    .filter(Boolean)
    .join(' ');
  const anchorClassName = [
    'baps-link__anchor',
    disabled && 'baps-link--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const anchor = (
    <a
      {...nativeProps}
      ref={ref}
      className={anchorClassName}
      href={disabled ? undefined : href}
      target={target}
      rel={secureBlankRel(target, rel)}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : (tabIndex ?? 0)}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </a>
  );

  return createElement('baps-link', { className: hostClassName }, anchor);
}

BapsLink.displayName = 'BapsLink';
