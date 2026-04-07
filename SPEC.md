# MIDAS API Tool Spec

## 0. 제품 개요
midas-api-tool은 MIDAS API 기반 DB 입력을 더 빠르고 안전하게 처리하기 위한 Electron 데스크톱 도구다.
사용자는 JSON payload를 직접 작성하지 않고, 엑셀과 유사한 테이블 편집 경험으로 DB 데이터를 입력하고 검토한 뒤 MIDAS API 요청을 실행한다.

기본 작업 흐름은 다음과 같다.
1. Base URL과 MAPI-Key를 입력한다.
2. 연결 상태를 확인한다.
3. DB 엔드포인트를 선택한다.
4. 테이블에 값을 직접 입력하거나 여러 셀 범위를 복사/붙여넣기 한다.
5. 입력 형식과 검증 상태를 확인한다.
6. 프로그램이 MIDAS API 형식의 payload를 자동 생성한다.
7. GET, POST, PUT 요청을 실행한다.
8. 결과 메시지와 검증 결과를 확인한다.
****
## 1. 핵심 참고 자료
이 프로젝트는 아래 자료를 우선 참고한다.

1. MIDAS API manual
- https://support.midasuser.com/hc/ko/p/gate_api_manual

2. MIDAS online manual reference
- https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual

## 2. 용어 규칙
- 사용자용 문구, 안내 문구, 도움말, 구현 메모에서는 `MIDAS GEN` 대신 `MIDAS API`라는 표현을 사용한다.
- 제품 id, 엔드포인트 id, 필드명, 공식 기능명은 원문을 유지할 수 있다.
- 이유는 MIDAS GEN과 MIDAS Civil이 별도 제품이지만 인터페이스 패턴이 매우 유사하며, 이 도구는 MIDAS Civil 사용자에게도 자연스럽게 읽혀야 하기 때문이다.

## 3. 제품 방향
- 이 도구는 JSON 편집기가 아니라 MIDAS API 입력 도구다.
- 사용자가 JSON payload를 직접 수정하지 않게 한다.
- payload 생성은 프로그램 내부에서 자동 처리한다.
- 비개발자도 반복적인 MIDAS DB 입력을 빠르게 처리할 수 있어야 한다.
- 핵심 UX는 엑셀형 테이블 편집, 여러 칸 선택, 대량 붙여넣기, 즉시 확인 가능한 검증 피드백이다.

## 4. 아키텍처 원칙
- Electron 기반 로컬 앱으로 동작한다.
- 모든 API 요청은 사용자의 PC에서 MIDAS API로 직접 전송한다.
- MAPI-Key와 연결 정보는 외부 서버로 전송하지 않는다.
- telemetry, analytics, 외부 로그 전송을 두지 않는다.
- Renderer(UI), Preload Bridge, Main Process, MIDAS API 호출 계층을 분리한다.

## 5. 주요 사용 시나리오
- 반복적으로 구조 모델 DB 데이터를 입력하는 실무 사용자
- JSON이나 API 호출에 익숙하지 않지만 테이블 입력에는 익숙한 사용자
- MIDAS Civil 또는 유사한 MIDAS API 인터페이스 흐름에 익숙한 사용자

## 6. 현재 UI 구성
### 상단 영역
- 제품명과 소개 문구
- MIDAS API 기준 안내 문구

### 작업 설정
- Base URL 입력
- MAPI-Key 입력
- 연결 테스트
- 연결 상태 표시

### 좌측 사이드바
- 엔드포인트 검색
- 최근 사용 목록
- 전체 DB 목록

### 중앙 작업 영역
- 엔드포인트별 입력 테이블
- GET / POST / PUT 실행 버튼
- 입력 검증 상태
- 테이블 기반 행 추가/행 삭제 UX

### 하단 결과 영역
- 알림
- 검증 결과
- 요청 결과 메시지

