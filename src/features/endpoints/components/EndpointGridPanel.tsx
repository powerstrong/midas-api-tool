import { useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { GridApi, GridReadyEvent, ProcessDataFromClipboardParams, RowSelectedEvent } from "ag-grid-community";
import type { GridRow } from "../../../shared/midas";
import type { EndpointPageProps } from "../pages/EndpointPageProps";

const trimClipboardData = (data: string[][]) => {
  const next = [...data];
  while (next.length > 0 && next[next.length - 1].every((value) => value.trim() === "")) {
    next.pop();
  }
  return next;
};

export const EndpointGridPanel = ({
  rows,
  isBusy,
  appTheme,
  columnDefs,
  defaultColDef,
  rowClassRules,
  setRows,
  ensureRowsForPaste,
  clearSelectedCells,
  setSelectedRowIds,
  addRow,
  deleteSelectedRows,
  loadCurrentData,
  submit
}: EndpointPageProps) => {
  const gridApiRef = useRef<GridApi<GridRow>>();

  const handleGridReady = (event: GridReadyEvent<GridRow>) => {
    gridApiRef.current = event.api;
  };

  const syncRowsFromGrid = () => {
    const nextRows: GridRow[] = [];
    gridApiRef.current?.forEachNode((node) => {
      if (node.data) {
        nextRows.push(node.data);
      }
    });
    setRows(nextRows);
  };

  const handleSelectionChanged = () => {
    const ids =
      gridApiRef.current
        ?.getSelectedRows()
        .map((row) => row.__rowId ?? "")
        .filter(Boolean) ?? [];

    setSelectedRowIds(ids);
  };

  const clearRangeSelection = () => {
    const ranges = gridApiRef.current?.getCellRanges() ?? [];
    const positions: Array<{ rowId: string; fieldKey: string }> = [];

    for (const range of ranges) {
      const start = Math.min(range.startRow?.rowIndex ?? 0, range.endRow?.rowIndex ?? 0);
      const end = Math.max(range.startRow?.rowIndex ?? 0, range.endRow?.rowIndex ?? 0);

      for (let rowIndex = start; rowIndex <= end; rowIndex += 1) {
        const rowNode = gridApiRef.current?.getDisplayedRowAtIndex(rowIndex);
        const rowId = rowNode?.data?.__rowId;
        if (!rowId) {
          continue;
        }

        for (const column of range.columns) {
          const fieldKey = column.getColId();
          if (fieldKey === "__rowId") {
            continue;
          }
          positions.push({ rowId, fieldKey });
        }
      }
    }

    if (positions.length > 0) {
      clearSelectedCells(positions);
    }
  };

  const handleProcessDataFromClipboard = (params: ProcessDataFromClipboardParams<GridRow>) => {
    const clipboardData = trimClipboardData(params.data);
    const focusedCell = gridApiRef.current?.getFocusedCell();
    const startRowIndex = focusedCell?.rowIndex ?? 0;

    if (clipboardData.length > 1) {
      ensureRowsForPaste(startRowIndex, clipboardData.length);
    }

    return clipboardData;
  };

  return (
    <div className="grid-panel card">
      <div className="grid-actions">
        <button onClick={addRow}>행 추가</button>
        <button onClick={deleteSelectedRows}>행 삭제</button>
        <button onClick={clearRangeSelection}>선택 영역 초기화</button>
        <button onClick={() => void loadCurrentData()} disabled={isBusy}>
          현재 데이터 불러오기 (GET)
        </button>
        <button onClick={() => void submit("POST")} disabled={isBusy}>
          입력 실행 (POST)
        </button>
        <button onClick={() => void submit("PUT")} disabled={isBusy}>
          전체 반영 (PUT)
        </button>
      </div>

      <div className="ag-wrap">
        <AgGridReact<GridRow>
          theme={appTheme}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={{ mode: "multiRow" }}
          cellSelection={true}
          processDataFromClipboard={handleProcessDataFromClipboard}
          stopEditingWhenCellsLoseFocus={true}
          getRowId={(params) => params.data.__rowId ?? params.data.KEY}
          rowClassRules={rowClassRules}
          onGridReady={handleGridReady}
          onCellValueChanged={syncRowsFromGrid}
          onRowSelected={(event: RowSelectedEvent<GridRow>) => {
            if (event.source) {
              handleSelectionChanged();
            }
          }}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
};
