const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/index.css';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /html \{\n\s+font-size: 16px;\n\s+font-family: var\(--font-family\);\n\s+font-feature-settings: var\(--font-feature-settings\);\n\}/,
  "html {\n  font-size: 16px;\n}\n\nbody {\n  margin: 0;\n  background: var(--color-sampark-mono-0);\n  color: var(--color-sampark-mono-100);\n  font-family: var(--font-family);\n  font-feature-settings: var(--font-feature-settings);\n}"
);

// Remove the old body rule
content = content.replace(
  /body \{\n\s+margin: 0;\n\s+background: var\(--color-sampark-mono-0\);\n\s+color: var\(--color-sampark-mono-100\);\n\}/g,
  ""
);

fs.writeFileSync(path, content);
console.log('Fixed font-family on body');
