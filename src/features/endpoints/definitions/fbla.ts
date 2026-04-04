import type { DbDefinition, FieldDefinition } from "../../../shared/midas";
import { fblaHelp } from "../help/fbla";

const distributionOptions = [
  { value: "1", label: "One Way" },
  { value: "2", label: "Two Way" },
  { value: "3", label: "Polygon-Centroid" },
  { value: "4", label: "Polygon-Length" }
] satisfies FieldDefinition["options"];

const directionOptions = [
  { value: "LX", label: "LX" },
  { value: "LY", label: "LY" },
  { value: "LZ", label: "LZ" },
  { value: "GX", label: "GX" },
  { value: "GY", label: "GY" },
  { value: "GZ", label: "GZ" }
] satisfies FieldDefinition["options"];

export const fblaDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: "Static Loads",
  endpoint: "FBLA",
  label: "FBLA",
  description: fblaHelp.description,
  path: "db/FBLA",
  keyLabel: "KEY",
  fields: [
    { key: "FLOOR_LOAD_TYPE_NAME", label: "FLOOR_LOAD_TYPE_NAME", kind: "text", width: 180 },
    { key: "FLOOR_DIST_TYPE", label: "FLOOR_DIST_TYPE", kind: "select", options: distributionOptions, width: 150 },
    { key: "LOAD_ANGLE", label: "LOAD_ANGLE", kind: "number", width: 120 },
    { key: "SUB_BEAM_NUM", label: "SUB_BEAM_NUM", kind: "integer", width: 140 },
    { key: "SUB_BEAM_ANGLE", label: "SUB_BEAM_ANGLE", kind: "number", width: 150 },
    { key: "UNIT_SELF_WEIGHT", label: "UNIT_SELF_WEIGHT", kind: "number", width: 150 },
    { key: "DIR", label: "DIR", kind: "select", options: directionOptions, width: 110 },
    { key: "OPT_PROJECTION", label: "OPT_PROJECTION", kind: "boolean", width: 135 },
    { key: "DESC", label: "DESC", kind: "text", width: 180 },
    {
      key: "OPT_EXCLUDE_INNER_ELEM_AREA",
      label: "OPT_EXCLUDE_INNER_ELEM_AREA",
      kind: "boolean",
      width: 230
    },
    {
      key: "OPT_ALLOW_POLYGON_TYPE_UNIT_AREA",
      label: "OPT_ALLOW_POLYGON_TYPE_UNIT_AREA",
      kind: "boolean",
      width: 250
    },
    { key: "GROUP_NAME", label: "GROUP_NAME", kind: "text", width: 150 },
    {
      key: "NODES",
      label: "NODES",
      kind: "integer-array",
      placeholder: "101,102,103",
      helperText: fblaHelp.fieldHelperText.NODES,
      width: 220
    }
  ]
};
