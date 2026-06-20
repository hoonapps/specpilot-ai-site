"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, LoaderCircle, MousePointerClick, RefreshCw, Sparkles } from "lucide-react";
import type {
  Category,
  LaunchExperiment,
  LaunchExperimentDashboard,
  LaunchExperimentVariant,
} from "../types";

type Status = "idle" | "loading" | "seeding" | "recording" | "error";

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function tone(status: string) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function normalizePath(path: string) {
  if (path === "/" || path === "/#start-concierge" || path === "#start-concierge") {
    return "/launch#start-concierge";
  }
  if (path.startsWith("#")) {
    return `/launch${path}`;
  }
  return path;
}

function winnerFor(experiment: LaunchExperiment | null) {
  if (!experiment) {
    return null;
  }
  if (experiment.winning_variant_id) {
    return (
      experiment.variants.find((variant) => variant.variant_id === experiment.winning_variant_id) ??
      experiment.variants[0] ??
      null
    );
  }
  return [...experiment.variants].sort(
    (left, right) =>
      right.conversion_rate - left.conversion_rate ||
      right.conversions - left.conversions ||
      right.impressions - left.impressions,
  )[0] ?? null;
}

export function LaunchExperimentStrip() {
  const [dashboard, setDashboard] = useState<LaunchExperimentDashboard | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const impressionKey = useRef<string | null>(null);
  const activeExperiment = useMemo(
    () => dashboard?.experiments[0] ?? dashboard?.recommended_experiments[0] ?? null,
    [dashboard],
  );
  const activeVariant = useMemo(() => winnerFor(activeExperiment), [activeExperiment]);

  async function loadDashboard(nextStatus: Status = "loading") {
    setStatus(nextStatus);
    try {
      const response = await fetch("/api/specpilot/launch-experiments?limit=8");
      if (!response.ok) {
        throw new Error(`launch experiment ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        dashboard?: LaunchExperimentDashboard;
      };
      if (!payload.ok || !payload.dashboard) {
        throw new Error("launch experiment rejected");
      }
      setDashboard(payload.dashboard);
      setMessage("");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("CTA 실험 대시보드를 불러오지 못했습니다.");
    }
  }

  async function seedExperiment(category: Category | "all" = "desktop_pc") {
    setStatus("seeding");
    try {
      const response = await fetch("/api/specpilot/launch-experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seed_experiment",
          category,
          limit: 8,
        }),
      });
      if (!response.ok) {
        throw new Error(`seed experiment ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        dashboard?: LaunchExperimentDashboard;
      };
      if (!payload.ok || !payload.dashboard) {
        throw new Error("seed experiment rejected");
      }
      setDashboard(payload.dashboard);
      setMessage("샘플 CTA 실험을 만들고 초기 노출/전환 이벤트를 반영했습니다.");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("CTA 실험 생성에 실패했습니다.");
    }
  }

  async function recordEvent(
    eventType: "impression" | "conversion",
    experiment: LaunchExperiment,
    variant: LaunchExperimentVariant,
    label: string,
  ) {
    if (eventType === "impression" && impressionKey.current === variant.variant_id) {
      return;
    }
    if (eventType === "impression") {
      impressionKey.current = variant.variant_id;
    }
    setStatus(eventType === "conversion" ? "recording" : "idle");
    try {
      const response = await fetch("/api/specpilot/launch-experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_event",
          experiment_id: experiment.experiment_id,
          variant_id: variant.variant_id,
          event_type: eventType,
          source: "site-launch-page",
          surface: "launch-hero-cta-strip",
          label,
          limit: 8,
          metadata: {
            cta_label: variant.cta_label,
            cta_path: normalizePath(variant.cta_path),
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`record experiment ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        dashboard?: LaunchExperimentDashboard;
      };
      if (!payload.ok || !payload.dashboard) {
        throw new Error("record experiment rejected");
      }
      setDashboard(payload.dashboard);
      setStatus("idle");
      if (eventType === "conversion") {
        setMessage("CTA 전환 이벤트를 기록했습니다.");
      }
    } catch {
      setStatus("error");
      setMessage("CTA 이벤트 기록에 실패했습니다.");
    }
  }

  useEffect(() => {
    void loadDashboard("loading");
  }, []);

  useEffect(() => {
    if (activeExperiment && activeVariant) {
      void recordEvent(
        "impression",
        activeExperiment,
        activeVariant,
        `${activeVariant.label} 런칭 페이지 노출`,
      );
    }
  }, [activeExperiment?.experiment_id, activeVariant?.variant_id]);

  async function handleCtaClick() {
    if (activeExperiment && activeVariant) {
      await recordEvent(
        "conversion",
        activeExperiment,
        activeVariant,
        `${activeVariant.label} 런칭 페이지 CTA 클릭`,
      );
    }
    if (activeVariant) {
      window.location.href = normalizePath(activeVariant.cta_path);
    }
  }

  const variants = activeExperiment?.variants ?? [];

  return (
    <section className="launchPublicSection launchExperimentStrip" id="launch-cta-experiment">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <BarChart3 size={16} />
            CTA 실험 스트립
          </div>
          <h2>공개 페이지의 첫 CTA를 실제 노출과 전환으로 고릅니다.</h2>
          <p>
            구매 실패 방지 메시지와 빠른 진단 메시지를 같은 표면에서 비교하고,
            방문자의 클릭을 출시 실험 허브와 성장 퍼널에 바로 남깁니다.
          </p>
        </div>
        <span className={`pill ${dashboard ? tone(dashboard.status) : "muted"}`}>
          {dashboard ? percent(dashboard.conversion_rate) : "실험 조회 중"}
        </span>
      </div>

      <div className="launchExperimentStripGrid">
        <article className="launchExperimentWinner">
          {activeVariant ? (
            <>
              <span className={`pill ${tone(activeVariant.status)}`}>
                {dashboard?.best_variant_label || activeVariant.label}
              </span>
              <h3>{activeVariant.headline}</h3>
              <p>{activeVariant.body}</p>
              <div className="launchExperimentWinnerStats">
                <div>
                  <span>노출</span>
                  <strong>{activeVariant.impressions}</strong>
                </div>
                <div>
                  <span>전환</span>
                  <strong>{activeVariant.conversions}</strong>
                </div>
                <div>
                  <span>전환율</span>
                  <strong>{percent(activeVariant.conversion_rate)}</strong>
                </div>
              </div>
              <button type="button" onClick={handleCtaClick} disabled={status === "recording"}>
                {status === "recording" ? (
                  <LoaderCircle className="spinIcon" size={16} />
                ) : (
                  <MousePointerClick size={16} />
                )}
                {activeVariant.cta_label}
              </button>
              <small>{activeVariant.recommendation}</small>
            </>
          ) : (
            <>
              <span className="pill warn">실험 없음</span>
              <h3>런칭 페이지 CTA 실험을 아직 시작하지 않았습니다.</h3>
              <p>
                샘플 실험을 만들면 노출과 전환 이벤트가 들어가고, 공개 페이지에서
                승자 후보 CTA를 바로 사용할 수 있습니다.
              </p>
              <button type="button" onClick={() => seedExperiment("desktop_pc")} disabled={status === "seeding"}>
                {status === "seeding" ? (
                  <LoaderCircle className="spinIcon" size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                CTA 실험 시작
              </button>
            </>
          )}
        </article>

        <div className="launchExperimentVariantGrid">
          {(variants.length
            ? variants
            : [
                {
                  variant_id: "fallback-risk",
                  label: "구매 실패 방지",
                  headline: "컴퓨터 견적, 결제 전에 실패 가능성을 줄이세요",
                  body: "가격 타이밍, 호환성, 옵션 검수까지 한 번에 확인합니다.",
                  cta_label: "구매 전 검수하기",
                  cta_path: "/launch#start-concierge",
                  allocation_percent: 50,
                  impressions: 0,
                  conversions: 0,
                  conversion_rate: 0,
                  status: "warning" as const,
                  evidence: "실험 시작 전",
                  recommendation: "샘플 실험을 생성해 첫 데이터를 쌓으세요.",
                },
                {
                  variant_id: "fallback-fast",
                  label: "3분 빠른 진단",
                  headline: "컴퓨터 견적 고민을 3분 안에 줄이세요",
                  body: "용도와 예산을 넣으면 후보와 가격 대기 여부를 보여줍니다.",
                  cta_label: "3분 진단 시작",
                  cta_path: "/launch#start-concierge",
                  allocation_percent: 50,
                  impressions: 0,
                  conversions: 0,
                  conversion_rate: 0,
                  status: "warning" as const,
                  evidence: "실험 시작 전",
                  recommendation: "비교 문구로 유지하세요.",
                },
              ]
          ).map((variant) => (
            <article key={variant.variant_id}>
              <div>
                <span className={`pill ${tone(variant.status)}`}>{variant.label}</span>
                <small>{variant.allocation_percent}%</small>
              </div>
              <strong>{variant.headline}</strong>
              <p>{variant.body}</p>
              <small>
                {variant.impressions} 노출 · {variant.conversions} 전환 ·{" "}
                {percent(variant.conversion_rate)}
              </small>
            </article>
          ))}
        </div>
      </div>

      <div className="launchExperimentStripFooter">
        <button type="button" onClick={() => loadDashboard("loading")} disabled={status === "loading"}>
          {status === "loading" ? (
            <LoaderCircle className="spinIcon" size={15} />
          ) : (
            <RefreshCw size={15} />
          )}
          실험 새로고침
        </button>
        <button type="button" onClick={() => seedExperiment("desktop_pc")} disabled={status === "seeding"}>
          <Sparkles size={15} />
          샘플 실험 생성
        </button>
        <span>{message || dashboard?.summary || "CTA 실험 데이터를 불러오는 중입니다."}</span>
      </div>
    </section>
  );
}
