export const cnldHelp = {
  description: "Nodal Loads",
  keyHelperText: "Node\n절점 하중이 재하될 절점의 고유 번호(ID)입니다.",
  fieldHelperText: {
    ID: "ID\n하중 데이터를 구분하는 고유한 일련번호입니다.",
    LCNAME: "LoadCase\n하중 조건의 이름입니다. 미리 정의된 정적 하중 조건 중 하나를 선택해야 합니다.",
    FX: "FX\n전체 좌표계(GCS) X축 방향으로 작용하는 집중 하중 성분입니다.",
    FY: "FY\n전체 좌표계(GCS) Y축 방향으로 작용하는 집중 하중 성분입니다.",
    FZ: "FZ\n전체 좌표계(GCS) Z축 방향으로 작용하는 집중 하중 성분입니다.",
    MX: "MX\n전체 좌표계(GCS) X축에 대한 집중 모멘트 성분입니다.",
    MY: "MY\n전체 좌표계(GCS) Y축에 대한 집중 모멘트 성분입니다.",
    MZ: "MZ\n전체 좌표계(GCS) Z축에 대한 집중 모멘트 성분입니다.",
    GROUP_NAME: "Group\n해당 절점 하중이 속할 하중 그룹의 이름입니다. 시공 단계 해석 시 하중 제어에 사용됩니다."
  }
} as const;
