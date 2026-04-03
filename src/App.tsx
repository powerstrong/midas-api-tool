import { useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { CellClassParams, ColDef, GridApi, GridReadyEvent, RowSelectedEvent } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { DB_DEFINITIONS, DbEndpointId, GridRow } from "./shared/midas";
import { getSelectedDefinition, useAppStore } from "./store/app-store";

ModuleRegistry.registerModules([AllCommunityModule]);

const appTheme = themeQuartz.withParams({
  backgroundColor: "#111827",
  foregroundColor: "#e5eefb",
  headerBackgroundColor: "#172033",
  headerTextColor: "#cdd9ed",
  oddRowBackgroundColor: "#0f172a",
  borderColor: "#24324b",
  wrapperBorderRadius: 18
});

const connectionLabelMap = {
  idle: "미연결",
  success: "연결됨",
  error: "실패"
} as const;

const App = () => {
  const gridApiRef = useRef<GridApi<GridRow>>();
  const {
    baseUrl,
    apiKey,
    persistApiKey,
    connectionState,
    selectedEndpoint,
    rows,
    issues,
    jsonPreview,
    resultMessage,
    isBusy,
    initialize,
    setBaseUrl,
    setApiKey,
    setPersistApiKey,
    setSelectedEndpoint,
    setRows,
    addRow,
    deleteSelectedRows,
    clearSelectedCells,
    setSelectedRowIds,
    testConnection,
    loadCurrentData,
    submit
  } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const definition = getSelectedDefinition(selectedEndpoint);
  const issueMap = useMemo(() => {
    const next = new Map<string, string>();
    for (const rowIssue of issues) {
      for (const cell of rowIssue.cells) {
        next.set(`${rowIssue.rowId}:${cell.fieldKey}`, cell.message);
      }
    }
    return next;
  }, [issues]);

  const rowClassRules = useMemo(
    () => ({
      "row-has-issue": (params: { data?: GridRow }) =>
        issues.some((issue) => issue.rowId === params.data?.__rowId)
    }),
    [issues]
  );

  const columnDefs = useMemo<ColDef<GridRow>[]>(() => {
    const defs: ColDef<GridRow>[] = [
      {
        headerName: definition.keyLabel,
        field: "KEY",
        editable: true,
        width: 110,
        pinned: "left",
        checkboxSelection: true,
        headerCheckboxSelection: true
      }
    ];

    for (const field of definition.fields) {
      defs.push({
        headerName: field.label,
        field: field.key,
        editable: true,
        width: field.width ?? 150,
        cellEditor:
          field.kind === "select" && field.options
            ? "agSelectCellEditor"
            : undefined,
        cellEditorParams:
          field.kind === "select" && field.options
            ? { values: field.options.map((option) => option.value) }
            : undefined,
        tooltipValueGetter: (params) => {
          const rowId = params.data?.__rowId ?? "";
          return issueMap.get(`${rowId}:${field.key}`) ?? field.helperText ?? "";
        },
        cellClass: (params: CellClassParams<GridRow>) => {
          const rowId = params.data?.__rowId ?? "";
          return issueMap.has(`${rowId}:${field.key}`) ? "cell-error" : "";
        }
      });
    }

    return defs;
  }, [definition, issueMap]);

  const defaultColDef = useMemo<ColDef<GridRow>>(
    () => ({
      resizable: true,
      sortable: false,
      filter: false
    }),
    []
  );

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

  const endpointGroups = useMemo(() => {
    return DB_DEFINITIONS.reduce<Record<string, typeof DB_DEFINITIONS>>((acc, item) => {
      if (!acc[item.categoryId]) {
        acc[item.categoryId] = [];
      }
      acc[item.categoryId].push(item);
      return acc;
    }, {});
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar card">
        <div className="topbar-main">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div>
              <h1>midas-api-tool</h1>
              <p>MIDAS API DB 입력 도구</p>
            </div>
          </div>

          <div className="security-note">
            이 프로그램은 사용자의 MIDAS API 정보를 외부 서버로 전송하지 않습니다.
            모든 요청은 사용자의 컴퓨터에서 직접 MIDAS API 서버로 전송됩니다.
          </div>
        </div>

        <div className="connection-grid">
          <label className="field">
            <span>Base URL</span>
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://moa-engineers.midasit.com/civil"
            />
          </label>
          <label className="field">
            <span>MAPI-Key</span>
            <input
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              type="password"
              placeholder="MAPI-Key 입력"
            />
          </label>
          <div className="connection-actions">
            <button onClick={() => void testConnection()} disabled={isBusy}>
              연결 테스트
            </button>
            <label className="checkbox">
              <input
                checked={persistApiKey}
                onChange={(event) => setPersistApiKey(event.target.checked)}
                type="checkbox"
              />
              <span>로컬 저장 허용</span>
            </label>
          </div>
          <div className={`status-chip status-${connectionState}`}>
            상태: {connectionLabelMap[connectionState]}
          </div>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar card">
          <div className="panel-title">
            <h2>DB 목록</h2>
            <p>대분류 선택 후 소분류를 고릅니다.</p>
          </div>

          {Object.entries(endpointGroups).map(([groupId, items]) => (
            <section key={groupId} className="db-group">
              <h3>{items[0].categoryLabel}</h3>
              <div className="db-group-list">
                {items.map((item) => (
                  <button
                    key={item.endpoint}
                    className={item.endpoint === selectedEndpoint ? "db-item active" : "db-item"}
                    onClick={() => setSelectedEndpoint(item.endpoint as DbEndpointId)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.description}</span>
                    <small>{item.path}</small>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </aside>

        <section className="content">
          <div className="content-top">
            <div className="panel-title card">
              <h2>{definition.label}</h2>
              <p>
                {definition.description} / <code>{definition.path}</code>
              </p>
            </div>
            <div className="panel-title card">
              <h2>입력 규칙</h2>
              <p>
                빈 값은 payload에서 제외됩니다. boolean은 <code>true/false</code>, <code>1/0</code>, <code>yes/no</code>를 허용합니다.
              </p>
            </div>
          </div>

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

          <div className="bottom-panels">
            <section className="card preview-panel">
              <div className="panel-title">
                <h2>JSON 미리보기</h2>
                <p>현재 입력값을 MIDAS API 형식으로 변환한 결과입니다.</p>
              </div>
              <pre>{jsonPreview}</pre>
            </section>

            <section className="card issue-panel">
              <div className="panel-title">
                <h2>검증 결과</h2>
                <p>형식 오류 셀은 빨간색으로 표시됩니다.</p>
              </div>
              <div className="issue-list">
                {issues.length === 0 ? (
                  <div className="empty-state">현재 형식 오류가 없습니다.</div>
                ) : (
                  issues.map((issue) => (
                    <div key={issue.rowId} className="issue-item">
                      <strong>{issue.rowId}</strong>
                      <span>
                        {issue.cells.map((cell) => `${cell.fieldKey}: ${cell.message}`).join(" / ")}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {resultMessage ? (
                <div className={`result-banner tone-${resultMessage.tone}`}>{resultMessage.text}</div>
              ) : null}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
