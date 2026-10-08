// Explicit rather than `export *` so the helper this module also exports stays
// OUT of the package's public API. It exists for the component and for tests,
// which import it from the component file directly — exporting it here would
// make an internal a supported surface.
export { BapsTreeTable } from './tree-table.js';
export type {
  BapsTreeTableBrand,
  BapsTreeTableNode,
  BapsTreeTableColumn,
  BapsTreeTableRow,
  BapsTreeTableProps,
} from './tree-table.js';
