import { nodeDefinition } from "../definitions/node";
import type { GridRow, PreviewResult } from "../../../shared/midas";
import { buildStandardPayload, createStandardBlankRow, rowsFromStandardGet } from "./standard";

export const buildNodePayload = (rows: GridRow[]): PreviewResult => {
  return buildStandardPayload(nodeDefinition, rows);
};

export const rowsFromNodeGet = (data: unknown): GridRow[] => {
  return rowsFromStandardGet(nodeDefinition, data);
};

export const createBlankNodeRow = (seed: number): GridRow => {
  return createStandardBlankRow(nodeDefinition, seed);
};
