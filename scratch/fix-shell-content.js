const fs = require('fs');

const cssPath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\layout\\Shell.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Replace the padded shell__content block
const oldBlock = `/* Padded content area */
.shell__content {
  padding: 2rem;
  gap: 1.5rem;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-sampark-surface-ground, #f8f7f7);
  overflow: auto;
}`;

const newBlock = `/* No padding here: the Projects screen is full-bleed — its toolbar spans the
   content width and the table card supplies its own inset. Pages that want a
   gutter add it themselves. */
.shell__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-sampark-surface-ground, #f8f7f7);
  overflow: hidden;
}`;

if (cssContent.includes(oldBlock)) {
  cssContent = cssContent.replace(oldBlock, newBlock);
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log("Successfully removed padding and gap from shell__content!");
} else {
  console.log("Could not find the target block in Shell.css. Maybe already updated?");
}
