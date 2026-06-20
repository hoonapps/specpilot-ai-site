"use client";

import Image from "next/image";
import {
  Activity,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Cpu,
  ExternalLink,
  Gauge,
  Laptop,
  Link2,
  Loader2,
  Monitor,
  Send,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { demoResponse } from "./demo-data";
import type {
  AlertEvaluationResponse,
  AlertSubscription,
  AnalyzeAndShareResponse,
  AnalyzePayload,
  AnalyzeResponse,
  BetaBacklogStatus,
  BetaLead,
  BetaOpsBundle,
  Category,
  CheckoutReview,
  CompletionReportWorkflowResponse,
  FeedbackRecord,
  IntakeDiagnosisResponse,
  IntegrationCategory,
  IntegrationProvider,
  IntegrationReadinessDashboard,
  IntegrationStatus,
  LaunchReadinessBundle,
  ObservabilityOpsBundle,
  OpsLearningDashboard,
  OpsStatus,
  PricingOpsBundle,
  PurchaseLink,
  PurchaseLinkGovernance,
  PurchaseOutcome,
  PurchaseOutcomeStatus,
  ReportAdvisorAnswer,
  SourceCandidate,
  SourceMonitorOpsBundle,
  SubscriptionIntent,
} from "./types";

const starterPayload: AnalyzePayload = {
  query:
    "영상 편집과 게임용 데스크톱 200만원 안에서 맞춰줘. QHD 144Hz 모니터를 쓰고 업그레이드 여지도 있었으면 좋겠어.",
  category: "desktop_pc",
  budget_krw: 2_000_000,
  purpose: "Premiere Pro, DaVinci Resolve, QHD gaming",
  must_haves: ["QHD 144Hz", "32GB RAM", "업그레이드 여지"],
  exclusions: ["중고", "리퍼", "출처 없는 가격"],
  channels: ["price_compare", "open_market", "official_store"],
};

function won(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function statusMessage(
  status: "idle" | "sending" | "sent" | "error",
  success: string,
  error: string,
) {
  if (status === "sending") {
    return "전송 중입니다.";
  }
  if (status === "sent") {
    return success;
  }
  if (status === "error") {
    return error;
  }
  return "";
}

function purchaseOutcomeLabel(status: PurchaseOutcomeStatus) {
  if (status === "purchased") {
    return "실제 구매";
  }
  if (status === "delayed") {
    return "구매 지연";
  }
  if (status === "abandoned") {
    return "구매 이탈";
  }
  return "반품/취소";
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function statusTone(status: OpsStatus) {
  return status === "ok" ? "ok" : "warn";
}

function gateTone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

export default function Home() {
  const [payload, setPayload] = useState({
    query: starterPayload.query,
    category: starterPayload.category,
    budget: String(starterPayload.budget_krw),
    purpose: starterPayload.purpose,
    mustHaves: starterPayload.must_haves.join(", "),
    exclusions: starterPayload.exclusions.join(", "),
  });
  const [result, setResult] = useState<AnalyzeResponse>(demoResponse);
  const [isDemo, setIsDemo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisStatus, setDiagnosisStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestDiagnosis, setLatestDiagnosis] =
    useState<IntakeDiagnosisResponse | null>(null);
  const [statusText, setStatusText] = useState("데모 리포트");
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null);
  const [advisorQuestion, setAdvisorQuestion] = useState({
    question: "지금 결제해도 돼, 아니면 목표가까지 기다리는 게 좋아?",
    context: "이번 주 안에는 구매 가능하지만 가격과 호환성 리스크가 중요합니다.",
    contact: "",
  });
  const [advisorStatus, setAdvisorStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestAdvisorAnswer, setLatestAdvisorAnswer] =
    useState<ReportAdvisorAnswer | null>(null);
  const [sourceEvidence, setSourceEvidence] = useState({
    url: "https://example.com/product/creator-rtx-4070-pc",
    seller: "Example Store",
    expectedModel: "Creator RTX 4070 SUPER Build",
    html:
      "<html><title>Creator RTX 4070 SUPER Build</title><body>최종 결제 금액 1,925,000원 무료배송 카드 할인 50,000원 재고 있음 QHD 144Hz 영상 편집 추천 구성</body></html>",
  });
  const [sourceStatus, setSourceStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestSourceCandidate, setLatestSourceCandidate] =
    useState<SourceCandidate | null>(null);
  const [sourceMonitor, setSourceMonitor] = useState({
    cadenceMinutes: "180",
    active: true,
    refreshLimit: "20",
  });
  const [sourceMonitorStatus, setSourceMonitorStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestSourceMonitorBundle, setLatestSourceMonitorBundle] =
    useState<SourceMonitorOpsBundle | null>(null);
  const [priceAlert, setPriceAlert] = useState({
    contact: "buyer@example.com",
    targetPrice: String(
      demoResponse.report.price_alerts[0]?.target_price_krw ||
        demoResponse.report.deal_windows[0]?.target_price_krw ||
        0,
    ),
    overridePrice: String(
      (demoResponse.report.price_alerts[0]?.target_price_krw ||
        demoResponse.report.deal_windows[0]?.target_price_krw ||
        0) - 1,
    ),
    channel: "email",
    dryRun: false,
  });
  const [alertStatus, setAlertStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [alertEvalStatus, setAlertEvalStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestAlertSubscription, setLatestAlertSubscription] =
    useState<AlertSubscription | null>(null);
  const [latestAlertEvaluation, setLatestAlertEvaluation] =
    useState<AlertEvaluationResponse | null>(null);
  const [purchaseLink, setPurchaseLink] = useState({
    sellerName: "공식 스토어",
    url: "https://shop.example.com/specpilot-desktop",
    affiliateNetwork: "specpilot-partner",
    price: String(
      demoResponse.report.top_recommendations[0]?.price.effective_price_krw || "",
    ),
    shippingFee: "0",
    coupon: "0",
  });
  const [purchaseLinkStatus, setPurchaseLinkStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestPurchaseLink, setLatestPurchaseLink] =
    useState<PurchaseLink | null>(null);
  const [latestPurchaseLinkGovernance, setLatestPurchaseLinkGovernance] =
    useState<PurchaseLinkGovernance | null>(null);
  const [completionReport, setCompletionReport] = useState({
    channel: "email",
    templateName: "구매 완료 리포트",
    subject: "[SpecPilot] {title}",
    body:
      "{title}\n추천 1순위: {top_model_name}\n공개 리포트: {public_path}\n결제 전 옵션명, 배송비, 카드 혜택을 다시 확인해 주세요.",
    groupName: "운영 수신자",
    recipients: "ops@example.com, buyer@example.com",
    unsubscribed: "buyer@example.com",
    respectUnsubscribe: true,
    dryRun: false,
    note: "웹사이트 완료 리포트 batch 발송",
  });
  const [completionStatus, setCompletionStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestCompletionWorkflow, setLatestCompletionWorkflow] =
    useState<CompletionReportWorkflowResponse | null>(null);
  const [checkoutReview, setCheckoutReview] = useState({
    confirmedPrice: "",
    sellerAnswer: "판매 페이지 옵션명, 배송비, 카드 혜택, 반품 조건 확인 완료",
    acknowledgeMissing: false,
    notes: "웹사이트 결제 전 검수",
  });
  const [checkoutStatus, setCheckoutStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestCheckoutReview, setLatestCheckoutReview] =
    useState<CheckoutReview | null>(null);
  const [purchaseOutcome, setPurchaseOutcome] = useState({
    status: "purchased" as PurchaseOutcomeStatus,
    finalPaidPrice: String(
      demoResponse.report.top_recommendations[0]?.price.effective_price_krw || "",
    ),
    satisfaction: "5",
    orderReference: "ORD-2026-000123",
    reason: "추천 후보로 실제 구매를 진행했습니다.",
    notes: "웹사이트 구매 결과 학습 신호",
  });
  const [outcomeStatus, setOutcomeStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestPurchaseOutcome, setLatestPurchaseOutcome] =
    useState<PurchaseOutcome | null>(null);
  const [learningStatus, setLearningStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestLearningDashboard, setLatestLearningDashboard] =
    useState<OpsLearningDashboard | null>(null);
  const [observability, setObservability] = useState({
    destination: "opentelemetry",
    includePayload: true,
    dispatch: true,
    dryRun: false,
    windowSize: "5",
  });
  const [observabilityStatus, setObservabilityStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestObservabilityBundle, setLatestObservabilityBundle] =
    useState<ObservabilityOpsBundle | null>(null);
  const [integrationProvider, setIntegrationProvider] = useState({
    providerName: "가격 비교 공식 API",
    category: "price_api" as IntegrationCategory,
    status: "configured" as IntegrationStatus,
    credentialStatus: "vault_connected",
    rateLimit: "120",
    retentionDays: "30",
    endpoint: "https://api.example.com/prices",
    evidence: "운영자가 credential vault 연결과 smoke test 범위를 확인했습니다.",
    notes: "실제 API 키 값은 SpecPilot 저장소 밖의 vault에 보관합니다.",
  });
  const [integrationStatus, setIntegrationStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestIntegrationDashboard, setLatestIntegrationDashboard] =
    useState<IntegrationReadinessDashboard | null>(null);
  const [latestIntegrationProvider, setLatestIntegrationProvider] =
    useState<IntegrationProvider | null>(null);
  const [feedback, setFeedback] = useState({
    rating: "5",
    purchaseIntent: true,
    reason: "추천 근거와 구매 타이밍 판단이 결제 결정에 도움이 됩니다.",
    contact: "",
  });
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [betaLead, setBetaLead] = useState({
    email: "",
    persona: "creator",
    useCase: "영상 편집용 PC와 노트북 구매를 반복해서 비교하고 싶습니다.",
    companySize: "personal",
    contactConsent: true,
  });
  const [betaStatus, setBetaStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [pricingIntent, setPricingIntent] = useState({
    email: "",
    planId: "premium" as "premium" | "team",
    billingCycle: "monthly" as "monthly" | "annual",
    teamSize: "1",
    maxBudget: "20000",
    contactConsent: true,
  });
  const [pricingStatus, setPricingStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestIntent, setLatestIntent] = useState<SubscriptionIntent | null>(null);
  const [latestPricingBundle, setLatestPricingBundle] =
    useState<PricingOpsBundle | null>(null);
  const [launchStatus, setLaunchStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestLaunchDashboard, setLatestLaunchDashboard] =
    useState<LaunchReadinessBundle | null>(null);
  const [betaOps, setBetaOps] = useState({
    name: "크리에이터 데스크톱 공개 베타",
    scenario: "영상 편집과 QHD 게이밍 PC 구매",
    persona: "creator",
    targetSize: "25",
    successMetric: "purchase_intent_rate",
    keywords: "영상 편집, QHD, RTX 4070, 32GB RAM",
    notes: "URL 모니터, 결제 검수, 구매 결과 회수까지 포함한 공개 베타 cohort",
    backlogStatus: "in_progress" as BetaBacklogStatus,
    assignee: "growth-ops",
    slaDueAt: "",
    completionSummary: "원인 확인, 담당자 지정, 다음 배포 검증 기준까지 정리했습니다.",
  });
  const [betaOpsStatus, setBetaOpsStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [latestBetaOpsBundle, setLatestBetaOpsBundle] =
    useState<BetaOpsBundle | null>(null);

  const top = result.report.top_recommendations[0];
  const dealWindow = result.report.deal_windows[0];
  const alertPlan = result.report.price_alerts[0];
  const quality = result.quality_audit;

  const formPayload = useMemo<AnalyzePayload>(
    () => ({
      query: payload.query,
      category: payload.category,
      budget_krw: Number(payload.budget || 0),
      purpose: payload.purpose,
      must_haves: splitList(payload.mustHaves),
      exclusions: splitList(payload.exclusions),
      channels: ["price_compare", "open_market", "official_store"],
    }),
    [payload],
  );

  function applyDiagnosedRequest() {
    if (!latestDiagnosis) {
      return;
    }
    const diagnosed = latestDiagnosis.normalized_request;
    setPayload({
      query: diagnosed.query,
      category: diagnosed.category,
      budget: String(diagnosed.budget_krw || ""),
      purpose: diagnosed.purpose,
      mustHaves: diagnosed.must_haves.join(", "),
      exclusions: diagnosed.exclusions.join(", "),
    });
  }

  async function diagnoseIntake() {
    setDiagnosisStatus("sending");
    setConnectionWarning(null);
    try {
      const response = await fetch("/api/specpilot/intake-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload),
      });
      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }
      const data = (await response.json()) as {
        ok: boolean;
        diagnosis: IntakeDiagnosisResponse;
      };
      setLatestDiagnosis(data.diagnosis);
      setDiagnosisStatus("sent");
    } catch (error) {
      setLatestDiagnosis(null);
      setDiagnosisStatus("error");
      setConnectionWarning(
        error instanceof Error ? error.message : "구매 조건 진단에 실패했습니다.",
      );
    }
  }

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatusText("서버 프록시 분석 중");
    setConnectionWarning(null);
    setPublicUrl(null);
    setSavedReportId(null);
    setAdvisorStatus("idle");
    setLatestAdvisorAnswer(null);
    setAlertStatus("idle");
    setAlertEvalStatus("idle");
    setLatestAlertSubscription(null);
    setLatestAlertEvaluation(null);
    setPurchaseLinkStatus("idle");
    setLatestPurchaseLink(null);
    setLatestPurchaseLinkGovernance(null);
    setCompletionStatus("idle");
    setLatestCompletionWorkflow(null);
    setCheckoutStatus("idle");
    setLatestCheckoutReview(null);
    setOutcomeStatus("idle");
    setLatestPurchaseOutcome(null);
    setLearningStatus("idle");
    setLatestLearningDashboard(null);
    setSourceMonitorStatus("idle");
    setLatestSourceMonitorBundle(null);
    setObservabilityStatus("idle");
    setLatestObservabilityBundle(null);
    setIntegrationStatus("idle");
    setLatestIntegrationDashboard(null);
    setLatestIntegrationProvider(null);
    setLaunchStatus("idle");
    setLatestLaunchDashboard(null);
    setBetaOpsStatus("idle");
    setLatestBetaOpsBundle(null);
    setPricingStatus("idle");
    setLatestIntent(null);
    setLatestPricingBundle(null);
    setFeedbackStatus("idle");
    try {
      const response = await fetch("/api/specpilot/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPayload),
      });
      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }
      const data = (await response.json()) as AnalyzeAndShareResponse;
      setResult(data.analysis);
      setIsDemo(data.mode === "demo");
      setPublicUrl(data.public_url);
      setSavedReportId(data.saved_report?.report_id ?? null);
      setSourceEvidence((current) => ({
        ...current,
        expectedModel:
          data.analysis.report.top_recommendations[0]?.product.model_name ||
          current.expectedModel,
      }));
      setCheckoutReview((current) => ({
        ...current,
        confirmedPrice: String(
          data.analysis.report.top_recommendations[0]?.price.effective_price_krw ||
            current.confirmedPrice,
        ),
        acknowledgeMissing: false,
      }));
      setPurchaseOutcome((current) => ({
        ...current,
        finalPaidPrice: String(
          data.analysis.report.top_recommendations[0]?.price.effective_price_krw ||
            current.finalPaidPrice,
        ),
      }));
      setPurchaseLink((current) => ({
        ...current,
        price: String(
          data.analysis.report.top_recommendations[0]?.price.effective_price_krw ||
            current.price,
        ),
      }));
      const nextAlert =
        data.analysis.report.price_alerts[0] || data.analysis.report.deal_windows[0];
      if (nextAlert) {
        const targetPrice = String(nextAlert.target_price_krw);
        setPriceAlert((current) => ({
          ...current,
          targetPrice,
          overridePrice: String(Math.max(1, Number(targetPrice) - 1)),
        }));
      }
      setConnectionWarning(data.warning ?? null);
      setStatusText(
        data.mode === "live"
          ? `Trace ${data.analysis.graph_trace_id}`
          : "API 미연결 데모",
      );
    } catch (error) {
      setResult(demoResponse);
      setIsDemo(true);
      setSavedReportId(null);
      setLatestAdvisorAnswer(null);
      setLatestAlertSubscription(null);
      setLatestAlertEvaluation(null);
      setLatestPurchaseLink(null);
      setLatestPurchaseLinkGovernance(null);
      setLatestCheckoutReview(null);
      setLatestPurchaseOutcome(null);
      setLatestLearningDashboard(null);
      setLatestLaunchDashboard(null);
      setConnectionWarning(
        error instanceof Error
          ? error.message
          : "웹사이트 프록시 호출에 실패했습니다.",
      );
      setStatusText("API 미연결 데모");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitAdvisorQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdvisorStatus("sending");
    setLatestAdvisorAnswer(null);

    try {
      if (!savedReportId) {
        throw new Error("missing report");
      }
      const response = await fetch("/api/specpilot/advisor-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: savedReportId,
          question: advisorQuestion.question,
          context: advisorQuestion.context,
          selected_product_id: result.report.final_pick_id,
          buyer_stage: "pre_checkout",
          contact: advisorQuestion.contact,
        }),
      });
      if (!response.ok) {
        throw new Error(`advisor ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        answer?: ReportAdvisorAnswer;
      };
      if (!payload.ok || !payload.answer) {
        throw new Error("advisor rejected");
      }
      setLatestAdvisorAnswer(payload.answer);
      setAdvisorStatus("sent");
    } catch {
      setAdvisorStatus("error");
    }
  }

  async function submitSourceEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourceStatus("sending");
    setLatestSourceCandidate(null);

    try {
      const response = await fetch("/api/specpilot/source-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: sourceEvidence.url,
          category: formPayload.category,
          kind: "price",
          expected_model: sourceEvidence.expectedModel,
          source_name: "specpilot-ai-site",
          seller: sourceEvidence.seller,
          html: sourceEvidence.html,
        }),
      });
      if (!response.ok) {
        throw new Error(`source ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        result?: { candidate: SourceCandidate };
      };
      if (!payload.ok || !payload.result) {
        throw new Error("source rejected");
      }
      setLatestSourceCandidate(payload.result.candidate);
      setSourceStatus("sent");
    } catch {
      setSourceStatus("error");
    }
  }

  async function loadSourceMonitorOps() {
    setSourceMonitorStatus("sending");
    try {
      const response = await fetch(
        `/api/specpilot/source-monitors?limit=${encodeURIComponent(
          sourceMonitor.refreshLimit,
        )}`,
      );
      if (!response.ok) {
        throw new Error(`source monitors ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: SourceMonitorOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("source monitors rejected");
      }
      setLatestSourceMonitorBundle(payload.bundle);
      setSourceMonitorStatus("sent");
    } catch {
      setSourceMonitorStatus("error");
    }
  }

  async function createSourceMonitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourceMonitorStatus("sending");
    try {
      const response = await fetch("/api/specpilot/source-monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          limit: Number(sourceMonitor.refreshLimit) || 20,
          monitor: {
            url: sourceEvidence.url,
            category: formPayload.category,
            kind: "price",
            expected_model: sourceEvidence.expectedModel,
            source_name: "specpilot-ai-site-monitor",
            seller: sourceEvidence.seller || null,
            cadence_minutes: Number(sourceMonitor.cadenceMinutes) || 180,
            active: sourceMonitor.active,
            html_snapshot: sourceEvidence.html,
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`source monitor create ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: SourceMonitorOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("source monitor create rejected");
      }
      setLatestSourceMonitorBundle(payload.bundle);
      setSourceMonitorStatus("sent");
    } catch {
      setSourceMonitorStatus("error");
    }
  }

  async function refreshSourceMonitors(action: "refresh" | "refresh_due") {
    setSourceMonitorStatus("sending");
    try {
      const response = await fetch("/api/specpilot/source-monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          limit: Number(sourceMonitor.refreshLimit) || 20,
        }),
      });
      if (!response.ok) {
        throw new Error(`source monitor refresh ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: SourceMonitorOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("source monitor refresh rejected");
      }
      setLatestSourceMonitorBundle(payload.bundle);
      setSourceMonitorStatus("sent");
    } catch {
      setSourceMonitorStatus("error");
    }
  }

  async function decideSourceReview(reviewId: string, reviewStatus: "approved" | "rejected") {
    setSourceMonitorStatus("sending");
    try {
      const response = await fetch("/api/specpilot/source-monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_decision",
          limit: Number(sourceMonitor.refreshLimit) || 20,
          review_id: reviewId,
          review_status: reviewStatus,
          reviewer: "specpilot-site",
          note:
            reviewStatus === "approved"
              ? "웹사이트 URL 모니터 콘솔에서 근거 승인"
              : "웹사이트 URL 모니터 콘솔에서 근거 반려",
        }),
      });
      if (!response.ok) {
        throw new Error(`source review ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: SourceMonitorOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("source review rejected");
      }
      setLatestSourceMonitorBundle(payload.bundle);
      setSourceMonitorStatus("sent");
    } catch {
      setSourceMonitorStatus("error");
    }
  }

  async function submitPriceAlert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlertStatus("sending");
    setLatestAlertSubscription(null);

    try {
      const productId = alertPlan?.product_id || dealWindow.product_id || top.product.id;
      const response = await fetch("/api/specpilot/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trace_id: result.graph_trace_id,
          product_id: productId,
          target_price_krw: Number(priceAlert.targetPrice || 0),
          channels: [priceAlert.channel],
          contact: priceAlert.contact,
          owner_label: "site-user",
        }),
      });
      if (!response.ok) {
        throw new Error(`alert ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        subscription?: AlertSubscription;
      };
      if (!payload.ok || !payload.subscription) {
        throw new Error("alert rejected");
      }
      setLatestAlertSubscription(payload.subscription);
      setAlertStatus("sent");
    } catch {
      setAlertStatus("error");
    }
  }

  async function evaluatePriceAlert() {
    setAlertEvalStatus("sending");
    setLatestAlertEvaluation(null);

    try {
      const productId =
        latestAlertSubscription?.product_id ||
        alertPlan?.product_id ||
        dealWindow.product_id ||
        top.product.id;
      const response = await fetch("/api/specpilot/alerts/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_overrides_krw: {
            [productId]: Number(priceAlert.overridePrice || 0),
          },
          dry_run: priceAlert.dryRun,
          limit: 50,
        }),
      });
      if (!response.ok) {
        throw new Error(`alert evaluation ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        evaluation?: AlertEvaluationResponse;
      };
      if (!payload.ok || !payload.evaluation) {
        throw new Error("alert evaluation rejected");
      }
      setLatestAlertEvaluation(payload.evaluation);
      setAlertEvalStatus("sent");
    } catch {
      setAlertEvalStatus("error");
    }
  }

  async function savePurchaseLink(isAffiliate: boolean) {
    setPurchaseLinkStatus("sending");

    try {
      if (!savedReportId) {
        throw new Error("missing report");
      }
      const response = await fetch("/api/specpilot/purchase-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: savedReportId,
          product_id: result.report.final_pick_id || top.product.id,
          seller_name: purchaseLink.sellerName,
          url: purchaseLink.url,
          is_affiliate: isAffiliate,
          affiliate_network: isAffiliate ? purchaseLink.affiliateNetwork : "",
          price_krw: Number(purchaseLink.price || 0) || null,
          shipping_fee_krw: Number(purchaseLink.shippingFee || 0),
          coupon_krw: Number(purchaseLink.coupon || 0),
          rank: isAffiliate ? 1 : 2,
          active: true,
          notes: isAffiliate ? "웹사이트 제휴 구매 링크" : "웹사이트 비제휴 대안 링크",
        }),
      });
      if (!response.ok) {
        throw new Error(`purchase link ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        link?: PurchaseLink;
        governance?: PurchaseLinkGovernance;
      };
      if (!payload.ok || !payload.link || !payload.governance) {
        throw new Error("purchase link rejected");
      }
      setLatestPurchaseLink(payload.link);
      setLatestPurchaseLinkGovernance(payload.governance);
      setPurchaseLinkStatus("sent");
    } catch {
      setPurchaseLinkStatus("error");
    }
  }

  async function loadPurchaseLinkGovernance() {
    setPurchaseLinkStatus("sending");

    try {
      if (!savedReportId) {
        throw new Error("missing report");
      }
      const response = await fetch(
        `/api/specpilot/purchase-links?report_id=${encodeURIComponent(savedReportId)}`,
        {
          method: "GET",
        },
      );
      if (!response.ok) {
        throw new Error(`purchase link governance ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        governance?: PurchaseLinkGovernance;
      };
      if (!payload.ok || !payload.governance) {
        throw new Error("purchase link governance rejected");
      }
      setLatestPurchaseLinkGovernance(payload.governance);
      setPurchaseLinkStatus("sent");
    } catch {
      setPurchaseLinkStatus("error");
    }
  }

  async function sendCompletionReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompletionStatus("sending");

    try {
      if (!savedReportId) {
        throw new Error("missing report");
      }
      const response = await fetch("/api/specpilot/completion-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: savedReportId,
          channel: completionReport.channel,
          template_name: completionReport.templateName,
          subject: completionReport.subject,
          body: completionReport.body,
          recipient_group_name: completionReport.groupName,
          recipients: splitList(completionReport.recipients),
          unsubscribed_recipients: splitList(completionReport.unsubscribed),
          respect_unsubscribe: completionReport.respectUnsubscribe,
          dry_run: completionReport.dryRun,
          note: completionReport.note,
        }),
      });
      if (!response.ok) {
        throw new Error(`completion ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        workflow?: CompletionReportWorkflowResponse;
      };
      if (!payload.ok || !payload.workflow) {
        throw new Error("completion rejected");
      }
      setLatestCompletionWorkflow(payload.workflow);
      setCompletionStatus("sent");
    } catch {
      setCompletionStatus("error");
    }
  }

  async function loadCompletionBatches() {
    setCompletionStatus("sending");

    try {
      const response = await fetch("/api/specpilot/completion-reports", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`completion ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        batches?: CompletionReportWorkflowResponse["recent_batches"];
      };
      if (!payload.ok || !payload.batches) {
        throw new Error("completion batches rejected");
      }
      const batches = payload.batches;
      setLatestCompletionWorkflow((current) => ({
        template:
          current?.template || {
            template_id: "",
            workspace_id: "",
            name: "",
            channel: completionReport.channel,
            subject: completionReport.subject,
            body: completionReport.body,
            enabled: true,
            created_at: "",
            updated_at: "",
          },
        recipient_group:
          current?.recipient_group || {
            group_id: "",
            workspace_id: "",
            name: "",
            channel: completionReport.channel,
            recipients_masked: [],
            recipient_count: 0,
            unsubscribed_count: 0,
            unsubscribe_policy: "exclude_unsubscribed",
            enabled: true,
            description: "",
            created_at: "",
            updated_at: "",
          },
        preview:
          current?.preview || {
            workspace_id: "",
            report_id: savedReportId || "",
            template_id: null,
            recipient_group_id: null,
            channel: completionReport.channel,
            subject: "",
            body: "",
            targets_masked: [],
            excluded_targets_masked: [],
            target_count: 0,
            excluded_count: 0,
            public_path: "",
            preview_generated_at: "",
          },
        batch:
          current?.batch || batches[0] || {
            batch_id: "",
            workspace_id: "",
            status: "empty",
            template_id: null,
            recipient_group_id: null,
            target_count: 0,
            selected_count: 0,
            sent_count: 0,
            failed_count: 0,
            dry_run: false,
            note: "",
            created_at: "",
            deliveries: [],
          },
        recent_batches: batches,
      }));
      setCompletionStatus("sent");
    } catch {
      setCompletionStatus("error");
    }
  }

  async function submitCheckoutReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutStatus("sending");

    try {
      if (!savedReportId) {
        throw new Error("missing report");
      }
      const sellerAnswers = Object.fromEntries(
        (latestCheckoutReview?.seller_questions || []).map((question) => [
          question,
          checkoutReview.sellerAnswer,
        ]),
      );
      const response = await fetch("/api/specpilot/checkout-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: savedReportId,
          product_id: result.report.final_pick_id,
          confirmed_price_krw: Number(checkoutReview.confirmedPrice || 0) || null,
          acknowledged_risks: checkoutReview.acknowledgeMissing
            ? latestCheckoutReview?.missing_acknowledgements || []
            : [],
          seller_answers: sellerAnswers,
          notes: checkoutReview.notes,
        }),
      });
      if (!response.ok) {
        throw new Error(`checkout ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        review?: CheckoutReview;
      };
      if (!payload.ok || !payload.review) {
        throw new Error("checkout rejected");
      }
      setLatestCheckoutReview(payload.review);
      setCheckoutStatus("sent");
      setPurchaseOutcome((current) => ({
        ...current,
        finalPaidPrice: String(
          payload.review?.confirmed_price_krw ||
            Number(current.finalPaidPrice || 0) ||
            top.price.effective_price_krw,
        ),
      }));
      setCheckoutReview((current) => ({
        ...current,
        acknowledgeMissing: false,
      }));
    } catch {
      setCheckoutStatus("error");
    }
  }

  async function submitPurchaseOutcome(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOutcomeStatus("sending");
    setLatestPurchaseOutcome(null);

    try {
      if (!savedReportId) {
        throw new Error("missing report");
      }
      const response = await fetch("/api/specpilot/purchase-outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: savedReportId,
          product_id: result.report.final_pick_id || top.product.id,
          checkout_review_id: latestCheckoutReview?.review_id ?? null,
          status: purchaseOutcome.status,
          final_paid_price_krw:
            purchaseOutcome.status === "purchased"
              ? Number(purchaseOutcome.finalPaidPrice || 0) || null
              : null,
          source_channel: latestCheckoutReview ? "checkout_review" : "site_report",
          reason: purchaseOutcome.reason,
          satisfaction: Number(purchaseOutcome.satisfaction || 0) || null,
          order_reference: purchaseOutcome.orderReference,
          notes: purchaseOutcome.notes,
        }),
      });
      if (!response.ok) {
        throw new Error(`outcome ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        outcome?: PurchaseOutcome;
      };
      if (!payload.ok || !payload.outcome) {
        throw new Error("outcome rejected");
      }
      setLatestPurchaseOutcome(payload.outcome);
      setOutcomeStatus("sent");
      await loadLearningInsights();
    } catch {
      setOutcomeStatus("error");
    }
  }

  async function loadLearningInsights() {
    setLearningStatus("sending");

    try {
      const response = await fetch("/api/specpilot/learning-insights?limit=8", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`learning ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        dashboard?: OpsLearningDashboard;
      };
      if (!payload.ok || !payload.dashboard) {
        throw new Error("learning rejected");
      }
      setLatestLearningDashboard(payload.dashboard);
      setLearningStatus("sent");
    } catch {
      setLearningStatus("error");
    }
  }

  async function loadObservabilityOps() {
    setObservabilityStatus("sending");

    try {
      const response = await fetch(
        `/api/specpilot/observability?window_size=${encodeURIComponent(
          observability.windowSize,
        )}`,
      );
      if (!response.ok) {
        throw new Error(`observability ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: ObservabilityOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("observability rejected");
      }
      setLatestObservabilityBundle(payload.bundle);
      setObservabilityStatus("sent");
    } catch {
      setObservabilityStatus("error");
    }
  }

  async function exportObservabilityTrace() {
    setObservabilityStatus("sending");

    try {
      const response = await fetch("/api/specpilot/observability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trace_id: result.graph_trace_id,
          destination: observability.destination,
          include_payload: observability.includePayload,
          dispatch: observability.dispatch,
          dry_run: observability.dryRun,
          window_size: observability.windowSize,
        }),
      });
      if (!response.ok) {
        throw new Error(`observability export ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: ObservabilityOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("observability export rejected");
      }
      setLatestObservabilityBundle(payload.bundle);
      setObservabilityStatus("sent");
    } catch {
      setObservabilityStatus("error");
    }
  }

  async function saveIntegrationProvider() {
    setIntegrationStatus("sending");

    try {
      const response = await fetch("/api/specpilot/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_name: integrationProvider.providerName,
          category: integrationProvider.category,
          status: integrationProvider.status,
          credential_status: integrationProvider.credentialStatus,
          rate_limit_per_hour: Number(integrationProvider.rateLimit || 0),
          retention_days: Number(integrationProvider.retentionDays || 0),
          endpoint: integrationProvider.endpoint,
          evidence: integrationProvider.evidence,
          notes: integrationProvider.notes,
        }),
      });
      if (!response.ok) {
        throw new Error(`integration ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        provider?: IntegrationProvider;
        dashboard?: IntegrationReadinessDashboard;
      };
      if (!payload.ok || !payload.provider || !payload.dashboard) {
        throw new Error("integration rejected");
      }
      setLatestIntegrationProvider(payload.provider);
      setLatestIntegrationDashboard(payload.dashboard);
      setIntegrationStatus("sent");
    } catch {
      setIntegrationStatus("error");
    }
  }

  async function loadIntegrationReadiness() {
    setIntegrationStatus("sending");

    try {
      const response = await fetch("/api/specpilot/integrations", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`integration ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        dashboard?: IntegrationReadinessDashboard;
      };
      if (!payload.ok || !payload.dashboard) {
        throw new Error("integration readiness rejected");
      }
      setLatestIntegrationDashboard(payload.dashboard);
      setIntegrationStatus("sent");
    } catch {
      setIntegrationStatus("error");
    }
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackStatus("sending");

    try {
      const response = await fetch("/api/specpilot/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trace_id: result.graph_trace_id,
          rating: Number(feedback.rating),
          purchase_intent: feedback.purchaseIntent,
          selected_product_id: result.report.final_pick_id,
          reason: feedback.reason,
          improvement_requests: publicUrl
            ? ["공유 리포트 기반 검토 흐름 유지"]
            : ["제품 API 연결 상태 확인"],
          contact: feedback.contact,
        }),
      });
      if (!response.ok) {
        throw new Error(`feedback ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        feedback?: FeedbackRecord;
      };
      if (!payload.ok) {
        throw new Error("feedback rejected");
      }
      setFeedbackStatus("sent");
      await loadLaunchReadiness();
    } catch {
      setFeedbackStatus("error");
    }
  }

  async function submitBetaLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBetaStatus("sending");

    try {
      const response = await fetch("/api/specpilot/beta-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: betaLead.email,
          persona: betaLead.persona,
          use_case: betaLead.useCase,
          company_size: betaLead.companySize,
          contact_consent: betaLead.contactConsent,
          source: "specpilot-ai-site",
        }),
      });
      if (!response.ok) {
        throw new Error(`beta ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        lead?: BetaLead;
      };
      if (!payload.ok) {
        throw new Error("beta rejected");
      }
      setBetaStatus("sent");
      await loadLaunchReadiness();
    } catch {
      setBetaStatus("error");
    }
  }

  async function submitPricingIntent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPricingStatus("sending");
    setLatestIntent(null);

    try {
      const response = await fetch("/api/specpilot/pricing-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pricingIntent.email,
          plan_id: pricingIntent.planId,
          billing_cycle: pricingIntent.billingCycle,
          persona:
            pricingIntent.planId === "team" ? "team_purchase_owner" : "individual_buyer",
          use_case: formPayload.query,
          team_size: Number(pricingIntent.teamSize || 1),
          max_budget_krw: Number(pricingIntent.maxBudget || 0),
          feature_priorities: ["가격 알림", "저장 견적 비교", "결제 전 검수"],
          purchase_timing: result.report.purchase_timing,
          contact_consent: pricingIntent.contactConsent,
          source: "specpilot-ai-site",
          limit: 20,
        }),
      });
      if (!response.ok) {
        throw new Error(`pricing ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: PricingOpsBundle;
      };
      if (!payload.ok || !payload.bundle || !payload.bundle.created_intent) {
        throw new Error("pricing rejected");
      }
      setLatestIntent(payload.bundle.created_intent);
      setLatestPricingBundle(payload.bundle);
      setPricingStatus("sent");
      await loadLaunchReadiness();
    } catch {
      setPricingStatus("error");
    }
  }

  async function loadPricingOps() {
    setPricingStatus("sending");
    try {
      const response = await fetch("/api/specpilot/pricing-ops?limit=20");
      if (!response.ok) {
        throw new Error(`pricing ops ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: PricingOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("pricing ops rejected");
      }
      setLatestPricingBundle(payload.bundle);
      setPricingStatus("sent");
    } catch {
      setPricingStatus("error");
    }
  }

  async function loadLaunchReadiness() {
    setLaunchStatus("sending");

    try {
      const response = await fetch("/api/specpilot/launch-readiness", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`launch ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        dashboard?: LaunchReadinessBundle;
      };
      if (!payload.ok || !payload.dashboard) {
        throw new Error("launch readiness rejected");
      }
      setLatestLaunchDashboard(payload.dashboard);
      setLaunchStatus("sent");
    } catch {
      setLaunchStatus("error");
    }
  }

  async function loadBetaOps() {
    setBetaOpsStatus("sending");
    try {
      const response = await fetch("/api/specpilot/beta-ops?limit=20");
      if (!response.ok) {
        throw new Error(`beta ops ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: BetaOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("beta ops rejected");
      }
      setLatestBetaOpsBundle(payload.bundle);
      setBetaOpsStatus("sent");
    } catch {
      setBetaOpsStatus("error");
    }
  }

  async function createBetaCohort() {
    setBetaOpsStatus("sending");
    try {
      const response = await fetch("/api/specpilot/beta-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_cohort",
          limit: 20,
          cohort: {
            name: betaOps.name,
            scenario: betaOps.scenario,
            category: formPayload.category,
            target_persona: betaOps.persona,
            target_size: Number(betaOps.targetSize || 1),
            success_metric: betaOps.successMetric,
            keywords: splitList(betaOps.keywords),
            notes: betaOps.notes,
            active: true,
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`beta cohort ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: BetaOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("beta cohort rejected");
      }
      setLatestBetaOpsBundle(payload.bundle);
      setBetaOpsStatus("sent");
      await loadLaunchReadiness();
    } catch {
      setBetaOpsStatus("error");
    }
  }

  async function loadBetaCohortReport(cohortId: string) {
    setBetaOpsStatus("sending");
    try {
      const response = await fetch("/api/specpilot/beta-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cohort_report",
          cohort_id: cohortId,
          limit: 20,
        }),
      });
      if (!response.ok) {
        throw new Error(`beta cohort report ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: BetaOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("beta cohort report rejected");
      }
      setLatestBetaOpsBundle(payload.bundle);
      setBetaOpsStatus("sent");
    } catch {
      setBetaOpsStatus("error");
    }
  }

  async function updateBetaBacklog(backlogId: string) {
    setBetaOpsStatus("sending");
    try {
      const response = await fetch("/api/specpilot/beta-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_backlog",
          backlog_id: backlogId,
          backlog_status: betaOps.backlogStatus,
          assignee: betaOps.assignee,
          note: "웹사이트 베타 운영 콘솔에서 우선순위와 담당자를 갱신했습니다.",
          sla_due_at: betaOps.slaDueAt || null,
          completion_summary:
            betaOps.backlogStatus === "done" ? betaOps.completionSummary : "",
          limit: 20,
        }),
      });
      if (!response.ok) {
        throw new Error(`beta backlog ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        bundle?: BetaOpsBundle;
      };
      if (!payload.ok || !payload.bundle) {
        throw new Error("beta backlog rejected");
      }
      setLatestBetaOpsBundle(payload.bundle);
      setBetaOpsStatus("sent");
      await loadLaunchReadiness();
    } catch {
      setBetaOpsStatus("error");
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="brandMark">S</div>
          <div>
            <strong>SpecPilot AI</strong>
            <span>Computer purchase agent</span>
          </div>
        </div>
        <nav>
          <a href="https://github.com/hoonapps/specpilot-ai" target="_blank">
            제품 API <ExternalLink size={14} />
          </a>
          <a href="#analysis">분석</a>
          <a href="#price-alert">가격 알림</a>
          <a href="#purchase-links">구매 링크</a>
          <a href="#completion-reports">완료 리포트</a>
          <a href="#source-check">상품 검수</a>
          <a href="#source-monitors">URL 모니터</a>
          <a href="#checkout-review">결제 검수</a>
          <a href="#purchase-outcome">구매 결과</a>
          <a href="#learning-insights">학습 인사이트</a>
          <a href="#advisor">구매 상담</a>
          <a href="#observability">품질 회귀</a>
          <a href="#integrations">외부 연동</a>
          <a href="#beta-ops">베타 운영</a>
          <a href="#launch-readiness">출시 게이트</a>
          <a href="#pricing-ops">수익화</a>
          <a href="#conversion">피드백</a>
          <a href="#trust">신뢰 정책</a>
        </nav>
      </header>

      <section className="workspace" id="analysis">
        <aside className="controlPanel">
          <div className="sectionLabel">
            <Sparkles size={16} />
            구매 조건
          </div>
          <h1>컴퓨터와 노트북 구매 결정을 리포트로 끝냅니다</h1>
          <form onSubmit={analyze} className="analysisForm">
            <label>
              요청
              <textarea
                value={payload.query}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    query: event.target.value,
                  }))
                }
              />
            </label>
            <div className="fieldGrid">
              <label>
                카테고리
                <select
                  value={payload.category}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      category: event.target.value as Category,
                    }))
                  }
                >
                  <option value="desktop_pc">데스크톱 PC</option>
                  <option value="laptop">노트북</option>
                </select>
              </label>
              <label>
                예산
                <input
                  inputMode="numeric"
                  value={payload.budget}
                  onChange={(event) =>
                    setPayload((current) => ({
                      ...current,
                      budget: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label>
              사용 목적
              <input
                value={payload.purpose}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    purpose: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              필수 조건
              <input
                value={payload.mustHaves}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    mustHaves: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              제외 조건
              <input
                value={payload.exclusions}
                onChange={(event) =>
                  setPayload((current) => ({
                    ...current,
                    exclusions: event.target.value,
                  }))
                }
              />
            </label>
            <div className="diagnosisActions">
              <button
                type="button"
                className="secondaryAction"
                disabled={diagnosisStatus === "sending" || isLoading}
                onClick={diagnoseIntake}
              >
                {diagnosisStatus === "sending" ? (
                  <Loader2 className="spin" size={18} />
                ) : (
                  <Gauge size={18} />
                )}
                조건 진단
              </button>
              {latestDiagnosis ? (
                <button
                  type="button"
                  className="secondaryAction quiet"
                  onClick={applyDiagnosedRequest}
                >
                  <CheckCircle2 size={18} />
                  진단 조건 적용
                </button>
              ) : null}
            </div>
            {latestDiagnosis ? (
              <section className="diagnosisPanel" aria-live="polite">
                <div className="diagnosisHeader">
                  <div>
                    <span>준비도</span>
                    <strong>{latestDiagnosis.readiness_score}점</strong>
                  </div>
                  <span
                    className={
                      latestDiagnosis.missing_slots.length
                        ? "pill danger"
                        : latestDiagnosis.warnings.length
                          ? "pill warn"
                          : "pill ok"
                    }
                  >
                    {latestDiagnosis.readiness_label}
                  </span>
                </div>
                <p>{latestDiagnosis.next_action}</p>
                <div className="diagnosisList">
                  {latestDiagnosis.slot_diagnostics.slice(0, 4).map((item) => (
                    <article key={item.slot}>
                      <span className={`pill ${gateTone(item.status)}`}>
                        {item.label}
                      </span>
                      <strong>{item.message}</strong>
                      <small>{item.recommendation}</small>
                    </article>
                  ))}
                </div>
                {latestDiagnosis.clarifying_questions.length ? (
                  <ul>
                    {latestDiagnosis.clarifying_questions.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ) : null}
            <button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin" size={18} /> : <Activity size={18} />}
              분석 실행
            </button>
          </form>
        </aside>

        <section className="decisionBoard">
          <div className="statusRow">
            <span className={isDemo ? "pill warn" : "pill ok"}>{statusText}</span>
            <span className="pill muted">Next.js 서버 프록시</span>
            {publicUrl ? (
              <a className="pill link" href={publicUrl} target="_blank">
                공유 리포트 열기 <ExternalLink size={13} />
              </a>
            ) : null}
          </div>
          {connectionWarning ? (
            <div className="inlineNotice">{connectionWarning}</div>
          ) : null}

          <div className="heroGrid">
            <article className="decisionCard">
              <div className="sectionLabel">
                <ShieldCheck size={16} />
                구매 판정
              </div>
              <h2>{result.report.purchase_decision.label}</h2>
              <p>{result.report.purchase_decision.reason}</p>
              <div className="metricRow">
                <div>
                  <span>확신도</span>
                  <strong>{result.report.purchase_decision.confidence}점</strong>
                </div>
                <div>
                  <span>품질 점수</span>
                  <strong>{quality?.quality_score ?? 0}점</strong>
                </div>
              </div>
            </article>
            <div className="visualPanel">
              <Image
                src="/product-workbench.png"
                alt="SpecPilot AI 구매 분석 워크벤치 프리뷰"
                fill
                sizes="(max-width: 900px) 100vw, 44vw"
                priority
              />
            </div>
          </div>

          <section className="summaryPanel">
            <div>
              <div className="sectionLabel">
                <Monitor size={16} />
                최종 후보
              </div>
              <h2>{top.product.model_name}</h2>
              <p>{top.fit_summary}</p>
            </div>
            <div className="priceBlock">
              <span>실구매가</span>
              <strong>{won(top.price.effective_price_krw)}</strong>
            </div>
          </section>

          <section className="cards three">
            {result.report.top_recommendations.map((item) => (
              <article className="card" key={item.product.id}>
                <span className="rank">TOP {item.rank}</span>
                <h3>{item.product.model_name}</h3>
                <p>{item.product.option_summary}</p>
                <div className="cardFooter">
                  <strong>{won(item.price.effective_price_krw)}</strong>
                  <span>{item.score.total_score}점</span>
                </div>
              </article>
            ))}
          </section>

          <section className="cards two">
            <article className="card accent">
              <div className="sectionLabel">
                <TimerReset size={16} />
                구매 타이밍
              </div>
              <h3>{dealWindow.label}</h3>
              <p>{dealWindow.wait_reason}</p>
              <dl className="dealGrid">
                <div>
                  <dt>현재가</dt>
                  <dd>{won(dealWindow.current_price_krw)}</dd>
                </div>
                <div>
                  <dt>목표가</dt>
                  <dd>{won(dealWindow.target_price_krw)}</dd>
                </div>
                <div>
                  <dt>적정가 밴드</dt>
                  <dd>{dealWindow.fair_price_band_krw}</dd>
                </div>
              </dl>
              <p>{dealWindow.buy_trigger}</p>
            </article>

            <article className="card">
              <div className="sectionLabel">
                <ClipboardCheck size={16} />
                공유 브리프
              </div>
              <h3>{result.report.share_brief.headline}</h3>
              <ul>
                {result.report.share_brief.key_reasons.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>
        </section>
      </section>

      <section className="signalStrip" id="trust">
        <article>
          <Cpu size={20} />
          <strong>호환성 검수</strong>
          <span>소켓, 파워, 케이스, RAM, GPU 옵션</span>
        </article>
        <article>
          <Clock3 size={20} />
          <strong>가격 타이밍</strong>
          <span>목표가, 적정가 밴드, 재고/쿠폰 변동</span>
        </article>
        <article>
          <Bell size={20} />
          <strong>알림 전환</strong>
          <span>목표가 도달 평가와 발송 큐 이벤트</span>
        </article>
        <article>
          <Gauge size={20} />
          <strong>운영 품질</strong>
          <span>품질 점수, 예상 비용, 공개 차단 사유</span>
        </article>
      </section>

      <section className="alertPanel" id="price-alert">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <Bell size={16} />
            가격 알림
          </div>
          <h2>목표가에 도달하면 다시 구매 판단으로 부릅니다</h2>
          <p>
            저장된 분석 리포트의 목표가를 알림으로 연결하고, 현재가가 목표가
            이하로 내려왔을 때 발송 큐 이벤트가 생성되는지 바로 확인합니다.
          </p>
          <div className="advisorMeta">
            <span className={isDemo ? "pill warn" : "pill ok"}>
              {isDemo ? "라이브 분석 필요" : `Trace ${result.graph_trace_id}`}
            </span>
            <span className="pill muted">
              {alertPlan?.product_id || dealWindow.product_id}
            </span>
          </div>
        </div>

        <form className="conversionForm advisorForm" onSubmit={submitPriceAlert}>
          <div className="fieldGrid">
            <label>
              목표가
              <input
                inputMode="numeric"
                value={priceAlert.targetPrice}
                onChange={(event) =>
                  setPriceAlert((current) => ({
                    ...current,
                    targetPrice: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              알림 채널
              <select
                value={priceAlert.channel}
                onChange={(event) =>
                  setPriceAlert((current) => ({
                    ...current,
                    channel: event.target.value,
                  }))
                }
              >
                <option value="email">이메일</option>
                <option value="webhook">웹훅</option>
                <option value="sms">SMS</option>
              </select>
            </label>
          </div>
          <label>
            알림 받을 연락처
            <input
              value={priceAlert.contact}
              onChange={(event) =>
                setPriceAlert((current) => ({
                  ...current,
                  contact: event.target.value,
                }))
              }
            />
          </label>
          <div className="alertActionGrid">
            <button
              type="submit"
              disabled={alertStatus === "sending" || isDemo || !priceAlert.targetPrice}
            >
              {alertStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Bell size={18} />
              )}
              목표가 알림 켜기
            </button>
            <button
              type="button"
              className="secondaryButton"
              disabled={alertEvalStatus === "sending" || !latestAlertSubscription}
              onClick={evaluatePriceAlert}
            >
              {alertEvalStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <TimerReset size={18} />
              )}
              목표가 도달 테스트
            </button>
          </div>
          <div className="fieldGrid">
            <label>
              테스트 현재가
              <input
                inputMode="numeric"
                value={priceAlert.overridePrice}
                onChange={(event) =>
                  setPriceAlert((current) => ({
                    ...current,
                    overridePrice: event.target.value,
                  }))
                }
              />
            </label>
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={priceAlert.dryRun}
                onChange={(event) =>
                  setPriceAlert((current) => ({
                    ...current,
                    dryRun: event.target.checked,
                  }))
                }
              />
              큐 저장 없이 dry-run
            </label>
          </div>
          <p className="formStatus">
            {isDemo
              ? "제품 API 연결 후 분석을 실행하면 저장 리포트 기준으로 알림을 만들 수 있습니다."
              : [
                  statusMessage(
                    alertStatus,
                    "가격 알림 구독이 저장됐습니다.",
                    "가격 알림 구독 생성에 실패했습니다.",
                  ),
                  statusMessage(
                    alertEvalStatus,
                    "목표가 평가가 완료됐습니다.",
                    "목표가 평가에 실패했습니다.",
                  ),
                ]
                  .filter(Boolean)
                  .join(" ")}
          </p>
        </form>

        {latestAlertSubscription || latestAlertEvaluation ? (
          <div className="alertResult">
            <div className="answerHeader">
              {latestAlertSubscription ? (
                <span className="pill ok">
                  알림 {latestAlertSubscription.status}
                </span>
              ) : null}
              {latestAlertEvaluation ? (
                <span
                  className={`pill ${
                    latestAlertEvaluation.triggered_count ? "ok" : "warn"
                  }`}
                >
                  트리거 {latestAlertEvaluation.triggered_count}건
                </span>
              ) : null}
              <span className="pill muted">
                목표가 {won(Number(priceAlert.targetPrice || 0))}
              </span>
            </div>
            <div className="advisorLists">
              <div>
                <strong>구독 상태</strong>
                <ul>
                  <li>
                    현재가{" "}
                    {won(
                      latestAlertSubscription?.current_price_krw ||
                        alertPlan?.current_price_krw ||
                        dealWindow.current_price_krw,
                    )}
                  </li>
                  <li>
                    채널 {(latestAlertSubscription?.channels || [priceAlert.channel]).join(", ")}
                  </li>
                  <li>
                    연락처{" "}
                    {latestAlertEvaluation?.events[0]?.contact_masked ||
                      latestAlertSubscription?.contact ||
                      priceAlert.contact}
                  </li>
                </ul>
              </div>
              <div>
                <strong>발송 큐 이벤트</strong>
                <ul>
                  {latestAlertEvaluation?.events.length ? (
                    latestAlertEvaluation.events.slice(0, 3).map((event) => (
                      <li key={event.event_id}>
                        {event.delivery_status} · {event.message}
                      </li>
                    ))
                  ) : (
                    <li>목표가 도달 테스트를 실행하면 큐 이벤트가 표시됩니다.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="purchaseLinkPanel" id="purchase-links">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <Link2 size={16} />
            구매 링크 거버넌스
          </div>
          <h2>제휴 링크와 비제휴 대안을 함께 관리합니다</h2>
          <p>
            저장 리포트 후보에 판매처 링크를 붙이고, 제휴 고지와 비제휴 대안
            정책을 공개 전 확인합니다. 공개 리포트의 링크는 내부 redirect로
            클릭 지표를 남깁니다.
          </p>
          <div className="advisorMeta">
            <span className={savedReportId ? "pill ok" : "pill warn"}>
              {savedReportId ? `Report ${savedReportId}` : "라이브 분석 필요"}
            </span>
            <span
              className={`pill ${
                latestPurchaseLinkGovernance
                  ? gateTone(latestPurchaseLinkGovernance.status)
                  : "warn"
              }`}
            >
              {latestPurchaseLinkGovernance
                ? `governance ${latestPurchaseLinkGovernance.status}`
                : "거버넌스 미조회"}
            </span>
          </div>
        </div>

        <div className="conversionForm advisorForm">
          <div className="fieldGrid">
            <label>
              판매처
              <input
                value={purchaseLink.sellerName}
                onChange={(event) =>
                  setPurchaseLink((current) => ({
                    ...current,
                    sellerName: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              구매 URL
              <input
                value={purchaseLink.url}
                onChange={(event) =>
                  setPurchaseLink((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="fieldGrid">
            <label>
              표시 가격
              <input
                inputMode="numeric"
                value={purchaseLink.price}
                onChange={(event) =>
                  setPurchaseLink((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              제휴 네트워크
              <input
                value={purchaseLink.affiliateNetwork}
                onChange={(event) =>
                  setPurchaseLink((current) => ({
                    ...current,
                    affiliateNetwork: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="fieldGrid">
            <label>
              배송비
              <input
                inputMode="numeric"
                value={purchaseLink.shippingFee}
                onChange={(event) =>
                  setPurchaseLink((current) => ({
                    ...current,
                    shippingFee: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              쿠폰/할인
              <input
                inputMode="numeric"
                value={purchaseLink.coupon}
                onChange={(event) =>
                  setPurchaseLink((current) => ({
                    ...current,
                    coupon: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="alertActionGrid">
            <button
              type="button"
              disabled={purchaseLinkStatus === "sending" || !savedReportId}
              onClick={() => savePurchaseLink(true)}
            >
              {purchaseLinkStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Link2 size={18} />
              )}
              제휴 링크 등록
            </button>
            <button
              className="secondaryButton"
              type="button"
              disabled={purchaseLinkStatus === "sending" || !savedReportId}
              onClick={() => savePurchaseLink(false)}
            >
              비제휴 대안 등록
            </button>
          </div>
          <button
            className="secondaryButton"
            type="button"
            disabled={purchaseLinkStatus === "sending" || !savedReportId}
            onClick={loadPurchaseLinkGovernance}
          >
            거버넌스만 다시 확인
          </button>
          <p className="formStatus">
            {!savedReportId
              ? "제품 API 연결 후 분석을 실행하면 저장 리포트 기준으로 구매 링크를 등록할 수 있습니다."
              : statusMessage(
                  purchaseLinkStatus,
                  "구매 링크 거버넌스를 확인했습니다.",
                  "구매 링크 처리에 실패했습니다.",
                )}
          </p>
        </div>

        {latestPurchaseLinkGovernance ? (
          <div className="purchaseLinkResult">
            <div className="answerHeader">
              <span className={`pill ${gateTone(latestPurchaseLinkGovernance.status)}`}>
                {latestPurchaseLinkGovernance.status}
              </span>
              <span className="pill muted">
                제휴 {latestPurchaseLinkGovernance.affiliate_link_count}
              </span>
              <span className="pill muted">
                비제휴 {latestPurchaseLinkGovernance.non_affiliate_link_count}
              </span>
              <span className="pill muted">
                클릭 {latestPurchaseLinkGovernance.click_count}
              </span>
            </div>
            <h3>{latestPurchaseLinkGovernance.summary}</h3>
            <div className="advisorLists">
              <div>
                <strong>필수 보강 액션</strong>
                <ul>
                  {latestPurchaseLinkGovernance.required_actions.length ? (
                    latestPurchaseLinkGovernance.required_actions
                      .slice(0, 4)
                      .map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>현재 구매 링크 정책 보강 액션은 없습니다.</li>
                  )}
                </ul>
              </div>
              <div>
                <strong>최근 등록 링크</strong>
                <ul>
                  {latestPurchaseLinkGovernance.links.slice(0, 4).map((link) => (
                    <li key={link.link_id}>
                      {link.seller_name} · {link.is_affiliate ? "제휴" : "비제휴"} ·{" "}
                      {link.effective_price_krw
                        ? won(link.effective_price_krw)
                        : "가격 확인 필요"}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {latestPurchaseLink ? (
              <p className="formStatus">
                최근 링크 {latestPurchaseLink.link_id} · 공개 경로{" "}
                {latestPurchaseLink.click_path}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="completionPanel" id="completion-reports">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <Send size={16} />
            완료 리포트 발송
          </div>
          <h2>저장 리포트를 운영 채널 outbox로 전달합니다</h2>
          <p>
            템플릿과 수신자 그룹으로 발송 전 미리보기를 만들고, unsubscribe
            제외, delivery 상태, 추적 픽셀과 클릭 경로를 함께 확인합니다.
          </p>
          <div className="advisorMeta">
            <span className={savedReportId ? "pill ok" : "pill warn"}>
              {savedReportId ? savedReportId : "라이브 분석 필요"}
            </span>
            <span className="pill muted">template + recipient group + batch</span>
          </div>
        </div>

        <form className="completionForm" onSubmit={sendCompletionReport}>
          <div className="fieldGrid">
            <label>
              채널
              <select
                value={completionReport.channel}
                onChange={(event) =>
                  setCompletionReport((current) => ({
                    ...current,
                    channel: event.target.value,
                  }))
                }
              >
                <option value="email">이메일</option>
                <option value="webhook">웹훅</option>
                <option value="sms">SMS</option>
              </select>
            </label>
            <label>
              템플릿 이름
              <input
                value={completionReport.templateName}
                onChange={(event) =>
                  setCompletionReport((current) => ({
                    ...current,
                    templateName: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            제목
            <input
              value={completionReport.subject}
              onChange={(event) =>
                setCompletionReport((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
            />
          </label>
          <label>
            본문 템플릿
            <textarea
              value={completionReport.body}
              onChange={(event) =>
                setCompletionReport((current) => ({
                  ...current,
                  body: event.target.value,
                }))
              }
            />
          </label>
          <label>
            수신자 그룹
            <input
              value={completionReport.groupName}
              onChange={(event) =>
                setCompletionReport((current) => ({
                  ...current,
                  groupName: event.target.value,
                }))
              }
            />
          </label>
          <label>
            수신자
            <input
              value={completionReport.recipients}
              onChange={(event) =>
                setCompletionReport((current) => ({
                  ...current,
                  recipients: event.target.value,
                }))
              }
            />
          </label>
          <label>
            수신 제외
            <input
              value={completionReport.unsubscribed}
              onChange={(event) =>
                setCompletionReport((current) => ({
                  ...current,
                  unsubscribed: event.target.value,
                }))
              }
            />
          </label>
          <div className="fieldGrid">
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={completionReport.respectUnsubscribe}
                onChange={(event) =>
                  setCompletionReport((current) => ({
                    ...current,
                    respectUnsubscribe: event.target.checked,
                  }))
                }
              />
              unsubscribe 제외
            </label>
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={completionReport.dryRun}
                onChange={(event) =>
                  setCompletionReport((current) => ({
                    ...current,
                    dryRun: event.target.checked,
                  }))
                }
              />
              dry-run
            </label>
          </div>
          <label>
            운영 메모
            <input
              value={completionReport.note}
              onChange={(event) =>
                setCompletionReport((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
            />
          </label>
          <div className="alertActionGrid">
            <button
              type="submit"
              disabled={completionStatus === "sending" || !savedReportId}
            >
              {completionStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              미리보기 후 batch 발송
            </button>
            <button
              type="button"
              className="secondaryButton"
              disabled={completionStatus === "sending"}
              onClick={loadCompletionBatches}
            >
              <Activity size={18} />
              최근 batch 조회
            </button>
          </div>
          <p className="formStatus">
            {savedReportId
              ? statusMessage(
                  completionStatus,
                  "완료 리포트 batch를 처리했습니다.",
                  "완료 리포트 batch 처리에 실패했습니다.",
                ) || "저장 리포트를 선택한 운영 채널 outbox로 보낼 수 있습니다."
              : "제품 API 연결 후 분석을 실행하면 저장 리포트 기준으로 완료 리포트를 발송할 수 있습니다."}
          </p>
        </form>

        {latestCompletionWorkflow ? (
          <div className="completionResult">
            <div className="answerHeader">
              <span className={`pill ${latestCompletionWorkflow.batch.failed_count ? "warn" : "ok"}`}>
                {latestCompletionWorkflow.batch.status}
              </span>
              <span className="pill muted">
                선택 {latestCompletionWorkflow.batch.selected_count}
              </span>
              <span className="pill muted">
                발송 {latestCompletionWorkflow.batch.sent_count}
              </span>
              <span className="pill muted">
                실패 {latestCompletionWorkflow.batch.failed_count}
              </span>
            </div>
            <h3>{latestCompletionWorkflow.preview.subject || "최근 완료 리포트 batch"}</h3>
            <dl className="sourceMetricGrid">
              <div>
                <dt>수신 대상</dt>
                <dd>{latestCompletionWorkflow.preview.target_count}</dd>
              </div>
              <div>
                <dt>제외 대상</dt>
                <dd>{latestCompletionWorkflow.preview.excluded_count}</dd>
              </div>
              <div>
                <dt>최근 batch</dt>
                <dd>{latestCompletionWorkflow.recent_batches.length}</dd>
              </div>
            </dl>
            <div className="advisorLists">
              <div>
                <strong>미리보기</strong>
                <ul>
                  <li>{latestCompletionWorkflow.preview.public_path || "공개 경로 없음"}</li>
                  <li>
                    대상{" "}
                    {latestCompletionWorkflow.preview.targets_masked.join(", ") ||
                      "미리보기 대상 없음"}
                  </li>
                  <li>
                    제외{" "}
                    {latestCompletionWorkflow.preview.excluded_targets_masked.join(", ") ||
                      "없음"}
                  </li>
                </ul>
              </div>
              <div>
                <strong>Delivery</strong>
                <ul>
                  {latestCompletionWorkflow.batch.deliveries.slice(0, 5).map((delivery) => (
                    <li key={delivery.delivery_id}>
                      {delivery.status} · {delivery.target_masked} · open{" "}
                      {delivery.open_count} / click {delivery.click_count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {latestCompletionWorkflow.batch.deliveries[0] ? (
              <div className="trackingBox">
                <strong>추적 경로</strong>
                <span>
                  {latestCompletionWorkflow.batch.deliveries[0].tracking_pixel_path ||
                    "pixel 없음"}
                </span>
                <span>
                  {latestCompletionWorkflow.batch.deliveries[0].tracking_click_path ||
                    "click 없음"}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="trustPanel">
        <div>
          <div className="sectionLabel">
            <Laptop size={16} />
            제품 상태
          </div>
          <h2>출시 전 검수 기준을 화면 안에 노출합니다</h2>
          <p>
            추천 순위와 제휴 가능성, 출처 신뢰도, 가격 캐시 정책을 분리해
            사용자가 결제 전 리스크를 직접 확인하게 합니다.
          </p>
        </div>
        <div className="trustList">
          {result.report.source_health.map((item) => (
            <div key={item}>
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sourceCheckPanel" id="source-check">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <ShieldCheck size={16} />
            상품 페이지 근거 검수
          </div>
          <h2>실제 판매 페이지가 리포트와 맞는지 먼저 확인합니다</h2>
          <p>
            상품 URL과 페이지 스냅샷에서 가격, 배송비, 쿠폰/카드 할인, 재고,
            모델명 일치도를 추출해 제품 API의 검수 큐에 저장합니다.
          </p>
          <div className="advisorMeta">
            <span className="pill muted">{formPayload.category}</span>
            <span className="pill muted">{sourceEvidence.expectedModel}</span>
          </div>
        </div>

        <form className="conversionForm advisorForm" onSubmit={submitSourceEvidence}>
          <div className="fieldGrid">
            <label>
              상품 URL
              <input
                value={sourceEvidence.url}
                onChange={(event) =>
                  setSourceEvidence((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              판매처
              <input
                value={sourceEvidence.seller}
                onChange={(event) =>
                  setSourceEvidence((current) => ({
                    ...current,
                    seller: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            기대 모델명
            <input
              value={sourceEvidence.expectedModel}
              onChange={(event) =>
                setSourceEvidence((current) => ({
                  ...current,
                  expectedModel: event.target.value,
                }))
              }
            />
          </label>
          <label>
            HTML 또는 텍스트 스냅샷
            <textarea
              value={sourceEvidence.html}
              onChange={(event) =>
                setSourceEvidence((current) => ({
                  ...current,
                  html: event.target.value,
                }))
              }
            />
          </label>
          <button
            type="submit"
            disabled={sourceStatus === "sending" || sourceEvidence.url.length < 8}
          >
            {sourceStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
            상품 근거 검수하기
          </button>
          <p className="formStatus">
            {statusMessage(
              sourceStatus,
              "상품 페이지 근거가 검수 큐에 저장됐습니다.",
              "상품 페이지 근거 검수에 실패했습니다.",
            )}
          </p>
        </form>

        {latestSourceCandidate ? (
          <div className="sourceResult">
            <div className="answerHeader">
              <span
                className={`pill ${
                  latestSourceCandidate.model_match_status === "ok" ? "ok" : "warn"
                }`}
              >
                모델 {latestSourceCandidate.model_match_status}
              </span>
              <span className="pill muted">
                신뢰도 {Math.round(latestSourceCandidate.confidence * 100)}%
              </span>
              <span className="pill muted">재고 {latestSourceCandidate.availability_status}</span>
            </div>
            <h3>{latestSourceCandidate.title}</h3>
            <dl className="sourceMetricGrid">
              <div>
                <dt>표시 가격</dt>
                <dd>
                  {latestSourceCandidate.extracted_price_krw
                    ? won(latestSourceCandidate.extracted_price_krw)
                    : "확인 필요"}
                </dd>
              </div>
              <div>
                <dt>배송비</dt>
                <dd>
                  {latestSourceCandidate.shipping_fee_krw === null
                    ? "확인 필요"
                    : won(latestSourceCandidate.shipping_fee_krw)}
                </dd>
              </div>
              <div>
                <dt>할인</dt>
                <dd>
                  {latestSourceCandidate.coupon_or_card_benefit_krw
                    ? won(latestSourceCandidate.coupon_or_card_benefit_krw)
                    : "없음"}
                </dd>
              </div>
              <div>
                <dt>추정 실구매가</dt>
                <dd>
                  {latestSourceCandidate.effective_price_krw
                    ? won(latestSourceCandidate.effective_price_krw)
                    : "확인 필요"}
                </dd>
              </div>
            </dl>
            <ul>
              {latestSourceCandidate.extraction_signals.slice(0, 6).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="sourceMonitorPanel" id="source-monitors">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <TimerReset size={16} />
            URL 모니터 운영
          </div>
          <h2>상품 근거 신선도를 schedule과 refresh 이력으로 관리합니다</h2>
          <p>
            반복 확인이 필요한 상품 URL을 모니터로 등록하고, due schedule, refresh
            실행 결과, 검수 큐를 한 화면에서 확인합니다.
          </p>
          <div className="advisorMeta">
            <span className="pill muted">
              due {latestSourceMonitorBundle?.schedule.due_count ?? 0}건
            </span>
            <span className="pill muted">
              pending review {latestSourceMonitorBundle?.pending_reviews.length ?? 0}건
            </span>
          </div>
        </div>

        <form className="sourceMonitorForm" onSubmit={createSourceMonitor}>
          <div className="fieldGrid">
            <label>
              수집 주기(분)
              <input
                type="number"
                min={15}
                max={10080}
                value={sourceMonitor.cadenceMinutes}
                onChange={(event) =>
                  setSourceMonitor((current) => ({
                    ...current,
                    cadenceMinutes: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              조회 한도
              <input
                type="number"
                min={1}
                max={100}
                value={sourceMonitor.refreshLimit}
                onChange={(event) =>
                  setSourceMonitor((current) => ({
                    ...current,
                    refreshLimit: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label className="toggleLabel">
            <input
              type="checkbox"
              checked={sourceMonitor.active}
              onChange={(event) =>
                setSourceMonitor((current) => ({
                  ...current,
                  active: event.target.checked,
                }))
              }
            />
            active monitor로 등록
          </label>
          <button
            type="submit"
            disabled={
              sourceMonitorStatus === "sending" || sourceEvidence.url.length < 8
            }
          >
            {sourceMonitorStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <TimerReset size={18} />
            )}
            현재 상품 URL 모니터 등록
          </button>
          <div className="sourceMonitorActions">
            <button
              className="secondaryButton"
              type="button"
              disabled={sourceMonitorStatus === "sending"}
              onClick={loadSourceMonitorOps}
            >
              <Clock3 size={18} />
              schedule 조회
            </button>
            <button
              className="secondaryButton"
              type="button"
              disabled={sourceMonitorStatus === "sending"}
              onClick={() => refreshSourceMonitors("refresh_due")}
            >
              <Activity size={18} />
              due refresh
            </button>
          </div>
          <p className="formStatus">
            {statusMessage(
              sourceMonitorStatus,
              "URL 모니터 운영 상태를 갱신했습니다.",
              "URL 모니터 작업에 실패했습니다.",
            ) || "상품 검수 입력의 URL, 기대 모델명, HTML 스냅샷을 모니터 등록에 사용합니다."}
          </p>
        </form>

        {latestSourceMonitorBundle ? (
          <div className="sourceMonitorResult">
            <div className="answerHeader">
              <span
                className={`pill ${
                  latestSourceMonitorBundle.schedule.due_count > 0 ? "warn" : "ok"
                }`}
              >
                due {latestSourceMonitorBundle.schedule.due_count}건
              </span>
              <span className="pill muted">
                upcoming {latestSourceMonitorBundle.schedule.upcoming_count}건
              </span>
              <span className="pill muted">
                monitor {latestSourceMonitorBundle.monitors.length}개
              </span>
              {latestSourceMonitorBundle.refresh ? (
                <span className="pill muted">
                  refresh 성공 {latestSourceMonitorBundle.refresh.succeeded_count}건
                </span>
              ) : null}
            </div>

            <div className="sourceMonitorGrid">
              <article>
                <h3>Due schedule</h3>
                {latestSourceMonitorBundle.schedule.due.length ? (
                  <ul>
                    {latestSourceMonitorBundle.schedule.due.slice(0, 5).map((item) => (
                      <li key={item.monitor.monitor_id}>
                        {item.monitor.expected_model || item.monitor.url} ·{" "}
                        {item.overdue_minutes}분 지연
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>지금 실행해야 할 due 모니터가 없습니다.</p>
                )}
              </article>

              <article>
                <h3>최근 refresh</h3>
                {latestSourceMonitorBundle.runs.length ? (
                  <ul>
                    {latestSourceMonitorBundle.runs.slice(0, 5).map((run) => (
                      <li key={run.run_id}>
                        {run.status} · {run.fetched_live ? "live" : "snapshot"} ·{" "}
                        {run.message || run.source_id || "메시지 없음"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>아직 refresh 실행 이력이 없습니다.</p>
                )}
              </article>
            </div>

            <div className="sourceMonitorGrid">
              <article>
                <h3>등록 모니터</h3>
                {latestSourceMonitorBundle.monitors.length ? (
                  <ul>
                    {latestSourceMonitorBundle.monitors.slice(0, 6).map((monitor) => (
                      <li key={monitor.monitor_id}>
                        {monitor.active ? "active" : "paused"} · {monitor.last_status} ·{" "}
                        {monitor.cadence_minutes}분 ·{" "}
                        {monitor.expected_model || monitor.seller || monitor.url}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>아직 등록된 URL 모니터가 없습니다.</p>
                )}
              </article>

              <article>
                <h3>검수 큐</h3>
                {latestSourceMonitorBundle.pending_reviews.length ? (
                  <div className="reviewQueueList">
                    {latestSourceMonitorBundle.pending_reviews.slice(0, 4).map((item) => (
                      <div key={item.review_id}>
                        <strong>{item.source.title}</strong>
                        <span>{item.reason}</span>
                        <div className="sourceMonitorActions compact">
                          <button
                            className="secondaryButton"
                            type="button"
                            disabled={sourceMonitorStatus === "sending"}
                            onClick={() => decideSourceReview(item.review_id, "approved")}
                          >
                            승인
                          </button>
                          <button
                            className="secondaryButton"
                            type="button"
                            disabled={sourceMonitorStatus === "sending"}
                            onClick={() => decideSourceReview(item.review_id, "rejected")}
                          >
                            반려
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>대기 중인 검수 항목이 없습니다.</p>
                )}
              </article>
            </div>
          </div>
        ) : null}
      </section>

      <section className="checkoutPanel" id="checkout-review">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <CreditCard size={16} />
            결제 전 검수
          </div>
          <h2>최종 주문 화면을 리포트와 대조합니다</h2>
          <p>
            저장 리포트의 최종 후보, 결제 금액, 판매자 확인 답변, 리스크 승인
            상태를 묶어 결제 가능, 확인 필요, 보류 상태를 계산합니다.
          </p>
          <div className="advisorMeta">
            <span className={savedReportId ? "pill ok" : "pill warn"}>
              {savedReportId ? `Report ${savedReportId}` : "라이브 분석 필요"}
            </span>
            <span className="pill muted">{result.report.final_pick_id || "후보 없음"}</span>
          </div>
        </div>

        <form className="conversionForm advisorForm" onSubmit={submitCheckoutReview}>
          <div className="fieldGrid">
            <label>
              최종 결제 금액
              <input
                inputMode="numeric"
                value={checkoutReview.confirmedPrice || String(top.price.effective_price_krw)}
                onChange={(event) =>
                  setCheckoutReview((current) => ({
                    ...current,
                    confirmedPrice: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              검수 메모
              <input
                value={checkoutReview.notes}
                onChange={(event) =>
                  setCheckoutReview((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            판매자 확인 답변
            <textarea
              value={checkoutReview.sellerAnswer}
              onChange={(event) =>
                setCheckoutReview((current) => ({
                  ...current,
                  sellerAnswer: event.target.value,
                }))
              }
            />
          </label>
          <label className="toggleLabel">
            <input
              type="checkbox"
              checked={checkoutReview.acknowledgeMissing}
              disabled={!latestCheckoutReview?.missing_acknowledgements.length}
              onChange={(event) =>
                setCheckoutReview((current) => ({
                  ...current,
                  acknowledgeMissing: event.target.checked,
                }))
              }
            />
            최근 검수의 누락 리스크와 판매자 질문을 확인 완료로 재검수
          </label>
          <button type="submit" disabled={checkoutStatus === "sending" || !savedReportId}>
            {checkoutStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <CreditCard size={18} />
            )}
            결제 전 검수하기
          </button>
          <p className="formStatus">
            {!savedReportId
              ? "제품 API 연결 후 분석을 실행하면 저장 리포트 기준으로 검수할 수 있습니다."
              : statusMessage(
                  checkoutStatus,
                  "결제 전 검수 결과가 저장됐습니다.",
                  "결제 전 검수 생성에 실패했습니다.",
                )}
          </p>
        </form>

        {latestCheckoutReview ? (
          <div className="checkoutResult">
            <div className="answerHeader">
              <span
                className={`pill ${
                  latestCheckoutReview.readiness_status === "ok" ? "ok" : "warn"
                }`}
              >
                {latestCheckoutReview.checkout_blocked ? "결제 보류" : "결제 검수 완료"}
              </span>
              <span className="pill muted">
                준비도 {Math.round(latestCheckoutReview.readiness_score)}점
              </span>
              <span className="pill muted">
                {latestCheckoutReview.model_name || "선택 후보"}
              </span>
            </div>
            <h3>{latestCheckoutReview.final_recommendation}</h3>
            <div className="advisorLists">
              <div>
                <strong>검수 항목</strong>
                <ul>
                  {latestCheckoutReview.items.slice(0, 5).map((item) => (
                    <li key={item.item_id}>
                      {item.label} · {item.status} · {item.evidence}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>다음 확인</strong>
                <ul>
                  {latestCheckoutReview.missing_acknowledgements.length ? (
                    latestCheckoutReview.missing_acknowledgements.map((item) => (
                      <li key={item}>{item}</li>
                    ))
                  ) : (
                    <li>누락된 리스크 승인이 없습니다.</li>
                  )}
                  {latestCheckoutReview.seller_questions.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="outcomePanel" id="purchase-outcome">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <CheckCircle2 size={16} />
            구매 결과
          </div>
          <h2>추천이 실제 구매로 이어졌는지 기록합니다</h2>
          <p>
            결제 전 검수 이후 실제 구매, 지연, 이탈, 반품/취소 상태와 최종
            결제 금액, 만족도, 주문번호 마스킹값을 저장해 추천 성과를 닫힌
            루프로 학습합니다.
          </p>
          <div className="advisorMeta">
            <span className={savedReportId ? "pill ok" : "pill warn"}>
              {savedReportId ? `Report ${savedReportId}` : "라이브 분석 필요"}
            </span>
            <span className="pill muted">
              {latestCheckoutReview
                ? `검수 ${latestCheckoutReview.review_id}`
                : "결제 검수 없이도 기록 가능"}
            </span>
          </div>
        </div>

        <form className="conversionForm advisorForm" onSubmit={submitPurchaseOutcome}>
          <div className="fieldGrid">
            <label>
              구매 상태
              <select
                value={purchaseOutcome.status}
                onChange={(event) =>
                  setPurchaseOutcome((current) => ({
                    ...current,
                    status: event.target.value as PurchaseOutcomeStatus,
                  }))
                }
              >
                <option value="purchased">실제 구매</option>
                <option value="delayed">구매 지연</option>
                <option value="abandoned">구매 이탈</option>
                <option value="returned">반품/취소</option>
              </select>
            </label>
            <label>
              최종 결제 금액
              <input
                inputMode="numeric"
                value={purchaseOutcome.finalPaidPrice}
                disabled={purchaseOutcome.status !== "purchased"}
                onChange={(event) =>
                  setPurchaseOutcome((current) => ({
                    ...current,
                    finalPaidPrice: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="fieldGrid">
            <label>
              만족도
              <select
                value={purchaseOutcome.satisfaction}
                onChange={(event) =>
                  setPurchaseOutcome((current) => ({
                    ...current,
                    satisfaction: event.target.value,
                  }))
                }
              >
                <option value="5">5 - 매우 도움됨</option>
                <option value="4">4 - 도움됨</option>
                <option value="3">3 - 보통</option>
                <option value="2">2 - 아쉬움</option>
                <option value="1">1 - 실패</option>
              </select>
            </label>
            <label>
              주문번호
              <input
                value={purchaseOutcome.orderReference}
                onChange={(event) =>
                  setPurchaseOutcome((current) => ({
                    ...current,
                    orderReference: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            결과 사유
            <input
              value={purchaseOutcome.reason}
              onChange={(event) =>
                setPurchaseOutcome((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
            />
          </label>
          <label>
            운영 메모
            <textarea
              value={purchaseOutcome.notes}
              onChange={(event) =>
                setPurchaseOutcome((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </label>
          <button type="submit" disabled={outcomeStatus === "sending" || !savedReportId}>
            {outcomeStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            구매 결과 저장
          </button>
          <p className="formStatus">
            {!savedReportId
              ? "제품 API 연결 후 분석을 실행하면 저장 리포트 기준으로 구매 결과를 기록할 수 있습니다."
              : statusMessage(
                  outcomeStatus,
                  "구매 결과가 학습 신호로 저장됐습니다.",
                  "구매 결과 저장에 실패했습니다.",
                )}
          </p>
        </form>

        {latestPurchaseOutcome ? (
          <div className="outcomeResult">
            <div className="answerHeader">
              <span className="pill ok">
                {purchaseOutcomeLabel(latestPurchaseOutcome.status)}
              </span>
              <span className="pill muted">
                {latestPurchaseOutcome.model_name || "선택 후보"}
              </span>
              <span className="pill muted">
                주문 {latestPurchaseOutcome.order_reference_masked || "미입력"}
              </span>
            </div>
            <h3>{latestPurchaseOutcome.learning_signal}</h3>
            <dl className="sourceMetricGrid">
              <div>
                <dt>예상가</dt>
                <dd>
                  {latestPurchaseOutcome.expected_price_krw === null
                    ? "확인 필요"
                    : won(latestPurchaseOutcome.expected_price_krw)}
                </dd>
              </div>
              <div>
                <dt>최종 결제</dt>
                <dd>
                  {latestPurchaseOutcome.final_paid_price_krw === null
                    ? "미구매"
                    : won(latestPurchaseOutcome.final_paid_price_krw)}
                </dd>
              </div>
              <div>
                <dt>가격 차이</dt>
                <dd>
                  {latestPurchaseOutcome.price_delta_krw === null
                    ? "없음"
                    : won(latestPurchaseOutcome.price_delta_krw)}
                </dd>
              </div>
              <div>
                <dt>전환 금액</dt>
                <dd>{won(latestPurchaseOutcome.conversion_value_krw)}</dd>
              </div>
            </dl>
            <p>
              만족도 {latestPurchaseOutcome.satisfaction ?? "미입력"}점 · 출처{" "}
              {latestPurchaseOutcome.source_channel}
            </p>
          </div>
        ) : null}
      </section>

      <section className="learningPanel" id="learning-insights">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <Gauge size={16} />
            학습 인사이트
          </div>
          <h2>실제 구매 데이터를 다음 추천 개선으로 전환합니다</h2>
          <p>
            구매 결과, 결제 전 검수 차단, 피드백 만족도를 제품별 전환율,
            반품률, 가격 차이, 전환 금액, 개선 액션으로 집계합니다.
          </p>
          <div className="advisorMeta">
            <span
              className={`pill ${
                latestLearningDashboard
                  ? statusTone(latestLearningDashboard.status)
                  : savedReportId
                    ? "ok"
                    : "warn"
              }`}
            >
              {latestLearningDashboard
                ? `${latestLearningDashboard.status} · ${latestLearningDashboard.insight_count}개`
                : savedReportId
                  ? "인사이트 조회 가능"
                  : "라이브 분석 필요"}
            </span>
            <span className="pill muted">구매 결과 + 검수 + 피드백</span>
          </div>
        </div>

        <div className="learningControl">
          <button
            type="button"
            disabled={learningStatus === "sending"}
            onClick={loadLearningInsights}
          >
            {learningStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <Gauge size={18} />
            )}
            학습 인사이트 새로고침
          </button>
          <p className="formStatus">
            {statusMessage(
              learningStatus,
              "제품별 학습 인사이트를 불러왔습니다.",
              "학습 인사이트 조회에 실패했습니다.",
            ) || "구매 결과를 저장하면 자동으로 새로고침됩니다."}
          </p>
        </div>

        {latestLearningDashboard ? (
          <div className="learningResult">
            <div className="answerHeader">
              <span className={`pill ${statusTone(latestLearningDashboard.status)}`}>
                {latestLearningDashboard.status}
              </span>
              <span className="pill muted">
                Workspace {latestLearningDashboard.workspace_id}
              </span>
              <span className="pill muted">
                {latestLearningDashboard.generated_at.slice(0, 16)}
              </span>
            </div>
            <h3>{latestLearningDashboard.summary}</h3>
            <div className="advisorLists">
              <div>
                <strong>상위 개선 액션</strong>
                <ul>
                  {latestLearningDashboard.top_actions.length ? (
                    latestLearningDashboard.top_actions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))
                  ) : (
                    <li>현재 즉시 실행할 학습 액션은 없습니다.</li>
                  )}
                </ul>
              </div>
              <div>
                <strong>집계 기준</strong>
                <ul>
                  <li>실제 구매 결과와 최종가 차이</li>
                  <li>결제 전 검수 차단과 리스크 승인</li>
                  <li>만족도와 구매 의향 피드백</li>
                </ul>
              </div>
            </div>
            {latestLearningDashboard.insights.length ? (
              <div className="insightGrid">
                {latestLearningDashboard.insights.slice(0, 4).map((insight) => (
                  <article className="insightCard" key={insight.product_id}>
                    <div className="answerHeader">
                      <span className={`pill ${statusTone(insight.status)}`}>
                        {insight.status}
                      </span>
                      <span className="pill muted">
                        전환 {percent(insight.conversion_rate)}
                      </span>
                      <span className="pill muted">
                        반품 {percent(insight.return_rate)}
                      </span>
                    </div>
                    <h4>{insight.model_name || insight.product_id}</h4>
                    <p>{insight.evidence}</p>
                    <dl className="sourceMetricGrid">
                      <div>
                        <dt>구매/결과</dt>
                        <dd>
                          {insight.purchase_count}/{insight.outcome_count}
                        </dd>
                      </div>
                      <div>
                        <dt>결제 보류</dt>
                        <dd>
                          {insight.checkout_blocked_count}/
                          {insight.checkout_review_count}
                        </dd>
                      </div>
                      <div>
                        <dt>만족도</dt>
                        <dd>{insight.average_satisfaction.toFixed(1)}</dd>
                      </div>
                      <div>
                        <dt>전환 금액</dt>
                        <dd>{won(insight.conversion_value_krw)}</dd>
                      </div>
                    </dl>
                    <p>{insight.recommended_action}</p>
                    <div className="conceptList">
                      {insight.learning_tags.slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="formStatus">
                아직 제품별 학습 인사이트 표본이 없습니다. 구매 결과와 피드백을
                더 저장하면 개선 액션이 생성됩니다.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <section className="advisorPanel" id="advisor">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <ClipboardCheck size={16} />
            구매 상담 Q&A
          </div>
          <h2>저장 리포트에 이어서 결제 전 질문을 던집니다</h2>
          <p>
            분석 결과가 저장되면 가격 대기, 호환성, 리스크, 후보 비교 질문을
            리포트 근거에 연결해 답변합니다. 답변은 제품 API에 상담 이력으로
            저장됩니다.
          </p>
          <div className="advisorMeta">
            <span className={savedReportId ? "pill ok" : "pill warn"}>
              {savedReportId ? `Report ${savedReportId}` : "라이브 분석 필요"}
            </span>
            <span className="pill muted">{top.product.model_name}</span>
          </div>
        </div>

        <form className="conversionForm advisorForm" onSubmit={submitAdvisorQuestion}>
          <label>
            질문
            <textarea
              value={advisorQuestion.question}
              onChange={(event) =>
                setAdvisorQuestion((current) => ({
                  ...current,
                  question: event.target.value,
                }))
              }
            />
          </label>
          <label>
            추가 맥락
            <textarea
              value={advisorQuestion.context}
              onChange={(event) =>
                setAdvisorQuestion((current) => ({
                  ...current,
                  context: event.target.value,
                }))
              }
            />
          </label>
          <label>
            연락처 선택 입력
            <input
              placeholder="buyer@example.com"
              value={advisorQuestion.contact}
              onChange={(event) =>
                setAdvisorQuestion((current) => ({
                  ...current,
                  contact: event.target.value,
                }))
              }
            />
          </label>
          <button
            type="submit"
            disabled={
              advisorStatus === "sending" || !savedReportId || advisorQuestion.question.length < 2
            }
          >
            {advisorStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <ClipboardCheck size={18} />
            )}
            리포트에 질문하기
          </button>
          <p className="formStatus">
            {!savedReportId
              ? "제품 API 연결 후 분석을 실행하면 저장 리포트 기반 상담을 사용할 수 있습니다."
              : statusMessage(
                  advisorStatus,
                  "구매 상담 답변이 저장됐습니다.",
                  "구매 상담 답변 생성에 실패했습니다.",
                )}
          </p>
        </form>

        {latestAdvisorAnswer ? (
          <div className="advisorAnswer">
            <div className="answerHeader">
              <span className={`pill ${latestAdvisorAnswer.status === "ok" ? "ok" : "warn"}`}>
                {latestAdvisorAnswer.status}
              </span>
              <span className="pill muted">확신도 {latestAdvisorAnswer.confidence}점</span>
            </div>
            <h3>{latestAdvisorAnswer.selected_model_name}</h3>
            <p>{latestAdvisorAnswer.answer}</p>
            <div className="advisorLists">
              <div>
                <strong>근거</strong>
                <ul>
                  {latestAdvisorAnswer.grounded_evidence.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>다음 행동</strong>
                <ul>
                  {latestAdvisorAnswer.next_actions.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="observabilityPanel" id="observability">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <Gauge size={16} />
            품질 회귀와 Observability
          </div>
          <h2>출시 후 품질 하락과 trace export를 함께 봅니다</h2>
          <p>
            최근/이전 분석 품질, 비용 변화, provider 차단율을 비교하고 현재
            trace를 OpenTelemetry 또는 LangSmith outbox로 적재합니다.
          </p>
          <div className="advisorMeta">
            <span
              className={`pill ${
                latestObservabilityBundle
                  ? gateTone(latestObservabilityBundle.regression.status)
                  : "warn"
              }`}
            >
              {latestObservabilityBundle
                ? `${latestObservabilityBundle.regression.status} · 품질 ${Math.round(
                    latestObservabilityBundle.regression.recent.average_quality_score,
                  )}점`
                : "회귀 미조회"}
            </span>
            <span className="pill muted">
              {isDemo ? "라이브 분석 필요" : `Trace ${result.graph_trace_id}`}
            </span>
          </div>
        </div>

        <div className="observabilityForm">
          <div className="fieldGrid">
            <label>
              대상
              <select
                value={observability.destination}
                onChange={(event) =>
                  setObservability((current) => ({
                    ...current,
                    destination: event.target.value,
                  }))
                }
              >
                <option value="opentelemetry">OpenTelemetry</option>
                <option value="langsmith">LangSmith</option>
              </select>
            </label>
            <label>
              회귀 윈도우
              <input
                inputMode="numeric"
                value={observability.windowSize}
                onChange={(event) =>
                  setObservability((current) => ({
                    ...current,
                    windowSize: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="fieldGrid">
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={observability.includePayload}
                onChange={(event) =>
                  setObservability((current) => ({
                    ...current,
                    includePayload: event.target.checked,
                  }))
                }
              />
              trace payload 포함
            </label>
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={observability.dispatch}
                onChange={(event) =>
                  setObservability((current) => ({
                    ...current,
                    dispatch: event.target.checked,
                  }))
                }
              />
              export 후 dispatch
            </label>
          </div>
          <label className="toggleLabel">
            <input
              type="checkbox"
              checked={observability.dryRun}
              onChange={(event) =>
                setObservability((current) => ({
                  ...current,
                  dryRun: event.target.checked,
                }))
              }
            />
            dispatch dry-run
          </label>
          <div className="alertActionGrid">
            <button
              type="button"
              disabled={observabilityStatus === "sending" || isDemo}
              onClick={exportObservabilityTrace}
            >
              {observabilityStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Gauge size={18} />
              )}
              현재 trace export
            </button>
            <button
              type="button"
              className="secondaryButton"
              disabled={observabilityStatus === "sending"}
              onClick={loadObservabilityOps}
            >
              <Activity size={18} />
              회귀만 조회
            </button>
          </div>
          <p className="formStatus">
            {isDemo
              ? "제품 API 연결 후 분석을 실행하면 trace export를 만들 수 있습니다."
              : statusMessage(
                  observabilityStatus,
                  "관측성 운영 상태를 갱신했습니다.",
                  "관측성 운영 상태 처리에 실패했습니다.",
                ) || "최근 분석 trace와 품질 회귀 지표를 운영 outbox로 연결합니다."}
          </p>
        </div>

        {latestObservabilityBundle ? (
          <div className="observabilityResult">
            <div className="answerHeader">
              <span className={`pill ${gateTone(latestObservabilityBundle.regression.status)}`}>
                {latestObservabilityBundle.regression.status}
              </span>
              <span className="pill muted">
                윈도우 {latestObservabilityBundle.regression.window_size}
              </span>
              {latestObservabilityBundle.created_export ? (
                <span className="pill ok">
                  export {latestObservabilityBundle.created_export.status}
                </span>
              ) : null}
              {latestObservabilityBundle.dispatch ? (
                <span className="pill muted">
                  dispatch {latestObservabilityBundle.dispatch.sent_count}건
                </span>
              ) : null}
            </div>
            <h3>{latestObservabilityBundle.regression.summary}</h3>
            <dl className="sourceMetricGrid">
              <div>
                <dt>최근 품질</dt>
                <dd>
                  {Math.round(
                    latestObservabilityBundle.regression.recent.average_quality_score,
                  )}점
                </dd>
              </div>
              <div>
                <dt>품질 변화</dt>
                <dd>{Math.round(latestObservabilityBundle.regression.quality_delta)}점</dd>
              </div>
              <div>
                <dt>비용 변화</dt>
                <dd>{won(Math.round(latestObservabilityBundle.regression.cost_delta_krw))}</dd>
              </div>
            </dl>
            <div className="advisorLists">
              <div>
                <strong>다음 액션</strong>
                <ul>
                  {latestObservabilityBundle.regression.next_actions
                    .slice(0, 5)
                    .map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                </ul>
              </div>
              <div>
                <strong>Export outbox</strong>
                <ul>
                  {latestObservabilityBundle.exports.slice(0, 5).map((item) => (
                    <li key={item.export_id}>
                      {item.status} · {item.destination} · span {item.span_count} · retry{" "}
                      {item.retry_count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {latestObservabilityBundle.regression.provider_reliability.length ? (
              <div className="gateCheckGrid">
                {latestObservabilityBundle.regression.provider_reliability
                  .slice(0, 4)
                  .map((provider) => (
                    <article className="gateCheckCard" key={`${provider.provider_name}-${provider.host}`}>
                      <div className="answerHeader">
                        <span className={`pill ${gateTone(provider.status)}`}>
                          {provider.status}
                        </span>
                        <span className="pill muted">{provider.host}</span>
                      </div>
                      <h4>{provider.provider_name}</h4>
                      <p>차단율 {percent(provider.blocked_rate)}</p>
                      <p>{provider.recommendation}</p>
                    </article>
                  ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="integrationPanel" id="integrations">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <Link2 size={16} />
            외부 연동 준비도
          </div>
          <h2>공식 provider 연결 상태를 출시 게이트에 반영합니다</h2>
          <p>
            가격 API, 오픈마켓, 공식 스토어, 이메일, observability, scheduler
            연동 상태를 등록하고 공개 전 blocker를 확인합니다.
          </p>
          <div className="advisorMeta">
            <span
              className={`pill ${
                latestIntegrationDashboard
                  ? gateTone(latestIntegrationDashboard.status)
                  : "warn"
              }`}
            >
              {latestIntegrationDashboard
                ? `${Math.round(latestIntegrationDashboard.readiness_score)}점 · verified ${latestIntegrationDashboard.verified_count}개`
                : "연동 준비도 미조회"}
            </span>
            <span className="pill muted">integration-readiness</span>
          </div>
        </div>

        <div className="integrationForm">
          <div className="fieldGrid">
            <label>
              Provider
              <input
                value={integrationProvider.providerName}
                onChange={(event) =>
                  setIntegrationProvider((current) => ({
                    ...current,
                    providerName: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              카테고리
              <select
                value={integrationProvider.category}
                onChange={(event) =>
                  setIntegrationProvider((current) => ({
                    ...current,
                    category: event.target.value as IntegrationCategory,
                  }))
                }
              >
                <option value="price_api">가격 API</option>
                <option value="marketplace">오픈마켓</option>
                <option value="official_store">공식 스토어</option>
                <option value="review_feed">리뷰 feed</option>
                <option value="benchmark">벤치마크</option>
                <option value="email">이메일</option>
                <option value="sms">SMS</option>
                <option value="webhook">Webhook</option>
                <option value="observability">Observability</option>
                <option value="affiliate">제휴</option>
                <option value="scheduler">Scheduler</option>
              </select>
            </label>
          </div>
          <div className="fieldGrid">
            <label>
              상태
              <select
                value={integrationProvider.status}
                onChange={(event) =>
                  setIntegrationProvider((current) => ({
                    ...current,
                    status: event.target.value as IntegrationStatus,
                  }))
                }
              >
                <option value="configured">Configured</option>
                <option value="verified">Verified</option>
                <option value="mock">Mock</option>
                <option value="blocked">Blocked</option>
              </select>
            </label>
            <label>
              Credential
              <input
                value={integrationProvider.credentialStatus}
                onChange={(event) =>
                  setIntegrationProvider((current) => ({
                    ...current,
                    credentialStatus: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="fieldGrid">
            <label>
              시간당 한도
              <input
                inputMode="numeric"
                value={integrationProvider.rateLimit}
                onChange={(event) =>
                  setIntegrationProvider((current) => ({
                    ...current,
                    rateLimit: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              보존 기간
              <input
                inputMode="numeric"
                value={integrationProvider.retentionDays}
                onChange={(event) =>
                  setIntegrationProvider((current) => ({
                    ...current,
                    retentionDays: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            Endpoint
            <input
              value={integrationProvider.endpoint}
              onChange={(event) =>
                setIntegrationProvider((current) => ({
                  ...current,
                  endpoint: event.target.value,
                }))
              }
            />
          </label>
          <label>
            운영 증거
            <textarea
              value={integrationProvider.evidence}
              onChange={(event) =>
                setIntegrationProvider((current) => ({
                  ...current,
                  evidence: event.target.value,
                }))
              }
            />
          </label>
          <label>
            메모
            <input
              value={integrationProvider.notes}
              onChange={(event) =>
                setIntegrationProvider((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </label>
          <div className="alertActionGrid">
            <button
              type="button"
              disabled={
                integrationStatus === "sending" ||
                integrationProvider.providerName.trim().length < 2
              }
              onClick={saveIntegrationProvider}
            >
              {integrationStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Link2 size={18} />
              )}
              provider 등록
            </button>
            <button
              type="button"
              disabled={integrationStatus === "sending"}
              onClick={loadIntegrationReadiness}
            >
              <Activity size={18} />
              준비도만 조회
            </button>
          </div>
          <p className="formStatus">
            {statusMessage(
              integrationStatus,
              "외부 연동 준비도를 갱신했습니다.",
              "외부 연동 준비도 처리에 실패했습니다.",
            ) || "등록된 provider는 워크스페이스별 출시 게이트에 반영됩니다."}
          </p>
        </div>

        {latestIntegrationDashboard ? (
          <div className="integrationResult">
            <div className="answerHeader">
              <span className={`pill ${gateTone(latestIntegrationDashboard.status)}`}>
                {latestIntegrationDashboard.status}
              </span>
              <span className="pill muted">
                Workspace {latestIntegrationDashboard.workspace_id}
              </span>
              {latestIntegrationProvider ? (
                <span className="pill ok">
                  {latestIntegrationProvider.provider_name} 저장됨
                </span>
              ) : null}
            </div>
            <h3>{latestIntegrationDashboard.summary}</h3>
            <dl className="sourceMetricGrid">
              <div>
                <dt>준비도</dt>
                <dd>{Math.round(latestIntegrationDashboard.readiness_score)}점</dd>
              </div>
              <div>
                <dt>Verified</dt>
                <dd>{latestIntegrationDashboard.verified_count}</dd>
              </div>
              <div>
                <dt>Configured</dt>
                <dd>{latestIntegrationDashboard.configured_count}</dd>
              </div>
              <div>
                <dt>Blocker</dt>
                <dd>{latestIntegrationDashboard.blocker_count}</dd>
              </div>
            </dl>

            <div className="advisorLists">
              <div>
                <strong>필수 액션</strong>
                <ul>
                  {latestIntegrationDashboard.required_actions.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>최근 provider</strong>
                <ul>
                  {latestIntegrationDashboard.providers.slice(0, 5).map((provider) => (
                    <li key={provider.integration_id}>
                      {provider.provider_name} · {provider.category} · {provider.status}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="gateCheckGrid">
              {latestIntegrationDashboard.checks.slice(0, 8).map((check) => (
                <article className="gateCheckCard" key={check.category}>
                  <div className="answerHeader">
                    <span className={`pill ${gateTone(check.status)}`}>{check.status}</span>
                    <span className="pill muted">{check.category}</span>
                  </div>
                  <h4>{check.label}</h4>
                  <p>{check.metric}</p>
                  <p>{check.recommendation}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="betaOpsPanel" id="beta-ops">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <ClipboardCheck size={16} />
            베타 운영 액션
          </div>
          <h2>cohort 리포트와 개선 백로그를 출시 게이트 전에 닫습니다</h2>
          <p>
            구매 시나리오별 베타 cohort를 만들고 JSON/Markdown 리포트, 자동 개선
            백로그, 담당자와 SLA 상태를 운영자가 바로 갱신합니다.
          </p>
          <div className="advisorMeta">
            <span className="pill muted">
              cohort {latestBetaOpsBundle?.cohorts.length ?? 0}개
            </span>
            <span
              className={`pill ${
                latestBetaOpsBundle?.backlog_summary.blocker_count ? "warn" : "ok"
              }`}
            >
              blocker {latestBetaOpsBundle?.backlog_summary.blocker_count ?? 0}건
            </span>
          </div>
        </div>

        <div className="betaOpsForm">
          <div className="fieldGrid">
            <label>
              Cohort 이름
              <input
                value={betaOps.name}
                onChange={(event) =>
                  setBetaOps((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              목표 인원
              <input
                inputMode="numeric"
                value={betaOps.targetSize}
                onChange={(event) =>
                  setBetaOps((current) => ({
                    ...current,
                    targetSize: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            시나리오
            <input
              value={betaOps.scenario}
              onChange={(event) =>
                setBetaOps((current) => ({
                  ...current,
                  scenario: event.target.value,
                }))
              }
            />
          </label>
          <div className="fieldGrid">
            <label>
              Persona
              <input
                value={betaOps.persona}
                onChange={(event) =>
                  setBetaOps((current) => ({
                    ...current,
                    persona: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              성공 지표
              <select
                value={betaOps.successMetric}
                onChange={(event) =>
                  setBetaOps((current) => ({
                    ...current,
                    successMetric: event.target.value,
                  }))
                }
              >
                <option value="purchase_intent_rate">구매 의향률</option>
                <option value="average_satisfaction">평균 만족도</option>
                <option value="purchase_conversion_rate">구매 전환율</option>
                <option value="completion_rate">리포트 완료율</option>
              </select>
            </label>
          </div>
          <label>
            키워드
            <input
              value={betaOps.keywords}
              onChange={(event) =>
                setBetaOps((current) => ({
                  ...current,
                  keywords: event.target.value,
                }))
              }
            />
          </label>
          <label>
            운영 메모
            <textarea
              value={betaOps.notes}
              onChange={(event) =>
                setBetaOps((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </label>

          <div className="fieldGrid">
            <label>
              백로그 상태
              <select
                value={betaOps.backlogStatus}
                onChange={(event) =>
                  setBetaOps((current) => ({
                    ...current,
                    backlogStatus: event.target.value as BetaBacklogStatus,
                  }))
                }
              >
                <option value="in_progress">진행 중</option>
                <option value="done">완료</option>
                <option value="dismissed">제외</option>
                <option value="open">열림</option>
              </select>
            </label>
            <label>
              담당자
              <input
                value={betaOps.assignee}
                onChange={(event) =>
                  setBetaOps((current) => ({
                    ...current,
                    assignee: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <label>
            SLA due at
            <input
              placeholder="2026-06-27T09:00:00+09:00"
              value={betaOps.slaDueAt}
              onChange={(event) =>
                setBetaOps((current) => ({
                  ...current,
                  slaDueAt: event.target.value,
                }))
              }
            />
          </label>
          <label>
            완료 요약
            <textarea
              value={betaOps.completionSummary}
              onChange={(event) =>
                setBetaOps((current) => ({
                  ...current,
                  completionSummary: event.target.value,
                }))
              }
            />
          </label>

          <div className="alertActionGrid">
            <button
              type="button"
              disabled={betaOpsStatus === "sending" || betaOps.name.length < 2}
              onClick={createBetaCohort}
            >
              {betaOpsStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              cohort 생성
            </button>
            <button
              type="button"
              className="secondaryButton"
              disabled={betaOpsStatus === "sending"}
              onClick={loadBetaOps}
            >
              <Activity size={18} />
              운영 상태 조회
            </button>
          </div>
          <p className="formStatus">
            {statusMessage(
              betaOpsStatus,
              "베타 운영 상태를 갱신했습니다.",
              "베타 운영 작업에 실패했습니다.",
            ) || "cohort 리포트와 자동 개선 백로그를 출시 게이트 전에 정리합니다."}
          </p>
        </div>

        {latestBetaOpsBundle ? (
          <div className="betaOpsResult">
            <div className="answerHeader">
              <span className="pill muted">
                총 백로그 {latestBetaOpsBundle.backlog_summary.total_count}건
              </span>
              <span className="pill muted">
                진행 {latestBetaOpsBundle.backlog_summary.in_progress_count}건
              </span>
              <span className="pill ok">
                완료 {latestBetaOpsBundle.backlog_summary.done_count}건
              </span>
              {latestBetaOpsBundle.backlog_action ? (
                <span className="pill muted">
                  updated {latestBetaOpsBundle.backlog_action.status}
                </span>
              ) : null}
            </div>

            {latestBetaOpsBundle.cohort_report ? (
              <article className="betaReportBox">
                <h3>{latestBetaOpsBundle.cohort_report.cohort.name}</h3>
                <p>{latestBetaOpsBundle.cohort_report.summary}</p>
                <dl className="sourceMetricGrid">
                  {Object.entries(latestBetaOpsBundle.cohort_report.metric_cards)
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                </dl>
                <div className="advisorLists">
                  <div>
                    <strong>추천 액션</strong>
                    <ul>
                      {latestBetaOpsBundle.cohort_report.recommendations
                        .slice(0, 5)
                        .map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Markdown export</strong>
                    <pre>{latestBetaOpsBundle.cohort_report.markdown.slice(0, 420)}</pre>
                  </div>
                </div>
              </article>
            ) : null}

            <div className="sourceMonitorGrid">
              <article>
                <h3>Cohorts</h3>
                {latestBetaOpsBundle.cohorts.length ? (
                  <div className="reviewQueueList">
                    {latestBetaOpsBundle.cohorts.slice(0, 5).map((cohort) => (
                      <div key={cohort.cohort_id}>
                        <strong>{cohort.name}</strong>
                        <span>
                          {cohort.scenario} · 리드 {cohort.lead_count}명 · 구매 의향{" "}
                          {percent(cohort.purchase_intent_rate)}
                        </span>
                        <button
                          className="secondaryButton"
                          type="button"
                          disabled={betaOpsStatus === "sending"}
                          onClick={() => loadBetaCohortReport(cohort.cohort_id)}
                        >
                          리포트 보기
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>아직 등록된 베타 cohort가 없습니다.</p>
                )}
              </article>

              <article>
                <h3>개선 백로그</h3>
                {latestBetaOpsBundle.backlog.length ? (
                  <div className="reviewQueueList">
                    {latestBetaOpsBundle.backlog.slice(0, 5).map((item) => (
                      <div key={item.backlog_id}>
                        <strong>{item.title}</strong>
                        <span>
                          {item.severity} · {item.status} ·{" "}
                          {item.assignee || "담당자 미지정"}
                        </span>
                        <span>{item.suggested_action}</span>
                        <button
                          className="secondaryButton"
                          type="button"
                          disabled={betaOpsStatus === "sending"}
                          onClick={() => updateBetaBacklog(item.backlog_id)}
                        >
                          선택 상태로 갱신
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>현재 자동 개선 백로그가 없습니다.</p>
                )}
              </article>
            </div>
          </div>
        ) : null}
      </section>

      <section className="launchPanel" id="launch-readiness">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <Activity size={16} />
            출시 게이트
          </div>
          <h2>공개 확대 전에 go/no-go를 한 화면에서 판단합니다</h2>
          <p>
            분석 실행, 공유 조회, 가격 알림, 피드백, 베타 리드, 구매 전환,
            학습 인사이트, 개선 백로그, 외부 연동 준비도를 묶어 공개 확대
            상태와 필수 액션을 보여줍니다.
          </p>
          <div className="advisorMeta">
            <span
              className={`pill ${
                latestLaunchDashboard
                  ? gateTone(latestLaunchDashboard.launch_gate.status)
                  : "warn"
              }`}
            >
              {latestLaunchDashboard
                ? `${latestLaunchDashboard.launch_gate.decision} · ${Math.round(
                    latestLaunchDashboard.launch_gate.launch_readiness_score,
                  )}점`
                : "출시 상태 미조회"}
            </span>
            <span className="pill muted">readiness + launch gate + backlog SLA</span>
          </div>
        </div>

        <div className="learningControl">
          <button
            type="button"
            disabled={launchStatus === "sending"}
            onClick={loadLaunchReadiness}
          >
            {launchStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <Activity size={18} />
            )}
            출시 준비도 새로고침
          </button>
          <p className="formStatus">
            {statusMessage(
              launchStatus,
              "출시 게이트를 불러왔습니다.",
              "출시 게이트 조회에 실패했습니다.",
            ) || "피드백, 베타 신청, 요금제 관심 등록 뒤 자동으로 갱신됩니다."}
          </p>
        </div>

        {latestLaunchDashboard ? (
          <div className="launchResult">
            <div className="answerHeader">
              <span className={`pill ${gateTone(latestLaunchDashboard.launch_gate.status)}`}>
                {latestLaunchDashboard.launch_gate.decision}
              </span>
              <span className="pill muted">
                {latestLaunchDashboard.readiness.readiness_label}
              </span>
              <span className="pill muted">
                Workspace {latestLaunchDashboard.launch_gate.workspace_id}
              </span>
            </div>
            <h3>{latestLaunchDashboard.launch_gate.summary}</h3>
            <dl className="sourceMetricGrid">
              <div>
                <dt>준비도</dt>
                <dd>
                  {Math.round(latestLaunchDashboard.readiness.launch_readiness_score)}점
                </dd>
              </div>
              <div>
                <dt>공개 조회</dt>
                <dd>{latestLaunchDashboard.readiness.public_share_views}</dd>
              </div>
              <div>
                <dt>구매 의향</dt>
                <dd>{percent(latestLaunchDashboard.readiness.purchase_intent_rate)}</dd>
              </div>
              <div>
                <dt>열린 백로그</dt>
                <dd>{latestLaunchDashboard.backlog_summary.open_count}</dd>
              </div>
            </dl>

            <div className="advisorLists">
              <div>
                <strong>필수 액션</strong>
                <ul>
                  {latestLaunchDashboard.launch_gate.required_actions
                    .slice(0, 5)
                    .map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                </ul>
              </div>
              <div>
                <strong>다음 개선 백로그</strong>
                <ul>
                  {latestLaunchDashboard.backlog_summary.next_actions
                    .slice(0, 5)
                    .map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="gateCheckGrid">
              {latestLaunchDashboard.launch_gate.checks.slice(0, 8).map((check) => (
                <article className="gateCheckCard" key={`${check.area}-${check.label}`}>
                  <div className="answerHeader">
                    <span className={`pill ${gateTone(check.status)}`}>{check.status}</span>
                    <span className="pill muted">{check.area}</span>
                  </div>
                  <h4>{check.label}</h4>
                  <p>{check.metric}</p>
                  <p>{check.recommendation}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="pricingOpsPanel" id="pricing-ops">
        <div className="advisorIntro">
          <div className="sectionLabel">
            <CreditCard size={16} />
            수익화 준비도
          </div>
          <h2>요금제 관심을 예상 MRR과 전환 액션으로 관리합니다</h2>
          <p>
            Premium/Team 관심 등록, 평균 예산, 상위 요금제, 최근 intent를 묶어
            결제 연동 전 유료 수요와 다음 실험을 판단합니다.
          </p>
          <div className="advisorMeta">
            <span
              className={`pill ${
                latestPricingBundle
                  ? gateTone(latestPricingBundle.dashboard.readiness_status)
                  : "warn"
              }`}
            >
              {latestPricingBundle
                ? `${latestPricingBundle.dashboard.intent_count}건 · MRR ${won(
                    latestPricingBundle.dashboard.estimated_mrr_krw,
                  )}`
                : "수익화 준비도 미조회"}
            </span>
            <span className="pill muted">pricing-dashboard</span>
          </div>
        </div>

        <div className="pricingOpsControl">
          <button
            type="button"
            disabled={pricingStatus === "sending"}
            onClick={loadPricingOps}
          >
            {pricingStatus === "sending" ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <CreditCard size={18} />
            )}
            수익화 대시보드 조회
          </button>
          <p className="formStatus">
            {statusMessage(
              pricingStatus,
              "수익화 준비도를 갱신했습니다.",
              "수익화 준비도 조회에 실패했습니다.",
            ) || "아래 요금제 관심 등록을 제출하면 대시보드가 함께 갱신됩니다."}
          </p>
        </div>

        {latestPricingBundle ? (
          <div className="pricingOpsResult">
            <div className="answerHeader">
              <span
                className={`pill ${gateTone(
                  latestPricingBundle.dashboard.readiness_status,
                )}`}
              >
                {latestPricingBundle.dashboard.readiness_status}
              </span>
              <span className="pill muted">
                top {latestPricingBundle.dashboard.top_plan_name || "미정"}
              </span>
              {latestPricingBundle.created_intent ? (
                <span className="pill ok">
                  new {latestPricingBundle.created_intent.plan_name}
                </span>
              ) : null}
            </div>
            <h3>{latestPricingBundle.dashboard.summary}</h3>
            <dl className="sourceMetricGrid">
              <div>
                <dt>예상 MRR</dt>
                <dd>{won(latestPricingBundle.dashboard.estimated_mrr_krw)}</dd>
              </div>
              <div>
                <dt>연환산 매출</dt>
                <dd>{won(latestPricingBundle.dashboard.annualized_revenue_krw)}</dd>
              </div>
              <div>
                <dt>Premium</dt>
                <dd>{latestPricingBundle.dashboard.premium_intent_count}건</dd>
              </div>
              <div>
                <dt>Team</dt>
                <dd>{latestPricingBundle.dashboard.team_intent_count}건</dd>
              </div>
            </dl>

            <div className="sourceMonitorGrid">
              <article>
                <h3>요금제</h3>
                <div className="reviewQueueList">
                  {latestPricingBundle.plans.map((plan) => (
                    <div key={plan.plan_id}>
                      <strong>{plan.name}</strong>
                      <span>
                        {plan.audience} · 월 {won(plan.monthly_price_krw)} · 연{" "}
                        {won(plan.annual_price_krw)}
                      </span>
                      <span>{plan.recommended_for.slice(0, 3).join(", ")}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article>
                <h3>최근 관심 등록</h3>
                {latestPricingBundle.intents.length ? (
                  <div className="reviewQueueList">
                    {latestPricingBundle.intents.slice(0, 6).map((intent) => (
                      <div key={intent.intent_id}>
                        <strong>{intent.plan_name}</strong>
                        <span>
                          {intent.email_masked} · {intent.billing_cycle} · team{" "}
                          {intent.team_size}
                        </span>
                        <span>
                          MRR {won(intent.estimated_mrr_krw)} ·{" "}
                          {intent.recommendation}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>아직 요금제 관심 등록이 없습니다.</p>
                )}
              </article>
            </div>

            <div className="advisorLists">
              <div>
                <strong>다음 액션</strong>
                <ul>
                  {latestPricingBundle.dashboard.next_actions.slice(0, 5).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>예산 신호</strong>
                <ul>
                  <li>
                    평균 월 예산{" "}
                    {won(Math.round(latestPricingBundle.dashboard.average_budget_krw))}
                  </li>
                  <li>전체 관심 {latestPricingBundle.dashboard.intent_count}건</li>
                  <li>Workspace {latestPricingBundle.dashboard.workspace_id}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="conversionPanel" id="conversion">
        <article className="conversionCard">
          <div className="sectionLabel">
            <CheckCircle2 size={16} />
            추천 피드백
          </div>
          <h2>추천 결과가 실제 구매 판단에 도움이 됐나요?</h2>
          <p>
            만족도와 구매 의향은 제품 API의 피드백 저장소에 연결됩니다. 분석을
            한 번 실행한 뒤 제출하면 trace id와 최종 후보가 함께 저장됩니다.
          </p>
          <form className="conversionForm" onSubmit={submitFeedback}>
            <div className="fieldGrid">
              <label>
                만족도
                <select
                  value={feedback.rating}
                  onChange={(event) =>
                    setFeedback((current) => ({
                      ...current,
                      rating: event.target.value,
                    }))
                  }
                >
                  <option value="5">5 - 바로 쓰고 싶음</option>
                  <option value="4">4 - 유용함</option>
                  <option value="3">3 - 보통</option>
                  <option value="2">2 - 부족함</option>
                  <option value="1">1 - 다시 설계 필요</option>
                </select>
              </label>
              <label className="toggleLabel">
                <input
                  type="checkbox"
                  checked={feedback.purchaseIntent}
                  onChange={(event) =>
                    setFeedback((current) => ({
                      ...current,
                      purchaseIntent: event.target.checked,
                    }))
                  }
                />
                구매 의향 있음
              </label>
            </div>
            <label>
              의견
              <textarea
                value={feedback.reason}
                onChange={(event) =>
                  setFeedback((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              연락처 선택 입력
              <input
                placeholder="buyer@example.com"
                value={feedback.contact}
                onChange={(event) =>
                  setFeedback((current) => ({
                    ...current,
                    contact: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" disabled={feedbackStatus === "sending" || isDemo}>
              {feedbackStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Activity size={18} />
              )}
              피드백 보내기
            </button>
            <p className="formStatus">
              {isDemo
                ? "제품 API 연결 후 분석을 실행하면 피드백을 저장할 수 있습니다."
                : statusMessage(
                    feedbackStatus,
                    "피드백이 저장됐습니다.",
                    "피드백 저장에 실패했습니다.",
                  )}
            </p>
          </form>
        </article>

        <article className="conversionCard">
          <div className="sectionLabel">
            <Bell size={16} />
            베타 신청
          </div>
          <h2>반복 구매 비교가 필요한 사용자부터 초대합니다</h2>
          <p>
            이메일은 제품 API에서 마스킹되어 저장됩니다. 공개 베타에서는
            크리에이터, 게이머, 개발자, 소규모 사업자 시나리오를 우선 봅니다.
          </p>
          <form className="conversionForm" onSubmit={submitBetaLead}>
            <label>
              이메일
              <input
                required
                type="email"
                placeholder="creator@example.com"
                value={betaLead.email}
                onChange={(event) =>
                  setBetaLead((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <div className="fieldGrid">
              <label>
                사용자군
                <select
                  value={betaLead.persona}
                  onChange={(event) =>
                    setBetaLead((current) => ({
                      ...current,
                      persona: event.target.value,
                    }))
                  }
                >
                  <option value="creator">크리에이터</option>
                  <option value="gamer">게이머</option>
                  <option value="developer">개발자</option>
                  <option value="small_business">소규모 사업자</option>
                </select>
              </label>
              <label>
                규모
                <select
                  value={betaLead.companySize}
                  onChange={(event) =>
                    setBetaLead((current) => ({
                      ...current,
                      companySize: event.target.value,
                    }))
                  }
                >
                  <option value="personal">개인</option>
                  <option value="freelancer">프리랜서</option>
                  <option value="team_2_10">2-10명 팀</option>
                  <option value="business">사업자</option>
                </select>
              </label>
            </div>
            <label>
              필요한 구매 비교
              <textarea
                value={betaLead.useCase}
                onChange={(event) =>
                  setBetaLead((current) => ({
                    ...current,
                    useCase: event.target.value,
                  }))
                }
              />
            </label>
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={betaLead.contactConsent}
                onChange={(event) =>
                  setBetaLead((current) => ({
                    ...current,
                    contactConsent: event.target.checked,
                  }))
                }
              />
              베타 초대와 후속 인터뷰 연락에 동의
            </label>
            <button
              type="submit"
              disabled={betaStatus === "sending" || !betaLead.contactConsent}
            >
              {betaStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Bell size={18} />
              )}
              베타 신청하기
            </button>
            <p className="formStatus">
              {statusMessage(
                betaStatus,
                "베타 신청이 저장됐습니다.",
                "베타 신청 저장에 실패했습니다.",
              )}
            </p>
          </form>
        </article>

        <article className="conversionCard pricingCard">
          <div className="sectionLabel">
            <CreditCard size={16} />
            요금제 관심
          </div>
          <h2>결제 전에 유료 수요를 먼저 검증합니다</h2>
          <p>
            Premium은 개인 구매 코치, Team은 반복 장비 구매를 위한 운영형
            요금제입니다. 관심 등록은 제품 API의 예상 MRR 대시보드에 반영됩니다.
          </p>
          <form className="conversionForm" onSubmit={submitPricingIntent}>
            <label>
              이메일
              <input
                required
                type="email"
                placeholder="buyer@example.com"
                value={pricingIntent.email}
                onChange={(event) =>
                  setPricingIntent((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <div className="fieldGrid">
              <label>
                요금제
                <select
                  value={pricingIntent.planId}
                  onChange={(event) => {
                    const planId = event.target.value as "premium" | "team";
                    setPricingIntent((current) => ({
                      ...current,
                      planId,
                      teamSize: planId === "team" ? "3" : "1",
                      maxBudget: planId === "team" ? "150000" : "20000",
                    }));
                  }}
                >
                  <option value="premium">Premium 구매 코치</option>
                  <option value="team">Team 구매 보조</option>
                </select>
              </label>
              <label>
                결제 주기
                <select
                  value={pricingIntent.billingCycle}
                  onChange={(event) =>
                    setPricingIntent((current) => ({
                      ...current,
                      billingCycle: event.target.value as "monthly" | "annual",
                    }))
                  }
                >
                  <option value="monthly">월 결제</option>
                  <option value="annual">연 결제</option>
                </select>
              </label>
            </div>
            <div className="fieldGrid">
              <label>
                사용자/팀 수
                <input
                  inputMode="numeric"
                  value={pricingIntent.teamSize}
                  onChange={(event) =>
                    setPricingIntent((current) => ({
                      ...current,
                      teamSize: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                월 최대 예산
                <input
                  inputMode="numeric"
                  value={pricingIntent.maxBudget}
                  onChange={(event) =>
                    setPricingIntent((current) => ({
                      ...current,
                      maxBudget: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <label className="toggleLabel">
              <input
                type="checkbox"
                checked={pricingIntent.contactConsent}
                onChange={(event) =>
                  setPricingIntent((current) => ({
                    ...current,
                    contactConsent: event.target.checked,
                  }))
                }
              />
              요금제 안내와 전환 실험 연락에 동의
            </label>
            <button
              type="submit"
              disabled={pricingStatus === "sending" || !pricingIntent.contactConsent}
            >
              {pricingStatus === "sending" ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <CreditCard size={18} />
              )}
              관심 등록하기
            </button>
            <p className="formStatus">
              {latestIntent
                ? `${latestIntent.plan_name} 관심 등록 완료 · 예상 MRR ${won(latestIntent.estimated_mrr_krw)}`
                : statusMessage(
                    pricingStatus,
                    "요금제 관심이 저장됐습니다.",
                    "요금제 관심 저장에 실패했습니다.",
                  )}
            </p>
          </form>
        </article>
      </section>
    </main>
  );
}
