"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  Copy,
  LoaderCircle,
  SearchCheck,
  ShieldAlert,
} from "lucide-react";
import type { Category, DealSanityRequest, PublicDealSanityKit } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  sellerName: string;
  listedPrice: string;
  referencePrice: string;
  lowestSeenPrice: string;
  budget: string;
  shippingFee: string;
  couponDiscount: string;
  cardDiscount: string;
  pointRebate: string;
  warrantyMonths: string;
  returnWindowDays: string;
  stockCount: string;
  discountExpiresHours: string;
  sellerRatingPercent: string;
  reviewCount: string;
  riskTerms: string;
  evidenceText: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  listedPrice: "2165000",
  referencePrice: "2350000",
  lowestSeenPrice: "2100000",
  budget: "2200000",
  shippingFee: "0",
  couponDiscount: "40000",
  cardDiscount: "20000",
  pointRebate: "0",
  warrantyMonths: "24",
  returnWindowDays: "14",
  stockCount: "8",
  discountExpiresHours: "48",
  sellerRatingPercent: "97.5",
  reviewCount: "180",
  riskTerms: "카드 할인",
  evidenceText: "국내 AS 24개월, 반품 14일, 새상품",
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

function payloadFromForm(form: FormState): DealSanityRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    listed_price_krw: parseNumber(form.listedPrice) ?? 0,
    reference_price_krw: parseNumber(form.referencePrice),
    lowest_seen_price_krw: parseNumber(form.lowestSeenPrice),
    budget_krw: parseNumber(form.budget),
    shipping_fee_krw: parseNumber(form.shippingFee) ?? 0,
    coupon_discount_krw: parseNumber(form.couponDiscount) ?? 0,
    card_discount_krw: parseNumber(form.cardDiscount) ?? 0,
    point_rebate_krw: parseNumber(form.pointRebate) ?? 0,
    warranty_months: parseNumber(form.warrantyMonths),
    return_window_days: parseNumber(form.returnWindowDays),
    stock_count: parseNumber(form.stockCount),
    discount_expires_hours: parseNumber(form.discountExpiresHours),
    seller_rating_percent: parseNumber(form.sellerRatingPercent),
    review_count: parseNumber(form.reviewCount),
    risk_terms: lines(form.riskTerms),
    evidence_text: form.evidenceText,
    source: "launch_deal_sanity",
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

