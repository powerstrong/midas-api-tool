import type { DbEndpointId, GridRow, PreviewResult } from "../shared/midas";
import { buildCnldPayload, createBlankCnldRow, rowsFromCnldGet } from "../features/endpoints/transformers/cnld";
import { buildElemPayload, createBlankElemRow, rowsFromElemGet } from "../features/endpoints/transformers/elem";
import { buildFblaPayload, createBlankFblaRow, rowsFromFblaGet } from "../features/endpoints/transformers/fbla";
import { buildStldPayload, createBlankStldRow, rowsFromStldGet } from "../features/endpoints/transformers/stld";
import { buildNodePayload, createBlankNodeRow, rowsFromNodeGet } from "../features/endpoints/transformers/node";

const payloadBuilders: Record<DbEndpointId, (rows: GridRow[]) => PreviewResult> = {
  ELEM: buildElemPayload,
  FBLA: buildFblaPayload,
  STLD: buildStldPayload,
  CNLD: buildCnldPayload,
  NODE: buildNodePayload
};

const getRowBuilders: Record<DbEndpointId, (data: unknown) => GridRow[]> = {
  ELEM: rowsFromElemGet,
  FBLA: rowsFromFblaGet,
  STLD: rowsFromStldGet,
  CNLD: rowsFromCnldGet,
  NODE: rowsFromNodeGet
};

const blankRowBuilders: Record<DbEndpointId, (seed: number) => GridRow> = {
  ELEM: createBlankElemRow,
  FBLA: createBlankFblaRow,
  STLD: createBlankStldRow,
  CNLD: createBlankCnldRow,
  NODE: createBlankNodeRow
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
