const fs = require('fs');
const path = require('path');

// 1. Update index.css
const cssPath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\index.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const toolbarCss = `
/* Replicated Angular Toolbar Styles */
.pj-toolbar {
  padding: var(--space-2, 0.5rem) var(--space-4, 1rem) var(--space-2, 0.5rem) var(--space-6, 1.5rem);
}
.pj-title {
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  flex: none;
  min-width: 0;
}
.pj-title__page {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-sampark-text-primary, #151414);
  line-height: normal;
  margin: 0;
  white-space: nowrap;
}
.pj-title__rule {
  width: 1px;
  height: 1.25rem;
  background: var(--color-sampark-border-default, #e1e0e0);
  flex: none;
}
.pj-title__text {
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-sampark-text-secondary, #595656);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pj-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3, 0.75rem);
  flex: 1 1 auto;
  min-width: 0;
  justify-content: flex-end;
}
.pj-sep {
  flex: none;
  width: 1px;
  height: 1rem;
  background: var(--color-sampark-border-default, #e1e0e0);
}
.pj-search {
  flex: 1 1 auto;
  min-width: 12rem;
  max-width: 34rem;
  position: relative;
}
.pj-search input {
  width: 100%;
  padding-left: 2rem;
}
.pj-search baps-icon {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}
.pj-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sampark-default, 0.25rem);
  color: var(--color-sampark-text-secondary, #595656);
  cursor: pointer;
  transition: background-color 120ms cubic-bezier(0.16, 1, 0.3, 1), color 120ms cubic-bezier(0.16, 1, 0.3, 1);
}
.pj-icon-btn:hover {
  background: var(--color-sampark-secondary-0, #f8f7f7);
  color: var(--color-sampark-text-primary, #151414);
}
.pj-icon-btn--active {
  color: var(--color-sampark-primary-default, #c96868);
}
.pj-icon-btn__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.1875rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1;
  color: var(--color-sampark-text-inverse, #ffffff);
  background: var(--color-sampark-primary-default, #c96868);
  border: 1.5px solid var(--color-sampark-surface-card, #ffffff);
  border-radius: var(--radius-sampark-pill, 100px);
}
`;

if (!cssContent.includes('.pj-toolbar')) {
  fs.writeFileSync(cssPath, cssContent + '\n' + toolbarCss, 'utf8');
}

// 2. Update Projects.tsx
const tsxPath = 'D:\\baps-projects\\react-app-shell-sampark\\src\\pages\\Projects.tsx';
let tsxContent = fs.readFileSync(tsxPath, 'utf8');

const oldHeader = `<header className="baps-toolbar">
        <div className="baps-toolbar__start">
          <h1 className="baps-toolbar__title">Projects</h1>
        </div>
        <div className="baps-toolbar__end">
          <input type="text" className="baps-toolbar__search p-inputtext p-component" placeholder="Search" aria-label="Search" />
          <button type="button" className="baps-button baps-sampark baps-button--secondary">
            <Glyph name="search-2" size={18} />
            <span className="baps-button__label">Search</span>
          </button>
          <button type="button" className="baps-button baps-sampark baps-button--primary">
            <Glyph name="plus" size={18} />
            <span className="baps-button__label">Create project</span>
          </button>
          <button
            type="button"
            className="baps-button baps-sampark baps-button--primary baps-button--icon-only"
            aria-label="Settings"
          >
            <Glyph name="settings" size={18} />
          </button>
        </div>
      </header>`;

const newHeader = `<header className="baps-toolbar pj-toolbar">
        <div className="baps-toolbar__start pj-title">
          <h1 className="pj-title__page">Projects</h1>
          <span className="pj-title__rule" aria-hidden="true"></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Glyph name="global" size={16} />
            <Glyph name="angle-down" size={12} />
          </div>
          <h1 className="pj-title__text">All Regions</h1>
        </div>
        <div className="baps-toolbar__end pj-actions">
          <div className="pj-search">
            <baps-icon><Glyph name="search-2" size={16} /></baps-icon>
            <input
              type="search"
              className="p-inputtext p-component"
              placeholder="Search"
              aria-label="Search projects"
            />
          </div>
          <span className="pj-sep" aria-hidden="true"></span>
          <button type="button" className="baps-button baps-sampark baps-button--primary baps-button--s">
            <Glyph name="plus" size={16} />
            <span className="baps-button__label">Create Project</span>
          </button>
          <span className="pj-sep" aria-hidden="true"></span>
          <button type="button" className="pj-icon-btn pj-icon-btn--active" title="Filters" aria-label="Filters">
            <Glyph name="filter" size={16} />
            <span className="pj-icon-btn__badge">2</span>
          </button>
          <span className="pj-sep" aria-hidden="true"></span>
          <button type="button" className="pj-icon-btn" title="Sort" aria-label="Sort">
            <Glyph name="sort-list" size={16} />
          </button>
        </div>
      </header>`;

tsxContent = tsxContent.replace(oldHeader, newHeader);
fs.writeFileSync(tsxPath, tsxContent, 'utf8');

console.log("Updated projects page and css!");
