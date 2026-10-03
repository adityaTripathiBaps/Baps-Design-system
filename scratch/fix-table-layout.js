const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace static minWidth with dynamic minWidth and add tableLayout: 'fixed'
content = content.replace(
  /<table role="table" style=\{\{\n\s+minWidth: '102rem', borderCollapse: 'separate', borderSpacing: 0, width: '100%',/g,
  `<table role="table" style={{
              tableLayout: 'fixed',
              minWidth: visibleCols.reduce((sum, c) => sum + parseFloat(COLUMN_WIDTHS[c.key] || '10'), 0) + 'rem',
              borderCollapse: 'separate', borderSpacing: 0, width: '100%',`
);

fs.writeFileSync(path, content);
console.log('Fixed tableLayout and minWidth');
