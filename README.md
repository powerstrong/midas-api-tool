# MIDAS API Tool

MIDAS API Tool은 MIDAS API DB 정보를 조회 및 수정할 수 있도록 도와주는 Electron 기반 데스크톱 어플리케이션입니다.
사용자가 복잡한 JSON payload를 직접 작성하지 않고, 엑셀과 유사한 테이블 편집 환경에서 데이터를 조회(GET), 생성(POST), 수정(PUT), 삭제(DELETE)할 수 있도록 설계되었습니다.

## 주요 기능
- **MIDAS API DB 연동**: 실시간으로 API를 통해 데이터를 조회하고 반영합니다.
- **엑셀 스타일 편집**: 다중 셀 선택, 복사/붙여넣기, 범위 확장 등 친숙한 편집 UX를 제공합니다.
- **자동 유효성 검사**: 입력된 데이터의 형식을 실시간으로 검증하여 오류를 표시합니다.
- **자동 Payload 생성**: 테이블 데이터를 기반으로 MIDAS API 규격에 맞는 JSON을 자동으로 생성합니다.
- **로컬 보안**: API 키와 데이터는 오직 사용자의 PC에서만 처리되며 외부 서버로 전송되지 않습니다.

## 지원하는 API 엔드포인트
- **Modeling**
  - `NODE` (절점)
  - `ELEM` (요소)
- **Static Loads (정적 하중)**
  - `STLD` (정적 하중 조건)
  - `CNLD` (절점 하중)
  - `FBLA` (바닥판 하중)
  - `BODF`, `BMLD`, `SDSP`, `NMAS`, `LTOM`, `NBOF`, `PSLT`, `PRES`, `PNLD`, `PNLA`, `FBLD`, `FMLD`, `POSP`, `EPST`, `EPSE`, `POSL` (추가 예정 포함)

## 시작하기
### 개발 모드 실행
```bash
npm install
npm run dev
```

### 빌드 (Production)
```bash
npm run build
```

### Windows 설치 파일 생성
```bash
npm run dist:win
```

## 사용 방법
1. **접속 정보 입력**: Base URL과 MAPI-Key를 입력하고 연결 상태를 확인합니다.
2. **엔드포인트 선택**: 좌측 사이드바에서 작업할 DB 엔드포인트를 선택합니다.
3. **데이터 편집**: 테이블에 직접 입력하거나 엑셀에서 데이터를 복사하여 붙여넣습니다.
4. **검증**: 데이터 타입이나 필수 값 누락 여부를 확인합니다.
5. **명령 실행**: 상단의 GET / POST / PUT / DELETE 버튼을 사용하여 API 요청을 수행합니다.

## 주의 사항
- 이 도구는 JSON 편집기가 아닌 MIDAS API 전용 입력 도구입니다.
- 모든 데이터 변환은 내부 로직에 의해 MIDAS API 매뉴얼 표준에 따라 처리됩니다.
- 보안을 위해 MAPI-Key는 외부로 공유하지 마십시오.

## 기술 스택
- **Framework**: Electron, React + TypeScript, Vite
- **UI Components**: AG Grid Community
- **State Management**: zustand
- **Networking**: axios
- **Validation**: zod

## 참고 자료
- [MIDAS API manual](https://support.midasuser.com/hc/ko/p/gate_api_manual)
- [MIDAS online manual reference](https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual)
