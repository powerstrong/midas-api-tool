import type { DbDefinition } from "../../../shared/midas";
import { cnldHelp } from "../help/cnld";

export const cnldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: "Static Loads",
  endpoint: "CNLD",
  label: "CNLD",
  description: cnldHelp.description,
  path: "db/CNLD",
  keyLabel: "NODE",
  fields: [
    { key: "ID", label: "ID", kind: "integer", width: 100 },
    { key: "LCNAME", label: "LCNAME", kind: "text", width: 140 },
    { key: "GROUP_NAME", label: "GROUP_NAME", kind: "text", width: 150 },
    { key: "FX", label: "FX", kind: "number", width: 110 },
    { key: "FY", label: "FY", kind: "number", width: 110 },
    { key: "FZ", label: "FZ", kind: "number", width: 110 },
    { key: "MX", label: "MX", kind: "number", width: 110 },
    { key: "MY", label: "MY", kind: "number", width: 110 },
    { key: "MZ", label: "MZ", kind: "number", width: 110 }
  ]
};
