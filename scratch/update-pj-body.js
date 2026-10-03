const fs = require('fs');

// 1. Update index.css
const cssPath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\index.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const bodyCss = `
.pj-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 0.5rem);
  padding: var(--space-2, 0.5rem);
  background: var(--color-sampark-surface-ground, #f8f7f7);
}
`;

if (!cssContent.includes('.pj-body')) {
  fs.writeFileSync(cssPath, cssContent + '\n' + bodyCss, 'utf8');
}

// 2. Update Projects.tsx
const tsxPath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\pages\\Projects.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf8');

// Replace the <baps-alert> and <div display="grid"> block with <section className="pj-body">
const startAlert = `      {!dismissed && (`;
const endGrid = `      </div>\r\n\r\n\r\n    </>`;

// The file has:
//       {!dismissed && (
// ...
//       </div>
//
//
//     </>

// Let's replace by wrapping
const startIdx = tsxContent.indexOf(startAlert);
const endIdx = tsxContent.indexOf(`    </>`, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const contentToWrap = tsxContent.substring(startIdx, endIdx);
  const wrapped = `      <section className="pj-body">\n` + contentToWrap + `      </section>\n`;
  tsxContent = tsxContent.substring(0, startIdx) + wrapped + tsxContent.substring(endIdx);
  fs.writeFileSync(tsxPath, tsxContent, 'utf8');
  console.log("Successfully wrapped in pj-body!");
} else {
  console.log("Could not find the content to wrap.");
}
