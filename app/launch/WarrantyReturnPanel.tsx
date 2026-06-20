"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type {
  Category,
  PublicWarrantyReturnKit,
  WarrantyReturnRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  purchasePrice: string;
  returnWindowDays: string;
  exchangeWindowDays: string;
  deadOnArrivalDays: string;
  warrantyMonths: string;
  openedBoxReturnAllowed: string;
  warrantyProvider: string;
  warrantyTransferable: string;
  returnShippingFee: string;
  restockingFeePercent: string;
  policyText: string;
  riskTerms: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  purchasePrice: "2185000",
  returnWindowDays: "14",
  exchangeWindowDays: "14",
  deadOnArrivalDays: "7",
  warrantyMonths: "24",
  openedBoxReturnAllowed: "yes",
  warrantyProvider: "manufacturer",
  warrantyTransferable: "yes",
  returnShippingFee: "10000",
  restockingFeePercent: "0",
  policyText: "국내 제조사 AS, 초기 불량 교환 가능",
  riskTerms: "",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseBool(value: string): boolean | null {
  if (value === "yes") {
    return true;
  }
  if (value === "no") {
    return false;
  }
  return null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): WarrantyReturnRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    purchase_price_krw: parseNumber(form.purchasePrice) ?? 0,
    return_window_days: parseNumber(form.returnWindowDays) ?? 0,
    exchange_window_days: parseNumber(form.exchangeWindowDays) ?? 0,
    dead_on_arrival_days: parseNumber(form.deadOnArrivalDays) ?? 0,
    warranty_months: parseNumber(form.warrantyMonths) ?? 0,
    opened_box_return_allowed: parseBool(form.openedBoxReturnAllowed),
    warranty_provider: form.warrantyProvider,
    warranty_transferable: parseBool(form.warrantyTransferable),
    return_shipping_fee_krw: parseNumber(form.returnShippingFee) ?? 0,
    restocking_fee_percent: parseNumber(form.restockingFeePercent) ?? 0,
    policy_text: form.policyText,
    risk_terms: lines(form.riskTerms),
    source: "launch_warranty_return",
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

