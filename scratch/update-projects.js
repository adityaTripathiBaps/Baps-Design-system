const fs = require('fs');
const projectsPath = 'd:/baps-projects/react-app-shell-sampark/src/pages/Projects.tsx';
let content = fs.readFileSync(projectsPath, 'utf8');

// 1. Add state variables
content = content.replace(
  'const [dismissed, setDismissed] = useState(false);',
  'const [dismissed, setDismissed] = useState(false);\n  const [showFilters, setShowFilters] = useState(false);\n  const [filterCount, setFilterCount] = useState(0);'
);

// 2. Update the toolbar filter button
content = content.replace(
  /<div className="baps-overlaybadge" data-badge="3" data-severity="danger">\s*<button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Filter">/,
  '<div className="baps-overlaybadge" {...(filterCount > 0 ? { "data-badge": filterCount } : {})} data-severity="danger">\n            <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Filter" onClick={() => setShowFilters(true)}>'
);

// 3. Update the Table component render
content = content.replace(
  '<Table />',
  '<Table showFilters={showFilters} setShowFilters={setShowFilters} onFilterCountChange={setFilterCount} />'
);

fs.writeFileSync(projectsPath, content);
console.log('Projects.tsx updated successfully.');
