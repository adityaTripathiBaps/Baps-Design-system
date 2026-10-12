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
  /** Rich leading addon content. Takes precedence over prefix when supplied. */
  prefixContent?: ReactNode;
  /** Rich trailing addon content. Takes precedence over suffix when supplied. */
  suffixContent?: ReactNode;
  brand?: BapsInputGroupBrand;
  inputGroupClassName?: string;
  ref?: Ref<HTMLElement>;
};

/** Groups a form control with readable, non-interactive text addons. */
export function BapsInputGroup({
  children,
  prefix,
  suffix,
  prefixContent,
  suffixContent,
  brand = 'mybky',
  inputGroupClassName,
  className,
  ref,
  ...nativeProps
}: BapsInputGroupProps): ReactElement {
  const resolvedPrefix = prefixContent ?? prefix;
  const resolvedSuffix = suffixContent ?? suffix;

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
      {resolvedPrefix !== undefined && resolvedPrefix !== null && (
        <span className="p-inputgroupaddon p-component">{resolvedPrefix}</span>
      )}
      {children}
      {resolvedSuffix !== undefined && resolvedSuffix !== null && (
        <span className="p-inputgroupaddon p-component">{resolvedSuffix}</span>
      )}
    </div>,
  );
}

BapsInputGroup.displayName = 'BapsInputGroup';
