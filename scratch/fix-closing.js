const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix baps-table-column-config closing tag
content = content.replace(
  /<\/div>\n\s+<\/Drawer>/,
  '</baps-table-column-config>\n    </Drawer>'
);

// Fix baps-table closing tag
// The old div closed right before the footer.
content = content.replace(
  /<\/div>\n\s+<footer className="pj-footer">/,
  '</baps-table>\n      <footer className="pj-footer">'
);

fs.writeFileSync(path, content);
console.log('Fixed closing tags');