export function WarrantyReturnPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicWarrantyReturnKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/warranty-return-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`warranty return ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicWarrantyReturnKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("warranty return rejected");
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
    <section className="launchPublicSection launchWarranty" id="warranty-return">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ShieldCheck size={16} />
            보증/반품
          </div>
          <h2>결제 전에 반품 불가, 개봉 제한, 해외 AS 같은 약관 리스크를 분리합니다.</h2>
          <p>
            판매자 약관과 답변을 붙여 넣으면 반품/교환 기간, 초기 불량 예외, 보증 주체,
            반품 비용을 보호 점수와 판매자 질문으로 바꿉니다.
          </p>
        </div>
        <span className="pill ok">결제 방어</span>
      </div>

      <div className="launchWarrantyGrid">
        <article className="launchWarrantyForm">
          <div className="launchWarrantyControls">
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
              판매자
              <input
                value={form.sellerName}
                onChange={(event) => update("sellerName", event.target.value)}
              />
            </label>
          </div>
          <div className="launchWarrantyControls">
            <label>
              제품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              구매가
              <input
                inputMode="numeric"
                value={form.purchasePrice}
                onChange={(event) => update("purchasePrice", event.target.value)}
              />
            </label>
          </div>
          <div className="launchWarrantyControls dense">
            <label>
              반품 일수
              <input
                inputMode="numeric"
                value={form.returnWindowDays}
                onChange={(event) => update("returnWindowDays", event.target.value)}
              />
            </label>
            <label>
              교환 일수
              <input
                inputMode="numeric"
                value={form.exchangeWindowDays}
                onChange={(event) => update("exchangeWindowDays", event.target.value)}
              />
            </label>
            <label>
              초기 불량 일수
              <input
                inputMode="numeric"
                value={form.deadOnArrivalDays}
                onChange={(event) => update("deadOnArrivalDays", event.target.value)}
              />
            </label>
          </div>
          <div className="launchWarrantyControls dense">
            <label>
              보증 개월
              <input
                inputMode="numeric"
                value={form.warrantyMonths}
                onChange={(event) => update("warrantyMonths", event.target.value)}
              />
            </label>
            <label>
              개봉 후 반품
              <select
                value={form.openedBoxReturnAllowed}
                onChange={(event) => update("openedBoxReturnAllowed", event.target.value)}
              >
                <option value="unknown">불명</option>
                <option value="yes">가능</option>
                <option value="no">제한</option>
              </select>
            </label>
            <label>
              보증 승계
              <select
                value={form.warrantyTransferable}
                onChange={(event) => update("warrantyTransferable", event.target.value)}
              >
                <option value="unknown">불명</option>
                <option value="yes">가능</option>
                <option value="no">불가</option>
              </select>
            </label>
          </div>
          <div className="launchWarrantyControls dense">
            <label>
              보증 주체
              <select
                value={form.warrantyProvider}
                onChange={(event) => update("warrantyProvider", event.target.value)}
              >
                <option value="manufacturer">제조사</option>
                <option value="seller">판매자</option>
                <option value="importer">수입사/병행</option>
                <option value="unknown">불명</option>
              </select>
            </label>
            <label>
              반품 배송비
              <input
                inputMode="numeric"
                value={form.returnShippingFee}
                onChange={(event) => update("returnShippingFee", event.target.value)}
              />
            </label>
            <label>
              재입고 %
              <input
                inputMode="numeric"
                value={form.restockingFeePercent}
                onChange={(event) => update("restockingFeePercent", event.target.value)}
              />
            </label>
          </div>
          <label>
            약관/판매자 답변
            <textarea
              rows={3}
              value={form.policyText}
              onChange={(event) => update("policyText", event.target.value)}
            />
          </label>
          <label>
            위험 문구
            <textarea
              rows={3}
              value={form.riskTerms}
              onChange={(event) => update("riskTerms", event.target.value)}
              placeholder={"반품 불가\n개봉 후 반품 불가\nAS 불가"}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <ShieldCheck size={18} />}
            보증/반품 정책 검수
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              보증/반품 정책 검수 키트를 만들지 못했습니다. 반품 기간과 약관 입력을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchWarrantyResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchWarrantyScore">
                <strong>{kit.protection_score}점</strong>
                <span>예상 반품 비용 {won(kit.estimated_return_cost_krw)}</span>
              </div>
              <div className="launchWarrantyCheckGrid">
                {kit.policy_checks.map((check) => (
                  <article className={check.status} key={check.check_id}>
                    <span>{iconFor(check.status)} {check.label}</span>
                    <p>{check.finding}</p>
                    <small>{check.recommendation}</small>
                  </article>
                ))}
              </div>
              <div className="launchWarrantyCostGrid">
                {kit.cost_lines.map((line) => (
                  <article key={line.line_id}>
                    <span>{line.label}</span>
                    <strong>{won(line.amount_krw)}</strong>
                    <p>{line.explanation}</p>
                  </article>
                ))}
              </div>
              <div className="launchWarrantyColumns">
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>증거 체크리스트</strong>
                  <ul>
                    {kit.evidence_checklist.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchWarrantyMessage">
                <strong>판매자 문의 문구</strong>
                <p>{kit.buyer_message}</p>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "warranty-return-kit",
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
                  {copyStatus === "copied" ? "복사됨" : "정책 요약 복사"}
                </button>
                <button type="button" onClick={() => void copyText(kit.buyer_message)}>
                  <Copy size={16} />
                  문의 문구 복사
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 보증/반품 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill ok">AS/반품</span>
              <h3>좋은 가격이어도 반품 불가와 해외 AS가 있으면 결제를 멈춰야 합니다.</h3>
              <p>
                약관과 판매자 답변을 결제 전 보호 점수로 바꾸고, 캡처해야 할 증거와 문의 문구를
                바로 만듭니다.
              </p>
              <ul>
                <li>반품/교환/초기 불량 기간을 분리합니다.</li>
                <li>개봉 후 반품 제한과 공식 AS 여부를 체크합니다.</li>
                <li>반품 배송비와 재입고 수수료를 비용으로 계산합니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
