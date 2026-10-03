const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/#9f9c9c/g, "#595656");
content = content.replace(/--color-sampark-text-secondary, #595656/g, "--color-sampark-mono-60, #595656");

fs.writeFileSync(path, content);
console.log('Fixed secondary text color');
