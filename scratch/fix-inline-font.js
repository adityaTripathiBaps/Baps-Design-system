const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /fontFamily: 'inherit', fontSize: '0.875rem',/,
  "fontFamily: 'inherit', fontFeatureSettings: 'inherit', fontSize: '0.875rem',"
);

fs.writeFileSync(path, content);
console.log('Fixed inline fontFeatureSettings');
