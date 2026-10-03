const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the padding for the frozen right column (actions)
content = content.replace(
  /background: 'inherit', padding: '0\.625rem 1rem',/,
  "background: 'inherit', padding: '0.5rem 0.75rem', textAlign: 'right',"
);

// Also remove the inline flex positioning that forces them left if text-align is supposed to align them right
content = content.replace(
  /<div style=\{\{\s+display: 'flex', alignItems: 'center', gap: '0.25rem'\s+\}\}>/,
  "<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>"
);

fs.writeFileSync(path, content);
console.log('Fixed frozen right column padding and alignment');