function rate(value: number | null) {
  if (value === null) {
    return "미입력";
  }
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString("ko-KR")}%`;
}

export function DealSanityPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicDealSanityKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/deal-sanity-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`deal sanity ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicDealSanityKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("deal sanity rejected");
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
    <section className="launchPublicSection launchDealSanity" id="deal-sanity">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <BadgePercent size={16} />
            특가 검수
          </div>
          <h2>컴퓨터와 노트북 특가가 진짜 절약인지, 결제 전에 안전 조건까지 확인합니다.</h2>
          <p>
            기준가, 최근 최저가, 쿠폰/카드 조건, 보증/반품, 판매자 평판을 묶어 가짜 할인과
            리퍼/해외/반품 불가 위험을 결제 실행 전에 걸러냅니다.
          </p>
        </div>
        <span className="pill warn">딜 안전성</span>
      </div>

      <div className="launchDealSanityGrid">
        <article className="launchDealSanityForm">
          <div className="launchDealSanityControls">
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
          </div>
          <div className="launchDealSanityControls">
            <label>
              제품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              표시가
              <input inputMode="numeric" value={form.listedPrice} onChange={(event) => update("listedPrice", event.target.value)} />
            </label>
          </div>
          <div className="launchDealSanityControls dense">
            <label>
              기준가
              <input inputMode="numeric" value={form.referencePrice} onChange={(event) => update("referencePrice", event.target.value)} />
            </label>
            <label>
              최근 최저가
              <input inputMode="numeric" value={form.lowestSeenPrice} onChange={(event) => update("lowestSeenPrice", event.target.value)} />
            </label>
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
          </div>
          <div className="launchDealSanityControls dense">
            <label>
              배송비
              <input inputMode="numeric" value={form.shippingFee} onChange={(event) => update("shippingFee", event.target.value)} />
            </label>
            <label>
              쿠폰
              <input inputMode="numeric" value={form.couponDiscount} onChange={(event) => update("couponDiscount", event.target.value)} />
            </label>
            <label>
              카드 할인
              <input inputMode="numeric" value={form.cardDiscount} onChange={(event) => update("cardDiscount", event.target.value)} />
            </label>
          </div>
          <div className="launchDealSanityControls dense">
            <label>
              포인트
              <input inputMode="numeric" value={form.pointRebate} onChange={(event) => update("pointRebate", event.target.value)} />
            </label>
            <label>
              보증 개월
              <input inputMode="numeric" value={form.warrantyMonths} onChange={(event) => update("warrantyMonths", event.target.value)} />
            </label>
            <label>
              반품 일수
              <input inputMode="numeric" value={form.returnWindowDays} onChange={(event) => update("returnWindowDays", event.target.value)} />
            </label>
          </div>
          <div className="launchDealSanityControls dense">
            <label>
              재고
              <input inputMode="numeric" value={form.stockCount} onChange={(event) => update("stockCount", event.target.value)} />
            </label>
            <label>
              만료 시간
              <input inputMode="numeric" value={form.discountExpiresHours} onChange={(event) => update("discountExpiresHours", event.target.value)} />
            </label>
            <label>
              판매자 평점
              <input inputMode="decimal" value={form.sellerRatingPercent} onChange={(event) => update("sellerRatingPercent", event.target.value)} />
            </label>
          </div>
          <div className="launchDealSanityControls">
            <label>
              리뷰 수
              <input inputMode="numeric" value={form.reviewCount} onChange={(event) => update("reviewCount", event.target.value)} />
            </label>
            <label>
              위험 문구
              <textarea
                rows={3}
                value={form.riskTerms}
                onChange={(event) => update("riskTerms", event.target.value)}
                placeholder={"해외\n리퍼\n반품 불가"}
              />
            </label>
          </div>
          <label>
            증거 문구
            <textarea
              rows={3}
              value={form.evidenceText}
              onChange={(event) => update("evidenceText", event.target.value)}
            />
          </label>
          <button className="primaryButton" type="button" onClick={() => void buildKit()} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle size={18} /> : <SearchCheck size={18} />}
            특가 안전성 검수
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              특가 안전성 키트를 만들지 못했습니다. 가격과 보증/반품 입력값을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchDealSanityResult" aria-live="polite">
          {kit ? (
            <>
              <span className={`pill ${tone(kit.deal_status)}`}>{kit.deal_status}</span>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchDealSanityScore">
                <strong>{kit.sanity_score}점</strong>
                <span>실구매가 {won(kit.effective_price_krw)} · 절감률 {rate(kit.savings_rate_percent)}</span>
              </div>
              <div className="launchDealSanityMetrics">
                <article>
                  <span>절감액</span>
                  <strong>{won(kit.savings_krw)}</strong>
                </article>
                <article>
                  <span>기준가</span>
                  <strong>{won(kit.price_prefill.expected_report_price_krw)}</strong>
                </article>
                <article>
                  <span>결제 중단 규칙</span>
                  <strong>{kit.checkout_stop_rules.length}개</strong>
                </article>
              </div>
              <div className="launchDealSanityFlags">
                {kit.sanity_flags.map((flag) => (
                  <article className={tone(flag.status)} key={flag.flag_id}>
                    <span>
                      {iconFor(flag.status)}
                      {flag.label}
                    </span>
                    <p>{flag.evidence}</p>
                    <small>{flag.recommendation}</small>
                  </article>
                ))}
              </div>
              <div className="launchDealSanityColumns">
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>중단 규칙</strong>
                  <ul>
                    {kit.checkout_stop_rules.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "deal-sanity-kit",
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
                  {copyStatus === "copied" ? "복사됨" : "검수 요약 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 특가 검수 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">가짜 할인 방지</span>
              <h3>특가처럼 보이는 가격도 조건부 할인, 리퍼, 해외, 반품 불가면 결제 전에 막아야 합니다.</h3>
              <p>
                가격비교에서 찾은 후보를 기준가와 결제 조건까지 같이 검수해 실구매가 분해와 구매
                실행 단계로 넘깁니다.
              </p>
              <ul>
                <li>기준가 대비 절감률과 최근 최저가 차이를 같이 봅니다.</li>
                <li>보증, 반품, 판매자 평판, 재고, 만료 시간을 위험 플래그로 바꿉니다.</li>
                <li>blocker가 남아 있으면 결제 실행으로 넘어가지 않도록 중단 규칙을 만듭니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
