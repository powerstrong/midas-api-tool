import { useEffect, useMemo, useState } from "react";
import type { CellClassParams, ColDef } from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule, themeQuartz } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { DB_DEFINITIONS, DbEndpointId, GridRow, type FieldKind } from "./shared/midas";
import { getSelectedDefinition, useAppStore } from "./store/app-store";
import type { EndpointPageProps } from "./features/endpoints/pages/EndpointPageProps";
import ELEMPage from "./features/endpoints/pages/ELEMPage";
import FBLAPage from "./features/endpoints/pages/FBLAPage";
import STLDPage from "./features/endpoints/pages/STLDPage";
import CNLDPage from "./features/endpoints/pages/CNLDPage";
import NODEPage from "./features/endpoints/pages/NODEPage";
import { WorkResultPanel } from "./features/results/WorkResultPanel";
import GridTooltip from "./components/GridTooltip";

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
  ELEM: ELEMPage,
  FBLA: FBLAPage,
  STLD: STLDPage,
  CNLD: CNLDPage,
  NODE: NODEPage,
  BODF: NODEPage,
  BMLD: NODEPage,
  SDSP: NODEPage,
  NMAS: NODEPage,
  LTOM: NODEPage,
  NBOF: NODEPage,
  PSLT: NODEPage,
  PRES: NODEPage,
  PNLD: NODEPage,
  PNLA: NODEPage,
  FBLD: NODEPage,
  FMLD: NODEPage,
  POSP: NODEPage,
  EPST: NODEPage,
  EPSE: NODEPage,
  POSL: NODEPage
};

const heroLinks = [
  {
    icon: "github.png",
    title: "GitHub \uBC14\uB85C\uAC00\uAE30",
    href: "https://github.com/powerstrong/midas-api-tool"
  },
  {
    icon: "lime.png",
    title: "\uB77C\uC784\uAD6C\uC870\uAE30\uC220\uC0AC\uC0AC\uBB34\uC18C \uBC14\uB85C\uAC00\uAE30",
    href: "http://www.xn--989almi3wt4jd4hrmb.kr/main"
  },
  {
    icon: "midasgen.jpg",
    title: "MIDAS API \uBCF4\uC870 \uB9E4\uB274\uC5BC \uBC14\uB85C\uAC00\uAE30",
    href: "https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual"
  },
  {
    icon: "midascivil.jpg",
    title: "MIDAS Civil \uB9E4\uB274\uC5BC \uBC14\uB85C\uAC00\uAE30",
    href: "https://support.midasuser.com/hc/ko/articles/38868325423769-MIDAS-CIVIL-NX-KR-Online-Manual"
  },
  {
    icon: "midasapi.png",
    title: "MIDAS API \uB9E4\uB274\uC5BC \uBC14\uB85C\uAC00\uAE30",
    href: "https://support.midasuser.com/hc/ko/p/gate_api_manual"
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


const buildFieldTooltip = (field: { label: string; kind: FieldKind; placeholder?: string; helperText?: string }) => {
  if (field.helperText) {
    return field.helperText;
  }

  const exampleText = field.placeholder
    ? `\n\uC608: ${field.placeholder}`
    : field.kind === "integer-array"
      ? "\n\uC608: 101,102,103"
      : field.kind === "number-array"
        ? "\n\uC608: 0,0,-1"
        : field.kind === "string-array"
          ? "\n\uC608: A,B,C"
          : field.kind === "object"
            ? '\n\uC608: {"KEY":1}'
            : field.kind === "object-array"
              ? '\n\uC608: [{"KEY":1}]'
              : "";

  switch (field.kind) {
    case "text":
      return `${field.label}\uC744(\uB97C) \uBB38\uC790\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "integer":
      return `${field.label}\uC744(\uB97C) \uC815\uC218\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "number":
      return `${field.label}\uC744(\uB97C) \uC22B\uC790\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "boolean":
      return `${field.label}\uC744(\uB97C) true/false, 1/0, yes/no \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.`;
    case "integer-array":
      return `${field.label}\uC744(\uB97C) \uC27C\uD45C\uB85C \uAD6C\uBD84\uD55C \uC815\uC218 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "number-array":
      return `${field.label}\uC744(\uB97C) \uC27C\uD45C\uB85C \uAD6C\uBD84\uD55C \uC22B\uC790 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "string-array":
      return `${field.label}\uC744(\uB97C) \uC27C\uD45C\uB85C \uAD6C\uBD84\uD55C \uBB38\uC790\uC5F4 \uBC30\uC5F4\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "object":
      return `${field.label}\uC744(\uB97C) JSON \uAC1D\uCCB4 \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "object-array":
      return `${field.label}\uC744(\uB97C) JSON \uAC1D\uCCB4 \uBC30\uC5F4 \uD615\uC2DD\uC73C\uB85C \uC785\uB825\uD569\uB2C8\uB2E4.${exampleText}`;
    case "select":
      return `${field.label}\uC744(\uB97C) \uC120\uD0DD\uD56D\uBAA9\uC5D0\uC11C \uACE0\uB985\uB2C8\uB2E4.${exampleText}`;
    default:
      return field.label;
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
    submit,
    deleteSelectedOnServer,
    selectedRowIds
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
        headerTooltip: definition.keyHelperText ?? `${definition.keyLabel} 기준 번호를 입력합니다.`,
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
        headerTooltip: buildFieldTooltip(field),
        cellEditor:
          field.kind === "select" && field.options ? "agSelectCellEditor" : undefined,
        cellEditorParams:
          field.kind === "select" && field.options
            ? { values: field.options.map((option) => option.value) }
            : undefined,
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
      filter: false,
      tooltipComponent: GridTooltip
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
    submit,
    deleteSelectedOnServer,
    selectedRowCount: selectedRowIds.length
  };

  const SelectedEndpointPage = endpointPages[selectedEndpoint];

  useEffect(() => {
    void initialize();
  }, [initialize]);

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
          <div className="hero-links" aria-label="\uBC14\uB85C\uAC00\uAE30 \uB9C1\uD06C">
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
                  placeholder="NODE, ELEM, FBLA, STLD, CNLD, BODF, BMLD..."
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


















