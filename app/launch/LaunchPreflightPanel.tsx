"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  ExternalLink,
  LoaderCircle,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import type { OpsStatus, PublicLaunchPreflightDashboard } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackPreflight: PublicLaunchPreflightDashboard = {
  preflight_version: "specpilot.public_launch_preflight.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  go_decision: "limited_beta",
  preflight_score: 61,
  headline: "최종 체크를 불러오면 공개 배포 판단이 정리됩니다.",
  summary:
    "스모크, 출시 게이트, 워룸, 인시던트 대응, 측정 이벤트, 공유 미리보기를 합산해 go/no-go를 보여줍니다.",
  metric_cards: {
    smoke_score: 58,
    launch_readiness_score: 62,
    war_room_score: 60,
    incident_score: 64,
  },
  checks: [
    {
      key: "public_surface",
      label: "공개 표면",
      status: "warning",
      owner: "growth",
      metric: "스모크 폴백",
      evidence: "제품 API 연결 후 실제 공개 URL을 확인하세요.",
      required_action: "제품 API 연결 후 최종 체크를 다시 조회하세요.",
      public_path: "/launch#launch-smoke",
    },
    {
      key: "launch_gate",
      label: "go/no-go 게이트",
      status: "warning",
      owner: "product",
      metric: "readiness 폴백",
      evidence: "출시 준비도와 데이터 거버넌스를 확인해야 합니다.",
      required_action: "운영 콘솔에서 readiness를 다시 확인하세요.",
      public_path: "/launch#launch-readiness-gate",
    },
  ],
  launch_brief: [
    "제한 배포로 시작하고 warning 항목을 닫은 뒤 확산하세요.",
    "첫 24시간 워룸과 인시던트 runbook을 동시에 열어두세요.",
  ],
  tracking_events: ["public_launch_preflight_view"],
  next_actions: ["제품 API 연결 후 실제 최종 체크를 확인하세요."],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function decisionLabel(decision: string) {
  if (decision === "go") {
    return "GO";
  }
  if (decision === "limited_beta") {
    return "제한 배포";
  }
  if (decision === "blocked") {
    return "차단";
  }
  return "보류";
}

export function LaunchPreflightPanel() {
  const [dashboard, setDashboard] =
    useState<PublicLaunchPreflightDashboard>(fallbackPreflight);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadPreflight() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/public-launch-preflight?limit=8");
        if (!response.ok) {
          throw new Error(`public launch preflight ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          dashboard?: PublicLaunchPreflightDashboard;
        };
        if (!payload.ok || !payload.dashboard) {
          throw new Error("public launch preflight rejected");
        }
        if (alive) {
          setDashboard(payload.dashboard);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setDashboard(fallbackPreflight);
          setStatus("error");
        }
      }
    }

    void loadPreflight();
    return () => {
      alive = false;
    };
  }, []);

  const metricCards = [
    ["스모크", dashboard.metric_cards.smoke_score],
    ["준비도", dashboard.metric_cards.launch_readiness_score],
    ["워룸", dashboard.metric_cards.war_room_score],
    ["인시던트", dashboard.metric_cards.incident_score],
  ];

  return (
    <section className="launchPublicSection launchPreflight" id="launch-preflight">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ClipboardCheck size={16} />
            공개 출시 최종 체크
          </div>
          <h2>{dashboard.headline}</h2>
          <p>{dashboard.summary}</p>
        </div>
        <div className="launchPreflightDecision">
          <span className={`pill ${tone(dashboard.status)}`}>
            {decisionLabel(dashboard.go_decision)} · {Math.round(dashboard.preflight_score)}점
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

      <div className="launchPreflightMetricGrid">
        {metricCards.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{typeof value === "number" ? Math.round(value) : value ?? "-"}</strong>
          </article>
        ))}
      </div>

      <div className="launchPreflightCheckGrid">
        {dashboard.checks.slice(0, 8).map((check) => (
          <article className="launchPreflightCheck" key={check.key}>
            <div>
              <span className={`pill ${tone(check.status)}`}>{check.status}</span>
              <span className="pill muted">{check.owner}</span>
              <a href={check.public_path}>
                열기
                <ExternalLink size={13} />
              </a>
            </div>
            <h3>{check.label}</h3>
            <p>{check.evidence}</p>
            <small>{check.metric}</small>
            <strong>{check.required_action}</strong>
          </article>
        ))}
      </div>

      <div className="launchPreflightFooter">
        <div>
          <strong>
            <Rocket size={16} />
            런칭 브리프
          </strong>
          <ul>
            {dashboard.launch_brief.slice(0, 4).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>
            <ShieldCheck size={16} />
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

