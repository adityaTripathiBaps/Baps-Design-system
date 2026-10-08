'use client';

import {
  createElement,
  Fragment,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { BapsIcon } from '../icon/icon.js';
import {
  filterOptions,
  flattenCollection,
  findEdgeEnabledIndex,
  findEnabledIndex,
  getOptionText,
  type BapsCollectionOption,
  type BapsCollectionGroup,
} from '../internal/collection.js';
import {
  type BapsPortalTarget,
  useAnchoredOverlay,
} from '../internal/overlay.js';

export type BapsSelectBrand = 'mybky' | 'sampark';
export type BapsSelectSize = 'small' | 'large';
export type BapsSelectOption<Value> = BapsCollectionOption<Value>;
export type BapsSelectGroup<Value> = BapsCollectionGroup<Value>;
export type BapsSelectItem<Value> =
  BapsSelectOption<Value> | BapsSelectGroup<Value>;

type BapsSelectNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-labelledby' | 'children' | 'defaultValue' | 'onChange'
>;

type BapsSelectAccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };

export type BapsSelectProps<Value = string> = BapsSelectNativeProps &
  BapsSelectAccessibleName & {
    options: readonly BapsSelectItem<Value>[];
    value?: Value | null;
    defaultValue?: Value | null;
    onValueChange?: (
      value: Value | null,
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onOpenChange?: (open: boolean) => void;
    onFilterChange?: (
      query: string,
      event: SyntheticEvent<HTMLInputElement>,
    ) => void;
    renderOption?: (
      option: BapsSelectOption<Value>,
      state: { active: boolean; selected: boolean },
    ) => ReactNode;
    placeholder?: string;
    filter?: boolean;
    filterPlaceholder?: string;
    emptyMessage?: ReactNode;
    showClear?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    name?: string;
    inputId?: string;
    size?: BapsSelectSize;
    brand?: BapsSelectBrand;
    controlClassName?: string;
    panelClassName?: string;
    appendTo?: BapsPortalTarget;
    getFormValue?: (value: Value) => string;
    ref?: Ref<HTMLElement>;
  };

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

/** Pure selection helper shared with the runtime tests. */
export function getSelectOptionIndex<Value>(
  options: readonly BapsSelectItem<Value>[],
  value: Value | null,
): number {
  return flattenCollection(options).findIndex((entry) =>
    Object.is(entry.option.value, value),
  );
}

export function BapsSelect<Value = string>({
  options,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  onOpenChange,
  onFilterChange,
  renderOption,
  placeholder = 'Select an option',
  filter = false,
  filterPlaceholder = 'Search',
  emptyMessage = 'No results found',
  showClear = false,
  disabled = false,
  invalid = false,
  required = false,
  name,
  inputId,
  size,
  brand = 'mybky',
  controlClassName,
  panelClassName,
  appendTo = 'body',
  getFormValue = String,
  ariaLabel,
  ariaLabelledBy,
  className,
  ref,
  ...nativeProps
}: BapsSelectProps<Value>): ReactElement {
  const generatedId = useId();
  const triggerId = inputId ?? `${generatedId}-trigger`;
  const listboxId = `${generatedId}-listbox`;
  const [internalValue, setInternalValue] = useState<Value | null>(
    defaultValue,
  );
  const selectedValue =
    controlledValue === undefined ? internalValue : controlledValue;
  const optionEntries = useMemo(() => flattenCollection(options), [options]);
  const allOptions = useMemo(
    () => optionEntries.map((entry) => entry.option),
    [optionEntries],
  );
  const selectedIndex = getSelectOptionIndex(options, selectedValue);
  const selectedOption =
    selectedIndex < 0 ? undefined : allOptions[selectedIndex];
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const visibleEntries = useMemo(() => {
    const allowed = filter
      ? new Set(filterOptions(allOptions, query))
      : new Set(allOptions);
    return optionEntries.filter((entry) => allowed.has(entry.option));
  }, [allOptions, filter, optionEntries, query]);
  const visibleOptions = useMemo(
    () => visibleEntries.map((entry) => entry.option),
    [visibleEntries],
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const typeaheadRef = useRef('');
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlay = useAnchoredOverlay({
    open,
    setOpen,
    triggerRef,
    overlayRef,
    appendTo,
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });

  useEffect(() => {
    if (!open) return;
    const selectedVisibleIndex = visibleOptions.findIndex((option) =>
      Object.is(option.value, selectedValue),
    );
    setActiveIndex(
      selectedVisibleIndex >= 0 &&
        !visibleOptions[selectedVisibleIndex]?.disabled
        ? selectedVisibleIndex
        : findEdgeEnabledIndex(visibleOptions, 'first'),
    );
    if (filter) {
      window.requestAnimationFrame(() => filterRef.current?.focus());
    }
  }, [filter, open, selectedValue, visibleOptions]);

  useEffect(
    () => () => {
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
    },
    [],
  );

  const setOpenState = (next: boolean) => {
    if (open === next) return;
    setOpen(next);
    onOpenChange?.(next);
  };

  const commitValue = (
    nextValue: Value | null,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (controlledValue === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue, event);
  };

  const selectOption = (
    option: BapsSelectOption<Value>,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (option.disabled) return;
    commitValue(option.value, event);
    setOpenState(false);
    triggerRef.current?.focus();
  };

  const moveActive = (direction: 1 | -1) => {
    setActiveIndex((current) =>
      findEnabledIndex(visibleOptions, current, direction),
    );
  };

  const openPanel = (edge?: 'first' | 'last') => {
    if (disabled) return;
    setOpenState(true);
    if (edge) setActiveIndex(findEdgeEnabledIndex(visibleOptions, edge));
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) openPanel(event.key === 'ArrowDown' ? 'first' : 'last');
      else moveActive(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(findEdgeEnabledIndex(visibleOptions, 'first'));
      return;
    }
    if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(findEdgeEnabledIndex(visibleOptions, 'last'));
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      overlay.dismiss(true);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) openPanel();
      else {
        const option = visibleOptions[activeIndex];
        if (option) selectOption(option, event);
      }
      return;
    }

    if (!filter && event.key.length === 1 && !event.altKey && !event.ctrlKey) {
      typeaheadRef.current += event.key.toLocaleLowerCase();
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = setTimeout(() => {
        typeaheadRef.current = '';
      }, 500);
      const match = visibleOptions.findIndex(
        (option) =>
          !option.disabled &&
          getOptionText(option)
            .toLocaleLowerCase()
            .startsWith(typeaheadRef.current),
      );
      if (match >= 0) {
        if (!open) openPanel();
        setActiveIndex(match);
      }
    }
  };

  const panel =
    open && overlay.portalTarget
      ? createPortal(
          <div
            ref={overlayRef}
            className={joinClassNames(
              'p-select-overlay p-component',
              brand === 'sampark' && 'baps-ds-sampark',
              panelClassName,
            )}
            style={overlay.positionStyle}
          >
            {filter && (
              <div className="p-select-header">
                <input
                  ref={filterRef}
                  className="p-select-filter p-inputtext p-component"
                  type="search"
                  value={query}
                  placeholder={filterPlaceholder}
                  aria-label={filterPlaceholder}
                  onChange={(event) => {
                    setQuery(event.currentTarget.value);
                    onFilterChange?.(event.currentTarget.value, event);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setActiveIndex(
                        findEdgeEnabledIndex(visibleOptions, 'first'),
                      );
                      triggerRef.current?.focus();
                    } else if (event.key === 'Escape') {
                      event.preventDefault();
                      overlay.dismiss(true);
                    }
                  }}
                />
              </div>
            )}
            <div className="p-select-list-container">
              <ul
                id={listboxId}
                className="p-select-list"
                role="listbox"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
              >
                {visibleEntries.map((entry, index) => {
                  const option = entry.option;
                  const selected = Object.is(option.value, selectedValue);
                  const active = index === activeIndex;
                  const optionId = `${generatedId}-option-${index}`;
                  const previousGroup = visibleEntries[index - 1]?.groupKey;
                  return (
                    <Fragment key={`${getOptionText(option)}-${index}`}>
                      {entry.groupKey && entry.groupKey !== previousGroup && (
                        <li
                          className="p-select-option-group"
                          role="presentation"
                        >
                          {entry.groupLabel}
                        </li>
                      )}
                      <li
                        id={optionId}
                        role="option"
                        aria-selected={selected}
                        aria-disabled={option.disabled || undefined}
                        className={joinClassNames(
                          'p-select-option',
                          selected && 'p-select-option-selected',
                          active && 'p-focus',
                          option.disabled && 'p-disabled',
                        )}
                        onPointerMove={() => {
                          if (!option.disabled) setActiveIndex(index);
                        }}
                        onClick={(event) => selectOption(option, event)}
                      >
                        {renderOption?.(option, { active, selected }) ??
                          option.label}
                      </li>
                    </Fragment>
                  );
                })}
                {visibleOptions.length === 0 && (
                  <li className="p-select-empty-message">{emptyMessage}</li>
                )}
              </ul>
            </div>
          </div>,
          overlay.portalTarget,
        )
      : null;

  const activeOptionId =
    open && activeIndex >= 0
      ? `${generatedId}-option-${activeIndex}`
      : undefined;
  const serializedValue =
    selectedValue === null ? '' : getFormValue(selectedValue);

  return createElement(
    'baps-select',
    {
      ...nativeProps,
      ref,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        className,
      ),
    },
    <>
      <div
        ref={triggerRef}
        id={triggerId}
        role="combobox"
        tabIndex={disabled ? undefined : 0}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={activeOptionId}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        className={joinClassNames(
          'p-select p-component p-inputwrapper',
          selectedOption && 'p-inputwrapper-filled p-filled',
          open && 'p-select-open',
          focused && 'p-focus',
          disabled && 'p-disabled',
          invalid && 'p-invalid',
          size === 'small' && 'p-select-sm',
          size === 'large' && 'p-select-lg',
          controlClassName,
        )}
        onClick={() => (open ? overlay.dismiss() : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span className="p-select-label-container">
          <span
            className={joinClassNames(
              'p-select-label',
              !selectedOption && 'p-placeholder p-select-label-empty',
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
        </span>
        {showClear && selectedOption && !disabled && (
          <button
            type="button"
            className="p-select-clear-icon baps-selection-clear"
            aria-label="Clear selection"
            onClick={(event) => {
              event.stopPropagation();
              commitValue(null, event);
            }}
          >
            <BapsIcon name="close-circle" size="inherit" />
          </button>
        )}
        <span className="p-select-dropdown" aria-hidden="true">
          <BapsIcon name="angle-down" size="inherit" />
        </span>
      </div>
      {name && (
        <input
          type="hidden"
          name={name}
          value={serializedValue}
          disabled={disabled}
          required={required}
        />
      )}
      {panel}
    </>,
  );
}

BapsSelect.displayName = 'BapsSelect';
