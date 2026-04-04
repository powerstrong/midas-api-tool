import type { DbDefinition } from "../../../shared/midas";

export const stldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: "Static Loads",
  endpoint: "STLD",
  label: "STLD",
  description: "Static Load Cases",
  path: "db/STLD",
  keyLabel: "KEY",
  fields: [
    { key: "NAME", label: "NAME", kind: "text", width: 160 },
    { key: "TYPE", label: "TYPE", kind: "text", width: 120, helperText: "예: D, L, USER" },
    { key: "DESC", label: "DESC", kind: "text", width: 220 }
  ]
};