## 7. 테이블 UX 기준
- 앱을 처음 시작하면 기본 엔드포인트는 `NODE`다.
- 테이블은 엑셀과 유사한 흐름을 목표로 한다.
- 첫 클릭은 편집이 아니라 선택이다.
- Shift + 방향키로 범위를 확장할 수 있다.
- 마우스 드래그로 여러 셀 범위를 선택할 수 있다.
- Ctrl/Cmd + C, Ctrl/Cmd + V로 선택 범위를 복사/붙여넣기 할 수 있다.
- 헤더를 포함한 붙여넣기와 여러 행 자동 추가를 지원한다.
- 편집 중 Enter와 방향키는 입력을 확정하고 다음 셀로 이동한다.
- 헤더 아래에는 API 타입을 작게 표시한다.
- 마지막 행 아래에는 pinned bottom row 형태의 `+ 행 추가` 줄이 표시된다.
- 행 삭제는 hover 기반 액션으로 제공하며, 여러 행을 선택한 경우 선택 범위 높이에 맞춰 확장된다.
- 가로 스크롤이 있는 긴 테이블에서는 삭제 버튼이 보이는 우측 끝에 고정되고, 스크롤이 없는 짧은 테이블에서는 마지막 열 바로 오른쪽에 붙는다.

## 8. 검증과 변환 원칙
- 엔드포인트별 검증 규칙과 변환 로직은 분리한다.
- 검증 상태는 서버 저장 성공 여부가 아니라 현재 입력 형식의 유효성을 의미한다.
- 숫자, boolean, 배열, enum 타입은 사용자가 이해하기 쉬운 테이블 편집 흐름으로 다룬다.
- GET 응답은 테이블 행 구조로 변환하고, POST/PUT은 MIDAS API payload로 다시 변환한다.

## 9. 기술 스택
- Electron
- React + TypeScript
- Vite
- AG Grid Community
- axios
- zustand
- zod

## 10. 현재 구현 상태
- `NODE`, `FBLA`, `STLD`, `CNLD` 엔드포인트가 테이블 편집 흐름에 연결되어 있다.
- 기본 시작 엔드포인트는 `NODE`다.
- 최근 사용 목록, 전체 목록, 검색, 엔드포인트 설명 UI가 정리되어 있다.
- 엑셀형 다중 셀 선택, 복사/붙여넣기, 아래 채우기, 직접 입력 시작, 복사 플래시가 동작한다.
- pinned bottom row 기반 `+ 행 추가`와 hover 기반 행 삭제가 동작한다.
- 입력 타입 라벨과 검증 상태를 테이블 UI에서 확인할 수 있다.

## 11. 완료 기준
- 주요 엔드포인트의 테이블 입력 화면이 정상 표시된다.
- 복사/붙여넣기와 범위 선택 UX가 안정적으로 동작한다.
- JSON payload가 내부에서 정확하게 생성된다.
- GET / POST / PUT 흐름이 정상 동작한다.
- 사용자용 문구는 `MIDAS API` 기준으로 일관되게 유지된다.
- 연결 정보와 API 요청은 로컬 실행 원칙을 지킨다.

## 12. 전체 엔드포인트 확장 전략
이제 남은 DB 엔드포인트는 현재 구현된 `NODE`, `STLD`, `FBLA`, `CNLD`를 기준 패턴으로 삼아 순차적으로 확장한다.

### 참고 순서
1. 1차 기준은 MIDAS API manual로 잡는다.
2. 엔드포인트 path, 메서드 지원 여부, payload 구조, 필드명은 MIDAS API manual 기준으로 정리한다.
3. 설명 문구, 실제 업무 의미, 테이블 컬럼 설명, 사용 흐름은 MIDAS online manual reference를 보조로 참고한다.
4. 사용자용 문구와 도움말에서는 `MIDAS GEN` 대신 `MIDAS API`라는 표현을 유지한다.

### 구현 단위
엔드포인트 하나를 추가할 때는 아래 4개 파일을 기본 단위로 본다.

1. `src/features/endpoints/help/<endpoint>.ts`
2. `src/features/endpoints/definitions/<endpoint>.ts`
3. `src/features/endpoints/transformers/<endpoint>.ts`
4. `src/features/endpoints/pages/<ENDPOINT>Page.tsx`

그 다음 아래 공통 등록 지점을 함께 갱신한다.

1. `src/shared/midas.ts`
2. `src/lib/transformers.ts`
3. `src/App.tsx`

