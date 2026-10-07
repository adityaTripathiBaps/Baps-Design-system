import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';
import { BAPS_ICONS, type BapsIconName } from '../generated/icon-set.js';

export type { BapsIconName } from '../generated/icon-set.js';

export type BapsIconSize = 'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const ICON_SIZE_PX: Readonly<Record<Exclude<BapsIconSize, 'inherit'>, number>> =
  {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

type IconNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-hidden' | 'aria-label' | 'children' | 'dangerouslySetInnerHTML' | 'role'
>;

export interface BapsIconProps extends IconNativeProps {
  /** The shared BAPS glyph name. */
  name: BapsIconName;
  /** A named design-system step or an explicit pixel size. */
  size?: BapsIconSize | number;
  /** Set only when the icon itself conveys content. Unlabelled icons are decorative. */
  label?: string;
  /** Ref to the custom-element host used by the canonical shared CSS. */
  ref?: Ref<HTMLElement>;
}

type IconStyle = CSSProperties & { '--baps-icon-size': string };

/**
 * A BAPS Pixel Icon backed by the shared, Angular-free glyph registry.
 *
 * It intentionally renders the same `baps-icon > .baps-icon__glyph` markup as
 * the Angular component so both frameworks consume one CSS implementation.
 */
export function BapsIcon({
  name,
  size = 'lg',
  label,
  ref,
  style,
  ...nativeProps
}: BapsIconProps): ReactElement {
  const iconSize =
    size === 'inherit'
      ? '1em'
      : `${typeof size === 'number' ? size : ICON_SIZE_PX[size]}px`;
  const body = BAPS_ICONS[name] ?? '';
  const hostStyle: IconStyle = {
    ...style,
    '--baps-icon-size': iconSize,
  };

  const glyph = createElement('span', {
    className: 'baps-icon__glyph',
    role: label ? 'img' : undefined,
    'aria-label': label,
    'aria-hidden': label ? undefined : true,
    dangerouslySetInnerHTML: {
      __html: body
        ? `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">${body}</svg>`
        : '',
    },
  });

  return createElement(
    'baps-icon',
    { ...nativeProps, ref, style: hostStyle },
    glyph,
  );
}

BapsIcon.displayName = 'BapsIcon';
