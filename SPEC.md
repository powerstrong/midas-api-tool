# MIDAS API Tool Spec

## 0. 제품 개요
midas-api-tool은 MIDAS API 기반 DB 입력을 쉽게 처리하기 위한 Electron 데스크톱 도구다.
사용자는 JSON을 직접 작성하지 않고, 엑셀과 유사한 테이블 편집과 복사/붙여넣기만으로 DB 데이터를 입력할 수 있어야 한다.

기본 작업 흐름은 다음과 같다.
1. Base URL과 MAPI-Key 입력
2. 연결 테스트
3. DB 엔드포인트 선택
4. 테이블에 데이터 입력 또는 엑셀 데이터 붙여넣기
5. 입력값 검증 및 변환
6. MIDAS API 형식의 payload 자동 생성
7. POST 또는 PUT 요청 전송
8. 결과와 오류 확인

## 1. 핵심 참고 자료
이 프로젝트를 구현할 때는 아래 두 자료를 항상 우선 참고한다.

1. MIDAS API 매뉴얼
- https://support.midasuser.com/hc/ko/p/gate_api_manual

2. MIDAS Online Manual 참고 자료
- https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual

## 2. 용어 규칙
- 사용자 화면 문구, 도움말, 작업 설명, 구현 메모에서는 `MIDAS GEN`이라는 표현을 직접 쓰지 않고 `MIDAS API`라고 통일한다.
- 이유: MIDAS GEN과 MIDAS Civil은 별도 제품이지만 인터페이스가 매우 유사하고, 이 도구는 MIDAS Civil 사용자에게도 자연스럽게 읽혀야 한다.
- 다만 엔드포인트 id, 공식 필드명, 공식 기능명은 원문을 유지할 수 있다.

## 3. 제품 방향
- 이 제품은 JSON 편집기가 아니라 MIDAS 입력 도구다.
- 사용자가 JSON payload를 직접 수정하지 않게 한다.
- payload 생성은 프로그램 내부에서 자동 처리한다.
- 목표는 개발자 중심의 MIDAS API를 비개발자도 사용할 수 있게 만드는 것이다.
- 핵심 UX는 엑셀형 테이블 편집, 다중 셀 선택, 여러 칸 붙여넣기, 빠른 검증 피드백이다.

## 4. 아키텍처 원칙
- Electron 기반 로컬 앱으로 동작한다.
- 모든 API 요청은 사용자 PC에서 직접 전송한다.
- MAPI-Key와 입력 데이터는 외부 서버로 전송하지 않는다.
- Telemetry, analytics, 외부 로그 전송은 하지 않는다.
- Renderer(UI) / Preload Bridge / Main Process / MIDAS API 흐름을 유지한다.

## 5. 주요 사용자
- MIDAS 구조 모델 데이터를 반복적으로 입력하는 실무 사용자
- 엑셀 기반 입력에 익숙하지만 JSON이나 API 호출은 익숙하지 않은 사용자
- MIDAS Civil / MIDAS 계열 인터페이스에 익숙한 사용자

## 6. 핵심 UI 구성
### 상단
- 제품명 및 소개
- MIDAS API 매뉴얼 링크

### 작업 설정
- Base URL 입력
- MAPI-Key 입력
- 연결 테스트 버튼
- 연결 상태 표시

### 좌측 사이드바
- DB 엔드포인트 검색
- 최근 사용 목록
- 전체 DB 목록

### 중앙 작업 영역
- 엔드포인트별 입력 테이블
- 엑셀형 복사/붙여넣기와 범위 선택
- 검증 상태 및 작업 도구

### 하단 결과 영역
- 알림
- 검증 결과
- 요청 결과 표시

## 7. 테이블 UX 원칙
- 셀 클릭 시 첫 클릭은 선택만 수행한다.
- 방향키, Enter, Shift+방향키, 드래그 선택이 자연스럽게 동작해야 한다.
- 여러 셀 복사/붙여넣기는 엑셀과 유사한 감각을 제공해야 한다.
- 헤더 포함 데이터 붙여넣기, 여러 행 자동 추가, 다중 셀 삭제를 지원한다.
- 현재 셀과 선택 범위는 명확히 보이되 과하지 않게 표현한다.

## 8. 검증 및 변환 원칙
- 엔드포인트별 검증/변환 로직은 분리한다.
- 필드별 오류를 셀 단위로 보여준다.
- 붙여넣기 실패, 타입 변환 실패, 필수값 누락을 빠르게 인지할 수 있어야 한다.
- boolean, 숫자, 배열형 입력은 실무 사용자가 이해하기 쉬운 방식으로 처리한다.

## 9. 기술 스택
- Electron
- React + TypeScript
- Vite
- AG Grid Community
- axios
- zustand
- zod

## 10. 완료 기준
- 주요 엔드포인트 테이블이 정상 표시된다.
- 엑셀형 복사/붙여넣기 UX가 안정적으로 동작한다.
- JSON payload는 내부에서 정확히 생성된다.
- POST / PUT / GET 흐름이 정상 동작한다.
- 사용자 문구는 `MIDAS API` 기준으로 일관된다.
- 외부 서버 로그 전송 없이 로컬 실행 기준을 지킨다.