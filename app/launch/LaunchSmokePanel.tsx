"use client";

import { useEffect, useState } from "react";
import { ExternalLink, LoaderCircle, RadioTower, ShieldCheck } from "lucide-react";
import type { OpsStatus, PublicLaunchSmokeDashboard } from "../types";

type Status = "loading" | "ready" | "error";

const fallbackSmoke: PublicLaunchSmokeDashboard = {
  smoke_version: "specpilot.public_launch_smoke.fallback",
  workspace_id: "demo",
  generated_at: new Date(0).toISOString(),
  status: "warning",
  smoke_score: 58,
  headline: "공개 런칭 표면을 배포 전에 한 번 더 확인합니다.",
  summary:
    "런칭룸, 시장 리포트, proof, 공유 확산팩, 액션 라우터, 출시 게이트, SEO 메타, 측정 이벤트를 한 묶음으로 점검합니다.",
  ok_count: 2,
  warning_count: 3,
  blocker_count: 0,
  publish_ready_paths: ["/launch", "/market/desktop-pc"],
  checks: [
    {
      key: "launch_room",
      label: "공개 런칭룸",
      status: "warning",
      public_path: "/launch",
      expected_signal: "hero, 데모 카드, 시장 리포트, proof strip",
      metric: "런칭룸 폴백",
      recommendation: "제품 API 연결 후 실제 스모크 점수를 확인하세요.",
    },
    {
      key: "seo_distribution",
      label: "검색/공유 배포 메타",
      status: "warning",
      public_path: "/sitemap.xml",
      expected_signal: "robots, sitemap, manifest, canonical, Twitter, JSON-LD",
      metric: "배포 도메인 확인 필요",
      recommendation: "PUBLIC_SITE_URL 설정과 공유 미리보기를 확인하세요.",
    },
  ],
  measurement_events: ["launch_smoke_view", "launch_smoke_check_click"],
  next_actions: ["제품 API 연결 후 실제 공개 URL 스모크 체크를 확인하세요."],
};

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

export function LaunchSmokePanel() {
  const [dashboard, setDashboard] = useState<PublicLaunchSmokeDashboard>(fallbackSmoke);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadSmoke() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-smoke?limit=8");
        if (!response.ok) {
          throw new Error(`launch smoke ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          dashboard?: PublicLaunchSmokeDashboard;
        };
        if (!payload.ok || !payload.dashboard) {
          throw new Error("launch smoke rejected");
        }
        if (alive) {
          setDashboard(payload.dashboard);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setDashboard(fallbackSmoke);
          setStatus("error");
        }
      }
    }

    void loadSmoke();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="launchPublicSection launchSmokePanel" id="launch-smoke">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <RadioTower size={16} />
            공개 런칭 스모크 체크
          </div>
          <h2>{dashboard.headline}</h2>
          <p>{dashboard.summary}</p>
        </div>
        <div className="launchSmokeStatus">
          <span className={`pill ${tone(dashboard.status)}`}>
            {Math.round(dashboard.smoke_score)}점
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

      <div className="launchSmokeMetricGrid">
        <article>
          <span>ok</span>
          <strong>{dashboard.ok_count}</strong>
        </article>
        <article>
          <span>warning</span>
          <strong>{dashboard.warning_count}</strong>
        </article>
        <article>
          <span>blocker</span>
          <strong>{dashboard.blocker_count}</strong>
        </article>
        <article>
          <span>공개 URL</span>
          <strong>{dashboard.publish_ready_paths.length}</strong>
        </article>
      </div>

      <div className="launchSmokeCheckGrid">
        {dashboard.checks.slice(0, 10).map((check) => (
          <article className="launchSmokeCheck" key={check.key}>
            <div>
              <span className={`pill ${tone(check.status)}`}>{check.status}</span>
              <a href={check.public_path}>
                열기
                <ExternalLink size={13} />
              </a>
            </div>
            <h3>{check.label}</h3>
            <p>{check.expected_signal}</p>
            <small>{check.metric}</small>
            <strong>{check.recommendation}</strong>
          </article>
        ))}
      </div>

      <div className="launchSmokeFooter">
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
        <div>
          <strong>측정 이벤트</strong>
          <div className="launchPublicPills">
            {dashboard.measurement_events.slice(0, 5).map((item) => (
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
