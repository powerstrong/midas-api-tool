import type { DbDefinition } from "../../../shared/midas";
import { stldHelp } from "../help/stld";

export const stldDefinition: DbDefinition = {
  categoryId: "static-loads",
  categoryLabel: "Static Loads",
  endpoint: "STLD",
  label: "STLD",
  description: stldHelp.description,
  path: "db/STLD",
  keyLabel: "No.",
  keyHelperText: "정적 하중 조건의 고유 번호(ID)입니다.",
  fields: [
    {
      key: "NAME",
      label: "Name",
      kind: "text",
      width: 160,
      helperText: "정적 하중 조건의 고유 이름입니다. 예: DL, LL, WL"
    },
    {
      key: "TYPE",
      label: "Type",
      kind: "text",
      width: 120,
      helperText: "하중 종류를 나타내는 코드입니다. 예: D, L, W, S, USER"
    },
    {
      key: "DESC",
      label: "Description",
      kind: "text",
      width: 220,
      helperText: "정적 하중 조건에 대한 상세 설명입니다."
    }
  ]
};