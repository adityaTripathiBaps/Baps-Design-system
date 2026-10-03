const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

// We need to reorder visibleCols and update frozenLeftOffset.

const reorderLogic = `
  // Sort columns so that frozen columns are always at the front, right after locked front columns
  const visibleCols = [...columns].filter(c => c.visible).sort((a, b) => {
    const aOrder = a.locked && !a.end ? 0 : a.frozen ? 1 : a.end ? 3 : 2;
    const bOrder = b.locked && !b.end ? 0 : b.frozen ? 1 : b.end ? 3 : 2;
    if (aOrder !== bOrder) return aOrder - bOrder;
    // preserve original order for same group
    return columns.indexOf(a) - columns.indexOf(b);
  });

  function frozenLeftOffset(colIndex: number): number {
    let left = 0;
    for (let i = 0; i < colIndex; i++) {
      if (visibleCols[i].locked || visibleCols[i].frozen) {
        // extract rem value and convert to px for offset if needed, but returning rem is safer.
        // But since we use COLUMN_WIDTHS...
        const remStr = COLUMN_WIDTHS[visibleCols[i].key] || '10rem';
        const rem = parseFloat(remStr);
        left += rem * 16;
      }
    }
    return left;
  }
`;

content = content.replace(
  /const visibleCols = columns\.filter\(c => c\.visible\);/,
  reorderLogic
);

// We need to remove the old frozenLeftOffset function
content = content.replace(
  /function frozenLeftOffset\(columns: Column\[\], colIndex: number\): number \{\n\s+let left = 0;\n\s+for \(let i = 0; i < colIndex; i\+\+\) \{\n\s+if \(columns\[i\]\.locked \|\| columns\[i\]\.frozen\) \{\n\s+left \+= COLUMN_WIDTH_NUM\[columns\[i\]\.key\] \?\? 160;\n\s+\}\n\s+\}\n\s+return left;\n\s+\}\n/,
  ""
);

// Update calls to frozenLeftOffset
content = content.replace(
  /const colIdx = columns\.indexOf\(col\);\n\s+return \(\n\s+<th key=\{col\.key\}\n\s+className=\{frozen \? 'dt-frozen-left' : ''\}\n\s+style=\{\{\n\s+width: COLUMN_WIDTHS\[col\.key\],\n\s+left: frozen \? frozenLeftOffset\(columns, colIdx\) \+ 'px' : undefined,/g,
  `const colIdx = visibleCols.indexOf(col);
                    return (
                      <th key={col.key}
                          className={frozen ? 'dt-frozen-left' : ''}
                          style={{
                            width: COLUMN_WIDTHS[col.key],
                            left: frozen ? frozenLeftOffset(colIdx) + 'px' : undefined,`
);

content = content.replace(
  /const colIdx = columns\.indexOf\(col\);\n\s+return \(\n\s+<td key=\{col\.key\}\n\s+style=\{\{\n\s+padding: col\.key === 'name' \? '0\.625rem 0\.75rem' : '0\.75rem',\n\s+borderRight: frozen \? 'none' : '1px solid var\(--table-border, #e1e0e0\)',\n\s+boxShadow: frozen \? 'inset -1px 0 0 var\(--table-border, #e1e0e0\)' : 'none',\n\s+borderBottom: '1px solid var\(--table-border, #e1e0e0\)',\n\s+color: 'var\(--table-body-text, #151414\)',\n\s+position: frozen \? 'sticky' : undefined,\n\s+left: frozen \? frozenLeftOffset\(columns, colIdx\) \+ 'px' : undefined,/g,
  `const colIdx = visibleCols.indexOf(col);
                      return (
                        <td key={col.key}
                            style={{
                              padding: col.key === 'name' ? '0.625rem 0.75rem' : '0.75rem',
                              borderRight: frozen ? 'none' : '1px solid var(--table-border, #e1e0e0)',
                                boxShadow: frozen ? 'inset -1px 0 0 var(--table-border, #e1e0e0)' : 'none',
                              borderBottom: '1px solid var(--table-border, #e1e0e0)',
                              color: 'var(--table-body-text, #151414)',
                              position: frozen ? 'sticky' : undefined,
                              left: frozen ? frozenLeftOffset(colIdx) + 'px' : undefined,`
);

fs.writeFileSync(path, content);
console.log('Fixed frozenLeftOffset logic');
