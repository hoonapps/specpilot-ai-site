"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Copy, LoaderCircle, MousePointerClick, Sparkles } from "lucide-react";
import type { LaunchActivationOfferDashboard, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackActivationOffer: LaunchActivationOfferDashboard = {
  offer_version: "specpilot.launch_activation_offer.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  activation_score: 58,
  headline: "첫 방문자를 분석 시작, 추천 대기열, 요금제 관심으로 분기합니다.",
  summary:
    "전환 보드, 공개 라우팅, 미디어/커뮤니티 신호, 요금제 의향을 묶어 런칭 방문자의 다음 행동을 고릅니다.",
  metric_cards: {
    activation_score: 58,
    conversion_score: 52,
    waitlist_referrals: 0,
    pricing_intents: 0,
  },
  primary_offer: {
    key: "quick_purchase_analysis",
    label: "30초 구매 조건 분석",
    audience: "컴퓨터와 노트북을 곧 살 개인 구매자",
    trigger: "런칭 글이나 커뮤니티 답변을 보고 바로 내 조건을 넣고 싶을 때",
    cta_label: "구매 조건 분석 시작",
    cta_path: "/#start-concierge",
    value_prop: "예산, 용도, 후보를 넣으면 적합도와 가격 대기 여부를 한 번에 봅니다.",
    proof: "컴퓨터·노트북 구매 실패를 줄이는 AI 구매 리포트입니다.",
    friction: "회원가입 전 최소 입력만 받고 결과 화면에서 저장을 요청합니다.",
    tracking_event: "launch_activation_quick_analysis",
    priority_score: 66,
  },
  offers: [],
  handoff_prompts: [
    "예산, 용도, 후보 링크를 한 줄로 받아 분석 폼 prefill에 넘기세요.",
    "분석 완료 화면에는 저장 리포트, 가격 알림, 추천 공유 중 하나만 다음 CTA로 보여주세요.",
  ],
  proof_points: [
    "최저가보다 목적 적합도, 호환성, 리뷰 리스크, 가격 타이밍을 함께 봅니다.",
  ],
  tracking_events: ["launch_activation_primary_click"],
  next_actions: ["제품 API 연결 후 실제 전환 오퍼를 확인하세요."],
};

fallbackActivationOffer.offers = [fallbackActivationOffer.primary_offer];

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function formatMetric(value: number | string) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString("ko-KR") : String(Math.round(value));
  }
  return value;
}

export function LaunchActivationOfferPanel() {
  const [dashboard, setDashboard] =
    useState<LaunchActivationOfferDashboard>(fallbackActivationOffer);
  const [status, setStatus] = useState<Status>("loading");
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-activation-offer?limit=8");
        if (!response.ok) {
          throw new Error(`launch activation offer ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          dashboard?: LaunchActivationOfferDashboard;
        };
        if (!payload.ok || !payload.dashboard) {
          throw new Error("launch activation offer rejected");
        }
        if (alive) {
          setDashboard(payload.dashboard);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setDashboard(fallbackActivationOffer);
          setStatus("error");
        }
      }
    }

    void loadDashboard();
    return () => {
      alive = false;
    };
  }, []);

  async function copyPrompt(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch {
      setCopiedKey("");
    }
  }

  const offers = dashboard.offers.length ? dashboard.offers : [dashboard.primary_offer];

  return (
    <section className="launchPublicSection launchActivationOffer" id="launch-activation-offer">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MousePointerClick size={16} />
            런칭 전환 오퍼
          </div>
          <h2>{dashboard.headline}</h2>
          <p>{dashboard.summary}</p>
        </div>
        <div className="launchActivationStatus">
          <span className={`pill ${tone(dashboard.status)}`}>
            {dashboard.status} · {Math.round(dashboard.activation_score)}점
          </span>
          {status === "loading" ? (
            <small>
              <LoaderCircle className="spin" size={14} />
              조회 중
            </small>
          ) : null}
          {status === "error" ? <small>제품 API 폴백</small> : null}
        </div>
      </div>

      <div className="launchActivationMetricGrid">
        {Object.entries(dashboard.metric_cards)
          .slice(0, 8)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{formatMetric(value)}</strong>
            </article>
          ))}
      </div>

      <article className="launchActivationPrimary">
        <div>
          <span className="pill ok">Primary CTA</span>
          <strong>{dashboard.primary_offer.label}</strong>
          <p>{dashboard.primary_offer.value_prop}</p>
        </div>
        <a className="primaryButton" href={dashboard.primary_offer.cta_path}>
          {dashboard.primary_offer.cta_label}
          <ArrowRight size={16} />
        </a>
      </article>

      <div className="launchActivationGrid">
        {offers.slice(0, 5).map((offer) => (
          <article className="launchActivationOfferCard" key={offer.key}>
            <div>
              <span className="pill muted">{Math.round(offer.priority_score)}점</span>
              <small>{offer.tracking_event}</small>
            </div>
            <h3>{offer.label}</h3>
            <p>{offer.audience}</p>
            <strong>{offer.trigger}</strong>
            <small>{offer.friction}</small>
            <a href={offer.cta_path}>
              {offer.cta_label}
              <ArrowRight size={14} />
            </a>
          </article>
        ))}
      </div>

      <div className="launchActivationFooter">
        <div>
          <strong>
            <Sparkles size={16} />
            Handoff prompt
          </strong>
          {dashboard.handoff_prompts.slice(0, 5).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => copyPrompt(item, item)}
              className="launchActivationPrompt"
            >
              <Copy size={14} />
              <span>{copiedKey === item ? "복사됨" : item}</span>
            </button>
          ))}
        </div>
        <div>
          <strong>Proof & next action</strong>
          <ul>
            {dashboard.proof_points.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
            {dashboard.next_actions.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="launchActivationEvents">
            {dashboard.tracking_events.slice(0, 5).map((item) => (
              <span className="pill muted" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
