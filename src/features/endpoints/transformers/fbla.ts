import { fblaDefinition } from "../definitions/fbla";
import type { GridRow, PreviewResult } from "../../../shared/midas";
import { buildStandardPayload, createStandardBlankRow, rowsFromStandardGet } from "./standard";

export const buildFblaPayload = (rows: GridRow[]): PreviewResult => buildStandardPayload(fblaDefinition, rows);

export const rowsFromFblaGet = (data: unknown): GridRow[] => rowsFromStandardGet(fblaDefinition, data);

export const createBlankFblaRow = (seed: number): GridRow => createStandardBlankRow(fblaDefinition, seed);
