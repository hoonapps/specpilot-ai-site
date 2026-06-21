"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Copy,
  LoaderCircle,
  MapPinned,
  Route,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  OpsStatus,
  PublicPurchaseJourneyKit,
  PurchaseJourneyKitRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  buyerQuestion: string;
  productTitle: string;
  sellerName: string;
  listingText: string;
  reviewSnippets: string;
  budget: string;
  finalPrice: string;
  purchaseStage: string;
  readyEvidence: string;
  missingEvidence: string;
  urgency: string;
  shareAudience: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  buyerQuestion: "이 RTX 4070 SUPER 견적 오늘 결제해도 될까요?",
  productTitle: "Creator RTX 4070 SUPER Build",
  sellerName: "PC Mall",
  listingText:
    "RTX 4070 SUPER, Ryzen 7, RAM 32GB, SSD 1TB, Windows 포함, 방문 AS 1년, 반품 7일, 카드 할인 적용",
  reviewSnippets: "팬 소음 언급이 일부 있음\n배송 지연 후기가 있음\n발열은 정상이라는 후기도 많음",
  budget: "2200000",
  finalPrice: "2165000",
  purchaseStage: "checkout",
  readyEvidence: "최종 결제 금액\n옵션명\nAS 조건",
  missingEvidence: "배송 예정일",
  urgency: "오늘 22시 전",
  shareAudience: "family",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function payloadFromForm(form: FormState): PurchaseJourneyKitRequest {
  return {
    category: form.category,
    buyer_question: form.buyerQuestion,
    product_title: form.productTitle,
    seller_name: form.sellerName,
    listing_text: form.listingText,
    review_snippets: lines(form.reviewSnippets),
    budget_krw: parseNumber(form.budget),
    final_price_krw: parseNumber(form.finalPrice),
    purchase_stage: form.purchaseStage,
    ready_evidence: lines(form.readyEvidence),
    missing_evidence: lines(form.missingEvidence),
    urgency: form.urgency,
    share_audience: form.shareAudience,
    source: "launch_purchase_journey",
  };
}

function tone(status: string) {
  if (status === "ok" || status === "done") {
    return "ok";
  }
  return status === "blocker" || status === "blocked" ? "danger" : "warn";
}

function iconFor(status: string) {
  if (status === "ok" || status === "done") {
    return <CheckCircle2 size={15} />;
  }
  if (status === "blocker" || status === "blocked") {
    return <ShieldAlert size={15} />;
  }
  return <AlertTriangle size={15} />;
}

function statusLabel(status: OpsStatus) {
  if (status === "ok") {
    return "진행 가능";
  }
  if (status === "blocker") {
    return "멈춤";
  }
  return "확인 필요";
}

function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    evidence_collection: "증거 수집",
    blocked_risk_review: "위험 확인",
    final_decision: "최종 판정",
    ready_to_execute: "결제 실행",
  };
  return labels[stage] ?? stage;
}

