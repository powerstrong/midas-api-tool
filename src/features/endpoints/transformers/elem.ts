import { elemDefinition } from "../definitions/elem";
import type { CellIssue, GridRow, PreviewResult, RowIssue } from "../../../shared/midas";
import { buildRowIssue, makeIssue, normalizeKey, objectToString, parseValue, pickRecord } from "./shared";

const elementTypes = new Set([
  "BEAM",
  "TRUSS",
  "TENSTR",
  "COMPTR",
  "PLATE",
  "WALL",
  "PLSTRS",
  "PLSTRN",
  "AXISYM",
  "SOLID"
]);

const trimTrailingZeros = (nodes: number[]) => {
  const next = [...nodes];
  while (next.length > 0 && next[next.length - 1] === 0) {
    next.pop();
  }
  return next;
};

const getRequiredNodeCounts = (type: string) => {
  switch (type) {
    case "BEAM":
    case "TRUSS":
    case "TENSTR":
    case "COMPTR":
      return [2];
    case "PLATE":
    case "PLSTRS":
    case "PLSTRN":
    case "AXISYM":
      return [3, 4];
    case "WALL":
      return [4];
    case "SOLID":
      return [4, 6, 8];
    default:
      return [] as number[];
  }
};

const parseElemRow = (
  row: GridRow,
  fallbackKey: number
): { key: string; value: Record<string, unknown>; issues: CellIssue[] } => {
  const issues: CellIssue[] = [];
  const value: Record<string, unknown> = {};
  const typeRaw = (row.TYPE ?? "").trim().toUpperCase();
  const type = typeRaw || "BEAM";

  if (!elementTypes.has(type)) {
    issues.push(makeIssue("TYPE", "지원되지 않는 요소 타입입니다."));
  } else {
    value.TYPE = type;
  }

  for (const field of elemDefinition.fields) {
    if (field.key === "TYPE") {
      continue;
    }

    const result = parseValue(field.kind, row[field.key] ?? "");
    if (!result.ok) {
      issues.push(makeIssue(field.key, result.issue));
      continue;
    }

    if (result.value !== undefined) {
      value[field.key] = result.value;
    }
  }

  if (value.MATL === undefined) {
    issues.push(makeIssue("MATL", "재료 번호는 필수입니다."));
  }

  if (value.SECT === undefined) {
    issues.push(makeIssue("SECT", "단면 또는 두께 번호는 필수입니다."));
  }

  if (!Array.isArray(value.NODE)) {
    issues.push(makeIssue("NODE", "연결 절점 번호는 필수입니다."));
  } else {
    const normalizedNodes = trimTrailingZeros(value.NODE as number[]);
    value.NODE = normalizedNodes;

    const requiredCounts = getRequiredNodeCounts(type);
    if (requiredCounts.length > 0 && !requiredCounts.includes(normalizedNodes.length)) {
      issues.push(makeIssue("NODE", `이 요소 타입은 ${requiredCounts.join(" 또는 ")}개의 절점 번호가 필요합니다.`));
    }
  }

  const subtype = typeof value.STYPE === "number" ? value.STYPE : undefined;

  if (
    (type === "TENSTR" || type === "COMPTR" || type === "WALL" || type === "PLATE" || type === "PLSTRS") &&
    subtype === undefined
  ) {
    issues.push(makeIssue("STYPE", "이 요소 타입은 subtype 입력이 필요합니다."));
  }

  if (type === "WALL") {
    if (value.WALL === undefined) {
      issues.push(makeIssue("WALL", "WALL 타입은 Wall ID가 필요합니다."));
    }

    if (value.W_CON === undefined) {
      issues.push(makeIssue("W_CON", "WALL 타입은 Orientation 값이 필요합니다."));
    }
  }

  if (type === "TENSTR" && subtype === 3 && value.CABLE === undefined) {
    issues.push(makeIssue("CABLE", "TENSTR cable subtype은 Cable Type이 필요합니다."));
  }

  if (type === "TENSTR" && subtype === 3 && value.CABLE === 3 && value.NON_LEN === undefined) {
    issues.push(makeIssue("NON_LEN", "Cable Type 3은 NON_LEN 값이 필요합니다."));
  }

  return {
    key: normalizeKey(row.KEY ?? "", fallbackKey),
    value,
    issues
  };
};

export const buildElemPayload = (rows: GridRow[]): PreviewResult => {
  const assign: Record<string, unknown> = {};
  const issues: RowIssue[] = [];

  rows.forEach((row, index) => {
    const rowId = row.__rowId || `row-${index + 1}`;
    const parsed = parseElemRow(row, index + 1);
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

export const rowsFromElemGet = (data: unknown): GridRow[] => {
  const record = pickRecord(elemDefinition.endpoint, data);

  return Object.entries(record).flatMap(([key, value], index) => {
    if (!value || typeof value !== "object") {
      return [];
    }

    const item = value as Record<string, unknown>;
    const row: GridRow = {
      __rowId: `${key}-${index + 1}`,
      KEY: normalizeKey(key, index + 1)
    };

    for (const field of elemDefinition.fields) {
      if (field.key === "NODE" && Array.isArray(item.NODE)) {
        row[field.key] = trimTrailingZeros(item.NODE as number[]).join(",");
        continue;
      }

      row[field.key] = objectToString(item[field.key]);
    }

    return row;
  });
};

export const createBlankElemRow = (seed: number): GridRow => {
  const row: GridRow = {
    __rowId: `row-${seed}-${Date.now()}`,
    KEY: String(seed),
    TYPE: "BEAM"
  };

  for (const field of elemDefinition.fields) {
    if (field.key === "TYPE") {
      continue;
    }

    row[field.key] = "";
  }

  return row;
};
