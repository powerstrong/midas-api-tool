import type { DbDefinition } from "../../../shared/midas";
import { nodeHelp } from "../help/node";

export const nodeDefinition: DbDefinition = {
  categoryId: "modeling",
  categoryLabel: "Modeling",
  endpoint: "NODE",
  label: "NODE",
  description: nodeHelp.description,
  path: "db/NODE",
  keyLabel: "No.",
  keyHelperText: nodeHelp.keyHelperText,
  fields: [
    { key: "X", label: "X Coordinate", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.X },
    { key: "Y", label: "Y Coordinate", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.Y },
    { key: "Z", label: "Z Coordinate", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.Z }
  ]
};