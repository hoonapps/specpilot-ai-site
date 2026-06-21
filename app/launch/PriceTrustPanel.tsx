"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Link2,
  LoaderCircle,
  ReceiptText,
  Scale,
  ShieldAlert,
} from "lucide-react";
import type { Category, OpsStatus, PriceTrustRequest, PublicPriceTrustKit } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  reportPrice: string;
  budget: string;
  selectedSellerName: string;
  primarySource: string;
  primarySeller: string;
  primaryPrice: string;
  primaryShipping: string;
  primaryCoupon: string;
  primaryCard: string;
  primaryCapturedMinutes: string;
  primaryStock: string;
  primaryAffiliate: boolean;
  primaryNonAffiliateAvailable: boolean;
  primaryScreenshot: boolean;
  primaryCheckoutVerified: boolean;
  primaryUrlVerified: boolean;
  primaryNotes: string;
  altSource: string;
  altSeller: string;
  altPrice: string;
  altCapturedMinutes: string;
  altStock: string;
  altScreenshot: boolean;
  altCheckoutVerified: boolean;
  altUrlVerified: boolean;
  altNotes: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  productTitle: "Creator RTX 4070 SUPER Build",
  reportPrice: "2165000",
  budget: "2200000",
  selectedSellerName: "PC Mall",
  primarySource: "가격비교",
  primarySeller: "PC Mall",
  primaryPrice: "2165000",
  primaryShipping: "10000",
  primaryCoupon: "40000",
  primaryCard: "20000",
  primaryCapturedMinutes: "18",
  primaryStock: "8",
  primaryAffiliate: true,
  primaryNonAffiliateAvailable: true,
  primaryScreenshot: true,
  primaryCheckoutVerified: true,
  primaryUrlVerified: true,
  primaryNotes: "국내 AS 24개월\n반품 14일",
  altSource: "공식몰",
  altSeller: "Official Store",
  altPrice: "2190000",
  altCapturedMinutes: "22",
  altStock: "12",
  altScreenshot: true,
  altCheckoutVerified: true,
  altUrlVerified: true,
  altNotes: "공식몰\n국내 AS",
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

function payloadFromForm(form: FormState): PriceTrustRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    report_price_krw: parseNumber(form.reportPrice),
    budget_krw: parseNumber(form.budget),
    selected_seller_name: form.selectedSellerName,
    candidates: [
      {
        source_name: form.primarySource,
        seller_name: form.primarySeller,
        product_title: form.productTitle,
        listed_price_krw: parseNumber(form.primaryPrice) ?? 0,
        shipping_fee_krw: parseNumber(form.primaryShipping) ?? 0,
        coupon_discount_krw: parseNumber(form.primaryCoupon) ?? 0,
        card_discount_krw: parseNumber(form.primaryCard) ?? 0,
        point_rebate_krw: 0,
        captured_minutes_ago: parseNumber(form.primaryCapturedMinutes),
        stock_count: parseNumber(form.primaryStock),
        affiliate_link: form.primaryAffiliate,
        non_affiliate_available: form.primaryNonAffiliateAvailable,
        screenshot_captured: form.primaryScreenshot,
        checkout_price_verified: form.primaryCheckoutVerified,
        url_verified: form.primaryUrlVerified,
        condition_notes: lines(form.primaryNotes),
      },
      {
        source_name: form.altSource,
        seller_name: form.altSeller,
        product_title: form.productTitle,
        listed_price_krw: parseNumber(form.altPrice) ?? 0,
        shipping_fee_krw: 0,
        coupon_discount_krw: 0,
        card_discount_krw: 0,
        point_rebate_krw: 0,
        captured_minutes_ago: parseNumber(form.altCapturedMinutes),
        stock_count: parseNumber(form.altStock),
        affiliate_link: false,
        non_affiliate_available: true,
        screenshot_captured: form.altScreenshot,
        checkout_price_verified: form.altCheckoutVerified,
        url_verified: form.altUrlVerified,
        condition_notes: lines(form.altNotes),
      },
    ],
    source: "launch_price_trust",
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

