# MIDAS API Tool

MIDAS API Tool은 MIDAS CAE 프로그램이 제공하는 API를 더 실용적으로 활용할 수 있도록 만든 데스크톱 입력 도구입니다.

반복적인 입력 작업은 더 쉽고 빠르게 처리하고, 엔지니어는 더 가치 있는 판단과 검토에 시간을 쓸 수 있었으면 하는 마음에서 시작했습니다. 이 도구는 복잡한 요청 데이터를 직접 다루지 않아도, 엑셀처럼 익숙한 테이블 편집 방식으로 MIDAS API DB 입력을 수행할 수 있게 돕습니다.

## 무엇을 할 수 있나
- MIDAS API DB 엔드포인트를 테이블 형태로 입력
- 여러 셀 선택, 복사, 붙여넣기 같은 엑셀형 편집
- GET / POST / PUT 실행
- 헤더 아래 타입 정보 표시
- 테이블 내부 `+ 행 추가`
- hover 기반 행 삭제

## 제품 원칙
- 이 도구는 JSON 편집기가 아니라 MIDAS API 입력 도구입니다.
- 사용자가 payload를 직접 조립하지 않아도 되도록 설계합니다.
- 연결 정보와 API 요청은 개발자의 서버를 거치지 않고 사용자의 PC에서 직접 처리합니다.

## 참고 자료
- MIDAS API manual
  - https://support.midasuser.com/hc/ko/p/gate_api_manual
- MIDAS online manual reference
  - https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual

