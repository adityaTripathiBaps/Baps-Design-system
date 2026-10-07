import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsDividerLayout = 'horizontal' | 'vertical';
export type BapsDividerType = 'solid' | 'dashed' | 'dotted';
export type BapsDividerAlign = 'left' | 'center' | 'right' | 'top' | 'bottom';
export type BapsDividerSize = 'default' | 'compact';
export type BapsDividerBrand = 'mybky' | 'sampark';

export interface BapsDividerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
  layout?: BapsDividerLayout;
  type?: BapsDividerType;
  align?: BapsDividerAlign;
  size?: BapsDividerSize;
  brand?: BapsDividerBrand;
  ref?: Ref<HTMLElement>;
}

/** Decorative or labelled separator using the canonical shared divider CSS. */
export function BapsDivider({
  children,
  layout = 'horizontal',
  type = 'solid',
  align,
  size = 'default',
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsDividerProps): ReactElement {
  const resolvedAlign = align ?? (layout === 'horizontal' ? 'left' : 'center');
  const divider = (
    <div
      className={[
        'p-divider',
        'p-component',
        `p-divider-${layout}`,
        `p-divider-${type}`,
        `p-divider-${resolvedAlign}`,
      ].join(' ')}
      role="separator"
      aria-orientation={layout}
    >
      {children !== undefined && children !== null && (
        <div className="p-divider-content">{children}</div>
      )}
    </div>
  );

  return createElement(
    'baps-divider',
    {
      ...nativeProps,
      ref,
      'data-size': size,
      className:
        [brand === 'sampark' && 'baps-sampark', className]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    divider,
  );
}

BapsDivider.displayName = 'BapsDivider';
