"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Copy, LoaderCircle, Megaphone, RefreshCw } from "lucide-react";
import type { LaunchDistributionPlan, LaunchDistributionSlot, OpsStatus } from "../types";

type Status = "idle" | "loading" | "error";

function tone(status: OpsStatus) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

async function recordShareCopy(slot: LaunchDistributionSlot) {
  await fetch("/api/specpilot/growth-funnel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        event_type: "share_cta",
        source: "specpilot-launch-page",
        surface: "launch-distribution-plan",
        label: `${slot.channel} 배포 문구 복사`,
        metadata: {
          slot_id: slot.slot_id,
          channel: slot.channel,
          phase: slot.phase,
          cta_path: slot.cta_path,
        },
      },
      limit: 20,
    }),
  });
}

export function LaunchDistributionPlanPanel() {
  const [plan, setPlan] = useState<LaunchDistributionPlan | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [copyStatus, setCopyStatus] = useState("idle");

  async function loadPlan(nextStatus: Status = "loading") {
    setStatus(nextStatus);
    try {
      const response = await fetch(
        "/api/specpilot/launch-distribution-plan?category=desktop_pc&audience=creator&limit=8",
      );
      if (!response.ok) {
        throw new Error(`launch distribution ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        plan?: LaunchDistributionPlan;
      };
      if (!payload.ok || !payload.plan) {
        throw new Error("launch distribution rejected");
      }
      setPlan(payload.plan);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copySlot(slot: LaunchDistributionSlot) {
    try {
      await navigator.clipboard.writeText(slot.copy_text);
      setCopyStatus(slot.slot_id);
      await recordShareCopy(slot);
    } catch {
      setCopyStatus("error");
    }
  }

  useEffect(() => {
    void loadPlan("loading");
  }, []);

  return (
    <section className="launchPublicSection launchPublicDistribution">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Megaphone size={16} />
            첫 주 배포 플랜
          </div>
          <h2>오픈 직후 어디에 어떤 문구로 공유할지 바로 정합니다</h2>
          <p>
            런칭 키트, 공개 전환 보드, CTA 실험, 추천 대기열 신호를 합쳐
            커뮤니티·검색·추천 채널의 배포 순서와 복사 문구를 보여줍니다.
          </p>
        </div>
        <button
          className="launchDistributionRefresh"
          type="button"
          disabled={status === "loading"}
          onClick={() => void loadPlan("loading")}
        >
          {status === "loading" ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <RefreshCw size={17} />
          )}
          갱신
        </button>
      </div>

      {plan ? (
        <div className="launchDistributionSummary">
          <article>
            <span className={`pill ${tone(plan.status)}`}>{plan.status}</span>
            <strong>{Math.round(plan.distribution_score)}점</strong>
            <p>{plan.headline}</p>
          </article>
          <article>
            <span className="pill muted">배포 기간</span>
            <strong>{plan.launch_window}</strong>
            <p>{plan.priority_channels.join(" · ")}</p>
          </article>
          <article>
            <span className="pill ok">대표 CTA</span>
            <strong>{plan.primary_cta}</strong>
            <p>{plan.experiment_to_promote || "승자 후보 CTA를 계속 측정합니다."}</p>
          </article>
        </div>
      ) : (
        <div className="launchDistributionEmpty">
          {status === "error"
            ? "첫 주 배포 플랜을 불러오지 못했습니다."
            : "첫 주 배포 플랜을 불러오는 중입니다."}
        </div>
      )}

      {plan ? (
        <>
          <div className="launchDistributionPublicGrid">
            {plan.slots.slice(0, 4).map((slot) => (
              <article className="launchDistributionPublicSlot" key={slot.slot_id}>
                <div>
                  <span className={`pill ${tone(slot.status)}`}>{slot.phase}</span>
                  <span className="pill muted">{slot.channel}</span>
                  <span className="pill ok">우선순위 {slot.priority}</span>
                </div>
                <h3>{slot.headline}</h3>
                <p>{slot.body}</p>
                <dl>
                  <div>
                    <dt>타이밍</dt>
                    <dd>{slot.timing}</dd>
                  </div>
                  <div>
                    <dt>성공 지표</dt>
                    <dd>{slot.success_metric}</dd>
                  </div>
                </dl>
                <ul>
                  {slot.proof_to_attach.slice(0, 2).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button type="button" onClick={() => void copySlot(slot)}>
                  <Copy size={16} />
                  {copyStatus === slot.slot_id ? "복사 완료" : `${slot.cta_label} 복사`}
                </button>
              </article>
            ))}
          </div>

          <div className="launchDistributionGuardrails">
            <div>
              <strong>
                <CalendarDays size={16} />
                측정 이벤트
              </strong>
              <ul>
                {plan.measurement_events.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>위험 통제</strong>
              <ul>
                {plan.risk_controls.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>다음 액션</strong>
              <ul>
                {plan.next_actions.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {copyStatus === "error" ? (
                <p>복사에 실패했습니다. 브라우저 권한을 확인하세요.</p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
