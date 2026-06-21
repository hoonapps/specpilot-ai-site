"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  MessageSquareQuote,
  Route,
  ShieldAlert,
} from "lucide-react";
import type {
  Category,
  PublicPurchaseQuestionTriageKit,
  PurchaseQuestionTriageRequest,
} from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  buyerQuestion: string;
  productTitle: string;
  listingText: string;
  budget: string;
  cartTotal: string;
  purchaseStage: string;
  audience: string;
};

const demoForm: FormState = {
  category: "desktop_pc",
  buyerQuestion: "이 RTX 4070 SUPER 특가 오늘 결제해도 될까요?",
  productTitle: "Creator RTX 4070 SUPER Build",
  listingText:
    "Ryzen 7 7800X3D RTX 4070 SUPER RAM 32GB SSD 1TB Windows 11 카드 할인 오늘 마감 / 반품 7일 / 국내 AS",
  budget: "2200000",
  cartTotal: "2185000",
  purchaseStage: "checkout",
  audience: "beginner",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function payloadFromForm(form: FormState): PurchaseQuestionTriageRequest {
  return {
    category: form.category,
    buyer_question: form.buyerQuestion,
    product_title: form.productTitle,
    listing_text: form.listingText,
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    cart_total_krw: parseNumber(form.cartTotal),
    purchase_stage: form.purchaseStage,
    audience: form.audience,
    source: "launch_purchase_question_triage",
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

function questionTypeLabel(value: string) {
  const labels: Record<string, string> = {
    checkout: "결제 전 검수",
    price: "가격 신뢰",
    spec: "사양 이해",
    warranty: "보증/반품",
    aftercare: "수령 후 점검",
  };
  return labels[value] ?? value;
}

export function PurchaseQuestionTriagePanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicPurchaseQuestionTriageKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyTarget, setCopyTarget] = useState<"idle" | "reply" | "community" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function triageQuestion() {
    setStatus("loading");
    setCopyTarget("idle");
    try {
      const response = await fetch("/api/specpilot/purchase-question-triage-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`question triage ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicPurchaseQuestionTriageKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("question triage rejected");
      }
      setKit(payload.kit);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function copyText(text: string | undefined, target: "reply" | "community") {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyTarget(target);
    } catch {
      setCopyTarget("error");
    }
  }

  return (
    <section className="launchPublicSection launchQuestionTriage" id="purchase-question-triage">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <Route size={16} />
            구매 질문 라우팅
          </div>
          <h2>“이거 사도 돼요?”를 다음 검수 단계로 바로 보냅니다.</h2>
          <p>
            자연어 질문, 상품명, 옵션 문구를 붙이면 가격·사양·보증·결제 전 검수 중 어디로
            가야 하는지와 복사용 질문을 즉시 만듭니다.
          </p>
        </div>
        <span className="pill ok">first question</span>
      </div>

      <div className="launchQuestionTriageGrid">
        <article className="launchQuestionTriageForm">
          <div className="launchQuestionTriageControls">
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
                <option value="candidate">후보 검토</option>
                <option value="cart">장바구니</option>
                <option value="checkout">결제 직전</option>
                <option value="after_purchase">수령 후</option>
              </select>
            </label>
          </div>
          <label>
            구매 질문
            <textarea
              value={form.buyerQuestion}
              onChange={(event) => update("buyerQuestion", event.target.value)}
            />
          </label>
          <label>
            제품명
            <input
              value={form.productTitle}
              onChange={(event) => update("productTitle", event.target.value)}
            />
          </label>
          <label>
            상품/옵션 문구
            <textarea
              value={form.listingText}
              onChange={(event) => update("listingText", event.target.value)}
            />
          </label>
          <div className="launchQuestionTriageControls">
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
                value={form.cartTotal}
                onChange={(event) => update("cartTotal", event.target.value)}
              />
            </label>
          </div>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void triageQuestion()}
            disabled={status === "loading" || form.buyerQuestion.trim().length < 2}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <MessageSquareQuote size={18} />}
            질문 라우팅
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              구매 질문을 라우팅하지 못했습니다. 질문과 상품 문구를 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchQuestionTriageResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchQuestionTriageScore">
                <span className={`pill ${tone(kit.triage_status)}`}>{kit.triage_status}</span>
                <strong>{Math.round(kit.urgency_score)}</strong>
                <small>{questionTypeLabel(kit.question_type)}</small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchQuestionTriageNext">
                <Route size={18} />
                <p>{kit.recommended_next_step}</p>
              </div>
              <div className="launchQuestionTriageSignals">
                {kit.triage_signals.slice(0, 5).map((signal) => (
                  <article className={tone(signal.status)} key={signal.signal_id}>
                    <span>
                      {iconFor(signal.status)}
                      {signal.label}
                    </span>
                    <strong>{signal.evidence}</strong>
                    <p>{signal.next_step}</p>
                  </article>
                ))}
              </div>
              <div className="launchQuestionTriageColumns">
                <div>
                  <strong>다음 키트</strong>
                  <ul>
                    {kit.routed_kits.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>누락 입력</strong>
                  <ul>
                    {(kit.missing_inputs.length ? kit.missing_inputs : ["현재 입력 기준 누락 없음"]).map((item) => (
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
                    source: "purchase-question-triage-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.scanner_prefill.budget_krw,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.buyer_reply, "reply")}>
                  <Copy size={16} />
                  {copyTarget === "reply" ? "복사됨" : "답변 복사"}
                </button>
                <button type="button" onClick={() => void copyText(kit.community_post, "community")}>
                  <Copy size={16} />
                  {copyTarget === "community" ? "복사됨" : "커뮤니티 질문"}
                </button>
              </div>
              {copyTarget === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 구매 질문 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill ok">질문부터 시작</span>
              <h3>처음 온 사용자는 분석 폼보다 질문이 먼저입니다.</h3>
              <p>
                질문을 분류해서 가격 검수, 사양 해석, 보증/반품, 결제 전 검수 중 어디부터 볼지
                보여줍니다.
              </p>
              <ul>
                <li>오늘 결제, 특가, 리퍼, FreeDOS 같은 신호를 먼저 잡습니다.</li>
                <li>부족한 입력과 판매자에게 물어볼 질문을 바로 만듭니다.</li>
                <li>답변은 분석 handoff와 커뮤니티 질문문으로 이어집니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
