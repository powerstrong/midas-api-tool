import type { DbEndpointId, GridRow, PreviewResult } from "../shared/midas";
import { buildCnldPayload, createBlankCnldRow, rowsFromCnldGet } from "../features/endpoints/transformers/cnld";
import { buildElemPayload, createBlankElemRow, rowsFromElemGet } from "../features/endpoints/transformers/elem";
import { buildFblaPayload, createBlankFblaRow, rowsFromFblaGet } from "../features/endpoints/transformers/fbla";
import { buildStldPayload, createBlankStldRow, rowsFromStldGet } from "../features/endpoints/transformers/stld";
import { buildNodePayload, createBlankNodeRow, rowsFromNodeGet } from "../features/endpoints/transformers/node";
import {
  buildBodfPayload,
  buildBmldPayload,
  buildSdspPayload,
  buildNmasPayload,
  buildLtomPayload,
  buildNbofPayload,
  buildPsltPayload,
  buildPresPayload,
  buildPnldPayload,
  buildPnlaPayload,
  buildFbldPayload,
  buildFmldPayload,
  buildPospPayload,
  buildEpstPayload,
  buildEpsePayload,
  buildPoslPayload,
  rowsFromBodfGet,
  rowsFromBmldGet,
  rowsFromSdspGet,
  rowsFromNmasGet,
  rowsFromLtomGet,
  rowsFromNbofGet,
  rowsFromPsltGet,
  rowsFromPresGet,
  rowsFromPnldGet,
  rowsFromPnlaGet,
  rowsFromFbldGet,
  rowsFromFmldGet,
  rowsFromPospGet,
  rowsFromEpstGet,
  rowsFromEpseGet,
  rowsFromPoslGet,
  createBlankBodfRow,
  createBlankBmldRow,
  createBlankSdspRow,
  createBlankNmasRow,
  createBlankLtomRow,
  createBlankNbofRow,
  createBlankPsltRow,
  createBlankPresRow,
  createBlankPnldRow,
  createBlankPnlaRow,
  createBlankFbldRow,
  createBlankFmldRow,
  createBlankPospRow,
  createBlankEpstRow,
  createBlankEpseRow,
  createBlankPoslRow
} from "../features/endpoints/transformers/bulk-static-loads";

const payloadBuilders: Record<DbEndpointId, (rows: GridRow[]) => PreviewResult> = {
  ELEM: buildElemPayload,
  FBLA: buildFblaPayload,
  STLD: buildStldPayload,
  CNLD: buildCnldPayload,
  NODE: buildNodePayload,
  BODF: buildBodfPayload,
  BMLD: buildBmldPayload,
  SDSP: buildSdspPayload,
  NMAS: buildNmasPayload,
  LTOM: buildLtomPayload,
  NBOF: buildNbofPayload,
  PSLT: buildPsltPayload,
  PRES: buildPresPayload,
  PNLD: buildPnldPayload,
  PNLA: buildPnlaPayload,
  FBLD: buildFbldPayload,
  FMLD: buildFmldPayload,
  POSP: buildPospPayload,
  EPST: buildEpstPayload,
  EPSE: buildEpsePayload,
  POSL: buildPoslPayload
};

const getRowBuilders: Record<DbEndpointId, (data: unknown) => GridRow[]> = {
  ELEM: rowsFromElemGet,
  FBLA: rowsFromFblaGet,
  STLD: rowsFromStldGet,
  CNLD: rowsFromCnldGet,
  NODE: rowsFromNodeGet,
  BODF: rowsFromBodfGet,
  BMLD: rowsFromBmldGet,
  SDSP: rowsFromSdspGet,
  NMAS: rowsFromNmasGet,
  LTOM: rowsFromLtomGet,
  NBOF: rowsFromNbofGet,
  PSLT: rowsFromPsltGet,
  PRES: rowsFromPresGet,
  PNLD: rowsFromPnldGet,
  PNLA: rowsFromPnlaGet,
  FBLD: rowsFromFbldGet,
  FMLD: rowsFromFmldGet,
  POSP: rowsFromPospGet,
  EPST: rowsFromEpstGet,
  EPSE: rowsFromEpseGet,
  POSL: rowsFromPoslGet
};

const blankRowBuilders: Record<DbEndpointId, (seed: number) => GridRow> = {
  ELEM: createBlankElemRow,
  FBLA: createBlankFblaRow,
  STLD: createBlankStldRow,
  CNLD: createBlankCnldRow,
  NODE: createBlankNodeRow,
  BODF: createBlankBodfRow,
  BMLD: createBlankBmldRow,
  SDSP: createBlankSdspRow,
  NMAS: createBlankNmasRow,
  LTOM: createBlankLtomRow,
  NBOF: createBlankNbofRow,
  PSLT: createBlankPsltRow,
  PRES: createBlankPresRow,
  PNLD: createBlankPnldRow,
  PNLA: createBlankPnlaRow,
  FBLD: createBlankFbldRow,
  FMLD: createBlankFmldRow,
  POSP: createBlankPospRow,
  EPST: createBlankEpstRow,
  EPSE: createBlankEpseRow,
  POSL: createBlankPoslRow
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
