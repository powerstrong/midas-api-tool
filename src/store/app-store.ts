import { create } from "zustand";
import {
  DB_BY_ENDPOINT,
  DbEndpointId,
  GridRow,
  RowIssue,
  STORAGE_KEY,
  SavedConnection
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
  persistApiKey: boolean;
  connectionState: ConnectionState;
  selectedEndpoint: DbEndpointId;
  rows: GridRow[];
  issues: RowIssue[];
  jsonPreview: string;
  selectedRowIds: string[];
  resultMessage?: ResultMessage;
  isBusy: boolean;
  initialize: () => void;
  setBaseUrl: (value: string) => void;
  setApiKey: (value: string) => void;
  setPersistApiKey: (value: boolean) => void;
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

const persistConnection = (payload: SavedConnection) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const removePersistedConnection = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const getNextKeySeed = (rows: GridRow[]) => {
  const numericKeys = rows
    .map((row) => Number(row.KEY))
    .filter((value) => Number.isInteger(value) && value > 0);

  return (numericKeys.length > 0 ? Math.max(...numericKeys) : 0) + 1;
};

const getInitialRows = (endpoint: DbEndpointId) => [createBlankRow(endpoint, 1)];

export const useAppStore = create<AppState>((set, get) => ({
  baseUrl: "",
  apiKey: "",
  persistApiKey: false,
  connectionState: "idle",
  selectedEndpoint: "FBLA",
  rows: getInitialRows("FBLA"),
  issues: [],
  jsonPreview: JSON.stringify({ Assign: { "1": {} } }, null, 2),
  selectedRowIds: [],
  resultMessage: undefined,
  isBusy: false,
  initialize: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      get().refreshPreview();
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SavedConnection;
      set({
        baseUrl: parsed.baseUrl ?? "",
        apiKey: parsed.persistApiKey ? parsed.apiKey ?? "" : "",
        persistApiKey: Boolean(parsed.persistApiKey)
      });
    } catch {
      removePersistedConnection();
    }

    get().refreshPreview();
  },
  setBaseUrl: (value) => {
    set({ baseUrl: value });
    const state = get();
    if (state.persistApiKey) {
      persistConnection({
        baseUrl: value,
        apiKey: state.apiKey,
        persistApiKey: true
      });
    }
  },
  setApiKey: (value) => {
    set({ apiKey: value });
    const state = get();
    if (state.persistApiKey) {
      persistConnection({
        baseUrl: state.baseUrl,
        apiKey: value,
        persistApiKey: true
      });
    }
  },
  setPersistApiKey: (value) => {
    set({ persistApiKey: value });
    const state = get();
    if (value) {
      persistConnection({
        baseUrl: state.baseUrl,
        apiKey: state.apiKey,
        persistApiKey: true
      });
    } else {
      removePersistedConnection();
    }
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
