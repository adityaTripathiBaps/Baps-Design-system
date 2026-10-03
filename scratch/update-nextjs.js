const fs = require('fs');

const path = 'D:\\baps-projects\\nextjs-app-shell-mybky\\src\\app\\projects\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the top h1 with the baps-toolbar
const oldTop = `<h1 style={{ margin: 0, fontSize: '1.5rem' }}>Projects</h1>`;
const newTop = `<header className="baps-toolbar">
        <div className="baps-toolbar__start">
          <h1 className="baps-toolbar__title">Projects</h1>
        </div>
        <div className="baps-toolbar__end">
          <input type="text" className="baps-toolbar__search p-inputtext p-component" placeholder="Search" aria-label="Search" />
          <button type="button" className="baps-button baps-button--secondary">
            <span className="baps-button__label">Search</span>
          </button>
          <button type="button" className="baps-button baps-button--primary">
            <span className="baps-button__label">Create project</span>
          </button>
          <button type="button" className="baps-button baps-button--danger">
            <span className="baps-button__label">Archive</span>
          </button>
        </div>
      </header>`;

content = content.replace(oldTop, newTop);

// Remove the bottom div containing the old buttons
const oldBottom = `      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button type="button" className="baps-button baps-button--primary">
          <span className="baps-button__label">Create project</span>
        </button>
        <button type="button" className="baps-button baps-button--secondary">
          <span className="baps-button__label">Search</span>
        </button>
        <button type="button" className="baps-button baps-button--danger">
          <span className="baps-button__label">Archive</span>
        </button>
      </div>`;

content = content.replace(oldBottom, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Projects nextjs updated successfully');
