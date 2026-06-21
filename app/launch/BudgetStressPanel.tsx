"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Copy,
  LoaderCircle,
  Scale,
  ShieldAlert,
} from "lucide-react";
import type { BudgetStressRequest, Category, PublicBudgetStressKit } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  currentBudget: string;
  targetPrice: string;
  referenceGoodPrice: string;
  requiredSpecs: string;
  flexibleSpecs: string;
  blockedConditions: string;
  useCase: string;
  urgency: string;
  canWaitDays: string;
  riskTolerance: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  currentBudget: "2000000",
  targetPrice: "2165000",
  referenceGoodPrice: "2100000",
  requiredSpecs: "RTX 4070 SUPER\n32GB RAM\n국내 AS",
  flexibleSpecs: "케이스 RGB\nSSD 2TB\n조립 옵션",
  blockedConditions: "해외 리퍼\n반품 불가",
  useCase: "QHD 영상 편집과 게임",
  urgency: "이번 주 안에 구매",
  canWaitDays: "21",
  riskTolerance: "보통",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): BudgetStressRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    current_budget_krw: parseNumber(form.currentBudget) ?? 0,
    target_price_krw: parseNumber(form.targetPrice) ?? 0,
    reference_good_price_krw: parseNumber(form.referenceGoodPrice),
    required_specs: lines(form.requiredSpecs),
    flexible_specs: lines(form.flexibleSpecs),
    blocked_conditions: lines(form.blockedConditions),
    use_case: form.useCase,
    urgency: form.urgency,
    can_wait_days: parseNumber(form.canWaitDays) ?? 0,
    risk_tolerance: form.riskTolerance,
    source: "launch_budget_stress",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "ready") {
    return "ok";
  }
  return status === "blocker" || status === "hold" ? "danger" : "warn";
}

function iconFor(status: string) {
  if (status === "ok") {
    return <CheckCircle2 size={15} />;
  }
  if (status === "blocker") {
    return <ShieldAlert size={15} />;
  }
  return <AlertTriangle size={15} />;
}

function won(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  return `${value.toLocaleString("ko-KR")}원`;
}

function signedWon(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("ko-KR")}원`;
}

export function BudgetStressPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicBudgetStressKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/budget-stress-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`budget stress ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicBudgetStressKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("budget stress rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyText(text: string | undefined) {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  const request = payloadFromForm(form);

  return (
    <section className="launchPublicSection launchBudgetStress" id="budget-stress">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Scale size={16} />
            예산 스트레스
          </div>
          <h2>예산을 넘는 후보를 바로 포기하지 않고, 증액·조건 완화·대기 시나리오로 비교합니다.</h2>
          <p>
            현재 예산과 후보 가격 차이를 기준으로 얼마를 더 써야 하는지, 어떤 조건을 낮출 수
            있는지, 며칠 기다릴 가치가 있는지 결제 전 규칙으로 바꿉니다.
          </p>
        </div>
        <span className="pill warn">예산 판단</span>
      </div>

      <div className="launchBudgetStressGrid">
        <article className="launchBudgetStressForm">
          <div className="launchBudgetStressControls">
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
              제품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
          </div>
          <div className="launchBudgetStressControls dense">
            <label>
              현재 예산
              <input inputMode="numeric" value={form.currentBudget} onChange={(event) => update("currentBudget", event.target.value)} />
            </label>
            <label>
              후보 가격
              <input inputMode="numeric" value={form.targetPrice} onChange={(event) => update("targetPrice", event.target.value)} />
            </label>
            <label>
              적정 기준가
              <input inputMode="numeric" value={form.referenceGoodPrice} onChange={(event) => update("referenceGoodPrice", event.target.value)} />
            </label>
          </div>
          <div className="launchBudgetStressControls">
            <label>
              사용 목적
              <input value={form.useCase} onChange={(event) => update("useCase", event.target.value)} />
            </label>
            <label>
              구매 긴급도
              <input value={form.urgency} onChange={(event) => update("urgency", event.target.value)} />
            </label>
          </div>
          <div className="launchBudgetStressControls">
            <label>
              대기 가능일
              <input inputMode="numeric" value={form.canWaitDays} onChange={(event) => update("canWaitDays", event.target.value)} />
            </label>
            <label>
              리스크 허용도
              <select value={form.riskTolerance} onChange={(event) => update("riskTolerance", event.target.value)}>
                <option value="보통">보통</option>
                <option value="낮음">낮음</option>
                <option value="높음">높음</option>
              </select>
            </label>
          </div>
          <div className="launchBudgetStressControls">
            <label>
              필수 조건
              <textarea rows={4} value={form.requiredSpecs} onChange={(event) => update("requiredSpecs", event.target.value)} />
            </label>
            <label>
              조정 가능 조건
              <textarea rows={4} value={form.flexibleSpecs} onChange={(event) => update("flexibleSpecs", event.target.value)} />
            </label>
          </div>
          <label>
            제외 조건
            <textarea rows={3} value={form.blockedConditions} onChange={(event) => update("blockedConditions", event.target.value)} />
          </label>
          <button className="primaryButton" type="button" onClick={() => void buildKit()} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle size={18} /> : <Banknote size={18} />}
            예산 스트레스 테스트
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              예산/조건 스트레스 테스트를 만들지 못했습니다. 예산과 후보 가격을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchBudgetStressResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.baseline_status)}`}>{kit.baseline_status}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchBudgetStressLead">
                <strong>{signedWon(kit.gap_krw)}</strong>
                <span>추천 시나리오 {kit.recommended_scenario_id}</span>
              </div>
              <div className="launchBudgetStressScenarios">
                {kit.scenarios.map((scenario) => (
                  <article className={tone(scenario.status)} key={scenario.scenario_id}>
                    <span>
                      {iconFor(scenario.status)}
                      {scenario.label}
                    </span>
                    <strong>{won(scenario.budget_krw)}</strong>
                    <p>{scenario.expected_tradeoff}</p>
                    <small>잔여 차이 {won(scenario.expected_gap_krw)}</small>
                    <small>{scenario.recommended_action}</small>
                  </article>
                ))}
              </div>
              <div className="launchBudgetStressColumns">
                <div>
                  <strong>결제 규칙</strong>
                  <ul>
                    {kit.decision_rules.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>검색어</strong>
                  <ul>
                    {kit.scenarios
                      .find((item) => item.scenario_id === kit.recommended_scenario_id)
                      ?.search_terms.slice(0, 3)
                      .map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "budget-stress-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: request.current_budget_krw,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "시나리오 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 예산 시나리오를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">예산 초과 방지</span>
              <h3>후보가 예산을 넘을 때는 충동 결제보다 시나리오 비교가 먼저입니다.</h3>
              <p>
                예산 유지, 증액, 조건 완화, 목표가 대기를 같은 기준으로 비교해 구매 실행 전에
                결제 규칙을 확정합니다.
              </p>
              <ul>
                <li>필수 조건과 조정 가능 조건을 분리합니다.</li>
                <li>증액 금액과 조건 완화의 실제 tradeoff를 비교합니다.</li>
                <li>대기 가능한 기간을 목표가 감시 기준으로 연결합니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
