import type { DbDefinition } from "../../../shared/midas";
import { nodeHelp } from "../help/node";

export const nodeDefinition: DbDefinition = {
  categoryId: "modeling",
  categoryLabel: "Modeling",
  endpoint: "NODE",
  label: "NODE",
  description: nodeHelp.description,
  path: "db/NODE",
  keyLabel: "NODE",
  fields: [
    { key: "X", label: "X", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.X },
    { key: "Y", label: "Y", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.Y },
    { key: "Z", label: "Z", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.Z }
  ]
};
