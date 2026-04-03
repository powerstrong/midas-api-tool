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

export interface AppSettings {
  baseUrl: string;
  apiKey: string;
  schemaFolderPath: string;
}

export type AppSettingsPatch = Partial<AppSettings>;

export interface FolderSelectionResult {
  settings: AppSettings;
  message?: string;
}

const distributionOptions = [
  { value: "1", label: "One Way" },
  { value: "2", label: "Two Way" },
  { value: "3", label: "Polygon-Centroid" },
  { value: "4", label: "Polygon-Length" }
] satisfies FieldDefinition["options"];

const directionOptions = [
  { value: "LX", label: "LX" },
  { value: "LY", label: "LY" },
  { value: "LZ", label: "LZ" },
  { value: "GX", label: "GX" },
  { value: "GY", label: "GY" },
  { value: "GZ", label: "GZ" }
] satisfies FieldDefinition["options"];

export const DB_DEFINITIONS: DbDefinition[] = [
  {
    categoryId: "static-loads",
    categoryLabel: "Static Loads",
    endpoint: "FBLA",
    label: "FBLA",
    description: "Assign Floor Loads",
    path: "db/FBLA",
    keyLabel: "KEY",
    fields: [
      { key: "FLOOR_LOAD_TYPE_NAME", label: "FLOOR_LOAD_TYPE_NAME", kind: "text", width: 180 },
      { key: "FLOOR_DIST_TYPE", label: "FLOOR_DIST_TYPE", kind: "select", options: distributionOptions, width: 150 },
      { key: "LOAD_ANGLE", label: "LOAD_ANGLE", kind: "number", width: 120 },
      { key: "SUB_BEAM_NUM", label: "SUB_BEAM_NUM", kind: "integer", width: 140 },
      { key: "SUB_BEAM_ANGLE", label: "SUB_BEAM_ANGLE", kind: "number", width: 150 },
      { key: "UNIT_SELF_WEIGHT", label: "UNIT_SELF_WEIGHT", kind: "number", width: 150 },
      { key: "DIR", label: "DIR", kind: "select", options: directionOptions, width: 110 },
      { key: "OPT_PROJECTION", label: "OPT_PROJECTION", kind: "boolean", width: 135 },
      { key: "DESC", label: "DESC", kind: "text", width: 180 },
      {
        key: "OPT_EXCLUDE_INNER_ELEM_AREA",
        label: "OPT_EXCLUDE_INNER_ELEM_AREA",
        kind: "boolean",
        width: 230
      },
      {
        key: "OPT_ALLOW_POLYGON_TYPE_UNIT_AREA",
        label: "OPT_ALLOW_POLYGON_TYPE_UNIT_AREA",
        kind: "boolean",
        width: 250
      },
      { key: "GROUP_NAME", label: "GROUP_NAME", kind: "text", width: 150 },
      {
        key: "NODES",
        label: "NODES",
        kind: "integer-array",
        placeholder: "101,102,103",
        helperText: "쉼표로 구분한 절점 번호",
        width: 220
      }
    ]
  },
  {
    categoryId: "static-loads",
    categoryLabel: "Static Loads",
    endpoint: "STLD",
    label: "STLD",
    description: "Static Load Cases",
    path: "db/STLD",
    keyLabel: "KEY",
    fields: [
      { key: "NAME", label: "NAME", kind: "text", width: 160 },
      { key: "TYPE", label: "TYPE", kind: "text", width: 120, helperText: "예: D, L, USER" },
      { key: "DESC", label: "DESC", kind: "text", width: 220 }
    ]
  },
  {
    categoryId: "static-loads",
    categoryLabel: "Static Loads",
    endpoint: "CNLD",
    label: "CNLD",
    description: "Nodal Loads",
    path: "db/CNLD",
    keyLabel: "NODE",
    fields: [
      { key: "ID", label: "ID", kind: "integer", width: 100 },
      { key: "LCNAME", label: "LCNAME", kind: "text", width: 140 },
      { key: "GROUP_NAME", label: "GROUP_NAME", kind: "text", width: 150 },
      { key: "FX", label: "FX", kind: "number", width: 110 },
      { key: "FY", label: "FY", kind: "number", width: 110 },
      { key: "FZ", label: "FZ", kind: "number", width: 110 },
      { key: "MX", label: "MX", kind: "number", width: 110 },
      { key: "MY", label: "MY", kind: "number", width: 110 },
      { key: "MZ", label: "MZ", kind: "number", width: 110 }
    ]
  }
];

export const DB_BY_ENDPOINT = Object.fromEntries(
  DB_DEFINITIONS.map((definition) => [definition.endpoint, definition])
) as Record<DbEndpointId, DbDefinition>;
