"use client";

import { useEffect, useState } from "react";
import { Activity, LoaderCircle, Megaphone, Siren } from "lucide-react";
import type { LaunchWarRoomDashboard, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackWarRoom: LaunchWarRoomDashboard = {
  war_room_version: "specpilot.launch_war_room.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  command_score: 52,
  decision: "collect_more_signal",
  headline: "첫 24시간 반응을 워룸에서 우선순위로 정리합니다.",
  summary:
    "Pulse, 스모크, 전환 보드, 출시 게이트, 품질 회귀, CTA 실험, 추천/유료 수요를 한 화면에서 봅니다.",
  metric_cards: {
    pulse_score: 52,
    smoke_score: 58,
    conversion_score: 49,
    growth_events: 0,
  },
  signals: [
    {
      key: "reaction_pulse",
      label: "공개 반응 온도",
      status: "warning",
      metric: "Pulse 52점",
      evidence: "공개 반응 표본을 더 모아야 합니다.",
      owner: "growth",
      next_action: "첫 24시간 CTA와 공유 이벤트를 확인하세요.",
    },
    {
      key: "publish_surface",
      label: "공개 표면 스모크",
      status: "warning",
      metric: "스모크 58점",
      evidence: "제품 API 연결 후 실제 스모크 결과를 확인합니다.",
      owner: "launch-ops",
      next_action: "URL, 미리보기, 측정 이벤트를 점검하세요.",
    },
  ],
  plays: [
    {
      play_id: "repair_measurement",
      label: "측정 이벤트 복구",
      status: "warning",
      trigger: "성장 이벤트 0건",
      action: "런칭 CTA, 공유 복사, 액션 라우터 클릭 이벤트를 먼저 점검",
      expected_impact: "호응이 생겨도 놓치지 않도록 판단 데이터를 확보합니다.",
      owner: "analytics",
    },
  ],
  escalation_paths: ["analytics: 성장 이벤트 기록부터 확인"],
  next_actions: ["제품 API 연결 후 실제 워룸 점수를 확인하세요."],
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

export function LaunchWarRoomPanel() {
  const [dashboard, setDashboard] = useState<LaunchWarRoomDashboard>(fallbackWarRoom);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadWarRoom() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-war-room?limit=8");
        if (!response.ok) {
          throw new Error(`launch war room ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          dashboard?: LaunchWarRoomDashboard;
        };
        if (!payload.ok || !payload.dashboard) {
          throw new Error("launch war room rejected");
        }
        if (alive) {
          setDashboard(payload.dashboard);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setDashboard(fallbackWarRoom);
          setStatus("error");
        }
      }
    }

    void loadWarRoom();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="launchPublicSection launchWarRoom" id="launch-war-room">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Siren size={16} />
            첫 24시간 런칭 워룸
          </div>
          <h2>{dashboard.headline}</h2>
          <p>{dashboard.summary}</p>
        </div>
        <div className="launchWarRoomStatus">
          <span className={`pill ${tone(dashboard.status)}`}>
            {dashboard.decision} · {Math.round(dashboard.command_score)}점
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

      <div className="launchWarRoomMetricGrid">
        {Object.entries(dashboard.metric_cards)
          .slice(0, 6)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{formatMetric(value)}</strong>
            </article>
          ))}
      </div>

      <div className="launchWarRoomSignalGrid">
        {dashboard.signals.slice(0, 9).map((signal) => (
          <article className="launchWarRoomSignal" key={signal.key}>
            <div>
              <span className={`pill ${tone(signal.status)}`}>{signal.status}</span>
              <span className="pill muted">{signal.owner}</span>
            </div>
            <h3>{signal.label}</h3>
            <p>{signal.metric}</p>
            <small>{signal.evidence}</small>
            <strong>{signal.next_action}</strong>
          </article>
        ))}
      </div>

      <div className="launchWarRoomPlayGrid">
        {dashboard.plays.slice(0, 6).map((play) => (
          <article className="launchWarRoomPlay" key={play.play_id}>
            <div>
              <span className={`pill ${tone(play.status)}`}>{play.status}</span>
              <span className="pill muted">{play.owner}</span>
            </div>
            <h3>{play.label}</h3>
            <p>{play.trigger}</p>
            <strong>{play.action}</strong>
            <small>{play.expected_impact}</small>
          </article>
        ))}
      </div>

      <div className="launchWarRoomFooter">
        <div>
          <strong>
            <Megaphone size={16} />
            escalation
          </strong>
          <ul>
            {dashboard.escalation_paths.slice(0, 5).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>
            <Activity size={16} />
            다음 액션
          </strong>
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
