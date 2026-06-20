# SpecPilot AI Site

SpecPilot AI 제품 API를 공개 사용자에게 보여주는 Next.js 웹사이트입니다.

이 레포는 제품 API 레포(`specpilot-ai`)와 분리된 웹 프론트입니다. 사용자는 구매 조건을 입력하고, 분석 전 조건 진단, 데스크톱 PC 또는 노트북 추천 결과, 구매 판정, 구매 타이밍, 공유 브리프, 공개 공유 리포트, 가격 알림, 구매 링크 거버넌스, 완료 리포트 batch 발송, 상품 페이지 근거 검수, URL 모니터 운영, 결제 전 검수, 실제 구매 결과 학습, 제품별 학습 인사이트, 저장 리포트 기반 구매 상담, 품질 회귀와 observability export, 외부 연동 준비도, 출시 게이트, 피드백, 베타 신청, 요금제 관심 등록을 한 화면에서 처리합니다.

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

- `/api/specpilot/intake-diagnose`: 제품 API의 `/intake/diagnose`로 분석 전 조건 준비도와 보강 질문 조회
- `/api/specpilot/analyze`: 제품 API의 `/analyze`, `/reports/save`, `/reports/{id}/share`를 순서대로 호출
- `/api/specpilot/feedback`: 제품 API의 `/feedback`으로 추천 만족도와 구매 의향 저장
- `/api/specpilot/beta-leads`: 제품 API의 `/beta/leads`로 베타 신청 저장
- `/api/specpilot/subscription-intents`: 제품 API의 `/billing/subscription-intents`로 Premium/Team 요금제 관심과 예상 MRR 저장
- `/api/specpilot/alerts/subscribe`: 제품 API의 `/alerts/subscribe`로 분석 결과 기반 목표가 알림 구독 생성
- `/api/specpilot/alerts/evaluate`: 제품 API의 `/alerts/evaluate`로 목표가 도달 평가와 발송 큐 이벤트 확인
- `/api/specpilot/purchase-links`: 제품 API의 `/reports/{report_id}/purchase-links`, `/reports/{report_id}/purchase-link-governance`로 제휴/비제휴 구매 링크와 정책 경고 확인
- `/api/specpilot/completion-reports`: 제품 API의 완료 리포트 템플릿, 수신자 그룹, 미리보기, batch 발송, 최근 batch 조회를 순서대로 처리
- `/api/specpilot/advisor-questions`: 제품 API의 `/reports/{report_id}/advisor-questions`로 저장 리포트 기반 구매 상담 답변 저장
- `/api/specpilot/source-ingest`: 제품 API의 `/sources/ingest-url`로 상품 URL/HTML 스냅샷 가격, 배송비, 할인, 재고, 모델명 일치도 검수
- `/api/specpilot/source-monitors`: 제품 API의 `/sources/monitors`, `/sources/schedule`, `/sources/refresh-due`, `/sources/refresh-runs`, `/admin/reviews`로 반복 상품 URL 수집, due refresh, 검수 큐 승인/반려 관리
- `/api/specpilot/checkout-review`: 제품 API의 `/reports/{report_id}/checkout-review`로 최종 결제 금액, 판매자 답변, 리스크 승인 상태 검수
- `/api/specpilot/purchase-outcomes`: 제품 API의 `/reports/{report_id}/purchase-outcomes`로 실제 구매, 지연, 이탈, 반품/취소 결과와 최종가 차이 저장
- `/api/specpilot/learning-insights`: 제품 API의 `/ops/learning-insights`로 구매 결과, 결제 검수, 피드백 기반 제품별 개선 액션 조회
- `/api/specpilot/observability`: 제품 API의 `/ops/regression`, `/ops/observability/exports`, `/ops/observability/dispatch`로 품질 회귀와 trace export outbox 관리
- `/api/specpilot/integrations`: 제품 API의 `/ops/integrations`, `/ops/integration-readiness`로 외부 provider 등록과 공개 전 필수 연동 준비도 조회
- `/api/specpilot/launch-readiness`: 제품 API의 `/beta/readiness`, `/beta/launch-gate`, `/beta/backlog/summary`를 묶어 공개 go/no-go, 준비도 점수, 필수 액션, 백로그 SLA 조회

공개 페이지:

- `/r/{share_token}`: 제품 API의 `/public/reports/{share_token}`를 서버에서 읽어 SpecPilot AI 웹사이트 브랜드의 공개 구매 리포트로 렌더링
- 공개 리포트는 구매 판정, 최종 후보, TOP 3 비교, 공유 브리프, 구매 타이밍, 구매 실행 체크리스트, 제휴/비제휴 구매 링크를 한 화면에 표시
- 구매 링크는 제품 API의 `/buy/{link_id}` 추적 redirect를 사용해 공개 클릭 지표를 유지

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
- `POST /intake/diagnose`
- `POST /reports/save`
- `POST /reports/{report_id}/share`
- `POST /alerts/subscribe`
- `POST /alerts/evaluate`
- `POST /reports/{report_id}/purchase-links`
- `GET /reports/{report_id}/purchase-link-governance`
- `POST /reports/completion-templates`
- `POST /reports/completion-recipient-groups`
- `POST /reports/completion-preview`
- `POST /reports/completion-batches`
- `GET /reports/completion-batches`
- `POST /reports/{report_id}/advisor-questions`
- `POST /sources/ingest-url`
- `POST /sources/monitors`
- `GET /sources/monitors`
- `GET /sources/schedule`
- `POST /sources/refresh-due`
- `GET /sources/refresh-runs`
- `GET /admin/reviews`
- `POST /admin/reviews/{review_id}/decision`
- `POST /reports/{report_id}/checkout-review`
- `POST /reports/{report_id}/purchase-outcomes`
- `GET /ops/learning-insights`
- `GET /ops/regression`
- `POST /ops/observability/exports`
- `GET /ops/observability/exports`
- `POST /ops/observability/dispatch`
- `POST /ops/integrations`
- `GET /ops/integration-readiness`
- `GET /beta/readiness`
- `GET /beta/launch-gate`
- `GET /beta/backlog/summary`
- `POST /feedback`
- `POST /beta/leads`
- `POST /billing/subscription-intents`
- 공개 리포트 페이지(`/r/{share_token}`): Next.js 웹사이트에서 직접 렌더링

API가 꺼져 있으면 웹사이트는 내장 데모 리포트를 표시해 첫 화면 품질을 유지합니다.
