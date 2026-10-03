const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<p-accordion className="p-accordion p-component baps-sampark">/g, 
  "<p-accordion ref={(el: HTMLElement | null) => el?.setAttribute('class', 'p-accordion p-component baps-sampark')}>");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed class on p-accordion');
