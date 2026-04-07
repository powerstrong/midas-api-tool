import type { DbDefinition, FieldDefinition } from "../../../shared/midas";
import { elemHelp } from "../help/elem";

const elementTypeOptions = [
  { value: "BEAM", label: "Beam" },
  { value: "TRUSS", label: "Truss" },
  { value: "TENSTR", label: "Tension Only" },
  { value: "COMPTR", label: "Compression Only" },
  { value: "PLATE", label: "Plate" },
  { value: "WALL", label: "Wall" },
  { value: "PLSTRS", label: "Plane Stress" },
  { value: "PLSTRN", label: "Plane Strain" },
  { value: "AXISYM", label: "Axisymmetric" },
  { value: "SOLID", label: "Solid" }
] satisfies FieldDefinition["options"];

export const elemDefinition: DbDefinition = {
  categoryId: "modeling",
  categoryLabel: "Modeling",
  endpoint: "ELEM",
  label: "ELEM",
  description: elemHelp.description,
  path: "db/ELEM",
  keyLabel: "Element",
  keyHelperText: elemHelp.keyHelperText,
  fields: [
    {
      key: "TYPE",
      label: "Element Type",
      kind: "select",
      options: elementTypeOptions,
      width: 140,
      helperText: elemHelp.fieldHelperText.TYPE
    },
    { key: "MATL", label: "Material No.", kind: "integer", width: 120, helperText: elemHelp.fieldHelperText.MATL },
    {
      key: "SECT",
      label: "Section / Thickness No.",
      kind: "integer",
      width: 170,
      helperText: elemHelp.fieldHelperText.SECT
    },
    {
      key: "NODE",
      label: "Nodes",
      kind: "integer-array",
      width: 220,
      placeholder: "30,74",
      helperText: elemHelp.fieldHelperText.NODE
    },
    { key: "ANGLE", label: "Beta Angle", kind: "number", width: 120, helperText: elemHelp.fieldHelperText.ANGLE },
    { key: "STYPE", label: "Subtype", kind: "integer", width: 110, helperText: elemHelp.fieldHelperText.STYPE },
    { key: "TENS", label: "Force Value", kind: "number", width: 130, helperText: elemHelp.fieldHelperText.TENS },
    { key: "T_LIMIT", label: "Limit Value", kind: "number", width: 130, helperText: elemHelp.fieldHelperText.T_LIMIT },
    { key: "T_bLMT", label: "Use Limit", kind: "boolean", width: 110, helperText: elemHelp.fieldHelperText.T_bLMT },
    {
      key: "NON_LEN",
      label: "Nonlinear Length",
      kind: "number",
      width: 150,
      helperText: elemHelp.fieldHelperText.NON_LEN
    },
    { key: "CABLE", label: "Cable Type", kind: "integer", width: 120, helperText: elemHelp.fieldHelperText.CABLE },
    {
      key: "C_RAT",
      label: "Cable Length Ratio",
      kind: "number",
      width: 150,
      helperText: elemHelp.fieldHelperText.C_RAT
    },
    { key: "WALL", label: "Wall ID", kind: "integer", width: 110, helperText: elemHelp.fieldHelperText.WALL },
    {
      key: "W_CON",
      label: "Orientation",
      kind: "integer",
      width: 120,
      helperText: elemHelp.fieldHelperText.W_CON
    },
    { key: "W_TYPE", label: "Wall Type", kind: "integer", width: 120, helperText: elemHelp.fieldHelperText.W_TYPE },
    { key: "LCAXIS", label: "Local Axis", kind: "integer", width: 110, helperText: elemHelp.fieldHelperText.LCAXIS }
  ]
};
