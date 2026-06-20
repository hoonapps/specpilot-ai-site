# SpecPilot AI Site

SpecPilot AI 제품 API를 공개 사용자에게 보여주는 Next.js 웹사이트입니다.

이 레포는 제품 API 레포(`specpilot-ai`)와 분리된 웹 프론트입니다. 사용자는 공개 구매 온보딩 플레이북과 첫 구매 진단 콘시어지로 시작 질문을 고르고, 구매 조건을 입력하고, 분석 전 조건 진단, 데스크톱 PC 또는 노트북 추천 결과, 구매 판정, 대안 시나리오, 조건 충족 매트릭스, 스트레스 테스트, 구매 실행 패키지, 구매 타이밍, 공유 브리프, 공개 공유 리포트, 채널별 공유 자산, 가격 알림, 알림 발송 운영, 구매 링크 거버넌스, 완료 리포트 batch 발송, 상품 페이지 근거 검수, URL 모니터 운영, 결제 전 검수, 구매 의사결정 보드, 실제 구매 결과 학습, 제품별 학습 인사이트, 저장 리포트 기반 구매 상담, 품질 회귀와 observability export, 외부 연동 준비도, 프라이버시/데이터 거버넌스, 공개 Trust Center, 베타 cohort와 개선 백로그 운영, 월간 카테고리 리포트, 공개 카테고리 리포트, 성장 퍼널, 추천 대기열, 구매 챌린지 공유 키트, 옵션/사양 빠른 검수기, 공개 후보 비교 스냅샷, 추천 초대 공유 키트, 출시 배포 플랜, 수익화 준비도, 출시 게이트, 검색/공유 배포 메타, 피드백, 베타 신청, 요금제 관심 등록을 한 화면에서 처리합니다.

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
- `/api/specpilot/demo-scenarios`: 제품 API의 `/demo/scenarios`로 첫 방문자가 바로 적용할 수 있는 공개 데모 preset 조회
- `/api/specpilot/analyze`: 제품 API의 `/analyze`, `/reports/save`, `/reports/{id}/share`, `/reports/{id}/share-assets`를 순서대로 호출
- `/api/specpilot/share-assets`: 제품 API의 `/reports/{report_id}/share-assets`로 공개 리포트 기반 카카오톡/커뮤니티/블로그 복사 문구와 OG 메타 조회
- `/api/specpilot/feedback`: 제품 API의 `/feedback`으로 추천 만족도와 구매 의향 저장
- `/api/specpilot/beta-leads`: 제품 API의 `/beta/leads`로 베타 신청 저장
- `/api/specpilot/subscription-intents`: 제품 API의 `/billing/subscription-intents`로 Premium/Team 요금제 관심과 예상 MRR 저장
- `/api/specpilot/alerts/subscribe`: 제품 API의 `/alerts/subscribe`로 분석 결과 기반 목표가 알림 구독 생성
- `/api/specpilot/alerts/evaluate`: 제품 API의 `/alerts/evaluate`로 목표가 도달 평가와 발송 큐 이벤트 확인
- `/api/specpilot/alert-ops`: 제품 API의 `/alerts/channels`, `/alerts/events`, `/alerts/dispatch`, `/alerts/deliveries`로 알림 채널 설정, queued dispatch, 성공/실패/재시도 이력 관리
- `/api/specpilot/purchase-links`: 제품 API의 `/reports/{report_id}/purchase-links`, `/reports/{report_id}/purchase-link-governance`로 제휴/비제휴 구매 링크와 정책 경고 확인
- `/api/specpilot/completion-reports`: 제품 API의 완료 리포트 템플릿, 수신자 그룹, 미리보기, batch 발송, 최근 batch 조회를 순서대로 처리
- `/api/specpilot/advisor-questions`: 제품 API의 `/reports/{report_id}/advisor-questions`로 저장 리포트 기반 구매 상담 답변 저장
- `/api/specpilot/source-ingest`: 제품 API의 `/sources/ingest-url`로 상품 URL/HTML 스냅샷 가격, 배송비, 할인, 재고, 모델명 일치도 검수
- `/api/specpilot/source-monitors`: 제품 API의 `/sources/monitors`, `/sources/schedule`, `/sources/refresh-due`, `/sources/refresh-runs`, `/admin/reviews`로 반복 상품 URL 수집, due refresh, 검수 큐 승인/반려 관리
- `/api/specpilot/checkout-review`: 제품 API의 `/reports/{report_id}/checkout-review`로 최종 결제 금액, 판매자 답변, 리스크 승인 상태 검수
- `/api/specpilot/decision-board`: 제품 API의 `/reports/decision-board`로 저장 리포트별 결제 가능, 가격 대기, 검수 차단, 링크/결과 미기록 큐 조회
- `/api/specpilot/purchase-outcomes`: 제품 API의 `/reports/{report_id}/purchase-outcomes`로 실제 구매, 지연, 이탈, 반품/취소 결과와 최종가 차이 저장
- `/api/specpilot/learning-insights`: 제품 API의 `/ops/learning-insights`로 구매 결과, 결제 검수, 피드백 기반 제품별 개선 액션 조회
- `/api/specpilot/observability`: 제품 API의 `/ops/regression`, `/ops/observability/exports`, `/ops/observability/dispatch`로 품질 회귀와 trace export outbox 관리
- `/api/specpilot/integrations`: 제품 API의 `/ops/integrations`, `/ops/integration-readiness`로 외부 provider 등록과 공개 전 필수 연동 준비도 조회
- `/api/specpilot/data-governance`: 제품 API의 `/ops/data-governance`로 워크스페이스별 데이터 인벤토리, 원문 연락처 표면, 보존/삭제 액션 조회
- `/api/specpilot/trust-center`: 제품 API의 `/policy/trust-center`로 추천 공정성, 출처 검수, 개인정보 최소화, 사람 검수 게이트와 위험 고지 조회
- `/api/specpilot/beta-ops`: 제품 API의 `/beta/cohorts`, `/beta/cohorts/{cohort_id}/report`, `/beta/backlog`, `/beta/backlog/{backlog_id}`, `/beta/backlog/summary`로 cohort 리포트와 개선 백로그 운영 상태 관리
- `/api/specpilot/launch-readiness`: 제품 API의 `/beta/readiness`, `/beta/launch-gate`, `/beta/backlog/summary`, `/ops/data-governance`를 묶어 공개 go/no-go, 준비도 점수, 필수 액션, 백로그 SLA, 프라이버시 게이트 조회
- `/api/specpilot/market-reports`: 제품 API의 `/market/category-reports`로 월간 추천 픽, 가격 구간, 리스크 신호, 공개 체크리스트 조회
- `/api/specpilot/onboarding-playbooks`: 제품 API의 `/public/onboarding/playbooks`로 공개 시작 질문, 예산 힌트, 필수 입력 슬롯, 신뢰 검수 게이트 조회
- `/api/specpilot/buyer-checklist`: 제품 API의 `/public/buyer-checklist`로 카테고리/예산/구매자 상황별 구매 실패 방지 체크리스트와 분석 prefill 조회
- `/api/specpilot/buyer-persona-quiz`: 제품 API의 `/public/buyer-persona-quiz`, `/public/buyer-persona-quiz/result`로 30초 구매 성향 진단 질문과 persona별 추천 카테고리/예산, 분석 prefill, 공유 문구 조회
- `/api/specpilot/mistake-cost-calculator`: 제품 API의 `/public/mistake-cost-calculator`, `/public/mistake-cost-calculator/result`로 예산/수량/위험 유형별 예상 구매 실패 비용, 방지 플랜, 분석 prefill 조회
- `/api/specpilot/buyer-challenge-kit`: 제품 API의 `/public/buyer-challenge-kit`로 성향 진단, 실패 비용 계산, 체크리스트를 3단계 구매 챌린지와 채널별 복사 문구로 패키징
- `/api/specpilot/spec-risk-scanner`: 제품 API의 `/public/spec-risk-scanner`, `/public/spec-risk-scanner/result`로 장바구니 옵션명, 최종가, 기대 사양, 배송/반품/AS 증거를 결제 전 blocker/warning으로 검수
- `/api/specpilot/candidate-compare`: 제품 API의 `/public/candidate-compare`로 카테고리/예산/목적별 공개 후보 5개, 비교 축별 승자, 예산/성능/안전 우선 대안 시나리오, 공유 문구 조회
- `/api/specpilot/deal-timing-window`: 제품 API의 `/public/deal-timing-window`로 후보별 현재가, 목표가, 적정가 밴드, 재고/쿠폰 변동 리스크, 결제 트리거, 목표가 공유 문구 조회
- `/api/specpilot/start-concierge`: 제품 API의 `/public/start-concierge`로 현재 입력 진단, 맞춤 플레이북, 시작 마일스톤, 빠른 CTA 조회
- `/api/specpilot/growth-funnel`: 제품 API의 `/growth/events`, `/growth/funnel`로 분석 결과 조회, 추천/대안 카드, 공유/알림/구독 CTA 반응 이벤트와 전환율 조회
- `/api/specpilot/acquisition-hub`: 제품 API의 `/growth/acquisition-hub`로 공개 데모, SEO 페이지, 공유 리포트, 추천 대기열, Trust Center, 요금제 관심 표면 준비도 조회
- `/api/specpilot/public-conversion-board`: 제품 API의 `/growth/public-conversion-board`로 공개 유입, 활성화, 공유, 추천, 유료 수요, readiness 병목과 채널 액션 조회
- `/api/specpilot/retention-hub`: 제품 API의 `/growth/retention-hub`로 저장 리포트, 알림, 공유 조회, 상담, 구매 결과, 완료 리포트 반응 기반 재참여 플레이 조회
- `/api/specpilot/referrals`: 제품 API의 `/growth/waitlist-referrals`, `/growth/referral-dashboard`, `/growth/referral-leaderboard`, `/growth/referral-share-kit/{referral_code}`, `/growth/referral-rewards/{referral_code}`로 추천 코드, 공유 URL, 공개 추천 순위, 카카오톡/커뮤니티/이메일 공유 문구, 추천 보상 사다리, 추천 유입 리더보드 조회
- `/api/specpilot/referral-launch-kit`: 제품 API의 `/growth/referral-launch-kit`으로 가입 전 공개 추천 보상 사다리, 공유 문구 예시, 리더보드, 확산 CTA 조회
- `/api/specpilot/launch-pulse`: 제품 API의 `/growth/launch-pulse`로 공개 반응 Pulse, 신호별 점수, 다음 액션, 최근 피드백/이벤트 조회
- `/api/specpilot/launch-war-room`: 제품 API의 `/growth/launch-war-room`으로 Pulse, 스모크, 전환 보드, 출시 게이트, 품질 회귀, CTA 실험, 추천/유료 수요를 합성한 첫 24시간 워룸 조회
- `/api/specpilot/launch-incident-center`: 제품 API의 `/growth/launch-incident-center`로 출시 준비도, 품질 회귀, 외부 연동, 데이터 거버넌스, observability outbox, 성장 이벤트 기반 SEV/runbook/escalation 조회
- `/api/specpilot/launch-week-recap`: 제품 API의 `/growth/launch-week-recap`으로 첫 주 성장 이벤트, 공유 조회, 추천 대기열, 요금제 관심, CTA 실험, 리텐션, 품질 리스크를 합성한 D+7 런칭 리포트 조회
- `/api/specpilot/launch-community-kit`: 제품 API의 `/growth/launch-community-kit`으로 D+7 리포트, 반박 FAQ, 공유 확산팩, 액션 라우터를 합성한 커뮤니티 고정 댓글/반복 질문 답변/운영 리스크 조회
- `/api/specpilot/launch-media-kit`: 제품 API의 `/growth/launch-media-kit`으로 런칭룸, 공개 proof, 소셜 proof, D+7 리포트, 커뮤니티 대응 키트 기반 대표 자산과 외부 소개 피치 조회
- `/api/specpilot/launch-activation-offer`: 제품 API의 `/growth/launch-activation-offer`로 공개 전환 보드, 추천 대기열, 요금제 의향, Team 상담, 공개 라우팅 기반 미디어/커뮤니티 신호의 첫 CTA와 전환 오퍼 조회
- `/api/specpilot/launch-response-loop`: 제품 API의 `/growth/launch-response-loop`로 공개 피드백, 공유/구독 이벤트, 추천 대기열, 요금제 관심 기반 proof 후보, founder reply, 제품 수정 큐 조회
- 런칭 운영 프록시: 스모크, 워룸, 인시던트, 주간 리캡, 커뮤니티/미디어 키트, 전환 오퍼, 반응 후속 루프는 15초 재검증 캐시와 8초 타임아웃으로 첫 방문 로딩 지연을 줄이고 실패 시 각 패널의 fallback을 즉시 표시
- `/api/specpilot/launch-experiments`: 제품 API의 `/growth/launch-experiments`, `/growth/launch-experiments/{experiment_id}/events`, `/growth/launch-experiment-dashboard`로 CTA 실험 생성, 노출/전환 기록, 승자 후보 조회
- `/api/specpilot/launch-kit`: 제품 API의 `/growth/launch-kit`으로 커뮤니티/검색/추천 채널별 공개 베타 카피, CTA 실험, 출시 체크리스트, 측정 계획 조회
- `/api/specpilot/launch-distribution-plan`: 제품 API의 `/growth/launch-distribution-plan`으로 첫 주 채널 배포 슬롯, 복사 문구, 측정 이벤트, 위험 통제 조회
- `/api/specpilot/proof-hub`: 제품 API의 `/public/proof-hub`로 Trust Center, 시장 리포트, 공유 조회, 피드백, CTA 실험, 공개 유입 표면 기반 proof 카드, 출시 proof strip, evidence kit 조회
- `/api/specpilot/social-proof-wall`: 제품 API의 `/public/social-proof-wall`로 마스킹 피드백, 실구매 결과, 추천 유입 리더보드를 공개 랜딩용 반응 카드와 신뢰 고지로 조회
- `/api/specpilot/launch-objection-kit`: 제품 API의 `/public/launch-objection-kit`으로 최저가 비교 사이트와의 차이, 제휴 편향, 가격 최신성, 개인정보, 초보자 난이도, 팀 구매 질문을 공개 반박 FAQ와 비교표로 조회
- `/api/specpilot/launch-share-pack`: 제품 API의 `/public/launch-share-pack`으로 카카오톡/커뮤니티/팀/이메일 공유 URL, 복사용 문구, proof strip, 신뢰 고지, 측정 이벤트를 조회하고 `/launch`에서는 절대 공유 URL, 클립보드 복사, 네이티브 공유, 링크 열기 액션을 `share_cta` 성장 이벤트로 기록
- `/api/specpilot/launch-action-router`: 제품 API의 `/public/launch-action-router`로 첫 구매자, 공유 유입, 베타 대기자, 팀 구매자, 유료 관심자별 다음 행동 CTA와 우선순위 점수를 조회하고, 선택/CTA 클릭은 `/api/specpilot/growth-funnel`을 통해 성장 퍼널에 기록
- `/api/specpilot/launch-smoke`: 제품 API의 `/public/launch-smoke`로 런칭룸, 시장 리포트, proof, 반박 FAQ, 공유 확산팩, 액션 라우터, 출시 게이트, SEO 메타, 측정 이벤트 준비 상태를 스모크 체크
- `/api/specpilot/launch-room`: 제품 API의 `/public/launch-room`으로 공개 데모, 시장 리포트, proof strip, 유입/반응/추천/수익화 CTA, 채널 공유 문구를 외부 공유용 런칭룸으로 조회
- `/api/specpilot/pricing-ops`: 제품 API의 `/pricing/plans`, `/billing/subscription-intents`, `/ops/pricing-dashboard`, `/ops/team-purchase-consult-kit`으로 요금제별 수요, 예상 MRR, Team 상담 키트, 최근 intent 관리
- `/api/specpilot/team-consult-kit`: 제품 API의 `/ops/team-purchase-consult-kit`으로 Team 관심 리드의 상담 브리프, 안건, ROI 포인트, 제안 메일 조회

