"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, LoaderCircle, Route, ShieldAlert } from "lucide-react";
import type { LaunchIncidentCenter, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackIncidentCenter: LaunchIncidentCenter = {
  center_version: "specpilot.launch_incident_center.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  incident_level: "sev3_watch",
  incident_score: 56,
  commander_brief:
    "sev3_watch · 56점. 공개 URL, 품질 회귀, observability outbox를 30분 단위로 확인하세요.",
  summary:
    "제품 API 연결 전에는 공개 표면, 준비도, 회귀, 연동, 관측성 outbox를 폴백 runbook으로 보여줍니다.",
  metric_cards: {
    incident_score: 56,
    readiness_score: 50,
    integration_blockers: 0,
    queued_observability_exports: 0,
  },
  signals: [
    {
      key: "public_surface",
      label: "공개 표면",
      status: "warning",
      owner: "launch-ops",
      metric: "PUBLIC_SITE_URL 확인 필요",
      impact: "공유 링크 미리보기와 런칭룸 절대 URL 신뢰도에 직접 영향",
      first_response: "공개 URL, canonical, sitemap, 공유 이미지를 실제 메신저에서 확인하세요.",
    },
    {
      key: "observability_outbox",
      label: "관측성 outbox",
      status: "warning",
      owner: "engineering",
      metric: "queued 0개 · failed 0개",
      impact: "trace export 누락은 공개 직후 오류 원인 분석 시간을 늘립니다.",
      first_response: "신규 trace가 생기면 export outbox에 즉시 적재되는지 확인하세요.",
    },
  ],
  runbook: [
    {
      step: "01_triage",
      owner: "incident-commander",
      trigger: "sev3_watch",
      action: "가장 높은 severity signal의 owner를 호출하고 15분 단위 상태 업데이트를 시작",
      success_signal: "모든 warning owner가 지정되고 첫 대응 ETA가 공유됨",
    },
  ],
  escalation_paths: ["launch-ops: 공개 URL과 공유 미리보기 확인"],
  tracking_events: ["launch_incident_center_view"],
  next_actions: ["제품 API 연결 후 실제 인시던트 센터를 확인하세요."],
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

export function LaunchIncidentCenterPanel() {
  const [center, setCenter] = useState<LaunchIncidentCenter>(fallbackIncidentCenter);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadCenter() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-incident-center?limit=8");
        if (!response.ok) {
          throw new Error(`launch incident center ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          center?: LaunchIncidentCenter;
        };
        if (!payload.ok || !payload.center) {
          throw new Error("launch incident center rejected");
        }
        if (alive) {
          setCenter(payload.center);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setCenter(fallbackIncidentCenter);
          setStatus("error");
        }
      }
    }

    void loadCenter();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="launchPublicSection launchIncidentCenter" id="launch-incident-center">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ShieldAlert size={16} />
            런칭 인시던트 센터
          </div>
          <h2>{center.commander_brief}</h2>
          <p>{center.summary}</p>
        </div>
        <div className="launchIncidentStatus">
          <span className={`pill ${tone(center.status)}`}>
            {center.incident_level} · {Math.round(center.incident_score)}점
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

      <div className="launchIncidentMetricGrid">
        {Object.entries(center.metric_cards)
          .slice(0, 8)
          .map(([key, value]) => (
            <article key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{formatMetric(value)}</strong>
            </article>
          ))}
      </div>

      <div className="launchIncidentGrid">
        {center.signals.slice(0, 7).map((signal) => (
          <article className="launchIncidentSignal" key={signal.key}>
            <div>
              <span className={`pill ${tone(signal.status)}`}>{signal.status}</span>
              <span className="pill muted">{signal.owner}</span>
            </div>
            <h3>{signal.label}</h3>
            <p>{signal.metric}</p>
            <small>{signal.impact}</small>
            <strong>{signal.first_response}</strong>
          </article>
        ))}
      </div>

      <div className="launchIncidentFooter">
        <div>
          <strong>
            <Route size={16} />
            Runbook
          </strong>
          {center.runbook.slice(0, 6).map((step) => (
            <article className="launchIncidentRunbook" key={step.step}>
              <span className="pill muted">{step.owner}</span>
              <h3>{step.step}</h3>
              <p>{step.trigger}</p>
              <strong>{step.action}</strong>
              <small>{step.success_signal}</small>
            </article>
          ))}
        </div>
        <div>
          <strong>
            <AlertTriangle size={16} />
            Escalation
          </strong>
          <ul>
            {center.escalation_paths.slice(0, 6).map((item) => (
              <li key={item}>{item}</li>
            ))}
            {center.next_actions.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="launchIncidentEvents">
            {center.tracking_events.slice(0, 5).map((item) => (
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
