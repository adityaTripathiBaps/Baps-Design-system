const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert state for drag-and-drop
const stateStr = "const [showActiveOnly, setShowActiveOnly] = useState(false);";
const dragStateStr = stateStr + "\n    const [draggedKey, setDraggedKey] = useState<string | null>(null);";
content = content.replace(stateStr, dragStateStr);

// Insert handleDrop function
const handleDropFunc = `
    const handleDrop = (sourceKey: string, targetKey: string) => {
      setDraft(prev => {
        const next = [...prev];
        const srcIdx = next.findIndex(c => c.key === sourceKey);
        const tgtIdx = next.findIndex(c => c.key === targetKey);
        if (srcIdx === -1 || tgtIdx === -1 || next[tgtIdx].locked) return prev;
        const [moved] = next.splice(srcIdx, 1);
        next.splice(tgtIdx, 0, moved);
        return next;
      });
    };
`;
content = content.replace(
  "const moveItem = (col: Column, dir: -1 | 1) => {",
  handleDropFunc + "\n    const moveItem = (col: Column, dir: -1 | 1) => {"
);

// Update the regular item div to support dragging
const regularItemDiv = `
                  <div className="ct-cfg-item" style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--color-sampark-border-default, #e1e0e0)',
                    cursor: 'move',
                    opacity: draggedKey === col.key ? 0.5 : 1,
                  }}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDraggedKey(col.key); }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={(e) => { e.preventDefault(); if (draggedKey && draggedKey !== col.key) handleDrop(draggedKey, col.key); setDraggedKey(null); }}
                  onDragEnd={() => setDraggedKey(null)}>
`;

content = content.replace(
  /<div className="ct-cfg-item" style=\{\{[\s\S]*?cursor: 'move',[\s\S]*?\}\}>/,
  regularItemDiv.trim()
);

fs.writeFileSync(path, content);
console.log('Drag feature implemented');
