'use client';

import {
  createElement,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactElement,
  useState,
} from 'react';

import { BapsChip } from '../chip/chip.js';

export type BapsChipsInputBrand = 'mybky' | 'sampark';
export type BapsChipsInputSize = 'small' | 'large';

export interface BapsChipsInputProps {
  value?: readonly string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: BapsChipsInputSize;
  brand?: BapsChipsInputBrand;
  separator?: string;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

/** Native React equivalent of the free-text Angular chips ControlValueAccessor. */
export function BapsChipsInput({
  value: controlledValue,
  onChange,
  placeholder,
  disabled = false,
  size,
  brand = 'mybky',
  separator,
}: BapsChipsInputProps): ReactElement {
  const [internalValue, setInternalValue] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const value = controlledValue === undefined ? internalValue : controlledValue;
  const accessibleLabel = placeholder?.trim() || 'Chips input';

  const commit = (next: string[]) => {
    if (controlledValue === undefined) setInternalValue(next);
    onChange?.(next);
  };

  const addValues = (candidates: readonly string[]) => {
    const next = [...value];
    for (const candidate of candidates) {
      const item = candidate.trim();
      if (item && !next.includes(item)) next.push(item);
    }
    if (next.length !== value.length) commit(next);
    setDraft('');
  };

  const removeAt = (index: number) => {
    if (disabled) return;
    commit(value.filter((_, valueIndex) => valueIndex !== index));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addValues([draft]);
      return;
    }

    if (separator && event.key === separator) {
      event.preventDefault();
      addValues([draft]);
      return;
    }

    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      commit(value.slice(0, -1));
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!separator) return;
    const pasted = event.clipboardData.getData('text');
    if (!pasted.includes(separator)) return;
    event.preventDefault();
    addValues(pasted.split(separator));
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.currentTarget.value);
  };

  return createElement(
    'baps-chips-input',
    {
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        size === 'small' && 'baps-chips-input-sm',
        size === 'large' && 'baps-chips-input-lg',
      ),
    },
    <div
      className={joinClassNames(
        'baps-chips-input__control',
        disabled && 'p-disabled',
      )}
    >
      {value.map((item, index) => (
        <BapsChip
          label={item}
          brand={brand}
          disabled={disabled}
          removable={!disabled}
          removeLabel={`Remove ${item}`}
          onRemove={() => removeAt(index)}
          key={`${item}-${index}`}
        />
      ))}
      <span
        className={joinClassNames(
          'p-autocomplete p-component p-inputwrapper',
          value.length > 0 && 'p-inputwrapper-filled p-filled',
          disabled && 'p-disabled',
        )}
      >
        <div
          className={joinClassNames(
            'p-autocomplete-input-multiple',
            disabled && 'p-disabled',
          )}
          role="group"
          aria-label={`${accessibleLabel} values`}
        >
          <div className="p-autocomplete-input-chip">
            <input
              className="p-autocomplete-input"
              role="combobox"
              aria-label={accessibleLabel}
              aria-autocomplete="none"
              aria-expanded="false"
              value={draft}
              placeholder={value.length === 0 ? placeholder : undefined}
              disabled={disabled}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
            />
          </div>
        </div>
      </span>
    </div>,
  );
}

BapsChipsInput.displayName = 'BapsChipsInput';
