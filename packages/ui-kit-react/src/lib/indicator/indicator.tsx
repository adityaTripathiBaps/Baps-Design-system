import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';

export type BapsIndicatorSeverity =
  'primary' | 'info' | 'success' | 'warning' | 'error' | 'grey';
export type BapsIndicatorSize = 's' | 'm' | 'l' | 'xl';

type NativeIndicatorProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'children'
>;

type DecorativeIndicator = {
  children?: ReactNode;
  'aria-label'?: undefined;
};

type AccessibleIndicator = {
  children?: ReactNode;
  'aria-label': string;
};

export type BapsIndicatorProps = NativeIndicatorProps &
  (DecorativeIndicator | AccessibleIndicator) & {
    severity?: BapsIndicatorSeverity;
    size?: BapsIndicatorSize;
    disabled?: boolean;
    text?: boolean;
    ring?: boolean;
    ref?: Ref<HTMLElement>;
  };

/** Token-backed status/count marker matching the Angular host structure. */
export function BapsIndicator({
  severity = 'error',
  size = 'm',
  disabled = false,
  text = false,
  ring = false,
  children,
  className,
  ref,
  'aria-label': ariaLabel,
  ...nativeProps
}: BapsIndicatorProps): ReactElement {
  const hostClassName = [
    `baps-indicator--${size}`,
    `baps-indicator--${severity}`,
    disabled && 'baps-indicator--disabled',
    text && 'baps-indicator--text',
    ring && 'baps-indicator--ring',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const inner = (
    <span
      className="baps-indicator__inner"
      aria-hidden={!ariaLabel || undefined}
    >
      {children}
    </span>
  );

  return createElement(
    'baps-indicator',
    {
      ...nativeProps,
      ref,
      className: hostClassName,
      role: ariaLabel ? 'status' : undefined,
      'aria-label': ariaLabel,
    },
    inner,
  );
}

BapsIndicator.displayName = 'BapsIndicator';
