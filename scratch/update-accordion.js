const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Replace AccordionPanel
const panelRegex = /function AccordionPanel\([\s\S]*?\}\) \{[\s\S]*?return \([\s\S]*?    \);\n  \}/;

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
  }`;

content = content.replace(panelRegex, newPanel);

// 2. Wrap FilterDrawer children in p-accordion
const filterDrawerReturnRegex = /<Drawer visible=\{visible\} onClose=\{onClose\} header="Filters" actions=\{actions\}>\s*(<AccordionPanel[\s\S]*?)<\/Drawer>/;

const newFilterDrawerReturn = `<Drawer visible={visible} onClose={onClose} header="Filters" actions={actions}>
        <p-accordion class="p-accordion p-component baps-sampark">
          $1
        </p-accordion>
      </Drawer>`;

content = content.replace(filterDrawerReturnRegex, newFilterDrawerReturn);

// Also need to fix the JSX tag to use standard lowercase string for custom element, but React handles web components fine.
// But we need to use `className` instead of `class` in JSX!
content = content.replace(/<p-accordion class=/g, '<p-accordion className=');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
