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
- [ ] 코드 리뷰 후속 작업: MIDAS API 요청을 기본적으로 HTTPS만 허용하고, 필요 시 localhost만 예외로 처리
- [ ] 코드 리뷰 후속 작업: 검증 오류가 있으면 POST/PUT 전송을 막고, 사용자에게 먼저 수정하도록 안내
- [ ] 코드 리뷰 후속 작업: duplicate KEY를 검증해서 payload builder가 기존 행을 조용히 덮어쓰지 않게 수정
- [ ] 코드 리뷰 후속 작업: MAPI-Key를 settings.json 평문 저장 대신 OS 자격 증명 저장소로 이동
- [ ] 코드 리뷰 후속 작업: baseUrl / apiKey 설정 저장을 debounce + write queue로 직렬화해 race condition 방지
- [ ] 코드 리뷰 후속 작업: 사용하지 않는 openExternal IPC를 제거하거나 허용 URL/protocol을 엄격히 제한
- [ ] 코드 리뷰 후속 작업: parser / payload builder / submit guard에 대한 unit test 추가
- [ ] 코드 리뷰 후속 작업: AG Grid AllCommunityModule 의존을 줄여 번들 크기 경고 완화
- [ ] FBLA 같은 긴 엔드포인트에서 삭제 UX를 더 세련되게 다듬기
- [ ] 엔드포인트별 입력 예시와 실무 설명 강화
- [ ] 붙여넣기 실패 셀 표시와 오류 피드백 개선
- [ ] 대량 붙여넣기 성능 점검
- [ ] 더 많은 DB 엔드포인트를 공통 테이블 패턴에 연결

## 코드 리뷰 메모 (2026-04-09)
- 보안/데이터 무결성 관점에서 바로 손볼 가치가 큰 항목을 TODO로 승격했다.
- 우선순위 추천:
  1. HTTPS 강제
  2. submit 차단 + KEY 중복 검증
  3. API 키 저장 방식 개선
  4. 설정 저장 race 방지
  5. 테스트 추가 및 번들 최적화

## 문서 작업
- [x] SPEC.md를 현재 UX 기준으로 정리
- [x] README.md 초안 추가
- [ ] 엔드포인트별 예시 입력 문서 보강
