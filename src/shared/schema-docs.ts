import { DB_DEFINITIONS, DbEndpointId } from "./midas";

const endpointTitleMap: Record<DbEndpointId, string> = {
  FBLA: "Floor Load",
  STLD: "Static Load",
  CNLD: "Nodal Load",
  NODE: "Node"
};

const fieldLabelKoMap: Partial<Record<DbEndpointId, Record<string, string>>> = {
  FBLA: {
    FLOOR_LOAD_TYPE_NAME: "하중 이름",
    FLOOR_DIST_TYPE: "분배 방식",
    LOAD_ANGLE: "하중 각도",
    SUB_BEAM_NUM: "서브빔 개수",
    SUB_BEAM_ANGLE: "서브빔 각도",
    UNIT_SELF_WEIGHT: "단위 하중",
    DIR: "방향",
    OPT_PROJECTION: "투영 여부",
    DESC: "설명",
    OPT_EXCLUDE_INNER_ELEM_AREA: "내부 요소 제외",
    OPT_ALLOW_POLYGON_TYPE_UNIT_AREA: "폴리곤 단위 허용",
    GROUP_NAME: "그룹 이름",
    NODES: "노드 목록"
  },
  NODE: {
    X: "X 좌표",
    Y: "Y 좌표",
    Z: "Z 좌표"
  }
};

const kindLabelMap = {
  text: "문자열",
  number: "숫자",
  integer: "정수",
  boolean: "불리언",
  "integer-array": "정수 배열",
  "string-array": "문자열 배열",
  "object-array": "객체 배열",
  select: "선택"
} as const;

const getKoreanFieldLabel = (endpoint: DbEndpointId, fieldKey: string, fallback: string) =>
  fieldLabelKoMap[endpoint]?.[fieldKey] ?? fallback;

export const createSchemaExportData = () => ({
  appName: "midas-api-tool",
  generatedAt: new Date().toISOString(),
  endpoints: DB_DEFINITIONS.map((definition) => ({
    endpoint: definition.endpoint,
    title: endpointTitleMap[definition.endpoint],
    category: definition.categoryLabel,
    description: definition.description,
    path: definition.path,
    keyLabel: definition.keyLabel,
    fields: definition.fields.map((field) => ({
      key: field.key,
      labelKo: getKoreanFieldLabel(definition.endpoint, field.key, field.label),
      label: field.label,
      kind: field.kind,
      kindLabel: kindLabelMap[field.kind],
      placeholder: field.placeholder ?? null,
      helperText: field.helperText ?? null,
      options: field.options ?? []
    }))
  }))
});

export const createSchemaMarkdown = () => {
  const sections = DB_DEFINITIONS.map((definition) => {
    const fieldLines = definition.fields
      .map((field, index) => {
        const koLabel = getKoreanFieldLabel(definition.endpoint, field.key, field.label);
        const optionText =
          field.options && field.options.length > 0
            ? ` / 선택값: ${field.options.map((option) => `${option.value}(${option.label})`).join(", ")}`
            : "";
        const helperText = field.helperText ? ` / 설명: ${field.helperText}` : "";

        return `${index + 1}. ${koLabel} \`${field.key}\` / 타입: ${kindLabelMap[field.kind]}${optionText}${helperText}`;
      })
      .join("\n");

    return [
      `## ${endpointTitleMap[definition.endpoint]} (${definition.path})`,
      "",
      `- 분류: ${definition.categoryLabel}`,
      `- 설명: ${definition.description}`,
      `- 키 컬럼: ${definition.keyLabel}`,
      "",
      "### 컬럼",
      fieldLines
    ].join("\n");
  });

  return [
    "# midas-api-tool 스키마",
    "",
    "이 문서는 앱 실행 시 자동 생성됩니다.",
    "수정이 필요하면 앱 소스의 DB 정의를 변경한 뒤 앱을 다시 실행하세요.",
    "",
    "## 공통 입력 규칙",
    "",
    "- 한 행은 하나의 DB 레코드입니다.",
    "- 엑셀에서 여러 셀과 여러 행을 그대로 붙여넣을 수 있습니다.",
    "- boolean 허용값: `true/false`, `TRUE/FALSE`, `1/0`, `yes/no`",
    "- 정수 배열 예시: `101,102,103`",
    "",
    "## Payload 형태",
    "",
    "```json",
    "{",
    '  \"Assign\": {',
    '    \"1\": {}',
    "  }",
    "}",
    "```",
    "",
    ...sections
  ].join("\n");
};
