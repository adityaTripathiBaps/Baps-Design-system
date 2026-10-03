const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the hardcoded avatar span with the design system class
content = content.replace(
  /<span style=\{\{\s+display: 'inline-flex', alignItems: 'center', justifyContent: 'center',\s+width: '2rem', height: '2rem', borderRadius: '4px', flexShrink: 0,\s+background: 'var\(--color-sampark-mono-10, #f8f7f7\)',\s+color: 'var\(--color-sampark-text-secondary, #9f9c9c\)',\s+\}\}>/,
  '<span className="baps-avatar-html baps-avatar-html--secondary">'
);

fs.writeFileSync(path, content);
console.log('Fixed frozen column avatar spacing/styling');