### 현재 기준 템플릿
- `NODE`, `STLD`, `FBLA`는 표준형 엔드포인트 기준 템플릿이다.
- 이들 엔드포인트는 `buildStandardPayload`, `rowsFromStandardGet`, `createStandardBlankRow`를 그대로 재사용할 수 있다.
- `CNLD`는 하나의 KEY 아래 `ITEMS` 배열이 중첩되는 묶음형 엔드포인트 기준 템플릿이다.
- 앞으로 추가할 엔드포인트는 먼저 표준형인지, `ITEMS` 같은 배열 중첩형인지, 더 복잡한 사용자 정의형인지 먼저 분류한다.

### 엔드포인트 추가 절차
1. MIDAS API manual에서 대상 엔드포인트의 path와 JSON 예시를 먼저 확인한다.
2. GET 응답 구조와 POST/PUT payload 구조가 동일한지, 아니면 변환이 필요한지 먼저 판별한다.
3. 테이블의 첫 열 `KEY`가 무엇을 의미하는지 정한다.
4. 각 필드를 `text`, `number`, `integer`, `boolean`, `integer-array`, `string-array`, `object-array`, `select` 중 어느 타입으로 편집할지 결정한다.
5. 사용자가 이해할 수 있는 컬럼 라벨과 helper text를 작성하되, 필드 key는 API 원문을 유지한다.
6. 표준형이면 `standard.ts` 계열을 재사용하고, 아니면 전용 transformer를 만든다.
7. `DbEndpointId`, `DB_DEFINITIONS`, payload builder, GET row builder, blank row builder, endpoint page registry를 모두 연결한다.
8. 최소한 GET 로드, PUT 저장, 필요 시 POST/DELETE까지 실제 메서드 흐름을 확인한다.

### 구현 우선순위
1. 먼저 표준형 단건 DB 엔드포인트를 넓게 확보한다.
2. 그 다음 `CNLD`처럼 KEY 기준으로 여러 행을 묶어야 하는 엔드포인트를 추가한다.
3. 마지막으로 중첩 object, 다중 배열, 조건부 필드가 있는 복합 엔드포인트를 전용 transformer로 처리한다.

이 순서를 택하는 이유는 현재 공통 테이블 UX를 가장 많이 재사용할 수 있고, 빠르게 엔드포인트 수를 늘릴 수 있기 때문이다.

### 필드 해석 원칙
- API manual에 나온 endpoint id, field name, enum 값은 원문 그대로 유지한다.
- 라벨, 설명, 안내 문구는 사용자가 바로 이해할 수 있게 정리하되 제품 명칭은 `MIDAS API`로 통일한다.
- 배열은 기본적으로 쉼표 구분 문자열로 입력받고 내부에서 배열로 변환한다.
- boolean은 `true/false`, `1/0`, `yes/no`를 허용하는 현재 공통 규칙을 유지한다.
- GET 응답이 빈 값, null, 배열, boolean을 포함해도 테이블에서는 문자열 편집 흐름으로 보이게 유지한다.

### 문서화 원칙
- 엔드포인트를 추가할 때마다 help 파일에 description과 key helper text를 함께 작성한다.
- helper text는 단순 번역이 아니라 사용자가 테이블에서 바로 판단할 수 있는 설명이 되어야 한다.
- 보조 매뉴얼에서 기능 설명을 참고하더라도 제품 문구에는 `MIDAS API` 표현을 유지한다.

### 검증 기준
엔드포인트를 추가할 때마다 아래 항목을 확인한다.

1. GET 결과가 테이블 행으로 안정적으로 펼쳐지는가
2. 빈 행 추가와 붙여넣기에서 필요한 수만큼 행이 자동 생성되는가
3. PUT 또는 POST 시 payload가 MIDAS API manual 구조와 정확히 일치하는가
4. 숫자, boolean, 배열 타입 오류가 셀 단위로 표시되는가
5. 사이드바 검색, 최근 사용, 기본 선택 흐름에 새 엔드포인트가 자연스럽게 연결되는가

### 작업 운영 방식
- 한 번에 모든 엔드포인트를 무작정 추가하지 않는다.
- 카테고리별로 묶어서 `Modeling`, `Static Loads`처럼 배치 단위로 확장한다.
- 각 배치마다 공통 패턴을 먼저 추출하고, 필요한 경우에만 새 transformer 패턴을 만든다.
- 새 패턴이 생기면 다음 엔드포인트들이 재사용할 수 있게 공통 레이어로 올리는 것을 우선 검토한다.
