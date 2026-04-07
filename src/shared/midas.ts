import { fblaDefinition } from "../features/endpoints/definitions/fbla";
import { stldDefinition } from "../features/endpoints/definitions/stld";
import { cnldDefinition } from "../features/endpoints/definitions/cnld";
import { nodeDefinition } from "../features/endpoints/definitions/node";
import { elemDefinition } from "../features/endpoints/definitions/elem";
import {
  bodfDefinition,
  bmldDefinition,
  sdspDefinition,
  nmasDefinition,
  ltomDefinition,
  nbofDefinition,
  psltDefinition,
  presDefinition,
  pnldDefinition,
  pnlaDefinition,
  fbldDefinition,
  fmldDefinition,
  pospDefinition,
  epstDefinition,
  epseDefinition,
  poslDefinition
} from "../features/endpoints/definitions/bulk-static-loads";

export type DbCategoryId = "static-loads" | "modeling";
export type DbEndpointId =
  | "FBLA"
  | "STLD"
  | "CNLD"
  | "NODE"
  | "ELEM"
  | "BODF"
  | "BMLD"
  | "SDSP"
  | "NMAS"
  | "LTOM"
  | "NBOF"
  | "PSLT"
  | "PRES"
  | "PNLD"
  | "PNLA"
  | "FBLD"
  | "FMLD"
  | "POSP"
  | "EPST"
  | "EPSE"
  | "POSL";

export type FieldKind =
  | "text"
  | "number"
  | "integer"
  | "boolean"
  | "integer-array"
  | "number-array"
  | "string-array"
  | "object"
  | "object-array"
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
  keyHelperText?: string;
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
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  ids?: number[];
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

export const DB_DEFINITIONS: DbDefinition[] = [
  nodeDefinition,
  elemDefinition,
  fblaDefinition,
  stldDefinition,
  cnldDefinition,
  bodfDefinition,
  bmldDefinition,
  sdspDefinition,
  nmasDefinition,
  ltomDefinition,
  nbofDefinition,
  psltDefinition,
  presDefinition,
  pnldDefinition,
  pnlaDefinition,
  fbldDefinition,
  fmldDefinition,
  pospDefinition,
  epstDefinition,
  epseDefinition,
  poslDefinition
];

export const DB_BY_ENDPOINT = Object.fromEntries(
  DB_DEFINITIONS.map((definition) => [definition.endpoint, definition])
) as Record<DbEndpointId, DbDefinition>;
