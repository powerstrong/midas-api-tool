import { useEffect, useMemo, useRef, useState } from "react";
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
  const [messagePulse, setMessagePulse] = useState(false);
  const [endpointSearch, setEndpointSearch] = useState("");
  const {
    baseUrl,
    apiKey,
    schemaFolderPath,
    panelState,
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
    chooseSchemaFolder,
    openSchemaFolder,
    setPanelOpen,
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
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!resultMessage) {
      return;
    }

    setPanelOpen("alertOpen", true);
    setMessagePulse(true);
    const timeoutId = window.setTimeout(() => {
      setMessagePulse(false);
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [resultMessage, setPanelOpen]);

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

  const sortedDefinitions = useMemo(() => {
    return [...DB_DEFINITIONS].sort((a, b) => a.endpoint.localeCompare(b.endpoint));
  }, []);

  const filteredDefinitions = useMemo(() => {
    const keyword = endpointSearch.trim().toLowerCase();
    if (!keyword) {
      return sortedDefinitions;
    }

    return sortedDefinitions.filter((item) => {
      const haystack = `${item.endpoint} ${item.label} ${item.description} ${item.path}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [endpointSearch, sortedDefinitions]);

  return (
    <div className="app-shell">
      <header className="hero card">
        <div className="hero-main">
          <div className="brand">
            <div className="brand-mark">
              <img className="brand-icon" src="/app-icon.png" alt="MIDAS API 입력 도구 아이콘" />
            </div>
            <div className="brand-copy">
              <div className="eyebrow">MIDAS API Toolkit</div>
              <h1>MIDAS API 입력 도구</h1>
              <p>MIDAS API 매뉴얼 기준으로 작성된 DB 입력 도구입니다.</p>
            </div>
          </div>
          <a
            className="manual-link"
            href="https://support.midasuser.com/hc/ko/p/gate_api_manual"
            target="_blank"
            rel="noreferrer"
          >
            MIDAS API 매뉴얼 보기
          </a>
        </div>
        <div className="hero-footer">
          <div className="security-note">
            사용자의 MIDAS API 정보는 외부 서버로 전송되지 않으며, 모든 요청은 사용자의 컴퓨터에서 직접 MIDAS API 서버로 전송됩니다.
          </div>
        </div>
      </header>

      <section className="collapsible card">
        <div className="section-header">
          <div>
            <h2>작업 설정</h2>
            <p>연결 정보와 스키마 저장 위치를 설정합니다.</p>
          </div>
          <button type="button" className="ghost-button" onClick={() => setPanelOpen("settingsOpen", !panelState.settingsOpen)}>
            {panelState.settingsOpen ? "접기" : "열기"}
          </button>
        </div>
        {panelState.settingsOpen ? (
          <div className="section-body settings-stack">
            <section className="settings-block">
              <div className="settings-block-header">
                <div>
                  <h3>연결 설정</h3>
                  <p>MIDAS API 요청에 사용할 주소와 인증 키를 입력합니다.</p>
                </div>
                <div className={`status-chip status-${connectionState}`}>
                  상태: {connectionLabelMap[connectionState]}
                </div>
              </div>
              <div className="settings-grid">
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
                <div className="settings-actions">
                  <button onClick={() => void testConnection()} disabled={isBusy}>
                    연결 테스트
                  </button>
                </div>
              </div>
            </section>

            <section className="settings-block settings-block-secondary">
              <div className="settings-block-header">
                <div>
                  <h3>스키마 설정</h3>
                  <p>스키마 파일을 저장하거나 확인할 폴더를 지정합니다.</p>
                </div>
              </div>
              <div className="schema-row">
                <div className="schema-summary">
                  <strong>스키마 저장 폴더</strong>
                  <span>{schemaFolderPath || "아직 선택되지 않았습니다."}</span>
                </div>
                <div className="schema-actions">
                  <button type="button" className="ghost-button" onClick={() => void chooseSchemaFolder()}>
                    스키마 폴더 선택
                  </button>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => void openSchemaFolder()}
                    disabled={!schemaFolderPath}
                  >
                    스키마 폴더 열기
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </section>

      <main className={`workspace ${panelState.sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <aside className="sidebar card">
          <div className="section-header compact">
            <div>
              <h2>DB 목록</h2>
              <p>엔드포인트를 선택합니다.</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => setPanelOpen("sidebarOpen", !panelState.sidebarOpen)}>
              {panelState.sidebarOpen ? "접기" : "열기"}
            </button>
          </div>
          {panelState.sidebarOpen ? (
            <div className="sidebar-body">
              <label className="field sidebar-search">
                <span>검색</span>
                <input
                  value={endpointSearch}
                  onChange={(event) => setEndpointSearch(event.target.value)}
                  placeholder="FBLA, STLD, CNLD..."
                />
              </label>
              <div className="db-group-list">
                {filteredDefinitions.length === 0 ? (
                  <div className="empty-state">검색 결과가 없습니다.</div>
                ) : (
                  filteredDefinitions.map((item) => (
                    <button
                      key={item.endpoint}
                      className={item.endpoint === selectedEndpoint ? "db-item active" : "db-item"}
                      onClick={() => setSelectedEndpoint(item.endpoint as DbEndpointId)}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                      <small>{item.path}</small>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="sidebar-collapsed-label">DB</div>
          )}
        </aside>

        <section className="content">
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

          <section className={`collapsible card ${messagePulse ? "message-pulse" : ""}`}>
            <div className="section-header">
              <div>
                <h2>알림</h2>
                <p>연결 상태, 스키마 생성, 요청 완료 같은 작업 메시지를 표시합니다.</p>
              </div>
              <button type="button" className="ghost-button" onClick={() => setPanelOpen("alertOpen", !panelState.alertOpen)}>
                {panelState.alertOpen ? "접기" : "열기"}
              </button>
            </div>
            {panelState.alertOpen ? (
              <div className="section-body">
                {resultMessage ? (
                  <div className={`top-banner tone-${resultMessage.tone}`}>{resultMessage.text}</div>
                ) : (
                  <div className="empty-state">표시할 알림이 없습니다.</div>
                )}
              </div>
            ) : null}
          </section>

          <div className="bottom-panels">
            <section className="collapsible card">
              <div className="section-header">
                <div>
                  <h2>Payload 미리보기</h2>
                  <p>현재 입력값이 실제 전송 payload로 어떻게 변환되는지 확인합니다.</p>
                </div>
                <button type="button" className="ghost-button" onClick={() => setPanelOpen("previewOpen", !panelState.previewOpen)}>
                  {panelState.previewOpen ? "접기" : "열기"}
                </button>
              </div>
              {panelState.previewOpen ? (
                <div className="section-body preview-panel">
                  <pre>{jsonPreview}</pre>
                </div>
              ) : null}
            </section>

            <section className="collapsible card">
              <div className="section-header">
                <div>
                  <h2>검증 결과</h2>
                  <p>형식 오류가 있는 셀과 행을 확인합니다.</p>
                </div>
                <button type="button" className="ghost-button" onClick={() => setPanelOpen("validationOpen", !panelState.validationOpen)}>
                  {panelState.validationOpen ? "접기" : "열기"}
                </button>
              </div>
              {panelState.validationOpen ? (
                <div className="section-body issue-panel">
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
                </div>
              ) : null}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
