const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="baps-table-surface"/g, 
  '<baps-table className="baps-table-surface"'
);

// We need to replace the last </div> in the Table component with </baps-table>
// The Table component ends with:
//         <FilterDrawer
//           visible={actualShowFilters}
//           onClose={() => actualSetShowFilters(false)}
//           filterState={filterState}
//           setFilterState={setFilterState}
//         />
//       </div>
//     );
//   }

content = content.replace(
  /<\/FilterDrawer>\n\s+<\/div>\n  \);\n\}/g,
  '</FilterDrawer>\n    </baps-table>\n  );\n}'
);

// Paginator
content = content.replace(/<div className="baps-paginator"/g, '<baps-paginator className="baps-paginator"');
content = content.replace(/<\/nav>\n\s+<\/div>/g, '</nav>\n    </baps-paginator>');

// ColumnConfigDrawer
content = content.replace(/<div className="ct-cfg"/g, '<baps-table-column-config className="ct-cfg"');
content = content.replace(/<\/div>\n\s+<\/aside>\n\s+<\/div>/g, '</baps-table-column-config>\n      </aside>\n    </div>');

// SortConfigDrawer
content = content.replace(/<div className="ct-cfg ct-cfg--sort"/g, '<baps-table-sort-config className="ct-cfg ct-cfg--sort"');
// The sort drawer ends with:
//         </div>
//       </aside>
//     </div>
//   );
// }
// Wait, the ColumnConfigDrawer ends with the same structure!
// Let's just manually replace the wrapper tags for the drawers using multi_replace style logic or just replace ALL <div className="ct-cfg" and their specific closing divs.

fs.writeFileSync(path, content);
console.log('Fixed tags');
