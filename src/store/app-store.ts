import { create } from "zustand";
import {
  AppSettings,
  DB_BY_ENDPOINT,
  DbEndpointId,
  GridRow,
  RowIssue
} from "../shared/midas";
import { buildPayload, createBlankRow, rowsFromGetResponse } from "../lib/transformers";

type ConnectionState = "idle" | "success" | "error";

interface ResultMessage {
  tone: "neutral" | "success" | "error";
  text: string;
}

interface AppState {
  baseUrl: string;
  apiKey: string;
  schemaFolderPath: string;
  connectionState: ConnectionState;
  selectedEndpoint: DbEndpointId;
  rows: GridRow[];
  issues: RowIssue[];
  jsonPreview: string;
  selectedRowIds: string[];
  resultMessage?: ResultMessage;
  isBusy: boolean;
  initialize: () => Promise<void>;
  setBaseUrl: (value: string) => void;
  setApiKey: (value: string) => void;
  chooseSchemaFolder: () => Promise<void>;
  openSchemaFolder: () => Promise<void>;
  setSelectedEndpoint: (value: DbEndpointId) => void;
  setRows: (rows: GridRow[]) => void;
  upsertRow: (rowId: string, patch: Partial<GridRow>) => void;
  addRow: () => void;
  deleteSelectedRows: () => void;
  clearSelectedCells: (cellPositions: Array<{ rowId: string; fieldKey: string }>) => void;
  setSelectedRowIds: (rowIds: string[]) => void;
  testConnection: () => Promise<void>;
  loadCurrentData: () => Promise<void>;
  refreshPreview: () => void;
  submit: (method: "POST" | "PUT") => Promise<void>;
}

const getNextKeySeed = (rows: GridRow[]) => {
  const numericKeys = rows
    .map((row) => Number(row.KEY))
    .filter((value) => Number.isInteger(value) && value > 0);

  return (numericKeys.length > 0 ? Math.max(...numericKeys) : 0) + 1;
};

const getInitialRows = (endpoint: DbEndpointId) => [createBlankRow(endpoint, 1)];

const syncSettings = (settings: AppSettings, set: (partial: Partial<AppState>) => void) => {
  set({
    baseUrl: settings.baseUrl,
    apiKey: settings.apiKey,
    schemaFolderPath: settings.schemaFolderPath
  });
};

