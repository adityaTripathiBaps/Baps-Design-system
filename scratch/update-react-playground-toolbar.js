const fs = require('fs');

const filePath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\pages\\Projects.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const newHeader = `      <header className="baps-toolbar">
        <div className="baps-toolbar__start">
          <div className="baps-overlaybadge" data-badge="3" data-severity="danger">
            <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary" aria-label="Region">
              <i className="pi pi-globe" aria-hidden="true" />
              <i className="pi pi-chevron-down" style={{ fontSize: '0.65rem' }} aria-hidden="true" />
            </button>
          </div>
          <h1 className="baps-toolbar__title">Robbinsville</h1>
        </div>
        <div className="baps-toolbar__end">
          <input type="text" className="baps-toolbar__search p-inputtext p-component search-input" placeholder="Search" aria-label="Search" />
          <button type="button" className="baps-button baps-sampark baps-button--primary">
            <i className="pi pi-plus" aria-hidden="true" />
            <span className="baps-button__label">Create Project</span>
          </button>
          <div className="baps-overlaybadge" data-badge="3" data-severity="danger">
            <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Filter">
              <i className="pi pi-filter" aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only" aria-label="Sort">
            <i className="pi pi-sort-alt" aria-hidden="true" />
          </button>
        </div>
      </header>`;

const startStr = `<header className="baps-toolbar pj-toolbar">`;
const endStr = `</header>`;
const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newHeader + content.substring(endIndex);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully replaced the toolbar markup!");
} else {
  console.log("Could not find the header to replace.");
}
