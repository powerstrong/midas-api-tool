import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type MouseEvent as ReactMouseEvent
} from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  CellClickedEvent,
  CellFocusedEvent,
  CellKeyDownEvent,
  CellMouseDownEvent,
  CellMouseOverEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  ProcessDataFromClipboardParams,
  RowSelectedEvent
} from "ag-grid-community";
import { createBlankRow } from "../../../lib/transformers";
import type { GridRow } from "../../../shared/midas";
import type { EndpointPageProps } from "../pages/EndpointPageProps";

const trimClipboardData = (data: string[][]) => {
  const next = [...data];
  while (next.length > 0 && next[next.length - 1].every((value) => value.trim() === "")) {
    next.pop();
  }
  return next;
};

const normalizeClipboardValue = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "");

const isDirectInputKey = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
    return false;
  }

  return event.key.length === 1;
};

const isArrowKey = (key: string) =>
  key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight";

const getNextKeySeed = (rows: GridRow[]) => {
  const numericKeys = rows
    .map((row) => Number(row.KEY))
    .filter((value) => Number.isInteger(value) && value > 0);

  return (numericKeys.length > 0 ? Math.max(...numericKeys) : 0) + 1;
};

interface GridCellRef {
  rowIndex: number;
  columnId: string;
}

interface GridSelectionRange {
  startRowIndex: number;
  endRowIndex: number;
  startColumnIndex: number;
  endColumnIndex: number;
}

interface HoveredRowDeleteState {
  rowIndex: number;
  rowId: string;
  top: number;
  height: number;
  left: number | null;
}

const ADD_ROW_KEY = "__add_row__";
const ADD_ROW_LABEL = "+ 행 추가";

