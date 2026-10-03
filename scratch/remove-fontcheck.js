const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/main.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("import { FontCheck } from './FontCheck';\n", "");
content = content.replace("<FontCheck />\n    ", "");

fs.writeFileSync(path, content);
console.log('Removed FontCheck');
