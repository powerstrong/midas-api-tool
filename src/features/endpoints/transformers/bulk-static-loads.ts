import type { DbDefinition, GridRow, PreviewResult, RowIssue } from "../../../shared/midas";
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
} from "../definitions/bulk-static-loads";
import { buildRowIssue, normalizeKey, objectToString, parseValue, pickRecord } from "./shared";
import { buildStandardPayload, createStandardBlankRow, rowsFromStandardGet } from "./standard";

const buildGroupedItemsPayload = (definition: DbDefinition, rows: GridRow[]): PreviewResult => {
  const issues: RowIssue[] = [];
  const grouped = new Map<string, Array<Record<string, unknown>>>();

  rows.forEach((row, index) => {
    const rowId = row.__rowId || `row-${index + 1}`;
    const rowIssues = [];
    const key = normalizeKey(row.KEY ?? "", index + 1);
    const item: Record<string, unknown> = {};

    for (const field of definition.fields) {
      const result = parseValue(field.kind, row[field.key] ?? "");
      if (!result.ok) {
        rowIssues.push({ fieldKey: field.key, message: result.issue });
        continue;
      }

      if (result.value !== undefined) {
        item[field.key] = result.value;
      }
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }

    grouped.get(key)?.push(item);

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

const rowsFromGroupedItemsGet = (definition: DbDefinition, data: unknown): GridRow[] => {
  const record = pickRecord(definition.endpoint, data);

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
        for (const field of definition.fields) {
          row[field.key] = objectToString((item as Record<string, unknown>)[field.key]);
        }
      }

      return row;
    });
  });
};

const createBulkBlankRow = (definition: DbDefinition, seed: number) => createStandardBlankRow(definition, seed);

export const buildBodfPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(bodfDefinition, rows);
export const rowsFromBodfGet = (data: unknown): GridRow[] => rowsFromStandardGet(bodfDefinition, data);
export const createBlankBodfRow = (seed: number): GridRow => createBulkBlankRow(bodfDefinition, seed);

export const buildBmldPayload = (rows: GridRow[]): PreviewResult => buildGroupedItemsPayload(bmldDefinition, rows);
export const rowsFromBmldGet = (data: unknown): GridRow[] => rowsFromGroupedItemsGet(bmldDefinition, data);
export const createBlankBmldRow = (seed: number): GridRow => createBulkBlankRow(bmldDefinition, seed);

export const buildSdspPayload = (rows: GridRow[]): PreviewResult => buildGroupedItemsPayload(sdspDefinition, rows);
export const rowsFromSdspGet = (data: unknown): GridRow[] => rowsFromGroupedItemsGet(sdspDefinition, data);
export const createBlankSdspRow = (seed: number): GridRow => createBulkBlankRow(sdspDefinition, seed);

export const buildNmasPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(nmasDefinition, rows);
export const rowsFromNmasGet = (data: unknown): GridRow[] => rowsFromStandardGet(nmasDefinition, data);
export const createBlankNmasRow = (seed: number): GridRow => createBulkBlankRow(nmasDefinition, seed);

export const buildLtomPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(ltomDefinition, rows);
export const rowsFromLtomGet = (data: unknown): GridRow[] => rowsFromStandardGet(ltomDefinition, data);
export const createBlankLtomRow = (seed: number): GridRow => createBulkBlankRow(ltomDefinition, seed);

export const buildNbofPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(nbofDefinition, rows);
export const rowsFromNbofGet = (data: unknown): GridRow[] => rowsFromStandardGet(nbofDefinition, data);
export const createBlankNbofRow = (seed: number): GridRow => createBulkBlankRow(nbofDefinition, seed);

export const buildPsltPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(psltDefinition, rows);
export const rowsFromPsltGet = (data: unknown): GridRow[] => rowsFromStandardGet(psltDefinition, data);
export const createBlankPsltRow = (seed: number): GridRow => createBulkBlankRow(psltDefinition, seed);

export const buildPresPayload = (rows: GridRow[]): PreviewResult => buildGroupedItemsPayload(presDefinition, rows);
export const rowsFromPresGet = (data: unknown): GridRow[] => rowsFromGroupedItemsGet(presDefinition, data);
export const createBlankPresRow = (seed: number): GridRow => createBulkBlankRow(presDefinition, seed);

export const buildPnldPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(pnldDefinition, rows);
export const rowsFromPnldGet = (data: unknown): GridRow[] => rowsFromStandardGet(pnldDefinition, data);
export const createBlankPnldRow = (seed: number): GridRow => createBulkBlankRow(pnldDefinition, seed);

export const buildPnlaPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(pnlaDefinition, rows);
export const rowsFromPnlaGet = (data: unknown): GridRow[] => rowsFromStandardGet(pnlaDefinition, data);
export const createBlankPnlaRow = (seed: number): GridRow => createBulkBlankRow(pnlaDefinition, seed);

export const buildFbldPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(fbldDefinition, rows);
export const rowsFromFbldGet = (data: unknown): GridRow[] => rowsFromStandardGet(fbldDefinition, data);
export const createBlankFbldRow = (seed: number): GridRow => createBulkBlankRow(fbldDefinition, seed);

export const buildFmldPayload = (rows: GridRow[]): PreviewResult => buildGroupedItemsPayload(fmldDefinition, rows);
export const rowsFromFmldGet = (data: unknown): GridRow[] => rowsFromGroupedItemsGet(fmldDefinition, data);
export const createBlankFmldRow = (seed: number): GridRow => createBulkBlankRow(fmldDefinition, seed);

export const buildPospPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(pospDefinition, rows);
export const rowsFromPospGet = (data: unknown): GridRow[] => rowsFromStandardGet(pospDefinition, data);
export const createBlankPospRow = (seed: number): GridRow => createBulkBlankRow(pospDefinition, seed);

export const buildEpstPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(epstDefinition, rows);
export const rowsFromEpstGet = (data: unknown): GridRow[] => rowsFromStandardGet(epstDefinition, data);
export const createBlankEpstRow = (seed: number): GridRow => createBulkBlankRow(epstDefinition, seed);

export const buildEpsePayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(epseDefinition, rows);
export const rowsFromEpseGet = (data: unknown): GridRow[] => rowsFromStandardGet(epseDefinition, data);
export const createBlankEpseRow = (seed: number): GridRow => createBulkBlankRow(epseDefinition, seed);

export const buildPoslPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(poslDefinition, rows);
export const rowsFromPoslGet = (data: unknown): GridRow[] => rowsFromStandardGet(poslDefinition, data);
export const createBlankPoslRow = (seed: number): GridRow => createBulkBlankRow(poslDefinition, seed);
