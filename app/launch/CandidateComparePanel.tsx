"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Copy,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type {
  CandidateCompareItem,
  Category,
  PublicCandidateCompare,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type CandidateComparePanelProps = {
  compare: PublicCandidateCompare;
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

function priceGap(value: number) {
  if (value === 0) {
    return "예산 동일";
  }
  return value > 0 ? `+${won(value)}` : `-${won(Math.abs(value))}`;
}

function tone(status: string) {
  if (status === "ok") {
    return "ok";
  }
  return status === "blocker" ? "danger" : "warn";
}

function categoryLabel(category: Category) {
  return category === "laptop" ? "노트북" : "데스크톱 PC";
}

function findItem(compare: PublicCandidateCompare, productId: string | null) {
  if (!productId) {
    return null;
  }
  return compare.items.find((item) => item.product_id === productId) ?? null;
}

function buildQuery(form: FormState) {
  const params = new URLSearchParams({
    category: form.category,
    budget_krw: String(Number(form.budget.replaceAll(",", "")) || 2_200_000),
    purpose: form.purpose,
  });
  return params.toString();
}

function CandidateCard({ item, rank }: { item: CandidateCompareItem; rank: number }) {
  return (
    <article className="launchCandidateCard">
      <div className="launchCandidateCardHeader">
        <span>{String(rank).padStart(2, "0")}</span>
        <span className={`pill ${tone(item.status)}`}>{item.status}</span>
      </div>
      <h3>{item.model_name}</h3>
      <p>{item.role_label}</p>
      <div className="launchCandidateMetrics">
        <div>
          <span>점수</span>
          <strong>{Math.round(item.score)}점</strong>
        </div>
        <div>
          <span>실구매가</span>
          <strong>{won(item.effective_price_krw)}</strong>
        </div>
        <div>
          <span>예산 차이</span>
          <strong>{priceGap(item.price_gap_krw)}</strong>
        </div>
      </div>
      <p>{item.fit_summary}</p>
      <div className="launchCandidateListPair">
        <div>
          <strong>선택 이유</strong>
          <ul>
            {item.reasons.slice(0, 2).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong>주의점</strong>
          <ul>
            {item.watchouts.slice(0, 2).map((watchout) => (
              <li key={watchout}>{watchout}</li>
            ))}
          </ul>
        </div>
      </div>
      <small>{item.option_summary}</small>
    </article>
  );
}

export function CandidateComparePanel({
  compare,
  isFallback = false,
}: CandidateComparePanelProps) {
  const [data, setData] = useState(compare);
  const [form, setForm] = useState<FormState>({
    category: compare.category,
    budget: String(compare.budget_krw),
    purpose: compare.purpose,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const winner = useMemo(
    () => findItem(data, data.winner_product_id) ?? data.items[0] ?? null,
    [data],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function refresh() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch(`/api/specpilot/candidate-compare?${buildQuery(form)}`);
      if (!response.ok) {
        throw new Error(`candidate compare ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        compare?: PublicCandidateCompare;
      };
      if (!payload.ok || !payload.compare) {
        throw new Error("candidate compare rejected");
      }
      setData(payload.compare);
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
    <section className="launchPublicSection launchCandidateCompare" id="candidate-compare">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <BarChart3 size={16} />
            후보 비교 스냅샷
          </div>
          <h2>{data.headline}</h2>
          <p>{data.summary}</p>
        </div>
        <span className="pill ok">
          {isFallback ? "비교표 폴백" : `${categoryLabel(data.category)} ${won(data.budget_krw)}`}
        </span>
      </div>

      <div className="launchCandidateControls">
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
          비교 갱신
        </button>
      </div>
      {status === "error" ? (
        <p className="launchCandidateError">후보 비교를 불러오지 못했습니다. 잠시 후 다시 시도하세요.</p>
      ) : null}

      <div className="launchCandidateCompareGrid">
        {winner ? (
          <article className="launchCandidateLead">
            <div>
              <span>현재 승자 후보</span>
              <strong>{winner.model_name}</strong>
              <p>{data.winner_reason}</p>
            </div>
            <div className="launchCandidateLeadStats">
              <div>
                <TrendingUp size={16} />
                <span>점수</span>
                <strong>{Math.round(winner.score)}점</strong>
              </div>
              <div>
                <Wallet size={16} />
                <span>실구매가</span>
                <strong>{won(winner.effective_price_krw)}</strong>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>상태</span>
                <strong>{winner.status}</strong>
              </div>
            </div>
            <p>{winner.option_summary}</p>
            <LaunchAnalysisLink
              className="miniCta"
              handoff={{
                source: "candidate-compare",
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

        <article className="launchCandidateCopy">
          <strong>분석 요청 prefill</strong>
          <p>{data.analysis_prefill}</p>
          <strong>공유 문구</strong>
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

      <div className="launchCandidateItems">
        {data.items.map((item, index) => (
          <CandidateCard item={item} key={item.product_id} rank={index + 1} />
        ))}
      </div>

      <div className="launchCandidateAxes">
        {data.axes.map((axis) => {
          const axisWinner = findItem(data, axis.winner_product_id);
          return (
            <article key={axis.axis_id}>
              <span>{axis.label}</span>
              <strong>{axisWinner?.model_name ?? "후보 없음"}</strong>
              <p>{axis.summary}</p>
            </article>
          );
        })}
      </div>

      <div className="launchCandidateScenarios">
        {data.scenarios.map((scenario) => (
          <article key={scenario.scenario}>
            <span>{scenario.label}</span>
            <strong>{scenario.model_name}</strong>
            <p>{scenario.why}</p>
            <small>{scenario.tradeoff}</small>
          </article>
        ))}
      </div>

      <div className="launchCandidateActions">
        {data.next_actions.slice(0, 4).map((action) => (
          <span key={action}>{action}</span>
        ))}
      </div>
    </section>
  );
}
