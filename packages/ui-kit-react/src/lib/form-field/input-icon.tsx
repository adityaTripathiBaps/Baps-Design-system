import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';

export interface BapsInputIconProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
  icon?: BapsIconName;
  iconClassName?: string;
  ref?: Ref<HTMLElement>;
}

/** Decorative icon slot for BapsIconField; interactive actions belong outside this slot. */
export function BapsInputIcon({
  children,
  icon,
  iconClassName,
  className,
  ref,
  ...nativeProps
}: BapsInputIconProps): ReactElement {
  const content =
    children ?? (icon ? <BapsIcon name={icon} size="sm" /> : null);
  const visual = (
    <span
      className={['p-inputicon', iconClassName].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {content}
    </span>
  );

  return createElement(
    'baps-inputicon',
    {
      ...nativeProps,
      ref,
      className,
      'aria-hidden': true,
    },
    visual,
  );
}

BapsInputIcon.displayName = 'BapsInputIcon';
