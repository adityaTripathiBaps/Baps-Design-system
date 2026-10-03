const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add box-shadow to action column header
content = content.replace(
  /position: 'sticky', right: 0, zIndex: 3,\s+borderBottom: '1px solid var\(--table-border, #e1e0e0\)',/,
  "position: 'sticky', right: 0, zIndex: 3,\n                      borderBottom: '1px solid var(--table-border, #e1e0e0)',\n                      boxShadow: 'inset 1px 0 0 var(--table-border, #e1e0e0)',\n                      borderLeft: 'none',"
);

// Add box-shadow to action column cell
content = content.replace(
  /position: 'sticky', right: 0, zIndex: 1,\s+borderBottom: '1px solid var\(--table-border, #e1e0e0\)',/,
  "position: 'sticky', right: 0, zIndex: 1,\n                      borderBottom: '1px solid var(--table-border, #e1e0e0)',\n                      boxShadow: 'inset 1px 0 0 var(--table-border, #e1e0e0)',\n                      borderLeft: 'none',"
);

fs.writeFileSync(path, content);
console.log('Fixed right frozen column borders');
