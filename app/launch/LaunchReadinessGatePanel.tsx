"use client";

import { useEffect, useState } from "react";
import { Activity, LoaderCircle, ShieldCheck } from "lucide-react";
import type { LaunchReadinessBundle, OpsStatus } from "../types";

type Status = "loading" | "ready" | "error";

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function LaunchReadinessGatePanel() {
  const [bundle, setBundle] = useState<LaunchReadinessBundle | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;

    async function loadReadiness() {
      setStatus("loading");
      try {
        const response = await fetch("/api/specpilot/launch-readiness");
        if (!response.ok) {
          throw new Error(`launch readiness ${response.status}`);
        }
        const payload = (await response.json()) as {
          ok: boolean;
          dashboard?: LaunchReadinessBundle;
        };
        if (!payload.ok || !payload.dashboard) {
          throw new Error("launch readiness rejected");
        }
        if (alive) {
          setBundle(payload.dashboard);
          setStatus("ready");
        }
      } catch {
        if (alive) {
          setStatus("error");
        }
      }
    }

    void loadReadiness();
    return () => {
      alive = false;
    };
  }, []);

  const gate = bundle?.launch_gate;
  const readiness = bundle?.readiness;

  return (
    <section className="launchPublicSection launchReadinessGate" id="launch-readiness-gate">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Activity size={16} />
            공개 출시 게이트
          </div>
          <h2>{gate?.summary ?? "공개 확대 전에 운영 게이트를 확인합니다"}</h2>
          <p>
            분석 실행, 공유 조회, 피드백, 구매 의향, 품질 회귀, 외부 연동,
            데이터 보존 상태를 묶어 지금 공개 확대가 가능한지 보여줍니다.
          </p>
        </div>
        <span className={`pill ${gate ? tone(gate.status) : status === "error" ? "warn" : "muted"}`}>
          {gate ? `${gate.decision} · ${Math.round(gate.launch_readiness_score)}점` : "조회 중"}
        </span>
      </div>

      {bundle ? (
        <>
          <div className="launchReadinessMetricGrid">
            <article>
              <span>준비도</span>
              <strong>{Math.round(readiness?.launch_readiness_score ?? 0)}점</strong>
              <p>{readiness?.readiness_label}</p>
            </article>
            <article>
              <span>공개 조회</span>
              <strong>{readiness?.public_share_views ?? 0}</strong>
              <p>공유 리포트 기반 검토 표본</p>
            </article>
            <article>
              <span>구매 의향</span>
              <strong>{percent(readiness?.purchase_intent_rate ?? 0)}</strong>
              <p>피드백에서 확인한 구매 의향</p>
            </article>
            <article>
              <span>데이터 거버넌스</span>
              <strong>{bundle.data_governance.status}</strong>
              <p>원문 연락처 표면 {bundle.data_governance.raw_contact_surfaces}개</p>
            </article>
          </div>

          <div className="launchReadinessCheckGrid">
            {gate?.checks.slice(0, 6).map((check) => (
              <article className="launchReadinessCheck" key={`${check.area}-${check.label}`}>
                <div>
                  <span className={`pill ${tone(check.status)}`}>{check.status}</span>
                  <span className="pill muted">{check.area}</span>
                </div>
                <h3>{check.label}</h3>
                <p>{check.metric}</p>
                <small>{check.recommendation}</small>
              </article>
            ))}
          </div>

          <div className="launchReadinessFooter">
            <div>
              <strong>
                <ShieldCheck size={16} />
                필수 액션
              </strong>
              <ul>
                {(gate?.required_actions ?? []).slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>백로그/SLA</strong>
              <ul>
                {bundle.backlog_summary.next_actions.slice(0, 5).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="launchReadinessLoading">
          {status === "loading" ? (
            <>
              <LoaderCircle className="spin" size={18} />
              출시 게이트를 불러오는 중입니다.
            </>
          ) : (
            "출시 게이트를 불러오지 못했습니다. 공개 확대 전 운영 콘솔에서 readiness를 다시 확인하세요."
          )}
        </div>
      )}
    </section>
  );
}
