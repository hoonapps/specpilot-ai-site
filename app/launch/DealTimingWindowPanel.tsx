"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  Clock3,
  Copy,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Target,
  Wallet,
} from "lucide-react";
import type {
  Category,
  DealWindow,
  PriceWatchCandidate,
  PublicDealTimingWindow,
  PublicPriceWatchKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type DealTimingWindowPanelProps = {
  timing: PublicDealTimingWindow;
  watchKit: PublicPriceWatchKit;
  isFallback?: boolean;
};

type FormState = {
  category: Category;
  budget: string;
  purpose: string;
};

const purposeOptions = [
  ["qhd_creator", "QHD 게임·영상 편집"],
  ["portable_creator", "휴대형 크리에이터"],
  ["team_office", "팀/사무 구매"],
] as const;

function won(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function tone(status: DealWindow["status"]) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function categoryLabel(category: Category) {
  return category === "laptop" ? "노트북" : "데스크톱 PC";
}

function buildQuery(form: FormState) {
  const params = new URLSearchParams({
    category: form.category,
    budget_krw: String(Number(form.budget.replaceAll(",", "")) || 2_200_000),
    purpose: form.purpose,
  });
  return params.toString();
}

function findLead(data: PublicDealTimingWindow) {
  if (!data.lead_product_id) {
    return data.windows[0] ?? null;
  }
  return data.windows.find((window) => window.product_id === data.lead_product_id) ?? data.windows[0] ?? null;
}

function findPrimaryWatch(data: PublicPriceWatchKit) {
  if (!data.primary_watch_product_id) {
    return data.candidates[0] ?? null;
  }
  return (
    data.candidates.find((candidate) => candidate.product_id === data.primary_watch_product_id) ??
    data.candidates[0] ??
    null
  );
}

function watchLabel(status: PriceWatchCandidate["status"]) {
  if (status === "ok") {
    return "결제 확인";
  }
  return status === "blocker" ? "보류 감시" : "근접 감시";
}

function WatchCandidateCard({ candidate }: { candidate: PriceWatchCandidate }) {
  return (
    <article className="launchDealWatchCard">
      <div className="launchDealWindowHeader">
        <span className={`pill ${tone(candidate.status)}`}>{watchLabel(candidate.status)}</span>
        <small>{candidate.target_gap_krw > 0 ? won(candidate.target_gap_krw) : "조건 확인"}</small>
      </div>
      <h3>{candidate.model_name}</h3>
      <div className="launchDealWindowNumbers">
        <div>
          <span>현재가</span>
          <strong>{won(candidate.current_price_krw)}</strong>
        </div>
        <div>
          <span>알림 기준</span>
          <strong>{won(candidate.alert_threshold_krw)}</strong>
        </div>
      </div>
      <p>{candidate.cadence}</p>
      <p>{candidate.alert_reason}</p>
      <strong>{candidate.decision_rule}</strong>
      <small>{candidate.fallback_action}</small>
    </article>
  );
}

function WindowCard({ window }: { window: DealWindow }) {
  return (
    <article className="launchDealWindowCard">
      <div className="launchDealWindowHeader">
        <span className={`pill ${tone(window.status)}`}>{window.label}</span>
        <small>{window.urgency}</small>
      </div>
      <h3>{window.model_name}</h3>
      <div className="launchDealWindowNumbers">
        <div>
          <span>현재가</span>
          <strong>{won(window.current_price_krw)}</strong>
        </div>
        <div>
          <span>목표가</span>
          <strong>{won(window.target_price_krw)}</strong>
        </div>
        <div>
          <span>적정가</span>
          <strong>{window.fair_price_band_krw}</strong>
        </div>
      </div>
      <p>{window.wait_reason}</p>
      <strong>{window.buy_trigger}</strong>
      <ul>
        {window.monitoring_plan.slice(0, 3).map((plan) => (
          <li key={plan}>{plan}</li>
        ))}
      </ul>
      <small>{window.volatility_risk}</small>
    </article>
  );
}

export function DealTimingWindowPanel({
  timing,
  watchKit,
  isFallback = false,
}: DealTimingWindowPanelProps) {
  const [data, setData] = useState(timing);
  const [watchData, setWatchData] = useState(watchKit);
  const [form, setForm] = useState<FormState>({
    category: timing.category,
    budget: String(timing.budget_krw),
    purpose: timing.purpose,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [watchCopyStatus, setWatchCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const lead = useMemo(() => findLead(data), [data]);
  const primaryWatch = useMemo(() => findPrimaryWatch(watchData), [watchData]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function refresh() {
    setStatus("loading");
    setCopyStatus("idle");
    setWatchCopyStatus("idle");
    try {
      const query = buildQuery(form);
      const [timingResponse, watchResponse] = await Promise.all([
        fetch(`/api/specpilot/deal-timing-window?${query}`),
        fetch(`/api/specpilot/price-watch-kit?${query}`),
      ]);
      if (!timingResponse.ok || !watchResponse.ok) {
        throw new Error(`deal timing ${timingResponse.status} watch ${watchResponse.status}`);
      }
      const timingPayload = (await timingResponse.json()) as {
        ok: boolean;
        timing?: PublicDealTimingWindow;
      };
      const watchPayload = (await watchResponse.json()) as {
        ok: boolean;
        watchKit?: PublicPriceWatchKit;
      };
      if (!timingPayload.ok || !timingPayload.timing || !watchPayload.ok || !watchPayload.watchKit) {
        throw new Error("deal timing rejected");
      }
      setData(timingPayload.timing);
      setWatchData(watchPayload.watchKit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(data.share_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  async function copyWatch() {
    try {
      await navigator.clipboard.writeText(watchData.share_copy);
      setWatchCopyStatus("copied");
    } catch {
      setWatchCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchDealTiming" id="deal-timing">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Clock3 size={16} />
            구매 타이밍 윈도우
          </div>
          <h2>{data.headline}</h2>
          <p>{data.summary}</p>
        </div>
        <span className="pill ok">
          {isFallback ? "타이밍 폴백" : `${categoryLabel(data.category)} ${won(data.budget_krw)}`}
        </span>
      </div>

      <div className="launchDealTimingControls">
        <label>
          카테고리
          <select
            value={form.category}
            onChange={(event) => update("category", event.target.value as Category)}
          >
            <option value="desktop_pc">데스크톱 PC</option>
            <option value="laptop">노트북</option>
          </select>
        </label>
        <label>
          예산
          <input
            inputMode="numeric"
            value={form.budget}
            onChange={(event) => update("budget", event.target.value)}
          />
        </label>
        <label>
          목적
          <select
            value={form.purpose}
            onChange={(event) => update("purpose", event.target.value)}
          >
            {purposeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={refresh} disabled={status === "loading"}>
          {status === "loading" ? (
            <LoaderCircle className="spinIcon" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
          타이밍 갱신
        </button>
      </div>
      {status === "error" ? (
        <p className="launchDealError">구매 타이밍을 불러오지 못했습니다. 잠시 후 다시 시도하세요.</p>
      ) : null}

      <div className="launchDealTimingMetrics">
        <article>
          <Wallet size={16} />
          <span>즉시 결제</span>
          <strong>{data.buy_now_count}개</strong>
        </article>
        <article>
          <BellRing size={16} />
          <span>가격 대기</span>
          <strong>{data.wait_count}개</strong>
        </article>
        <article>
          <ShieldAlert size={16} />
          <span>보류</span>
          <strong>{data.hold_count}개</strong>
        </article>
        <article>
          <Clock3 size={16} />
          <span>목표 절감</span>
          <strong>{won(data.target_savings_krw)}</strong>
        </article>
        <article>
          <Target size={16} />
          <span>알림 후보</span>
          <strong>{watchData.watched_count}개</strong>
        </article>
      </div>

      <div className="launchDealTimingGrid">
        {lead ? (
          <article className="launchDealLead">
            <span>우선 타이밍</span>
            <strong>{lead.model_name}</strong>
            <p>{data.lead_label}</p>
            <div className="launchDealLeadNumbers">
              <div>
                <span>현재가</span>
                <strong>{won(lead.current_price_krw)}</strong>
              </div>
              <div>
                <span>목표가</span>
                <strong>{won(lead.target_price_krw)}</strong>
              </div>
            </div>
            <p>{lead.buy_trigger}</p>
            <small>{lead.urgency} · {lead.volatility_risk}</small>
            <LaunchAnalysisLink
              className="miniCta"
              handoff={{
                source: "deal-timing-window",
                label: data.primary_cta_label,
                query: data.analysis_prefill,
                category: data.category,
                budget_krw: data.budget_krw,
                purpose: data.purpose,
              }}
            >
              {data.primary_cta_label}
            </LaunchAnalysisLink>
          </article>
        ) : null}

        <article className="launchDealCopy">
          <strong>분석 요청 prefill</strong>
          <p>{data.analysis_prefill}</p>
          <strong>목표가 공유 문구</strong>
          <pre>{data.share_copy}</pre>
          <button type="button" onClick={copyShare}>
            <Copy size={15} />
            {copyStatus === "copied"
              ? "복사 완료"
              : copyStatus === "error"
                ? "복사 실패"
                : "공유 문구 복사"}
          </button>
        </article>
      </div>

      <div className="launchDealWatch">
        <article className="launchDealWatchLead">
          <div className="sectionLabel">
            <BellRing size={16} />
            목표가 감시 키트
          </div>
          <h3>{watchData.headline}</h3>
          <p>{watchData.summary}</p>
          {primaryWatch ? (
            <div className="launchDealLeadNumbers">
              <div>
                <span>1순위</span>
                <strong>{primaryWatch.model_name}</strong>
              </div>
              <div>
                <span>알림 기준</span>
                <strong>{won(primaryWatch.alert_threshold_krw)}</strong>
              </div>
            </div>
          ) : null}
          <p>{watchData.alert_script}</p>
          <LaunchAnalysisLink
            className="miniCta"
            handoff={{
              source: "price-watch-kit",
              label: watchData.primary_cta_label,
              query: watchData.analysis_prefill,
              category: watchData.category,
              budget_krw: watchData.budget_krw,
              purpose: watchData.purpose,
            }}
          >
            {watchData.primary_cta_label}
          </LaunchAnalysisLink>
        </article>
        <article className="launchDealCopy">
          <strong>{watchData.primary_watch_label}</strong>
          <p>{watchData.analysis_prefill}</p>
          <strong>목표가 알림 공유 문구</strong>
          <pre>{watchData.share_copy}</pre>
          <button type="button" onClick={copyWatch}>
            <Copy size={15} />
            {watchCopyStatus === "copied"
              ? "복사 완료"
              : watchCopyStatus === "error"
                ? "복사 실패"
                : "알림 문구 복사"}
          </button>
        </article>
      </div>

      <div className="launchDealWatchGrid">
        {watchData.candidates.slice(0, 3).map((candidate) => (
          <WatchCandidateCard key={candidate.product_id} candidate={candidate} />
        ))}
      </div>

      <div className="launchDealWindowGrid">
        {data.windows.map((window) => (
          <WindowCard key={window.product_id} window={window} />
        ))}
      </div>

      <div className="launchDealActions">
        {data.next_actions.slice(0, 4).map((action) => (
          <span key={action}>{action}</span>
        ))}
      </div>
    </section>
  );
}
