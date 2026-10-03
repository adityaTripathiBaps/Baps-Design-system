const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

const startIndex = content.indexOf('function AccordionPanel');
const endIndex = content.indexOf('function FilterDrawer');
if (startIndex !== -1 && endIndex !== -1) {
  const newPanel = `function AccordionPanel({ label, count, open, onToggle, children }: {
    label: string; count?: number; open: boolean;
    onToggle: () => void; children: React.ReactNode;
  }) {
    return (
      <div className="p-accordionpanel" data-p-active={open ? 'true' : 'false'}>
        <div className="p-accordionheader" onClick={onToggle} style={{ cursor: 'pointer' }} role="button" aria-expanded={open}>
          {(count !== undefined && count !== null && count > 0) ? (
            <span className="baps-accordion-count" aria-hidden="true">{count}</span>
          ) : null}
          <span className="baps-accordion-label">{label}</span>
          {/* Note: In React app we don't have clearable wired up yet, skipping clear button for simplicity */}
          <i className={\`p-icon pi \${open ? 'pi-chevron-down' : 'pi-chevron-right'}\`} aria-hidden="true"></i>
        </div>
        {open && (
          <div className="p-accordioncontent" data-p-active="true">
            <div className="p-accordioncontent-content">
              <div className="baps-accordion-body">
                <span className="baps-accordion-divider"></span>
                {children}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  `;
  content = content.substring(0, startIndex) + newPanel + content.substring(endIndex);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully replaced AccordionPanel');
} else {
  console.log('Could not find boundaries for AccordionPanel');
}
