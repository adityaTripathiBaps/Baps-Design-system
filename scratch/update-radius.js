const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix toggle switch radius (xs size is 0.1875rem for track, 0.125rem for thumb)
content = content.replace(
  /width: '1\.75rem', height: '1rem', padding: '2px',\s*borderRadius: '9999px'/g,
  "width: '1.75rem', height: '1rem', padding: '2px',\n        borderRadius: '0.1875rem'"
);
content = content.replace(
  /width: '0\.75rem', height: '0\.75rem', borderRadius: '50%'/g,
  "width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem'"
);

// Fix avatar radius (4px)
content = content.replace(
  /width: '2rem', height: '2rem', borderRadius: '50%'/g,
  "width: '2rem', height: '2rem', borderRadius: '4px'"
);
content = content.replace(
  /width: '1\.75rem', height: '1\.75rem', border: 0, borderRadius: '50%'/g,
  "width: '1.75rem', height: '1.75rem', border: 0, borderRadius: '4px'"
);
content = content.replace(
  /minWidth: '1\.25rem', height: '1\.25rem', borderRadius: '9999px'/g,
  "minWidth: '1.25rem', height: '1.25rem', borderRadius: '4px'"
);
content = content.replace(
  /minWidth: '1rem', height: '1rem', borderRadius: '9999px'/g,
  "minWidth: '1rem', height: '1rem', borderRadius: '4px'"
);

fs.writeFileSync(path, content);
console.log('Done modifying radius');
