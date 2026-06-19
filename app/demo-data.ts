import type { AnalyzeResponse } from "./types";

export const demoResponse: AnalyzeResponse = {
  graph_trace_id: "demo_trace",
  report: {
    summary:
      "영상 편집과 QHD 게이밍 목적에는 가격, 호환성, 리뷰 리스크를 함께 본 TOP 3 비교가 적합합니다.",
    purchase_timing:
      "현재 3개 후보가 예산 안입니다. 재고 한정/쿠폰 조건은 결제 직전에 다시 확인하세요.",
    final_pick_id: "build-001",
    top_recommendations: [
      {
        rank: 1,
        product: {
          id: "build-001",
          model_name: "Creator RTX 4070 SUPER Build",
          option_summary:
            "Ryzen 7 7800X3D / RTX 4070 SUPER / 32GB / 1TB / 750W",
        },
        price: { effective_price_krw: 1_925_000 },
        score: { total_score: 93.4, compatibility: 96 },
        fit_summary:
          "QHD 144Hz와 영상 편집을 동시에 커버하고 AM5 업그레이드 여지가 좋습니다.",
      },
      {
        rank: 2,
        product: {
          id: "build-003",
          model_name: "Intel Creator RTX 4070 Build",
          option_summary: "Core i7-14700 / RTX 4070 / 32GB / 2TB / 750W",
        },
        price: { effective_price_krw: 2_085_000 },
        score: { total_score: 89.1, compatibility: 92 },
        fit_summary:
          "멀티코어 작업과 2TB SSD가 강하지만 냉각과 보드 옵션을 확인해야 합니다.",
      },
      {
        rank: 3,
        product: {
          id: "build-002",
          model_name: "Balanced RTX 4060 Ti Build",
          option_summary: "Ryzen 5 7500F / RTX 4060 Ti / 32GB / 1TB / 650W",
        },
        price: { effective_price_krw: 1_590_000 },
        score: { total_score: 84.7, compatibility: 94 },
        fit_summary:
          "예산 여유가 크지만 QHD 고주사율 게임은 옵션 타협이 필요합니다.",
      },
    ],
    purchase_decision: {
      label: "가격 대기",
      confidence: 86.2,
      reason: "1순위 점수는 높지만 목표가까지 차이가 있어 알림 후 결제가 유리합니다.",
      next_steps: [
        "목표가 알림을 켜고 재조회 주기를 확인하세요.",
        "최종 결제 화면의 배송비, 조립비, 카드 혜택을 다시 확인하세요.",
        "공유 브리프로 주변 검토를 받으세요.",
      ],
    },
    share_brief: {
      headline: "Creator RTX 4070 SUPER Build 공유 검토 브리프",
      verdict_label: "가격 대기",
      key_reasons: [
        "QHD 144Hz와 편집 워크플로를 동시에 만족합니다.",
        "실구매가와 호환성 점수가 균형적입니다.",
        "옵션 검수표로 주요 부품을 결제 전 대조할 수 있습니다.",
      ],
      watchouts: [
        "가격비교 묶음 견적은 재고가 빠르게 바뀔 수 있습니다.",
        "케이스 GPU 길이와 쿨러 높이를 숫자로 확인해야 합니다.",
      ],
      copy_text:
        "SpecPilot AI 검토 요청: 1순위 후보의 가격, 옵션명, 호환성 리스크를 결제 전 한 번 더 봐주세요.",
    },
    deal_windows: [
      {
        product_id: "build-001",
        model_name: "Creator RTX 4070 SUPER Build",
        label: "가격 대기",
        status: "warning",
        current_price_krw: 1_925_000,
        target_price_krw: 1_848_000,
        fair_price_band_krw: "1,809,500원 ~ 1,963,500원",
        urgency: "목표가 알림 우선",
        volatility_risk:
          "쿠폰/카드 혜택 의존도가 있어 결제 단계에서 가격이 바뀔 수 있습니다.",
        wait_reason: "목표가까지 77,000원 차이가 있어 즉시 결제 매력이 낮습니다.",
        buy_trigger:
          "1,848,000원 이하 또는 동급 대체 후보가 나오면 다시 비교하세요.",
        monitoring_plan: [
          "7일마다 목표가 도달 여부를 확인하세요.",
          "품절, 판매처 변경, 쿠폰 종료 시 비교표를 다시 생성하세요.",
        ],
      },
    ],
    source_health: [
      "가격 출처 3종 연결",
      "출처 링크와 캐시 정책 표시",
      "제휴 여부와 추천 기준 분리",
    ],
  },
  quality_audit: {
    quality_score: 91.5,
    estimated_cost_krw: 48,
    launch_blockers: [],
  },
};
