# MIDAS API Tool TODO

## 핵심 기준
- 1차 참고 자료: MIDAS API manual
  - https://support.midasuser.com/hc/ko/p/gate_api_manual
- 2차 참고 자료: MIDAS online manual reference
  - https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual
- 사용자용 문구에서는 `MIDAS GEN` 대신 `MIDAS API`라는 표현을 사용한다.

## 현재 반영된 사항
- [x] 기본 시작 엔드포인트를 `NODE`로 설정
- [x] 최근 사용 / 전체 목록 UI 정리
- [x] 헤더 아래 API 타입 표시
- [x] 체크박스 열 제거
- [x] 엑셀형 셀 선택, Shift + 방향키, 다중 붙여넣기 정리
- [x] pinned bottom row 기반 `+ 행 추가`
- [x] hover 기반 행 삭제 버튼
- [x] 여러 행 선택 시 삭제 버튼 높이 확장
- [x] 짧은 테이블 / 긴 테이블에 따라 삭제 버튼 위치 조정

## 다음 우선순위
- [ ] FBLA 같은 긴 엔드포인트에서 삭제 UX를 더 세련되게 다듬기
- [ ] 엔드포인트별 입력 예시와 실무 설명 강화
- [ ] 붙여넣기 실패 셀 표시와 오류 피드백 개선
- [ ] 대량 붙여넣기 성능 점검
- [ ] 더 많은 DB 엔드포인트를 공통 테이블 패턴에 연결

## 문서 작업
- [x] SPEC.md를 현재 UX 기준으로 정리
- [x] README.md 초안 추가
- [ ] 엔드포인트별 예시 입력 문서 보강
