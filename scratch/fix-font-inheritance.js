const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/index.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "button,\ninput,\ntextarea,\nselect {\n  font-feature-settings: inherit;\n}",
  "button,\ninput,\ntextarea,\nselect {\n  font-feature-settings: inherit;\n  font-family: inherit;\n}"
);

fs.writeFileSync(path, content);
console.log('Fixed font-family inheritance for forms');
