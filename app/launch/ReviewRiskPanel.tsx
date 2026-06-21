"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  LoaderCircle,
  MessageSquareWarning,
  ShieldAlert,
  Star,
} from "lucide-react";
import type { Category, PublicReviewRiskKit, ReviewRiskRequest } from "../types";
import { LaunchAnalysisLink } from "./LaunchAnalysisLink";

type FormState = {
  category: Category;
  productTitle: string;
  reviewText: string;
  rating: string;
  reviewCount: string;
  budget: string;
  usageContext: string;
};

const demoForm: FormState = {
  category: "laptop",
  productTitle: "CreatorBook Pro 16 RTX 4060",
  reviewText:
    "성능은 만족하지만 게임할 때 발열과 팬 소음이 꽤 있습니다.\n영상 편집 중 온도가 높고 팬이 자주 돕니다. AS 응대는 보통입니다.\n배송은 빨랐지만 화면 빛샘과 초기불량 교환 후기가 보여 걱정됩니다.",
  rating: "4.1",
  reviewCount: "86",
  budget: "2200000",
  usageContext: "portable_creator",
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function snippets(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function payloadFromForm(form: FormState): ReviewRiskRequest {
  return {
    category: form.category,
    product_title: form.productTitle,
    review_snippets: snippets(form.reviewText),
    rating: parseNumber(form.rating),
    review_count: parseNumber(form.reviewCount),
    budget_krw: parseNumber(form.budget) ?? 2_200_000,
    usage_context: form.usageContext,
    source: "launch_review_risk",
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

export function ReviewRiskPanel() {
  const [form, setForm] = useState<FormState>(demoForm);
  const [kit, setKit] = useState<PublicReviewRiskKit | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function scanReviews() {
    setStatus("loading");
    setCopyStatus("idle");
    try {
      const response = await fetch("/api/specpilot/review-risk-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFromForm(form)),
      });
      if (!response.ok) {
        throw new Error(`review risk ${response.status}`);
      }
      const payload = (await response.json()) as {
        ok: boolean;
        kit?: PublicReviewRiskKit;
      };
      if (!payload.ok || !payload.kit) {
        throw new Error("review risk rejected");
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
    <section className="launchPublicSection launchReviewRisk" id="review-risk">
      <div className="sectionHeader">
        <div>
          <div className="sectionLabel">
            <MessageSquareWarning size={16} />
            리뷰 리스크
          </div>
          <h2>후기 원문에서 반복 불만을 구매 리스크로 정리합니다.</h2>
          <p>
            발열, 팬 소음, 초기 불량, 화면/패널, 배터리, AS 후기를 붙여 넣으면
            단정 대신 리스크 신호와 판매자 질문으로 바꿉니다.
          </p>
        </div>
        <span className="pill warn">review evidence</span>
      </div>

      <div className="launchReviewRiskGrid">
        <article className="launchReviewRiskForm">
          <div className="launchReviewRiskControls">
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
              예산
              <input
                inputMode="numeric"
                value={form.budget}
                onChange={(event) => update("budget", event.target.value)}
              />
            </label>
          </div>
          <label>
            제품명
            <input
              value={form.productTitle}
              onChange={(event) => update("productTitle", event.target.value)}
            />
          </label>
          <div className="launchReviewRiskControls">
            <label>
              평점
              <input
                inputMode="decimal"
                value={form.rating}
                onChange={(event) => update("rating", event.target.value)}
              />
            </label>
            <label>
              리뷰 수
              <input
                inputMode="numeric"
                value={form.reviewCount}
                onChange={(event) => update("reviewCount", event.target.value)}
              />
            </label>
          </div>
          <label>
            후기 문구
            <textarea
              value={form.reviewText}
              onChange={(event) => update("reviewText", event.target.value)}
            />
          </label>
          <label>
            사용 맥락
            <input
              value={form.usageContext}
              onChange={(event) => update("usageContext", event.target.value)}
            />
          </label>
          <button
            className="primaryButton"
            type="button"
            onClick={() => void scanReviews()}
            disabled={status === "loading" || snippets(form.reviewText).length === 0}
          >
            {status === "loading" ? <LoaderCircle size={18} /> : <Star size={18} />}
            리뷰 리스크 검수
          </button>
          {status === "error" ? (
            <p className="launchPersonaError">
              리뷰 리스크 키트를 만들지 못했습니다. 후기 문구와 평점을 확인하세요.
            </p>
          ) : null}
        </article>

        <article className="launchReviewRiskResult" aria-live="polite">
          {kit ? (
            <>
              <div className="launchReviewRiskScore">
                <span className={`pill ${tone(kit.review_status)}`}>{kit.review_status}</span>
                <strong>{Math.round(kit.review_risk_score)}</strong>
                <small>
                  {kit.repeated_complaints.length
                    ? `반복 불만 ${kit.repeated_complaints.join(", ")}`
                    : "반복 불만 낮음"}
                </small>
              </div>
              <h3>{kit.headline}</h3>
              <p>{kit.summary}</p>
              <div className="launchReviewRiskSignals">
                {kit.review_signals.slice(0, 6).map((signal) => (
                  <article className={tone(signal.status)} key={signal.signal_id}>
                    <span>
                      {iconFor(signal.status)}
                      {signal.label}
                    </span>
                    <strong>{signal.evidence}</strong>
                    <p>{signal.buyer_impact}</p>
                    <small>{signal.frequency}회 · {signal.next_step}</small>
                  </article>
                ))}
              </div>
              <div className="launchReviewRiskColumns">
                <div>
                  <strong>출처 품질</strong>
                  <ul>
                    {kit.source_quality_notes.slice(0, 4).map((item) => (
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
                <div>
                  <strong>판매자 질문</strong>
                  <ul>
                    {kit.seller_questions.slice(0, 5).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="launchSpecScannerActions">
                <LaunchAnalysisLink
                  className="miniCta"
                  handoff={{
                    source: "review-risk-kit",
                    label: kit.primary_cta_label,
                    query: kit.analysis_prefill,
                    category: kit.category,
                    budget_krw: kit.scanner_prefill.budget_krw,
                    purpose: kit.product_title,
                  }}
                >
                  {kit.primary_cta_label}
                </LaunchAnalysisLink>
                <button type="button" onClick={() => void copyText(kit.share_copy)}>
                  <Copy size={16} />
                  {copyStatus === "copied" ? "복사됨" : "리뷰 리스크 복사"}
                </button>
              </div>
              {copyStatus === "error" ? (
                <p className="launchPersonaError">
                  클립보드 권한이 없어 리뷰 리스크 문구를 복사하지 못했습니다.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <span className="pill warn">후기 원문 검수</span>
              <h3>리뷰는 좋다/나쁘다보다 반복 불만과 내 사용 목적의 충돌이 중요합니다.</h3>
              <p>
                낮은 별점 후기와 반복 키워드를 구매 전 질문과 증거 체크리스트로 바꿉니다.
              </p>
              <ul>
                <li>발열, 팬 소음, 초기 불량, 화면/패널, AS 반복 언급을 분리합니다.</li>
                <li>후기 대표성이 약하면 출처 품질 note로 경고합니다.</li>
                <li>리뷰 리스크는 보증/반품, 결제 전 검수, 분석 handoff로 이어집니다.</li>
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}
