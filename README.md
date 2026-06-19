# SpecPilot AI Site

SpecPilot AI 제품 API를 공개 사용자에게 보여주는 Next.js 웹사이트입니다.

이 레포는 제품 API 레포(`specpilot-ai`)와 분리된 웹 프론트입니다. 사용자는 구매 조건을 입력하고, 데스크톱 PC 또는 노트북 추천 결과, 구매 판정, 구매 타이밍, 공유 브리프, 상품 페이지 근거 검수, 저장 리포트 기반 구매 상담, 피드백, 베타 신청, 요금제 관심 등록을 한 화면에서 처리합니다.

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
SPECPILOT_API_URL=http://127.0.0.1:8000
SPECPILOT_API_KEY=specpilot-site-demo
```

브라우저는 제품 API를 직접 호출하지 않습니다. Next.js 서버 라우트가 제품 API를 대신 호출해 CORS와 공개 API 키 노출 리스크를 줄입니다.

- `/api/specpilot/analyze`: 제품 API의 `/analyze`, `/reports/save`, `/reports/{id}/share`를 순서대로 호출
- `/api/specpilot/feedback`: 제품 API의 `/feedback`으로 추천 만족도와 구매 의향 저장
- `/api/specpilot/beta-leads`: 제품 API의 `/beta/leads`로 베타 신청 저장
- `/api/specpilot/subscription-intents`: 제품 API의 `/billing/subscription-intents`로 Premium/Team 요금제 관심과 예상 MRR 저장
- `/api/specpilot/advisor-questions`: 제품 API의 `/reports/{report_id}/advisor-questions`로 저장 리포트 기반 구매 상담 답변 저장
- `/api/specpilot/source-ingest`: 제품 API의 `/sources/ingest-url`로 상품 URL/HTML 스냅샷 가격, 배송비, 할인, 재고, 모델명 일치도 검수

## Docker 실행

```bash
docker build -t specpilot-ai-site:local .
docker run --rm -p 3000:3000 \
  -e SPECPILOT_API_URL=http://host.docker.internal:8000 \
  -e SPECPILOT_API_KEY=specpilot-site-demo \
  specpilot-ai-site:local
```

Docker Compose:

```bash
docker compose up --build
```

헬스체크:

```bash
curl http://127.0.0.1:3000/api/health
```

`SPECPILOT_REQUIRE_PRODUCT_READY=true`를 설정하면 제품 API `/ready`가 실패할 때 사이트 헬스체크도 503을 반환합니다. 기본값은 데모 fallback을 살리기 위해 제품 API가 내려가도 사이트 자체는 ready로 반환합니다.

## 검증

```bash
npm run check
npm audit --audit-level=moderate
docker build -t specpilot-ai-site:local .
```

`check`는 TypeScript 타입 검사와 Next.js production build를 실행합니다.

## 연결되는 제품 API

- `POST /analyze`
- `POST /reports/save`
- `POST /reports/{report_id}/share`
- `POST /reports/{report_id}/advisor-questions`
- `POST /sources/ingest-url`
- `POST /feedback`
- `POST /beta/leads`
- `POST /billing/subscription-intents`
- 공개 리포트 페이지(`/r/{share_token}`)

API가 꺼져 있으면 웹사이트는 내장 데모 리포트를 표시해 첫 화면 품질을 유지합니다.