export const EndpointGridPanel = ({
  definition,
  rows,
  issues,
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
  submit,
  deleteSelectedOnServer
}: EndpointPageProps) => {
  const gridApiRef = useRef<GridApi<GridRow>>();
  const gridWrapRef = useRef<HTMLDivElement | null>(null);
  const selectionAnchorRef = useRef<GridCellRef | null>(null);
  const copyFlashTimeoutRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const [focusedCell, setFocusedCell] = useState<GridCellRef | null>(null);
  const [selectedRange, setSelectedRange] = useState<GridSelectionRange | null>(null);
  const [isCopyFlashing, setIsCopyFlashing] = useState(false);
  const [pasteSummary, setPasteSummary] = useState<{
    rowCount: number;
    columnCount: number;
    skippedHeader: boolean;
  } | null>(null);
  const [hoveredRowDelete, setHoveredRowDelete] = useState<HoveredRowDeleteState | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      if (copyFlashTimeoutRef.current) {
        window.clearTimeout(copyFlashTimeoutRef.current);
      }
    };
  }, []);

  const visibleColumnIds = useMemo(
    () => columnDefs.map((columnDef) => String(columnDef.field ?? "")).filter(Boolean),
    [columnDefs]
  );

  const pinnedBottomRowData = useMemo<GridRow[]>(
    () => [{ KEY: ADD_ROW_KEY, __rowId: ADD_ROW_KEY } as GridRow],
    []
  );

  const triggerCopyFlash = () => {
    if (copyFlashTimeoutRef.current) {
      window.clearTimeout(copyFlashTimeoutRef.current);
    }

    setIsCopyFlashing(true);
    copyFlashTimeoutRef.current = window.setTimeout(() => {
      setIsCopyFlashing(false);
      copyFlashTimeoutRef.current = null;
    }, 260);
  };

  const buildRange = (start: GridCellRef, end: GridCellRef) => {
    const startColumnIndex = visibleColumnIds.indexOf(start.columnId);
    const endColumnIndex = visibleColumnIds.indexOf(end.columnId);

    if (startColumnIndex < 0 || endColumnIndex < 0) {
      return null;
    }

    return {
      startRowIndex: Math.min(start.rowIndex, end.rowIndex),
      endRowIndex: Math.max(start.rowIndex, end.rowIndex),
      startColumnIndex: Math.min(startColumnIndex, endColumnIndex),
      endColumnIndex: Math.max(startColumnIndex, endColumnIndex)
    } satisfies GridSelectionRange;
  };

  const applySingleSelection = (cell: GridCellRef) => {
    selectionAnchorRef.current = cell;
    setFocusedCell(cell);
    setSelectedRange(buildRange(cell, cell));
  };

  const applyRangeSelection = (anchor: GridCellRef, target: GridCellRef) => {
    selectionAnchorRef.current = anchor;
    setFocusedCell(target);
    setSelectedRange(buildRange(anchor, target));
  };

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

  const getSelectedCellPositions = () => {
    if (!selectedRange) {
      return [] as Array<{ rowId: string; fieldKey: string }>;
    }

    const positions: Array<{ rowId: string; fieldKey: string }> = [];
    for (let rowIndex = selectedRange.startRowIndex; rowIndex <= selectedRange.endRowIndex; rowIndex += 1) {
      const rowNode = gridApiRef.current?.getDisplayedRowAtIndex(rowIndex);
      const rowId = rowNode?.data?.__rowId;
      if (!rowId) {
        continue;
      }

      for (
        let columnIndex = selectedRange.startColumnIndex;
        columnIndex <= selectedRange.endColumnIndex;
        columnIndex += 1
      ) {
        const fieldKey = visibleColumnIds[columnIndex];
        if (fieldKey && fieldKey !== "__rowId") {
          positions.push({ rowId, fieldKey });
        }
      }
    }

    return positions;
  };

  const clearRangeSelection = () => {
    const positions = getSelectedCellPositions();
    if (positions.length > 0) {
      clearSelectedCells(positions);
    }
  };

  const getSelectedRowIdsFromRange = () => {
    if (!selectedRange) {
      return [] as string[];
    }

    const rowIds: string[] = [];
    for (let rowIndex = selectedRange.startRowIndex; rowIndex <= selectedRange.endRowIndex; rowIndex += 1) {
      const rowNode = gridApiRef.current?.getDisplayedRowAtIndex(rowIndex);
      const rowId = rowNode?.data?.__rowId;
      if (rowId) {
        rowIds.push(rowId);
      }
    }

    return rowIds;
  };

  const updateHoveredRowDelete = (rowIndex: number, rowId: string, target: EventTarget | null) => {
    if (!gridWrapRef.current || !rowId || !(target instanceof Element)) {
      return;
    }

    const rowElement = target.closest(".ag-row");
    if (!(rowElement instanceof HTMLElement)) {
      return;
    }

    const wrapRect = gridWrapRef.current.getBoundingClientRect();
    const viewportElement = gridWrapRef.current.querySelector(".ag-center-cols-viewport");
    const containerElement = gridWrapRef.current.querySelector(".ag-center-cols-container");
    const viewportRect = viewportElement instanceof HTMLElement ? viewportElement.getBoundingClientRect() : wrapRect;
    const containerRect = containerElement instanceof HTMLElement ? containerElement.getBoundingClientRect() : viewportRect;
    let top = rowElement.getBoundingClientRect().top - wrapRect.top;
    let height = rowElement.getBoundingClientRect().height;

    if (selectedRange && rowIndex >= selectedRange.startRowIndex && rowIndex <= selectedRange.endRowIndex) {
      const startRowElement = gridWrapRef.current.querySelector(`.ag-row[row-index="${selectedRange.startRowIndex}"]`);
      const endRowElement = gridWrapRef.current.querySelector(`.ag-row[row-index="${selectedRange.endRowIndex}"]`);

      if (startRowElement instanceof HTMLElement && endRowElement instanceof HTMLElement) {
        const startRect = startRowElement.getBoundingClientRect();
        const endRect = endRowElement.getBoundingClientRect();
        top = startRect.top - wrapRect.top;
        height = endRect.bottom - startRect.top;
      }
    }

    const actionWidth = 42;
    const inset = 4;
    const hasHorizontalOverflow = containerRect.right > viewportRect.right + 1;
    const left = hasHorizontalOverflow
      ? null
      : containerRect.right - wrapRect.left + inset;

    setHoveredRowDelete({
      rowIndex,
      rowId,
      top,
      height,
      left
    });
  };

  useEffect(() => {
    if (!hoveredRowDelete || !gridWrapRef.current) {
      return;
    }

    const rowElement = gridWrapRef.current.querySelector(`.ag-row[row-index="${hoveredRowDelete.rowIndex}"]`);
    if (!(rowElement instanceof HTMLElement)) {
      setHoveredRowDelete(null);
      return;
    }

    updateHoveredRowDelete(hoveredRowDelete.rowIndex, hoveredRowDelete.rowId, rowElement);
  }, [selectedRange, rows.length]);

  const handleDeleteRows = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!hoveredRowDelete) {
      return;
    }

    const selectedRowIds =
      selectedRange &&
      hoveredRowDelete.rowIndex >= selectedRange.startRowIndex &&
      hoveredRowDelete.rowIndex <= selectedRange.endRowIndex
        ? getSelectedRowIdsFromRange()
        : [hoveredRowDelete.rowId];

    if (selectedRowIds.length === 0) {
      return;
    }

    setSelectedRowIds(Array.from(new Set(selectedRowIds)));
    setTimeout(() => deleteSelectedRows(), 0);
    setHoveredRowDelete(null);
  };


  const handleDeleteSelectedOnServer = () => {
    const rowIds = Array.from(new Set(getSelectedRowIdsFromRange()));
    if (rowIds.length === 0) {
      return;
    }

    setSelectedRowIds(rowIds);
    setTimeout(() => {
      void deleteSelectedOnServer();
    }, 0);
  };

  const detectHeaderRow = (data: string[][]) => {
    const firstRow = data[0];
    if (!focusedCell || !firstRow || firstRow.length === 0) {
      return false;
    }

    const startColumnIndex = visibleColumnIds.indexOf(focusedCell.columnId);
    if (startColumnIndex < 0) {
      return false;
    }

    const expectedColumnDefs = columnDefs.slice(startColumnIndex, startColumnIndex + firstRow.length);
    if (expectedColumnDefs.length !== firstRow.length) {
      return false;
    }

    return firstRow.every((value, index) => {
      const columnDef = expectedColumnDefs[index];
      const normalizedValue = normalizeClipboardValue(value);
      const headerName = normalizeClipboardValue(String(columnDef.headerName ?? ""));
      const fieldKey = normalizeClipboardValue(String(columnDef.field ?? ""));
      return normalizedValue.length > 0 && (normalizedValue === headerName || normalizedValue === fieldKey);
    });
  };

  const applyClipboardData = (rawData: string[][]) => {
    if (!focusedCell) {
      return [] as string[][];
    }

    let clipboardData = trimClipboardData(rawData);
    const skippedHeader = detectHeaderRow(clipboardData);
    if (skippedHeader) {
      clipboardData = clipboardData.slice(1);
    }

    if (clipboardData.length === 0) {
      setPasteSummary(null);
      return clipboardData;
    }

    const startRowIndex = focusedCell.rowIndex;
    const startColumnIndex = visibleColumnIds.indexOf(focusedCell.columnId);
    if (startColumnIndex < 0) {
      return clipboardData;
    }

    ensureRowsForPaste(startRowIndex, clipboardData.length);

    const requiredRowCount = startRowIndex + clipboardData.length;
    const nextRows = [...rows];
    if (requiredRowCount > nextRows.length) {
      const nextSeed = getNextKeySeed(nextRows);
      const rowsToAdd = requiredRowCount - nextRows.length;
      for (let index = 0; index < rowsToAdd; index += 1) {
        nextRows.push(createBlankRow(definition.endpoint, nextSeed + index));
      }
    }

    const patchedRows = nextRows.map((row) => ({ ...row }));
    clipboardData.forEach((clipboardRow, rowOffset) => {
      const targetRow = patchedRows[startRowIndex + rowOffset];
      if (!targetRow) {
        return;
      }

      clipboardRow.forEach((value, columnOffset) => {
        const fieldKey = visibleColumnIds[startColumnIndex + columnOffset];
        if (fieldKey) {
          targetRow[fieldKey] = value;
        }
      });
    });

    setRows(patchedRows);
    setPasteSummary({
      rowCount: clipboardData.length,
      columnCount: Math.max(...clipboardData.map((row) => row.length), 0),
      skippedHeader
    });

    const endCell = {
      rowIndex: startRowIndex + clipboardData.length - 1,
      columnId:
        visibleColumnIds[
          Math.min(
            visibleColumnIds.length - 1,
            startColumnIndex + Math.max(...clipboardData.map((row) => row.length), 1) - 1
          )
        ]
    } satisfies GridCellRef;
    setSelectedRange(buildRange(focusedCell, endCell));

    return clipboardData;
  };

  const handleProcessDataFromClipboard = (params: ProcessDataFromClipboardParams<GridRow>) => {
    return applyClipboardData(params.data);
  };

  const serializeSelection = () => {
    if (!selectedRange) {
      return "";
    }

    const lines: string[] = [];
    for (let rowIndex = selectedRange.startRowIndex; rowIndex <= selectedRange.endRowIndex; rowIndex += 1) {
      const rowNode = gridApiRef.current?.getDisplayedRowAtIndex(rowIndex);
      const values: string[] = [];
      for (
        let columnIndex = selectedRange.startColumnIndex;
        columnIndex <= selectedRange.endColumnIndex;
        columnIndex += 1
      ) {
        const fieldKey = visibleColumnIds[columnIndex];
        values.push(String(rowNode?.data?.[fieldKey] ?? ""));
      }
      lines.push(values.join("\t"));
    }
    return lines.join("\n");
  };

  const moveCell = (current: GridCellRef, key: string) => {
    const currentColumnIndex = visibleColumnIds.indexOf(current.columnId);
    if (currentColumnIndex < 0) {
      return current;
    }

    let nextRowIndex = current.rowIndex;
    let nextColumnIndex = currentColumnIndex;
    const maxRowIndex = Math.max(rows.length - 1, 0);

    if (key === "ArrowUp") {
      nextRowIndex = Math.max(0, current.rowIndex - 1);
    } else if (key === "ArrowDown") {
      nextRowIndex = Math.min(maxRowIndex, current.rowIndex + 1);
    } else if (key === "ArrowLeft") {
      nextColumnIndex = Math.max(0, currentColumnIndex - 1);
    } else if (key === "ArrowRight") {
      nextColumnIndex = Math.min(visibleColumnIds.length - 1, currentColumnIndex + 1);
    }

    return {
      rowIndex: nextRowIndex,
      columnId: visibleColumnIds[nextColumnIndex]
    } satisfies GridCellRef;
  };

  const focusGridCell = (cell: GridCellRef) => {
    const api = gridApiRef.current;
    if (!api) {
      return;
    }

    api.setFocusedCell(cell.rowIndex, cell.columnId);
    api.ensureIndexVisible(cell.rowIndex);
  };

  const handleGridKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const api = gridApiRef.current;
    if (!api) {
      return;
    }

    const editingCells = api.getEditingCells();
    const isEditing = editingCells.length > 0;

    if (isEditing && (isArrowKey(event.key) || event.key === "Enter")) {
      event.preventDefault();
      event.stopPropagation();
      const current = editingCells[0];
      const currentCell = { rowIndex: current.rowIndex, columnId: current.column.getColId() } satisfies GridCellRef;
      api.stopEditing(false);
      const nextCell = moveCell(currentCell, event.key === "Enter" ? "ArrowDown" : event.key);
      applySingleSelection(nextCell);
      focusGridCell(nextCell);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      const text = serializeSelection();
      if (text) {
        event.preventDefault();
        event.stopPropagation();
        void navigator.clipboard.writeText(text);
        triggerCopyFlash();
      }
      return;
    }

    if (!focusedCell || !isArrowKey(event.key)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const nextCell = moveCell(focusedCell, event.key);

    if (event.shiftKey) {
      const anchor = selectionAnchorRef.current ?? focusedCell;
      applyRangeSelection(anchor, nextCell);
      focusGridCell(nextCell);
      return;
    }

    applySingleSelection(nextCell);
    focusGridCell(nextCell);
  };

  const handleCopy = (event: ReactClipboardEvent<HTMLDivElement>) => {
    const text = serializeSelection();
    if (!text) {
      return;
    }

    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
    triggerCopyFlash();
  };

  const handlePaste = (event: ReactClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData("text/plain");
    if (!text) {
      return;
    }

    event.preventDefault();
    const clipboardData = text.split(/\r?\n/).map((line) => line.split("\t"));
    applyClipboardData(clipboardData);
  };

  const handleCellFocused = (event: CellFocusedEvent<GridRow>) => {
    if (event.rowPinned || event.rowIndex == null || !event.column) {
      return;
    }

    const nextCell = { rowIndex: event.rowIndex, columnId: event.column.getColId() } satisfies GridCellRef;
    setFocusedCell(nextCell);
    if (!selectedRange) {
      setSelectedRange(buildRange(nextCell, nextCell));
      selectionAnchorRef.current = nextCell;
    }
  };

  const handleCellClicked = (event: CellClickedEvent<GridRow>) => {
    if (event.node.rowPinned === "bottom") {
      addRow();
      return;
    }

    updateHoveredRowDelete(event.rowIndex, event.data?.__rowId ?? "", event.event.target);

    const nextCell = { rowIndex: event.rowIndex, columnId: event.column.getColId() } satisfies GridCellRef;

    if (event.event.shiftKey) {
      const anchor = selectionAnchorRef.current ?? focusedCell ?? nextCell;
      applyRangeSelection(anchor, nextCell);
      return;
    }

    applySingleSelection(nextCell);
  };

  const handleCellMouseDown = (event: CellMouseDownEvent<GridRow>) => {
    if (event.node.rowPinned === "bottom") {
      return;
    }

    updateHoveredRowDelete(event.rowIndex, event.data?.__rowId ?? "", event.event.target);

    const nextCell = { rowIndex: event.rowIndex, columnId: event.column.getColId() } satisfies GridCellRef;
    isDraggingRef.current = true;

    if (event.event.shiftKey) {
      const anchor = selectionAnchorRef.current ?? focusedCell ?? nextCell;
      applyRangeSelection(anchor, nextCell);
      return;
    }

    applySingleSelection(nextCell);
  };

  const handleCellMouseOver = (event: CellMouseOverEvent<GridRow>) => {
    if (event.node.rowPinned === "bottom") {
      return;
    }

    updateHoveredRowDelete(event.rowIndex, event.data?.__rowId ?? "", event.event.target);

    if (!isDraggingRef.current) {
      return;
    }

    const anchor = selectionAnchorRef.current;
    if (!anchor) {
      return;
    }

    const nextCell = { rowIndex: event.rowIndex, columnId: event.column.getColId() } satisfies GridCellRef;
    applyRangeSelection(anchor, nextCell);
  };

  const handleCellKeyDown = (event: CellKeyDownEvent<GridRow>) => {
    if (event.event.defaultPrevented || event.editing) {
      return;
    }

    if (isDirectInputKey(event.event)) {
      event.event.preventDefault();
      const cell = { rowIndex: event.rowIndex, columnId: event.column.getColId() } satisfies GridCellRef;
      applySingleSelection(cell);
      gridApiRef.current?.startEditingCell({
        rowIndex: event.rowIndex,
        colKey: event.column,
        key: event.event.key
      });
      return;
    }

    if (event.event.key !== "Delete" && event.event.key !== "Backspace") {
      return;
    }

    const positions = getSelectedCellPositions();
    if (positions.length === 0) {
      return;
    }

    event.event.preventDefault();
    clearRangeSelection();
  };

  const mergedColumnDefs = useMemo<ColDef<GridRow>[]>(() => {
    return columnDefs.map((columnDef, definitionIndex) => {
      const fieldKey = String(columnDef.field ?? "");
      const fieldDefinition = definition.fields.find((field) => field.key === fieldKey);
      const helperText = columnDef.headerTooltip ?? fieldDefinition?.helperText;
      const originalCellClass = columnDef.cellClass;
      const isFirstColumn = definitionIndex === 0;

      return {
        ...columnDef,
        headerTooltip: helperText,
        editable: (params) => params.node.rowPinned !== "bottom" && Boolean(columnDef.editable),
        colSpan: (params) => {
          if (params.node.rowPinned === "bottom" && isFirstColumn) {
            return visibleColumnIds.length;
          }

          return 1;
        },
        valueGetter: (params) => {
          if (params.node.rowPinned === "bottom") {
            return isFirstColumn ? ADD_ROW_LABEL : "";
          }

          return params.data?.[fieldKey] ?? "";
        },
        cellClass: (params) => {
          const classes: string[] = [];
          const rowIndex = params.node.rowIndex ?? -1;
          const columnIndex = visibleColumnIds.indexOf(fieldKey);

          if (params.node.rowPinned === "bottom") {
            classes.push("grid-add-row-cell");
            return classes;
          }

          if (typeof originalCellClass === "function") {
            const value = originalCellClass(params);
            if (Array.isArray(value)) {
              classes.push(...value.filter(Boolean));
            } else if (typeof value === "string" && value) {
              classes.push(value);
            }
          } else if (Array.isArray(originalCellClass)) {
            classes.push(...originalCellClass.filter(Boolean));
          } else if (typeof originalCellClass === "string" && originalCellClass) {
            classes.push(originalCellClass);
          }

          if (selectedRange && columnIndex >= 0) {
            const withinRows = rowIndex >= selectedRange.startRowIndex && rowIndex <= selectedRange.endRowIndex;
            const withinColumns =
              columnIndex >= selectedRange.startColumnIndex && columnIndex <= selectedRange.endColumnIndex;

            if (withinRows && withinColumns) {
              classes.push("cell-selected-block");
              if (rowIndex === selectedRange.startRowIndex) {
                classes.push("cell-selected-top");
              }
              if (rowIndex === selectedRange.endRowIndex) {
                classes.push("cell-selected-bottom");
              }
              if (columnIndex === selectedRange.startColumnIndex) {
                classes.push("cell-selected-left");
              }
              if (columnIndex === selectedRange.endColumnIndex) {
                classes.push("cell-selected-right");
              }
              if (isCopyFlashing) {
                classes.push("cell-copy-flash");
              }
            }
          }

          if (focusedCell && focusedCell.rowIndex === rowIndex && focusedCell.columnId === fieldKey) {
            classes.push("cell-selected-focus");
          }

          return classes;
        }
      } satisfies ColDef<GridRow>;
    });
  }, [columnDefs, definition.fields, focusedCell, isCopyFlashing, selectedRange, visibleColumnIds]);

  return (
    <div className="grid-panel card">
      <div className="grid-toolbar">
        <div className="grid-toolbar-main">
          <div>
            <div className="grid-title">{definition.endpoint}</div>
            <div className="grid-subtitle">{definition.description}</div>
          </div>
          <div className="grid-meta">
            {issues.length > 0 ? (
              <div className="grid-chip warning">
                <span>{"\uAC80\uC99D \uD544\uC694"}</span>
                <strong>{`${issues.length}건 확인 필요`}</strong>
              </div>
            ) : (
              <div className="grid-chip success">
                <span>{"\uAC80\uC99D \uC0C1\uD0DC"}</span>
                <strong>{"현재 입력 형식 양호"}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-actions">
        <button
          onClick={() => void loadCurrentData()}
          disabled={isBusy}
          title={"선택한 엔드포인트의 현재 데이터를 전체 불러옵니다."}
        >
          {"전체 불러오기"}
        </button>
        <button
          onClick={() => void submit("PUT")}
          disabled={isBusy}
          title={"지금 표에 입력한 내용으로 MIDAS API 데이터를 반영합니다."}
        >
          {"적용하기"}
        </button>
        <button
          onClick={handleDeleteSelectedOnServer}
          disabled={isBusy || !selectedRange}
          title={"현재 선택한 행 범위에 포함된 항목을 KEY 기준으로 삭제합니다."}
        >
          {"선택 삭제"}
        </button>
      </div>

      <div
        ref={gridWrapRef}
        className="ag-wrap custom-selection-wrap"
        onKeyDownCapture={handleGridKeyDownCapture}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onMouseLeave={() => setHoveredRowDelete(null)}
      >
        <AgGridReact<GridRow>
          theme={appTheme}
          rowData={rows}
          columnDefs={mergedColumnDefs}
          defaultColDef={defaultColDef}
          rowSelection={{ mode: "multiRow", checkboxes: false, headerCheckbox: false }}
          pinnedBottomRowData={pinnedBottomRowData}
          domLayout="autoHeight"
          processDataFromClipboard={handleProcessDataFromClipboard}
          stopEditingWhenCellsLoseFocus={true}
          singleClickEdit={false}
          suppressClickEdit={true}
          undoRedoCellEditing={true}
          undoRedoCellEditingLimit={30}
          getRowId={(params) => params.data.__rowId ?? params.data.KEY}
          rowClassRules={rowClassRules}
          tooltipShowDelay={500}
          onGridReady={handleGridReady}
          onCellFocused={handleCellFocused}
          onCellClicked={handleCellClicked}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseOver={handleCellMouseOver}
          onCellKeyDown={handleCellKeyDown}
          onCellValueChanged={syncRowsFromGrid}
          onRowSelected={(event: RowSelectedEvent<GridRow>) => {
            if (event.source) {
              handleSelectionChanged();
            }
          }}
          onSelectionChanged={handleSelectionChanged}
          onBodyScroll={() => setHoveredRowDelete(null)}
        />
        {hoveredRowDelete ? (
          <button
            type="button"
            className="grid-row-delete-button"
            style={{ top: `${hoveredRowDelete.top}px`, height: `${hoveredRowDelete.height}px`, ...(hoveredRowDelete.left == null ? {} : { left: `${hoveredRowDelete.left}px`, right: "auto" }) }}
            onClick={handleDeleteRows}
            aria-label={"행 삭제"}
          >
            {"삭제"}
          </button>
        ) : null}
      </div>
    </div>
  );
};



