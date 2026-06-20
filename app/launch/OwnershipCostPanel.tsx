"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Copy,
  LoaderCircle,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import type {
  Category,
  OwnershipCostRequest,
  PublicOwnershipCostKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  purchasePrice: string;
  expectedYears: string;
  resaleRate: string;
  yearlyMaintenance: string;
  plannedUpgradeCost: string;
  warrantyMonths: string;
  downtimeDays: string;
  dailyValue: string;
  brandResaleSignal: string;
  conditionRisks: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  purchasePrice: "2185000",
  expectedYears: "3",
  resaleRate: "35",
  yearlyMaintenance: "60000",
  plannedUpgradeCost: "180000",
  warrantyMonths: "24",
  downtimeDays: "1",
  dailyValue: "120000",
  brandResaleSignal: "medium",
  conditionRisks: "",
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

function payloadFromForm(form: FormState): OwnershipCostRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    purchase_price_krw: parseNumber(form.purchasePrice) ?? 0,
    expected_years: parseNumber(form.expectedYears) ?? 3,
    resale_rate_percent: parseNumber(form.resaleRate),
    yearly_maintenance_krw: parseNumber(form.yearlyMaintenance) ?? 0,
    planned_upgrade_cost_krw: parseNumber(form.plannedUpgradeCost) ?? 0,
    warranty_months: parseNumber(form.warrantyMonths) ?? 12,
    downtime_days: parseNumber(form.downtimeDays) ?? 0,
    daily_value_krw: parseNumber(form.dailyValue) ?? 0,
    brand_resale_signal: form.brandResaleSignal,
    condition_risks: lines(form.conditionRisks),
    source: "launch_ownership_cost",
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

function won(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function OwnershipCostPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicOwnershipCostKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/ownership-cost-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`ownership cost ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicOwnershipCostKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("ownership cost rejected");
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

  return (
    <section className="launchPublicSection launchOwnership" id="ownership-cost">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Calculator size={16} />
            총소유비용
          </div>
          <h2>싸게 산 후보가 끝까지 싼지 월 실질 비용과 재판매 가치를 계산합니다.</h2>
          <p>
            구매가, 보유 기간, 유지비, 업그레이드 비용, 다운타임, 보증과 재판매율을 합쳐
            초기 가격 뒤에 숨어 있는 감가 리스크를 결제 전에 분리합니다.
          </p>
        </div>
        <span className="pill warn">재판매 가치</span>
      </div>

      <div className="launchOwnershipGrid">
        <article className="launchOwnershipForm">
          <div className="launchOwnershipControls">
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
          <div className="launchOwnershipControls dense">
            <label>
              구매가
              <input
                inputMode="numeric"
                value={form.purchasePrice}
                onChange={(event) => update("purchasePrice", event.target.value)}
              />
            </label>
            <label>
              보유 연수
              <input
                inputMode="numeric"
                value={form.expectedYears}
                onChange={(event) => update("expectedYears", event.target.value)}
              />
            </label>
            <label>
              재판매율 %
              <input
                inputMode="numeric"
                value={form.resaleRate}
                onChange={(event) => update("resaleRate", event.target.value)}
              />
            </label>
          </div>
          <div className="launchOwnershipControls dense">
            <label>
              연 유지비
              <input
                inputMode="numeric"
                value={form.yearlyMaintenance}
                onChange={(event) => update("yearlyMaintenance", event.target.value)}
              />
            </label>
            <label>
              업그레이드비
              <input
                inputMode="numeric"
                value={form.plannedUpgradeCost}
                onChange={(event) => update("plannedUpgradeCost", event.target.value)}
              />
            </label>
            <label>
              보증 개월
              <input
                inputMode="numeric"
                value={form.warrantyMonths}
                onChange={(event) => update("warrantyMonths", event.target.value)}
              />
            </label>
          </div>
          <div className="launchOwnershipControls dense">
            <label>
              다운타임 일수
              <input
                inputMode="numeric"
                value={form.downtimeDays}
                onChange={(event) => update("downtimeDays", event.target.value)}
              />
            </label>
            <label>
              하루 손실액
              <input
                inputMode="numeric"
                value={form.dailyValue}
                onChange={(event) => update("dailyValue", event.target.value)}
              />
            </label>
            <label>
              재판매 신호
              <select
                value={form.brandResaleSignal}
                onChange={(event) => update("brandResaleSignal", event.target.value)}
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </label>
          </div>
          <label>
            조건 리스크
            <textarea
              rows={3}
              value={form.conditionRisks}
              onChange={(event) => update("conditionRisks", event.target.value)}
              placeholder="해외 병행&#10;리퍼&#10;보증 승계 불명"
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Calculator size={18} />}
            월 실질 비용 계산
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              총소유비용 검수 키트를 만들지 못했습니다. 구매가와 보유 기간을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchOwnershipResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchOwnershipScore">
                <strong>{kit.ownership_score}점</strong>
                <span>총소유비용 기준</span>
              </div>
              <div className="launchOwnershipMetrics">
                <article>
                  <span>월 실질 비용</span>
                  <strong>{won(kit.monthly_cost_krw)}</strong>
                </article>
                <article>
                  <span>순비용</span>
                  <strong>{won(kit.net_cost_krw)}</strong>
                </article>
                <article>
                  <span>예상 재판매가</span>
                  <strong>{won(kit.expected_resale_value_krw)}</strong>
                </article>
              </div>
              <div className="launchOwnershipLineGrid">
                {kit.cost_lines.map((line) => (
                  <article key={line.line_id}>
                    <span>{line.label}</span>
                    <strong>{won(line.amount_krw)}</strong>
                    <p>{line.explanation}</p>
                  </article>
                ))}
              </div>
              <div className="launchOwnershipScenarioGrid">
                {kit.scenarios.map((scenario) => (
                  <article className={scenario.status} key={scenario.scenario_id}>
                    <span>{iconFor(scenario.status)} {scenario.label}</span>
                    <strong>{won(scenario.monthly_cost_krw)} / 월</strong>
                    <p>순비용 {won(scenario.net_cost_krw)} · 재판매 {won(scenario.resale_value_krw)}</p>
                  </article>
                ))}
              </div>
              <div className="launchOwnershipColumns">
                <div>
                  <strong>리스크 플래그</strong>
                  <ul>
                    {kit.risk_flags.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "ownership-cost-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).purchase_price_krw,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "비용 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 총소유비용 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">감가 확인</span>
              <h3>초기 구매가가 낮아도 유지비와 재판매 손실이 크면 더 비쌀 수 있습니다.</h3>
              <p>
                보유 기간 전체의 순비용을 월 단위로 바꿔 후보 비교와 승인 문구에 바로 붙일 수
                있게 만듭니다.
              </p>
              <ul>
                <li>구매가, 유지비, 업그레이드비, 다운타임을 한 비용표로 합칩니다.</li>
                <li>보수적/기준/낙관적 재판매 시나리오를 나눕니다.</li>
                <li>보증 승계와 리퍼/해외 조건 질문을 자동으로 만듭니다.</li>
              </ul>
              <div className="launchOwnershipEmptySignal">
                <TrendingDown size={18} />
                월 실질 비용으로 비교
              </div>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
