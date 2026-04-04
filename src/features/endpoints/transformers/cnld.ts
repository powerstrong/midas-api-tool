import { cnldDefinition } from "../definitions/cnld";
import type { GridRow, PreviewResult, RowIssue } from "../../../shared/midas";
import { buildRowIssue, normalizeKey, objectToString, parseValue, pickRecord } from "./shared";
import { createStandardBlankRow } from "./standard";

export const buildCnldPayload = (rows: GridRow[]): PreviewResult => {
  const issues: RowIssue[] = [];
  const grouped = new Map<string, Array<Record<string, unknown>>>();

  rows.forEach((row, index) => {
    const rowId = row.__rowId || `row-${index + 1}`;
    const rowIssues = [];
    const nodeKey = normalizeKey(row.KEY ?? "", index + 1);
    const item: Record<string, unknown> = {};

    for (const field of cnldDefinition.fields) {
      const result = parseValue(field.kind, row[field.key] ?? "");
      if (!result.ok) {
        rowIssues.push({ fieldKey: field.key, message: result.issue });
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
      issues.push(buildRowIssue(rowId, rowIssues));
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

export const rowsFromCnldGet = (data: unknown): GridRow[] => {
  const record = pickRecord(cnldDefinition.endpoint, data);

  return Object.entries(record).flatMap(([key, value], index) => {
    if (!value || typeof value !== "object") {
      return [];
    }

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
        for (const field of cnldDefinition.fields) {
          row[field.key] = objectToString((item as Record<string, unknown>)[field.key]);
        }
      }

      return row;
    });
  });
};

export const createBlankCnldRow = (seed: number): GridRow => createStandardBlankRow(cnldDefinition, seed);
