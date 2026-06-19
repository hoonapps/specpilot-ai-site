# SpecPilot AI Site

SpecPilot AI 제품 API를 공개 사용자에게 보여주는 Next.js 웹사이트입니다.

이 레포는 제품 API 레포(`specpilot-ai`)와 분리된 웹 프론트입니다. 사용자는 구매 조건을 입력하고, 데스크톱 PC 또는 노트북 추천 결과, 구매 판정, 구매 타이밍, 공유 브리프를 한 화면에서 확인합니다.

## 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

기본 주소:

```text
http://127.0.0.1:3000
```

제품 API 주소는 환경 변수로 지정합니다.

```bash
NEXT_PUBLIC_SPECPILOT_API_URL=http://127.0.0.1:8000
```

## 검증

```bash
npm run check
```

`check`는 TypeScript 타입 검사와 Next.js production build를 실행합니다.

## 연결되는 제품 API

- `POST /analyze`
- `GET /ready`
- 공개 리포트와 저장 기능은 제품 API 레포에서 제공

API가 꺼져 있으면 웹사이트는 내장 데모 리포트를 표시해 첫 화면 품질을 유지합니다.
