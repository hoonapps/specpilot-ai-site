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
  Loader2,
  Monitor,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { demoResponse } from "./demo-data";
import type {
  AnalyzeAndShareResponse,
  AnalyzePayload,
  AnalyzeResponse,
  BetaLead,
  Category,
  FeedbackRecord,
  ReportAdvisorAnswer,
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

  const top = result.report.top_recommendations[0];
  const dealWindow = result.report.deal_windows[0];
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

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setStatusText("서버 프록시 분석 중");
    setConnectionWarning(null);
    setPublicUrl(null);
    setSavedReportId(null);
    setAdvisorStatus("idle");
    setLatestAdvisorAnswer(null);
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
    } catch {
      setBetaStatus("error");
    }
  }

  async function submitPricingIntent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPricingStatus("sending");
    setLatestIntent(null);

    try {
      const response = await fetch("/api/specpilot/subscription-intents", {
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
        }),
      });
      if (!response.ok) {
        throw new Error(`pricing ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        intent?: SubscriptionIntent;
      };
      if (!payload.ok || !payload.intent) {
        throw new Error("pricing rejected");
      }
      setLatestIntent(payload.intent);
      setPricingStatus("sent");
    } catch {
      setPricingStatus("error");
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
          <a href="#advisor">구매 상담</a>
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
