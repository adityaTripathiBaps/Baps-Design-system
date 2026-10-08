'use client';

import {
  createElement,
  Fragment,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useId,
  useMemo,
  useState,
} from 'react';
import { BapsAvatar } from '../avatar/avatar.js';
import { BapsIcon, type BapsIconName } from '../icon/icon.js';
import {
  findEdgeEnabledIndex,
  findEnabledIndex,
  getOptionText,
} from '../internal/collection.js';
import type { BapsSelectBrand, BapsSelectOption } from '../select/select.js';

export interface BapsListboxOption<
  Value = string,
> extends BapsSelectOption<Value> {
  title?: ReactNode;
  subtitle?: ReactNode;
  avatarLabel?: string;
  avatarIcon?: BapsIconName;
  icon?: BapsIconName;
}

export interface BapsListboxGroup<Value = string> {
  label: ReactNode;
  options: readonly BapsListboxOption<Value>[];
  textValue?: string;
}

type BapsListboxNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-labelledby' | 'children' | 'defaultValue' | 'onChange'
>;

type BapsListboxAccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };

type BapsListboxBaseProps<Value> = BapsListboxNativeProps &
  BapsListboxAccessibleName & {
    options: readonly (BapsListboxOption<Value> | BapsListboxGroup<Value>)[];
    filter?: boolean;
    filterPlaceholder?: string;
    emptyMessage?: ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    required?: boolean;
    name?: string;
    inputId?: string;
    checkbox?: boolean;
    metaKeySelection?: boolean;
    brand?: BapsSelectBrand;
    listClassName?: string;
    maxHeight?: string;
    renderOption?: (
      option: BapsListboxOption<Value>,
      state: { active: boolean; selected: boolean },
    ) => ReactNode;
    onFilterChange?: (
      query: string,
      event: SyntheticEvent<HTMLInputElement>,
    ) => void;
    getFormValue?: (value: Value) => string;
    ref?: Ref<HTMLElement>;
  };

type BapsListboxSingleProps<Value> = BapsListboxBaseProps<Value> & {
  multiple?: false;
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (
    value: Value | null,
    event: SyntheticEvent<HTMLElement>,
  ) => void;
};

type BapsListboxMultipleProps<Value> = BapsListboxBaseProps<Value> & {
  multiple: true;
  value?: readonly Value[];
  defaultValue?: readonly Value[];
  onValueChange?: (
    value: readonly Value[],
    event: SyntheticEvent<HTMLElement>,
  ) => void;
};

export type BapsListboxProps<Value = string> =
  BapsListboxSingleProps<Value> | BapsListboxMultipleProps<Value>;

type BapsListboxSelection<Value> = Value | readonly Value[] | null;

interface FlatOption<Value> {
  option: BapsListboxOption<Value>;
  groupLabel?: ReactNode;
  groupKey?: string;
}

type ListboxHostStyle = CSSProperties & { '--listbox-max-height'?: string };

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

function isGroup<Value>(
  item: BapsListboxOption<Value> | BapsListboxGroup<Value>,
): item is BapsListboxGroup<Value> {
  return 'options' in item;
}

function groupText<Value>(group: BapsListboxGroup<Value>): string {
  if (group.textValue !== undefined) return group.textValue;
  if (typeof group.label === 'string' || typeof group.label === 'number') {
    return String(group.label);
  }
  return 'group';
}

export function getNextListboxValue<Value>(
  current: BapsListboxSelection<Value>,
  option: Value,
  multiple: boolean,
  metaKeySelection: boolean,
  modifierKey: boolean,
): BapsListboxSelection<Value> {
  if (!multiple) return option;
  const values = Array.isArray(current) ? current : [];
  const selected = values.some((value) => Object.is(value, option));
  if (selected) return values.filter((value) => !Object.is(value, option));
  if (metaKeySelection && !modifierKey) return [option];
  return [...values, option];
}

