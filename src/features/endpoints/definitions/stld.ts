import type { DbDefinition } from "../../../shared/midas";
import { stldHelp } from "../help/stld";

export const stldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: "Static Loads",
  endpoint: "STLD",
  label: "STLD",
  description: stldHelp.description,
  path: "db/STLD",
  keyLabel: "KEY",
  keyHelperText: stldHelp.keyHelperText,
  fields: [
    { key: "NAME", label: "NAME", kind: "text", width: 160, helperText: stldHelp.fieldHelperText.NAME },
    { key: "TYPE", label: "TYPE", kind: "text", width: 120, helperText: stldHelp.fieldHelperText.TYPE },
    { key: "DESC", label: "DESC", kind: "text", width: 220, helperText: stldHelp.fieldHelperText.DESC }
  ]
};
