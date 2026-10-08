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
import { BapsCheckbox } from '../checkbox/checkbox.js';
import { BapsIcon } from '../icon/icon.js';
import {
  filterOptions,
  flattenCollection,
  findEdgeEnabledIndex,
  findEnabledIndex,
  getOptionText,
} from '../internal/collection.js';
import {
  type BapsPortalTarget,
  useAnchoredOverlay,
} from '../internal/overlay.js';
import type {
  BapsSelectBrand,
  BapsSelectItem,
  BapsSelectOption,
  BapsSelectSize,
} from '../select/select.js';

type BapsMultiSelectNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-labelledby' | 'children' | 'defaultValue' | 'onChange'
>;

type BapsMultiSelectAccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };

export type BapsMultiSelectProps<Value = string> = BapsMultiSelectNativeProps &
  BapsMultiSelectAccessibleName & {
    options: readonly BapsSelectItem<Value>[];
    value?: readonly Value[];
    defaultValue?: readonly Value[];
    onValueChange?: (
      value: readonly Value[],
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onOpenChange?: (open: boolean) => void;
    onFilterChange?: (
      query: string,
      event: SyntheticEvent<HTMLInputElement>,
    ) => void;
    onSelectAllChange?: (
      checked: boolean,
      value: readonly Value[],
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onItemRemove?: (value: Value, event: SyntheticEvent<HTMLElement>) => void;
    renderOption?: (
      option: BapsSelectOption<Value>,
      state: { active: boolean; selected: boolean },
    ) => ReactNode;
    placeholder?: string;
    filter?: boolean;
    filterPlaceholder?: string;
    emptyMessage?: ReactNode;
    showClear?: boolean;
    showHeader?: boolean;
    showToggleAll?: boolean;
    selectionLimit?: number;
    maxSelectedLabels?: number;
    selectedItemsLabel?: string;
    display?: 'comma' | 'chip';
    resetFilterOnHide?: boolean;
    scrollHeight?: string;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    required?: boolean;
    name?: string;
    inputId?: string;
    size?: BapsSelectSize;
    fluid?: boolean;
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

export function getNextMultiSelectValue<Value>(
  current: readonly Value[],
  option: Value,
  selectionLimit?: number,
): readonly Value[] {
  const selected = current.some((value) => Object.is(value, option));
  if (selected) return current.filter((value) => !Object.is(value, option));
  if (selectionLimit !== undefined && current.length >= selectionLimit) {
    return current;
  }
  return [...current, option];
}

export function BapsMultiSelect<Value = string>({
  options,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  onOpenChange,
  onFilterChange,
  onSelectAllChange,
  onItemRemove,
  renderOption,
  placeholder = 'Select options',
  filter = false,
  filterPlaceholder = 'Search',
  emptyMessage = 'No results found',
  showClear = false,
  showHeader = true,
  showToggleAll = true,
  selectionLimit,
  maxSelectedLabels = 3,
  selectedItemsLabel = '{0} items selected',
  display = 'comma',
  resetFilterOnHide = false,
  scrollHeight = '200px',
  disabled = false,
  readOnly = false,
  invalid = false,
  required = false,
  name,
  inputId,
  size,
  fluid = false,
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
}: BapsMultiSelectProps<Value>): ReactElement {
  const generatedId = useId();
  const triggerId = inputId ?? `${generatedId}-trigger`;
  const listboxId = `${generatedId}-listbox`;
  const [internalValue, setInternalValue] =
    useState<readonly Value[]>(defaultValue);
  const selectedValues = controlledValue ?? internalValue;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const optionEntries = useMemo(() => flattenCollection(options), [options]);
  const allOptions = useMemo(
    () => optionEntries.map((entry) => entry.option),
    [optionEntries],
  );
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
  const selectedOptions = useMemo(
    () =>
      allOptions.filter((option) =>
        selectedValues.some((value) => Object.is(value, option.value)),
      ),
    [allOptions, selectedValues],
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const overlay = useAnchoredOverlay({
    open,
    setOpen,
    triggerRef,
    overlayRef,
    appendTo,
    ...(onOpenChange === undefined ? {} : { onOpenChange }),
  });

  const isSelected = (option: BapsSelectOption<Value>) =>
    selectedValues.some((value) => Object.is(value, option.value));

  useEffect(() => {
    if (!open) return;
    setActiveIndex(findEdgeEnabledIndex(visibleOptions, 'first'));
    if (filter) {
      window.requestAnimationFrame(() => filterRef.current?.focus());
    }
  }, [filter, open, visibleOptions]);

  const setOpenState = (next: boolean) => {
    if (open === next) return;
    setOpen(next);
    onOpenChange?.(next);
    if (!next && resetFilterOnHide) setQuery('');
  };

  const commitValue = (
    next: readonly Value[],
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next, event);
  };

  const toggleOption = (
    option: BapsSelectOption<Value>,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (disabled || readOnly || option.disabled) return;
    const next = getNextMultiSelectValue(
      selectedValues,
      option.value,
      selectionLimit,
    );
    commitValue(next, event);
  };

  const enabledVisibleOptions = visibleOptions.filter(
    (option) => !option.disabled,
  );
  const allVisibleSelected =
    enabledVisibleOptions.length > 0 &&
    enabledVisibleOptions.every((option) => isSelected(option));
  const someVisibleSelected =
    !allVisibleSelected &&
    enabledVisibleOptions.some((option) => isSelected(option));

  const toggleAll = (event: SyntheticEvent<HTMLElement>) => {
    if (disabled || readOnly) return;
    let next: readonly Value[];
    if (allVisibleSelected) {
      next = selectedValues.filter(
        (value) =>
          !enabledVisibleOptions.some((option) =>
            Object.is(option.value, value),
          ),
      );
    } else {
      const additions = enabledVisibleOptions
        .map((option) => option.value)
        .filter(
          (value) =>
            !selectedValues.some((selected) => Object.is(selected, value)),
        );
      const available =
        selectionLimit === undefined
          ? additions.length
          : Math.max(0, selectionLimit - selectedValues.length);
      next = [...selectedValues, ...additions.slice(0, available)];
    }
    commitValue(next, event);
    onSelectAllChange?.(!allVisibleSelected, next, event);
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
      else {
        setActiveIndex((current) =>
          findEnabledIndex(
            visibleOptions,
            current,
            event.key === 'ArrowDown' ? 1 : -1,
          ),
        );
      }
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
      if (resetFilterOnHide) setQuery('');
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) openPanel();
      else {
        const option = visibleOptions[activeIndex];
        if (option) toggleOption(option, event);
      }
    }
  };

  const summary =
    selectedOptions.length > maxSelectedLabels
      ? selectedItemsLabel.replace('{0}', String(selectedOptions.length))
      : selectedOptions.map(getOptionText).join(', ');

  const panel =
    open && overlay.portalTarget
      ? createPortal(
          <div
            ref={overlayRef}
            className={joinClassNames(
              'p-multiselect-overlay p-component',
              brand === 'sampark' && 'baps-ds-sampark',
              panelClassName,
            )}
            style={overlay.positionStyle}
          >
            {showHeader && (
              <div className="p-multiselect-header">
                {filter && (
                  <div className="p-multiselect-filter-container">
                    <input
                      ref={filterRef}
                      className="p-multiselect-filter p-inputtext p-component"
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
                          if (resetFilterOnHide) setQuery('');
                        }
                      }}
                    />
                  </div>
                )}
                {showToggleAll && (
                  <BapsCheckbox
                    className="p-multiselect-header-checkbox"
                    aria-label="Select all options"
                    checked={allVisibleSelected}
                    indeterminate={someVisibleSelected}
                    disabled={
                      disabled || readOnly || enabledVisibleOptions.length === 0
                    }
                    onChange={toggleAll}
                  />
                )}
              </div>
            )}
            <div
              className="p-multiselect-list-container"
              style={{ maxHeight: scrollHeight }}
            >
              <ul
                id={listboxId}
                className="p-multiselect-list"
                role="listbox"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                aria-multiselectable="true"
              >
                {visibleEntries.map((entry, index) => {
                  const option = entry.option;
                  const selected = isSelected(option);
                  const active = index === activeIndex;
                  const previousGroup = visibleEntries[index - 1]?.groupKey;
                  return (
                    <Fragment key={`${getOptionText(option)}-${index}`}>
                      {entry.groupKey && entry.groupKey !== previousGroup && (
                        <li
                          className="p-multiselect-option-group"
                          role="presentation"
                        >
                          {entry.groupLabel}
                        </li>
                      )}
                      <li
                        id={`${generatedId}-option-${index}`}
                        role="option"
                        aria-selected={selected}
                        aria-disabled={option.disabled || undefined}
                        className={joinClassNames(
                          'p-multiselect-option',
                          selected && 'p-multiselect-option-selected',
                          active && 'p-focus',
                          option.disabled && 'p-disabled',
                        )}
                        onPointerMove={() => {
                          if (!option.disabled) setActiveIndex(index);
                        }}
                        onClick={(event) => toggleOption(option, event)}
                      >
                        <span
                          className={joinClassNames(
                            'p-checkbox p-component',
                            selected && 'p-checkbox-checked',
                          )}
                          aria-hidden="true"
                        >
                          <span className="p-checkbox-box">
                            {selected && (
                              <BapsIcon name="check" size="inherit" />
                            )}
                          </span>
                        </span>
                        {renderOption?.(option, { active, selected }) ??
                          option.label}
                      </li>
                    </Fragment>
                  );
                })}
                {visibleOptions.length === 0 && (
                  <li className="p-multiselect-empty-message">
                    {emptyMessage}
                  </li>
                )}
              </ul>
            </div>
          </div>,
          overlay.portalTarget,
        )
      : null;

  return createElement(
    'baps-multi-select',
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
        aria-activedescendant={
          open && activeIndex >= 0
            ? `${generatedId}-option-${activeIndex}`
            : undefined
        }
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        className={joinClassNames(
          'p-multiselect p-component p-inputwrapper',
          selectedOptions.length > 0 && 'p-inputwrapper-filled p-filled',
          open && 'p-multiselect-open',
          focused && 'p-focus',
          disabled && 'p-disabled',
          invalid && 'p-invalid',
          size === 'small' && 'p-multiselect-sm',
          size === 'large' && 'p-multiselect-lg',
          fluid && 'p-fluid',
          controlClassName,
        )}
        onClick={() => (open ? overlay.dismiss() : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span className="p-multiselect-label-container">
          <span
            className={joinClassNames(
              'p-multiselect-label',
              selectedOptions.length === 0 &&
                'p-placeholder p-multiselect-label-empty',
            )}
          >
            {selectedOptions.length === 0
              ? placeholder
              : display === 'chip'
                ? selectedOptions.map((option, index) => (
                    <span
                      className="p-multiselect-chip-item"
                      key={`${getOptionText(option)}-${index}`}
                    >
                      <span className="p-chip p-component">
                        <span className="p-chip-label">{option.label}</span>
                        {!disabled && !readOnly && (
                          <button
                            type="button"
                            className="p-chip-remove-icon baps-selection-clear"
                            aria-label={`Remove ${getOptionText(option)}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              const next = selectedValues.filter(
                                (value) => !Object.is(value, option.value),
                              );
                              commitValue(next, event);
                              onItemRemove?.(option.value, event);
                            }}
                          >
                            <BapsIcon name="close-circle" size="inherit" />
                          </button>
                        )}
                      </span>
                    </span>
                  ))
                : summary}
          </span>
        </span>
        {showClear && selectedOptions.length > 0 && !disabled && !readOnly && (
          <button
            type="button"
            className="p-multiselect-clear-icon baps-selection-clear"
            aria-label="Clear selections"
            onClick={(event) => {
              event.stopPropagation();
              commitValue([], event);
            }}
          >
            <BapsIcon name="close-circle" size="inherit" />
          </button>
        )}
        <span className="p-multiselect-dropdown" aria-hidden="true">
          <BapsIcon name="angle-down" size="inherit" />
        </span>
      </div>
      {name &&
        (selectedValues.length === 0 ? (
          <input
            type="hidden"
            name={name}
            value=""
            disabled={disabled}
            required={required}
          />
        ) : (
          selectedValues.map((value, index) => (
            <input
              key={`${getFormValue(value)}-${index}`}
              type="hidden"
              name={name}
              value={getFormValue(value)}
              disabled={disabled}
            />
          ))
        ))}
      {panel}
    </>,
  );
}

BapsMultiSelect.displayName = 'BapsMultiSelect';
