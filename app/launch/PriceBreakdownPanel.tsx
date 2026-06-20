"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Copy,
  LoaderCircle,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PriceBreakdownRequest,
  PublicPriceBreakdownKit,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  listedPrice: string;
  quantity: string;
  shippingFee: string;
  assemblyFee: string;
  osFee: string;
  couponDiscount: string;
  cardDiscount: string;
  pointRebate: string;
  budget: string;
  expectedReportPrice: string;
  discountExpiresHours: string;
  stockCount: string;
  riskTerms: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  listedPrice: "2185000",
  quantity: "1",
  shippingFee: "10000",
  assemblyFee: "30000",
  osFee: "0",
  couponDiscount: "40000",
  cardDiscount: "20000",
  pointRebate: "0",
  budget: "2200000",
  expectedReportPrice: "2185000",
  discountExpiresHours: "72",
  stockCount: "8",
  riskTerms: "카드 할인",
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

function payloadFromForm(form: FormState): PriceBreakdownRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    listed_price_krw: parseNumber(form.listedPrice) ?? 0,
    quantity: parseNumber(form.quantity) ?? 1,
    shipping_fee_krw: parseNumber(form.shippingFee) ?? 0,
    assembly_fee_krw: parseNumber(form.assemblyFee) ?? 0,
    os_fee_krw: parseNumber(form.osFee) ?? 0,
    coupon_discount_krw: parseNumber(form.couponDiscount) ?? 0,
    card_discount_krw: parseNumber(form.cardDiscount) ?? 0,
    point_rebate_krw: parseNumber(form.pointRebate) ?? 0,
    budget_krw: parseNumber(form.budget),
    expected_report_price_krw: parseNumber(form.expectedReportPrice),
    discount_expires_hours: parseNumber(form.discountExpiresHours),
    stock_count: parseNumber(form.stockCount),
    risk_terms: lines(form.riskTerms),
    source: "launch_price_breakdown",
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

function signed(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("ko-KR")}원`;
}

export function PriceBreakdownPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicPriceBreakdownKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/price-breakdown-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`price breakdown ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicPriceBreakdownKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("price breakdown rejected");
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
    <section className="launchPublicSection launchPriceBreakdown" id="price-breakdown">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <ReceiptText size={16} />
            실구매가
          </div>
          <h2>표시가와 최종 결제 금액 사이의 배송비, 조립비, 쿠폰 착시를 분해합니다.</h2>
          <p>
            결제 화면의 비용과 할인 항목을 넣으면 최종 실구매가, 예산 차이, 리포트 예상가
            차이를 계산하고 캡처해야 할 증거를 정리합니다.
          </p>
        </div>
        <span className="pill warn">최종 결제</span>
      </div>

      <div className="launchPriceBreakdownGrid">
        <article className="launchPriceBreakdownForm">
          <div className="launchPriceBreakdownControls">
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
          <div className="launchPriceBreakdownControls">
            <label>
              제품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              표시가
              <input
                inputMode="numeric"
                value={form.listedPrice}
                onChange={(event) => update("listedPrice", event.target.value)}
              />
            </label>
          </div>
          <div className="launchPriceBreakdownControls dense">
            <label>
              수량
              <input inputMode="numeric" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} />
            </label>
            <label>
              배송비
              <input
                inputMode="numeric"
                value={form.shippingFee}
                onChange={(event) => update("shippingFee", event.target.value)}
              />
            </label>
            <label>
              조립비
              <input
                inputMode="numeric"
                value={form.assemblyFee}
                onChange={(event) => update("assemblyFee", event.target.value)}
              />
            </label>
          </div>
          <div className="launchPriceBreakdownControls dense">
            <label>
              OS 비용
              <input inputMode="numeric" value={form.osFee} onChange={(event) => update("osFee", event.target.value)} />
            </label>
            <label>
              쿠폰
              <input
                inputMode="numeric"
                value={form.couponDiscount}
                onChange={(event) => update("couponDiscount", event.target.value)}
              />
            </label>
            <label>
              카드 할인
              <input
                inputMode="numeric"
                value={form.cardDiscount}
                onChange={(event) => update("cardDiscount", event.target.value)}
              />
            </label>
          </div>
          <div className="launchPriceBreakdownControls dense">
            <label>
              포인트
              <input
                inputMode="numeric"
                value={form.pointRebate}
                onChange={(event) => update("pointRebate", event.target.value)}
              />
            </label>
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
            <label>
              리포트 예상가
              <input
                inputMode="numeric"
                value={form.expectedReportPrice}
                onChange={(event) => update("expectedReportPrice", event.target.value)}
              />
            </label>
          </div>
          <div className="launchPriceBreakdownControls">
            <label>
              할인 만료 시간
              <input
                inputMode="numeric"
                value={form.discountExpiresHours}
                onChange={(event) => update("discountExpiresHours", event.target.value)}
              />
            </label>
            <label>
              재고 수량
              <input
                inputMode="numeric"
                value={form.stockCount}
                onChange={(event) => update("stockCount", event.target.value)}
              />
            </label>
          </div>
          <label>
            조건/위험 문구
            <textarea
              rows={3}
              value={form.riskTerms}
              onChange={(event) => update("riskTerms", event.target.value)}
              placeholder={"앱전용\n청구 할인\n선착순"}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void buildKit()}
            disabled={status === "loading"}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Calculator size={18} />}
            실구매가 분해
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              실구매가 분해 키트를 만들지 못했습니다. 표시가와 할인 항목을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchPriceBreakdownResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.priority)}`}>{kit.priority}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchPriceBreakdownScore">
                <strong>{won(kit.effective_price_krw)}</strong>
                <span>가격 점수 {kit.price_score}점 · 개당 {won(kit.per_unit_price_krw)}</span>
              </div>
              <div className="launchPriceBreakdownMetrics">
                <article>
                  <span>예산 차이</span>
                  <strong>{signed(kit.budget_delta_krw)}</strong>
                </article>
                <article>
                  <span>리포트 차이</span>
                  <strong>{signed(kit.report_price_delta_krw)}</strong>
                </article>
                <article>
                  <span>표시가 합계</span>
                  <strong>{won(kit.subtotal_krw)}</strong>
                </article>
              </div>
              <div className="launchPriceBreakdownLineGrid">
                {kit.price_lines.map((line) => (
                  <article className={line.kind} key={line.line_id}>
                    <span>{line.label}</span>
                    <strong>{won(line.amount_krw)}</strong>
                    <p>{line.explanation}</p>
                  </article>
                ))}
              </div>
              <div className="launchPriceBreakdownColumns">
                <div>
                  <strong>리스크</strong>
                  <ul>
                    {kit.risk_flags.slice(0, 4).map((item) => (
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
              <div className="launchPriceBreakdownQuestions">
                <strong>판매자 질문</strong>
                <ul>
                  {kit.seller_questions.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "price-breakdown-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw ?? undefined,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "가격 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 실구매가 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">가격 착시</span>
              <h3>표시가만 보고 결제하면 배송비, OS, 쿠폰 조건 때문에 예산이 틀어집니다.</h3>
              <p>
                최종 결제 화면의 금액 구성 요소를 분해해 리포트 예상가와 실제 결제 금액 차이를
                바로 확인합니다.
              </p>
              <ul>
                <li>배송비, 조립비, OS 비용을 표시가와 분리합니다.</li>
                <li>쿠폰, 카드 할인, 포인트 환급을 최종 실구매가에 반영합니다.</li>
                <li>할인 만료와 재고 부족을 가격 리스크로 표시합니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
