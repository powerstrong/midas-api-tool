import { fblaDefinition } from "../features/endpoints/definitions/fbla";
import { stldDefinition } from "../features/endpoints/definitions/stld";
import { cnldDefinition } from "../features/endpoints/definitions/cnld";

export type DbCategoryId = "static-loads";
export type DbEndpointId = "FBLA" | "STLD" | "CNLD";

export type FieldKind =
  | "text"
  | "number"
  | "integer"
  | "boolean"
  | "integer-array"
  | "select";

export interface FieldDefinition {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
  width?: number;
}

export interface DbDefinition {
  categoryId: DbCategoryId;
  categoryLabel: string;
  endpoint: DbEndpointId;
  label: string;
  description: string;
  path: string;
  keyLabel: string;
  fields: FieldDefinition[];
}

export type CellValue = string;
export type GridRow = Record<string, CellValue>;

export interface CellIssue {
  fieldKey: string;
  message: string;
}

export interface RowIssue {
  rowId: string;
  cells: CellIssue[];
}

export interface PreviewResult {
  payload: Record<string, unknown>;
  issues: RowIssue[];
}

export interface ConnectionInput {
  baseUrl: string;
  apiKey: string;
}

export interface RequestInput extends ConnectionInput {
  endpoint: DbEndpointId;
  method: "GET" | "POST" | "PUT";
  body?: unknown;
}

export interface RequestSuccess {
  ok: true;
  status: number;
  data: unknown;
}

export interface RequestFailure {
  ok: false;
  status?: number;
  message: string;
  details?: unknown;
}

export type RequestResult = RequestSuccess | RequestFailure;

export interface PanelStateSettings {
  sidebarOpen: boolean;
  settingsOpen: boolean;
  alertOpen: boolean;
}

export interface AppSettings {
  baseUrl: string;
  apiKey: string;
  schemaFolderPath: string;
  panelState: PanelStateSettings;
  recentEndpoints: DbEndpointId[];
}

export type AppSettingsPatch = Partial<AppSettings>;

export interface FolderSelectionResult {
  settings: AppSettings;
  message?: string;
}

export const DB_DEFINITIONS: DbDefinition[] = [fblaDefinition, stldDefinition, cnldDefinition];

export const DB_BY_ENDPOINT = Object.fromEntries(
  DB_DEFINITIONS.map((definition) => [definition.endpoint, definition])
) as Record<DbEndpointId, DbDefinition>;
