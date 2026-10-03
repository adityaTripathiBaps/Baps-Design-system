const fs = require('fs');
const path = require('path');
const tablePath = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
const projectsPath = 'd:/baps-projects/react-app-shell-sampark/src/pages/Projects.tsx';

let tableContent = fs.readFileSync(tablePath, 'utf8');

// 1. Remove the filter button from the header
const filterBtnRegex = /\s*\{\/\* Filter icon with badge \*\/\}\s*<button type="button" aria-label="Filters"[\s\S]*?<\/button>/;
tableContent = tableContent.replace(filterBtnRegex, '');

// 2. Add props to Table
tableContent = tableContent.replace(
  'export function Table() {',
  'export interface TableProps {\n  showFilters?: boolean;\n  setShowFilters?: (show: boolean) => void;\n  onFilterCountChange?: (count: number) => void;\n}\n\nexport function Table({ showFilters, setShowFilters, onFilterCountChange }: TableProps = {}) {'
);

// 3. Update showFilters state to use props if provided
tableContent = tableContent.replace(
  'const [showFilters, setShowFilters] = useState(false);',
  'const [internalShowFilters, setInternalShowFilters] = useState(false);\n  const actualShowFilters = showFilters !== undefined ? showFilters : internalShowFilters;\n  const actualSetShowFilters = setShowFilters || setInternalShowFilters;'
);

// 4. Replace usages of showFilters/setShowFilters
tableContent = tableContent.replace(/showFilters/g, (match, offset, string) => {
  // don't replace in the declaration or props
  if (string.substring(offset - 10, offset).includes('actual') || 
      string.substring(offset - 10, offset).includes('internal') ||
      string.substring(offset - 15, offset).includes('TableProps') ||
      string.substring(offset - 15, offset).includes('Table({')) {
    return match;
  }
  return 'actualShowFilters';
});
// Need to carefully replace showFilters and setShowFilters only where they are used.
// It's safer to just do a precise replace for the drawer props:
