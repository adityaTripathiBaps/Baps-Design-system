import type { ReactNode } from 'react';

export interface BapsCollectionOption<Value> {
  label: ReactNode;
  value: Value;
  disabled?: boolean;
  /** Plain text used for filtering and typeahead when `label` is not text. */
  textValue?: string;
}

export interface BapsCollectionGroup<Value> {
  label: ReactNode;
  options: readonly BapsCollectionOption<Value>[];
  textValue?: string;
}

export interface BapsCollectionEntry<Value> {
  option: BapsCollectionOption<Value>;
  groupLabel?: ReactNode;
  groupKey?: string;
}

export function isCollectionGroup<Value>(
  item: BapsCollectionOption<Value> | BapsCollectionGroup<Value>,
): item is BapsCollectionGroup<Value> {
  return 'options' in item;
}

export function flattenCollection<Value>(
  items: readonly (BapsCollectionOption<Value> | BapsCollectionGroup<Value>)[],
): readonly BapsCollectionEntry<Value>[] {
  return items.flatMap((item, groupIndex) => {
    if (!isCollectionGroup(item)) return [{ option: item }];
    const label =
      item.textValue ??
      (typeof item.label === 'string' || typeof item.label === 'number'
        ? String(item.label)
        : `group-${groupIndex}`);
    const groupKey = `${label}-${groupIndex}`;
    return item.options.map((option) => ({
      option,
      groupLabel: item.label,
      groupKey,
    }));
  });
}

export function getOptionText<Value>(
  option: BapsCollectionOption<Value>,
): string {
  if (option.textValue !== undefined) return option.textValue;
  if (typeof option.label === 'string' || typeof option.label === 'number') {
    return String(option.label);
  }
  return String(option.value);
}

export function findEnabledIndex<Value>(
  options: readonly BapsCollectionOption<Value>[],
  current: number,
  direction: 1 | -1,
): number {
  if (options.length === 0) return -1;

  for (let step = 1; step <= options.length; step += 1) {
    const index =
      (current + direction * step + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

export function findEdgeEnabledIndex<Value>(
  options: readonly BapsCollectionOption<Value>[],
  edge: 'first' | 'last',
): number {
  if (edge === 'first') return options.findIndex((option) => !option.disabled);

  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

export function filterOptions<Value>(
  options: readonly BapsCollectionOption<Value>[],
  query: string,
): readonly BapsCollectionOption<Value>[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return options;
  return options.filter((option) =>
    getOptionText(option).toLocaleLowerCase().includes(normalized),
  );
}
