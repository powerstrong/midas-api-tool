import type { DbDefinition } from "../../../shared/midas";
import { cnldHelp } from "../help/cnld";

export const cnldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: "Static Loads",
  endpoint: "CNLD",
  label: "CNLD",
  description: cnldHelp.description,
  path: "db/CNLD",
  keyLabel: "Node",
  keyHelperText: cnldHelp.keyHelperText,
  fields: [
    { key: "ID", label: "ID", kind: "integer", width: 100, helperText: cnldHelp.fieldHelperText.ID },
    { key: "LCNAME", label: "Load Case", kind: "text", width: 140, helperText: cnldHelp.fieldHelperText.LCNAME },
    { key: "GROUP_NAME", label: "Group", kind: "text", width: 150, helperText: cnldHelp.fieldHelperText.GROUP_NAME },
    { key: "FX", label: "FX", kind: "number", width: 110, helperText: cnldHelp.fieldHelperText.FX },
    { key: "FY", label: "FY", kind: "number", width: 110, helperText: cnldHelp.fieldHelperText.FY },
    { key: "FZ", label: "FZ", kind: "number", width: 110, helperText: cnldHelp.fieldHelperText.FZ },
    { key: "MX", label: "MX", kind: "number", width: 110, helperText: cnldHelp.fieldHelperText.MX },
    { key: "MY", label: "MY", kind: "number", width: 110, helperText: cnldHelp.fieldHelperText.MY },
    { key: "MZ", label: "MZ", kind: "number", width: 110, helperText: cnldHelp.fieldHelperText.MZ }
  ]
};