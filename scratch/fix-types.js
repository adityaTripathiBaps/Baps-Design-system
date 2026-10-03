const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

const declare = `
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'baps-table': any;
      'baps-table-column-config': any;
      'baps-paginator': any;
      'baps-table-sort-config': any;
    }
  }
}
`;

if (!content.includes('declare global')) {
  content = declare + '\n' + content;
  fs.writeFileSync(path, content);
}
console.log('Fixed JSX types');