공개 페이지:

- `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`: 공개 런칭룸, 추천 초대, 데스크톱/노트북 시장 리포트를 검색 엔진과 공유 미리보기에서 읽히게 하는 배포 메타 자산
- `/launch`: 제품 API의 `/public/launch-room`, `/public/start-concierge`, `/growth/launch-experiment-dashboard`, `/growth/launch-experiments/{experiment_id}/events`, `/growth/launch-distribution-plan`, `/growth/retention-hub`, `/growth/referral-launch-kit`, `/growth/acquisition-hub`, `/growth/public-conversion-board`, `/growth/launch-pulse`, `/growth/launch-war-room`, `/growth/launch-incident-center`, `/growth/launch-week-recap`, `/growth/launch-community-kit`, `/growth/launch-media-kit`, `/growth/launch-activation-offer`, `/growth/launch-response-loop`, `/ops/public-launch-preflight`, `/ops/team-purchase-consult-kit`, `/beta/readiness`, `/beta/launch-gate`, `/public/buyer-checklist`, `/public/buyer-persona-quiz`, `/public/mistake-cost-calculator`, `/public/buyer-challenge-kit`, `/public/spec-risk-scanner`, `/public/candidate-compare`, `/public/deal-timing-window`, `/public/social-proof-wall`, `/public/launch-objection-kit`, `/public/launch-share-pack`, `/public/launch-action-router`, `/public/launch-smoke`, `/public/proof-hub`, `/pricing/plans`를 읽어 공개 데모, 첫 구매 진단 콘시어지, CTA 실험 스트립, 첫 주 채널 배포 플랜, 구매 후속 리텐션 루프, 가입 전 추천 확산 키트, 공개 반응 운영 패널, 첫 24시간 런칭 워룸, 런칭 인시던트 센터, D+7 런칭 리포트, 커뮤니티 댓글 대응 키트, 런칭 미디어 키트, 런칭 전환 오퍼, 런칭 반응 후속 루프, 공개 출시 최종 체크, 런칭 반박 FAQ, 공유 확산팩, 방문자 액션 라우터, 공개 런칭 스모크 체크, Team 구매 표준안 프리뷰, 공개 출시 게이트, 구매 실패 방지 체크리스트, 30초 구매 성향 진단 퀴즈, 구매 실패 비용 계산기, 구매 챌린지 공유 키트, 옵션/사양 빠른 검수기, 공개 후보 비교 스냅샷, 공개 구매 타이밍 윈도우, 공개 검증 허브 evidence kit, Free/Premium/Team 요금제 비교 카드, 실제 반응 proof, 첫 주 founder update, SEV/runbook/escalation, 반복 질문 답변 템플릿, 외부 소개 피치, 첫 CTA/전환 오퍼, proof 후보/founder reply/제품 수정 큐, 시장 리포트, 출시 CTA, 공유 문구를 한 화면에 보여주고, 상시 전환 바로 분석 시작/공유 문구/추천 대기열 CTA를 고정 노출하며 클릭을 성장 이벤트로 저장하고, 공유 확산팩은 절대 URL 복사와 네이티브 공유를 제공하며 모든 복사/공유/열기 액션을 `share_cta`로 저장하고, 첫 화면은 내부 운영 점수 대신 구매 데모, 시장 리포트, 검증 근거, 결제 전 체크 개수를 보여주며, 반응형 hero 배경과 CTA 줄바꿈 가드로 모바일 첫 화면의 잘림을 막고, 출시 게이트부터 요금제/배포 플랜까지 무거운 런칭 운영 패널 전체를 스크롤 기반 지연 마운트, 재검증 캐시, 타임아웃 fallback으로 분산해 첫 방문 체감을 유지하며, `/launch/opengraph-image`와 `/launch/twitter-image` 전용 공유 카드를 메타에 연결하고, hero와 데모 분석 CTA는 세션 handoff로 메인 분석 폼을 자동 채우면서 `analysis_view` 성장 이벤트를 남기며 방문자 액션 라우터 선택/CTA 클릭, 추천 대기열, 요금제 관심 등록을 제품 API에 바로 저장하는 외부 공유용 런칭룸
- `/launch/opengraph-image`, `/launch/twitter-image`: 커뮤니티와 메신저 미리보기에서 제품명, 핵심 가치, 조건 진단/가격 타이밍/결제 전 검수 신호가 바로 보이도록 1200x630 PNG 공유 이미지를 동적으로 생성
- `/join?ref={referral_code}` 또는 `/join?source=public-report&report={share_token}`: 제품 API가 발급한 추천 URL이나 공개 리포트 CTA를 받아 대기열/요금제 관심 폼으로 연결하고, 가입 후 절대 초대 링크와 채널별 초대 문구 복사/공유 버튼으로 확산을 유도하는 추천 초대 페이지
- `/r/{share_token}`: 제품 API의 `/public/reports/{share_token}`를 서버에서 읽어 SpecPilot AI 웹사이트 브랜드의 공개 구매 리포트로 렌더링
- 첫 화면 공개 데모 갤러리는 데스크톱/노트북/팀 구매 preset을 분석 폼에 즉시 적용해 빈 폼 이탈을 줄임
- 공개 리포트는 구매 판정, 최종 후보, TOP 3 비교, 공유 브리프, 대안 시나리오, 조건 충족 매트릭스, 예산/조건 스트레스 테스트, 구매 타이밍, 구매 실행 체크리스트, 제휴/비제휴 구매 링크, 새 분석/대기열 전환 CTA를 한 화면에 표시
- 구매 링크는 제품 API의 `/buy/{link_id}` 추적 redirect를 사용해 공개 클릭 지표를 유지
- `/market/desktop-pc`, `/market/laptop`: 제품 API의 `/public/market/category-reports/{category}`를 읽어 SEO 제목, 월간 추천 픽, 가격 구간, 리스크 신호, 공개 체크리스트, 분석 CTA를 보여주는 공개 카테고리 리포트

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
LAUNCH_VISUAL_URL=http://127.0.0.1:3000/launch npm run check:launch-visual
LAUNCH_METADATA_URL=http://127.0.0.1:3000 npm run check:launch-metadata
npm audit --audit-level=moderate
docker build -t specpilot-ai-site:local .
```

`check`는 TypeScript 타입 검사와 Next.js production build를 실행합니다.
`check:launch-visual`은 실행 중인 `/launch`를 Chrome headless로 열어 데스크톱/모바일 hero 제목, CTA, proof pill, 상시 전환 바, 공유 확산팩 버튼/링크, 가로 overflow를 검사하고 캡처를 저장합니다. `CHROME_PATH`와 `LAUNCH_VISUAL_OUT_DIR`로 Chrome 경로와 캡처 저장 위치를 지정할 수 있습니다.
`check:launch-metadata`는 production `/launch`, `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `/launch/opengraph-image`, `/launch/twitter-image`를 열어 canonical, OG/Twitter 메타, JSON-LD, PNG 공유 이미지가 배포 가능한지 검사합니다.
GitHub Actions는 `npm run check`, production 서버 기반 `check:launch-visual`, `check:launch-metadata`, Docker build를 순서대로 실행하고 런칭 캡처를 artifact로 남깁니다.

