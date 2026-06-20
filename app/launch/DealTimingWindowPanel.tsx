"use client";

import { useMemo, useState } from "react";
import {
  BellRing,
  Clock3,
  Copy,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import type { Category, DealWindow, PublicDealTimingWindow } from "../types";

type DealTimingWindowPanelProps = {
  timing: PublicDealTimingWindow;
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
  isFallback = false,
}: DealTimingWindowPanelProps) {
  const [data, setData] = useState(timing);
  const [form, setForm] = useState<FormState>({
    category: timing.category,
    budget: String(timing.budget_krw),
    purpose: timing.purpose,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const lead = useMemo(() => findLead(data), [data]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function refresh() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch(`/api/specpilot/deal-timing-window?${buildQuery(form)}`);
      if (!response.ok) {
        throw new Error(`deal timing ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        timing?: PublicDealTimingWindow;
      };
      if (!payload.ok || !payload.timing) {
        throw new Error("deal timing rejected");
      }
      setData(payload.timing);
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
            <a className="miniCta" href={data.primary_cta_path}>
              {data.primary_cta_label}
            </a>
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
