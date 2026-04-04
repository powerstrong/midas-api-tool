import { useEffect, useMemo, useState } from "react";
import type { CellClassParams, ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { DB_DEFINITIONS, DbEndpointId, GridRow } from "./shared/midas";
import { getSelectedDefinition, useAppStore } from "./store/app-store";
import type { EndpointPageProps } from "./features/endpoints/pages/EndpointPageProps";
import FBLAPage from "./features/endpoints/pages/FBLAPage";
import STLDPage from "./features/endpoints/pages/STLDPage";
import CNLDPage from "./features/endpoints/pages/CNLDPage";
import { WorkResultPanel } from "./features/results/WorkResultPanel";

ModuleRegistry.registerModules([AllCommunityModule]);

const appTheme = themeQuartz.withParams({
  backgroundColor: "#0b1220",
  foregroundColor: "#e8f1ff",
  headerBackgroundColor: "#142033",
  headerTextColor: "#d8e6fb",
  oddRowBackgroundColor: "#0d1728",
  borderColor: "#22314c",
  wrapperBorderRadius: 20,
  rowHoverColor: "rgba(64, 124, 220, 0.12)",
  selectedRowBackgroundColor: "rgba(47, 116, 201, 0.14)",
  rangeSelectionBackgroundColor: "rgba(84, 176, 255, 0.12)",
  rangeSelectionBorderColor: "rgba(147, 213, 255, 0.72)",
  accentColor: "#78c4ff",
  fontFamily: '"Segoe UI", "Noto Sans KR", sans-serif'
});

const connectionLabelMap = {
  idle: "미연결",
  success: "연결됨",
  error: "실패"
} as const;

const endpointPages: Record<DbEndpointId, (props: EndpointPageProps) => JSX.Element> = {
  FBLA: FBLAPage,
  STLD: STLDPage,
  CNLD: CNLDPage
};

const App = () => {
  const [messagePulse, setMessagePulse] = useState(false);
  const [endpointSearch, setEndpointSearch] = useState("");
  const {
    baseUrl,
    apiKey,
    panelState,
    recentEndpoints,
    connectionState,
    selectedEndpoint,
    rows,
    issues,
    resultMessage,
    isBusy,
    initialize,
    setBaseUrl,
    setApiKey,
    setPanelOpen,
    setSelectedEndpoint,
    setRows,
    ensureRowsForPaste,
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

  const sortedDefinitions = useMemo(() => {
    return [...DB_DEFINITIONS].sort((a, b) => a.endpoint.localeCompare(b.endpoint));
  }, []);

  const recentDefinitions = useMemo(() => {
    if (endpointSearch.trim()) {
      return [];
    }

    const recentMap = new Map(DB_DEFINITIONS.map((item) => [item.endpoint, item]));
    return recentEndpoints
      .slice(0, 1)
      .map((endpoint) => recentMap.get(endpoint))
      .filter((item): item is (typeof DB_DEFINITIONS)[number] => Boolean(item));
  }, [endpointSearch, recentEndpoints]);

  const filteredDefinitions = useMemo(() => {
    const keyword = endpointSearch.trim().toLowerCase();
    if (!keyword) {
      return sortedDefinitions;
    }

    return sortedDefinitions.filter((item) => {
      const haystack = `${item.endpoint} ${item.label} ${item.description}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [endpointSearch, sortedDefinitions]);

  const endpointPageProps: EndpointPageProps = {
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
    submit
  };

  const SelectedEndpointPage = endpointPages[selectedEndpoint];

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
            <p>연결 정보만 입력하면 바로 작업할 수 있습니다.</p>
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
                <div className="settings-header-actions">
                  <button onClick={() => void testConnection()} disabled={isBusy}>
                    연결 테스트
                  </button>
                  <div className={`status-chip status-${connectionState}`}>
                    {connectionLabelMap[connectionState]}
                  </div>
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
                </label>              </div>
            </section>
          </div>
        ) : null}
      </section>

      <main className={`workspace ${panelState.sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <aside className={`sidebar card ${panelState.sidebarOpen ? "" : "sidebar-collapsed"}`.trim()}>
          <div className={`section-header compact ${panelState.sidebarOpen ? "" : "collapsed"}`.trim()}>
            <div>
              <h2>DB 목록</h2>
              <p>DB 엔드포인트를 선택합니다.</p>
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
              {recentDefinitions.length > 0 ? (
                <section className="db-group">
                  <h3>최근 사용</h3>
                  <div className="db-group-list db-group-list-recent">
                    {recentDefinitions.map((item) => (
                      <button
                        key={`recent-${item.endpoint}`}
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
              ) : null}

              <section className="db-group">
                <h3>전체 목록</h3>
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
              </section>
            </div>
          ) : (
            <>
              <div className="sidebar-collapsed-title">DB<br />목록</div>
              <div className="sidebar-collapsed-current">
                <div className="sidebar-collapsed-label">{selectedEndpoint}</div>
                <div className="sidebar-collapsed-description">{definition.description}</div>
              </div>
            </>
          )}
        </aside>

        <section className="content">
          <SelectedEndpointPage {...endpointPageProps} />
          <WorkResultPanel
            isOpen={panelState.alertOpen}
            messagePulse={messagePulse}
            resultMessage={resultMessage}
            issues={issues}
            onToggle={() => setPanelOpen("alertOpen", !panelState.alertOpen)}
          />
        </section>
      </main>
    </div>
  );
};

export default App;









