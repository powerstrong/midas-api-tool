import { DB_DEFINITIONS, DbEndpointId } from "./midas";

const fieldLabelKoMap: Partial<Record<DbEndpointId, Record<string, string>>> = {
  FBLA: {
    FLOOR_LOAD_TYPE_NAME: "\uD558\uC911 \uC774\uB984",
    FLOOR_DIST_TYPE: "\uBD84\uD3EC \uBC29\uC2DD",
    LOAD_ANGLE: "\uD558\uC911 \uAC01\uB3C4",
    SUB_BEAM_NUM: "\uC11C\uBE0C \uBE54 \uAC1C\uC218",
    SUB_BEAM_ANGLE: "\uC11C\uBE0C \uBE54 \uAC01\uB3C4",
    UNIT_SELF_WEIGHT: "\uB2E8\uC704 \uC790\uC911",
    DIR: "\uBC29\uD5A5",
    OPT_PROJECTION: "\uD22C\uC601 \uC5EC\uBD80",
    DESC: "\uC124\uBA85",
    OPT_EXCLUDE_INNER_ELEM_AREA: "\uB0B4\uBD80 \uC694\uC18C \uC81C\uC678",
    OPT_ALLOW_POLYGON_TYPE_UNIT_AREA: "\uB2E4\uAC01\uD615 \uB2E8\uC704 \uBA74\uC801 \uD5C8\uC6A9",
    GROUP_NAME: "\uADF8\uB8F9 \uC774\uB984",
    NODES: "\uB178\uB4DC \uBAA9\uB85D"
  },
  NODE: {
    X: "X \uC88C\uD45C",
    Y: "Y \uC88C\uD45C",
    Z: "Z \uC88C\uD45C"
  },
  ELEM: {
    TYPE: "\uC694\uC18C \uC885\uB958",
    MATL: "\uC7AC\uB8CC \uBC88\uD638",
    SECT: "\uB2E8\uBA74 \uB610\uB294 \uB450\uAED8 \uBC88\uD638",
    NODE: "\uC5F0\uACB0 \uC808\uC810 \uBC88\uD638",
    ANGLE: "\uBCA0\uD0C0 \uAC01",
    STYPE: "\uC694\uC18C \uC138\uBD80 \uC885\uB958",
    TENS: "\uD798 \uAC12",
    T_LIMIT: "\uD55C\uACC4\uAC12",
    T_bLMT: "\uD55C\uACC4 \uC0AC\uC6A9",
    NON_LEN: "\uBE44\uC120\uD615 \uAE38\uC774",
    CABLE: "\uCF00\uC774\uBE14 \uD0C0\uC785",
    C_RAT: "\uCF00\uC774\uBE14 \uAE38\uC774 \uBE44",
    WALL: "\uBCBD\uCCB4 ID",
    W_CON: "\uBC29\uD5A5 \uC815\uC758",
    W_TYPE: "\uBCBD\uCCB4 \uD0C0\uC785",
    LCAXIS: "\uB85C\uCEEC \uCD95"
  }
};

const kindLabelMap = {
  text: "\uBB38\uC790\uC5F4",
  number: "\uC22B\uC790",
  integer: "\uC815\uC218",
  boolean: "\uBD88\uB9AC\uC5B8",
  "integer-array": "\uC815\uC218 \uBC30\uC5F4",
  "number-array": "\uC22B\uC790 \uBC30\uC5F4",
  "string-array": "\uBB38\uC790\uC5F4 \uBC30\uC5F4",
  object: "\uAC1D\uCCB4",
  "object-array": "\uAC1D\uCCB4 \uBC30\uC5F4",
  select: "\uC120\uD0DD"
} as const;

const getKoreanFieldLabel = (endpoint: DbEndpointId, fieldKey: string, fallback: string) =>
  fieldLabelKoMap[endpoint]?.[fieldKey] ?? fallback;

export const createSchemaExportData = () => ({
  appName: "midas-api-tool",
  generatedAt: new Date().toISOString(),
  endpoints: DB_DEFINITIONS.map((definition) => ({
    endpoint: definition.endpoint,
    title: definition.label,
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
            ? ` / \uC120\uD0DD\uAC12 ${field.options.map((option) => `${option.value}(${option.label})`).join(", ")}`
            : "";
        const helperText = field.helperText ? ` / \uC124\uBA85: ${field.helperText}` : "";

        return `${index + 1}. ${koLabel} \`${field.key}\` / \uD0C0\uC785 ${kindLabelMap[field.kind]}${optionText}${helperText}`;
      })
      .join("\n");

    return [
      `## ${definition.label} (${definition.path})`,
      "",
      `- \uBD84\uB958: ${definition.categoryLabel}`,
      `- \uC124\uBA85: ${definition.description}`,
      `- \uD0A4 \uCEE4\uB7FC: ${definition.keyLabel}`,
      "",
      "### \uCEE4\uB7FC",
      fieldLines
    ].join("\n");
  });

  return [
    "# midas-api-tool \uC2A4\uD0A4\uB9C8",
    "",
    "\uC774 \uBB38\uC11C\uB294 \uC571 \uC2E4\uD589 \uC2DC \uC790\uB3D9 \uC0DD\uC131\uB429\uB2C8\uB2E4.",
    "\uC218\uC815\uC774 \uD544\uC694\uD558\uBA74 \uC18C\uC2A4\uC758 DB \uC815\uC758\uB97C \uBCC0\uACBD\uD55C \uB4A4 \uB2E4\uC2DC \uC0DD\uC131\uD558\uC138\uC694.",
    "",
    "## \uACF5\uD1B5 \uC785\uB825 \uADDC\uCE59",
    "",
    "- \uAC01 \uD589\uC740 \uD558\uB098\uC758 DB \uB808\uCF54\uB4DC\uC785\uB2C8\uB2E4.",
    "- \uC5EC\uB7EC \uD589\uACFC \uC5F4\uC744 \uADF8\uB300\uB85C \uBD99\uC5EC\uB123\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    "- boolean \uD5C8\uC6A9\uAC12: true/false, TRUE/FALSE, 1/0, yes/no",
    "- \uC815\uC218 \uBC30\uC5F4 \uC608\uC2DC: 101,102,103",
    "- \uC22B\uC790 \uBC30\uC5F4 \uC608\uC2DC: 0,0,-1",
    "- JSON \uAC1D\uCCB4 \uC608\uC2DC: {\"KEY\":1}",
    "- JSON \uAC1D\uCCB4 \uBC30\uC5F4 \uC608\uC2DC: [{\"KEY\":1}]",
    "",
    "## Payload \uD615\uD0DC",
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
