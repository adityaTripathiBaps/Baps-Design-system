'use client';

import {
  createElement,
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
import { BapsIcon, type BapsIconName } from '../icon/icon.js';
import {
  type BapsPortalTarget,
  useAnchoredOverlay,
} from '../internal/overlay.js';
import type { BapsSelectBrand, BapsSelectSize } from '../select/select.js';

export interface BapsTreeNode<Data = unknown> {
  key: string;
  label: ReactNode;
  textValue?: string;
  data?: Data;
  children?: readonly BapsTreeNode<Data>[];
  disabled?: boolean;
  selectable?: boolean;
  leaf?: boolean;
  icon?: BapsIconName;
}

export type BapsTreeSelectionMode = 'single' | 'multiple' | 'checkbox';

type BapsTreeSelectNativeProps = Omit<
  HTMLAttributes<HTMLElement>,
  'aria-label' | 'aria-labelledby' | 'children' | 'defaultValue' | 'onChange'
>;

type BapsTreeSelectAccessibleName =
  | { ariaLabel: string; ariaLabelledBy?: string }
  | { ariaLabel?: undefined; ariaLabelledBy: string };

type BapsTreeSelectBaseProps<Data> = BapsTreeSelectNativeProps &
  BapsTreeSelectAccessibleName & {
    options: readonly BapsTreeNode<Data>[];
    display?: 'comma' | 'chip';
    placeholder?: string;
    disabled?: boolean;
    filter?: boolean;
    filterPlaceholder?: string;
    filterMode?: 'lenient' | 'strict';
    propagateSelectionDown?: boolean;
    propagateSelectionUp?: boolean;
    showClear?: boolean;
    resetFilterOnHide?: boolean;
    emptyMessage?: ReactNode;
    scrollHeight?: string;
    loading?: boolean;
    appendTo?: BapsPortalTarget;
    size?: BapsSelectSize;
    fluid?: boolean;
    invalid?: boolean;
    required?: boolean;
    name?: string;
    inputId?: string;
    brand?: BapsSelectBrand;
    controlClassName?: string;
    panelClassName?: string;
    expandedKeys?: readonly string[];
    defaultExpandedKeys?: readonly string[];
    onExpandedKeysChange?: (
      keys: readonly string[],
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onNodeSelect?: (
      node: BapsTreeNode<Data>,
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onNodeUnselect?: (
      node: BapsTreeNode<Data>,
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onNodeExpand?: (
      node: BapsTreeNode<Data>,
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onNodeCollapse?: (
      node: BapsTreeNode<Data>,
      event: SyntheticEvent<HTMLElement>,
    ) => void;
    onOpenChange?: (open: boolean) => void;
    onFilterChange?: (
      query: string,
      event: SyntheticEvent<HTMLInputElement>,
    ) => void;
    renderNode?: (
      node: BapsTreeNode<Data>,
      state: { active: boolean; expanded: boolean; selected: boolean },
    ) => ReactNode;
    ref?: Ref<HTMLElement>;
  };

type BapsTreeSelectSingleProps<Data> = BapsTreeSelectBaseProps<Data> & {
  selectionMode?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (
    value: string | null,
    event: SyntheticEvent<HTMLElement>,
  ) => void;
};

type BapsTreeSelectMultipleProps<Data> = BapsTreeSelectBaseProps<Data> & {
  selectionMode: 'multiple' | 'checkbox';
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (
    value: readonly string[],
    event: SyntheticEvent<HTMLElement>,
  ) => void;
};

export type BapsTreeSelectProps<Data = unknown> =
  BapsTreeSelectSingleProps<Data> | BapsTreeSelectMultipleProps<Data>;

type TreeSelection = string | readonly string[] | null;

interface FlatTreeNode<Data> {
  node: BapsTreeNode<Data>;
  parentKey: string | null;
  depth: number;
}

const joinClassNames = (
  ...names: Array<string | false | null | undefined>
): string => names.filter(Boolean).join(' ');

function nodeText<Data>(node: BapsTreeNode<Data>): string {
  if (node.textValue !== undefined) return node.textValue;
  if (typeof node.label === 'string' || typeof node.label === 'number') {
    return String(node.label);
  }
  return node.key;
}

function filterTree<Data>(
  nodes: readonly BapsTreeNode<Data>[],
  query: string,
  mode: 'lenient' | 'strict',
): readonly BapsTreeNode<Data>[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return nodes;

  return nodes.flatMap((node) => {
    const matches = nodeText(node).toLocaleLowerCase().includes(normalized);
    if (matches && mode === 'lenient') return [node];
    const filteredChildren = node.children
      ? filterTree(node.children, query, mode)
      : [];
    if (!matches && filteredChildren.length === 0) return [];
    return [
      {
        ...node,
        ...(filteredChildren.length === 0
          ? { children: [] }
          : { children: filteredChildren }),
      },
    ];
  });
}

function flattenTree<Data>(
  nodes: readonly BapsTreeNode<Data>[],
  expanded: ReadonlySet<string>,
  forceExpanded: boolean,
  parentKey: string | null = null,
  depth = 1,
): readonly FlatTreeNode<Data>[] {
  const result: FlatTreeNode<Data>[] = [];
  nodes.forEach((node) => {
    result.push({ node, parentKey, depth });
    if (node.children?.length && (forceExpanded || expanded.has(node.key))) {
      result.push(
        ...flattenTree(
          node.children,
          expanded,
          forceExpanded,
          node.key,
          depth + 1,
        ),
      );
    }
  });
  return result;
}

function treeMap<Data>(nodes: readonly BapsTreeNode<Data>[]) {
  const map = new Map<
    string,
    { node: BapsTreeNode<Data>; parentKey: string | null }
  >();
  const visit = (
    current: readonly BapsTreeNode<Data>[],
    parentKey: string | null,
  ) => {
    current.forEach((node) => {
      map.set(node.key, { node, parentKey });
      if (node.children) visit(node.children, node.key);
    });
  };
  visit(nodes, null);
  return map;
}

function descendantKeys<Data>(node: BapsTreeNode<Data>): readonly string[] {
  return (node.children ?? []).flatMap((child) => [
    child.key,
    ...descendantKeys(child),
  ]);
}

export function getNextTreeSelectValue<Data>(
  nodes: readonly BapsTreeNode<Data>[],
  current: TreeSelection,
  key: string,
  mode: BapsTreeSelectionMode,
  propagateDown: boolean,
  propagateUp: boolean,
): TreeSelection {
  if (mode === 'single') return key;
  const metadata = treeMap(nodes);
  const target = metadata.get(key)?.node;
  if (!target || target.disabled || target.selectable === false) return current;
  const selected = new Set(Array.isArray(current) ? current : []);
  const shouldSelect = !selected.has(key);
  const affected = [
    key,
    ...(mode === 'checkbox' && propagateDown ? descendantKeys(target) : []),
  ];
  affected.forEach((affectedKey) => {
    const node = metadata.get(affectedKey)?.node;
    if (!node || node.disabled || node.selectable === false) return;
    if (shouldSelect) selected.add(affectedKey);
    else selected.delete(affectedKey);
  });

  if (mode === 'checkbox' && propagateUp) {
    let parentKey = metadata.get(key)?.parentKey ?? null;
    while (parentKey) {
      const parent = metadata.get(parentKey)?.node;
      if (!parent) break;
      const selectableChildren = (parent.children ?? []).filter(
        (child) => !child.disabled && child.selectable !== false,
      );
      if (
        selectableChildren.length > 0 &&
        selectableChildren.every((child) => selected.has(child.key))
      ) {
        selected.add(parentKey);
      } else {
        selected.delete(parentKey);
      }
      parentKey = metadata.get(parentKey)?.parentKey ?? null;
    }
  }

  return [...selected];
}

export function BapsTreeSelect<Data = unknown>(
  props: BapsTreeSelectProps<Data>,
): ReactElement {
  const {
    options,
    selectionMode = 'single',
    display = 'comma',
    placeholder = 'Select an option',
    disabled = false,
    filter = false,
    filterPlaceholder = 'Search',
    filterMode = 'lenient',
    propagateSelectionDown = true,
    propagateSelectionUp = true,
    showClear = false,
    resetFilterOnHide = false,
    emptyMessage = 'No results found',
    scrollHeight = '200px',
    loading = false,
    appendTo = 'body',
    size,
    fluid = false,
    invalid = false,
    required = false,
    name,
    inputId,
    brand = 'mybky',
    controlClassName,
    panelClassName,
    expandedKeys: controlledExpandedKeys,
    defaultExpandedKeys = [],
    onExpandedKeysChange,
    onNodeSelect,
    onNodeUnselect,
    onNodeExpand,
    onNodeCollapse,
    onOpenChange,
    onFilterChange,
    renderNode,
    ariaLabel,
    ariaLabelledBy,
    className,
    ref,
    ...nativeProps
  } = props;
  const controlledValue = props.value as TreeSelection | undefined;
  const [internalValue, setInternalValue] = useState<TreeSelection>(
    () =>
      (props.defaultValue as TreeSelection | undefined) ??
      (selectionMode === 'single' ? null : []),
  );
  const selection =
    controlledValue === undefined ? internalValue : controlledValue;
  const onValueChange = props.onValueChange as
    | ((value: TreeSelection, event: SyntheticEvent<HTMLElement>) => void)
    | undefined;
  const [internalExpandedKeys, setInternalExpandedKeys] =
    useState<readonly string[]>(defaultExpandedKeys);
  const expandedKeys = controlledExpandedKeys ?? internalExpandedKeys;
  const expandedSet = useMemo(() => new Set(expandedKeys), [expandedKeys]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const generatedId = useId();
  const triggerId = inputId ?? `${generatedId}-trigger`;
  const treeId = `${generatedId}-tree`;
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
  const filteredTree = useMemo(
    () => (filter ? filterTree(options, query, filterMode) : options),
    [filter, filterMode, options, query],
  );
  const flatNodes = useMemo(
    () => flattenTree(filteredTree, expandedSet, query.trim().length > 0),
    [expandedSet, filteredTree, query],
  );
  const allNodes = useMemo(
    () =>
      flattenTree(
        options,
        new Set(options.flatMap((node) => [node.key, ...descendantKeys(node)])),
        true,
      ),
    [options],
  );
  const [activeIndex, setActiveIndex] = useState(-1);
  const selectedKeys = new Set(
    Array.isArray(selection)
      ? selection
      : selection === null
        ? []
        : [selection],
  );
  const selectedNodes = allNodes
    .map((entry) => entry.node)
    .filter((node) => selectedKeys.has(node.key));

  useEffect(() => {
    if (!open) return;
    const firstSelected = flatNodes.findIndex(
      (entry) => selectedKeys.has(entry.node.key) && !entry.node.disabled,
    );
    setActiveIndex(
      firstSelected >= 0
        ? firstSelected
        : flatNodes.findIndex((entry) => !entry.node.disabled),
    );
    if (filter) {
      window.requestAnimationFrame(() => filterRef.current?.focus());
    }
  }, [filter, flatNodes, open]);

  const setOpenState = (next: boolean) => {
    if (open === next) return;
    setOpen(next);
    onOpenChange?.(next);
    if (!next && resetFilterOnHide) setQuery('');
  };

  const commitSelection = (
    node: BapsTreeNode<Data>,
    event: SyntheticEvent<HTMLElement>,
  ) => {
    if (disabled || node.disabled || node.selectable === false) return;
    const wasSelected = selectedKeys.has(node.key);
    const next = getNextTreeSelectValue(
      options,
      selection,
      node.key,
      selectionMode,
      propagateSelectionDown,
      propagateSelectionUp,
    );
    if (controlledValue === undefined) setInternalValue(next);
    onValueChange?.(next, event);
    if (wasSelected && selectionMode !== 'single')
      onNodeUnselect?.(node, event);
    else onNodeSelect?.(node, event);
    if (selectionMode === 'single') {
      setOpenState(false);
      triggerRef.current?.focus();
    }
  };

  const commitExpanded = (
    node: BapsTreeNode<Data>,
    event: SyntheticEvent<HTMLElement>,
    nextExpanded: boolean,
  ) => {
    const next = nextExpanded
      ? [...expandedKeys, node.key]
      : expandedKeys.filter((key) => key !== node.key);
    if (controlledExpandedKeys === undefined) setInternalExpandedKeys(next);
    onExpandedKeysChange?.(next, event);
    if (nextExpanded) onNodeExpand?.(node, event);
    else onNodeCollapse?.(node, event);
  };

  const moveActive = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      if (flatNodes.length === 0) return -1;
      for (let step = 1; step <= flatNodes.length; step += 1) {
        const index =
          (current + direction * step + flatNodes.length) % flatNodes.length;
        if (!flatNodes[index]?.node.disabled) return index;
      }
      return -1;
    });
  };

  const handleTreeKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (disabled) return;
    const current = flatNodes[activeIndex];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const indexes = flatNodes
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => !entry.node.disabled);
      const target = event.key === 'Home' ? indexes[0] : indexes.at(-1);
      if (target) setActiveIndex(target.index);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      overlay.dismiss(true);
      if (resetFilterOnHide) setQuery('');
      return;
    }
    if (!current) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (current.node.children?.length && !expandedSet.has(current.node.key)) {
        commitExpanded(current.node, event, true);
      } else {
        const nextIndex = activeIndex + 1;
        const next = flatNodes[nextIndex];
        if (next && next.depth > current.depth) setActiveIndex(nextIndex);
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (current.node.children?.length && expandedSet.has(current.node.key)) {
        commitExpanded(current.node, event, false);
      } else if (current.parentKey) {
        const parentIndex = flatNodes.findIndex(
          (entry) => entry.node.key === current.parentKey,
        );
        if (parentIndex >= 0) setActiveIndex(parentIndex);
      }
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      commitSelection(current.node, event);
    }
  };

  const renderTreeNodes = (
    nodes: readonly BapsTreeNode<Data>[],
    level: number,
  ): ReactNode =>
    nodes.map((node) => {
      const index = flatNodes.findIndex((entry) => entry.node.key === node.key);
      const active = index === activeIndex;
      const selected = selectedKeys.has(node.key);
      const expanded = query.trim().length > 0 || expandedSet.has(node.key);
      const hasChildren = Boolean(node.children?.length);
      const selectedDescendants = descendantKeys(node).filter((key) =>
        selectedKeys.has(key),
      ).length;
      const partial =
        selectionMode === 'checkbox' && !selected && selectedDescendants > 0;
      const filteredNode =
        filteredTree === options
          ? node
          : (flatNodes.find((entry) => entry.node.key === node.key)?.node ??
            node);
      return (
        <li className="p-tree-node" key={node.key}>
          <div
            id={`${generatedId}-node-${index}`}
            className={joinClassNames(
              'p-tree-node-content',
              selected && 'p-tree-node-selected',
              active && 'p-focus',
              node.disabled && 'p-disabled',
            )}
            role="treeitem"
            aria-level={level}
            aria-selected={selected}
            aria-disabled={node.disabled || undefined}
            aria-expanded={hasChildren ? expanded : undefined}
            onPointerMove={() => {
              if (!node.disabled) setActiveIndex(index);
            }}
            onClick={(event) => commitSelection(node, event)}
          >
            {hasChildren ? (
              <button
                type="button"
                className="p-tree-node-toggle-button"
                aria-label={`${expanded ? 'Collapse' : 'Expand'} ${nodeText(node)}`}
                onClick={(event) => {
                  event.stopPropagation();
                  commitExpanded(node, event, !expanded);
                }}
              >
                <BapsIcon
                  name={expanded ? 'angle-down' : 'angle-right'}
                  size="inherit"
                />
              </button>
            ) : (
              <span
                className="p-tree-node-toggle-placeholder"
                aria-hidden="true"
              />
            )}
            {selectionMode === 'checkbox' && (
              <span
                className={joinClassNames(
                  'p-checkbox p-component',
                  selected && 'p-checkbox-checked',
                  partial && 'p-checkbox-indeterminate',
                )}
                aria-hidden="true"
              >
                <span className="p-checkbox-box">
                  {(selected || partial) && (
                    <BapsIcon
                      name={selected ? 'check' : 'minus'}
                      size="inherit"
                    />
                  )}
                </span>
              </span>
            )}
            {node.icon && (
              <BapsIcon name={node.icon} size="inherit" aria-hidden="true" />
            )}
            <span className="p-tree-node-label">
              {renderNode?.(node, { active, expanded, selected }) ?? node.label}
            </span>
          </div>
          {hasChildren && expanded && (
            <ul className="p-tree-node-children" role="group">
              {renderTreeNodes(filteredNode.children ?? [], level + 1)}
            </ul>
          )}
        </li>
      );
    });

  const panel =
    open && overlay.portalTarget
      ? createPortal(
          <div
            ref={overlayRef}
            className={joinClassNames(
              'p-treeselect-overlay p-component',
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
                        flatNodes.findIndex((entry) => !entry.node.disabled),
                      );
                      document.getElementById(treeId)?.focus();
                    } else if (event.key === 'Escape') {
                      event.preventDefault();
                      overlay.dismiss(true);
                    }
                  }}
                />
              </div>
            )}
            <div
              className="p-treeselect-tree-container"
              style={{ maxHeight: scrollHeight, overflow: 'auto' }}
            >
              {loading ? (
                <div className="p-treeselect-loading" role="status">
                  Loading
                </div>
              ) : filteredTree.length > 0 ? (
                <ul
                  id={treeId}
                  className="p-tree p-tree-root-children"
                  role="tree"
                  tabIndex={0}
                  aria-label={ariaLabel}
                  aria-labelledby={ariaLabelledBy}
                  aria-multiselectable={selectionMode !== 'single' || undefined}
                  aria-activedescendant={
                    activeIndex >= 0
                      ? `${generatedId}-node-${activeIndex}`
                      : undefined
                  }
                  onKeyDown={handleTreeKeyDown}
                >
                  {renderTreeNodes(filteredTree, 1)}
                </ul>
              ) : (
                <div className="p-treeselect-empty-message">{emptyMessage}</div>
              )}
            </div>
          </div>,
          overlay.portalTarget,
        )
      : null;

  const selectedSummary = selectedNodes.map(nodeText).join(', ');
  return createElement(
    'baps-tree-select',
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
        aria-controls={treeId}
        aria-expanded={open}
        aria-haspopup="tree"
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        className={joinClassNames(
          'p-treeselect p-component p-inputwrapper',
          selectedNodes.length > 0 && 'p-inputwrapper-filled p-filled',
          open && 'p-treeselect-open',
          focused && 'p-focus',
          disabled && 'p-disabled',
          invalid && 'p-invalid',
          size === 'small' && 'p-treeselect-sm',
          size === 'large' && 'p-treeselect-lg',
          fluid && 'p-fluid',
          controlClassName,
        )}
        onClick={() => (open ? overlay.dismiss() : setOpenState(true))}
        onKeyDown={(event) => {
          if (disabled) return;
          if (
            event.key === 'Enter' ||
            event.key === ' ' ||
            event.key === 'ArrowDown'
          ) {
            event.preventDefault();
            setOpenState(true);
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            overlay.dismiss(true);
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <span className="p-treeselect-label-container">
          <span
            className={joinClassNames(
              'p-treeselect-label',
              selectedNodes.length === 0 && 'p-placeholder',
            )}
          >
            {selectedNodes.length === 0
              ? placeholder
              : display === 'chip' && selectionMode !== 'single'
                ? selectedNodes.map((node) => (
                    <span className="p-multiselect-chip-item" key={node.key}>
                      <span className="p-chip p-component">
                        <span className="p-chip-label">{node.label}</span>
                        {!disabled && (
                          <button
                            type="button"
                            className="p-chip-remove-icon baps-selection-clear"
                            aria-label={`Remove ${nodeText(node)}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              commitSelection(node, event);
                            }}
                          >
                            <BapsIcon name="close-circle" size="inherit" />
                          </button>
                        )}
                      </span>
                    </span>
                  ))
                : selectedSummary}
          </span>
        </span>
        {showClear && selectedNodes.length > 0 && !disabled && (
          <button
            type="button"
            className="p-treeselect-clear-icon baps-selection-clear"
            aria-label="Clear selection"
            onClick={(event) => {
              event.stopPropagation();
              const next: TreeSelection =
                selectionMode === 'single' ? null : [];
              if (controlledValue === undefined) setInternalValue(next);
              onValueChange?.(next, event);
            }}
          >
            <BapsIcon name="close-circle" size="inherit" />
          </button>
        )}
        <span className="p-treeselect-dropdown" aria-hidden="true">
          <BapsIcon name="angle-down" size="inherit" />
        </span>
      </div>
      {name &&
        (selectedNodes.length === 0 ? (
          <input
            type="hidden"
            name={name}
            value=""
            disabled={disabled}
            required={required}
          />
        ) : (
          selectedNodes.map((node) => (
            <input
              key={node.key}
              type="hidden"
              name={name}
              value={node.key}
              disabled={disabled}
            />
          ))
        ))}
      {panel}
    </>,
  );
}

BapsTreeSelect.displayName = 'BapsTreeSelect';