## 연결되는 제품 API

- `POST /analyze`
- `POST /intake/diagnose`
- `POST /public/start-concierge`
- `GET /public/buyer-checklist`
- `GET /public/buyer-persona-quiz`
- `POST /public/buyer-persona-quiz/result`
- `GET /public/mistake-cost-calculator`
- `POST /public/mistake-cost-calculator/result`
- `GET /public/buyer-challenge-kit`
- `GET /public/spec-risk-scanner`
- `POST /public/spec-risk-scanner/result`
- `GET /public/candidate-compare`
- `GET /public/deal-timing-window`
- `GET /demo/scenarios`
- `GET /growth/acquisition-hub`
- `GET /growth/public-conversion-board`
- `GET /growth/retention-hub`
- `GET /growth/launch-pulse`
- `GET /growth/launch-war-room`
- `GET /growth/launch-incident-center`
- `GET /growth/launch-week-recap`
- `GET /growth/launch-community-kit`
- `GET /growth/launch-media-kit`
- `GET /growth/launch-activation-offer`
- `GET /growth/launch-response-loop`
- `POST /growth/waitlist-referrals`
- `GET /growth/referral-dashboard`
- `GET /growth/referral-leaderboard`
- `GET /growth/referral-share-kit/{referral_code}`
- `GET /growth/referral-rewards/{referral_code}`
- `GET /growth/referral-launch-kit`
- `GET /growth/launch-distribution-plan`
- `GET /public/proof-hub`
- `GET /public/social-proof-wall`
- `GET /public/launch-objection-kit`
- `GET /public/launch-share-pack`
- `GET /public/launch-action-router`
- `GET /public/launch-smoke`
- `GET /public/launch-room`
- `POST /growth/launch-experiments`
- `POST /growth/launch-experiments/{experiment_id}/events`
- `GET /growth/launch-experiment-dashboard`
- `POST /reports/save`
- `POST /reports/{report_id}/share`
- `GET /reports/{report_id}/share-assets`
- `POST /alerts/subscribe`
- `POST /alerts/evaluate`
- `GET /alerts/channels`
- `POST /alerts/channels`
- `GET /alerts/events`
- `POST /alerts/dispatch`
- `GET /alerts/deliveries`
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
- `GET /reports/decision-board`
- `POST /reports/{report_id}/purchase-outcomes`
- `GET /ops/learning-insights`
- `GET /ops/regression`
- `POST /ops/observability/exports`
- `GET /ops/observability/exports`
- `POST /ops/observability/dispatch`
- `POST /ops/integrations`
- `GET /ops/integration-readiness`
- `GET /ops/data-governance`
- `GET /market/category-reports`
- `GET /beta/readiness`
- `GET /beta/launch-gate`
- `POST /beta/cohorts`
- `GET /beta/cohorts`
- `GET /beta/cohorts/{cohort_id}/report`
- `GET /beta/cohorts/{cohort_id}/report.md`
- `GET /beta/backlog`
- `PATCH /beta/backlog/{backlog_id}`
- `GET /beta/backlog/summary`
- `GET /pricing/plans`
- `GET /billing/subscription-intents`
- `GET /ops/pricing-dashboard`
- `GET /ops/team-purchase-consult-kit`
- `POST /feedback`
- `POST /beta/leads`
- `POST /billing/subscription-intents`
- 공개 리포트 페이지(`/r/{share_token}`): Next.js 웹사이트에서 직접 렌더링

API가 꺼져 있으면 웹사이트는 내장 데모 리포트를 표시해 첫 화면 품질을 유지합니다.
