import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  MessageSquareQuote,
  Monitor,
  Rocket,
  ShieldCheck,
  Star,
} from "lucide-react";
import { getJson } from "../api/specpilot/_client";
import type {
  Category,
  PublicBuyerChallengeKit,
  PublicBuyerChecklist,
  PublicBuyerTrustKit,
  PublicCandidateCompare,
  PublicDealTimingWindow,
  PublicLaunchRoom,
  PublicLaunchRoomCard,
  PublicPriceWatchKit,
  PublicSocialProofWall,
  PublicSpecRiskScanner,
} from "../types";
import type { LaunchAnalysisHandoffInput } from "../analysis-handoff";
import { absoluteUrl, siteConfig } from "../site-config";
import { LaunchActionRouterPanel } from "./LaunchActionRouterPanel";
import { LaunchActivationOfferPanel } from "./LaunchActivationOfferPanel";
import { BuyerChallengeKitPanel } from "./BuyerChallengeKitPanel";
import { BuyerPersonaQuizPanel } from "./BuyerPersonaQuizPanel";
import { BenchmarkValidationPanel } from "./BenchmarkValidationPanel";
import { BuildBlueprintPanel } from "./BuildBlueprintPanel";
import { BudgetStressPanel } from "./BudgetStressPanel";
import { CandidateComparePanel } from "./CandidateComparePanel";
import { CheckoutLockPanel } from "./CheckoutLockPanel";
import { CommunityReplyPanel } from "./CommunityReplyPanel";
import { CustomCandidateDecisionPanel } from "./CustomCandidateDecisionPanel";
import { DealSanityPanel } from "./DealSanityPanel";
import { DealTimingWindowPanel } from "./DealTimingWindowPanel";
import { DecisionDefensePanel } from "./DecisionDefensePanel";
import { DefectClaimPanel } from "./DefectClaimPanel";
import { FinalDecisionPanel } from "./FinalDecisionPanel";
import { FirstBootSetupPanel } from "./FirstBootSetupPanel";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";
import { LaunchConversionPanel } from "./LaunchConversionPanel";
import { LaunchCommunityKitPanel } from "./LaunchCommunityKitPanel";
import { LaunchDistributionPlanPanel } from "./LaunchDistributionPlanPanel";
import { LaunchExperimentStrip } from "./LaunchExperimentStrip";
import { LaunchDeferredPanel } from "./LaunchDeferredPanel";
import { LaunchIncidentCenterPanel } from "./LaunchIncidentCenterPanel";
import { LaunchMediaKitPanel } from "./LaunchMediaKitPanel";
import { LaunchObjectionKitPanel } from "./LaunchObjectionKitPanel";
import { LaunchProofHubPanel } from "./LaunchProofHubPanel";
import { LaunchPreflightPanel } from "./LaunchPreflightPanel";
import { LaunchPublicOpsPanel } from "./LaunchPublicOpsPanel";
import { LaunchReadinessGatePanel } from "./LaunchReadinessGatePanel";
import { LaunchReferralMomentumPanel } from "./LaunchReferralMomentumPanel";
import { LaunchResponseLoopPanel } from "./LaunchResponseLoopPanel";
import { LaunchRetentionLoopPanel } from "./LaunchRetentionLoopPanel";
import { LaunchSharePackPanel } from "./LaunchSharePackPanel";
import { LaunchSmokePanel } from "./LaunchSmokePanel";
import { LaunchStickyConversionBar } from "./LaunchStickyConversionBar";
import { LaunchTeamConsultPreviewPanel } from "./LaunchTeamConsultPreviewPanel";
import { LaunchWarRoomPanel } from "./LaunchWarRoomPanel";
import { LaunchWeekRecapPanel } from "./LaunchWeekRecapPanel";
import { MistakeCostCalculatorPanel } from "./MistakeCostCalculatorPanel";
import { OutcomeShareCardPanel } from "./OutcomeShareCardPanel";
import { OwnershipCostPanel } from "./OwnershipCostPanel";
import { PriceBreakdownPanel } from "./PriceBreakdownPanel";
import { PriceTrustPanel } from "./PriceTrustPanel";
import { ProductPageEvidencePanel } from "./ProductPageEvidencePanel";
import { PurchaseApprovalBriefPanel } from "./PurchaseApprovalBriefPanel";
import { PurchaseAftercarePanel } from "./PurchaseAftercarePanel";
import { PurchaseExecutionPanel } from "./PurchaseExecutionPanel";
import { PurchaseJourneyPanel } from "./PurchaseJourneyPanel";
import { PurchaseQuestionTriagePanel } from "./PurchaseQuestionTriagePanel";
import { RequirementsConsensusPanel } from "./RequirementsConsensusPanel";
import { ReviewerQuickCardPanel } from "./ReviewerQuickCardPanel";
import { ReviewRiskPanel } from "./ReviewRiskPanel";
import { SellerEvidencePanel } from "./SellerEvidencePanel";
import { SellerNegotiationPanel } from "./SellerNegotiationPanel";
import { ShoppingCartIntakePanel } from "./ShoppingCartIntakePanel";
import { SetupCompatibilityPanel } from "./SetupCompatibilityPanel";
import { StartConciergePanel } from "./StartConciergePanel";
import { SpecRiskScannerPanel } from "./SpecRiskScannerPanel";
import { SpecTermDecoderPanel } from "./SpecTermDecoderPanel";
import { UpgradeReadinessPanel } from "./UpgradeReadinessPanel";
import { WarrantyReturnPanel } from "./WarrantyReturnPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpecPilot AI 런칭룸 | 컴퓨터 구매 의사결정 에이전트",
  description:
    "데스크톱 PC와 노트북 구매 결정을 위한 공개 데모, 시장 리포트, proof strip, CTA를 한 화면에서 확인합니다.",
  keywords: [
    ...siteConfig.keywords,
    "공개 런칭룸",
    "AI 구매 리포트",
    "컴퓨터 구매 실패 방지",
  ],
  alternates: {
    canonical: "/launch",
  },
  openGraph: {
    title: "SpecPilot AI 런칭룸",
    description:
      "컴퓨터와 노트북 구매를 위한 AI 의사결정 에이전트 공개 데모룸",
    url: "/launch",
    images: [
      {
        url: "/launch/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SpecPilot AI 공개 런칭룸 공유 카드",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpecPilot AI 런칭룸",
    description:
      "컴퓨터와 노트북 구매를 위한 AI 의사결정 에이전트 공개 데모룸",
    images: ["/launch/twitter-image"],
  },
};

const fallbackRoom: PublicLaunchRoom = {
  room_version: "specpilot.public_launch_room.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  launch_score: 62,
  headline: "컴퓨터와 노트북 구매 결정을 리포트로 정리하는 AI 에이전트",
  hero_message:
    "예산, 목적, 필수 조건, 제외 조건을 입력하면 추천 후보, 구매 타이밍, 리스크, 공유용 브리프까지 한 번에 정리합니다.",
  share_title: "SpecPilot AI 공개 데모",
  share_text:
    "데스크톱 PC와 노트북 구매를 앞둔 사람에게 조건 진단, 가격 타이밍, 구매 실행 체크리스트를 보여주는 공개 데모입니다.",
  primary_cta: "구매 조건 분석 시작",
  primary_cta_path: "#workspace",
  proof_strip: [
    "데스크톱 PC와 노트북 카테고리 지원",
    "추천 이유와 제외 이유를 함께 표시",
    "공개 리포트와 구매 링크 거버넌스 제공",
  ],
  demo_cards: [
    {
      key: "creator-desktop",
      title: "영상 편집용 데스크톱",
      status: "ok",
      metric: "예산 200만원 · QHD 144Hz",
      body: "성능, 업그레이드 여지, 가격 타이밍을 함께 비교합니다.",
      cta_label: "데모 조건 적용",
      cta_path: "/#workspace",
    },
    {
      key: "student-laptop",
      title: "대학생 노트북",
      status: "ok",
      metric: "휴대성 · 배터리 · A/S",
      body: "가벼운 작업과 장기 사용 리스크를 기준으로 후보를 좁힙니다.",
      cta_label: "노트북 리포트 보기",
      cta_path: "/market/laptop",
    },
    {
      key: "team-purchase",
      title: "팀 장비 구매",
      status: "warning",
      metric: "여러 명의 조건 취합",
      body: "공유 브리프와 결제 전 검수로 내부 승인 흐름을 줄입니다.",
      cta_label: "공개 리포트 흐름 확인",
      cta_path: "/#share",
    },
  ],
  launch_cards: [
    {
      key: "proof",
      title: "추천 근거 공개",
      status: "ok",
      metric: "proof strip",
      body: "추천 결과만 보여주지 않고 검수 기준과 공개 설명 문구를 함께 제공합니다.",
      cta_label: "검증 허브",
      cta_path: "/#proof-hub",
    },
    {
      key: "market",
      title: "카테고리 리포트",
      status: "ok",
      metric: "desktop_pc · laptop",
      body: "월간 추천 픽, 가격 구간, 리스크 신호를 공개 페이지로 분리합니다.",
      cta_label: "시장 리포트",
      cta_path: "/market/desktop-pc",
    },
    {
      key: "growth",
      title: "출시 반응 수집",
      status: "warning",
      metric: "waitlist · pricing intent",
      body: "대기열, 요금제 관심, 피드백을 제품 개선 신호로 연결합니다.",
      cta_label: "런칭 지표 확인",
      cta_path: "/#launch-pulse",
    },
  ],
  market_links: [
    {
      category: "desktop_pc",
      title: "데스크톱 PC 구매 리포트",
      path: "/market/desktop-pc",
      share_text: "영상 편집과 게임용 데스크톱 구성을 점검합니다.",
      lead_pick: "Creator RTX 4070 SUPER Build",
      risk_count: 2,
    },
    {
      category: "laptop",
      title: "노트북 구매 리포트",
      path: "/market/laptop",
      share_text: "휴대성, 배터리, A/S 리스크를 함께 비교합니다.",
      lead_pick: "CreatorBook 14 Pro",
      risk_count: 2,
    },
  ],
  secondary_ctas: [
    "공개 리포트를 지인에게 공유",
    "목표가 알림을 걸고 기다리기",
    "구매 후 결과를 학습 데이터로 남기기",
  ],
  channel_posts: [
    "컴퓨터 견적 고민을 리포트 형태로 정리해 주는 SpecPilot AI 공개 데모입니다.",
    "추천 후보뿐 아니라 제외 이유, 구매 타이밍, 결제 전 체크리스트까지 확인할 수 있습니다.",
  ],
  next_actions: [
    "첫 구매 조건을 입력해 리포트 생성",
    "시장 리포트 링크를 커뮤니티에 공유",
    "피드백과 구매 의향을 수집해 우선순위 조정",
  ],
};

const fallbackSocialProofWall: PublicSocialProofWall = {
  wall_version: "specpilot.public_social_proof_wall.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  proof_score: 48,
  headline: "첫 반응이 쌓이기 전에도 신뢰 기준부터 공개합니다.",
  summary:
    "추천 기준, 공개 리포트, 개인정보 마스킹 기준을 먼저 보여주고 첫 사용자 반응을 proof로 쌓습니다.",
  metric_cards: {
    feedback_count: 0,
    average_satisfaction: 0,
    purchase_intent_rate: "0%",
    purchase_outcomes: 0,
    completed_purchase_outcomes: 0,
    public_share_views: 0,
    referral_waitlist: 0,
    referred_signup_count: 0,
  },
  proof_strip: [
    "연락처 원문 없이 공개 proof를 만듭니다",
    "만족도 4점 이상 또는 구매 결과만 선별합니다",
    "제휴 링크 여부는 추천 순위와 분리합니다",
  ],
  items: [
    {
      proof_id: "fallback_trust_center",
      kind: "trust",
      title: "추천 기준을 먼저 공개합니다",
      body: "제휴 여부와 추천 순위를 분리하고, 가격 출처와 캐시 기준을 공개합니다.",
      metric: "Trust Center 공개",
      persona: "첫 방문자",
      source_label: "공개 신뢰 정책",
      rating: null,
      status: "warning",
      created_at: null,
    },
    {
      proof_id: "fallback_share_loop",
      kind: "trust",
      title: "공유 검토 루프를 준비했습니다",
      body: "구매 리포트를 토큰 기반 공개 페이지로 전환해 같은 근거를 함께 검토할 수 있습니다.",
      metric: "공개 리포트 준비",
      persona: "가족·팀 검토자",
      source_label: "제품 기본 proof",
      rating: null,
      status: "warning",
      created_at: null,
    },
  ],
  trust_notes: [
    "사용자 연락처, 주문번호, 원문 이메일은 공개하지 않습니다.",
    "가격과 제휴 조건은 추천 공정성 Trust Center 기준을 따릅니다.",
  ],
  cta_cards: [
    "내 조건으로 구매 리포트 만들기",
    "공개 베타 대기열 등록",
    "추천 기준 Trust Center 보기",
  ],
  next_actions: [
    "첫 공개 사용자에게 피드백과 구매 결과 회수 CTA를 강하게 노출하세요.",
  ],
};

const fallbackBuyerTrustKit: PublicBuyerTrustKit = {
  kit_version: "specpilot.public_buyer_trust_kit.fallback",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  headline: "구매 추천보다 먼저 신뢰 기준을 확인하세요.",
  summary:
    "가격 출처, 제휴 고지, 개인정보 최소화, 사람 검수 기준을 구매자 언어로 먼저 공개합니다.",
  trust_badges: [
    {
      badge_id: "recommendation_fairness",
      label: "추천 공정성",
      status: "ok",
      summary: "가격, 목적, 호환성, 리뷰 신뢰도를 분리해 추천합니다.",
      evidence: ["제휴 링크와 추천 점수 기준을 분리", "비제휴 대안 노출"],
      buyer_impact: "제휴 여부 때문에 후보 순위가 흐려지는 문제를 줄입니다.",
    },
    {
      badge_id: "source_verification",
      label: "출처 검수",
      status: "warning",
      summary: "가격 캐시 만료와 출처 신뢰도를 결제 전에 다시 확인합니다.",
      evidence: ["가격 캐시 TTL 표시", "신뢰도 낮은 소스는 검수 큐로 이동"],
      buyer_impact: "장바구니 최종가와 리포트 가격 차이를 줄입니다.",
    },
    {
      badge_id: "privacy",
      label: "개인정보 최소화",
      status: "ok",
      summary: "공개 표면에는 연락처와 주문번호 원문을 노출하지 않습니다.",
      evidence: ["공개 리포트는 share token 단위 접근", "연락처 마스킹"],
      buyer_impact: "공유 리포트를 열어도 내부 데이터가 노출되지 않습니다.",
    },
    {
      badge_id: "human_review",
      label: "사람 검수",
      status: "warning",
      summary: "불확실한 추천은 즉시 결제가 아니라 확인 필요로 표시합니다.",
      evidence: ["결제 전 검수", "판매자 답변과 리스크 승인 기록"],
      buyer_impact: "조건이 불확실한 후보를 바로 결제하지 않게 막습니다.",
    },
  ],
  buyer_rights: [
    "제휴 여부와 비제휴 대안 여부를 확인할 권리",
    "가격 캐시 만료와 검수 필요 여부를 결제 전에 확인할 권리",
    "공유 리포트 접근을 해제할 권리",
    "연락 동의 없이 후속 연락을 받지 않을 권리",
  ],
  risk_disclosures: [
    "오픈마켓 가격과 쿠폰은 짧은 시간 안에 변동될 수 있습니다.",
    "벤치마크는 목적별 참고 근거이며 실제 체감 성능을 보장하지 않습니다.",
    "제휴 수익은 추천 순위에 직접 반영하지 않습니다.",
  ],
  plain_language_guarantee:
    "최저가 하나만 밀지 않고 가격, 호환성, 리뷰 리스크, 개인정보 기준을 분리해 보여줍니다.",
  proof_strip: ["신뢰 배지 4개 공개", "가격·제휴·개인정보 기준 분리", "구매자 권리 4개"],
  primary_cta_label: "신뢰 기준 보고 분석 시작",
  primary_cta_path: "#analysis",
  next_actions: [
    "분석 결과의 가격과 장바구니 최종가가 다르면 결제 전 검수를 먼저 실행하세요.",
    "제휴 링크가 보이면 비제휴 대안과 추천 점수 기준을 함께 확인하세요.",
  ],
};

const fallbackBuyerChecklist: PublicBuyerChecklist = {
  checklist_version: "specpilot.public_buyer_checklist.fallback",
  generated_at: new Date(0).toISOString(),
  category: "desktop_pc",
  persona: "first_pc_buyer",
  budget_krw: 2_200_000,
  headline: "데스크톱 PC 구매 전 7개 항목만 확인하면 실패 가능성을 줄일 수 있습니다.",
  summary:
    "예산, 필수 조건, 실구매가, 옵션명, 판매자 답변, 결제 전 증거를 한 장으로 정리합니다.",
  readiness_score: 64,
  budget_fit: "예산은 맞지만 쿠폰 종료, 배송비, 옵션 변경을 결제 직전 확인해야 합니다.",
  primary_cta_label: "내 조건으로 분석 시작",
  primary_cta_anchor: "#analysis",
  analysis_prefill:
    "데스크톱을 220만원 안에서 추천해줘. 가격 타이밍과 결제 전 검수까지 같이 봐줘.",
  sections: [
    {
      section_id: "fit",
      title: "용도와 필수 조건",
      summary: "성능보다 먼저 사용 목적과 제외 조건을 고정합니다.",
      items: [
        {
          item_id: "purpose",
          label: "주 사용 목적을 한 문장으로 고정",
          status: "ok",
          why_it_matters: "같은 예산에서도 게임, 개발, 영상 편집 우선순위가 다릅니다.",
          user_input_hint: "예: QHD 게임과 영상 편집, 32GB RAM, RTX 4070급",
          failure_if_missing: "필요 없는 성능에 과투자할 수 있습니다.",
        },
      ],
    },
    {
      section_id: "checkout",
      title: "결제 전 검수",
      summary: "모델명, 옵션명, 최종 결제 금액을 주문 직전에 대조합니다.",
      items: [
        {
          item_id: "option_name",
          label: "리포트 후보와 주문 옵션명 일치 확인",
          status: "blocker",
          why_it_matters: "동일 시리즈라도 RAM, SSD, GPU 옵션이 다를 수 있습니다.",
          user_input_hint: "장바구니 옵션명과 판매 페이지 모델명을 붙여 넣으세요.",
          failure_if_missing: "비슷한 이름의 하위 옵션을 주문할 수 있습니다.",
        },
      ],
    },
  ],
  red_flags: [
    "최종 결제 금액이 리포트 가격보다 높아졌는데 이유를 설명할 수 없음",
    "판매 페이지 모델명과 장바구니 옵션명이 다름",
    "리뷰 반복 불만이나 AS 조건을 확인하지 않음",
  ],
  evidence_to_capture: [
    "최종 결제 화면의 총액, 배송비, 쿠폰/카드 혜택",
    "장바구니 옵션명과 판매 페이지 모델명",
    "판매자 답변, 배송 예정일, 반품/AS 조건",
  ],
  share_copy:
    "데스크톱 PC 구매 전에 SpecPilot AI 체크리스트로 실구매가, 옵션명, 결제 전 검수 항목을 확인했습니다.",
  next_actions: [
    "체크리스트의 입력 힌트를 분석 요청에 붙여 넣으세요.",
    "상위 후보가 나오면 공개 리포트로 주변 검토를 먼저 받으세요.",
  ],
};

const fallbackBuyerChallengeKit: PublicBuyerChallengeKit = {
  kit_version: "specpilot.public_buyer_challenge_kit.fallback",
  generated_at: new Date(0).toISOString(),
  category: "desktop_pc",
  budget_krw: 2_200_000,
  persona: "creator_gamer",
  headline: "데스크톱 PC 구매 실패 방지 챌린지를 공유하고 결제 전 검수를 받으세요.",
  summary:
    "성향 진단, 실패 비용 계산, 결제 전 체크리스트를 하나의 공유 문구로 묶어 지인과 커뮤니티에서 먼저 검토받습니다.",
  challenge_title: "데스크톱 PC 2,200,000원 구매 실패 방지 챌린지",
  challenge_steps: [
    {
      step_id: "persona",
      title: "구매 성향 고정",
      action: "성능, 예산, 구매 일정 중 무엇을 우선할지 먼저 정합니다.",
      proof: "평가 기준이 고정되어야 특가와 추천 후보를 흔들리지 않고 비교합니다.",
    },
    {
      step_id: "cost",
      title: "실패 비용 계산",
      action: "성능 부족, 옵션 불일치, 반품 지연 비용을 예산 기준으로 봅니다.",
      proof: "예상 손실이 커지면 즉시 결제보다 검수 리포트가 우선입니다.",
    },
    {
      step_id: "share",
      title: "채널별 공유",
      action: "가족, 커뮤니티, 팀 승인 채널에 맞는 문구로 의견을 받습니다.",
      proof: "같은 조건을 공유하면 빠진 요구사항과 위험 신호가 빨리 보입니다.",
    },
  ],
  analysis_prefill:
    "데스크톱 PC를 2,200,000원 안에서 추천해줘. QHD 게임, 영상 편집, 32GB RAM, GPU/파워/케이스 호환성, 가격 타이밍, 결제 전 검수까지 같이 봐줘.",
  checklist_path:
    "/public/buyer-checklist?category=desktop_pc&budget_krw=2200000&persona=creator_gamer",
  mistake_cost_path:
    "/public/mistake-cost-calculator/result?category=desktop_pc&budget_krw=2200000&quantity=1&urgency=normal",
  persona_quiz_path: "/public/buyer-persona-quiz",
  hashtags: ["#SpecPilotAI", "#컴퓨터구매", "#구매실패방지", "#PC견적"],
  proof_points: [
    "예산, 목적, 제외 조건을 추천 전에 먼저 고정합니다.",
    "실구매가와 옵션명을 결제 직전에 대조합니다.",
    "추천 이유와 제외 이유를 공유 리포트로 함께 검토합니다.",
  ],
  share_variants: [
    {
      channel: "kakao",
      label: "카카오톡·가족 채팅",
      headline: "데스크톱 PC 사기 전에 이 조건 괜찮은지 봐줘",
      body: "지인에게 예산과 걱정되는 리스크를 짧게 공유합니다.",
      cta: "의견 받기",
      copy_text:
        "데스크톱 PC 구매 전에 조건 검토 좀 부탁해. 예산은 2,200,000원이고 SpecPilot AI 체크리스트로 먼저 확인해보려고 해.",
    },
    {
      channel: "community",
      label: "커뮤니티·카페",
      headline: "2,200,000원 데스크톱 PC 구매 실패 방지 챌린지",
      body: "커뮤니티에서 반대 의견과 빠진 조건을 받는 문구입니다.",
      cta: "피드백 받기",
      copy_text:
        "SpecPilot AI로 데스크톱 PC 2,200,000원 구매 실패 방지 챌린지를 해보려고 합니다. 빠진 조건이나 위험 신호가 있으면 알려주세요.",
    },
    {
      channel: "team",
      label: "팀 슬랙·승인 채널",
      headline: "데스크톱 PC 구매 승인 전 검토 요청",
      body: "승인자와 실사용자에게 같은 근거를 공유합니다.",
      cta: "승인 근거 공유",
      copy_text:
        "구매 승인 전 조건 검토 요청입니다. SpecPilot AI 체크리스트 기준으로 납기, AS, 옵션명, 총액, 대체 후보, 반품 조건을 확인하려고 합니다.",
    },
  ],
  primary_cta_label: "챌린지 조건으로 분석 시작",
  primary_cta_path: "#analysis",
  next_actions: [
    "가장 가까운 채널 문구를 복사해 주변 검토를 먼저 받으세요.",
    "반응이 온 조건을 분석 요청에 합쳐 첫 리포트를 생성하세요.",
  ],
};

const fallbackSpecRiskScanner: PublicSpecRiskScanner = {
  scanner_version: "specpilot.public_spec_risk_scanner.fallback",
  generated_at: new Date(0).toISOString(),
  headline: "결제 직전 옵션명과 사양을 30초 안에 대조합니다.",
  summary:
    "판매 페이지 제목, 장바구니 옵션명, 최종 결제 금액을 붙여 넣으면 예산 초과, CPU/GPU/RAM/SSD/OS 불일치, 캡처해야 할 증거 누락을 결제 가능·확인 필요·보류로 판정합니다.",
  default_category: "desktop_pc",
  default_budget_krw: 2_200_000,
  result_endpoint: "/public/spec-risk-scanner/result",
  example_request: {
    category: "desktop_pc",
    product_title: "Creator RTX 4070 SUPER Build",
    budget_krw: 2_200_000,
    cart_total_krw: 2_185_000,
    expected_cpu: "Ryzen 7 7800X3D",
    expected_gpu: "RTX 4070 SUPER",
    expected_ram_gb: 32,
    expected_storage_gb: 1000,
  },
  required_evidence: [
    "판매 페이지 모델명과 장바구니 옵션명",
    "최종 결제 금액, 배송비, 쿠폰, 카드 할인",
    "RAM/SSD/GPU/패널/OS 옵션 선택 상태",
    "배송 예정일, 반품, AS, 판매자 답변",
  ],
  next_actions: [
    "blocker가 있으면 바로 결제하지 말고 옵션명과 최종가 캡처를 먼저 확보하세요.",
    "warning만 남으면 분석 prefill로 SpecPilot AI 리포트를 만들어 대체 후보와 비교하세요.",
  ],
};

const fallbackCandidateCompare: PublicCandidateCompare = {
  compare_version: "specpilot.public_candidate_compare.fallback",
  generated_at: new Date(0).toISOString(),
  category: "desktop_pc",
  budget_krw: 2_200_000,
  purpose: "qhd_creator",
  headline: "데스크톱 PC 후보 5개를 가격, 리스크, 목적 적합도로 바로 비교합니다.",
  summary:
    "첫 방문자가 긴 분석을 시작하기 전에도 TOP 후보, 예산 방어 후보, 성능 우선 후보, 안전 우선 후보의 차이를 한 화면에서 볼 수 있게 구성했습니다.",
  winner_product_id: "build-creator-4070s",
  winner_reason:
    "Creator RTX 4070 SUPER Build는 현재 승자 후보로, 점수 91점과 ok 상태를 기준으로 첫 비교의 기준 후보입니다.",
  items: [
    {
      product_id: "build-creator-4070s",
      model_name: "Creator RTX 4070 SUPER Build",
      category: "desktop_pc",
      role_label: "현재 승자 후보",
      effective_price_krw: 2_185_000,
      price_gap_krw: -15_000,
      score: 91,
      status: "ok",
      option_summary: "Ryzen 7 7800X3D / RTX 4070 SUPER / RAM 32GB / SSD 1TB",
      fit_summary: "QHD 게임과 영상 편집 기준으로 성능, 가격, 리스크 균형이 가장 안정적입니다.",
      reasons: ["QHD 144Hz와 영상 편집 균형이 좋습니다.", "리뷰 근거와 가격 출처가 안정적입니다."],
      watchouts: ["케이스 GPU 길이와 파워 커넥터를 결제 전 확인하세요."],
      evidence: ["공개 가격 비교 실구매가 2,185,000원", "리뷰 신뢰도 90점, 근거 18개"],
      cta_label: "이 후보 조건으로 분석",
    },
    {
      product_id: "build-value-4060ti",
      model_name: "Value RTX 4060 Ti Build",
      category: "desktop_pc",
      role_label: "예산 방어 후보",
      effective_price_krw: 1_540_000,
      price_gap_krw: -660_000,
      score: 82,
      status: "ok",
      option_summary: "Ryzen 5 7500F / RTX 4060 Ti / RAM 32GB / SSD 1TB",
      fit_summary: "예산 여유를 크게 남기지만 장기 성능 여유는 승자 후보보다 작습니다.",
      reasons: ["예산 방어력이 높습니다.", "핵심 부품 구성이 명확합니다."],
      watchouts: ["고해상도 영상 편집 성능 여유가 줄어듭니다."],
      evidence: ["공개 가격 비교 실구매가 1,540,000원", "벤치마크 QHD 기준선 충족"],
      cta_label: "이 후보 조건으로 분석",
    },
    {
      product_id: "build-4080s-pro",
      model_name: "Creator RTX 4080 SUPER Pro",
      category: "desktop_pc",
      role_label: "성능 우선 후보",
      effective_price_krw: 2_890_000,
      price_gap_krw: 690_000,
      score: 79,
      status: "blocker",
      option_summary: "Ryzen 9 / RTX 4080 SUPER / RAM 64GB / SSD 2TB",
      fit_summary: "성능은 매력적이지만 예산 승인 없이는 결제 전 보류가 필요합니다.",
      reasons: ["무거운 편집과 장기 사용 여유가 큽니다.", "GPU 성능 여유가 가장 큽니다."],
      watchouts: ["예산 초과", "파워와 발열 여유 확인 필요"],
      evidence: ["공개 가격 비교 실구매가 2,890,000원", "4K/렌더링 벤치마크 상위"],
      cta_label: "이 후보 조건으로 분석",
    },
    {
      product_id: "build-official-safe",
      model_name: "Official Store Creator PC",
      category: "desktop_pc",
      role_label: "안전 우선 후보",
      effective_price_krw: 2_240_000,
      price_gap_krw: 40_000,
      score: 78,
      status: "warning",
      option_summary: "공식 스토어 완본체 / RTX 4070급 / RAM 32GB / SSD 1TB",
      fit_summary: "A/S와 출처 안정성은 좋지만 최종가와 옵션명을 다시 확인해야 합니다.",
      reasons: ["공식 스토어 출처가 명확합니다.", "반품/AS 조건 확인이 쉽습니다."],
      watchouts: ["예산 소폭 초과", "옵션명 변경 여부 확인 필요"],
      evidence: ["공식 스토어 실구매가 2,240,000원", "AS 조건 공개"],
      cta_label: "이 후보 조건으로 분석",
    },
  ],
  axes: [
    {
      axis_id: "winner",
      label: "종합 승자",
      winner_product_id: "build-creator-4070s",
      summary: "Creator RTX 4070 SUPER Build가 목적 적합도와 리스크 균형이 가장 좋습니다.",
    },
    {
      axis_id: "budget",
      label: "예산 방어",
      winner_product_id: "build-value-4060ti",
      summary: "Value RTX 4060 Ti Build는 최저 비용으로 비교 기준선을 만듭니다.",
    },
    {
      axis_id: "performance",
      label: "성능 우선",
      winner_product_id: "build-4080s-pro",
      summary: "Creator RTX 4080 SUPER Pro는 성능 여유가 가장 큰 선택지입니다.",
    },
    {
      axis_id: "risk",
      label: "안전 우선",
      winner_product_id: "build-official-safe",
      summary: "Official Store Creator PC는 결제 전 출처 리스크가 낮습니다.",
    },
  ],
  scenarios: [
    {
      scenario: "balanced",
      label: "균형 우선",
      product_id: "build-creator-4070s",
      model_name: "Creator RTX 4070 SUPER Build",
      why: "목적 적합도, 가격, 리뷰 신뢰도, 구매 안정성의 합산 점수가 가장 높습니다.",
      tradeoff: "최저가는 아닐 수 있어 목표가 알림과 최종가 캡처가 필요합니다.",
    },
    {
      scenario: "budget",
      label: "예산 절감",
      product_id: "build-value-4060ti",
      model_name: "Value RTX 4060 Ti Build",
      why: "비용을 가장 낮추면서 같은 카테고리의 비교 기준선을 제공합니다.",
      tradeoff: "성능, 업그레이드, 장기 사용 여유를 일부 포기할 수 있습니다.",
    },
    {
      scenario: "performance",
      label: "성능 우선",
      product_id: "build-4080s-pro",
      model_name: "Creator RTX 4080 SUPER Pro",
      why: "무거운 작업이나 장기 사용을 위해 성능 여유를 가장 크게 확보합니다.",
      tradeoff: "예산 초과나 과투자 리스크를 별도로 승인해야 합니다.",
    },
    {
      scenario: "safe",
      label: "안전 우선",
      product_id: "build-official-safe",
      model_name: "Official Store Creator PC",
      why: "리스크 상태와 리뷰 신뢰도를 우선해 결제 전 불확실성을 낮춥니다.",
      tradeoff: "특가나 최고 성능보다 출처와 안정성을 우선합니다.",
    },
  ],
  analysis_prefill:
    "데스크톱 PC를 2,200,000원 예산으로 비교해줘. 목적은 QHD 게임과 영상 편집이고 TOP 3, 제외 후보, 대안 시나리오, 결제 전 옵션/가격 검수까지 같이 봐줘.",
  share_copy:
    "SpecPilot AI 공개 후보 비교\n- 카테고리: 데스크톱 PC\n- 예산: 2,200,000원\n- 현재 승자: Creator RTX 4070 SUPER Build\n- 예산 절감: Value RTX 4060 Ti Build\n- 성능 우선: Creator RTX 4080 SUPER Pro\n가격, 리스크, 목적 적합도 기준으로 결제 전 의견 부탁드립니다.",
  primary_cta_label: "이 비교표로 분석 시작",
  primary_cta_path: "#analysis",
  next_actions: [
    "승자 후보와 예산 방어 후보를 함께 공유해 반대 의견을 먼저 받으세요.",
    "결제 직전에는 옵션/사양 빠른 검수기로 장바구니 문구와 최종가를 대조하세요.",
    "점수 차이가 작으면 분석 리포트에서 제외 후보와 스트레스 테스트를 확인하세요.",
  ],
};

const fallbackDealTimingWindow: PublicDealTimingWindow = {
  timing_version: "specpilot.public_deal_timing_window.fallback",
  generated_at: new Date(0).toISOString(),
  category: "desktop_pc",
  budget_krw: 2_200_000,
  purpose: "qhd_creator",
  headline: "데스크톱 PC 후보별 지금 결제와 가격 대기를 분리합니다.",
  summary:
    "현재가, 목표가, 적정가 밴드, 재고/쿠폰 변동 리스크를 한 화면에 묶어 충동 결제와 의미 있는 대기를 구분합니다.",
  lead_product_id: "build-creator-4070s",
  lead_label: "현재 결제 가능",
  buy_now_count: 2,
  wait_count: 2,
  hold_count: 1,
  target_savings_krw: 372_000,
  windows: [
    {
      product_id: "build-creator-4070s",
      model_name: "Creator RTX 4070 SUPER Build",
      status: "ok",
      label: "현재 결제 가능",
      current_price_krw: 2_185_000,
      target_price_krw: 2_097_000,
      fair_price_band_krw: "2,053,000원 ~ 2,251,000원",
      urgency: "오늘 결제 가능",
      volatility_risk: "쿠폰/카드 조건, 판매처 변동",
      wait_reason: "예산 안에 들어와 있어 옵션명과 최종 결제 금액만 맞으면 구매 후보입니다.",
      buy_trigger: "장바구니 옵션명, 배송비, 반품/AS 조건 캡처가 모두 맞으면 결제합니다.",
      monitoring_plan: [
        "목표가 알림을 설정하고 현재가를 3일 주기로 재확인합니다.",
        "판매자, 배송비, 쿠폰/카드 할인 조건을 결제 직전에 다시 대조합니다.",
        "결제 전 옵션/사양 빠른 검수기로 최종 화면을 확인합니다.",
      ],
    },
    {
      product_id: "build-value-4060ti",
      model_name: "Value RTX 4060 Ti Build",
      status: "ok",
      label: "현재 결제 가능",
      current_price_krw: 1_540_000,
      target_price_krw: 1_478_000,
      fair_price_band_krw: "1,447,000원 ~ 1,586,000원",
      urgency: "오늘 결제 가능",
      volatility_risk: "낮음",
      wait_reason: "예산 여유가 커 장기 성능 여유만 동의되면 구매 후보입니다.",
      buy_trigger: "최종 옵션명과 배송/반품 조건이 일치하면 결제합니다.",
      monitoring_plan: [
        "목표가 알림을 설정하고 현재가를 3일 주기로 재확인합니다.",
        "결제 전 옵션/사양 빠른 검수기로 최종 화면을 확인합니다.",
      ],
    },
    {
      product_id: "build-official-safe",
      model_name: "Official Store Creator PC",
      status: "warning",
      label: "목표가 근접 대기",
      current_price_krw: 2_240_000,
      target_price_krw: 2_105_000,
      fair_price_band_krw: "2,105,000원 ~ 2,288,000원",
      urgency: "24-48시간 재확인",
      volatility_risk: "쿠폰/카드 조건",
      wait_reason: "예산보다 40,000원 높아 공식 출처 안정성과 가격 차이를 같이 봐야 합니다.",
      buy_trigger: "2,105,000원 이하 또는 공식 출처 조건이 안정되면 결제 검토합니다.",
      monitoring_plan: [
        "목표가 알림을 설정하고 현재가를 3일 주기로 재확인합니다.",
        "판매자, 배송비, 쿠폰/카드 할인 조건을 결제 직전에 다시 대조합니다.",
      ],
    },
    {
      product_id: "build-limited-deal",
      model_name: "Limited Deal RTX 4070 Build",
      status: "warning",
      label: "특가/재고 재확인",
      current_price_krw: 2_150_000,
      target_price_krw: 2_064_000,
      fair_price_band_krw: "2,021,000원 ~ 2,264,000원",
      urgency: "24-48시간 재확인",
      volatility_risk: "한정 재고, 판매처 변동",
      wait_reason: "예산 안이지만 재고와 판매자 조건이 흔들릴 수 있어 결제 직전 재확인이 필요합니다.",
      buy_trigger: "2,064,000원 이하 또는 재고/판매자 조건이 안정되면 결제 검토합니다.",
      monitoring_plan: [
        "목표가 알림을 설정하고 현재가를 3일 주기로 재확인합니다.",
        "재고 한정 문구가 사라지거나 가격이 바뀌면 장바구니를 다시 캡처합니다.",
        "판매자, 배송비, 쿠폰/카드 할인 조건을 결제 직전에 다시 대조합니다.",
      ],
    },
    {
      product_id: "build-4080s-pro",
      model_name: "Creator RTX 4080 SUPER Pro",
      status: "blocker",
      label: "가격 대기",
      current_price_krw: 2_890_000,
      target_price_krw: 2_200_000,
      fair_price_band_krw: "2,716,000원 ~ 2,716,000원",
      urgency: "목표가 알림 후 대기",
      volatility_risk: "판매처 변동",
      wait_reason: "성능 여유는 크지만 이번 예산 기준에서는 과투자 리스크가 큽니다.",
      buy_trigger: "2,200,000원 이하로 내려오고 사용 목적이 고성능 작업으로 확정될 때만 검토합니다.",
      monitoring_plan: [
        "목표가 알림을 설정하고 현재가를 3일 주기로 재확인합니다.",
        "판매자, 배송비, 쿠폰/카드 할인 조건을 결제 직전에 다시 대조합니다.",
      ],
    },
  ],
  analysis_prefill:
    "데스크톱 PC를 2,200,000원 예산으로 살지 기다릴지 판단해줘. 목적은 QHD 게임과 영상 편집이고 비교 후보는 Creator RTX 4070 SUPER Build, Value RTX 4060 Ti Build, Official Store Creator PC야. 현재가, 목표가, 적정가 밴드, 재고/쿠폰 리스크, 결제 트리거를 같이 봐줘.",
  share_copy:
    "SpecPilot AI 공개 구매 타이밍\n- 카테고리: 데스크톱 PC\n- 예산: 2,200,000원\n- 우선 판단: Creator RTX 4070 SUPER Build / 현재 결제 가능\n- Creator RTX 4070 SUPER Build: 현재 2,185,000원, 목표 2,097,000원\n- Value RTX 4060 Ti Build: 현재 1,540,000원, 목표 1,478,000원\n지금 결제할지, 목표가 알림 후 기다릴지 의견 부탁드립니다.",
  primary_cta_label: "타이밍 조건으로 분석 시작",
  primary_cta_path: "#analysis",
  next_actions: [
    "현재 결제 가능 후보도 장바구니 옵션명과 최종 결제 금액을 다시 캡처하세요.",
    "가격 대기 후보는 목표가 알림을 설정하고 판매자/쿠폰 조건 변동을 같이 보세요.",
    "타이밍 판단이 갈리면 후보 비교 스냅샷과 함께 공유해 반대 의견을 먼저 받으세요.",
    "blocker 후보는 예산 승인 또는 사용 목적 강화 없이는 제외 후보로 두세요.",
  ],
};

const fallbackPriceWatchKit: PublicPriceWatchKit = {
  watch_version: "specpilot.public_price_watch_kit.fallback",
  generated_at: new Date(0).toISOString(),
  category: "desktop_pc",
  budget_krw: 2_200_000,
  purpose: "qhd_creator",
  headline: "데스크톱 PC 목표가를 놓치지 않도록 대기 조건을 알림으로 바꿉니다.",
  summary:
    "가격 비교 후 '조금 더 기다릴까'에서 멈추지 않도록 후보별 목표가, 알림 기준, 재확인 주기, 결제 판단 문구를 한 번에 제공합니다.",
  watched_count: 3,
  immediate_buy_count: 2,
  total_target_savings_krw: 1_061_000,
  primary_watch_product_id: "build-official-safe",
  primary_watch_label: "목표가 근접 알림",
  candidates: [
    {
      product_id: "build-creator-4070s",
      model_name: "Creator RTX 4070 SUPER Build",
      status: "ok",
      current_price_krw: 2_185_000,
      target_price_krw: 2_097_000,
      target_gap_krw: 88_000,
      alert_threshold_krw: 2_185_000,
      cadence: "결제 전 1회 최종 확인",
      alert_reason: "이미 예산권이라 옵션명과 최종 결제 금액만 틀어지지 않으면 됩니다.",
      notification_copy:
        "Creator RTX 4070 SUPER Build 최종가가 2,185,000원입니다. 옵션/AS 조건 확인 후 결제하세요.",
      decision_rule: "장바구니 가격, 배송비, 판매자, 반품/AS 조건이 현재 스냅샷과 같으면 결제합니다.",
      fallback_action: "조건이 달라졌다면 공개 후보 비교표로 같은 예산대 대체 후보를 다시 확인합니다.",
    },
    {
      product_id: "build-official-safe",
      model_name: "Official Store Creator PC",
      status: "warning",
      current_price_krw: 2_240_000,
      target_price_krw: 2_105_000,
      target_gap_krw: 135_000,
      alert_threshold_krw: 2_126_050,
      cadence: "매일 오전 1회, 쿠폰/카드 조건 변동 시 즉시 확인",
      alert_reason: "목표가까지 135,000원 차이라 쿠폰/카드 조건 한 번으로 결제권에 들어올 수 있습니다.",
      notification_copy:
        "Official Store Creator PC가 2,126,050원 이하로 내려왔습니다. 결제 전 판매자와 배송비를 확인하세요.",
      decision_rule: "목표가 이하이면서 판매자/배송비/쿠폰 조건이 바뀌지 않았을 때만 결제 검토합니다.",
      fallback_action: "48시간 안에 목표가가 오지 않으면 현재 결제 가능 후보와 다시 비교합니다.",
    },
    {
      product_id: "build-4080s-pro",
      model_name: "Creator RTX 4080 SUPER Pro",
      status: "blocker",
      current_price_krw: 2_890_000,
      target_price_krw: 2_200_000,
      target_gap_krw: 690_000,
      alert_threshold_krw: 2_200_000,
      cadence: "3일마다 확인, 목표가 도달 알림만 즉시 확인",
      alert_reason: "목표가까지 690,000원 이상 차이가 있어 대기 없이는 과소비 가능성이 큽니다.",
      notification_copy:
        "Creator RTX 4080 SUPER Pro가 2,200,000원 이하로 내려왔습니다. 예산 승인 후에만 검토하세요.",
      decision_rule: "목표가 이하로 내려와도 예산 승인 또는 고성능 작업 목적이 확정되지 않으면 보류합니다.",
      fallback_action: "7일 안에 목표가가 오지 않으면 예산을 유지하고 상위 후보를 제외합니다.",
    },
  ],
  alert_script:
    "데스크톱 PC 3개 후보를 목표가 알림에 등록합니다. 1순위는 Official Store Creator PC, 기준가는 2,126,050원입니다. 알림이 오면 옵션명, 판매자, 배송비, 쿠폰/카드 조건을 캡처한 뒤 결제 판단으로 이동하세요.",
  analysis_prefill:
    "데스크톱 PC를 2,200,000원 예산으로 구매하려고 해. 목적은 qhd_creator이고 Official Store Creator PC를 2,126,050원 이하 목표가로 감시하려고 해. 알림이 왔을 때 바로 결제해도 되는지 옵션/판매자/배송비/AS 조건까지 검수해줘.",
  share_copy:
    "SpecPilot AI 공개 목표가 감시\n- 카테고리: 데스크톱 PC\n- 예산: 2,200,000원\n- 1순위 알림: Official Store Creator PC\n- Creator RTX 4070 SUPER Build: 현재 2,185,000원, 알림 2,185,000원\n- Official Store Creator PC: 현재 2,240,000원, 알림 2,126,050원\n- Creator RTX 4080 SUPER Pro: 현재 2,890,000원, 알림 2,200,000원\n목표가가 오면 바로 결제할지, 대체 후보로 갈지 의견 부탁드립니다.",
  primary_cta_label: "목표가 조건으로 분석 시작",
  primary_cta_path: "#analysis",
  next_actions: [
    "목표가 후보는 가격만 보지 말고 판매자, 배송비, 쿠폰/카드 조건까지 같은 알림 메모에 남기세요.",
    "알림이 오면 장바구니 캡처를 먼저 만들고 옵션/사양 빠른 검수기로 마지막 오구매를 막으세요.",
    "48시간 이상 목표가가 오지 않으면 현재 결제 가능 후보와 가격 차이를 다시 비교하세요.",
    "즉시 결제 후보는 목표가 알림이 아니라 결제 전 조건 변경 감시로 분리하세요.",
  ],
};

async function loadLaunchRoom(): Promise<{
  room: PublicLaunchRoom;
  isFallback: boolean;
}> {
  try {
    const room = await getJson<PublicLaunchRoom>("/public/launch-room?limit=8");
    return { room, isFallback: false };
  } catch {
    return { room: fallbackRoom, isFallback: true };
  }
}

async function loadSocialProofWall(): Promise<{
  wall: PublicSocialProofWall;
  isFallback: boolean;
}> {
  try {
    const wall = await getJson<PublicSocialProofWall>(
      "/public/social-proof-wall?limit=8",
    );
    return { wall, isFallback: false };
  } catch {
    return { wall: fallbackSocialProofWall, isFallback: true };
  }
}

async function loadBuyerTrustKit(): Promise<{
  trustKit: PublicBuyerTrustKit;
  isFallback: boolean;
}> {
  try {
    const trustKit = await getJson<PublicBuyerTrustKit>(
      "/public/buyer-trust-kit?limit=4",
    );
    return { trustKit, isFallback: false };
  } catch {
    return { trustKit: fallbackBuyerTrustKit, isFallback: true };
  }
}

async function loadBuyerChecklist(): Promise<{
  checklist: PublicBuyerChecklist;
  isFallback: boolean;
}> {
  try {
    const checklist = await getJson<PublicBuyerChecklist>(
      "/public/buyer-checklist?category=desktop_pc&budget_krw=2200000&persona=creator_gamer",
    );
    return { checklist, isFallback: false };
  } catch {
    return { checklist: fallbackBuyerChecklist, isFallback: true };
  }
}

async function loadBuyerChallengeKit(): Promise<{
  kit: PublicBuyerChallengeKit;
  isFallback: boolean;
}> {
  try {
    const kit = await getJson<PublicBuyerChallengeKit>(
      "/public/buyer-challenge-kit?category=desktop_pc&budget_krw=2200000&persona=creator_gamer",
    );
    return { kit, isFallback: false };
  } catch {
    return { kit: fallbackBuyerChallengeKit, isFallback: true };
  }
}

async function loadSpecRiskScanner(): Promise<{
  scanner: PublicSpecRiskScanner;
  isFallback: boolean;
}> {
  try {
    const scanner = await getJson<PublicSpecRiskScanner>(
      "/public/spec-risk-scanner",
    );
    return { scanner, isFallback: false };
  } catch {
    return { scanner: fallbackSpecRiskScanner, isFallback: true };
  }
}

async function loadCandidateCompare(): Promise<{
  compare: PublicCandidateCompare;
  isFallback: boolean;
}> {
  try {
    const compare = await getJson<PublicCandidateCompare>(
      "/public/candidate-compare?category=desktop_pc&budget_krw=2200000&purpose=qhd_creator",
    );
    return { compare, isFallback: false };
  } catch {
    return { compare: fallbackCandidateCompare, isFallback: true };
  }
}

async function loadDealTimingWindow(): Promise<{
  timing: PublicDealTimingWindow;
  isFallback: boolean;
}> {
  try {
    const timing = await getJson<PublicDealTimingWindow>(
      "/public/deal-timing-window?category=desktop_pc&budget_krw=2200000&purpose=qhd_creator",
    );
    return { timing, isFallback: false };
  } catch {
    return { timing: fallbackDealTimingWindow, isFallback: true };
  }
}

async function loadPriceWatchKit(): Promise<{
  watchKit: PublicPriceWatchKit;
  isFallback: boolean;
}> {
  try {
    const watchKit = await getJson<PublicPriceWatchKit>(
      "/public/price-watch-kit?category=desktop_pc&budget_krw=2200000&purpose=qhd_creator",
    );
    return { watchKit, isFallback: false };
  } catch {
    return { watchKit: fallbackPriceWatchKit, isFallback: true };
  }
}

function tone(status: PublicLaunchRoom["status"] | PublicSocialProofWall["status"]) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function hrefFor(path: string) {
  if (path.startsWith("#")) {
    return `/${path}`;
  }
  return path;
}

function isAnalysisEntryPath(path: string) {
  const href = hrefFor(path);
  return href === "/#analysis" || href === "/#workspace";
}

function heroAnalysisHandoff(label: string): LaunchAnalysisHandoffInput {
  return {
    source: "launch-hero",
    label,
    query:
      "영상 편집과 QHD 게임용 데스크톱을 220만원 안에서 사고 싶어요. 가격 타이밍과 제외해야 할 옵션까지 같이 봐주세요.",
    category: "desktop_pc",
    budget_krw: 2200000,
    purpose: "qhd_creator",
    must_haves: ["QHD 게임", "영상 편집", "32GB RAM", "업그레이드 여지"],
    exclusions: ["출처 없는 최저가", "A/S 불명확한 조립 옵션"],
  };
}

function demoCardCategory(card: PublicLaunchRoomCard): Category {
  const text = `${card.key} ${card.title} ${card.body} ${card.metric}`.toLowerCase();
  return text.includes("laptop") || text.includes("노트북") ? "laptop" : "desktop_pc";
}

function demoCardAnalysisHandoff(card: PublicLaunchRoomCard): LaunchAnalysisHandoffInput {
  const category = demoCardCategory(card);

  if (card.key.includes("team")) {
    return {
      source: `launch-demo-card:${card.key}`,
      label: card.cta_label,
      query:
        "팀 장비 구매를 위해 개발자와 디자이너용 컴퓨터, 노트북 후보를 예산과 승인 기준에 맞춰 비교해 주세요.",
      category: "laptop",
      budget_krw: 18000000,
      purpose: "team_refresh",
      must_haves: ["팀별 요구 조건 취합", "승인용 비교 근거", "A/S 기준"],
      exclusions: ["구매 후 확장성이 낮은 옵션", "내부 승인 근거가 부족한 후보"],
    };
  }

  if (category === "laptop") {
    return {
      source: `launch-demo-card:${card.key}`,
      label: card.cta_label,
      query:
        "휴대성과 배터리가 중요한 노트북을 180만원 안에서 찾고 있어요. 장기 사용 리스크와 A/S까지 비교해 주세요.",
      category,
      budget_krw: 1800000,
      purpose: "portable_creator",
      must_haves: ["1.5kg 이하", "긴 배터리", "괜찮은 디스플레이", "A/S 안정성"],
      exclusions: ["발열이 큰 모델", "메모리 확장이 어려운 구성"],
    };
  }

  return {
    source: `launch-demo-card:${card.key}`,
    label: card.cta_label,
    query:
      "영상 편집과 QHD 144Hz 게임용 데스크톱을 예산 안에서 맞추고 싶어요. 성능, 가격 타이밍, 업그레이드 리스크를 비교해 주세요.",
    category,
    budget_krw: 2200000,
    purpose: "qhd_creator",
    must_haves: ["QHD 144Hz", "영상 편집", "32GB RAM", "SSD 1TB 이상"],
    exclusions: ["전원부가 약한 구성", "가격 근거가 부족한 후보"],
  };
}

function publicMetricCards(
  room: PublicLaunchRoom,
  wall: PublicSocialProofWall,
  checklist: PublicBuyerChecklist,
) {
  const checklistItemCount = checklist.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
  return [
    {
      label: "구매 데모",
      value: `${room.demo_cards.length}개`,
      detail: "데스크톱·노트북·팀 구매",
    },
    {
      label: "시장 리포트",
      value: `${room.market_links.length}개`,
      detail: "데스크톱 PC와 노트북",
    },
    {
      label: "검증 근거",
      value: `${Math.max(1, wall.proof_strip.length + wall.trust_notes.length)}개`,
      detail: "추천 기준과 신뢰 고지",
    },
    {
      label: "결제 전 체크",
      value: `${Math.max(1, checklistItemCount)}개`,
      detail: "옵션·가격·증거 확인",
    },
  ];
}

export default async function LaunchPage() {
  const [
    { room, isFallback },
    { wall, isFallback: proofFallback },
    { trustKit, isFallback: trustKitFallback },
    { checklist, isFallback: checklistFallback },
    { kit: challengeKit, isFallback: challengeFallback },
    { scanner: specScanner, isFallback: scannerFallback },
    { compare: candidateCompare, isFallback: compareFallback },
    { timing: dealTiming, isFallback: dealTimingFallback },
    { watchKit: priceWatchKit, isFallback: priceWatchFallback },
  ] = await Promise.all([
    loadLaunchRoom(),
    loadSocialProofWall(),
    loadBuyerTrustKit(),
    loadBuyerChecklist(),
    loadBuyerChallengeKit(),
    loadSpecRiskScanner(),
    loadCandidateCompare(),
    loadDealTimingWindow(),
    loadPriceWatchKit(),
  ]);
  const heroPills = room.proof_strip.slice(0, 3);
  const publicMetrics = publicMetricCards(room, wall, checklist);
  const proofMetricCards = [
    ["피드백", wall.metric_cards.feedback_count ?? 0],
    ["만족도", wall.metric_cards.average_satisfaction ?? 0],
    ["구매 의향", wall.metric_cards.purchase_intent_rate ?? "0%"],
    ["추천 유입", wall.metric_cards.referred_signup_count ?? 0],
  ];
  const launchStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/launch"),
    image: absoluteUrl("/product-workbench.png"),
    description: room.hero_message,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
      availability: "https://schema.org/InStock",
    },
    aggregateRating:
      Number(wall.metric_cards.average_satisfaction || 0) > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: String(wall.metric_cards.average_satisfaction),
            ratingCount: String(Math.max(1, Number(wall.metric_cards.feedback_count || 1))),
          }
        : undefined,
    audience: {
      "@type": "Audience",
      audienceType: "컴퓨터와 노트북 구매자",
    },
    featureList: [
      "컴퓨터와 노트북 구매 조건 분석",
      "TOP 3 후보 추천과 제외 후보 설명",
      "가격 타이밍과 결제 전 검수",
      "공개 공유 리포트와 추천 대기열",
    ],
  };

  return (
    <main className="launchPublicPage">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(launchStructuredData),
        }}
      />
      <header className="topbar launchPublicTopbar">
        <Link className="brand" href="/">
          <span className="brandMark">SP</span>
          <span>
            <strong>SpecPilot AI</strong>
            <span>Computer buying agent</span>
          </span>
        </Link>
        <nav>
          <Link href="/#workspace">분석 시작</Link>
          <Link href="/market/desktop-pc">데스크톱</Link>
          <Link href="/market/laptop">노트북</Link>
          <Link href="/#proof-hub">검증 허브</Link>
        </nav>
      </header>

      <LaunchStickyConversionBar handoff={heroAnalysisHandoff("상시 전환 바 분석 시작")} />

      <section className="launchPublicHero">
        <div className="launchPublicHeroContent">
          <div className="sectionLabel">
            <Rocket size={16} />
            Public launch room
          </div>
          <h1>{room.headline}</h1>
          <p>{room.hero_message}</p>
          <div className="launchPublicActions">
            <LaunchAnalysisLink
              className="primaryButton"
              handoff={heroAnalysisHandoff(room.primary_cta)}
              eventSurface="launch-hero-primary"
              eventMetadata={{
                room_version: room.room_version,
                status: room.status,
                launch_score: room.launch_score,
              }}
            >
              {room.primary_cta}
              <ArrowRight size={18} />
            </LaunchAnalysisLink>
            <Link className="secondaryLaunchButton" href="/market/desktop-pc">
              시장 리포트 보기
              <ExternalLink size={17} />
            </Link>
          </div>
          <div className="launchPublicPills">
            {heroPills.map((item) => (
              <span className="pill ok" key={item}>
                {item}
              </span>
            ))}
            {isFallback ? <span className="pill warn">제품 API 폴백</span> : null}
          </div>
        </div>
      </section>

      <section className="launchPublicMetrics" aria-label="런칭룸 지표">
        {publicMetrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="launchPublicSection launchBuyerTrustKit" id="buyer-trust-kit">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <ShieldCheck size={16} />
              Buyer trust kit
            </div>
            <h2>{trustKit.headline}</h2>
            <p>{trustKit.summary}</p>
          </div>
          <span className={`pill ${tone(trustKit.status)}`}>
            {trustKitFallback ? "신뢰 키트 폴백" : "신뢰 기준 공개"}
          </span>
        </div>
        <div className="launchBuyerTrustHero">
          <strong>{trustKit.plain_language_guarantee}</strong>
          <div className="launchPublicPills">
            {trustKit.proof_strip.slice(0, 4).map((item) => (
              <span className="pill ok" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="launchBuyerTrustGrid">
          {trustKit.trust_badges.slice(0, 4).map((badge) => (
            <article key={badge.badge_id}>
              <span className={`pill ${tone(badge.status)}`}>{badge.label}</span>
              <h3>{badge.summary}</h3>
              <p>{badge.buyer_impact}</p>
              <ul>
                {badge.evidence.slice(0, 2).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="launchBuyerTrustFooter">
          <div>
            <strong>구매자 권리</strong>
            <ul>
              {trustKit.buyer_rights.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>위험 고지</strong>
            <ul>
              {trustKit.risk_disclosures.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <LaunchAnalysisLink
            className="miniCta"
            handoff={{
              source: "buyer-trust-kit",
              label: trustKit.primary_cta_label,
              query:
                "신뢰 기준을 확인했고, 가격 출처와 제휴 여부까지 함께 보는 컴퓨터 구매 리포트를 만들고 싶어요.",
              category: "desktop_pc",
              budget_krw: 2200000,
              purpose: "trust_first_purchase",
            }}
          >
            {trustKit.primary_cta_label}
          </LaunchAnalysisLink>
        </div>
      </section>

      <StartConciergePanel />

      <PurchaseJourneyPanel />

      <CommunityReplyPanel />

      <PurchaseQuestionTriagePanel />

      <ReviewRiskPanel />

      <LaunchExperimentStrip />

      <section className="launchPublicSection launchBuyerChecklist" id="buyer-checklist">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <CheckCircle2 size={16} />
              Buyer checklist
            </div>
            <h2>{checklist.headline}</h2>
            <p>{checklist.summary}</p>
          </div>
          <span className={`pill ${tone(checklist.sections[0]?.items[0]?.status ?? "warning")}`}>
            준비도 {Math.round(checklist.readiness_score)}점
          </span>
        </div>
        <div className="launchBuyerChecklistGrid">
          <article className="launchBuyerChecklistLead">
            <span>{checklist.category === "desktop_pc" ? "Desktop PC" : "Laptop"}</span>
            <strong>{checklist.budget_krw.toLocaleString("ko-KR")}원</strong>
            <p>{checklist.budget_fit}</p>
            <LaunchAnalysisLink
              className="miniCta"
              handoff={{
                source: "buyer-checklist",
                label: checklist.primary_cta_label,
                query: checklist.analysis_prefill,
                category: checklist.category,
                budget_krw: checklist.budget_krw,
                purpose: checklist.persona,
              }}
            >
              {checklist.primary_cta_label}
            </LaunchAnalysisLink>
            {checklistFallback ? (
              <small>체크리스트 API 폴백</small>
            ) : (
              <small>{checklist.checklist_version}</small>
            )}
          </article>
          {checklist.sections.slice(0, 3).map((section) => (
            <article className="launchBuyerChecklistSection" key={section.section_id}>
              <span>{section.title}</span>
              <p>{section.summary}</p>
              <ul>
                {section.items.slice(0, 2).map((item) => (
                  <li key={item.item_id}>
                    <strong>{item.label}</strong>
                    <small>{item.failure_if_missing}</small>
                    <span className={`pill ${tone(item.status)}`}>{item.status}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="launchBuyerChecklistFooter">
          <div>
            <strong>결제 전 캡처할 증거</strong>
            <ul>
              {checklist.evidence_to_capture.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>위험 신호</strong>
            <ul>
              {checklist.red_flags.slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <BuyerPersonaQuizPanel />

      <MistakeCostCalculatorPanel />

      <BuyerChallengeKitPanel
        kit={challengeKit}
        isFallback={challengeFallback}
      />

      <RequirementsConsensusPanel />

      <BuildBlueprintPanel />

      <SetupCompatibilityPanel />

      <UpgradeReadinessPanel />

      <OwnershipCostPanel />

      <WarrantyReturnPanel />

      <PriceBreakdownPanel />

      <DealSanityPanel />

      <PriceTrustPanel />

      <BudgetStressPanel />

      <PurchaseExecutionPanel />

      <FinalDecisionPanel />

      <ReviewerQuickCardPanel />

      <ProductPageEvidencePanel />

      <ShoppingCartIntakePanel />

      <SellerEvidencePanel />

      <SellerNegotiationPanel />

      <SpecTermDecoderPanel />

      <SpecRiskScannerPanel
        scanner={specScanner}
        isFallback={scannerFallback}
      />

      <PurchaseApprovalBriefPanel />

      <CandidateComparePanel
        compare={candidateCompare}
        isFallback={compareFallback}
      />

      <CustomCandidateDecisionPanel />

      <CheckoutLockPanel />

      <DecisionDefensePanel />

      <DealTimingWindowPanel
        timing={dealTiming}
        watchKit={priceWatchKit}
        isFallback={dealTimingFallback || priceWatchFallback}
      />

      <PurchaseAftercarePanel />

      <OutcomeShareCardPanel />

      <FirstBootSetupPanel />

      <BenchmarkValidationPanel />

      <DefectClaimPanel />

      <section className="launchPublicSection launchSocialProofWall">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <MessageSquareQuote size={16} />
              Social proof wall
            </div>
            <h2>{wall.headline}</h2>
            <p>{wall.summary}</p>
          </div>
          <span className={`pill ${tone(wall.status)}`}>
            {Math.round(wall.proof_score)}점
          </span>
        </div>
        <div className="launchSocialProofMetrics">
          {proofMetricCards.map(([label, value]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
        <div className="launchSocialProofGrid">
          {wall.items.slice(0, 6).map((item) => (
            <article className="launchSocialProofCard" key={item.proof_id}>
              <div>
                <span className={`pill ${tone(item.status)}`}>{item.source_label}</span>
                {item.rating ? (
                  <span className="launchRating">
                    <Star size={14} />
                    {item.rating}/5
                  </span>
                ) : null}
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <small>{item.metric}</small>
              <strong>{item.persona}</strong>
            </article>
          ))}
        </div>
        <div className="launchSocialProofFooter">
          <div className="launchPublicPills">
            {wall.proof_strip.slice(0, 4).map((item) => (
              <span className="pill ok" key={item}>
                {item}
              </span>
            ))}
            {proofFallback ? <span className="pill warn">proof API 폴백</span> : null}
          </div>
          <ul>
            {wall.trust_notes.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <LaunchObjectionKitPanel />

      <LaunchSharePackPanel />

      <LaunchActionRouterPanel />

      <LaunchProofHubPanel />

      <LaunchDeferredPanel
        anchorId="launch-readiness-gate"
        label="공개 출시 게이트"
        title="go/no-go 운영 게이트를 지연 로드합니다."
        summary="준비도, 백로그, 데이터 거버넌스 합산은 운영 섹션이 가까워질 때 시작해 첫 화면 API 부하를 낮춥니다."
      >
        <LaunchReadinessGatePanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-preflight"
        label="공개 출시 최종 체크"
        title="최종 배포 판단은 화면에 가까워질 때 불러옵니다."
        summary="스모크, 출시 게이트, 워룸, 인시던트 대응 신호를 필요 시점에 합산해 첫 화면 API 폭주를 줄입니다."
      >
        <LaunchPreflightPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-smoke"
        label="공개 런칭 스모크 체크"
        title="공개 URL 스모크 체크를 지연 로드합니다."
        summary="SEO, 공유 미리보기, 측정 이벤트 준비도는 운영자가 해당 섹션에 접근할 때 확인합니다."
      >
        <LaunchSmokePanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-war-room"
        label="첫 24시간 런칭 워룸"
        title="런칭 워룸 신호를 지연 로드합니다."
        summary="Pulse, 전환, 품질 회귀, 추천/유료 수요 합산은 첫 화면 렌더링 이후 순차적으로 시작합니다."
      >
        <LaunchWarRoomPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-incident-center"
        label="런칭 인시던트 센터"
        title="인시던트 runbook은 필요할 때 로드합니다."
        summary="SEV level, commander brief, escalation 경로를 지연 마운트해 공개 첫 방문의 동시 호출을 줄입니다."
      >
        <LaunchIncidentCenterPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-week-recap"
        label="D+7 런칭 리포트"
        title="첫 주 리캡은 아래쪽 진입 시 불러옵니다."
        summary="성과, 리스크, founder update 계산을 스크롤 기반으로 분산합니다."
      >
        <LaunchWeekRecapPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-community-kit"
        label="커뮤니티 댓글 대응 키트"
        title="커뮤니티 답변 템플릿을 지연 로드합니다."
        summary="반복 질문 답변과 고정 댓글 후보는 해당 운영 섹션에서만 계산합니다."
      >
        <LaunchCommunityKitPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-media-kit"
        label="런칭 미디어 키트"
        title="외부 소개 자산은 스크롤 시 로드합니다."
        summary="대표 이미지, 피치, 사용 가이드 합성을 첫 화면 이후로 미룹니다."
      >
        <LaunchMediaKitPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-activation-offer"
        label="런칭 전환 오퍼"
        title="첫 CTA 오퍼 계산을 지연 로드합니다."
        summary="추천 대기열, 요금제 관심, Team 상담 신호 합산을 필요한 시점에 시작합니다."
      >
        <LaunchActivationOfferPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-response-loop"
        label="런칭 반응 후속 루프"
        title="후속 답장과 수정 큐는 아래에서 불러옵니다."
        summary="공개 proof 후보, founder reply, 제품 수정 큐 계산을 첫 화면 호출에서 분리합니다."
      >
        <LaunchResponseLoopPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-retention-loop"
        label="구매 후속 리텐션 루프"
        title="리텐션 운영 신호를 지연 로드합니다."
        summary="가격 알림, 구매 결과, 완료 리포트 engagement 신호를 스크롤 기반으로 확인합니다."
      >
        <LaunchRetentionLoopPanel />
      </LaunchDeferredPanel>

      <section className="launchPublicSection">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <Monitor size={16} />
              데모 진입점
            </div>
            <h2>구매 상황별로 바로 체험합니다</h2>
          </div>
          <span className="pill muted">공개 데모룸</span>
        </div>
        <div className="launchPublicGrid three">
          {room.demo_cards.map((card) => (
            <article className="launchPublicCard" key={card.key}>
              <span className={`pill ${tone(card.status)}`}>{card.status}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <strong>{card.metric}</strong>
              {isAnalysisEntryPath(card.cta_path) ? (
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={demoCardAnalysisHandoff(card)}
                  eventSurface="launch-demo-card"
                  eventMetadata={{
                    card_key: card.key,
                    card_status: card.status,
                    card_metric: card.metric,
                  }}
                >
                  {card.cta_label}
                </LaunchAnalysisLink>
              ) : (
                <a className="miniCta" href={hrefFor(card.cta_path)}>
                  {card.cta_label}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="launchPublicSection">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <ShieldCheck size={16} />
              출시 proof
            </div>
            <h2>추천 결과를 외부에 설명할 근거를 함께 둡니다</h2>
          </div>
          <Link className="miniCta" href="/#proof-hub">
            검증 허브
          </Link>
        </div>
        <div className="launchPublicGrid">
          {room.launch_cards.map((card) => (
            <article className="launchPublicCard" key={card.key}>
              <span className={`pill ${tone(card.status)}`}>{card.metric}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <a className="miniCta" href={hrefFor(card.cta_path)}>
                {card.cta_label}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="launchPublicSection">
        <div className="sectionHeader">
          <div>
            <div className="sectionLabel">
              <BarChart3 size={16} />
              공개 시장 리포트
            </div>
            <h2>컴퓨터와 노트북 구매 페이지로 검색 유입을 받습니다</h2>
          </div>
        </div>
        <div className="launchMarketGrid">
          {room.market_links.map((item) => (
            <a className="launchMarketCard" href={item.path} key={item.path}>
              <span>{item.category === "desktop_pc" ? "Desktop PC" : "Laptop"}</span>
              <h3>{item.title}</h3>
              <p>{item.share_text}</p>
              <dl>
                <div>
                  <dt>대표 후보</dt>
                  <dd>{item.lead_pick}</dd>
                </div>
                <div>
                  <dt>리스크</dt>
                  <dd>{item.risk_count}개</dd>
                </div>
              </dl>
            </a>
          ))}
        </div>
      </section>

      <LaunchDeferredPanel
        anchorId="team-consult-preview"
        label="Team 구매 표준안 프리뷰"
        title="Team 상담 키트는 하단 진입 시 로드합니다."
        summary="Team 관심 리드의 상담 브리프, 안건, ROI 포인트 계산을 첫 화면 이후로 분산합니다."
      >
        <LaunchTeamConsultPreviewPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="referral-momentum"
        label="가입 전 추천 확산 키트"
        title="추천 확산 신호를 지연 로드합니다."
        summary="추천 보상 사다리, 공유 문구, 리더보드 프리뷰는 해당 섹션에 가까워질 때 불러옵니다."
      >
        <LaunchReferralMomentumPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-public-ops"
        label="공개 반응 운영 패널"
        title="공개 유입/전환/Pulse 운영 신호를 지연 로드합니다."
        summary="전환 보드, 유입 허브, 런치 Pulse 호출을 첫 화면 렌더링에서 분리합니다."
      >
        <LaunchPublicOpsPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-conversion"
        label="요금제 전환 패널"
        title="요금제와 대기열 폼은 하단에서 로드합니다."
        summary="Free/Premium/Team 카드, 추천 대기열, 요금제 관심 상태를 스크롤 시점에 확인합니다."
      >
        <LaunchConversionPanel />
      </LaunchDeferredPanel>

      <LaunchDeferredPanel
        anchorId="launch-distribution-plan"
        label="첫 주 배포 플랜"
        title="첫 주 채널 배포 플랜을 지연 로드합니다."
        summary="커뮤니티, 검색, 추천 채널별 배포 문구와 측정 이벤트 계산을 필요한 시점에 시작합니다."
      >
        <LaunchDistributionPlanPanel />
      </LaunchDeferredPanel>

      <section className="launchPublicSection launchSharePanel">
        <div>
          <div className="sectionLabel">
            <CheckCircle2 size={16} />
            공유 문구
          </div>
          <h2>{room.share_title}</h2>
          <p>{room.share_text}</p>
          <ul>
            {room.channel_posts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>다음 액션</strong>
          <ul>
            {room.next_actions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="launchPublicPills">
            {room.secondary_ctas.map((item) => (
              <span className="pill muted" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
