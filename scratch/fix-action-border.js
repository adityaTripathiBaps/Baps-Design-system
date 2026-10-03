const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// -- FIX 1: Action column BODY TD --
// Add the inset left box-shadow + fix padding to match design system (0.5rem 0.75rem)
content = content.replace(
  "position: 'sticky', right: 0, zIndex: 1,\n                      borderBottom: '1px solid var(--table-border, #e1e0e0)',\n                      background: 'inherit', padding: '0.625rem 1rem',",
  "position: 'sticky', right: 0, zIndex: 1,\n                      borderBottom: '1px solid var(--table-border, #e1e0e0)',\n                      borderLeft: 'none',\n                      boxShadow: 'inset 1px 0 0 var(--table-border, #e1e0e0)',\n                      background: 'inherit', padding: '0.5rem 0.75rem',\n                      textAlign: 'right',"
);

// -- FIX 2: Regular cell TD padding --
// Design system: 0.75rem all round for regular cells, 0.625rem 0.75rem for lead (name) cell
content = content.replace(
  "padding: col.key === 'name' ? '0.625rem 1rem' : '1.125rem 1rem',",
  "padding: col.key === 'name' ? '0.625rem 0.75rem' : '0.75rem',"
);

fs.writeFileSync(path, content);
console.log('Fixed action TD border + spacing to match design system');
