const fs = require('fs');

const shellPath = 'd:/baps-projects/react-app-shell-sampark/src/layout/Shell.tsx';
let content = fs.readFileSync(shellPath, 'utf8');

content = content.replace(
  '<Avatar label="JP" />',
  '<Avatar label="JP" shape="square" />'
);

fs.writeFileSync(shellPath, content);
console.log('Shell.tsx updated successfully.');
