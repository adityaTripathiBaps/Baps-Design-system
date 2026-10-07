import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import type { BapsFormFieldBrand } from './float-label.js';

export interface BapsIconFieldProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  iconPosition?: 'left' | 'right';
  fieldClassName?: string;
  brand?: BapsFormFieldBrand;
  ref?: Ref<HTMLElement>;
}

/** Positions an InputIcon inside a composed input field. */
export function BapsIconField({
  children,
  iconPosition = 'left',
  fieldClassName,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsIconFieldProps): ReactElement {
  const field = createElement(
    'p-iconfield',
    {
      className: ['p-iconfield', `p-iconfield-${iconPosition}`, fieldClassName]
        .filter(Boolean)
        .join(' '),
    },
    children,
  );

  return createElement(
    'baps-iconfield',
    {
      ...nativeProps,
      ref,
      className:
        [brand === 'sampark' && 'baps-sampark', className]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    field,
  );
}

BapsIconField.displayName = 'BapsIconField';
