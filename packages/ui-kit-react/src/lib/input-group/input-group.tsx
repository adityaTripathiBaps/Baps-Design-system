import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsInputGroupBrand = 'mybky' | 'sampark';

type BapsInputGroupNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'prefix'
>;

export type BapsInputGroupProps = BapsInputGroupNativeProps & {
  children: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  brand?: BapsInputGroupBrand;
  inputGroupClassName?: string;
  ref?: Ref<HTMLElement>;
};

/** Groups a form control with readable, non-interactive text addons. */
export function BapsInputGroup({
  children,
  prefix,
  suffix,
  brand = 'mybky',
  inputGroupClassName,
  className,
  ref,
  ...nativeProps
}: BapsInputGroupProps): ReactElement {
  return createElement(
    'baps-input-group',
    {
      ...nativeProps,
      ref,
      className: [brand === 'sampark' && 'baps-sampark', className]
        .filter(Boolean)
        .join(' '),
    },
    <div
      className={['p-inputgroup', 'p-component', inputGroupClassName]
        .filter(Boolean)
        .join(' ')}
    >
      {prefix !== undefined && prefix !== null && (
        <span className="p-inputgroupaddon p-component">{prefix}</span>
      )}
      {children}
      {suffix !== undefined && suffix !== null && (
        <span className="p-inputgroupaddon p-component">{suffix}</span>
      )}
    </div>,
  );
}

BapsInputGroup.displayName = 'BapsInputGroup';
