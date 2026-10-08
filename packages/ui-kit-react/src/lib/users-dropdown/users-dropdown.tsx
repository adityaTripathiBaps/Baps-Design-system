'use client';

import {
  createElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { BapsIcon } from '../icon/icon.js';
import {
  type BapsPortalTarget,
  useAnchoredOverlay,
} from '../internal/overlay.js';
import { BapsMenuItem } from '../menu-item/menu-item.js';

export type BapsUsersDropdownBrand = 'mybky' | 'sampark';
export type BapsUsersDropdownMode = 'single' | 'checkbox' | 'radio';

export interface BapsUserOption<Value = string> {
  value: Value;
  title: ReactNode;
  subtitle?: ReactNode;
  searchText?: string;
  avatarLabel?: string;
  avatarIcon?: string;
  disabled?: boolean;
  group?: string;
}

type NativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-labelledby' | 'children' | 'defaultValue' | 'onChange'
>;

type AccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };

type BaseProps<Value> = NativeProps &
  AccessibleName & {
    users: readonly BapsUserOption<Value>[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: ReactNode;
    maxHeight?: string;
    disabled?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    searchValue?: string;
    defaultSearchValue?: string;
    onSearchChange?: (
      value: string,
      event: SyntheticEvent<HTMLInputElement> | null,
    ) => void;
    brand?: BapsUsersDropdownBrand;
    appendTo?: BapsPortalTarget;
    panelClassName?: string;
    name?: string;
    getFormValue?: (value: Value) => string;
    ref?: Ref<HTMLElement>;
  };

type SingleProps<Value> = BaseProps<Value> & {
  selectionMode?: 'single' | 'radio';
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (
    value: Value | null,
    event: SyntheticEvent<HTMLElement>,
  ) => void;
  values?: never;
  defaultValues?: never;
  onValuesChange?: never;
};

type CheckboxProps<Value> = BaseProps<Value> & {
  selectionMode: 'checkbox';
  values?: readonly Value[];
  defaultValues?: readonly Value[];
  onValuesChange?: (
    values: readonly Value[],
    event: SyntheticEvent<HTMLElement>,
  ) => void;
  value?: never;
  defaultValue?: never;
  onValueChange?: never;
};

export type BapsUsersDropdownProps<Value = string> =
  SingleProps<Value> | CheckboxProps<Value>;

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

const optionText = <Value,>(option: BapsUserOption<Value>): string => {
  if (option.searchText) return option.searchText;
  return [option.title, option.subtitle]
    .filter((part): part is string => typeof part === 'string')
    .join(' ');
};

export function getNextUsersDropdownValues<Value>(
  current: readonly Value[],
  value: Value,
): readonly Value[] {
  return current.some((item) => Object.is(item, value))
    ? current.filter((item) => !Object.is(item, value))
    : [...current, value];
}

export function BapsUsersDropdown<Value = string>({
  users,
  selectionMode = 'single',
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  values: controlledValues,
  defaultValues = [],
  onValuesChange,
  placeholder = 'Select user',
  searchPlaceholder = 'Search',
  emptyMessage = 'No results',
  maxHeight = '320px',
  disabled = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  searchValue: controlledSearch,
  defaultSearchValue = '',
  onSearchChange,
  brand = 'sampark',
  appendTo = 'body',
  panelClassName,
  name,
  getFormValue = String,
  ariaLabel,
  ariaLabelledBy,
  className,
  ref,
  ...nativeProps
}: BapsUsersDropdownProps<Value>): ReactElement {
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const [internalSearch, setInternalSearch] = useState(defaultSearchValue);
  const searchValue = controlledSearch ?? internalSearch;
  const [internalValue, setInternalValue] = useState<Value | null>(
    defaultValue,
  );
  const selectedValue =
    controlledValue === undefined ? internalValue : controlledValue;
  const [internalValues, setInternalValues] =
    useState<readonly Value[]>(defaultValues);
  const selectedValues =
    controlledValues === undefined ? internalValues : controlledValues;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const overlay = useAnchoredOverlay({
    open,
    setOpen: setInternalOpen,
    triggerRef,
    overlayRef: panelRef,
    appendTo,
    onOpenChange: (next) => {
      onOpenChange?.(next);
      if (!next) {
        if (controlledSearch === undefined) setInternalSearch('');
        onSearchChange?.('', null);
      }
    },
  });

  const filteredUsers = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase();
    if (!query) return [...users];
    return users.filter((user) =>
      optionText(user).toLocaleLowerCase().includes(query),
    );
  }, [searchValue, users]);

  const groups = useMemo(() => {
    const grouped = new Map<string | undefined, BapsUserOption<Value>[]>();
    for (const user of filteredUsers) {
      const items = grouped.get(user.group) ?? [];
      items.push(user);
      grouped.set(user.group, items);
    }
    return [...grouped.entries()];
  }, [filteredUsers]);

  const selected = users.find((user) => Object.is(user.value, selectedValue));
  const hasSelection =
    selectionMode === 'checkbox'
      ? selectedValues.length > 0
      : selected !== undefined;
  const triggerLabel =
    selectionMode === 'checkbox'
      ? selectedValues.length
        ? `${selectedValues.length} selected`
        : placeholder
      : (selected?.title ?? placeholder);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(
      Math.max(
        0,
        filteredUsers.findIndex((user) => !user.disabled),
      ),
    );
    searchRef.current?.focus();
  }, [filteredUsers, open]);

  const setOpen = (next: boolean, restoreFocus = false) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
    if (!next) {
      if (controlledSearch === undefined) setInternalSearch('');
      onSearchChange?.('', null);
      if (restoreFocus) triggerRef.current?.focus();
    }
  };

  const isSelected = (user: BapsUserOption<Value>): boolean =>
    selectionMode === 'checkbox'
      ? selectedValues.some((value) => Object.is(value, user.value))
      : Object.is(selectedValue, user.value);

  const select = (
    user: BapsUserOption<Value>,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (disabled || user.disabled) return;
    if (selectionMode === 'checkbox') {
      const next = getNextUsersDropdownValues(selectedValues, user.value);
      if (controlledValues === undefined) setInternalValues(next);
      onValuesChange?.(next, event);
      return;
    }
    if (controlledValue === undefined) setInternalValue(user.value);
    onValueChange?.(user.value, event);
    if (selectionMode === 'single') setOpen(false);
  };

  const focusOption = (index: number) => {
    if (filteredUsers.length === 0) return;
    let candidate = index;
    for (let checked = 0; checked < filteredUsers.length; checked += 1) {
      candidate = (candidate + filteredUsers.length) % filteredUsers.length;
      if (!filteredUsers[candidate]?.disabled) {
        setActiveIndex(candidate);
        panelRef.current
          ?.querySelector<HTMLElement>(`#${generatedId}-option-${candidate}`)
          ?.focus();
        return;
      }
      candidate += index >= activeIndex ? 1 : -1;
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(filteredUsers.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      overlay.dismiss(true);
    }
  };

  const panel = (
    <div
      ref={panelRef}
      id={listboxId}
      className={joinClassNames(
        'ud__panel baps-users-dropdown-panel',
        brand === 'sampark' ? 'baps-ds-sampark' : 'baps-mybky',
        panelClassName,
      )}
      role="listbox"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-multiselectable={selectionMode === 'checkbox' || undefined}
      style={overlay.positionStyle}
      onKeyDown={handlePanelKeyDown}
    >
      <div className="ud__search">
        <input
          ref={searchRef}
          type="search"
          className="p-inputtext p-component"
          value={searchValue}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(event) => {
            if (controlledSearch === undefined)
              setInternalSearch(event.currentTarget.value);
            onSearchChange?.(event.currentTarget.value, event);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              focusOption(activeIndex < 0 ? 0 : activeIndex);
            }
          }}
        />
      </div>
      <div className="ud__list" style={{ maxHeight }}>
        {groups.map(([group, items]) => (
          <div
            className="ud__group"
            role="group"
            aria-label={group}
            key={group ?? 'ungrouped'}
          >
            {group && <div className="ud__group-title">{group}</div>}
            {items.map((user) => {
              const index = filteredUsers.indexOf(user);
              const checked = isSelected(user);
              return (
                <BapsMenuItem
                  id={`${generatedId}-option-${index}`}
                  key={`${optionText(user)}-${index}`}
                  media="avatar"
                  control={selectionMode === 'single' ? 'none' : selectionMode}
                  checked={checked}
                  {...(user.avatarLabel === undefined
                    ? {}
                    : { avatarLabel: user.avatarLabel })}
                  {...(user.avatarIcon === undefined
                    ? {}
                    : { avatarIcon: user.avatarIcon })}
                  title={user.title}
                  subtitle={user.subtitle}
                  selected={selectionMode === 'single' && checked}
                  disabled={!!user.disabled}
                  brand={brand}
                  role="option"
                  aria-selected={checked}
                  tabIndex={index === activeIndex && !user.disabled ? 0 : -1}
                  onFocus={() => setActiveIndex(index)}
                  onActivated={(event) => select(user, event)}
                />
              );
            })}
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="ud__empty">{emptyMessage}</div>
        )}
      </div>
    </div>
  );

  const root = (
    <div
      className={joinClassNames(
        'ud',
        open && 'ud--open',
        disabled && 'ud--disabled',
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        className={joinClassNames(
          'ud__trigger',
          !hasSelection && 'ud__trigger--placeholder',
        )}
        disabled={disabled}
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (
            event.key === 'ArrowDown' ||
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            setOpen(true);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false, true);
          }
        }}
      >
        <span className="ud__trigger-label">{triggerLabel}</span>
        <span className="ud__chevron" aria-hidden="true">
          <BapsIcon name="angle-down" size="inherit" />
        </span>
      </button>
      {name &&
        (selectionMode === 'checkbox'
          ? selectedValues.map((selectedItem, index) => (
              <input
                key={index}
                type="hidden"
                name={`${name}[]`}
                value={getFormValue(selectedItem)}
              />
            ))
          : selectedValue !== null &&
            selectedValue !== undefined && (
              <input
                type="hidden"
                name={name}
                value={getFormValue(selectedValue)}
              />
            ))}
    </div>
  );

  return createElement(
    'baps-users-dropdown',
    {
      ...nativeProps,
      ref,
      className: joinClassNames(
        brand === 'sampark' ? 'baps-sampark' : 'baps-mybky',
        className,
      ),
    },
    root,
    open && overlay.portalTarget
      ? createPortal(panel, overlay.portalTarget)
      : null,
  );
}

BapsUsersDropdown.displayName = 'BapsUsersDropdown';
