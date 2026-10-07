import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';
import type { BapsFormFieldBrand } from './float-label.js';

export type BapsMessageSeverity =
  'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';
export type BapsMessageVariant = 'outlined' | 'text' | 'simple';
export type BapsMessageSize = 'small' | 'large';

export interface BapsMessageProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'children'
> {
  children?: ReactNode;
  text?: string;
  icon?: BapsIconName;
  severity?: BapsMessageSeverity;
  variant?: BapsMessageVariant;
  size?: BapsMessageSize;
  messageClassName?: string;
  brand?: BapsFormFieldBrand;
  ref?: Ref<HTMLElement>;
}

/** Inline form or workflow feedback message with polite alert semantics. */
export function BapsMessage({
  children,
  text,
  icon,
  severity = 'info',
  variant,
  size,
  messageClassName,
  brand = 'mybky',
  className,
  ref,
  ...nativeProps
}: BapsMessageProps): ReactElement {
  const message = (
    <div
      className={[
        'p-message',
        'p-component',
        `p-message-${severity}`,
        variant && `p-message-${variant}`,
        size && `p-message-${size === 'small' ? 'sm' : 'lg'}`,
        messageClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="p-message-content-wrapper">
        <div className="p-message-content">
          {icon && (
            <span className="p-message-icon" aria-hidden="true">
              <BapsIcon name={icon} size="sm" />
            </span>
          )}
          <span className="p-message-text">{text ?? children}</span>
        </div>
      </div>
    </div>
  );

  return createElement(
    'baps-message',
    {
      ...nativeProps,
      ref,
      role: 'alert',
      'aria-live': 'polite',
      className:
        [brand === 'sampark' && 'baps-sampark', className]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    message,
  );
}

BapsMessage.displayName = 'BapsMessage';
