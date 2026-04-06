export const fblaHelp = {
  description: "Assign Floor Loads",
  keyHelperText: "No.\n바닥 하중의 고유 번호(ID)입니다.",
  fieldHelperText: {
    FLOOR_LOAD_TYPE_NAME: "Load Type\n정의된 바닥 하중 유형의 이름입니다. (예: Office, Roof)",
    FLOOR_DIST_TYPE: "Distribution Type\n하중 분배 방식을 선택합니다. (One Way: 일방향, Two Way: 이방향 등)",
    LOAD_ANGLE: "Load Angle\n하중이 작용하는 평면상의 각도입니다.",
    SUB_BEAM_NUM: "Sub Beam No\n바닥 하중을 분배하기 위한 서브 빔의 개수입니다.",
    SUB_BEAM_ANGLE: "Sub Beam Angle\n서브 빔의 배치 각도입니다.",
    UNIT_SELF_WEIGHT: "Unit Self Weight\n서브 빔의 단위 길이당 자중입니다.",
    DIR: "Load Direction\n하중이 작용하는 좌표계와 축 방향입니다. (예: GZ: 전체 좌표계 Z축)",
    OPT_PROJECTION: "Projection\n하중을 평면상에 투영하여 재하할지 여부를 결정합니다.",
    DESC: "Description\n해당 바닥 하중에 대한 상세 설명입니다.",
    OPT_EXCLUDE_INNER_ELEM_AREA: "Exclude Inner Element Area\n내부 요소의 영역을 하중 재하 범위에서 제외할지 선택합니다.",
    OPT_ALLOW_POLYGON_TYPE_UNIT_AREA: "Allow Polygon Type Unit Area\n다각형(Polygon) 형태의 단위 영역 재하를 허용할지 선택합니다.",
    GROUP_NAME: "Group\n해당 바닥 하중이 속할 하중 그룹의 이름입니다.",
    NODES: "Nodes for Loading Area\n하중이 재하될 영역을 정의하는 절점 번호들의 배열입니다. (예: 101, 102, 103, 104)"
  }
} as const;
