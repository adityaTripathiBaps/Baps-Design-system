const fs = require('fs');

const tsxPath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\pages\\Projects.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf8');

// 1. Add import
if (!tsxContent.includes('import { Table }')) {
  tsxContent = tsxContent.replace(
    "import { Glyph } from '../components/Glyph';",
    "import { Glyph } from '../components/Glyph';\nimport { Table } from '../components/Table';"
  );
}

// 2. Replace the grid with <Table />
const startGrid = `<div\r\n        style={{\r\n          display: 'grid',\r\n          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',\r\n          gap: '1rem',\r\n        }}`;
const endGrid = `      </div>`;

// Since there are multiple </div>s, we should find the exact block.
// The block ends right before </section>
const sectionEndIdx = tsxContent.lastIndexOf('      </section>');
const gridStartIdx = tsxContent.indexOf('<div\r\n        style={{\r\n          display: \'grid\'');

if (gridStartIdx !== -1 && sectionEndIdx !== -1) {
  const newContent = tsxContent.substring(0, gridStartIdx) + '      <Table />\n' + tsxContent.substring(sectionEndIdx);
  fs.writeFileSync(tsxPath, newContent, 'utf8');
  console.log("Successfully replaced grid with Table component.");
} else {
  // Let's try with \n instead of \r\n
  const gridStartIdx2 = tsxContent.indexOf('<div\n        style={{\n          display: \'grid\'');
  if (gridStartIdx2 !== -1 && sectionEndIdx !== -1) {
    const newContent = tsxContent.substring(0, gridStartIdx2) + '      <Table />\n' + tsxContent.substring(sectionEndIdx);
    fs.writeFileSync(tsxPath, newContent, 'utf8');
    console.log("Successfully replaced grid with Table component (Unix line endings).");
  } else {
    console.log("Could not find grid block to replace.");
  }
}