export function PriceTrustPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicPriceTrustKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/price-trust-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`price trust ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicPriceTrustKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("price trust rejected");
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
    <section className="launchPublicSection launchPriceTrust" id="price-trust">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Scale size={16} />
            가격 신뢰 검증
          </div>
          <h2>최신 가격과 제휴 중립성을 결제 전에 증명합니다.</h2>
          <p>
            가격 캡처 시각, 복수 출처, 제휴/비제휴 대안, 결제 화면 총액 증거를 묶어
            공유 가능한 가격 proof를 만듭니다.
          </p>
        </div>
        <span className="pill ok">price proof</span>
      </div>

      <div className="launchPriceTrustGrid">
        <article className="launchPriceTrustForm">
          <div className="launchPriceTrustControls">
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
              선택 판매자
              <input
                value={form.selectedSellerName}
                onChange={(event) => update("selectedSellerName", event.target.value)}
              />
            </label>
          </div>
          <label>
            제품명
            <input value={form.productTitle} onChange={(event) => update("productTitle", event.target.value)} />
          </label>
          <div className="launchPriceTrustControls">
            <label>
              리포트 가격
              <input inputMode="numeric" value={form.reportPrice} onChange={(event) => update("reportPrice", event.target.value)} />
            </label>
            <label>
              예산
              <input inputMode="numeric" value={form.budget} onChange={(event) => update("budget", event.target.value)} />
            </label>
          </div>
          <div className="launchPriceTrustSource">
            <strong>선택 가격 출처</strong>
            <div className="launchPriceTrustControls dense">
              <label>
                출처
                <input value={form.primarySource} onChange={(event) => update("primarySource", event.target.value)} />
              </label>
              <label>
                판매자
                <input value={form.primarySeller} onChange={(event) => update("primarySeller", event.target.value)} />
              </label>
              <label>
                표시가
                <input inputMode="numeric" value={form.primaryPrice} onChange={(event) => update("primaryPrice", event.target.value)} />
              </label>
            </div>
            <div className="launchPriceTrustControls dense">
              <label>
                배송비
                <input inputMode="numeric" value={form.primaryShipping} onChange={(event) => update("primaryShipping", event.target.value)} />
              </label>
              <label>
                쿠폰
                <input inputMode="numeric" value={form.primaryCoupon} onChange={(event) => update("primaryCoupon", event.target.value)} />
              </label>
              <label>
                카드 할인
                <input inputMode="numeric" value={form.primaryCard} onChange={(event) => update("primaryCard", event.target.value)} />
              </label>
            </div>
            <div className="launchPriceTrustControls dense">
              <label>
                캡처 분 전
                <input inputMode="numeric" value={form.primaryCapturedMinutes} onChange={(event) => update("primaryCapturedMinutes", event.target.value)} />
              </label>
              <label>
                재고
                <input inputMode="numeric" value={form.primaryStock} onChange={(event) => update("primaryStock", event.target.value)} />
              </label>
              <label>
                조건 메모
                <input value={form.primaryNotes} onChange={(event) => update("primaryNotes", event.target.value)} />
              </label>
            </div>
            <div className="launchPriceTrustSwitches">
              <label>
                <input type="checkbox" checked={form.primaryAffiliate} onChange={(event) => update("primaryAffiliate", event.target.checked)} />
                제휴 링크
              </label>
              <label>
                <input type="checkbox" checked={form.primaryNonAffiliateAvailable} onChange={(event) => update("primaryNonAffiliateAvailable", event.target.checked)} />
                비제휴 대안
              </label>
              <label>
                <input type="checkbox" checked={form.primaryScreenshot} onChange={(event) => update("primaryScreenshot", event.target.checked)} />
                상품 캡처
              </label>
              <label>
                <input type="checkbox" checked={form.primaryCheckoutVerified} onChange={(event) => update("primaryCheckoutVerified", event.target.checked)} />
                결제 총액
              </label>
              <label>
                <input type="checkbox" checked={form.primaryUrlVerified} onChange={(event) => update("primaryUrlVerified", event.target.checked)} />
                URL 확인
              </label>
            </div>
          </div>

          <div className="launchPriceTrustSource muted">
            <strong>비교 출처</strong>
            <div className="launchPriceTrustControls dense">
              <label>
                출처
                <input value={form.altSource} onChange={(event) => update("altSource", event.target.value)} />
              </label>
              <label>
                판매자
                <input value={form.altSeller} onChange={(event) => update("altSeller", event.target.value)} />
              </label>
              <label>
                표시가
                <input inputMode="numeric" value={form.altPrice} onChange={(event) => update("altPrice", event.target.value)} />
              </label>
            </div>
            <div className="launchPriceTrustControls dense">
              <label>
                캡처 분 전
                <input inputMode="numeric" value={form.altCapturedMinutes} onChange={(event) => update("altCapturedMinutes", event.target.value)} />
              </label>
              <label>
                재고
                <input inputMode="numeric" value={form.altStock} onChange={(event) => update("altStock", event.target.value)} />
              </label>
              <label>
                조건 메모
                <input value={form.altNotes} onChange={(event) => update("altNotes", event.target.value)} />
              </label>
            </div>
            <div className="launchPriceTrustSwitches compact">
              <label>
                <input type="checkbox" checked={form.altScreenshot} onChange={(event) => update("altScreenshot", event.target.checked)} />
                상품 캡처
              </label>
              <label>
                <input type="checkbox" checked={form.altCheckoutVerified} onChange={(event) => update("altCheckoutVerified", event.target.checked)} />
                결제 총액
              </label>
              <label>
                <input type="checkbox" checked={form.altUrlVerified} onChange={(event) => update("altUrlVerified", event.target.checked)} />
                URL 확인
              </label>
            </div>
          </div>

          <button className="primaryButton" type="button" onClick={() => void buildKit()} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle size={18} /> : <ReceiptText size={18} />}
            가격 신뢰 검증
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              가격 신뢰 검증 키트를 만들지 못했습니다. 가격과 캡처 시각을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchPriceTrustResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchPriceTrustScore">
                <span className={`pill ${tone(kit.trust_status)}`}>{kit.trust_status}</span>
                <strong>{kit.trust_score}</strong>
                <small>선택가 {won(kit.selected_effective_price_krw)} · 리포트 대비 {won(kit.report_price_delta_krw)}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchPriceTrustCandidates">
                {kit.candidates.map((candidate) => (
                  <article className={tone(candidate.status)} key={candidate.candidate_id}>
                    <span>{iconFor(candidate.status)} {candidate.source_name}</span>
                    <strong>{candidate.seller_name} · {won(candidate.effective_price_krw)}</strong>
                    <small>{candidate.freshness_label}</small>
                    <p>{candidate.evidence}</p>
                    <em>{candidate.recommendation}</em>
                  </article>
                ))}
              </div>
              <div className="launchPriceTrustChecks">
                {kit.checks.map((check) => (
                  <article className={tone(check.status)} key={check.check_id}>
                    <span>{iconFor(check.status)} {check.label}</span>
                    <strong>{check.finding}</strong>
                    <p>{check.action}</p>
                  </article>
                ))}
              </div>
              <div className="launchPriceTrustWarning">
                <Link2 size={18} />
                <p>{kit.buyer_warning}</p>
              </div>
              <div className="launchPriceTrustColumns">
                <div>
                  <strong>공개 고지</strong>
                  <ul>
                    {kit.disclosure_notes.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>증거 체크</strong>
                  <ul>
                    {kit.evidence_checklist.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "price-trust-kit",
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
                  {copyStatus === "copied" ? "복사됨" : "가격 proof 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 가격 신뢰 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill ok">최신 가격 proof</span>
              <h3>가격이 싸 보여도 캡처가 오래됐거나 제휴 대안이 없으면 신뢰가 떨어집니다.</h3>
              <p>
                상품 페이지, 장바구니, 결제 직전 총액을 같은 기준으로 묶고 제휴 여부와 비제휴 대안을
                같이 보여줍니다.
              </p>
              <ul>
                <li>45분 이내 가격 캡처와 결제 화면 총액을 확인합니다.</li>
                <li>가격비교와 공식몰처럼 복수 출처를 비교합니다.</li>
                <li>제휴 링크는 비제휴 대안과 고지 문구 없이는 proof로 쓰지 않습니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
