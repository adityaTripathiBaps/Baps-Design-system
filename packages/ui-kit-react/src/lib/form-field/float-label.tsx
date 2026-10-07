import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsFloatLabelVariant = 'over' | 'in' | 'on';
export type BapsFormFieldBrand = 'mybky' | 'sampark';

export interface BapsFloatLabelProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: BapsFloatLabelVariant;
  fieldClassName?: string;
  brand?: BapsFormFieldBrand;
  ref?: Ref<HTMLElement>;
}

/** Composition wrapper for an input followed by its floating label. */
export function BapsFloatLabel({
  children,
  variant = 'over',
  fieldClassName,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsFloatLabelProps): ReactElement {
  const field = createElement(
    'span',
    {
      className: [
        'p-floatlabel',
        variant !== 'over' && `p-floatlabel-${variant}`,
        fieldClassName,
      ]
        .filter(Boolean)
        .join(' '),
    },
    children,
  );

  return createElement(
    'baps-floatlabel',
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

BapsFloatLabel.displayName = 'BapsFloatLabel';
