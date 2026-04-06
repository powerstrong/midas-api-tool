import { useEffect, useMemo, useState } from "react";
import type { CellClassParams, ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { DB_DEFINITIONS, DbEndpointId, GridRow, type FieldKind } from "./shared/midas";
import { getSelectedDefinition, useAppStore } from "./store/app-store";
import type { EndpointPageProps } from "./features/endpoints/pages/EndpointPageProps";
import FBLAPage from "./features/endpoints/pages/FBLAPage";
import STLDPage from "./features/endpoints/pages/STLDPage";
import CNLDPage from "./features/endpoints/pages/CNLDPage";
import NODEPage from "./features/endpoints/pages/NODEPage";
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

const uiText = {
  connectionIdle: "\uBBF8\uC5F0\uACB0",
  connectionSuccess: "\uC5F0\uACB0\uB428",
  connectionError: "\uC2E4\uD328",
  appTitle: "MIDAS API \uC785\uB825 \uB3C4\uAD6C",
  appDescription:
    "MIDAS API \uB9E4\uB274\uC5BC \uAE30\uC900\uC73C\uB85C \uC791\uC131\uB41C DB \uC785\uB825 \uB3C4\uAD6C\uC785\uB2C8\uB2E4. \uC0AC\uC6A9\uC790\uC758 \uC815\uBCF4\uB294 \uC678\uBD80 \uC11C\uBC84\uB85C \uC804\uC1A1\uB418\uC9C0 \uC54A\uC73C\uBA70, \uBAA8\uB4E0 \uC694\uCCAD\uC740 \uC0AC\uC6A9\uC790\uC758 \uCEF4\uD4E8\uD130\uC5D0\uC11C \uC9C1\uC811 MIDAS API \uC11C\uBC84\uB85C \uC804\uC1A1\uB429\uB2C8\uB2E4.",
  manual: "MIDAS API \uB9E4\uB274\uC5BC \uBCF4\uAE30",
  iconAlt: "MIDAS API \uC785\uB825 \uB3C4\uAD6C \uC544\uC774\uCF58",
  workSetup: "\uC791\uC5C5 \uC124\uC815",
  workSetupDescription: "\uC5F0\uACB0 \uC815\uBCF4\uB9CC \uC785\uB825\uD558\uBA74 \uBC14\uB85C \uC791\uC5C5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  collapse: "\uC811\uAE30",
  open: "\uC5F4\uAE30",
  connectionSettings: "\uC5F0\uACB0 \uC124\uC815",
  connectionSettingsDescription: "MIDAS API \uC694\uCCAD\uC5D0 \uC0AC\uC6A9\uD560 \uC8FC\uC18C\uC640 \uC778\uC99D \uD0A4\uB97C \uC785\uB825\uD569\uB2C8\uB2E4.",
  connectionTest: "\uC5F0\uACB0 \uD14C\uC2A4\uD2B8",
  apiKeyPlaceholder: "MAPI-Key \uC785\uB825",
  dbList: "DB \uBAA9\uB85D",
  dbListDescription: "DB \uC5D4\uB4DC\uD3EC\uC778\uD2B8\uB97C \uC120\uD0DD\uD569\uB2C8\uB2E4.",
  search: "\uAC80\uC0C9",
  recent: "\uCD5C\uADFC \uC0AC\uC6A9",
  allList: "\uC804\uCCB4 \uBAA9\uB85D",
  noResults: "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."
} as const;

const connectionLabelMap = {
  idle: uiText.connectionIdle,
  success: uiText.connectionSuccess,
  error: uiText.connectionError
} as const;

const endpointPages: Record<DbEndpointId, (props: EndpointPageProps) => JSX.Element> = {
  FBLA: FBLAPage,
  STLD: STLDPage,
  CNLD: CNLDPage,
  NODE: NODEPage
};

const heroLinks = [
  {
    icon: "github.png",
    title: "GitHub 바로가기",
    href: "https://github.com/powerstrong/midas-api-tool"
  },
  {
    icon: "midasgen.jpg",
    title: "MIDAS GEN 매뉴얼 바로가기",
    href: "https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual"
  },
  {
    icon: "midascivil.jpg",
    title: "MIDAS Civil 매뉴얼 바로가기",
    href: "https://support.midasuser.com/hc/ko/articles/38868325423769-MIDAS-CIVIL-NX-KR-Online-Manual"
  },
  {
    icon: "midasapi.png",
    title: "MIDAS API 매뉴얼 바로가기",
    href: "https://support.midasuser.com/hc/ko/p/gate_api_manual"
  },
  {
    icon: "lime.png",
    title: "라임구조엔지니어링 바로가기",
    href: "http://www.xn--989almi3wt4jd4hrmb.kr/main"
  }
] as const;


const getApiTypeLabel = (kind: FieldKind) => {
  switch (kind) {
    case "text":
      return "string";
    case "integer":
      return "integer";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "integer-array":
      return "array:number";
    case "string-array":
      return "array:string";
    case "object-array":
      return "array:object";
    case "select":
      return "enum";
    default:
      return "string";
  }
};

const GridHeader = (props: {
  displayName?: string;
  typeLabel?: string;
}) => {
  return (
    <div className="grid-header-cell">
      <span className="grid-header-title">{props.displayName ?? ""}</span>
      {props.typeLabel ? <span className="grid-header-type">{props.typeLabel}</span> : null}
    </div>
  );
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
        headerComponent: GridHeader,
        headerComponentParams: {
          typeLabel: "integer"
        }
      }
    ];

    for (const field of definition.fields) {
      defs.push({
        headerName: field.label,
        field: field.key,
        editable: true,
        width: field.width ?? 150,
        headerComponent: GridHeader,
        headerComponentParams: {
          typeLabel: getApiTypeLabel(field.kind)
        },
        cellEditor:
          field.kind === "select" && field.options ? "agSelectCellEditor" : undefined,
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
      .slice(0, 3)
      .map((endpoint) => recentMap.get(endpoint))
      .filter((item): item is (typeof DB_DEFINITIONS)[number] => Boolean(item));
  }, [endpointSearch, recentEndpoints]);

  const filteredDefinitions = useMemo(() => {
    const keyword = endpointSearch.trim().toLowerCase();
    if (!keyword) {
      return sortedDefinitions;
    }

    return sortedDefinitions.filter((item) => {
      const haystack = `${item.endpoint} ${item.label ?? ""} ${item.description}`.toLowerCase();
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
              <img className="brand-icon" src={`${import.meta.env.BASE_URL}app-icon.png`} alt={uiText.iconAlt} />
            </div>
            <div className="brand-copy">
              <div className="eyebrow">MIDAS API Toolkit</div>
              <h1>{uiText.appTitle}</h1>
              <p>{uiText.appDescription}</p>
            </div>
          </div>
          <div className="hero-links" aria-label="바로가기 링크">
            {heroLinks.map((item) => (
              <a
                key={item.title}
                className="hero-link-icon"
                href={item.href}
                title={item.title}
                aria-label={item.title}
                target="_blank"
                rel="noreferrer"
              >
                <img className="hero-link-image" src={`${import.meta.env.BASE_URL}${item.icon}`} alt="" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </header>

      <section className="collapsible card">
        <div className="section-header">
          <div>
            <h2>{uiText.workSetup}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={() => setPanelOpen("settingsOpen", !panelState.settingsOpen)}>
            {panelState.settingsOpen ? uiText.collapse : uiText.open}
          </button>
        </div>
        {panelState.settingsOpen ? (
          <div className="section-body settings-stack">
            <section className="settings-block">
              <div className="settings-block-header">
                <div>
                  <h3>{uiText.connectionSettings}</h3>
                  <p>{uiText.connectionSettingsDescription}</p>
                </div>
                <div className="settings-header-actions">
                  <button onClick={() => void testConnection()} disabled={isBusy}>
                    {uiText.connectionTest}
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
                    placeholder={uiText.apiKeyPlaceholder}
                  />
                </label>
              </div>
            </section>
          </div>
        ) : null}
      </section>

      <main className={`workspace ${panelState.sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <aside className={`sidebar card ${panelState.sidebarOpen ? "" : "sidebar-collapsed"}`.trim()}>
          <div className={`section-header compact ${panelState.sidebarOpen ? "" : "collapsed"}`.trim()}>
            <div>
              <h2>{uiText.dbList}</h2>
              <p>{uiText.dbListDescription}</p>
            </div>
            <button type="button" className="ghost-button" onClick={() => setPanelOpen("sidebarOpen", !panelState.sidebarOpen)}>
              {panelState.sidebarOpen ? uiText.collapse : uiText.open}
            </button>
          </div>
          {panelState.sidebarOpen ? (
            <div className="sidebar-body">
              <label className="field sidebar-search">
                <span>{uiText.search}</span>
                <input
                  value={endpointSearch}
                  onChange={(event) => setEndpointSearch(event.target.value)}
                  placeholder="NODE, FBLA, STLD, CNLD..."
                />
              </label>
              {recentDefinitions.length > 0 ? (
                <section className="db-group db-group-recent">
                  <div className="db-group-heading">
                    <h3>{uiText.recent}</h3>
                  </div>
                  <div className="db-quick-list">
                    {recentDefinitions.map((item) => (
                      <button
                        key={`recent-${item.endpoint}`}
                        className={item.endpoint === selectedEndpoint ? "db-quick-item active" : "db-quick-item"}
                        onClick={() => setSelectedEndpoint(item.endpoint as DbEndpointId)}
                      >
                        <strong>{item.endpoint}</strong>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="db-group">
                <div className="db-group-heading db-group-heading-spaced">
                  <h3>{uiText.allList}</h3>
                  <span className="db-group-count">{filteredDefinitions.length}</span>
                </div>
                <div className="db-group-list db-group-list-compact">
                  {filteredDefinitions.length === 0 ? (
                    <div className="empty-state">{uiText.noResults}</div>
                  ) : (
                    filteredDefinitions.map((item) => (
                      <button
                        key={item.endpoint}
                        className={item.endpoint === selectedEndpoint ? "db-item active" : "db-item"}
                        onClick={() => setSelectedEndpoint(item.endpoint as DbEndpointId)}
                      >
                        <div className="db-item-accent" aria-hidden="true" />
                        <div className="db-item-main">
                          <div className="db-item-topline">
                            <strong>{item.endpoint}</strong>
                            <small>{item.path}</small>
                          </div>
                          <span>{item.description}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : (
            <>
              <div className="sidebar-collapsed-title">
                DB
                <br />
                {uiText.dbList.replace("DB ", "")}
              </div>
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



