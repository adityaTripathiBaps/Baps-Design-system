const fs = require('fs');

const tablePath = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(tablePath, 'utf8');

// 1. Remove filter button
content = content.replace(
  /\s*\{\/\* Filter icon with badge \*\/\}\s*<button type="button" aria-label="Filters"[\s\S]*?<\/button>/,
  ''
);

// 2. Add props and onFilterCountChange effect
content = content.replace(
  'export function Table() {',
  'export interface TableProps {\\n  showFilters?: boolean;\\n  setShowFilters?: (show: boolean) => void;\\n  onFilterCountChange?: (count: number) => void;\\n}\\n\\nexport function Table({ showFilters, setShowFilters, onFilterCountChange }: TableProps = {}) {'
);

// 3. Update the state to use actual values and add effect for count
content = content.replace(
  'const [showFilters, setShowFilters] = useState(false);',
  'const [internalShowFilters, setInternalShowFilters] = useState(false);\\n  const actualShowFilters = showFilters !== undefined ? showFilters : internalShowFilters;\\n  const actualSetShowFilters = setShowFilters || setInternalShowFilters;'
);

// 4. Update the FilterDrawer usage
content = content.replace(
  'visible={showFilters}',
  'visible={actualShowFilters}'
);
content = content.replace(
  'onClose={() => setShowFilters(false)}',
  'onClose={() => actualSetShowFilters(false)}'
);

// 5. Add effect to call onFilterCountChange
const effectHook = '\\n  useEffect(() => {\\n    if (onFilterCountChange) {\\n      onFilterCountChange(activeFilterCount);\\n    }\\n  }, [activeFilterCount, onFilterCountChange]);\\n';
content = content.replace(
  /(const activeFilterCount = activeFilters\.length;\n)/,
  '' + effectHook
);

fs.writeFileSync(tablePath, content);
console.log('Table.tsx updated');
