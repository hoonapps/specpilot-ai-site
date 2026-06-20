"use client";

import { useEffect, useState } from "react";
import { Copy, LoaderCircle, MessageSquareHeart, Sparkles } from "lucide-react";
import type { LaunchResponseLoopDashboard, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackResponseLoop: LaunchResponseLoopDashboard = {
  loop_version: "specpilot.launch_response_loop.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  response_score: 54,
  headline: "첫 반응을 proof, 답장, 제품 수정, 유료 후속으로 분류합니다.",
  summary:
    "제품 API 연결 전에는 첫 피드백과 성장 이벤트를 어떻게 처리할지 폴백 루프를 보여줍니다.",
  metric_cards: {
    response_score: 54,
    feedback_count: 0,
    growth_events: 0,
    product_fix_items: 0,
  },
  followups: [
    {
      key: "collect_first_response",
      label: "첫 반응 수집",
      owner: "founder",
      priority: "high",
      trigger: "피드백과 성장 이벤트가 아직 없음",
      action: "런칭룸 상단에 30초 분석 CTA와 한 줄 피드백 CTA를 함께 고정",
      reply_copy:
        "첫 사용자 반응을 받고 있습니다. 조건을 넣어보고 좋은 점/불편한 점을 한 줄로 남겨주세요.",
      proof_policy: "첫 반응 5건 전까지는 정량 지표를 proof로 과장하지 않습니다.",
      tracking_event: "launch_response_first_signal",
    },
  ],
  proof_candidates: [
    "첫 proof 후보는 만족도 4점 이상 피드백 또는 공유 CTA 이벤트가 생기면 생성됩니다.",
  ],
  founder_reply_queue: [
    "첫 피드백이 들어오면 24시간 안에 founder reply를 보낼 대상을 여기에 쌓으세요.",
  ],
  product_fix_queue: [
    "반복 개선 요청이 들어오면 beta backlog owner와 due date를 지정하세요.",
  ],
  tracking_events: ["launch_response_loop_view"],
  recent_feedback: [],
  recent_growth_events: [],
  next_actions: ["제품 API 연결 후 실제 반응 후속 루프를 확인하세요."],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function priorityTone(priority: string) {
  if (priority === "high") {
    return "danger";
  }
  return priority === "medium" ? "warn" : "muted";
}

function formatMetric(value: number | string) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString("ko-KR") : String(Math.round(value));
  }
  return value;
}

export function LaunchResponseLoopPanel() {
  const [dashboard, setDashboard] =
    useState<LaunchResponseLoopDashboard>(fallbackResponseLoop);
  const [status, setStatus] = useState<Status>("loading");
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadDashboard() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-response-loop?limit=8");
        if (!response.ok) {
          throw new Error(`launch response loop ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          dashboard?: LaunchResponseLoopDashboard;
        };
        if (!payload.ok || !payload.dashboard) {
          throw new Error("launch response loop rejected");
        }
        if (alive) {
          setDashboard(payload.dashboard);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setDashboard(fallbackResponseLoop);
          setStatus("error");
        }
      }
    }

    void loadDashboard();
    return () => {
      alive = false;
    };
  }, []);

  async function copyReply(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch {
      setCopiedKey("");
    }
  }

  return (
    <section className="launchPublicSection launchResponseLoop" id="launch-response-loop">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MessageSquareHeart size={16} />
            런칭 반응 후속 루프
          </div>
          <h2>{dashboard.headline}</h2>
          <p>{dashboard.summary}</p>
        </div>
        <div className="launchResponseStatus">
          <span className={`pill ${tone(dashboard.status)}`}>
            {dashboard.status} · {Math.round(dashboard.response_score)}점
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

      <div className="launchResponseMetricGrid">
        {Object.entries(dashboard.metric_cards)
          .slice(0, 8)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{formatMetric(value)}</strong>
            </article>
          ))}
      </div>

      <div className="launchResponseFollowupGrid">
        {dashboard.followups.slice(0, 5).map((followup) => (
          <article className="launchResponseFollowup" key={followup.key}>
            <div>
              <span className={`pill ${priorityTone(followup.priority)}`}>
                {followup.priority}
              </span>
              <span className="pill muted">{followup.owner}</span>
            </div>
            <h3>{followup.label}</h3>
            <p>{followup.trigger}</p>
            <strong>{followup.action}</strong>
            <small>{followup.proof_policy}</small>
            <button
              type="button"
              onClick={() => copyReply(followup.key, followup.reply_copy)}
            >
              <Copy size={14} />
              {copiedKey === followup.key ? "복사됨" : "답글 복사"}
            </button>
          </article>
        ))}
      </div>

      <div className="launchResponseFooter">
        <div>
          <strong>
            <Sparkles size={16} />
            공개 proof 후보
          </strong>
          <ul>
            {dashboard.proof_candidates.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>Founder reply</strong>
          <ul>
            {dashboard.founder_reply_queue.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>제품 수정 queue</strong>
          <ul>
            {dashboard.product_fix_queue.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>다음 액션</strong>
          <ul>
            {dashboard.next_actions.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="launchResponseEvents">
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
