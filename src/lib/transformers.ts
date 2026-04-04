import type { DbEndpointId, GridRow, PreviewResult } from "../shared/midas";
import { buildCnldPayload, createBlankCnldRow, rowsFromCnldGet } from "../features/endpoints/transformers/cnld";
import { buildFblaPayload, createBlankFblaRow, rowsFromFblaGet } from "../features/endpoints/transformers/fbla";
import { buildStldPayload, createBlankStldRow, rowsFromStldGet } from "../features/endpoints/transformers/stld";

const payloadBuilders: Record<DbEndpointId, (rows: GridRow[]) => PreviewResult> = {
  FBLA: buildFblaPayload,
  STLD: buildStldPayload,
  CNLD: buildCnldPayload
};

const getRowBuilders: Record<DbEndpointId, (data: unknown) => GridRow[]> = {
  FBLA: rowsFromFblaGet,
  STLD: rowsFromStldGet,
  CNLD: rowsFromCnldGet
};

const blankRowBuilders: Record<DbEndpointId, (seed: number) => GridRow> = {
  FBLA: createBlankFblaRow,
  STLD: createBlankStldRow,
  CNLD: createBlankCnldRow
};

export const buildPayload = (endpoint: DbEndpointId, rows: GridRow[]): PreviewResult => {
  return payloadBuilders[endpoint](rows);
};

export const rowsFromGetResponse = (endpoint: DbEndpointId, data: unknown): GridRow[] => {
  return getRowBuilders[endpoint](data);
};

export const createBlankRow = (endpoint: DbEndpointId, seed: number): GridRow => {
  return blankRowBuilders[endpoint](seed);
};
