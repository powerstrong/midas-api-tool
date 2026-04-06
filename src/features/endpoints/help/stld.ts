export const stldHelp = {
  description: "Static Load Cases",
  keyHelperText: "NO\n정적 하중 조건의 고유 번호(ID)입니다.",
  fieldHelperText: {
    NAME: "Name\n정적 하중 조건의 고유한 이름입니다. (예: DL, LL, WL)",
    TYPE: "Type\n하중의 종류를 나타내는 코드입니다. (D: Dead, L: Live, W: Wind, S: Snow, USER: User Defined 등)",
    DESC: "Description\n해당 하중 조건에 대한 상세 설명입니다."
  }
} as const;
