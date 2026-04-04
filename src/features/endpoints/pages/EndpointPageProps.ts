import type { ColDef } from "ag-grid-community";
import type { Theme } from "ag-grid-community";
import type { DbDefinition, GridRow, RowIssue } from "../../../shared/midas";

export interface EndpointPageProps {
  definition: DbDefinition;
  rows: GridRow[];
  issues: RowIssue[];
  isBusy: boolean;
  appTheme: Theme;
  columnDefs: ColDef<GridRow>[];
  defaultColDef: ColDef<GridRow>;
  rowClassRules: Record<string, (params: { data?: GridRow }) => boolean>;
  setRows: (rows: GridRow[]) => void;
  clearSelectedCells: (cellPositions: Array<{ rowId: string; fieldKey: string }>) => void;
  setSelectedRowIds: (rowIds: string[]) => void;
  addRow: () => void;
  deleteSelectedRows: () => void;
  loadCurrentData: () => Promise<void>;
  submit: (method: "POST" | "PUT") => Promise<void>;
}
