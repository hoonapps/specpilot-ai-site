"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  Loader2,
  Share2,
} from "lucide-react";
import type {
  Category,
  MistakeCostCalculatorResult,
  PublicMistakeCostCalculator,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type CalculatorEnvelope = {
  ok: boolean;
  calculator?: PublicMistakeCostCalculator;
  error?: string;
};

type ResultEnvelope = {
  ok: boolean;
  result?: MistakeCostCalculatorResult;
  error?: string;
};

const categoryLabel = {
  desktop_pc: "데스크톱 PC",
  laptop: "노트북",
};

const urgencyOptions = [
  { value: "low", label: "여유 있음" },
  { value: "normal", label: "일반" },
  { value: "urgent", label: "이번 주 구매" },
  { value: "team_rollout", label: "팀 지급 일정" },
];

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function MistakeCostCalculatorPanel() {
  const [calculator, setCalculator] = useState<PublicMistakeCostCalculator | null>(null);
  const [category, setCategory] = useState<Category>("desktop_pc");
  const [budget, setBudget] = useState(2_200_000);
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState("normal");
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [result, setResult] = useState<MistakeCostCalculatorResult | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    let cancelled = false;

    async function loadCalculator() {
      try {
        const response = await fetch("/api/specpilot/mistake-cost-calculator", {
          cache: "no-store",
        });
        const payload = (await response.json()) as CalculatorEnvelope;
        if (!response.ok || !payload.ok || !payload.calculator) {
          throw new Error(payload.error ?? "구매 실패 비용 계산기를 불러오지 못했습니다.");
        }
        if (cancelled) {
          return;
        }
        const defaultRisks = payload.calculator.risk_options
          .slice(0, 3)
          .map((option) => option.risk_id);
        setCalculator(payload.calculator);
        setCategory(payload.calculator.default_category);
        setBudget(payload.calculator.default_budget_krw);
        setQuantity(payload.calculator.default_quantity);
        setSelectedRisks(defaultRisks);
        setStatus("ready");
        void estimateCost({
          category: payload.calculator.default_category,
          budget_krw: payload.calculator.default_budget_krw,
          quantity: payload.calculator.default_quantity,
          urgency: "normal",
          selected_risks: defaultRisks,
          source: "launch_page_initial",
        });
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "구매 실패 비용 계산기를 불러오지 못했습니다.",
          );
        }
      }
    }

    loadCalculator();

    return () => {
      cancelled = true;
    };
  }, []);

  async function estimateCost(payload?: {
    category: Category;
    budget_krw: number;
    quantity: number;
    urgency: string;
    selected_risks: string[];
    source: string;
  }) {
    const request = payload ?? {
      category,
      budget_krw: budget,
      quantity,
      urgency,
      selected_risks: selectedRisks,
      source: "launch_page",
    };
    setStatus("submitting");
    setMessage("");
    setCopyStatus("idle");

    try {
      const response = await fetch("/api/specpilot/mistake-cost-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      const payload = (await response.json()) as ResultEnvelope;
      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.error ?? "구매 실패 비용을 계산하지 못했습니다.");
      }
      setResult(payload.result);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "구매 실패 비용을 계산하지 못했습니다.",
      );
    }
  }

  function toggleRisk(riskId: string) {
    setSelectedRisks((current) =>
      current.includes(riskId)
        ? current.filter((item) => item !== riskId)
        : [...current, riskId],
    );
  }

  async function copyShareText() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.share_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <section className="launchPublicSection launchMistakeCost" id="mistake-cost">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Calculator size={16} />
            구매 실패 비용 계산기
          </div>
          <h2>{calculator?.headline ?? "잘못 산 컴퓨터의 숨은 비용을 먼저 봅니다"}</h2>
          <p>
            {calculator?.summary ??
              "예산과 걱정되는 실패 유형을 고르면 성능 부족, 반품, 승인 지연, 가격 타이밍 손실을 금액으로 환산합니다."}
          </p>
        </div>
        <span className={`pill ${result?.risk_level === "blocker" ? "danger" : "warn"}`}>
          {result ? `${Math.round(result.risk_score)}점` : "무료 계산"}
        </span>
      </div>

      {message ? <p className="launchPersonaError">{message}</p> : null}

      <div className="launchMistakeCostGrid">
        <article className="launchMistakeCostForm">
          <div className="launchMistakeControls">
            <label>
              카테고리
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as Category)}
              >
                <option value="desktop_pc">데스크톱 PC</option>
                <option value="laptop">노트북</option>
              </select>
            </label>
            <label>
              예산
              <input
                min={300000}
                step={100000}
                type="number"
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
              />
            </label>
            <label>
              수량
              <input
                min={1}
                max={200}
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </label>
            <label>
              긴급도
              <select value={urgency} onChange={(event) => setUrgency(event.target.value)}>
                {urgencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="launchMistakeRiskList">
            {calculator?.risk_options.map((option) => (
              <button
                className={selectedRisks.includes(option.risk_id) ? "active" : ""}
                key={option.risk_id}
                type="button"
                aria-pressed={selectedRisks.includes(option.risk_id)}
                onClick={() => toggleRisk(option.risk_id)}
              >
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>

          <button
            className="primaryButton"
            type="button"
            onClick={() => void estimateCost()}
            disabled={status === "loading" || status === "submitting"}
          >
            {status === "submitting" ? (
              <Loader2 className="spinIcon" size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            실패 비용 다시 계산
          </button>
        </article>

        <article className="launchMistakeCostResult" aria-live="polite">
          {result ? (
            <>
              <span className={`pill ${result.risk_level === "blocker" ? "danger" : "warn"}`}>
                {result.risk_level}
              </span>
              <h3>{result.headline}</h3>
              <p>{result.summary}</p>
              <div className="launchMistakeCostNumbers">
                <div>
                  <span>예상 실패 비용</span>
                  <strong>{formatWon(result.estimated_mistake_cost_krw)}</strong>
                </div>
                <div>
                  <span>보호할 구매 금액</span>
                  <strong>{formatWon(result.protected_value_krw)}</strong>
                </div>
                <div>
                  <span>구매 조건</span>
                  <strong>
                    {categoryLabel[result.category]} {result.quantity}대
                  </strong>
                </div>
              </div>
              <div className="launchMistakeLineItems">
                {result.line_items.map((item) => (
                  <div key={item.item_id}>
                    <strong>{item.label}</strong>
                    <span>{formatWon(item.estimated_cost_krw)}</span>
                    <p>{item.prevention}</p>
                  </div>
                ))}
              </div>
              <div className="launchPersonaPrefill">
                <span>분석 폼에 붙여 넣을 요청</span>
                <p>{result.analysis_prefill}</p>
              </div>
              <div className="launchPersonaActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "mistake-cost-calculator",
                    label: result.primary_cta_label,
                    query: result.analysis_prefill,
                    category: result.category,
                    budget_krw: result.budget_krw,
                    purpose: result.urgency,
                  }}
                >
                  {result.primary_cta_label}
                  <ArrowRight size={16} />
                </LaunchAnalysisLink>
                <button type="button" onClick={copyShareText}>
                  <Share2 size={16} />
                  {copyStatus === "copied"
                    ? "복사 완료"
                    : copyStatus === "failed"
                      ? "복사 실패"
                      : "계산 결과 공유"}
                </button>
              </div>
            </>
          ) : (
            <div className="launchPersonaLoading">
              <Loader2 size={18} />
              계산 결과를 준비하는 중
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
