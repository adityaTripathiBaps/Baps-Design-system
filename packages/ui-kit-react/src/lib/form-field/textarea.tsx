import {
  type InputEvent,
  type ReactElement,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react';
import type { BapsInputSize, BapsInputVariant } from './input-text.js';

export interface BapsTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
  pSize?: BapsInputSize;
  variant?: BapsInputVariant;
  invalid?: boolean;
  fluid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

/** Native textarea with shared BAPS styling and optional input-driven auto-resize. */
export function BapsTextarea({
  autoResize = false,
  pSize,
  variant = 'outlined',
  invalid = false,
  fluid = false,
  className,
  ref,
  onInput,
  'aria-invalid': ariaInvalid,
  ...nativeProps
}: BapsTextareaProps): ReactElement {
  const handleInput = (event: InputEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      event.currentTarget.style.height = 'auto';
      event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
    }
    onInput?.(event);
  };

  return (
    <textarea
      {...nativeProps}
      ref={ref}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      onInput={handleInput}
      className={[
        'p-textarea',
        'p-component',
        pSize && `p-inputtext-${pSize === 'small' ? 'sm' : 'lg'}`,
        variant === 'filled' && 'p-variant-filled',
        variant === 'ghost' && 'p-inputtext-ghost',
        invalid && 'p-invalid',
        fluid && 'p-fluid',
        autoResize && 'p-textarea-auto-resize',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

BapsTextarea.displayName = 'BapsTextarea';