export function BapsListbox<Value = string>(
  props: BapsListboxProps<Value>,
): ReactElement {
  const {
    options,
    multiple = false,
    filter = false,
    filterPlaceholder = 'Search',
    emptyMessage = 'No results found',
    disabled = false,
    readOnly = false,
    invalid = false,
    required = false,
    name,
    inputId,
    checkbox = false,
    metaKeySelection = false,
    brand = 'mybky',
    listClassName,
    maxHeight,
    renderOption,
    onFilterChange,
    getFormValue = String,
    ariaLabel,
    ariaLabelledBy,
    className,
    style,
    ref,
    ...nativeProps
  } = props;
  const controlledValue = props.value as
    BapsListboxSelection<Value> | undefined;
  const [internalValue, setInternalValue] = useState<
    BapsListboxSelection<Value>
  >(
    () =>
      (props.defaultValue as BapsListboxSelection<Value> | undefined) ??
      (multiple ? [] : null),
  );
  const selection =
    controlledValue === undefined ? internalValue : controlledValue;
  const onValueChange = props.onValueChange as
    | ((
        value: BapsListboxSelection<Value>,
        event: SyntheticEvent<HTMLElement>,
      ) => void)
    | undefined;
  const generatedId = useId();
  const listboxId = inputId ?? `${generatedId}-listbox`;
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const flatOptions = useMemo<readonly FlatOption<Value>[]>(() => {
    const normalized = query.trim().toLocaleLowerCase();
    const entries: FlatOption<Value>[] = [];
    options.forEach((item, groupIndex) => {
      if (isGroup(item)) {
        const groupKey = `${groupText(item)}-${groupIndex}`;
        item.options.forEach((option) => {
          if (
            !filter ||
            !normalized ||
            getOptionText(option).toLocaleLowerCase().includes(normalized)
          ) {
            entries.push({ option, groupLabel: item.label, groupKey });
          }
        });
      } else if (
        !filter ||
        !normalized ||
        getOptionText(item).toLocaleLowerCase().includes(normalized)
      ) {
        entries.push({ option: item });
      }
    });
    return entries;
  }, [filter, options, query]);

  const collectionOptions = flatOptions.map((entry) => entry.option);
  const isSelected = (option: BapsListboxOption<Value>) =>
    multiple
      ? Array.isArray(selection) &&
        selection.some((value) => Object.is(value, option.value))
      : Object.is(selection, option.value);

  const commitOption = (
    option: BapsListboxOption<Value>,
    event: SyntheticEvent<HTMLElement>,
    modifierKey = false,
  ) => {
    if (disabled || readOnly || option.disabled) return;
    const next = getNextListboxValue(
      selection,
      option.value,
      multiple,
      metaKeySelection,
      modifierKey,
    );
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next, event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) =>
        findEnabledIndex(
          collectionOptions,
          current,
          event.key === 'ArrowDown' ? 1 : -1,
        ),
      );
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(
        findEdgeEnabledIndex(
          collectionOptions,
          event.key === 'Home' ? 'first' : 'last',
        ),
      );
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && activeIndex >= 0) {
      event.preventDefault();
      const option = flatOptions[activeIndex]?.option;
      if (option) commitOption(option, event, event.ctrlKey || event.metaKey);
      return;
    }
    if (
      multiple &&
      event.key.toLocaleLowerCase() === 'a' &&
      (event.ctrlKey || event.metaKey) &&
      !readOnly
    ) {
      event.preventDefault();
      const next = collectionOptions
        .filter((option) => !option.disabled)
        .map((option) => option.value);
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next, event);
    }
  };

  const hostStyle: ListboxHostStyle = {
    ...style,
    ...(maxHeight === undefined ? {} : { '--listbox-max-height': maxHeight }),
  };

  let previousGroup: string | undefined;
  const listItems = flatOptions.map((entry, index) => {
    const { option, groupKey, groupLabel } = entry;
    const selected = isSelected(option);
    const active = index === activeIndex;
    const startsGroup = groupKey !== undefined && groupKey !== previousGroup;
    previousGroup = groupKey;
    const optionElement = (
      <li
        id={`${generatedId}-option-${index}`}
        key={`${getOptionText(option)}-${index}`}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        className={joinClassNames(
          'p-listbox-option',
          selected && 'p-listbox-option-selected',
          active && 'p-focus',
          option.disabled && 'p-disabled',
        )}
        onPointerMove={() => {
          if (!option.disabled) setActiveIndex(index);
        }}
        onClick={(event) =>
          commitOption(option, event, event.ctrlKey || event.metaKey)
        }
      >
        {multiple && checkbox && (
          <span
            className={joinClassNames(
              'p-checkbox p-component',
              selected && 'p-checkbox-checked',
            )}
            aria-hidden="true"
          >
            <span className="p-checkbox-box">
              {selected && <BapsIcon name="check" size="inherit" />}
            </span>
          </span>
        )}
        {renderOption?.(option, { active, selected }) ??
          (option.title ||
          option.subtitle ||
          option.avatarLabel ||
          option.avatarIcon ||
          option.icon ? (
            <span className="menu-item baps-listbox-item">
              {option.avatarIcon ? (
                <BapsAvatar
                  className="menu-item__avatar"
                  brand={brand}
                  size="s"
                  aria-hidden={true}
                >
                  <BapsIcon name={option.avatarIcon} size="inherit" />
                </BapsAvatar>
              ) : option.avatarLabel ? (
                <BapsAvatar
                  className="menu-item__avatar"
                  brand={brand}
                  size="s"
                  label={option.avatarLabel}
                />
              ) : null}
              {option.icon && (
                <BapsIcon
                  className="menu-item__icon"
                  name={option.icon}
                  size="inherit"
                />
              )}
              <span className="menu-item__text">
                <span className="menu-item__title">
                  {option.title ?? option.label}
                </span>
                {option.subtitle && (
                  <span className="menu-item__subtitle">{option.subtitle}</span>
                )}
              </span>
            </span>
          ) : (
            <span className="baps-listbox-default-label">{option.label}</span>
          ))}
      </li>
    );

    return startsGroup ? (
      <Fragment key={groupKey}>
        <li className="p-listbox-option-group" role="presentation">
          {groupLabel}
        </li>
        {optionElement}
      </Fragment>
    ) : (
      optionElement
    );
  });

  const selectedValues = Array.isArray(selection)
    ? selection
    : selection === null
      ? []
      : [selection];

  return createElement(
    'baps-listbox',
    {
      ...nativeProps,
      ref,
      style: hostStyle,
      className: joinClassNames(
        brand === 'sampark' && 'baps-sampark',
        className,
      ),
    },
    <div
      className={joinClassNames(
        'p-listbox p-component',
        disabled && 'p-disabled',
        invalid && 'p-invalid',
        listClassName,
      )}
    >
      {filter && (
        <div className="p-listbox-header">
          <input
            className="p-listbox-filter p-inputtext p-component"
            type="search"
            value={query}
            placeholder={filterPlaceholder}
            aria-label={filterPlaceholder}
            disabled={disabled}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setActiveIndex(-1);
              onFilterChange?.(event.currentTarget.value, event);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex(
                  findEdgeEnabledIndex(collectionOptions, 'first'),
                );
                document.getElementById(listboxId)?.focus();
              }
            }}
          />
        </div>
      )}
      <div className="p-listbox-list-container">
        <ul
          id={listboxId}
          className="p-listbox-list"
          role="listbox"
          tabIndex={disabled ? undefined : 0}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-multiselectable={multiple || undefined}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          aria-invalid={invalid || undefined}
          aria-required={required || undefined}
          aria-activedescendant={
            activeIndex >= 0
              ? `${generatedId}-option-${activeIndex}`
              : undefined
          }
          onKeyDown={handleKeyDown}
        >
          {listItems}
          {flatOptions.length === 0 && (
            <li className="p-listbox-empty-message">{emptyMessage}</li>
          )}
        </ul>
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
    </div>,
  );
}

BapsListbox.displayName = 'BapsListbox';
