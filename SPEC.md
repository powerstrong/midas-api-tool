# midas-api-tool Codex Spec (Korean UI Version)

## 0. 제품 개요

midas-api-tool은 MIDAS GEN NX / CIVIL NX의 DB 데이터를 대량 입력하기 위한 Electron 기반 데스크톱 애플리케이션이다.

사용자는 다음을 수행할 수 있어야 한다:

1. Base URL과 MAPI-Key 입력
2. 연결 테스트
3. DB endpoint 선택 (예: `db/FBLA`)
4. 엑셀처럼 테이블 형태로 데이터 입력 및 붙여넣기
5. 입력값 검증 및 변환
6. MIDAS API 형식(JSON Assign 구조)으로 payload 생성
7. POST 또는 PUT으로 MIDAS에 전송
8. 결과 확인 (성공/실패 및 오류 행 표시)

---

## 1. 핵심 설계 원칙

- Electron 기반 로컬 앱 (웹 서비스 금지)
- 모든 API 요청은 사용자 PC에서 직접 수행
- MAPI-Key는 외부 서버로 절대 전송하지 않음
- Telemetry, Analytics, 외부 로그 전송 금지
- UI는 반드시 한글

---

## 2. 주요 사용자

- MIDAS를 사용하는 구조 엔지니어
- 엑셀 기반 데이터 입력을 반복하는 사용자

---

## 3. UI 구성 (한글 필수)

### 상단

- Base URL 입력
- MAPI-Key 입력
- 연결 테스트 버튼
- 연결 상태 표시 (`미연결 / 연결됨 / 실패`)

### 좌측

- DB 목록
- Floor Load (`db/FBLA`)
- Static Load (`db/STLD`)
- Nodal Load (`db/CNLD`)

### 중앙

- 엑셀형 테이블

### 하단

- 행 추가
- 행 삭제
- 선택 영역 초기화
- 현재 데이터 불러오기 (GET)
- JSON 미리보기
- 입력 실행 (POST)
- 전체 반영 (PUT)

---

## 4. FBLA 테이블 컬럼 (한글 표시)

1. 하중 이름
2. 분배 방식
3. 하중 각도
4. 서브빔 개수
5. 서브빔 각도
6. 단위 하중
7. 방향
8. 투영 여부
9. 설명
10. 내부 요소 제외
11. 폴리곤 단위 허용
12. 그룹 이름
13. 노드 목록

---

## 5. 내부 필드 매핑

- 하중 이름 → `FLOOR_LOAD_TYPE_NAME`
- 분배 방식 → `FLOOR_DIST_TYPE`
- 하중 각도 → `LOAD_ANGLE`
- 서브빔 개수 → `SUB_BEAM_NUM`
- 서브빔 각도 → `SUB_BEAM_ANGLE`
- 단위 하중 → `UNIT_SELF_WEIGHT`
- 방향 → `DIR`
- 투영 여부 → `OPT_PROJECTION`
- 설명 → `DESC`
- 내부 요소 제외 → `OPT_EXCLUDE_INNER_ELEM_AREA`
- 폴리곤 단위 허용 → `OPT_ALLOW_POLYGON_TYPE_UNIT_AREA`
- 그룹 이름 → `GROUP_NAME`
- 노드 목록 → `NODES`

---

## 6. 입력 규칙

- 한 행 = 하나의 Floor Load
- 여러 셀/행 엑셀에서 그대로 붙여넣기 가능
- `nodes`는 `"101,102,103"` 형태 입력 후 배열로 변환
- boolean 값 허용:
- `true/false`
- `TRUE/FALSE`
- `1/0`
- `yes/no`

---

## 7. Payload 구조

```json
{
  "Assign": {
    "1": {},
    "2": {}
  }
}
```

---

## 8. 기능 요구사항

### 필수

- 멀티셀 붙여넣기
- 행 추가/삭제
- 컬럼별 데이터 타입 변환
- 필수값 검증
- 잘못된 셀 하이라이트
- JSON 미리보기

### GET 기능

- 현재 DB 데이터 불러오기
- 테이블에 자동 채움

### POST / PUT

- POST: 신규 입력
- PUT: 전체 덮어쓰기

---

## 9. 기술 스택

- Electron
- React + TypeScript
- Vite
- AG Grid
- axios
- zustand
- zod

---

## 10. 아키텍처

`Renderer(UI) → Preload Bridge → Main Process → MIDAS API`

---

## 11. 보안 정책

- MAPI-Key 콘솔 출력 금지
- 기본값: 메모리 저장
- 선택 시 로컬 저장 가능
- 외부 서버 요청 금지
- 네트워크 요청은 Base URL만 허용

---

## 12. 사용자 메시지

앱 내 표시:

> 이 프로그램은 사용자의 MIDAS API 정보를 외부 서버로 전송하지 않습니다.
> 모든 요청은 사용자의 컴퓨터에서 직접 MIDAS API 서버로 전송됩니다.

---

## 13. 개발 우선순위

1. Electron + React 기본 구조
2. 연결 UI
3. DB 목록 UI
4. FBLA 테이블 구현
5. 붙여넣기 기능
6. validation
7. payload 생성
8. POST/PUT 전송
9. GET 기능
10. 에러 처리

---

## 14. 완료 기준

- FBLA 테이블 정상 표시
- 엑셀 붙여넣기 가능
- JSON 생성 정확
- POST/PUT 동작
- GET으로 데이터 불러오기 가능
- 한글 UI 완성
- 외부 서버 사용 없음

---

끝.
