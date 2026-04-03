import { z } from "zod";
import {
  CellIssue,
  DB_BY_ENDPOINT,
  DbDefinition,
  DbEndpointId,
  GridRow,
  PreviewResult,
  RowIssue
} from "../shared/midas";

const blankToUndefined = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const booleanMap: Record<string, boolean> = {
  true: true,
  false: false,
  "1": true,
  "0": false,
  yes: true,
  no: false
};

const integerSchema = z.coerce.number().int();
const numberSchema = z.coerce.number();

const makeIssue = (fieldKey: string, message: string): CellIssue => ({ fieldKey, message });

const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "") {
    return { ok: true as const, value: undefined };
  }

  if (normalized in booleanMap) {
    return { ok: true as const, value: booleanMap[normalized] };
  }

  return { ok: false as const, issue: "boolean 형식이 올바르지 않습니다." };
};

const parseIntegerArray = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true as const, value: undefined };
  }

  const items = trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const parsed = items.map((item) => integerSchema.safeParse(item));
  const hasError = parsed.some((result) => !result.success);

  if (hasError) {
    return { ok: false as const, issue: "정수 배열 형식이 올바르지 않습니다." };
  }

  return {
    ok: true as const,
    value: parsed.map((result) => (result as { success: true; data: number }).data)
  };
};

const parseValue = (kind: DbDefinition["fields"][number]["kind"], value: string) => {
  const normalized = blankToUndefined(value);
  if (normalized === undefined) {
    return { ok: true as const, value: undefined };
  }

  if (kind === "text" || kind === "select") {
    return { ok: true as const, value: normalized };
  }

  if (kind === "integer") {
    const result = integerSchema.safeParse(normalized);
    return result.success
      ? { ok: true as const, value: result.data }
      : { ok: false as const, issue: "정수 형식이 올바르지 않습니다." };
  }

  if (kind === "number") {
    const result = numberSchema.safeParse(normalized);
    return result.success
      ? { ok: true as const, value: result.data }
      : { ok: false as const, issue: "숫자 형식이 올바르지 않습니다." };
  }

  if (kind === "boolean") {
    return parseBoolean(normalized);
  }

  if (kind === "integer-array") {
    return parseIntegerArray(normalized);
  }

  return { ok: true as const, value: normalized };
};

const normalizeKey = (value: string, fallback: number) => {
  const trimmed = value.trim();
  return trimmed || String(fallback);
};

const parseStandardRow = (
  definition: DbDefinition,
  row: GridRow,
  fallbackKey: number
): { key: string; value: Record<string, unknown>; issues: CellIssue[] } => {
  const issues: CellIssue[] = [];
  const value: Record<string, unknown> = {};

  for (const field of definition.fields) {
    const result = parseValue(field.kind, row[field.key] ?? "");
    if (!result.ok) {
      issues.push(makeIssue(field.key, result.issue));
      continue;
    }

    if (result.value !== undefined) {
      value[field.key] = result.value;
    }
  }

  return {
    key: normalizeKey(row.KEY ?? "", fallbackKey),
    value,
    issues
  };
};

const buildCnldPayload = (rows: GridRow[]): PreviewResult => {
  const issues: RowIssue[] = [];
  const grouped = new Map<string, Array<Record<string, unknown>>>();

  rows.forEach((row, index) => {
    const rowId = row.__rowId || `row-${index + 1}`;
    const rowIssues: CellIssue[] = [];
    const nodeKey = normalizeKey(row.KEY ?? "", index + 1);
    const item: Record<string, unknown> = {};

    for (const field of DB_BY_ENDPOINT.CNLD.fields) {
      const result = parseValue(field.kind, row[field.key] ?? "");
      if (!result.ok) {
        rowIssues.push(makeIssue(field.key, result.issue));
        continue;
      }

      if (result.value !== undefined) {
        item[field.key] = result.value;
      }
    }

    if (!grouped.has(nodeKey)) {
      grouped.set(nodeKey, []);
    }

    grouped.get(nodeKey)?.push(item);

    if (rowIssues.length > 0) {
      issues.push({ rowId, cells: rowIssues });
    }
  });

  const assign: Record<string, unknown> = {};
  for (const [key, items] of grouped.entries()) {
    assign[key] = { ITEMS: items };
  }

  return {
    payload: { Assign: assign },
    issues
  };
};

export const buildPayload = (endpoint: DbEndpointId, rows: GridRow[]): PreviewResult => {
  if (endpoint === "CNLD") {
    return buildCnldPayload(rows);
  }

  const definition = DB_BY_ENDPOINT[endpoint];
  const assign: Record<string, unknown> = {};
  const issues: RowIssue[] = [];

  rows.forEach((row, index) => {
    const rowId = row.__rowId || `row-${index + 1}`;
    const parsed = parseStandardRow(definition, row, index + 1);
    assign[parsed.key] = parsed.value;

    if (parsed.issues.length > 0) {
      issues.push({ rowId, cells: parsed.issues });
    }
  });

  return {
    payload: { Assign: assign },
    issues
  };
};

const objectToString = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(",");
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return String(value);
};

export const rowsFromGetResponse = (endpoint: DbEndpointId, data: unknown): GridRow[] => {
  if (!data || typeof data !== "object") {
    return [];
  }

  const source = data as Record<string, unknown>;
  const candidate =
    source.Assign && typeof source.Assign === "object"
      ? (source.Assign as Record<string, unknown>)
      : source[endpoint] && typeof source[endpoint] === "object"
        ? (source[endpoint] as Record<string, unknown>)
        : source;

  const record = candidate as Record<string, unknown>;

  return Object.entries(record).flatMap(([key, value], index) => {
    if (!value || typeof value !== "object") {
      return [];
    }

    if (endpoint === "CNLD") {
      const items = (value as { ITEMS?: unknown }).ITEMS;
      if (!Array.isArray(items)) {
        return [];
      }

      return items.map((item, itemIndex) => {
        const row: GridRow = {
          __rowId: `${key}-${itemIndex + 1}-${index + 1}`,
          KEY: key
        };
        if (item && typeof item === "object") {
          for (const field of DB_BY_ENDPOINT.CNLD.fields) {
            row[field.key] = objectToString((item as Record<string, unknown>)[field.key]);
          }
        }
        return row;
      });
    }

    const row: GridRow = {
      __rowId: `${key}-${index + 1}`,
      KEY: key
    };
    for (const field of DB_BY_ENDPOINT[endpoint].fields) {
      row[field.key] = objectToString((value as Record<string, unknown>)[field.key]);
    }
    return row;
  });
};

export const createBlankRow = (endpoint: DbEndpointId, seed: number): GridRow => {
  const definition = DB_BY_ENDPOINT[endpoint];
  const row: GridRow = {
    __rowId: `row-${seed}-${Date.now()}`,
    KEY: String(seed)
  };

  for (const field of definition.fields) {
    row[field.key] = "";
  }

  return row;
};
