"use client";

import { useEffect, useState } from "react";
import { Copy, LoaderCircle, MessageSquareText, Pin, ShieldAlert } from "lucide-react";
import type { LaunchCommunityKit, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackCommunityKit: LaunchCommunityKit = {
  kit_version: "specpilot.launch_community_kit.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  response_score: 55,
  headline: "커뮤니티 댓글에 바로 답할 수 있는 대응 키트를 준비합니다.",
  summary:
    "최저가 비교, 제휴 편향, 가격 최신성, 개인정보, 팀 구매 질문에 붙일 답변과 추적 이벤트를 묶습니다.",
  metric_cards: {
    response_score: 55,
    reply_templates: 2,
    growth_events: 0,
    share_cta_clicks: 0,
  },
  pinned_update:
    "SpecPilot AI 첫 주 공개 리포트입니다. 실제 반응 지표를 연결하면 커뮤니티 고정 댓글 문구가 자동으로 업데이트됩니다.\n\n런칭룸: /launch",
  reply_templates: [
    {
      key: "reply_pinned_context",
      label: "상단 고정 댓글",
      trigger: "첫 글을 본 사람이 서비스 맥락과 링크를 확인해야 할 때",
      tone: "짧고 투명하게",
      copy_text:
        "컴퓨터/노트북 구매 실패를 줄이는 AI 구매 리포트 공개 베타입니다.\n\n런칭룸: /launch",
      cta_label: "런칭룸 보기",
      cta_path: "/launch",
      tracking_event: "launch_share_community",
    },
    {
      key: "reply_vs_price_comparison",
      label: "최저가 비교와의 차이",
      trigger: "최저가 비교 사이트와 무엇이 다른지 묻는 댓글",
      tone: "구매 실패 방지 관점으로 설명",
      copy_text:
        "최저가만 보여주는 대신 목적 적합도, 호환성, 리뷰 리스크, 가격 타이밍, 결제 전 검수를 함께 봅니다.",
      cta_label: "분석 시작",
      cta_path: "/#start-concierge",
      tracking_event: "launch_action_analysis_start",
    },
  ],
  risks: [
    {
      key: "reply_latency",
      label: "댓글 대응 지연",
      status: "warning",
      evidence: "제품 API 연결 후 실제 성장 이벤트를 확인합니다.",
      response_rule: "첫 2시간은 최저가/제휴/가격 최신성 질문에 10분 이내 답변하세요.",
    },
  ],
  tracking_events: ["launch_community_reply_copy"],
  next_actions: ["제품 API 연결 후 커뮤니티 대응 키트를 다시 확인하세요."],
};

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

export function LaunchCommunityKitPanel() {
  const [kit, setKit] = useState<LaunchCommunityKit>(fallbackCommunityKit);
  const [status, setStatus] = useState<Status>("loading");
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadKit() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-community-kit?limit=8");
        if (!response.ok) {
          throw new Error(`launch community kit ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          kit?: LaunchCommunityKit;
        };
        if (!payload.ok || !payload.kit) {
          throw new Error("launch community kit rejected");
        }
        if (alive) {
          setKit(payload.kit);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setKit(fallbackCommunityKit);
          setStatus("error");
        }
      }
    }

    void loadKit();
    return () => {
      alive = false;
    };
  }, []);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch {
      setCopiedKey("");
    }
  }

  return (
    <section className="launchPublicSection launchCommunityKit" id="launch-community-kit">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MessageSquareText size={16} />
            커뮤니티 댓글 대응 키트
          </div>
          <h2>{kit.headline}</h2>
          <p>{kit.summary}</p>
        </div>
        <div className="launchCommunityStatus">
          <span className={`pill ${tone(kit.status)}`}>
            {kit.status} · {Math.round(kit.response_score)}점
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

      <div className="launchCommunityMetricGrid">
        {Object.entries(kit.metric_cards)
          .slice(0, 8)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{formatMetric(value)}</strong>
            </article>
          ))}
      </div>

      <article className="launchCommunityPinned">
        <div>
          <strong>
            <Pin size={16} />
            고정 댓글
          </strong>
          <button type="button" onClick={() => copyText("pinned", kit.pinned_update)}>
            <Copy size={14} />
            {copiedKey === "pinned" ? "복사됨" : "복사"}
          </button>
        </div>
        <pre>{kit.pinned_update}</pre>
      </article>

      <div className="launchCommunityGrid">
        {kit.reply_templates.slice(0, 7).map((template) => (
          <article className="launchCommunityReply" key={template.key}>
            <div>
              <span className="pill muted">{template.tone}</span>
              <button
                type="button"
                onClick={() => copyText(template.key, template.copy_text)}
              >
                <Copy size={14} />
                {copiedKey === template.key ? "복사됨" : "답변 복사"}
              </button>
            </div>
            <h3>{template.label}</h3>
            <p>{template.trigger}</p>
            <pre>{template.copy_text}</pre>
            <small>
              {template.cta_label} · {template.tracking_event}
            </small>
          </article>
        ))}
      </div>

      <div className="launchCommunityFooter">
        <div>
          <strong>
            <ShieldAlert size={16} />
            운영 리스크
          </strong>
          {kit.risks.slice(0, 5).map((risk) => (
            <article key={risk.key}>
              <span className={`pill ${tone(risk.status)}`}>{risk.status}</span>
              <h3>{risk.label}</h3>
              <p>{risk.evidence}</p>
              <b>{risk.response_rule}</b>
            </article>
          ))}
        </div>
        <div>
          <strong>다음 액션</strong>
          <ul>
            {kit.next_actions.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <strong>측정 이벤트</strong>
          <div className="launchCommunityEvents">
            {kit.tracking_events.slice(0, 5).map((item) => (
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
