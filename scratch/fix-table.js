const fs = require('fs');

const tablePath = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(tablePath, 'utf8');

// The string literal has actual backslash+n characters. We need to replace them with real newlines.
// It also has an extra closing brace that got messed up or is just part of the string.
content = content.replace(/\\n/g, '\n');

fs.writeFileSync(tablePath, content);
console.log('Fixed newlines in Table.tsx');
