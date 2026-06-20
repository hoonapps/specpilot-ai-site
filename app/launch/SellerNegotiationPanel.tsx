"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Handshake,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicSellerNegotiationKit,
  SellerNegotiationRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  currentPrice: string;
  targetPrice: string;
  budget: string;
  competingPrice: string;
  shippingFee: string;
  assemblyFee: string;
  osFee: string;
  desiredShipDays: string;
  stockCount: string;
  urgency: string;
  riskTerms: string;
  mustKeepConditions: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  currentPrice: "2165000",
  targetPrice: "2100000",
  budget: "2200000",
  competingPrice: "2120000",
  shippingFee: "10000",
  assemblyFee: "30000",
  osFee: "0",
  desiredShipDays: "2",
  stockCount: "8",
  urgency: "within_7_days",
  riskTerms: "카드 할인",
  mustKeepConditions: "실제 출고 사양\n국내 AS\n반품 7일",
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

function payloadFromForm(form: FormState): SellerNegotiationRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    current_price_krw: parseNumber(form.currentPrice) ?? 0,
    target_price_krw: parseNumber(form.targetPrice),
    budget_krw: parseNumber(form.budget),
    competing_price_krw: parseNumber(form.competingPrice),
    shipping_fee_krw: parseNumber(form.shippingFee) ?? 0,
    assembly_fee_krw: parseNumber(form.assemblyFee) ?? 0,
    os_fee_krw: parseNumber(form.osFee) ?? 0,
    desired_ship_days: parseNumber(form.desiredShipDays),
    stock_count: parseNumber(form.stockCount),
    urgency: form.urgency,
    risk_terms: lines(form.riskTerms),
    must_keep_conditions: lines(form.mustKeepConditions),
    source: "launch_seller_negotiation",
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

export function SellerNegotiationPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicSellerNegotiationKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/seller-negotiation-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`seller negotiation ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicSellerNegotiationKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("seller negotiation rejected");
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
    <section className="launchPublicSection launchSellerNegotiation" id="seller-negotiation">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Handshake size={16} />
            판매자 조건 협상
          </div>
          <h2>가격을 낮춰도 사양, 배송, AS 조건이 흐려지지 않게 협상합니다.</h2>
          <p>
            현재가, 목표가, 경쟁가, 추가 비용, 재고, 위험 조건을 넣으면 제안가와 판매자에게
            보낼 조건 안전 메시지를 만듭니다.
          </p>
        </div>
        <span className="pill warn">조건 고정</span>
      </div>

      <div className="launchSellerNegotiationGrid">
        <article className="launchSellerNegotiationForm">
          <div className="launchSellerNegotiationControls">
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
              <input value={form.sellerName} onChange={(event) => update("sellerName", event.target.value)} />
            </label>
            <label>
              긴급도
              <select value={form.urgency} onChange={(event) => update("urgency", event.target.value)}>
                <option value="within_7_days">7일 내</option>
                <option value="within_24h">24시간 내</option>
                <option value="today">오늘</option>
                <option value="flexible">여유 있음</option>
              </select>
            </label>
          </div>
          <label>
            후보명
            <input value={form.productTitle} onChange={(event) => update("productTitle", event.target.value)} />
          </label>
          <div className="launchSellerNegotiationControls dense">
            <label>
              현재가
              <input inputMode="numeric" value={form.currentPrice} onChange={(event) => update("currentPrice", event.target.value)} />
            </label>
            <label>
              목표가
              <input inputMode="numeric" value={form.targetPrice} onChange={(event) => update("targetPrice", event.target.value)} />
            </label>
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              경쟁가
              <input inputMode="numeric" value={form.competingPrice} onChange={(event) => update("competingPrice", event.target.value)} />
            </label>
          </div>
          <div className="launchSellerNegotiationControls dense">
            <label>
              배송비
              <input inputMode="numeric" value={form.shippingFee} onChange={(event) => update("shippingFee", event.target.value)} />
            </label>
            <label>
              조립비
              <input inputMode="numeric" value={form.assemblyFee} onChange={(event) => update("assemblyFee", event.target.value)} />
            </label>
            <label>
              OS 비용
              <input inputMode="numeric" value={form.osFee} onChange={(event) => update("osFee", event.target.value)} />
            </label>
            <label>
              재고
              <input inputMode="numeric" value={form.stockCount} onChange={(event) => update("stockCount", event.target.value)} />
            </label>
          </div>
          <div className="launchSellerNegotiationControls">
            <label>
              희망 출고일
              <input
                inputMode="numeric"
                value={form.desiredShipDays}
                onChange={(event) => update("desiredShipDays", event.target.value)}
              />
            </label>
            <label>
              위험 조건
              <textarea rows={3} value={form.riskTerms} onChange={(event) => update("riskTerms", event.target.value)} />
            </label>
          </div>
          <label>
            반드시 유지할 조건
            <textarea
              rows={3}
              value={form.mustKeepConditions}
              onChange={(event) => update("mustKeepConditions", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Handshake size={18} />}
            협상 메시지 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              판매자 조건 협상 키트를 만들지 못했습니다. 가격과 조건 입력값을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchSellerNegotiationResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchSellerNegotiationScore">
                <strong>{kit.negotiation_score}점</strong>
                <span>제안가 {won(kit.fair_offer_krw)} · 예상 절감 {won(kit.expected_saving_krw)}</span>
              </div>
              <div className="launchSellerNegotiationMetrics">
                <article>
                  <span>상한가</span>
                  <strong>{won(kit.max_acceptable_price_krw)}</strong>
                </article>
                <article>
                  <span>판매자</span>
                  <strong>{kit.seller_name}</strong>
                </article>
              </div>
              <div className="launchSellerNegotiationLevers">
                {kit.levers.map((lever) => (
                  <article className={tone(lever.priority)} key={lever.lever_id}>
                    <span className={`pill ${tone(lever.priority)}`}>
                      {iconFor(lever.priority)}
                      {lever.label}
                    </span>
                    <strong>{lever.ask}</strong>
                    <p>예상 가치 {won(lever.expected_value_krw)}</p>
                    <small>{lever.proof_to_attach}</small>
                  </article>
                ))}
              </div>
              <div className="launchSellerNegotiationColumns">
                <div>
                  <strong>Guardrail</strong>
                  <ul>
                    {kit.guardrails.map((guardrail) => (
                      <li key={guardrail}>{guardrail}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>증거</strong>
                  <ul>
                    {kit.evidence_checklist.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSellerNegotiationShare">
                {kit.message_variants.map((message) => (
                  <button
                    key={message.channel}
                    type="button"
                    onClick={() => void copyText(message.copy_text)}
                  >
                    <Copy size={15} />
                    <span>{message.label}</span>
                  </button>
                ))}
              </div>
              <div className="launchSellerNegotiationActions">
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={15} />
                  협상 요약 복사
                </button>
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "seller-negotiation-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw ?? 2200000,
                    purpose: "seller_negotiation",
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
              </div>
              {copyStatus === "copied" ? <small>복사했습니다.</small> : null}
              {copyStatus === "error" ? <small>복사 권한을 확인하세요.</small> : null}
            </>
          ) : (
            <div className="launchSellerNegotiationEmpty">
              <Handshake size={32} />
              <strong>조건이 약해지는 할인은 실패 비용입니다.</strong>
              <p>제안가와 유지 조건을 함께 보내고, 답변은 구매 실행 패키지 증거로 남기세요.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