export function PurchaseJourneyPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicPurchaseJourneyKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function buildKit() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/purchase-journey-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`purchase journey ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicPurchaseJourneyKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("purchase journey rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyShare() {
    if (!kit?.share_copy) {
      return;
    }
    try {
      await navigator.clipboard.writeText(kit.share_copy);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <section className="launchPublicSection launchPurchaseJourney" id="purchase-journey">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Route size={16} />
            구매 여정 오케스트레이터
          </div>
          <h2>질문, 상품 정보, 리뷰, 결제 증거를 하나의 구매 경로로 정리합니다.</h2>
          <p>
            첫 질문부터 최종 결제 직전까지 필요한 공개 키트를 순서대로 연결하고, 지금 멈출
            지점과 바로 확인할 항목을 분리합니다.
          </p>
        </div>
        <span className="pill ok">guided path</span>
      </div>

      <div className="launchPurchaseJourneyGrid">
        <article className="launchPurchaseJourneyForm">
          <div className="launchPurchaseJourneyControls">
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
              구매 단계
              <select
                value={form.purchaseStage}
                onChange={(event) => update("purchaseStage", event.target.value)}
              >
                <option value="question">질문 정리</option>
                <option value="listing">상품 페이지 확인</option>
                <option value="cart">장바구니</option>
                <option value="checkout">결제 직전</option>
              </select>
            </label>
          </div>

          <label>
            구매 질문
            <textarea
              rows={2}
              value={form.buyerQuestion}
              onChange={(event) => update("buyerQuestion", event.target.value)}
            />
          </label>

          <div className="launchPurchaseJourneyControls">
            <label>
              제품명
              <input
                value={form.productTitle}
                onChange={(event) => update("productTitle", event.target.value)}
              />
            </label>
            <label>
              판매자
              <input
                value={form.sellerName}
                onChange={(event) => update("sellerName", event.target.value)}
              />
            </label>
          </div>

          <div className="launchPurchaseJourneyControls dense">
            <label>
              예산
              <input
                inputMode="numeric"
                value={form.budget}
                onChange={(event) => update("budget", event.target.value)}
              />
            </label>
            <label>
              최종가
              <input
                inputMode="numeric"
                value={form.finalPrice}
                onChange={(event) => update("finalPrice", event.target.value)}
              />
            </label>
            <label>
              마감
              <input value={form.urgency} onChange={(event) => update("urgency", event.target.value)} />
            </label>
          </div>

          <label>
            상품 페이지 핵심 문구
            <textarea
              rows={4}
              value={form.listingText}
              onChange={(event) => update("listingText", event.target.value)}
            />
          </label>

          <div className="launchPurchaseJourneyControls">
            <label>
              리뷰 요약
              <textarea
                rows={4}
                value={form.reviewSnippets}
                onChange={(event) => update("reviewSnippets", event.target.value)}
              />
            </label>
            <label>
              준비된 증거
              <textarea
                rows={4}
                value={form.readyEvidence}
                onChange={(event) => update("readyEvidence", event.target.value)}
              />
            </label>
          </div>

          <div className="launchPurchaseJourneyControls">
            <label>
              누락 증거
              <textarea
                rows={3}
                value={form.missingEvidence}
                onChange={(event) => update("missingEvidence", event.target.value)}
              />
            </label>
            <label>
              공유 대상
              <select
                value={form.shareAudience}
                onChange={(event) => update("shareAudience", event.target.value)}
              >
                <option value="family">가족/지인</option>
                <option value="team">팀 승인</option>
                <option value="community">커뮤니티</option>
                <option value="self">본인</option>
              </select>
            </label>
          </div>

          <button className="primaryButton" type="button" onClick={buildKit} disabled={status === "loading"}>
            {status === "loading" ? <LoaderCircle size={17} className="spinIcon" /> : <MapPinned size={17} />}
            구매 경로 만들기
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">구매 여정을 만들지 못했습니다. 입력값과 서버 상태를 확인하세요.</p>
          ) : null}
        </article>

        <article className="launchPurchaseJourneyResult" aria-live="polite">
          {kit ? (
            <>
              <div className={`launchPurchaseJourneyScore ${tone(kit.journey_status)}`}>
                <span>{statusLabel(kit.journey_status)}</span>
                <strong>{Math.round(kit.journey_score)}점</strong>
                <small>{stageLabel(kit.current_stage)}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchPurchaseJourneyPrimary">
                <strong>다음 행동</strong>
                <span>{kit.primary_action}</span>
              </div>

              <div className="launchPurchaseJourneySteps">
                {kit.steps.map((step) => (
                  <article className={tone(step.status)} key={step.step_id}>
                    <span>
                      {iconFor(step.status)}
                      {step.order}. {step.label}
                    </span>
                    <strong>{step.next_action}</strong>
                    <small>{step.success_rule}</small>
                  </article>
                ))}
              </div>

              <div className="launchPurchaseJourneyRoutes">
                {kit.route_cards.map((card) => (
                  <article className={tone(card.status)} key={card.route_id}>
                    <span>{card.label}</span>
                    <strong>{card.cta_label}</strong>
                    <small>{card.prefill_hint}</small>
                  </article>
                ))}
              </div>

              <div className="launchPurchaseJourneyColumns">
                <div>
                  <strong>필요 입력</strong>
                  <ul>
                    {kit.required_inputs.slice(0, 6).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>안전 규칙</strong>
                  <ul>
                    {kit.safety_rules.slice(0, 6).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="primaryButton"
                  handoff={{
                    source: "purchase-journey-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: payloadFromForm(form).budget_krw ?? undefined,
                    purpose: "guided_purchase_journey",
                    must_haves: kit.required_inputs.slice(0, 3),
                    exclusions: kit.final_decision_prefill.blocker_reasons,
                  }}
                  eventLabel="launch_purchase_journey_analysis"
                  eventSurface="launch_purchase_journey"
                >
                  분석으로 넘기기
                </LaunchAnalysisLink>
                <button className="secondaryLaunchButton" type="button" onClick={copyShare}>
                  <Copy size={16} />
                  공유 문구 복사
                </button>
              </div>
              {copyStatus === "copied" ? <p className="launchPersonaError success">복사했습니다.</p> : null}
              {copyStatus === "error" ? (
                <p className="launchPersonaError">클립보드 권한이 없어 구매 여정 문구를 복사하지 못했습니다.</p>
              ) : null}
            </>
          ) : (
            <div className="launchPurchaseJourneyEmpty">
              <ClipboardList size={32} />
              <h3>구매 결정을 한 줄 질문에서 실행 순서로 바꿉니다.</h3>
              <p>
                상품 페이지, 리뷰, 예산, 최종가를 넣으면 질문 분류, 리뷰 리스크, 최종 판정까지
                이어지는 공개 키트 경로를 만듭니다.
              </p>
              <ul>
                <li>증거가 부족하면 다음 단계보다 누락 항목을 먼저 보여줍니다.</li>
                <li>리뷰, 반품, AS 위험은 결제 전 확인 단계로 올립니다.</li>
                <li>최종 판정 prefill로 바로 go, verify, hold를 계산합니다.</li>
              </ul>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
