import { z } from "zod";
import type { CellIssue, DbDefinition, GridRow, RowIssue } from "../../../shared/midas";

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

export const blankToUndefined = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

export const makeIssue = (fieldKey: string, message: string): CellIssue => ({ fieldKey, message });

export const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "") {
    return { ok: true as const, value: undefined };
  }

  if (normalized in booleanMap) {
    return { ok: true as const, value: booleanMap[normalized] };
  }

  return { ok: false as const, issue: "boolean \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
};

export const parseIntegerArray = (value: string) => {
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
    return { ok: false as const, issue: "\uC815\uC218 \uBC30\uC5F4 \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
  }

  return {
    ok: true as const,
    value: parsed.map((result) => (result as { success: true; data: number }).data)
  };
};

export const parseNumberArray = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true as const, value: undefined };
  }

  const items = trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const parsed = items.map((item) => numberSchema.safeParse(item));
  const hasError = parsed.some((result) => !result.success);

  if (hasError) {
    return { ok: false as const, issue: "\uC22B\uC790 \uBC30\uC5F4 \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
  }

  return {
    ok: true as const,
    value: parsed.map((result) => (result as { success: true; data: number }).data)
  };
};

export const parseStringArray = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true as const, value: undefined };
  }

  return {
    ok: true as const,
    value: trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  };
};

const parseJson = (value: string) => {
  try {
    return { ok: true as const, value: JSON.parse(value) };
  } catch {
    return { ok: false as const, issue: "JSON \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
  }
};

export const parseObject = (value: string) => {
  const parsed = parseJson(value);
  if (!parsed.ok) {
    return parsed;
  }

  if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
    return { ok: false as const, issue: "\uAC1D\uCCB4 JSON\uC744 \uC785\uB825\uD574\uC57C \uD569\uB2C8\uB2E4." };
  }

  return parsed;
};

export const parseObjectArray = (value: string) => {
  const parsed = parseJson(value);
  if (!parsed.ok) {
    return parsed;
  }

  if (!Array.isArray(parsed.value) || parsed.value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    return { ok: false as const, issue: "\uAC1D\uCCB4 \uBC30\uC5F4 JSON\uC744 \uC785\uB825\uD574\uC57C \uD569\uB2C8\uB2E4." };
  }

  return parsed;
};

export const parseValue = (kind: DbDefinition["fields"][number]["kind"], value: string) => {
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
      : { ok: false as const, issue: "\uC815\uC218 \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
  }

  if (kind === "number") {
    const result = numberSchema.safeParse(normalized);
    return result.success
      ? { ok: true as const, value: result.data }
      : { ok: false as const, issue: "\uC22B\uC790 \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." };
  }

  if (kind === "boolean") {
    return parseBoolean(normalized);
  }

  if (kind === "integer-array") {
    return parseIntegerArray(normalized);
  }

  if (kind === "number-array") {
    return parseNumberArray(normalized);
  }

  if (kind === "string-array") {
    return parseStringArray(normalized);
  }

  if (kind === "object") {
    return parseObject(normalized);
  }

  if (kind === "object-array") {
    return parseObjectArray(normalized);
  }

  return { ok: true as const, value: normalized };
};

export const normalizeKey = (value: string, fallback: number) => {
  const trimmed = value.trim();
  return trimmed || String(fallback);
};

export const objectToString = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    const hasObject = value.some((item) => item !== null && typeof item === "object");
    return hasObject ? JSON.stringify(value) : value.join(",");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  return String(value);
};

export const parseStandardRow = (
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

export const pickRecord = (endpoint: string, data: unknown) => {
  if (!data || typeof data !== "object") {
    return {} as Record<string, unknown>;
  }

  const source = data as Record<string, unknown>;
  const candidate =
    source.Assign && typeof source.Assign === "object"
      ? (source.Assign as Record<string, unknown>)
      : source[endpoint] && typeof source[endpoint] === "object"
        ? (source[endpoint] as Record<string, unknown>)
        : source;

  return candidate as Record<string, unknown>;
};

export const buildRowIssue = (rowId: string, cells: CellIssue[]): RowIssue => ({ rowId, cells });