export const useAppStore = create<AppState>((set, get) => ({
  baseUrl: "",
  apiKey: "",
  schemaFolderPath: "",
  connectionState: "idle",
  selectedEndpoint: "FBLA",
  rows: getInitialRows("FBLA"),
  issues: [],
  jsonPreview: JSON.stringify({ Assign: { "1": {} } }, null, 2),
  selectedRowIds: [],
  resultMessage: undefined,
  isBusy: false,
  initialize: async () => {
    const settings = await window.midasBridge.loadSettings();
    syncSettings(settings, set);
    get().refreshPreview();
  },
  setBaseUrl: (value) => {
    set({ baseUrl: value });
    void window.midasBridge.updateSettings({ baseUrl: value });
  },
  setApiKey: (value) => {
    set({ apiKey: value });
    void window.midasBridge.updateSettings({ apiKey: value });
  },
  chooseSchemaFolder: async () => {
    const result = await window.midasBridge.chooseSchemaFolder();
    syncSettings(result.settings, set);
    if (result.message) {
      set({ resultMessage: { tone: "neutral", text: result.message } });
    }
  },
  openSchemaFolder: async () => {
    await window.midasBridge.openSchemaFolder();
  },
  setSelectedEndpoint: (value) => {
    set({
      selectedEndpoint: value,
      rows: getInitialRows(value),
      selectedRowIds: [],
      issues: [],
      resultMessage: undefined
    });
    get().refreshPreview();
  },
  setRows: (rows) => {
    set({ rows });
    get().refreshPreview();
  },
  upsertRow: (rowId, patch) => {
    set((state) => ({
      rows: state.rows.map((row) => (row.__rowId === rowId ? { ...row, ...patch } : row))
    }));
    get().refreshPreview();
  },
  addRow: () => {
    const state = get();
    const seed = getNextKeySeed(state.rows);
    set({
      rows: [...state.rows, createBlankRow(state.selectedEndpoint, seed)]
    });
    get().refreshPreview();
  },
  deleteSelectedRows: () => {
    const state = get();
    const remaining = state.rows.filter((row) => !state.selectedRowIds.includes(row.__rowId ?? ""));
    set({
      rows: remaining.length > 0 ? remaining : getInitialRows(state.selectedEndpoint),
      selectedRowIds: []
    });
    get().refreshPreview();
  },
  clearSelectedCells: (cellPositions) => {
    const grouped = new Map<string, Set<string>>();
    for (const cell of cellPositions) {
      if (!grouped.has(cell.rowId)) {
        grouped.set(cell.rowId, new Set());
      }
      grouped.get(cell.rowId)?.add(cell.fieldKey);
    }

    set((state) => ({
      rows: state.rows.map((row) => {
        const rowId = row.__rowId ?? "";
        const targets = grouped.get(rowId);
        if (!targets) {
          return row;
        }

        const next = { ...row };
        for (const fieldKey of targets) {
          next[fieldKey] = "";
        }
        return next;
      })
    }));
    get().refreshPreview();
  },
  setSelectedRowIds: (rowIds) => set({ selectedRowIds: rowIds }),
  testConnection: async () => {
    const state = get();
    set({ isBusy: true, resultMessage: undefined });

    const result = await window.midasBridge.request({
      baseUrl: state.baseUrl,
      apiKey: state.apiKey,
      endpoint: state.selectedEndpoint,
      method: "GET"
    });

    set({
      isBusy: false,
      connectionState: result.ok ? "success" : "error",
      resultMessage: result.ok
        ? { tone: "success", text: `연결됨 (${result.status})` }
        : { tone: "error", text: result.message }
    });
  },
  loadCurrentData: async () => {
    const state = get();
    set({ isBusy: true, resultMessage: undefined });

    const result = await window.midasBridge.request({
      baseUrl: state.baseUrl,
      apiKey: state.apiKey,
      endpoint: state.selectedEndpoint,
      method: "GET"
    });

    if (!result.ok) {
      set({
        isBusy: false,
        resultMessage: { tone: "error", text: result.message }
      });
      return;
    }

    const rows = rowsFromGetResponse(state.selectedEndpoint, result.data);
    set({
      isBusy: false,
      rows: rows.length > 0 ? rows : getInitialRows(state.selectedEndpoint),
      issues: [],
      selectedRowIds: [],
      resultMessage: {
        tone: "success",
        text: `현재 데이터를 불러왔습니다. (${rows.length}행)`
      }
    });
    get().refreshPreview();
  },
  refreshPreview: () => {
    const state = get();
    const preview = buildPayload(state.selectedEndpoint, state.rows);
    set({
      issues: preview.issues,
      jsonPreview: JSON.stringify(preview.payload, null, 2)
    });
  },
  submit: async (method) => {
    const state = get();
    const preview = buildPayload(state.selectedEndpoint, state.rows);
    set({
      issues: preview.issues,
      jsonPreview: JSON.stringify(preview.payload, null, 2),
      isBusy: true,
      resultMessage: undefined
    });

    const result = await window.midasBridge.request({
      baseUrl: state.baseUrl,
      apiKey: state.apiKey,
      endpoint: state.selectedEndpoint,
      method,
      body: preview.payload
    });

    set({
      isBusy: false,
      resultMessage: result.ok
        ? { tone: "success", text: `${method} 요청이 완료되었습니다. (${result.status})` }
        : {
            tone: "error",
            text: result.status ? `${result.message}: ${result.status}` : result.message
          }
    });
  }
}));

export const getSelectedDefinition = (endpoint: DbEndpointId) => DB_BY_ENDPOINT[endpoint];
