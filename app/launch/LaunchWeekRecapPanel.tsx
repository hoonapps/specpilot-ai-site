"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Newspaper, Repeat2, TriangleAlert } from "lucide-react";
import type { LaunchWeekRecapDashboard, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackRecap: LaunchWeekRecapDashboard = {
  recap_version: "specpilot.launch_week_recap.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  recap_score: 54,
  headline: "첫 주 공개 반응을 D+7 리포트로 정리합니다.",
  summary:
    "공개 반응, 공유, 추천, 요금제 관심, CTA 실험, 품질 리스크를 한 장의 후속 업데이트로 묶습니다.",
  metric_cards: {
    growth_events: 0,
    public_share_views: 0,
    referral_waitlist: 0,
    pricing_intents: 0,
    active_experiments: 0,
    pulse_score: 54,
  },
  wins: [
    {
      key: "reaction_learning",
      label: "반응 학습 표본",
      metric: "제품 API 연결 후 실제 성장 이벤트를 표시",
      evidence: "런칭 페이지 CTA, 공유, 추천, 유료 관심 이벤트를 D+7 기준으로 합산합니다.",
      repeat_action: "가장 반응이 좋은 CTA를 다음 주 배포 문구로 승격하세요.",
    },
  ],
  risks: [
    {
      key: "measurement_gap",
      label: "측정 표본 부족",
      status: "warning",
      evidence: "폴백 상태에서는 실제 이벤트 표본을 확인할 수 없습니다.",
      mitigation: "제품 API와 연결해 런칭 후 성장 이벤트가 저장되는지 확인하세요.",
      owner: "analytics",
    },
  ],
  channel_moves: ["첫 주 리포트 링크를 공개 런칭룸과 커뮤니티 후속 댓글에 공유"],
  founder_update:
    "SpecPilot AI 첫 주 공개 리포트입니다. 실제 반응 지표를 연결하면 이 문구가 자동으로 업데이트됩니다.",
  next_actions: ["제품 API 연결 후 D+7 리포트를 다시 확인하세요."],
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

export function LaunchWeekRecapPanel() {
  const [dashboard, setDashboard] = useState<LaunchWeekRecapDashboard>(fallbackRecap);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadRecap() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-week-recap?limit=8");
        if (!response.ok) {
          throw new Error(`launch week recap ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          dashboard?: LaunchWeekRecapDashboard;
        };
        if (!payload.ok || !payload.dashboard) {
          throw new Error("launch week recap rejected");
        }
        if (alive) {
          setDashboard(payload.dashboard);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setDashboard(fallbackRecap);
          setStatus("error");
        }
      }
    }

    void loadRecap();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="launchPublicSection launchWeekRecap" id="launch-week-recap">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Newspaper size={16} />
            D+7 런칭 리포트
          </div>
          <h2>{dashboard.headline}</h2>
          <p>{dashboard.summary}</p>
        </div>
        <div className="launchWeekRecapStatus">
          <span className={`pill ${tone(dashboard.status)}`}>
            {dashboard.status} · {Math.round(dashboard.recap_score)}점
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

      <div className="launchWeekRecapMetricGrid">
        {Object.entries(dashboard.metric_cards)
          .slice(0, 8)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{formatMetric(value)}</strong>
            </article>
          ))}
      </div>

      <article className="launchWeekFounderUpdate">
        <span className="pill muted">공개 후속 업데이트</span>
        <p>{dashboard.founder_update}</p>
      </article>

      <div className="launchWeekRecapGrid">
        <div className="launchWeekRecapColumn">
          <strong>
            <Repeat2 size={16} />
            반복할 성과
          </strong>
          {dashboard.wins.slice(0, 6).map((win) => (
            <article className="launchWeekWin" key={win.key}>
              <h3>{win.label}</h3>
              <p>{win.metric}</p>
              <small>{win.evidence}</small>
              <b>{win.repeat_action}</b>
            </article>
          ))}
        </div>

        <div className="launchWeekRecapColumn">
          <strong>
            <TriangleAlert size={16} />
            닫아야 할 리스크
          </strong>
          {dashboard.risks.slice(0, 6).map((risk) => (
            <article className="launchWeekRisk" key={risk.key}>
              <div>
                <span className={`pill ${tone(risk.status)}`}>{risk.status}</span>
                <span className="pill muted">{risk.owner}</span>
              </div>
              <h3>{risk.label}</h3>
              <p>{risk.evidence}</p>
              <b>{risk.mitigation}</b>
            </article>
          ))}
        </div>
      </div>

      <div className="launchWeekRecapFooter">
        <div>
          <strong>다음 채널 액션</strong>
          <ul>
            {dashboard.channel_moves.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>다음 제품 액션</strong>
          <ul>
            {dashboard.next_actions.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
