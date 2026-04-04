import { stldDefinition } from "../definitions/stld";
import type { GridRow, PreviewResult } from "../../../shared/midas";
import { buildStandardPayload, createStandardBlankRow, rowsFromStandardGet } from "./standard";

export const buildStldPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(stldDefinition, rows);

export const rowsFromStldGet = (data: unknown): GridRow[] => rowsFromStandardGet(stldDefinition, data);

export const createBlankStldRow = (seed: number): GridRow => createStandardBlankRow(stldDefinition, seed);
