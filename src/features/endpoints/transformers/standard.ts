import type { DbDefinition, GridRow, PreviewResult, RowIssue } from "../../../shared/midas";
import { buildRowIssue, normalizeKey, objectToString, parseStandardRow, pickRecord } from "./shared";

export const buildStandardPayload = (definition: DbDefinition, rows: GridRow[]): PreviewResult => {
  const assign: Record<string, unknown> = {};
  const issues: RowIssue[] = [];

  rows.forEach((row, index) => {
    const rowId = row.__rowId || `row-${index + 1}`;
    const parsed = parseStandardRow(definition, row, index + 1);
    assign[parsed.key] = parsed.value;

    if (parsed.issues.length > 0) {
      issues.push(buildRowIssue(rowId, parsed.issues));
    }
  });

  return {
    payload: { Assign: assign },
    issues
  };
};

export const rowsFromStandardGet = (definition: DbDefinition, data: unknown): GridRow[] => {
  const record = pickRecord(definition.endpoint, data);

  return Object.entries(record).flatMap(([key, value], index) => {
    if (!value || typeof value !== "object") {
      return [];
    }

    const row: GridRow = {
      __rowId: `${key}-${index + 1}`,
      KEY: normalizeKey(key, index + 1)
    };

    for (const field of definition.fields) {
      row[field.key] = objectToString((value as Record<string, unknown>)[field.key]);
    }

    return row;
  });
};

export const createStandardBlankRow = (definition: DbDefinition, seed: number): GridRow => {
  const row: GridRow = {
    __rowId: `row-${seed}-${Date.now()}`,
    KEY: String(seed)
  };

  for (const field of definition.fields) {
    row[field.key] = "";
  }

  return row;
};
