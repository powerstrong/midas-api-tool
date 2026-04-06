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
  keyHelperText: "절점의 고유 번호(ID)입니다.",
  fields: [
    { key: "X", label: "X", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.X },
    { key: "Y", label: "Y", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.Y },
    { key: "Z", label: "Z", kind: "number", width: 120, helperText: nodeHelp.fieldHelperText.Z }
  ]
};
