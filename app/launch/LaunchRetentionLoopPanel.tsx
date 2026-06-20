"use client";

import { useEffect, useState } from "react";
import { BellRing, LoaderCircle, TimerReset } from "lucide-react";
import type { OpsStatus, RetentionHubDashboard } from "../types";

type Status = "loading" | "ready" | "error";

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function metricLabel(key: string) {
  const labels: Record<string, string> = {
    saved_reports: "저장 리포트",
    alert_subscriptions: "가격 알림",
    public_share_views: "공유 조회",
    advisor_answers: "구매 상담",
    purchase_outcomes: "구매 결과",
    completion_reports: "완료 리포트",
    open_board_items: "미완료 보드",
    unresolved_board_items: "미처리 후속",
  };
  return labels[key] ?? key.replaceAll("_", " ");
}

function pathFor(path: string) {
  if (!path || path.includes("{")) {
    return "/#analysis";
  }
  if (path.startsWith("#")) {
    return `/${path}`;
  }
  return path;
}

export function LaunchRetentionLoopPanel() {
  const [hub, setHub] = useState<RetentionHubDashboard | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadHub() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/retention-hub?limit=8");
        if (!response.ok) {
          throw new Error(`retention hub ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          hub?: RetentionHubDashboard;
        };
        if (!payload.ok || !payload.hub) {
          throw new Error("retention hub rejected");
        }
        if (alive) {
          setHub(payload.hub);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setStatus("error");
        }
      }
    }

    void loadHub();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="launchPublicSection launchRetentionLoop" id="launch-retention-loop">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <TimerReset size={16} />
            구매 후속 루프
          </div>
          <h2>{hub?.headline ?? "비교 후 이탈한 사용자를 구매 결정으로 다시 연결합니다"}</h2>
          <p>
            {hub?.summary ??
              "저장 리포트, 목표가 알림, 공유 조회, 구매 상담, 구매 결과를 묶어 다음에 어떤 후속 행동을 보내야 하는지 정리합니다."}
          </p>
        </div>
        <span className={`pill ${hub ? tone(hub.status) : status === "error" ? "warn" : "muted"}`}>
          {hub ? `${Math.round(hub.retention_score)}점` : status === "loading" ? "조회 중" : "확인 필요"}
        </span>
      </div>

      {hub ? (
        <>
          <div className="launchRetentionMetricGrid">
            <article className="launchRetentionScoreCard">
              <span>재참여 점수</span>
              <strong>{Math.round(hub.retention_score)}점</strong>
              <p>{hub.status}</p>
            </article>
            {Object.entries(hub.metric_cards)
              .slice(0, 5)
              .map(([key, value]) => (
                <article key={key}>
                  <span>{metricLabel(key)}</span>
                  <strong>{value}</strong>
                </article>
              ))}
          </div>

          <div className="launchRetentionSignalGrid">
            {hub.signals.slice(0, 4).map((signal) => (
              <article className="launchRetentionSignal" key={signal.key}>
                <div>
                  <span className={`pill ${tone(signal.status)}`}>{signal.status}</span>
                  <span className="pill muted">{Math.round(signal.score)}점</span>
                </div>
                <h3>{signal.label}</h3>
                <p>{signal.metric}</p>
                <small>{signal.next_action}</small>
              </article>
            ))}
          </div>

          <div className="launchRetentionPlayGrid">
            {hub.plays.slice(0, 3).map((play) => (
              <article className="launchRetentionPlay" key={play.play_id}>
                <div>
                  <span className="pill ok">{play.channel}</span>
                  <span className="pill muted">{play.audience}</span>
                </div>
                <h3>{play.label}</h3>
                <p>{play.trigger}</p>
                <a className="miniCta" href={pathFor(play.cta_target)}>
                  <BellRing size={14} />
                  {play.cta_label}
                </a>
                <small>{play.expected_impact}</small>
              </article>
            ))}
          </div>

          <div className="launchRetentionFooter">
            <div>
              <strong>다음 후속 액션</strong>
              <ul>
                {hub.next_actions.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>최근 구매 결과</strong>
              <ul>
                {(hub.recent_purchase_outcomes.length
                  ? hub.recent_purchase_outcomes
                  : []
                )
                  .slice(0, 4)
                  .map((outcome) => (
                    <li key={outcome.outcome_id}>
                      {outcome.status} · {outcome.model_name || outcome.product_id || "제품 미기록"}
                    </li>
                  ))}
                {!hub.recent_purchase_outcomes.length ? (
                  <li>아직 구매 결과 피드백이 없습니다.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="launchRetentionLoading">
          {status === "loading" ? (
            <>
              <LoaderCircle className="spin" size={18} />
              구매 후속 루프를 불러오는 중입니다.
            </>
          ) : (
            "구매 후속 루프를 불러오지 못했습니다. 저장 리포트와 목표가 알림 데이터를 다시 확인하세요."
          )}
        </div>
      )}
    </section>
  );
}
