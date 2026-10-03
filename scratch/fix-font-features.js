const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/index.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /button,\ninput,\ntextarea,\nselect \{/,
  "button,\ninput,\ntextarea,\nselect,\ntable,\nth,\ntd {"
);

fs.writeFileSync(path, content);
console.log('Fixed font-feature-settings inheritance');
