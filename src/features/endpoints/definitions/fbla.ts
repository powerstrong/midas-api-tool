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
  keyLabel: "No.",
  keyHelperText: fblaHelp.keyHelperText,
  fields: [
    { key: "FLOOR_LOAD_TYPE_NAME", label: "Load Type", kind: "text", width: 180, helperText: fblaHelp.fieldHelperText.FLOOR_LOAD_TYPE_NAME },
    { key: "FLOOR_DIST_TYPE", label: "Distribution Type", kind: "select", options: distributionOptions, width: 150, helperText: fblaHelp.fieldHelperText.FLOOR_DIST_TYPE },
    { key: "LOAD_ANGLE", label: "Load Angle", kind: "number", width: 120, helperText: fblaHelp.fieldHelperText.LOAD_ANGLE },
    { key: "SUB_BEAM_NUM", label: "Sub Beam No.", kind: "integer", width: 140, helperText: fblaHelp.fieldHelperText.SUB_BEAM_NUM },
    { key: "SUB_BEAM_ANGLE", label: "Sub Beam Angle", kind: "number", width: 150, helperText: fblaHelp.fieldHelperText.SUB_BEAM_ANGLE },
    { key: "UNIT_SELF_WEIGHT", label: "Unit Self Weight", kind: "number", width: 150, helperText: fblaHelp.fieldHelperText.UNIT_SELF_WEIGHT },
    { key: "DIR", label: "Load Direction", kind: "select", options: directionOptions, width: 110, helperText: fblaHelp.fieldHelperText.DIR },
    { key: "OPT_PROJECTION", label: "Projection", kind: "boolean", width: 135, helperText: fblaHelp.fieldHelperText.OPT_PROJECTION },
    { key: "DESC", label: "Description", kind: "text", width: 180, helperText: fblaHelp.fieldHelperText.DESC },
    {
      key: "OPT_EXCLUDE_INNER_ELEM_AREA",
      label: "Exclude Inner Element Area",
      kind: "boolean",
      width: 230,
      helperText: fblaHelp.fieldHelperText.OPT_EXCLUDE_INNER_ELEM_AREA
    },
    {
      key: "OPT_ALLOW_POLYGON_TYPE_UNIT_AREA",
      label: "Allow Polygon Type Unit Area",
      kind: "boolean",
      width: 250,
      helperText: fblaHelp.fieldHelperText.OPT_ALLOW_POLYGON_TYPE_UNIT_AREA
    },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 150, helperText: fblaHelp.fieldHelperText.GROUP_NAME },
    {
      key: "NODES",
      label: "Nodes for Loading Area",
      kind: "integer-array",
      placeholder: "101,102,103",
      helperText: fblaHelp.fieldHelperText.NODES,
      width: 220
    }
  ]
};