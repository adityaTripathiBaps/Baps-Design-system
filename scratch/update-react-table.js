const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the entire drawer header and aside tag
const asideRegex = /<aside[\s\S]*?className="p-drawer p-component p-drawer-right baps-drawer-sampark baps-ds-sampark"[\s\S]*?role="dialog"[^>]*>[\s\S]*?<\/aside>/g;

const newAside = `<aside
            className="p-drawer p-component p-drawer-right baps-drawer-sampark baps-ds-sampark"
            role="dialog" aria-modal="true" aria-label={header}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
              display: 'flex', flexDirection: 'column', gap: '1.5rem',
              fontFamily: 'inherit',
              width: '420px',
              padding: '2rem 1.5rem',
              boxSizing: 'border-box',
              background: 'var(--color-sampark-mono-0, #ffffff)'
            }}>
            {/* Header */}
            <div className="p-drawer-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
              <h2 className="p-drawer-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-sampark-text-primary, #151414)' }}>{header}</h2>
              <div className="baps-drawer__actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {actions}
              </div>
              <div className="baps-drawer__close" style={{ order: 3 }}>
                <button
                  type="button"
                  className="baps-button baps-sampark baps-button--text baps-button--medium p-button p-component p-button-icon-only"
                  onClick={onClose}
                  aria-label="Close"
                  style={{ width: '32px', height: '32px' }}>
                  <span className="p-button-icon pi pi-times" aria-hidden="true" style={{ fontSize: '1rem' }} />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-drawer-content" style={{ flex: '1 1 auto', overflowY: 'auto', padding: 0 }}>
              {children}
            </div>
          </aside>`;

content = content.replace(asideRegex, newAside);

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
