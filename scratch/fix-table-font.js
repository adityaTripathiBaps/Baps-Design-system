const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace all fontFamily overrides with inherit
content = content.replace(/fontFamily: 'var\(--font-family\)'/g, "fontFamily: 'inherit'");

fs.writeFileSync(path, content);
console.log('Fixed font-family inheritance in Table.tsx');
